// Requirements
import { cacheNew } from './cache.js';
import { oscMessageSend, oscMessageReceived } from './osc.js';
import {
    udpSetProvider, udpSocketOpen, udpSocketClose, udpMessageSend,
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


// Exported
export const udpOSCSetProvider = udpSetProvider;


export const udpOSCControllerNew = (ip, port) => {
    const n = {};


    // Variables
    n._ip = ip;
    n._port = port;
    n._socket = null;
    n._listeners = {};
    n._subscriptions = {};
    n._sendNext = 0;
    n._doCapture = false;
    n._capturedValues = {};


    // Internal
    n._messageReceived = (message) => {
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
        n._socket = await udpSocketOpen(n._onUDPMessageReceived);
    };


    n.close = async () => {
        if (!n._socket) return;
        const socketIdToClose = n._socket.socketId;
        await udpSocketClose(socketIdToClose);
        n._socket = null;
        n._sendNext = 0;
    };


    n.send = (address, ...args) => {
        if (!n._socket) return undefined;

        // Let's calculate a general delay for not choking the device
        const now = Date.now();
        if (n._sendNext < now) n._sendNext = now;
        n._sendNext += DELAY_BETWEEN_MESSAGES;
        const delay = n._sendNext - now;

        // Schedule it!
        setTimeout(() => {
            if (!n._socket) return;
            const udpSend = buffer => udpMessageSend(n._socket.socketId, n._ip, n._port, buffer);
            oscMessageSend(udpSend, address, ...args);
        }, delay);

        return delay;
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

        // Get from caché if available, or fetch it
        n._cache.entryUnfreeze(ck);
        const value = n._cache.valueGet(ck);
        if (value !== undefined) {
            onGotten(value);
        } else {
            n._cache.valueFetch(ck, (...args) => n.send(address, ...args));
        }

        // Return the unlistener
        return listenerRemoval;
    };


    n.set = (
        address, value, translateValue, omitCache, cacheKey
    ) => {
        if (!n._socket || !address) return;

        // Just send the message
        // If we are sending too many, the device will drop them naturally
        // But otherwise, it affects the user experience, being animations less smooth
        const v = (translateValue !== undefined) ? translateValue(value) : value;

        oscMessageSend((buffer) => {
            udpMessageSend(n._socket.socketId, n._ip, n._port, buffer);
        }, address, v);

        // Save the new value in the caché
        if (!omitCache) {
            n._cache.valueSet(cacheKey || address, v);
        }

        // Trigger the listeners too, faking the osc message
        n._messageReceived({ address, values: [v] });
    };


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
        Object.values(n._subscriptions).forEach((l) => {
            if (!l.renewalInterval) return;
            clearInterval(l.renewalInterval);
            l.renewalInterval = null;
        });
        await n.close();
    };


    n.resume = async () => {
        await n.open();
        Object.values(n._subscriptions).forEach((l) => {
            if (l.renewalInterval) return;
            l.subscriptionMessage();
            l.renewalInterval = setInterval(l.subscriptionMessage, l.renewal);
        });
    };


    n.cacheRefetch = () => {
        n._cache.refetch();
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
    n._cache = cacheNew();
    n._cache.keepFresh();


    return n;
};


export const udpOSCSearchNew = (ip, port) => {
    const n = {};

    // Variables
    n._ip = ip;
    n._port = port;
    n._socket = null;
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
        n._socket = await udpSocketOpen(n._onUDPMessageReceived);
    };


    n.close = async () => {
        if (!n._socket) return;
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
