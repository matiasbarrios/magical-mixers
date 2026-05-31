// Constants
const VALUE_TTL_MIN = 30 * 1000;
const VALUE_TTL_MAX = 180 * 1000;
const VALUE_TTL_CHECK_EVERY = 1 * 1000;

const FETCH_RETRY_DELAY_MIN = 500;
const FETCH_RETRY_DELAY_MAX = 600;
const FETCH_RETRY_ATTEMPTS_MAXIMUM = 2;

const CACHE_MAX_ENTRIES_DEFAULT = 512;


// Internal
const ttlGetRandom = () => Math.floor(Math.random()
    * (VALUE_TTL_MAX - VALUE_TTL_MIN + 1) + VALUE_TTL_MIN);


const fetchRetryDelayRandom = () => Math.floor(Math.random()
    * (FETCH_RETRY_DELAY_MAX - FETCH_RETRY_DELAY_MIN + 1) + FETCH_RETRY_DELAY_MIN);


const retryClear = (c) => {
    if (c.retryTimer) {
        clearTimeout(c.retryTimer);
    }
    c.retryTimer = null;
    c.attempts = 0;
    c.trying = false;
};


const entryAge = c => c.when ?? c.createdAt ?? 0;


// Exported
export const cacheNew = ({ maxEntries = CACHE_MAX_ENTRIES_DEFAULT, onEvict } = {}) => {
    const n = {};


    n._cache = {};
    n._keepFreshInterval = null;
    n._maxEntries = maxEntries;
    n._onEvict = onEvict;


    n._oldestFrozenKey = () => {
        let oldestKey = null;
        let oldestTime = Infinity;
        Object.keys(n._cache).forEach((key) => {
            const c = n._cache[key];
            if (!c.frozen) return;
            const t = entryAge(c);
            if (t < oldestTime) {
                oldestTime = t;
                oldestKey = key;
            }
        });
        return oldestKey;
    };


    n._entryRemove = (key) => {
        const c = n._cache[key];
        if (!c) return;
        retryClear(c);
        delete n._cache[key];
        if (n._onEvict) n._onEvict(key, c);
    };


    n._enforceCap = () => {
        while (Object.keys(n._cache).length >= n._maxEntries) {
            const victim = n._oldestFrozenKey();
            if (!victim) break;
            n._entryRemove(victim);
        }
    };


    n._entryGet = (key) => {
        if (!n._cache[key]) {
            n._enforceCap();
            n._cache[key] = { createdAt: Date.now() };
        }
        return n._cache[key];
    };


    n.entryBindAddress = (key, address) => {
        const c = n._entryGet(key);
        if (!c.oscAddress) c.oscAddress = address;
    };


    n.valueFetch = (key, howToFetch) => {
        const c = n._entryGet(key);
        if (c.trying) return;

        c.howToFetch = howToFetch;
        c.trying = true;
        c.retryTimer = null;
        c.attempts = 0;
        c.stopKeepingFresh = false;

        const fetchWithRetry = () => {
            // If we have the value already, or we are done attempting, or it has been frozen, stop
            if (c.value !== undefined || c.attempts > FETCH_RETRY_ATTEMPTS_MAXIMUM || c.frozen) {
                retryClear(c);

                // If it failed too much, do not keep it fresh automatically
                if (c.attempts > FETCH_RETRY_ATTEMPTS_MAXIMUM) {
                    c.stopKeepingFresh = true;
                }

                return;
            }

            // Trigger the fetching function. The delay returned is the time
            // to wait until the message can be sent
            const sendDelay = c.howToFetch();

            // Set a retry attempt, with some delay randomness plus the send delay
            // We have to wait for the message to be sent before retrying!
            c.retryTimer = setTimeout(() => {
                c.attempts += 1;
                fetchWithRetry();
            }, sendDelay + fetchRetryDelayRandom());
        };

        fetchWithRetry();
    };


    n.valueGet = (key) => {
        const { value } = n._entryGet(key);
        return value;
    };


    n.valueSet = (key, value) => {
        const c = n._entryGet(key);
        c.value = value;
        c.when = Date.now();
        c.refreshIn = ttlGetRandom();
        c.stopKeepingFresh = false;

        retryClear(c);
    };


    n.entryFreeze = (key) => {
        const c = n._cache[key];
        if (!c) return;
        c.frozen = true;
        n._enforceCap();
    };


    n.entryUnfreeze = (key) => {
        const c = n._entryGet(key);
        c.frozen = false;
    };


    n.refetch = ({ activeOnly = true } = {}) => {
        Object.keys(n._cache).forEach((key) => {
            const c = n._cache[key];
            if (activeOnly && c.frozen) return;
            delete c.value;
            delete c.when;
            delete c.refreshIn;
            if (!c.howToFetch) return;
            n.valueFetch(key, c.howToFetch);
        });
    };


    n.purgeFrozen = () => {
        Object.keys(n._cache).forEach((key) => {
            if (!n._cache[key]?.frozen) return;
            n._entryRemove(key);
        });
    };


    n.clearAll = () => {
        Object.keys(n._cache).forEach((key) => {
            const c = n._cache[key];
            retryClear(c);
            delete c.value;
            delete c.when;
            delete c.refreshIn;
        });
    };


    n.keepFresh = () => {
        if (n._keepFreshInterval) return;
        n._keepFreshInterval = setInterval(() => {
            Object.keys(n._cache).forEach((key) => {
                const c = n._cache[key];
                if (c.trying || c.frozen || c.stopKeepingFresh
                    || (c.when && c.refreshIn && c.when + c.refreshIn >= Date.now())) return;
                if (!c.howToFetch) return;
                delete c.value;
                delete c.when;
                delete c.refreshIn;
                n.valueFetch(key, c.howToFetch);
            });
        }, VALUE_TTL_CHECK_EVERY);
    };


    n.dispose = () => {
        if (n._keepFreshInterval) {
            clearInterval(n._keepFreshInterval);
            n._keepFreshInterval = null;
        }
        Object.keys(n._cache).forEach((key) => {
            retryClear(n._cache[key]);
        });
    };


    return n;
};
