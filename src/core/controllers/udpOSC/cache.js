// Constants
const VALUE_TTL_MIN = 30 * 1000;
const VALUE_TTL_MAX = 180 * 1000;

const FETCH_RETRY_DELAY_MIN = 500;
const FETCH_RETRY_DELAY_MAX = 600;
const FETCH_RETRY_ATTEMPTS_MAXIMUM = 2;

const CACHE_MAX_ENTRIES_DEFAULT = 512;

// Ignore inbound GET/fetch values that disagree with a recent local set (desk may lag).
// Covers paced send + background GET round-trip after remount; keep short for multi-operator sync.
const SET_STALE_GRACE_MS = 300;

// keepFresh: paced GET polling when inbound UDP may have been missed. Each tick refetches
// the oldest entries (frozen or not). Outbound reads are paced in udpOSC sendFetch (~5ms apart).
//
// TICK_MS — how often the scheduler runs (CPU scan + starting refetches). Not the OSC spacing.
// MAX_STALENESS_MS — target time to touch every slot at maxEntries (e.g. 512). Lower → more
//   refetches per tick; higher → slower full rotation. With fewer entries, rotation is faster.
//   Paused on app halt; active screens still get live OSC listeners. Not a hard per-key SLA.
const CACHE_KEEP_FRESH_TICK_MS = 10 * 1000;
const CACHE_KEEP_FRESH_MAX_STALENESS_MS = 5 * 60 * 1000;

// Refetches per tick so a full cache rotates within MAX_STALENESS_MS at TICK_MS intervals.
const keepFreshQuotaPerTick = (maxEntries = CACHE_MAX_ENTRIES_DEFAULT, { tickMs = CACHE_KEEP_FRESH_TICK_MS, maxStalenessMs = CACHE_KEEP_FRESH_MAX_STALENESS_MS } = {}) => {
    const ticksInWindow = maxStalenessMs / tickMs;
    if (ticksInWindow <= 0) return maxEntries;
    return Math.ceil(maxEntries / ticksInWindow);
};


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


const cacheNew = ({ maxEntries = CACHE_MAX_ENTRIES_DEFAULT, onEvict } = {}) => {
    const n = {};


    n._cache = {};
    n._keepFreshInterval = null;
    n._keepFreshPaused = false;
    n._maxEntries = maxEntries;
    n._onEvict = onEvict;
    n._keepFreshQuota = keepFreshQuotaPerTick(n._maxEntries);


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


    // howToFetch schedules a paced GET (udpOSC sendFetch). Options:
    //   allowFrozen — keepFresh may refetch entries with no UI hook (still frozen for LRU).
    //   background — do not clear cache; one GET to verify UDP did not miss an update (get() remount).
    n.valueFetch = (key, howToFetch, { allowFrozen = false, background = false } = {}) => {
        const c = n._entryGet(key);
        if (c.trying) return;

        c.howToFetch = howToFetch;
        c.trying = true;
        c.retryTimer = null;
        c.attempts = 0;
        c.stopKeepingFresh = false;

        const fetchWithRetry = () => {
            // Give up after too many failures, or while frozen unless caller opted in (keepFresh).
            if (c.attempts > FETCH_RETRY_ATTEMPTS_MAXIMUM || (c.frozen && !allowFrozen)) {
                retryClear(c);

                if (c.attempts > FETCH_RETRY_ATTEMPTS_MAXIMUM) {
                    c.stopKeepingFresh = true;
                }

                return;
            }

            // Stale-while-revalidate: cached value stays; listener still shows it until desk replies.
            if (background) {
                if (c.attempts > 0) {
                    retryClear(c);
                    return;
                }
                c.howToFetch();
                retryClear(c);
                return;
            }

            // Initial fetch: wait until value arrives (listener valueSet) or retries exhaust.
            if (c.value !== undefined) {
                retryClear(c);
                return;
            }

            // howToFetch returns send delay; message must be sent before we count a retry attempt.
            const sendDelay = c.howToFetch();

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


    n.valueSet = (key, value, { fromSet = false } = {}) => {
        const c = n._entryGet(key);
        c.value = value;
        c.when = Date.now();
        c.refreshIn = ttlGetRandom();
        c.stopKeepingFresh = false;

        if (fromSet) {
            c.setAt = c.when;
            c.setWireValue = value;
        }

        retryClear(c);
    };


    n.valueRejectStaleInbound = (key, inboundWire) => {
        const c = n._cache[key];
        if (!c?.setAt) return false;
        if (Date.now() - c.setAt > SET_STALE_GRACE_MS) {
            delete c.setAt;
            delete c.setWireValue;
            return false;
        }
        return c.setWireValue !== undefined && inboundWire !== c.setWireValue;
    };


    // No React get() callbacks; entry stays for read/cache and keepFresh, eligible for LRU eviction.
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


    // Bulk refresh (scene apply, reconnect): clears values then normal fetch with retry.
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


    // Picks stalest keys (oldest when), up to quota; background fetch does not wipe cache.
    n._keepFreshTick = () => {
        if (n._keepFreshPaused) return;

        const eligible = Object.keys(n._cache)
            .filter((key) => {
                const c = n._cache[key];
                return c.howToFetch && !c.trying && !c.stopKeepingFresh;
            })
            .sort((a, b) => entryAge(n._cache[a]) - entryAge(n._cache[b]));

        // Cap work per tick; stalest first (oldest when / createdAt).
        eligible.slice(0, n._keepFreshQuota).forEach((key) => {
            const c = n._cache[key];
            n.valueFetch(key, c.howToFetch, { allowFrozen: true, background: true });
        });
    };


    n.keepFresh = () => {
        if (n._keepFreshInterval) return;
        n._keepFreshPaused = false;
        n._keepFreshInterval = setInterval(n._keepFreshTick, CACHE_KEEP_FRESH_TICK_MS);
    };


    // Paired with udpOSC halt/resume — no background GETs while inbound OSC is ignored.
    n.pauseKeepFresh = () => {
        n._keepFreshPaused = true;
    };


    n.resumeKeepFresh = () => {
        n._keepFreshPaused = false;
    };


    n.dispose = () => {
        n._keepFreshPaused = true;
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


export { cacheNew };
