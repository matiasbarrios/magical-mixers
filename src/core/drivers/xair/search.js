// Requirements
import { udpOSCSearchNew } from '../../controllers/udpOSC/index.js';
import { getLANBroadcastAddress } from '../../helpers/lan.js';
import { xAirDeviceNew } from './device/index.js';
import { modelBrand, modelIsSupported } from './model.js';


// Constants
const PORT = 10024;

const DEVICES_SEARCH_INTERVAL = 2 * 1000;


// Exported
export const xAirSearchNew = (onFound) => {
    const n = {};

    // Internal
    n._searchInterval = null;


    n._xAirOnDeviceFound = (ip, port, ...values) => {
        // Only process messages with expected number of parameters
        // This avoids processing our own broadcast messages
        if (values?.length !== 4) return;

        const [, name, model, firmware] = values;

        // Only process our model
        if (!modelIsSupported(model)) return;

        const brand = modelBrand(model);

        const data = {
            deviceId: `${brand}_${model}_${firmware}`,
            ip,
            port,
            name: name || `${brand} ${model}`,
            model,
            brand,
            firmware,
        };

        onFound(data, xAirDeviceNew(data));
    };


    n._searchIntervalClear = () => {
        if (!n._searchInterval) return;
        clearInterval(n._searchInterval);
        n._searchInterval = null;
    };


    // Exported
    n.searchStart = async (ip, port) => {
        // If already searching, stop , just in case
        await n.searchStop();

        // For each interface
        n._udpOSCForSearching = [];
        let nextI = 0;
        const setBroadcast = async (ipFinal, portFinal) => {
            // Create
            n._udpOSCForSearching[nextI] = udpOSCSearchNew(ipFinal, portFinal);
            // Open
            await n._udpOSCForSearching[nextI].open();
            // Listen for results
            n._udpOSCForSearching[nextI].addListener('/xinfo', n._xAirOnDeviceFound);
            nextI += 1;
        };

        // Depending on the parameters, what we set
        if (ip) {
            await setBroadcast(ip, port || PORT);
        } else {
            const broadcastAddress = getLANBroadcastAddress();
            if (typeof broadcastAddress === 'string') {
                await setBroadcast(broadcastAddress, port || PORT);
            } else if (Array.isArray(broadcastAddress)) {
                const doIt = async (i = 0) => {
                    if (i === broadcastAddress.length) return;
                    await setBroadcast(broadcastAddress[i], port || PORT);
                    await doIt(i + 1);
                };
                await doIt();
            }
        }

        // Start by sending message, do it periodically
        const broadcast = () => {
            n._udpOSCForSearching.forEach(e => e.send('/xinfo'));
        };
        broadcast();
        n._searchInterval = setInterval(broadcast, DEVICES_SEARCH_INTERVAL);
    };


    n.searchStop = async () => {
        if (!n._udpOSCForSearching) return;

        const doIt = async (i = 0) => {
            if (i === n._udpOSCForSearching.length) return;
            await n._udpOSCForSearching[i].close();
            await doIt(i + 1);
        };
        await doIt();

        if (!n._searchInterval) return;
        n._searchIntervalClear();
    };


    n.searchInIPPortStart = async (ip, port) => {
        await n.searchStart(ip, port);
    };


    n.searchInIPPortStop = async () => {
        await n.searchStop();
    };


    return n;
};
