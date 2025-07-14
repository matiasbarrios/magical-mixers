// Requirements
import { panAndLevelApply } from '../../../../helpers/panLevel.js';
import { ONE, xAirSubscriptionBuild } from '../../shared.js';
import {
    busOsc, busGet, busIsOfType, busIdToMetersZeroId,
} from './options.js';
import {
    panGet, panHas, panMaximum, panMinimum,
} from './pan.js';


// Constants
const DB_MINIMUM = -90;

const DB_MAXIMUM = 10;

const preBusIdToBytePosition = {
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    '11': 11,
    '12': 12,
    '13': 13,
    '14': 14,
    '15': 15,

    '16': [16, 17],

    '17': [18, 19],
    '18': [20, 21],
    '19': [22, 23],
    '20': [24, 25],

    '21': 26,
    '22': 27,
    '23': 28,
    '24': 29,
    '25': 30,
    '26': 31,
};

const postBusIdToBytePosition = {
    '27': [36, 37],
    '28': [38, 39],
};


// Internal
const osc = (busId) => {
    const bus = busGet(busId);
    const suffix = (bus.type === 'monitor') ? 'level' : 'mix/fader';
    return `${busOsc(busId)}/${suffix}`;
};


const dbToDecimal = (v) => {
    // Patrick‐Gilles Maillot approximation
    if (v <= -90) return 0.0;
    if (v < -60) return (v + 90) / 480;
    if (v < -30) return (v + 70) / 160;
    if (v < -10) return (v + 50) / 80;
    if (v < 10) return (v + 30) / 40;
    return ONE;
};


const decimalToDb = (v) => {
    // Patrick‐Gilles Maillot approximation
    if (v >= 0.5) return (v * 40.0) - 30.0; // max dB value: +10.
    if (v >= 0.25) return (v * 80.0) - 50.0;
    if (v >= 0.0625) return (v * 160.0) - 70.0;
    if (v >= 0.0) return (v * 480.0) - 90.0;
    return -90.0;
};


const levelHas = (busId, c) => { c(true); };


const levelRead = read => busId => read(osc(busId));


const levelGet = get => (busId, c) => get(osc(busId), c, decimalToDb);


const levelSet = set => (busId, v) => set(osc(busId), v, dbToDecimal);


const preValueGet = (busId) => {
    if (!busIsOfType(busId, 'line', 'effect')) return v => v[preBusIdToBytePosition[busId]];
    return v => [
        v[preBusIdToBytePosition[busId][0]],
        v[preBusIdToBytePosition[busId][1]],
    ];
};


const postValueGet = busId => v => [
    v[postBusIdToBytePosition[busId][0]],
    v[postBusIdToBytePosition[busId][1]],
];


const preLevelSubscription = subscribe => (busId, c) => {
    if (busIsOfType(busId, 'monitor')) return undefined;
    if (busIsOfType(busId, 'main')) {
        return subscribe(xAirSubscriptionBuild({
            meterId: 0,
            shortIntegersToRead: 8,
            argOne: busIdToMetersZeroId[busId],
        }), c, v => [v[0], v[1]]);
    }
    return subscribe(xAirSubscriptionBuild({
        meterId: 1,
        shortIntegersToRead: 40,
    }), c, preValueGet(busId));
};


const postLevelSubscription = (read, get, subscribe) => (busId, c) => {
    if (busIsOfType(busId, 'main', 'monitor')) {
        return subscribe(xAirSubscriptionBuild({
            meterId: 1,
            shortIntegersToRead: 40,
        }), c, postValueGet(busId));
    }
    // For channels, line, effect and secondary we will
    // get the level and the pre level value and sum both
    // This is for not using the subscription 0 and to be able to show
    // multiple post levels on the same page for different buses

    let panHasValue = false;
    let panValue = 0;
    let levelValue = 0;

    // We know it does not mutate
    let unlistenPanGet;
    const unlistenPanHas = panHas(busId, (has) => {
        if (panHasValue === has) return;
        panHasValue = has;
        panValue = 0;
        if (unlistenPanGet) unlistenPanGet();
        if (!panHasValue) return;
        unlistenPanGet = panGet(get)(busId, (v) => { panValue = v; });
    });

    const unlistenLevelGet = levelGet(get)(busId, (v) => { levelValue = v; });

    const preValueOfBus = preValueGet(busId);
    const apply = panAndLevelApply(panMinimum, panMaximum);

    const unlistenSubscription = subscribe(xAirSubscriptionBuild({
        meterId: 1,
        shortIntegersToRead: 40,
    }), c, v => apply(panValue, levelValue, preValueOfBus(v)));
    return () => {
        if (unlistenPanHas) unlistenPanHas();
        if (unlistenPanGet) unlistenPanGet();
        if (unlistenLevelGet) unlistenLevelGet();
        if (unlistenSubscription) unlistenSubscription();
    };
};


// Exported
export {
    levelRead, levelGet, levelSet,
    dbToDecimal, decimalToDb, DB_MINIMUM, DB_MAXIMUM,
    preLevelSubscription, postLevelSubscription,
};


export const level = ({
    read, get, set, subscribe,
}) => ({
    has: levelHas,
    read: levelRead(read),
    get: levelGet(get),
    set: levelSet(set),
    minimum: DB_MINIMUM,
    maximum: DB_MAXIMUM,
    pre: {
        has: (busId, c) => { c(!busIsOfType(busId, 'main', 'monitor')); },
        get: preLevelSubscription(subscribe),
    },
    post: {
        has: (busId, c) => { c(true); },
        get: postLevelSubscription(read, get, subscribe),
    },
});
