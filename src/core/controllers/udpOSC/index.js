// Requirements
import { getLocalAddressForIP, getLANInterfaces } from '../../helpers/lan.js';
import { cacheNew } from './cache.js';
import { oscMessageSend, oscMessageReceived } from './osc.js';
import { sendQueueNew } from './sendQueue.js';
import {
    udpSetProvider, udpSocketOpen, udpSocketRetarget, udpSocketClose, udpMessageSend,
} from './udp.js';


// Constants
const DELAY_BETWEEN_MESSAGES = 5; // milliseconds for device not to choke


// Internal
const randomInt = maximum => Math.floor(Math.random() * maximum);


const getCallbackKey = (e) => {
    const random = `r${randomInt(1000000)}`;
    if (e === undefined || !e.callbacks || !e.callbacks[random]) return random;
    return getCallbackKey(e);
};


const getBindAddressCandidates = (bindAddress, targetIp) => {
    const candidates = new Set();
    if (bindAddress) candidates.add(bindAddress);
    const inferred = getLocalAddressForIP(targetIp);
    if (inferred) candidates.add(inferred);
    getLANInterfaces()?.forEach(({ localAddress }) => {
        if (localAddress && localAddress !== '127.0.0.1') candidates.add(localAddress);
    });
    return [...candidates];
};


const openBoundSocket = async (onMessageReceived, bindAddress, targetIp, enableBroadcast = false) => {
    const candidates = getBindAddressCandidates(bindAddress, targetIp);

    const tryCandidate = async (index) => {
        if (index >= candidates.length) {
            throw new Error(`Unable to bind UDP socket for ${targetIp || bindAddress || 'LAN'}`);
        }
        try {
            return await udpSocketOpen(onMessageReceived, candidates[index], enableBroadcast);
        } catch (error) {
            return tryCandidate(index + 1);
        }
    };

    return tryCandidate(0);
};


// Exported
export const udpOSCSetProvider = udpSetProvider;


