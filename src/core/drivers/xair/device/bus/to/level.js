// Requirements
import {
    DB_MAXIMUM, DB_MINIMUM, dbToDecimal, decimalToDb, levelRead, levelGet, levelSet,
} from '../level.js';
import {
    monitorChannelLineEffectTapGet, monitorChannelLineEffectTapIsPostLevel,
    monitorSecondaryTapGet, monitorSecondaryTapIsPostLevel,
} from '../monitor.js';
import { busGet, busOsc } from '../options.js';
import { toTapIsSameLevel, toTapGet } from './tap.js';


// Constants
const busToValue = {
    secondary_1: '01',
    secondary_2: '02',
    secondary_3: '03',
    secondary_4: '04',
    secondary_5: '05',
    secondary_6: '06',
    effect_1: '07',
    effect_2: '08',
    effect_3: '09',
    effect_4: '10',
};


// Internal
const osc = (busIdFrom, busIdTo) => {
    const to = busGet(busIdTo);
    if (to.type === 'main') {
        return `${busOsc(busIdFrom)}/mix/fader`;
    }
    if (['secondary', 'effect'].includes(to.type)) {
        return `${busOsc(busIdFrom)}/mix/${busToValue[`${to.type}_${to.number}`]}/level`;
    }
    return null;
};


const toLevelHas = (read, get) => (busIdFrom, busIdTo, callback) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    let unlistener;

    if (from.type === 'main') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'monitor') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(false);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') {
            unlistener = monitorSecondaryTapGet(get)(busIdTo, () => {
                if (monitorSecondaryTapIsPostLevel(read, busIdTo)) callback(true);
                else callback(false);
            });
        }
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'effect') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') {
            unlistener = monitorChannelLineEffectTapGet(get)(busIdTo, () => {
                if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) callback(true);
                else callback(false);
            });
        }
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'line') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') {
            unlistener = monitorChannelLineEffectTapGet(get)(busIdTo, () => {
                if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) callback(true);
                else callback(false);
            });
        }
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'channel') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') {
            unlistener = monitorChannelLineEffectTapGet(get)(busIdTo, () => {
                if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) callback(true);
                else callback(false);
            });
        }
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }

    return unlistener;
};


const toLevelRead = read => (busIdFrom, busIdTo) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const readFromLevel = () => levelRead(read)(busIdFrom);

    const readToLevel = () => read(osc(busIdFrom, busIdTo));

    const readToSecondaryLevel = () => {
        const tapIsSameLevel = toTapIsSameLevel(read, busIdFrom, busIdTo);
        return tapIsSameLevel ? readFromLevel() : readToLevel();
    };

    if (from.type === 'main') {
        if (to.type === 'monitor') return readFromLevel();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') return readFromLevel();
        if (to.type === 'monitor') {
            if (monitorSecondaryTapIsPostLevel(read, busIdTo)) return readFromLevel();
        }
    }
    if (from.type === 'effect') {
        if (to.type === 'main') return readToLevel();
        if (to.type === 'monitor') {
            if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) return readFromLevel();
        }
        if (to.type === 'secondary') return readToSecondaryLevel();
        if (to.type === 'effect') return readToLevel();
    }
    if (from.type === 'line') {
        if (to.type === 'main') return readToLevel();
        if (to.type === 'monitor') {
            if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) return readFromLevel();
        }
        if (to.type === 'secondary') return readToSecondaryLevel();
        if (to.type === 'effect') return readToLevel();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') return readToLevel();
        if (to.type === 'monitor') {
            if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) return readFromLevel();
        }
        if (to.type === 'secondary') return readToSecondaryLevel();
        if (to.type === 'effect') return readToLevel();
    }

    return undefined;
};


