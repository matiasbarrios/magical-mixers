// Constants
const TTL = 5 * 1000;
const CHECK_ONLINE_INTERVAL = 1 * 1000;
const RESUME_CHECK_ONLINE_DELAY = 300;


// Internal
export const deviceNew = (data, driver) => {
    const n = {};


    // Private
    n._driver = driver;

    n._nextOnlineListenerId = 1;
    n._onlineListeners = {};

    n._online = true;
    n._connected = false;
    n._ttl = Date.now();
    n._keepAliveInterval = null;
    n._checkOnlineInterval = null;


    n._onOnlineUpdated = () => {
        Object.values(n._onlineListeners).forEach(c => c(n._online));
    };


    n._onKeepAlive = () => {
        n._ttl = Date.now();
    };


    n._checkOnline = () => {
        let changed = false;
        const isOnline = n._ttl + TTL >= Date.now();
        changed = n._online !== isOnline;

        // We are connected and there has been a change in the online status
        n._online = isOnline;
        if (n._connected && changed) {
            // If back online, we could have dirty data
            if (isOnline) {
                n.features.cacheRefetch();
            }
        }

        if (changed) {
            n._onOnlineUpdated();
        }

        return changed;
    };


    // Public
    n.deviceId = data.deviceId;
    n.ip = data.ip;
    n.port = data.port;
    n.name = data.name;
    n.model = data.model;
    n.brand = data.brand;
    n.firmware = data.firmware;

    n.features = null;


    n.connect = async () => {
        n._connected = true;
        await n._driver.connect();
    };


    // Imitate features structure
    n.online = {
        has: (callback) => { callback(true); },
        read: () => n._online,
        get: (callback) => {
            // Register the listener
            const key = `l${n._nextOnlineListenerId}`;
            n._nextOnlineListenerId += 1;
            n._onlineListeners[key] = callback;

            // Call with what we have
            callback(n._online);

            // How to unlisten
            return () => {
                delete n._onlineListeners[key];
            };
        },
    };


    n.halt = async () => {
        // Stop the keep alive
        if (n._keepAliveInterval) {
            clearInterval(n._keepAliveInterval);
            n._keepAliveInterval = null;
        }
        if (n._checkOnlineInterval) {
            clearInterval(n._checkOnlineInterval);
            n._checkOnlineInterval = null;
        }
        n._ttl = 0;

        // Halt the driver
        await n._driver.halt();

        // Trigger the update online status
        n._checkOnline();
    };


    n.resume = async () => {
        // Resume the driver
        await n._driver.resume();

        // Restore the keep alive
        n._keepAliveInterval = setInterval(n._driver.keepAlive, n._driver.keepAliveDelay);
        n._checkOnlineInterval = setInterval(n._checkOnline, CHECK_ONLINE_INTERVAL);

        // Trigger the update online status, give some milliseconds to get the answer
        setTimeout(n._checkOnline, RESUME_CHECK_ONLINE_DELAY);
    };


    n.disconnect = async () => {
        if (!n._connected) return;
        await n._driver.disconnect();
        n._connected = false;
        n.features.cacheClear();
    };


    n.dispose = async () => {
        // Disconnect if so
        await n.disconnect();

        // Clear the intervals
        if (n._keepAliveInterval) {
            clearInterval(n._keepAliveInterval);
            n._keepAliveInterval = null;
        }
        if (n._checkOnlineInterval) {
            clearInterval(n._checkOnlineInterval);
            n._checkOnlineInterval = null;
        }

        // The driver
        await n._driver.dispose();
    };


    n.initialize = async () => {
        await driver.initialize(n._onKeepAlive);
        n.features = n._driver.features;

        n._keepAliveInterval = setInterval(n._driver.keepAlive, n._driver.keepAliveDelay);
        n._checkOnlineInterval = setInterval(n._checkOnline, CHECK_ONLINE_INTERVAL);

        // definitionDownload(n);
    };


    n.capture = options => n._driver.capture(options);


    return n;
};

