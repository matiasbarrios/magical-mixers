// Requirements
import { xAirSubscriptionBuild } from '../../shared.js';
import { outputGet } from './options.js';


// Constants
const outputIdToBytePosition = {
    // 18
    // Main
    '0': [6, 7],

    // Phones
    '1': [42, 43],

    // Analog
    '2': 0,
    '3': 1,
    '4': 2,
    '5': 3,
    '6': 4,
    '7': 5,

    // USB
    '8': 24,
    '9': 25,
    '10': 26,
    '11': 27,
    '12': 28,
    '13': 29,
    '14': 30,
    '15': 31,
    '16': 32,
    '17': 33,
    '18': 34,
    '19': 35,
    '20': 36,
    '21': 37,
    '22': 38,
    '23': 39,
    '24': 40,
    '25': 41,

    // UltraNet
    '26': 8,
    '27': 9,
    '28': 10,
    '29': 11,
    '30': 12,
    '31': 13,
    '32': 14,
    '33': 15,
    '34': 16,
    '35': 17,
    '36': 18,
    '37': 19,
    '38': 20,
    '39': 21,
    '40': 22,
    '41': 23,

    // 16
    '42': [6, 7],
    '43': [42, 43],
    '44': 0,
    '45': 1,
    '46': 2,
    '47': 3,

    // 12
    '48': [6, 7],
    '49': [42, 43],
    '50': 0,
    '51': 1,
};


// Internal
const valueGet = (outputId) => {
    if (!outputGet(outputId).stereo) return v => v[outputIdToBytePosition[outputId]];
    return v => [
        v[outputIdToBytePosition[outputId][0]],
        v[outputIdToBytePosition[outputId][1]],
    ];
};


// Exported
export const volume = ({ subscribe }) => ({
    has: (outputId, c) => { c(true); },
    get: (outputId, c) => subscribe(xAirSubscriptionBuild({
        meterId: 5,
        shortIntegersToRead: 44,
    }), c, valueGet(outputId)),
});
