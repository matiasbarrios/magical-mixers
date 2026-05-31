// Constants
const TTL = 5 * 1000;
const CHECK_ONLINE_INTERVAL = 1 * 1000;
const RESUME_CHECK_ONLINE_DELAY = 300;
const RECONNECT_REFETCH_DELAY = 500;


// Internal
export const deviceNew = (data, driver) => {
    const n = {};


    // Private
    n._driver = driver;

    n._nextOnlineListenerId = 1;
    n._onlineListeners = {};

    n._online = true;
    n._halted = false;
    n._connected = false;
    n._ttl = Date.now();
    n._keepAliveInterval = null;
    n._checkOnlineInterval = null;
    n._reconnectRefetchTimer = null;

    n._nextHaltedListenerId = 1;
    n._haltedListeners = {};


    n._onOnlineUpdated = () => {
        Object.values(n._onlineListeners).forEach(c => c(n._online));
    };


    n._onHaltedUpdated = () => {
        Object.values(n._haltedListeners).forEach(c => c(n._halted));
    };


    n._onKeepAlive = () => {
        n._ttl = Date.now();
    };


    n._clearReconnectRefetch = () => {
        if (!n._reconnectRefetchTimer) return;
        clearTimeout(n._reconnectRefetchTimer);
        n._reconnectRefetchTimer = null;
    };


    n._scheduleReconnectRefetch = () => {
        n._clearReconnectRefetch();
        n._reconnectRefetchTimer = setTimeout(async () => {
            n._reconnectRefetchTimer = null;
            if (!n._connected || !n._online || n._halted || !n.features?.cacheRefetch) return;
            if (n.features.sendQueueDrained) await n.features.sendQueueDrained();
            if (!n._connected || !n._online || n._halted) return;
            n.features.cacheRefetch({ purgeFrozen: true });
        }, RECONNECT_REFETCH_DELAY);
    };


    n._checkOnline = () => {
        if (n._halted) return false;

        const isOnline = n._ttl + TTL >= Date.now();
        const changed = n._online !== isOnline;

        // We are connected and there has been a change in the online status
        n._online = isOnline;
        if (n._connected && changed) {
            if (isOnline) {
                // Defer refetch until the link is stable and keepalive traffic has drained.
                n._scheduleReconnectRefetch();
            } else {
                n._clearReconnectRefetch();
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

    n._initData = data;

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


    n.halted = {
        has: (callback) => { callback(n._halted); },
        read: () => n._halted,
        get: (callback) => {
            const key = `l${n._nextHaltedListenerId}`;
            n._nextHaltedListenerId += 1;
            n._haltedListeners[key] = callback;

            callback(n._halted);

            return () => {
                delete n._haltedListeners[key];
            };
        },
    };


    n.halt = async () => {
        if (n._halted) return;

        n._halted = true;
        n._onHaltedUpdated();

        // Stop the keep alive
        if (n._keepAliveInterval) {
            clearInterval(n._keepAliveInterval);
            n._keepAliveInterval = null;
        }
        if (n._checkOnlineInterval) {
            clearInterval(n._checkOnlineInterval);
            n._checkOnlineInterval = null;
        }

        // Halt the driver
        await n._driver.halt();
    };


    n.resume = async () => {
        if (!n._halted) return;

        n._halted = false;
        n._onHaltedUpdated();

        // Resume the driver
        await n._driver.resume();

        // Restore the keep alive
        n._driver.keepAlive();
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

        n._clearReconnectRefetch();

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
        await n._driver.initialize(n._onKeepAlive, n._initData);
        n._initData = { ...n._initData, searchSocket: null };
        n.features = n._driver.features;

        n._keepAliveInterval = setInterval(n._driver.keepAlive, n._driver.keepAliveDelay);
        n._checkOnlineInterval = setInterval(n._checkOnline, CHECK_ONLINE_INTERVAL);

        // definitionDownload(n);
    };


    n.capture = options => n._driver.capture(options);


    return n;
};

