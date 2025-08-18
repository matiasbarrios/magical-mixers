// Requirements
import { xAirSearchNew } from './xair/search.js';


// Exported
export const driversNew = (onFound) => {
    const n = {};


    // Internal
    n._drivers = [];


    // Exported
    n.searchStart = async (ip, port, debugMode = false) => {
        await Promise.all(n._drivers.map(d => d.searchStart(ip, port, debugMode)));
    };


    n.searchStop = async () => {
        await Promise.all(n._drivers.map(d => d.searchStop()));
    };


    n.searchInIPPortStart = async (ip, port) => {
        await Promise.all(n._drivers.map(d => d.searchInIPPortStart(ip, port)));
    };


    n.searchInIPPortStop = async (ip, port) => {
        await Promise.all(n._drivers.map(d => d.searchInIPPortStop(ip, port)));
    };


    // Initialize
    n._drivers.push(xAirSearchNew(onFound));


    return n;
};
