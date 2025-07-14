// Requirements
import { udpOSCControllerNew } from '../../../controllers/udpOSC/index.js';
import { bus } from './bus/index.js';
import { configuration } from './configuration/index.js';
import { fx } from './fx/index.js';
import { input } from './input/index.js';
import { output } from './output/index.js';
import { scene } from './scene/index.js';
import { automix } from './automix/index.js';
import { dca } from './dca/index.js';
import { mg } from './mg/index.js';


// Constants
const DEVICE_KEEP_ALIVE_DELAY = 2 * 1000; // Has to be lees than 10 seconds for xremote to work


// Exported
export const xAirDeviceNew = (data) => {
    const n = {};

    n._keepAliveListenerRemove = null;


    n.connect = async () => {
        n._udpOSC.send('/xremotenfb');
    };


    n.halt = async () => {
        await n._udpOSC.halt();
    };


    n.resume = async () => {
        await n._udpOSC.resume();
        n._udpOSC.send('/xremotenfb');
        n._udpOSC.send('/status');
    };


    n.keepAlive = () => {
        // Required by the driver to keep receiving updates, but no feedback from our settings
        n._udpOSC.send('/xremotenfb');
        // Let's send this for pinging the device because we know we get an immediate answer
        n._udpOSC.send('/status');
    };


    n.keepAliveDelay = DEVICE_KEEP_ALIVE_DELAY;


    n.disconnect = async () => {};


    n.dispose = async () => {
        if (n._keepAliveListenerRemove) {
            n._keepAliveListenerRemove();
        }
        await n._udpOSC.close(); // We always need it for keeping it alive
    };


    // Initialize
    n.initialize = async (onKeepAlive) => {
        const { ip, port, model } = data;

        // Controller stuff
        n._udpOSC = udpOSCControllerNew(ip, port);
        await n._udpOSC.open();
        n._keepAliveListenerRemove = n._udpOSC.addListener('/status', onKeepAlive);
        const {
            cacheRefetch, cacheClear, read, get, set, subscribe,
        } = n._udpOSC;

        // Features
        n.features = {
            cacheRefetch,
            cacheClear,
            automix: automix({ read, get, set }),
            bus: bus({
                read, get, set, subscribe, model,
            }),
            configuration: configuration({ read, get, set }),
            dca: dca({
                read, get, set, subscribe,
            }),
            fx: fx({ read, get, set }),
            input: input({
                read, get, set, subscribe, model,
            }),
            mg: mg({ read, get, set }),
            output: output({
                read, get, set, subscribe, model,
            }),
            scene: scene({ read, get, set }),
        };
    };


    n.capture = options => n._udpOSC.capture(options);


    return n;
};
