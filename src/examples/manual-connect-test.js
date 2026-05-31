// Requirements
import { searchNew } from '../core/devices/search.js';
import { getLANInterfaces, getLocalAddressForIP } from '../core/helpers/lan.js';


// Constants — edit default target desk here
const MANUAL_CONNECT_TEST_TARGET = {
    ip: '192.168.1.21',
    port: 10024,
};

const SESSION_PROBE_MS = 5 * 1000;
const LOG_PREFIX = '[connectivity-test]';


// Internal
const log = (...args) => {
    console.log(LOG_PREFIX, ...args);
};

const logError = (...args) => {
    console.error(LOG_PREFIX, ...args);
};

const wait = ms => new Promise((resolve) => { setTimeout(resolve, ms); });

const logNetworkContext = (ip, platformLabel) => {
    log('platform', platformLabel);
    log('target', `${ip}:${MANUAL_CONNECT_TEST_TARGET.port}`);
    log('getLocalAddressForIP', getLocalAddressForIP(ip));
    log('getLANInterfaces', getLANInterfaces());
};


/**
 * Manual-connect probe through mixers only (no GUI).
 *
 * Caller must call initialize() first so helpers/lan.js and
 * controllers/udpOSC/udp.js use the supplied platform primitives.
 *
 * Mirrors connect screen: search.inIPPort → getFound → connect.
 */
const runManualConnectTest = async ({
    ip = MANUAL_CONNECT_TEST_TARGET.ip,
    port = MANUAL_CONNECT_TEST_TARGET.port,
    platformLabel = 'node',
    keepSessionOpen = false,
} = {}) => {
    log('=== manual connect test start ===');

    logNetworkContext(ip, platformLabel);

    const search = searchNew();
    let device = null;

    const onFound = async (data) => {
        log('inIPPort onFound', data);

        try {
            device = await search.getFound(data.ip, data.port);
            log('getFound + initialize OK', {
                deviceId: device.deviceId,
                ip: device.ip,
                port: device.port,
                model: device.model,
            });

            await device.connect();
            log('device.connect OK — sent /xremotenfb');

            await wait(SESSION_PROBE_MS);

            const online = device.online.read();
            if (online) {
                log('session probe OK — desk responded (/status keepalive)');
            } else {
                logError('session probe FAILED — no keepalive within TTL');
            }
        } catch (error) {
            logError('connect pipeline error', error?.message || error);
            throw error;
        }
    };

    const onNotFound = async () => {
        logError('inIPPort onNotFound — no live searchSocket within timeout');
    };

    try {
        await search.inIPPort(ip, port, onFound, onNotFound);
    } finally {
        if (device && !keepSessionOpen) {
            await device.dispose();
            log('device disposed');
        } else if (device) {
            log('session left open — dispose manually if needed');
        }

        log('=== manual connect test end ===');
    }
};


export { runManualConnectTest, MANUAL_CONNECT_TEST_TARGET };
