// Requirements
import { Buffer } from 'buffer';
import { scaleLinear } from 'd3';
import { oscFromBuffer, oscToBuffer } from '../../core/index.js';
import { addressesValues } from './adressesValues.js';


// Constants
const deviceName = 'X18-DEMO';

const deviceModel = 'X18';

const deviceFirmware = '1.18';

const listeningIpDefault = '127.0.0.1';

const listeningPortDefault = 10024;

const subscriptionInterval = 200;

const keepAliveTimeout = 10 * 1000;

const knownAddresses = ['/-snap/save', '/-snap/load'];

const floodingMaxMessages = 2;

const floodingTimeWindow = 1000;

const subscriptionLengths = {
    '/meters/0': (8 * 2) + 4,
    '/meters/1': (40 * 2) + 4,
    '/meters/2': (36 * 2) + 4,
    '/meters/3': (56 * 2) + 4,
    '/meters/4': (100 * 2) + 4,
    '/meters/5': (44 * 2) + 4,
    '/meters/6': (39 * 2) + 4,
    '/meters/7': (16 * 2) + 4,
    '/meters/8': (4 * 2) + 4,
};


// Variables
let provider = null;

let socketId = null;

let unlistenMessageReceived = null;

let listeningAddress = null;

let metersValues = {};

const metersValuesSubscriptions = {};

let subscriptions = {};

let changeListeners = {};

const dbScale = scaleLinear()
    .domain([-1, 1])
    .range([-90, 0]);

const createRadioVolumeSimulator = ({
    smoothness = 0.9,
    volatility = 0.1,
} = {}) => {
    // Thanks GPT o4 for this one

    // State lives in here:
    let x = 0; // Current noise state ∈ [-1,1]

    return function getDb() {
        // White noise “kick”
        const w = (Math.random() * 2 - 1) * volatility;

        // AR(1): mix yesterday with today’s kick
        x = smoothness * x + w;

        // Clamp
        x = Math.max(-1, Math.min(1, x));

        return dbScale(x);
    };
};

const flood = {};


// Internal
const floodingCheck = (address) => {
    // Initialize
    if (!flood[address]) flood[address] = [];

    // Remove expired ones
    const now = Date.now();
    flood[address] = flood[address]
        .filter(t => now - t < floodingTimeWindow);

    // Add new one
    flood[address].push(Date.now());

    // Check if we have too many
    if (flood[address].length > floodingMaxMessages) {
        console.warn(`${address} ${flood[address].length} times / ${floodingTimeWindow} ms`);
    }
};


const initializeSimulatedWave = (meterAddress) => {
    if (!subscriptionLengths[meterAddress]) {
        throw new Error(`No subscription length for ${meterAddress}`);
    }

    const length = subscriptionLengths[meterAddress];

    const simulators = Array(length).fill(0).map(() => createRadioVolumeSimulator({
        smoothness: 0.85, // More inertia
        volatility: 0.55, // Bigger jumps
    }));
    const r = { values: simulators.map(s => s()) };
    r.interval = setInterval(() => {
        r.values = simulators.map(s => s());
    }, subscriptionInterval);
    return r;
};


const busesInGroupAddresses = (groupAddress, groupNumber) => {
    // Search through addressesValues for the buses assigned to this mg
    let busesAddresses = Object.keys(addressesValues).filter(a => a.endsWith(groupAddress));
    busesAddresses = busesAddresses.filter((a) => {
        // Get the binary value of addressesValues[a]
        const binaryValue = addressesValues[a].toString(2).padStart(4, '0');
        return binaryValue.charAt(4 - groupNumber) === '1';
    });
    return busesAddresses;
};


const doWrite = (
    oscAddress, args, ip, port, force = false
) => {
    // Save the value in our object
    addressesValues[oscAddress] = args[0].value;

    // Notify the subscribers
    Object.keys(changeListeners).forEach((sIp) => {
        Object.keys(changeListeners[sIp]).forEach((sPort) => {
            const nSPort = parseInt(sPort, 10);
            if (!force && sIp === ip && nSPort === port) return; // Dont notify the editor
            provider.udpMessageSend(socketId, sIp, nSPort, oscToBuffer({
                address: oscAddress,
                args,
            }));
        });
    });
};


