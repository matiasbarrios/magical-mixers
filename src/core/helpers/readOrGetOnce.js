// Read from cache, or subscribe once and unlisten after the first value.
export const readOrGetOnce = (cachedValue, subscribe, onValue) => {
    let done = false;
    let unlisten = null;

    const act = (v) => {
        if (done) return;
        done = true;
        if (unlisten) unlisten();
        onValue(v);
    };

    if (cachedValue !== undefined) act(cachedValue);
    else unlisten = subscribe(act);
};