export const udpOSCControllerNew = (ip, port, bindAddress) => {
    const n = {};


    // Variables
    n._ip = ip;
    n._port = port;
    n._bindAddress = bindAddress;
    n._socket = null;
    n._listeners = {};
    n._subscriptions = {};
    n._halted = false;
    n._doCapture = false;
    n._capturedValues = {};
    n._sendQueue = sendQueueNew(DELAY_BETWEEN_MESSAGES);
    n._fetchSendNext = 0;


    // Internal
    n._messageReceived = (message) => {
        if (n._halted) return;

        const { address, values } = message;

        if (n._doCapture) n._capturedValues[address] = values?.length ? values[0] : null;

        if (n._listeners[address]) {
            let v = values?.length ? values[0] : null;
            // First, pass it through the listener
            v = n._listeners[address].listener(v);
            // Then call the callbacks
            Object.values(n._listeners[address].callbacks).forEach(c => c(v));
        }

        const s = n._subscriptions[address];
        if (s) {
            const v = s.processMessage(values[0] || []);
            Object.values(s.callbacks).forEach(c => c(v));
        }
    };


    n._onUDPMessageReceived = (buffer) => {
        oscMessageReceived(buffer, n._messageReceived);
    };


    n._stopSubscriptions = () => {
        Object.values(n._subscriptions).forEach((listener) => {
            if (listener.renewalInterval) {
                clearInterval(listener.renewalInterval);
                listener.renewalInterval = null;
            }
            if (n._socket && listener.unsubscribe) {
                n.send(listener.unsubscribe.address, ...listener.unsubscribe.args);
            }
        });
        n._subscriptions = {};
    };


    n._canSend = () => !!n._socket && !n._halted;

    n._doSend = (address, ...args) => {
        const udpSend = buffer => udpMessageSend(n._socket.socketId, n._ip, n._port, buffer);
        oscMessageSend(udpSend, address, ...args);
    };

    n._teardown = () => {
        n._stopSubscriptions();
        n._listeners = {};
        n._cache.dispose();
        n._fetchSendNext = 0;
        n._sendQueue.dispose();
    };


    n._removeListenerIfIdle = (address) => {
        const listener = n._listeners[address];
        if (!listener || Object.keys(listener.callbacks).length > 0) return;
        delete n._listeners[address];
    };


    // Exported
    n.addListener = (address, onGotten, listener, cacheKey) => {
        if (!n._listeners[address]) {
            n._listeners[address] = {
                callbacks: {},
            };
        }
        // For every address there is only one listener
        // to process the message
        n._listeners[address].listener = listener || (v => v);

        // But we will have many callbacks, calculate the key
        const key = getCallbackKey(n._listeners[address]);
        n._listeners[address].callbacks[key] = onGotten;

        return () => {
            // We may remove the callbacks, but once set, the listeners
            // are not removed. This is because all from "get" write in the caché
            // And we need to keep those values up to date
            delete n._listeners[address].callbacks[key];
            // If no more callbacks for the address, we can freeze the cache
            if (Object.keys(n._listeners[address].callbacks).length === 0) {
                n._cache.entryFreeze(cacheKey || address);
            }
        };
    };


    n.open = async () => {
        if (n._socket) return;
        n._socket = await openBoundSocket(n._onUDPMessageReceived, n._bindAddress, n._ip, false);
    };


    n.adoptSocket = async (socketWrapper) => {
        if (n._socket) return;
        n._socket = await udpSocketRetarget(socketWrapper, n._onUDPMessageReceived);
    };


    n.close = async () => {
        if (!n._socket) {
            n._teardown();
            return;
        }
        const socketIdToClose = n._socket.socketId;
        n._stopSubscriptions();
        await n._sendQueue.drained();
        n._listeners = {};
        n._cache.dispose();
        n._fetchSendNext = 0;
        n._sendQueue.dispose();
        await udpSocketClose(socketIdToClose);
        n._socket = null;
    };


    n.send = (address, ...args) => (
        n._sendQueue.enqueue(n._canSend, n._doSend, address, ...args)
    );


    // Paced like pre-queue send(): schedules all fetches up front so reads can be in flight together.
    n.sendFetch = (address, ...args) => {
        if (!n._canSend()) return undefined;

        const now = Date.now();
        if (n._fetchSendNext < now) n._fetchSendNext = now;
        n._fetchSendNext += DELAY_BETWEEN_MESSAGES;
        const delay = n._fetchSendNext - now;

        setTimeout(() => {
            if (!n._canSend()) return;
            n._doSend(address, ...args);
        }, delay);

        return delay;
    };


    // Bypass the paced queue (session keepalive, etc.). Drivers choose when to use this.
    n.sendImmediate = (address, ...args) => {
        if (!n._canSend()) return undefined;
        n._doSend(address, ...args);
        return 0;
    };


    n.read = (address, cacheKey) => {
        if (!address) return undefined;
        return n._cache.valueGet(cacheKey || address);
    };


    n.get = (address, onGotten, translateValue, cacheKey) => {
        if (!n._socket || !address) return () => {};
        const ck = cacheKey || address;

        // Set the osc udp message listener
        const listener = (value) => {
            const v = (translateValue !== undefined) ? translateValue(value) : value;
            n._cache.valueSet(ck, v);
            return v;
        };
        const listenerRemoval = n.addListener(address, onGotten, listener, cacheKey);

        n._cache.entryBindAddress(ck, address);
        // Get from caché if available, or fetch it
        n._cache.entryUnfreeze(ck);
        const value = n._cache.valueGet(ck);
        if (value !== undefined) {
            onGotten(value);
        } else {
            n._cache.valueFetch(ck, (...args) => n.sendFetch(address, ...args));
        }

        // Return the unlistener
        return listenerRemoval;
    };


    n.set = (
        address, value, translateValue, omitCache, cacheKey
    ) => {
        if (!n._socket || !address) return;

        const wireValue = (translateValue !== undefined) ? translateValue(value) : value;

        // Pace outbound sets like get/fetch — immediate send bursts choke the desk
        n.send(address, wireValue);

        // Cache always stores domain values (same unit as read/get callbacks).
        if (!omitCache) {
            n._cache.valueSet(cacheKey || address, value);
        }

        // Optimistic update: notify subscribers with domain value, not wire format.
        if (n._listeners[address]) {
            Object.values(n._listeners[address].callbacks).forEach(c => c(value));
        }
    };


    n.sendQueueDrained = () => n._sendQueue.drained();


    n.subscribe = (subscription, onValueGotten, translateValue) => {
        const {
            address, args, addressToListenTo,
            onResponse, unsubscribe, renewal,
        } = subscription;

        // How to process the subscription value on gotten
        const translate = (translateValue !== undefined) ? translateValue : (v => v);
        const valueGet = v => onValueGotten(translate(v));

        // Calculate the callback key
        const key = getCallbackKey(n._subscriptions[addressToListenTo]);

        // Get or set the listener
        let listener = n._subscriptions[addressToListenTo];
        if (!listener) {
            const subscriptionMessage = () => n.send(address, ...args);
            listener = {
                args,
                subscriptionMessage,
                renewal,
                processMessage: onResponse,
                unsubscribe,
                callbacks: { [key]: valueGet },
                renewalInterval: setInterval(subscriptionMessage, renewal),
            };
            n._subscriptions[addressToListenTo] = listener;
            subscriptionMessage(); // Trigger the subscription
        } else if (!listener.callbacks[key]) {
            // Get and set the callback for the value
            listener.callbacks[key] = valueGet;
            // There was already a listener, so the address to listen to is the same,
            // But if arg one is different, the other subscription should have been cancelled
            if (listener.args?.length > 1 && args?.length > 1 && listener.args[1] !== args[1]) {
                console.error('The address to listen to of the subscription is the same, but the first argument is different', {
                    subscribed: listener.args[1],
                    new: args[1],
                });
            }
        }

        // Return how to unsubscribe and unlisten
        return () => {
            // This should be called when there are no more listeners to a value of a subscription
            delete listener.callbacks[key];

            // If there are no more listeners to the subscription, unsubscribe
            if (Object.keys(listener.callbacks).length) return;
            clearInterval(listener.renewalInterval);
            listener.renewalInterval = null;
            n.send(unsubscribe.address, ...unsubscribe.args);
            delete n._subscriptions[addressToListenTo];
        };
    };


    n.halt = async () => {
        n._halted = true;
        Object.values(n._subscriptions).forEach((l) => {
            if (!l.renewalInterval) return;
            clearInterval(l.renewalInterval);
            l.renewalInterval = null;
        });
        n._sendQueue.dispose();
    };


    n.resume = async () => {
        n._halted = false;
        if (!n._socket) await n.open();
        Object.values(n._subscriptions).forEach((l) => {
            if (l.renewalInterval) return;
            l.subscriptionMessage();
            l.renewalInterval = setInterval(l.subscriptionMessage, l.renewal);
        });
    };


    n.cacheRefetch = (options) => {
        if (options?.purgeFrozen) n._cache.purgeFrozen();
        n._cache.refetch(options);
    };


    n.cacheClear = () => {
        n._cache.clearAll();
    };


    n.capture = (options) => {
        if (options?.start) {
            n._capturedValues = {};
            n._doCapture = true;
        } else if (options?.stop) {
            n._doCapture = false;
        }
        return n._capturedValues;
    };


    // Initialize
    n._cache = cacheNew({
        onEvict: (_key, entry) => {
            n._removeListenerIfIdle(entry.oscAddress || _key);
        },
    });
    n._cache.keepFresh();


    return n;
};