const processOSCMessage = (buffer, ip, port) => {
    try {
        const decodedMessage = oscFromBuffer(buffer);
        const { address: oscAddress, args } = decodedMessage;

        floodingCheck(oscAddress);

        if (oscAddress === '/status') {
            provider.udpMessageSend(socketId, ip, port, oscToBuffer({
                address: '/status',
                args: ['active', listeningAddress, deviceName],
            }));
            return;
        }

        if (oscAddress === '/xremotenfb') {
            if (!changeListeners[ip]) changeListeners[ip] = {};
            if (!changeListeners[ip][port]) {
                changeListeners[ip][port] = {};
            } else {
                clearTimeout(changeListeners[ip][port].expiration);
            }
            changeListeners[ip][port].expiration = setTimeout(() => {
                delete changeListeners[ip][port];
            }, keepAliveTimeout);
            return;
        }

        if (oscAddress === '/meters' || oscAddress === '/batchsubscribe' || oscAddress === '/renew') {
            if (!args?.length) {
                console.log('No meters address provided');
                return;
            }

            let meterAddress = null;
            if (oscAddress === '/meters') {
                meterAddress = args[0].value;
            } else if (['/batchsubscribe', '/renew'].includes(oscAddress)) {
                meterAddress = `/${args[0].value}`;
            }

            // Get the address and the id
            const subscriptionId = `${ip}:${port}:${meterAddress}`;

            // Register the randomization interval for the values of the address
            if (!metersValues[meterAddress]) {
                try {
                    metersValues[meterAddress] = initializeSimulatedWave(meterAddress);
                } catch (error) {
                    console.log(error);
                    return;
                }
            }
            // Keep track of subscriptions per address
            if (!metersValuesSubscriptions[meterAddress]) {
                metersValuesSubscriptions[meterAddress] = {};
            }
            metersValuesSubscriptions[meterAddress][subscriptionId] = true;

            // Register the notifier for the ip, port and address
            if (!subscriptions[subscriptionId]) {
                subscriptions[subscriptionId] = {
                    interval: setInterval(() => {
                        provider.udpMessageSend(socketId, ip, port, oscToBuffer({
                            address: meterAddress,
                            args: Buffer.from(metersValues[meterAddress].values),
                        }));
                    }, subscriptionInterval),
                };
            } else {
                clearTimeout(subscriptions[subscriptionId].expiration);
            }
            subscriptions[subscriptionId].expiration = setTimeout(() => {
                if (!subscriptions[subscriptionId]) return;
                if (subscriptions[subscriptionId].interval) {
                    clearInterval(subscriptions[subscriptionId].interval);
                }
                delete subscriptions[subscriptionId];
            }, keepAliveTimeout);

            return;
        }

        if (oscAddress === '/unsubscribe') {
            if (!args?.length) return;

            // Get the address and the id
            const meterAddress = args[0].value;
            const subscriptionId = `${ip}:${port}:${meterAddress}`;

            // Unsubscribe
            if (subscriptions[subscriptionId]) {
                clearTimeout(subscriptions[subscriptionId].expiration);
                clearInterval(subscriptions[subscriptionId].interval);
                delete subscriptions[subscriptionId];
            }

            // Unsubscribe from the address
            if (metersValuesSubscriptions
                && metersValuesSubscriptions[meterAddress]
                && metersValuesSubscriptions[meterAddress][subscriptionId]) {
                delete metersValuesSubscriptions[meterAddress][subscriptionId];
            }
            // Time to dispose the address if there are no subscriptions
            if (metersValuesSubscriptions
                && metersValuesSubscriptions[meterAddress]
                && typeof metersValuesSubscriptions[meterAddress] === 'object'
                && !Object.keys(metersValuesSubscriptions[meterAddress]).length) {
                clearInterval(metersValues[meterAddress].interval);
                delete metersValues[meterAddress];
            }

            return;
        }

        // It's not a meter, not a subscription

        // Is it a command?
        if (oscAddress === '/-snap/delete') {
            const sceneId = args[0].value || 0;
            provider.udpMessageSend(socketId, ip, port, oscToBuffer({
                address: `/-snap/${sceneId.toString().padStart(2, '0')}/name`,
                args: '',
            }));
            return;
        }

        if (oscAddress.startsWith('/config/mute/') && args?.length) {
            const mgNumber = oscAddress.split('/').pop();
            doWrite(oscAddress, args, ip, port);
            args[0].value = args[0].value === 1 ? 0 : 1;
            busesInGroupAddresses('/grp/mute', mgNumber).forEach((a) => {
                doWrite(
                    a.replace('/grp/mute', '/mix/on'), args, ip, port, true
                );
            });
            return;
        }

        if (oscAddress.startsWith('/dca/') && oscAddress.endsWith('/on') && args?.length) {
            const dcaNumber = oscAddress.replace('/dca/', '').replace('/on', '');
            doWrite(oscAddress, args, ip, port);
            busesInGroupAddresses('/grp/dca', dcaNumber).forEach((a) => {
                doWrite(
                    a.replace('/grp/dca', '/mix/on'), args, ip, port, true
                );
            });
            return;
        }

        if (oscAddress.startsWith('/dca/') && oscAddress.endsWith('/fader') && args?.length) {
            const dcaNumber = oscAddress.replace('/dca/', '').replace('/fader', '');
            doWrite(oscAddress, args, ip, port);
            busesInGroupAddresses('/grp/dca', dcaNumber).forEach((a) => {
                doWrite(
                    a.replace('/grp/dca', '/mix/fader'), args, ip, port, true
                );
            });
            return;
        }

        // No more commands
        // Do we have a value for this address?
        if (!oscAddress || addressesValues[oscAddress] === undefined) {
            if (!knownAddresses.includes(oscAddress)) {
                console.log('OSC message with no value:', oscAddress, args);
            }
            // Let's send an empty value anyway
            provider.udpMessageSend(socketId, ip, port, oscToBuffer({
                address: oscAddress,
                args: 0,
            }));
            return;
        }

        // Is it read only?
        if (!args || !args.length) {
            provider.udpMessageSend(socketId, ip, port, oscToBuffer({
                address: oscAddress,
                args: addressesValues[oscAddress],
            }));
            return;
        }

        // Is it a set? Set it
        doWrite(oscAddress, args, ip, port);
    } catch (err) {
        console.error('Error processing OSC message:', err);
    }
};


