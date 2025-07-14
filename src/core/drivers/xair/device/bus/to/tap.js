// Requirements
import { busGet, busOsc } from '../options.js';


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


const prePostOptions = [
    { id: 0, name: 'Pre level' },
    { id: 1, name: 'Post level' },
];


const tapToSecondaryEffectOptions = [
    { id: 0, name: 'Input' },
    { id: 1, name: 'Pre equalizer' },
    { id: 2, name: 'Post equalizer' },
    { id: 3, name: 'Pre level' },
    { id: 4, name: 'Post level' },
    { id: 5, name: 'Same level' },
];


// Internal
const tapOsc = (busIdFrom, busIdTo) => {
    const to = busGet(busIdTo);
    const busToKey = `${to.type}_${to.number}`;
    if (!busToValue[busToKey]) {
        console.error('Unknown tap to', { busIdFrom, busIdTo });
        throw new Error(`Unknown tap to: ${busIdTo}`);
    }
    return `${busOsc(busIdFrom)}/mix/${busToValue[busToKey]}/tap`;
};


const toTapHas = (busIdFrom, busIdTo, callback) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    if (from.type === 'main') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(false);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    } else if (from.type === 'monitor') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(false);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    } else if (from.type === 'secondary') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(false);
        if (to.type === 'secondary') callback(false);
        if (to.type === 'effect') callback(false);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    } else if (from.type === 'effect') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(false);
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    } else if (from.type === 'line') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(false);
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    } else if (from.type === 'channel') {
        if (to.type === 'main') callback(false);
        if (to.type === 'monitor') callback(false);
        if (to.type === 'secondary') callback(true);
        if (to.type === 'effect') callback(true);
        if (to.type === 'line') callback(false);
        if (to.type === 'channel') callback(false);
    }
};


const toTapRead = read => (busIdFrom, busIdTo) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const readToTap = () => read(tapOsc(busIdFrom, busIdTo));

    if (from.type === 'effect') {
        if (to.type === 'secondary') return readToTap();
        if (to.type === 'effect') return readToTap();
    }
    if (from.type === 'line') {
        if (to.type === 'secondary') return readToTap();
        if (to.type === 'effect') return readToTap();
    }
    if (from.type === 'channel') {
        if (to.type === 'secondary') return readToTap();
        if (to.type === 'effect') return readToTap();
    }

    return undefined;
};


const toTapGet = (read, get) => (busIdFrom, busIdTo, callback) => {
    const onGotten = () => callback(toTapRead(read)(busIdFrom, busIdTo));

    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const getToTap = () => get(tapOsc(busIdFrom, busIdTo), onGotten);

    if (from.type === 'effect') {
        if (to.type === 'secondary') return getToTap();
        if (to.type === 'effect') return getToTap();
    }
    if (from.type === 'line') {
        if (to.type === 'secondary') return getToTap();
        if (to.type === 'effect') return getToTap();
    }
    if (from.type === 'channel') {
        if (to.type === 'secondary') return getToTap();
        if (to.type === 'effect') return getToTap();
    }

    return undefined;
};


const toTapSet = set => (busIdFrom, busIdTo, value) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    const setToTap = () => set(tapOsc(busIdFrom, busIdTo), value);

    if (from.type === 'effect') {
        if (to.type === 'secondary') setToTap();
        if (to.type === 'effect') setToTap();
    }
    if (from.type === 'line') {
        if (to.type === 'secondary') setToTap();
        if (to.type === 'effect') setToTap();
    }
    if (from.type === 'channel') {
        if (to.type === 'secondary') setToTap();
        if (to.type === 'effect') setToTap();
    }

    return undefined;
};


const toTapOptions = (busIdFrom, busIdTo) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    if (from.type === 'secondary') {
        if (to.type === 'monitor') return prePostOptions;
    }
    if (from.type === 'effect') {
        if (to.type === 'monitor') return prePostOptions;
        if (to.type === 'secondary') return tapToSecondaryEffectOptions;
        if (to.type === 'effect') return tapToSecondaryEffectOptions;
    }
    if (from.type === 'line') {
        if (to.type === 'monitor') return prePostOptions;
        if (to.type === 'secondary') return tapToSecondaryEffectOptions;
        if (to.type === 'effect') return tapToSecondaryEffectOptions;
    }
    if (from.type === 'channel') {
        if (to.type === 'monitor') return prePostOptions;
        if (to.type === 'secondary') return tapToSecondaryEffectOptions;
        if (to.type === 'effect') return tapToSecondaryEffectOptions;
    }

    return undefined;
};


const toTapDefaultOption = (busIdFrom, busIdTo) => {
    const from = busGet(busIdFrom);
    const to = busGet(busIdTo);

    if (from.type === 'secondary') {
        if (to.type === 'monitor') return prePostOptions[0];
    }
    if (from.type === 'effect') {
        if (to.type === 'monitor') return prePostOptions[0];
        if (to.type === 'secondary') return tapToSecondaryEffectOptions[3];
        if (to.type === 'effect') return tapToSecondaryEffectOptions[3];
    }
    if (from.type === 'line') {
        if (to.type === 'monitor') return prePostOptions[0];
        if (to.type === 'secondary') return tapToSecondaryEffectOptions[3];
        if (to.type === 'effect') return tapToSecondaryEffectOptions[3];
    }
    if (from.type === 'channel') {
        if (to.type === 'monitor') return prePostOptions[0];
        if (to.type === 'secondary') return tapToSecondaryEffectOptions[3];
        if (to.type === 'effect') return tapToSecondaryEffectOptions[3];
    }

    return undefined;
};


// Exported
export { toTapGet };


export const toTapIsInput = (read, busIdFrom, busIdTo) => {
    const to = busGet(busIdTo);
    if (to.type === 'monitor') return false;
    return read(tapOsc(busIdFrom, busIdTo)) === 0;
};


export const toTapIsPreEqualizer = (read, busIdFrom, busIdTo) => {
    const to = busGet(busIdTo);
    if (to.type === 'monitor') return false;
    return read(tapOsc(busIdFrom, busIdTo)) === 1;
};


export const toTapIsPostEqualizer = (read, busIdFrom, busIdTo) => {
    const to = busGet(busIdTo);
    if (to.type === 'monitor') return false;
    return read(tapOsc(busIdFrom, busIdTo)) === 2;
};


export const toTapIsPreLevel = (read, busIdFrom,
    busIdTo) => read(tapOsc(busIdFrom, busIdTo)) === 3;


export const toTapIsPostLevel = (read, busIdFrom,
    busIdTo) => read(tapOsc(busIdFrom, busIdTo)) === 4;


export const toTapIsSameLevel = (read, busIdFrom, busIdTo) => {
    const to = busGet(busIdTo);
    if (to.type === 'monitor') return false;
    return read(tapOsc(busIdFrom, busIdTo)) === 5;
};


export const tap = ({ read, get, set }) => ({
    has: toTapHas,
    read: toTapRead(read),
    get: toTapGet(read, get),
    set: toTapSet(set),
    options: toTapOptions,
    defaultOption: toTapDefaultOption,
});
