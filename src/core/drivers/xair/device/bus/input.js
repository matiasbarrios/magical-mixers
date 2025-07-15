// Requirements
import { scaleLinear } from 'd3-scale';
import { booleanToBinary } from '../../../../helpers/values.js';
import { ONE, xAirSubscriptionBuild } from '../../shared.js';
import {
    inputGet, inputIdDefaultForBus, inputIdToXAirId, inputOptionsForBus,
    xAirIdToInputId,
} from '../input/options.js';
import { modelIs18 } from '../../model.js';
import { panAndLevelApply } from '../../../../helpers/panLevel.js';
import { busGet, busIsOfType, busOsc } from './options.js';


// Constants
const TRIM_MINIMUM = -18;

const TRIM_MAXIMUM = 18;


// Internal
const osc = busId => `${busOsc(busId)}/`;


const inputHas = (model, busId) => {
    if (modelIs18(model)) return busIsOfType(busId, 'channel', 'line', 'effect');
    return busIsOfType(busId, 'channel');
};


const idHas = model => (busId, c) => { c(inputHas(model, busId)); };


const idRead = (model, read) => (busId) => {
    const bus = busGet(busId);

    if (modelIs18(model)) {
        const usbEnabled = read(`${osc(busId)}preamp/rtnsw`);
        if (usbEnabled) return read(`${osc(busId)}config/rtnsrc`);
    }

    if (bus.type === 'channel') return read(`${osc(busId)}config/insrc`);

    // In 18, if usb not enabled, there are no options, just default one
    if (modelIs18(model)) {
        if (['line', 'effect'].includes(bus.type)) return inputIdDefaultForBus(model, busId);
    }

    return undefined;
};


const idGet = (model, read, get) => (busId, callback) => {
    const bus = busGet(busId);

    const onGotten = () => {
        const v = idRead(model, read)(busId);
        // If undefined, it means it hasn't been determined yet.
        if (v !== undefined) callback(v);
    };

    const xAirIdToId = isUsb => xAirIdToInputId(model, busId, isUsb);

    const toRemove = [];
    if (modelIs18(model)) {
        toRemove.push(get(`${osc(busId)}preamp/rtnsw`, onGotten));
        toRemove.push(get(`${osc(busId)}config/rtnsrc`, onGotten, xAirIdToId(true)));
    }
    if (bus.type === 'channel') {
        toRemove.push(get(`${osc(busId)}config/insrc`, onGotten, xAirIdToId(modelIs18(model) ? false : undefined)));
    }

    return () => { toRemove.forEach(r => r()); };
};


const idSet = (model, set) => (busId, id) => {
    const bus = busGet(busId);
    const idToXAirId = inputIdToXAirId(model, busId);
    const mIs18 = modelIs18(model);

    if (mIs18 && bus.type === 'effect') {
        if (id === inputIdDefaultForBus(model, busId)) {
            set(`${osc(busId)}preamp/rtnsw`, false, booleanToBinary);
        } else {
            set(`${osc(busId)}preamp/rtnsw`, true, booleanToBinary);
            set(`${osc(busId)}config/rtnsrc`, id, idToXAirId);
        }
    } else if (mIs18 && bus.type === 'line') {
        if (id === inputIdDefaultForBus(model, busId)) {
            set(`${osc(busId)}preamp/rtnsw`, false, booleanToBinary);
        } else {
            set(`${osc(busId)}preamp/rtnsw`, true, booleanToBinary);
            set(`${osc(busId)}config/rtnsrc`, id, idToXAirId);
        }
    } else if (bus.type === 'channel') {
        if (mIs18) {
            if (inputGet(id).type === 'usb') {
                set(`${osc(busId)}preamp/rtnsw`, true, booleanToBinary);
                set(`${osc(busId)}config/rtnsrc`, id, idToXAirId);
            } else {
                set(`${osc(busId)}preamp/rtnsw`, false, booleanToBinary);
                set(`${osc(busId)}config/insrc`, id, idToXAirId);
            }
        } else {
            set(`${osc(busId)}config/insrc`, id, idToXAirId);
        }
    }
};


const idDefaultOption = model => (busId) => {
    if (!inputHas(model, busId)) return undefined;
    const bus = busGet(busId);
    const defaultId = inputIdDefaultForBus(model, bus.id);
    return inputGet(defaultId);
};


