// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../../helpers/values.js';
import { busGet, busOsc } from '../options.js';
import { toTapIsSameLevel, toTapGet } from './tap.js';


// Constants
const monitorValue = {
    channel_1: '01',
    channel_2: '02',
    channel_3: '03',
    channel_4: '04',
    channel_5: '05',
    channel_6: '06',
    channel_7: '07',
    channel_8: '08',
    channel_9: '09',
    channel_10: 10,
    channel_11: 11,
    channel_12: 12,
    channel_13: 13,
    channel_14: 14,
    channel_15: 15,
    channel_16: 16,

    'line_17/18': 17,

    effect_return_1: 18,
    effect_return_2: 19,
    effect_return_3: 20,
    effect_return_4: 21,

    // Guessing...
    usb_1: 22,
    usb_2: 23,
    usb_3: 24,
    usb_4: 25,
    usb_5: 26,
    usb_6: 27,
    usb_7: 28,
    usb_8: 29,
    usb_9: 30,
    usb_10: 31,
    usb_11: 32,
    usb_12: 33,
    usb_13: 34,
    usb_14: 35,
    usb_15: 36,
    usb_16: 37,
    usb_17: 38,
    usb_18: 39,

    secondary_1: 40,
    secondary_2: 41,
    secondary_3: 42,
    secondary_4: 43,
    secondary_5: 44,
    secondary_6: 45,

    effect_1: 46,
    effect_2: 47,
    effect_3: 48,
    effect_4: 49,

    main_: 50,

    // Finally, we won't use them here
    // dca_1: 51,
    // dca_2: 52,
    // dca_3: 53,
    // dca_4: 54,
};


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
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    if (to.type === 'main') {
        return `${busOsc(busIdFrom)}/mix/lr`;
    }
    if (to.type === 'monitor') {
        return `/-stat/solosw/${monitorValue[`${from.type}_${from.number}`]}`;
    }
    return null;
};


const groupOnOsc = (busIdFrom, busIdTo) => {
    const to = busGet(busIdTo);
    return `${busOsc(busIdFrom)}/mix/${busToValue[`${to.type}_${to.number}`]}/grpon`;
};


const onHas = (read, get) => (busIdFrom, busIdTo, callback) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    let unlistener;

    const tapIsSameLevel = () => toTapGet(read, get)(busIdFrom, busIdTo, () => {
        callback(toTapIsSameLevel(read, busIdFrom, busIdTo));
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
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'effect') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') unlistener = tapIsSameLevel();
        if (to.type === 'effect') unlistener = tapIsSameLevel();
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'line') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') unlistener = tapIsSameLevel();
        if (to.type === 'effect') unlistener = tapIsSameLevel();
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
    if (from.type === 'channel') {
        if (to.type === 'main') callback(true);
        if (to.type === 'monitor') callback(true);
        if (to.type === 'secondary') unlistener = tapIsSameLevel();
        if (to.type === 'effect') unlistener = tapIsSameLevel();
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }

    return unlistener;
};


const onRead = read => (busIdFrom, busIdTo) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const readToOn = () => read(osc(busIdFrom, busIdTo));

    const readToSecondaryEffectOn = () => (toTapIsSameLevel(read, busIdFrom, busIdTo)
        ? read(groupOnOsc(busIdFrom, busIdTo)) : false);

    if (from.type === 'main') {
        if (to.type === 'monitor') return readToOn();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') return readToOn();
        if (to.type === 'monitor') return readToOn();
    }
    if (from.type === 'effect') {
        if (to.type === 'main') return readToOn();
        if (to.type === 'monitor') return readToOn();
        if (to.type === 'secondary') return readToSecondaryEffectOn();
        if (to.type === 'effect') return readToSecondaryEffectOn();
    }
    if (from.type === 'line') {
        if (to.type === 'main') return readToOn();
        if (to.type === 'monitor') return readToOn();
        if (to.type === 'secondary') return readToSecondaryEffectOn();
        if (to.type === 'effect') return readToSecondaryEffectOn();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') return readToOn();
        if (to.type === 'monitor') return readToOn();
        if (to.type === 'secondary') return readToSecondaryEffectOn();
        if (to.type === 'effect') return readToSecondaryEffectOn();
    }

    return undefined;
};


const onGet = (read, get) => (busIdFrom, busIdTo, callback) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const onGotten = () => callback(onRead(read)(busIdFrom, busIdTo));

    const getToOn = () => get(osc(busIdFrom, busIdTo), onGotten, binaryToBoolean);

    const getToSecondaryEffectOn = () => {
        const toRemove = [];
        toRemove.push(toTapGet(read, get)(busIdFrom, busIdTo, onGotten));
        toRemove.push(get(groupOnOsc(busIdFrom, busIdTo), onGotten, binaryToBoolean));
        return () => { toRemove.forEach(r => r()); };
    };

    if (from.type === 'main') {
        if (to.type === 'monitor') return getToOn();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') return getToOn();
        if (to.type === 'monitor') return getToOn();
    }
    if (from.type === 'effect') {
        if (to.type === 'main') return getToOn();
        if (to.type === 'monitor') return getToOn();
        if (to.type === 'secondary') return getToSecondaryEffectOn();
        if (to.type === 'effect') return getToSecondaryEffectOn();
    }
    if (from.type === 'line') {
        if (to.type === 'main') return getToOn();
        if (to.type === 'monitor') return getToOn();
        if (to.type === 'secondary') return getToSecondaryEffectOn();
        if (to.type === 'effect') return getToSecondaryEffectOn();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') return getToOn();
        if (to.type === 'monitor') return getToOn();
        if (to.type === 'secondary') return getToSecondaryEffectOn();
        if (to.type === 'effect') return getToSecondaryEffectOn();
    }

    return undefined;
};


const onSet = (read, set) => (busIdFrom, busIdTo, value) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const setToOn = () => set(osc(busIdFrom, busIdTo), value, booleanToBinary);

    const setToSecondaryEffectOn = () => {
        if (!toTapIsSameLevel(read, busIdFrom, busIdTo)) return;
        set(groupOnOsc(busIdFrom, busIdTo), value, booleanToBinary);
    };

    if (from.type === 'main') {
        if (to.type === 'monitor') setToOn();
    }
    if (from.type === 'secondary') {
        if (to.type === 'main') setToOn();
        if (to.type === 'monitor') setToOn();
    }
    if (from.type === 'effect') {
        if (to.type === 'main') setToOn();
        if (to.type === 'monitor') setToOn();
        if (to.type === 'secondary') setToSecondaryEffectOn();
        if (to.type === 'effect') setToSecondaryEffectOn();
    }
    if (from.type === 'line') {
        if (to.type === 'main') setToOn();
        if (to.type === 'monitor') setToOn();
        if (to.type === 'secondary') setToSecondaryEffectOn();
        if (to.type === 'effect') setToSecondaryEffectOn();
    }
    if (from.type === 'channel') {
        if (to.type === 'main') setToOn();
        if (to.type === 'monitor') setToOn();
        if (to.type === 'secondary') setToSecondaryEffectOn();
        if (to.type === 'effect') setToSecondaryEffectOn();
    }
};


// Exported
export const on = ({ read, get, set }) => ({
    has: onHas(read, get),
    read: onRead(read),
    get: onGet(read, get),
    set: onSet(read, set),
});
