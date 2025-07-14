// Constants
const VALUE_TTL_MIN = 30 * 1000;
const VALUE_TTL_MAX = 180 * 1000;
const VALUE_TTL_CHECK_EVERY = 1 * 1000;

const FETCH_RETRY_DELAY_MIN = 500;
const FETCH_RETRY_DELAY_MAX = 600;
const FETCH_RETRY_ATTEMPTS_MAXIMUM = 2;


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


// Exported
export const cacheNew = () => {
    const n = {};


    n._cache = {};


    n._entryGet = (key) => {
        if (!n._cache[key]) n._cache[key] = {};
        return n._cache[key];
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
        const c = n._entryGet(key);
        c.frozen = true;
    };


    n.entryUnfreeze = (key) => {
        const c = n._entryGet(key);
        c.frozen = false;
    };


    n.refetch = () => {
        Object.keys(n._cache).forEach((key) => {
            const c = n._cache[key];
            delete c.value;
            delete c.when;
            delete c.refreshIn;
            if (!c.howToFetch) return;
            n.valueFetch(key, c.howToFetch);
        });
    };


    n.clearAll = () => {
        Object.keys(n._cache).forEach((key) => {
            const c = n._cache[key];
            delete c.value;
            delete c.when;
            delete c.refreshIn;
        });
    };


    n.keepFresh = () => {
        setInterval(() => {
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


    return n;
};
