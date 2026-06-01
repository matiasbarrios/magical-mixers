// Requirements
import { getLANInterfaces } from '../../helpers/lan.js';
import { udpOSCSearchNew } from '../../controllers/udpOSC/index.js';
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
    n._manualTarget = null;


    n._makeOnDeviceFound = (localAddress, searchSocket) => (ip, port, ...values) => {
        // Only process messages with expected number of parameters
        // This avoids processing our own broadcast messages
        if (values?.length !== 4) return;

        const [, name, model, firmware] = values;

        // Only process our model
        if (!modelIsSupported(model)) return;

        if (n._manualTarget) {
            const targetPort = n._manualTarget.port || PORT;
            if (ip !== n._manualTarget.ip || Number(port) !== Number(targetPort)) return;
        }

        const brand = modelBrand(model);

        const data = {
            deviceId: `${name}_${brand}_${model}`,
            ip,
            port,
            localAddress,
            searchSocket,
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
        const addSearchSocket = async (destAddress, portFinal, localAddress) => {
            const searchSocket = udpOSCSearchNew(destAddress, portFinal, localAddress);
            n._udpOSCForSearching[nextI] = searchSocket;
            await searchSocket.open();
            searchSocket.addListener('/xinfo', n._makeOnDeviceFound(localAddress, searchSocket));
            nextI += 1;
        };

        const interfaces = getLANInterfaces();
        if (Array.isArray(interfaces)) {
            const doIt = async (i = 0) => {
                if (i === interfaces.length) return;
                const { broadcastAddress, localAddress } = interfaces[i];
                await addSearchSocket(broadcastAddress, port || PORT, localAddress);
                await doIt(i + 1);
            };
            await doIt();
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

        n._manualTarget = null;

        if (!n._searchInterval) return;
        n._searchIntervalClear();
    };


    n.searchInIPPortStart = async (ip, port) => {
        n._manualTarget = { ip, port: Number(port) || PORT };
        await n.searchStart(null, port);
    };


    n.searchInIPPortStop = async () => {
        await n.searchStop();
    };


    return n;
};