const trimToDecimal = scaleLinear().domain([TRIM_MINIMUM, TRIM_MAXIMUM]).range([0, ONE]);


const decimalToTrim = trimToDecimal.invert;


const trimHas = model => (busId, inputId, c) => {
    if (!inputHas(model, busId) || !modelIs18(model)) {
        c(false);
        return;
    }
    c(inputId !== null && inputGet(inputId).type === 'usb');
};


const trimGet = get => (busId, inputId, c) => get(`${osc(busId)}preamp/rtntrim`, c, decimalToTrim);


const postTrimToBytePosition = {
    // 18
    '18': 18,
    '19': 19,
    '20': 20,
    '21': 21,
    '22': 22,
    '23': 23,
    '24': 24,
    '25': 25,
    '26': 26,
    '27': 27,
    '28': 28,
    '29': 29,
    '30': 30,
    '31': 31,
    '32': 32,
    '33': 33,
    '34': 34,
    '35': 35,
    '37': [18, 19],
    '38': [20, 21],
    '39': [22, 23],
    '40': [24, 25],
    '41': [26, 27],
    '42': [28, 29],
    '43': [30, 31],
    '44': [32, 33],
    '45': [34, 35],
    // 16
    '62': 18,
    '63': 19,
    // 12
    '76': 18,
    '77': 19,
};


const preTrimValueGet = (inputId) => {
    if (!inputGet(inputId).stereo) return v => v[postTrimToBytePosition[inputId]];
    return v => [
        v[postTrimToBytePosition[inputId][0]],
        v[postTrimToBytePosition[inputId][1]],
    ];
};


const preTrimSubscription = subscribe => (busId, inputId, c) => subscribe(xAirSubscriptionBuild({
    meterId: 2,
    shortIntegersToRead: 36,
}), c, preTrimValueGet(inputId));


const postTrimSubscription = (get, subscribe) => (busId, inputId, c) => {
    // Get the trim and the pre trim value and sum both

    let trimValue = 0;

    const unlistenLevelGet = trimGet(get)(busId, inputId, (v) => { trimValue = v; });

    const preTrimValue = preTrimValueGet(inputId);
    const apply = panAndLevelApply(0, 0);

    const unlistenSubscription = subscribe(xAirSubscriptionBuild({
        meterId: 2,
        shortIntegersToRead: 36,
    }), c, v => apply(0, trimValue, preTrimValue(v)));
    return () => {
        if (unlistenLevelGet) unlistenLevelGet();
        if (unlistenSubscription) unlistenSubscription();
    };
};


// Exported
export {
    idHas as busInputIdHas,
    idGet as busInputIdGet,
};


export const input = ({
    read, get, set, subscribe, model,
}) => ({
    has: (busId, c) => { c(inputHas(model, busId)); },
    id: {
        has: idHas(model),
        read: idRead(model, read),
        get: idGet(model, read, get),
        set: idSet(model, set),
        options: inputOptionsForBus(model),
        defaultOption: idDefaultOption(model),
    },
    trim: {
        has: trimHas(model),
        read: busId => read(`${osc(busId)}preamp/rtntrim`),
        get: trimGet(get),
        set: (busId, inputId, v) => set(`${osc(busId)}preamp/rtntrim`, v, trimToDecimal),
        minimum: TRIM_MINIMUM,
        maximum: TRIM_MAXIMUM,
        defaultValue: 0,
        pre: {
            has: trimHas(model),
            get: preTrimSubscription(subscribe),
        },
        post: {
            has: trimHas(model),
            get: postTrimSubscription(get, subscribe),
        },
    },
    volume: {
        has: (busId, c) => {
            // If effect, only if inputId is default (null)
            if (inputHas(model, busId) && busIsOfType(busId, 'effect')) {
                return idGet(model, read, get)(busId, (inputId) => {
                    c(inputId === null);
                });
            }
            c(false);
            return undefined;
        },
        get: (busId, c) => subscribe(xAirSubscriptionBuild({
            meterId: 3,
            shortIntegersToRead: 56,
        }), c, (v) => {
            const pos = (busGet(busId).fxId * 14);
            return [v[pos + 0], v[pos + 1]];
        }),
    },
});