const toLevelGet = (read, get) => (busIdFrom, busIdTo, callback) => {
    const onGotten = () => callback(toLevelRead(read)(busIdFrom, busIdTo));

    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const getFromLevel = () => levelGet(get)(busIdFrom, onGotten);

    const getToLevel = () => get(osc(busIdFrom, busIdTo), onGotten, decimalToDb);

    const getToSecondaryLevel = () => {
        const unlisteners = [];
        unlisteners.push(toTapGet(read, get)(busIdFrom, busIdTo, onGotten));
        unlisteners.push(getFromLevel());
        unlisteners.push(getToLevel());
        return () => { unlisteners.forEach(r => r()); };
    };

    if (from.type === 'main') {
        if (to.type === 'monitor') return getFromLevel();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') return getFromLevel();
        if (to.type === 'monitor') {
            const unlisteners = [];
            unlisteners.push(monitorSecondaryTapGet(get)(busIdTo, onGotten));
            unlisteners.push(getFromLevel());
            return () => { unlisteners.forEach(r => r()); };
        }
    }
    if (from.type === 'effect') {
        if (to.type === 'main') return getToLevel();
        if (to.type === 'monitor') {
            const unlisteners = [];
            unlisteners.push(monitorChannelLineEffectTapGet(get)(busIdTo, onGotten));
            unlisteners.push(getFromLevel());
            return () => { unlisteners.forEach(r => r()); };
        }
        if (to.type === 'secondary') return getToSecondaryLevel();
        if (to.type === 'effect') return getToLevel();
    }
    if (from.type === 'line') {
        if (to.type === 'main') return getToLevel();
        if (to.type === 'monitor') {
            const unlisteners = [];
            unlisteners.push(monitorChannelLineEffectTapGet(get)(busIdTo, onGotten));
            unlisteners.push(getFromLevel());
            return () => { unlisteners.forEach(r => r()); };
        }
        if (to.type === 'secondary') return getToSecondaryLevel();
        if (to.type === 'effect') return getToLevel();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') return getToLevel();
        if (to.type === 'monitor') {
            const unlisteners = [];
            unlisteners.push(monitorChannelLineEffectTapGet(get)(busIdTo, onGotten));
            unlisteners.push(getFromLevel());
            return () => { unlisteners.forEach(r => r()); };
        }
        if (to.type === 'secondary') return getToSecondaryLevel();
        if (to.type === 'effect') return getToLevel();
    }

    return undefined;
};


const toLevelSet = (read, set) => (busIdFrom, busIdTo, value) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const setFromLevel = () => levelSet(set)(busIdFrom, value);

    const setToLevel = () => set(osc(busIdFrom, busIdTo), value, dbToDecimal);

    const setToSecondaryLevel = () => {
        if (toTapIsSameLevel(read, busIdFrom, busIdTo)) setFromLevel();
        else setToLevel();
    };

    if (from.type === 'main') {
        if (to.type === 'monitor') setFromLevel();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') setFromLevel();
        if (to.type === 'monitor') {
            if (monitorSecondaryTapIsPostLevel(read, busIdTo)) setFromLevel();
        }
    }
    if (from.type === 'effect') {
        if (to.type === 'main') setToLevel();
        if (to.type === 'monitor') {
            if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) setFromLevel();
        }
        if (to.type === 'secondary') setToSecondaryLevel();
        if (to.type === 'effect') setToLevel();
    }
    if (from.type === 'line') {
        if (to.type === 'main') setToLevel();
        if (to.type === 'monitor') {
            if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) setFromLevel();
        }
        if (to.type === 'secondary') setToSecondaryLevel();
        if (to.type === 'effect') setToLevel();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') setToLevel();
        if (to.type === 'monitor') {
            if (monitorChannelLineEffectTapIsPostLevel(read, busIdTo)) setFromLevel();
        }
        if (to.type === 'secondary') setToSecondaryLevel();
        if (to.type === 'effect') setToLevel();
    }
};


// Exported
export {
    toLevelHas,
    toLevelGet,
};


export const level = ({ read, get, set }) => ({
    has: toLevelHas(read, get),
    read: toLevelRead(read),
    get: toLevelGet(read, get),
    set: toLevelSet(read, set),
    minimum: DB_MINIMUM,
    maximum: DB_MAXIMUM,
});