// Exported
export const x18Run = async ({ ip, port, platform }) => {
    provider = platform;
    const listeningIp = ip || listeningIpDefault;
    const listeningPort = port || listeningPortDefault;
    if (!listeningIp) {
        console.error('No listening address found');
        return;
    }

    addressesValues['/xinfo'] = [listeningIp, deviceName, deviceModel, deviceFirmware];

    socketId = await provider.udpSocketOpen(listeningIp, listeningPort);
    console.log('Listening on', listeningIp, listeningPort);
    unlistenMessageReceived = provider.onUDPMessageReceived((buffer, ipReceived, portReceived) => {
        processOSCMessage(buffer, ipReceived, portReceived);
    }, socketId);
};


export const x18Stop = async () => {
    console.log('Bye bye...');
    if (unlistenMessageReceived) unlistenMessageReceived();
    Object.values(metersValues).forEach((m) => {
        clearInterval(m.interval);
    });
    metersValues = {};
    Object.values(changeListeners).forEach((c1) => {
        Object.values(c1).forEach((c2) => {
            clearTimeout(c2.expiration);
        });
    });
    changeListeners = {};
    Object.values(subscriptions).forEach((s) => {
        if (s.expiration) clearTimeout(s.expiration);
        if (s.interval) clearInterval(s.interval);
    });
    subscriptions = {};
    await provider.udpSocketClose(socketId);
    provider = null;
    listeningAddress = null;
    socketId = null;
};