export const udpOSCSearchNew = (ip, port, bindAddress) => {
    const n = {};

    // Variables
    n._ip = ip;
    n._port = port;
    n._bindAddress = bindAddress;
    n._socket = null;
    n._adopted = false;
    n._broadcastListener = {};


    // Internal
    n._messageReceived = (ipFrom, portFrom) => (message) => {
        if (!n._broadcastListener[message.address]) return;
        n._broadcastListener[message.address](ipFrom, portFrom, ...message.values);
    };


    n._onUDPMessageReceived = (buffer, ipFrom, portFrom) => {
        oscMessageReceived(buffer, n._messageReceived(ipFrom, portFrom));
    };


    // Exported
    n.addListener = (address, callback) => {
        n._broadcastListener[address] = callback;
    };


    n.open = async () => {
        if (n._socket) return;
        n._socket = await openBoundSocket(n._onUDPMessageReceived, n._bindAddress, n._ip, true);
    };


    n.detachSocket = async () => {
        if (!n._socket) return null;
        n._adopted = true;
        const socket = n._socket;
        n._socket = null;
        if (socket.unlistenMessageReceived) {
            await socket.unlistenMessageReceived();
        }
        return socket;
    };


    n.isLive = () => !!n._socket && !n._adopted;


    n.close = async () => {
        if (n._adopted || !n._socket) return;
        if (n._socket.unlistenMessageReceived) {
            await n._socket.unlistenMessageReceived();
        }
        await udpSocketClose(n._socket.socketId);
        n._socket = null;
    };


    n.send = (address, ...args) => {
        if (!n._socket) return;
        oscMessageSend(buffer => udpMessageSend(n
            ._socket.socketId, n._ip, n._port, buffer), address, ...args);
    };


    return n;
};
