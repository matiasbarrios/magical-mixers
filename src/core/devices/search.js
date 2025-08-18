// Requirements
import { driversNew } from '../drivers/index.js';
import { isValidIP, isValidPort } from '../helpers/values.js';
import { deviceNew } from './device.js';


// Constants
const TTL = 5 * 1000;
const CONNECT_MANUALLY_MAX_WAIT_TIME = 500;


// Exported
export const searchNew = () => {
    const n = {};


    // Variables
    n._searching = false;
    n._onUpdateListener = null;
    n._devices = {};


    // Internal
    n._onChange = () => {
        if (!n._onUpdateListener) return;
        // Return a copy always
        n._onUpdateListener(Object.values(n._devices).map(d => ({ ...d.data })));
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
        d.data = data;
        d.driver = driver;

        // Keep it alive
        if (d.checkDisappeared) clearTimeout(d.checkDisappeared);
        d.checkDisappeared = setTimeout(n._onDisappeared(key), TTL);

        // Notify the change
        n._onChange();
    };


    // Exported
    n.onUpdate = (listener) => {
        n._onUpdateListener = listener;
    };


    n.inIPPort = async (ip, port, onFound, onNotFound) => {
        // If a valid IP, trigger the search
        if (!isValidIP(ip) || !isValidPort(port)) {
            await onNotFound();
            return;
        }
        await n._drivers.searchInIPPortStart(ip, port);

        // Pool for result
        const poolStep = Math.round(CONNECT_MANUALLY_MAX_WAIT_TIME / 10);
        const waitingSince = Date.now();
        const checkDeviceFound = async () => {
            const found = n._devices[`${ip}:${port}`];
            if (found) {
                await onFound({ ...found.data });
            } else if (waitingSince + CONNECT_MANUALLY_MAX_WAIT_TIME < Date.now()) {
                await onNotFound();
                await n._drivers.searchInIPPortStop(ip, port);
            } else {
                setTimeout(checkDeviceFound, poolStep);
            }
        };
        setTimeout(checkDeviceFound, poolStep);
    };


    n.start = async (ip, port, debugMode = false) => {
        if (n._searching) return;
        await n._drivers.searchStart(ip, port, debugMode);
        n._searching = true;
    };


    n.stop = async () => {
        if (!n._searching) return;
        await n._drivers.searchStop();
        n._searching = false;
    };


    n.getFound = async (ip, port) => {
        const d = n._devices[`${ip}:${port}`];
        if (!d) throw new Error('Device not found');
        const device = deviceNew(d.data, d.driver);
        await device.initialize();
        return device;
    };


    // Initialize
    n._drivers = driversNew(n._onFound);


    return n;
};
