// Requirements
import { driversNew } from '../drivers/index.js';
import { isValidIP, isValidPort } from '../helpers/values.js';
import { deviceNew } from './device.js';


// Constants
const TTL = 5 * 1000;
const CONNECT_MANUALLY_MAX_WAIT_TIME = 3 * 1000;


// Exported
export const searchNew = () => {
    const n = {};


    // Variables
    n._searching = false;
    n._manualSearching = false;
    n._manualSearchInFlight = false;
    n._onUpdateListener = null;
    n._devices = {};


    // Internal
    n._publicDeviceData = (data) => {
        const { searchSocket, ...publicData } = data;
        return publicData;
    };


    n._clearDeviceSearchSocket = (key) => {
        const d = n._devices[key];
        if (!d) return;
        d.data = { ...d.data, searchSocket: null };
    };


    n._invalidateSearchSockets = () => {
        Object.keys(n._devices).forEach(n._clearDeviceSearchSocket);
    };


    n._onChange = () => {
        if (!n._onUpdateListener) return;
        // Return a copy always
        n._onUpdateListener(Object.values(n._devices).map(d => n._publicDeviceData(d.data)));
    };


    n._onDisappeared = key => () => {
        delete n._devices[key];
        n._onChange();
    };


    n._onFound = (data, driver) => {
        // Add or update it
        const key = `${data.ip}:${data.port}`;
        if (!n._devices[key]) n._devices[key] = { data };
        const d = n._devices[key];
        d.data = {
            ...data,
            searchSocket: data.searchSocket || d.data.searchSocket,
        };
        d.driver = driver;

        // Keep it alive
        if (d.checkDisappeared) clearTimeout(d.checkDisappeared);
        d.checkDisappeared = setTimeout(n._onDisappeared(key), TTL);

        // Notify the change
        n._onChange();
    };


    n._stopDriver = async () => {
        await n._drivers.searchStop();
        n._invalidateSearchSockets();
    };


    // Exported
    n.onUpdate = (listener) => {
        n._onUpdateListener = listener;
    };


    n.inIPPort = async (ip, port, onFound, onNotFound) => {
        const portNum = Number(port);

        // If a valid IP, trigger the search
        if (!isValidIP(ip) || !isValidPort(portNum)) {
            await onNotFound();
            return;
        }

        if (n._manualSearchInFlight) return;

        const key = `${ip}:${portNum}`;
        delete n._devices[key];
        n._onChange();

        n._manualSearching = true;
        n._manualSearchInFlight = true;

        const finishManualSearch = async () => {
            n._manualSearching = false;
            n._manualSearchInFlight = false;
            await n._stopDriver();
        };

        try {
            await n._drivers.searchInIPPortStart(ip, portNum);

            // Pool for result
            const poolStep = Math.round(CONNECT_MANUALLY_MAX_WAIT_TIME / 10);
            const waitingSince = Date.now();
            await new Promise((resolve) => {
                const checkDeviceFound = async () => {
                    const found = n._devices[key];
                    if (found?.data?.searchSocket?.isLive?.()) {
                        await onFound(n._publicDeviceData(found.data));
                        resolve();
                    } else if (waitingSince + CONNECT_MANUALLY_MAX_WAIT_TIME < Date.now()) {
                        await onNotFound();
                        resolve();
                    } else {
                        setTimeout(checkDeviceFound, poolStep);
                    }
                };
                setTimeout(checkDeviceFound, poolStep);
            });
        } finally {
            await finishManualSearch();
        }
    };


    n.start = async (ip, port) => {
        if (n._searching) return;
        await n._drivers.searchStart(ip, port);
        n._searching = true;
    };


    n.stop = async () => {
        if (!n._searching && !n._manualSearching) return;
        n._searching = false;
        n._manualSearching = false;
        await n._stopDriver();
    };


    n.getFound = async (ip, port) => {
        const d = n._devices[`${ip}:${port}`];
        if (!d) throw new Error('Device not found');

        const device = deviceNew(d.data, d.driver);
        await device.initialize();
        d.data.searchSocket = null;
        return device;
    };


    // Initialize
    n._drivers = driversNew(n._onFound);


    return n;
};
