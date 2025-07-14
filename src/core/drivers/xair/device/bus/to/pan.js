// Requirements
import { decimalToHundredRange, hundredRangeToDecimal } from '../../../../../helpers/values.js';
import { busGet, busOsc } from '../options.js';
import { busIsStereoLinked, stereoLinkGet, stereoLinkRead } from '../stereoLink.js';
import { panRead, panGet, panSet } from '../pan.js';
import { ONE } from '../../../shared.js';
import {
    monitorChannelLineEffectTapGet, monitorChannelLineEffectTapIsPostLevel,
    monitorSecondaryTapGet, monitorSecondaryTapIsPostLevel,
} from '../monitor.js';


// Constants
const MINIMUM = -100;

const MAXIMUM = 100;

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
const hundredRangeToDecimalXair = v => hundredRangeToDecimal(v) * ONE;


const osc = (busIdFrom, busIdTo) => {
    const to = busGet(busIdTo);
    return `${busOsc(busIdFrom)}/mix/${busToValue[`${to.type}_${to.number}`]}/pan`;
};


const toPanHas = (read, get) => (busIdFrom, busIdTo, callback) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    let unlistener;

    const secondaryIsStereoLinked = () => stereoLinkGet(get)(busIdTo, () => {
        callback(busIsStereoLinked(read, busIdTo));
    });

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
        if (to.type === 'secondary') unlistener = secondaryIsStereoLinked();
        if (to.type === 'effect') callback(false);
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
        if (to.type === 'secondary') unlistener = secondaryIsStereoLinked();
        if (to.type === 'effect') callback(false);
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
        if (to.type === 'secondary') unlistener = secondaryIsStereoLinked();
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }

    return unlistener;
};


const toPanRead = read => (busIdFrom, busIdTo) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const readFromPan = () => panRead(read)(busIdFrom);

    const readToSecondaryStereoLinked = () => {
        if (!busIsStereoLinked(read, busIdTo) || to.number % 2 === 1) {
            return read(osc(busIdFrom, busIdTo));
        }
        if (busIdTo < 1) return undefined; // Should not happen though
        return read(osc(busIdFrom, busIdTo - 1));
    };

    if (from.type === 'main') {
        if (to.type === 'monitor') return readFromPan();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') return readFromPan();
        if (to.type === 'monitor') return readFromPan();
    }
    if (from.type === 'effect') {
        if (to.type === 'main') return readFromPan();
        if (to.type === 'monitor') return readFromPan();
        if (to.type === 'secondary') return readToSecondaryStereoLinked();
    }
    if (from.type === 'line') {
        if (to.type === 'main') return readFromPan();
        if (to.type === 'monitor') return readFromPan();
        if (to.type === 'secondary') return readToSecondaryStereoLinked();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') return readFromPan();
        if (to.type === 'monitor') return readFromPan();
        if (to.type === 'secondary') return readToSecondaryStereoLinked();
    }

    return undefined;
};


const toPanGet = (read, get) => (busIdFrom, busIdTo, callback) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const onGotten = () => callback(toPanRead(read)(busIdFrom, busIdTo));

    const getFromPan = () => panGet(get)(busIdFrom, onGotten);

    const getToSecondaryStereoLinked = () => {
        const toRemove = [];
        toRemove.push(stereoLinkGet(get)(busIdTo, onGotten));
        toRemove.push(get(osc(busIdFrom, busIdTo), onGotten, decimalToHundredRange));
        if (to.number % 2 === 0 && busIdTo > 0) {
            toRemove.push(get(osc(busIdFrom, busIdTo - 1), onGotten, decimalToHundredRange));
        }
        return () => { toRemove.forEach(r => r()); };
    };

    if (from.type === 'main') {
        if (to.type === 'monitor') return getFromPan();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') return getFromPan();
        if (to.type === 'monitor') return getFromPan();
    }
    if (from.type === 'effect') {
        if (to.type === 'main') return getFromPan();
        if (to.type === 'monitor') return getFromPan();
        if (to.type === 'secondary') return getToSecondaryStereoLinked();
    }
    if (from.type === 'line') {
        if (to.type === 'main') return getFromPan();
        if (to.type === 'monitor') return getFromPan();
        if (to.type === 'secondary') return getToSecondaryStereoLinked();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') return getFromPan();
        if (to.type === 'monitor') return getFromPan();
        if (to.type === 'secondary') return getToSecondaryStereoLinked();
    }

    return undefined;
};


const toPanSet = (read, set) => (busIdFrom, busIdTo, value) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const setFromPan = () => panSet(set)(busIdFrom, value);

    const setToSecondaryStereoLinked = () => {
        const stereoLinked = stereoLinkRead(read)(busIdTo);
        if (!stereoLinked || to.number % 2 === 1) {
            set(osc(busIdFrom, busIdTo), value, hundredRangeToDecimalXair);
        } else if (busIdTo > 0) {
            set(osc(busIdFrom, busIdTo - 1), value, hundredRangeToDecimalXair);
        }
    };

    if (from.type === 'main') {
        if (to.type === 'monitor') setFromPan();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') setFromPan();
        if (to.type === 'monitor') setFromPan();
    }
    if (from.type === 'effect') {
        if (to.type === 'main') setFromPan();
        if (to.type === 'monitor') setFromPan();
        if (to.type === 'secondary') setToSecondaryStereoLinked();
    }
    if (from.type === 'line') {
        if (to.type === 'main') setFromPan();
        if (to.type === 'monitor') setFromPan();
        if (to.type === 'secondary') setToSecondaryStereoLinked();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') setFromPan();
        if (to.type === 'monitor') setFromPan();
        if (to.type === 'secondary') setToSecondaryStereoLinked();
    }
};


// Exported
export {
    MINIMUM as toPanMinimum,
    MAXIMUM as toPanMaximum,
    toPanHas,
    toPanGet,
};


export const pan = ({ read, get, set }) => ({
    has: toPanHas(read, get),
    read: toPanRead(read),
    get: toPanGet(read, get),
    set: toPanSet(read, set),
    minimum: MINIMUM,
    maximum: MAXIMUM,
    defaultValue: 0,
});
