// Requirements
import { scaleLog } from 'd3';
import { ONE, xAirSubscriptionBuild } from '../../shared.js';


// Constants
const FREQUENCY_MINIMUM = 20;

const FREQUENCY_MAXIMUM = 20000;

const rtaSourceToValue = {
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

    '16': 16,

    '17': 17,
    '18': 18,
    '19': 19,
    '20': 20,

    '21': 21,
    '22': 22,
    '23': 23,
    '24': 24,
    '25': 25,
    '26': 26,

    // effect_send_1: 27,
    // effect_send_2: 28,
    // effect_send_3: 29,
    // effect_send_4: 30,

    '27': 31,

    '28': 32,
};

const positionOptions = [
    { id: 0, name: 'Pre equalizer' },
    { id: 1, name: 'Post equalizer' },
];


// Internal
const frequencyToDecimal = scaleLog().domain([FREQUENCY_MINIMUM, FREQUENCY_MAXIMUM])
    .range([0, ONE]);

const decimalToFrequency = frequencyToDecimal.invert;

const rtaBuild = values => values
    .map((v, i) => [decimalToFrequency(i / values.length), v]);


// Exported
export const rta = ({
    read, get, set, subscribe,
}) => ({
    has: (busId, c) => { c(true); },
    position: {
        has: (busId, c) => { c(true); },
        // eslint-disable-next-line no-unused-vars
        read: busId => read('/-stat/rta/pos'),
        get: (busId, c) => get('/-stat/rta/pos', c),
        set: (busId, v) => set('/-stat/rta/pos', v),
        // eslint-disable-next-line no-unused-vars
        options: busId => positionOptions,
    },
    get: (busId, c) => {
        set('/-stat/rta/source', rtaSourceToValue[busId], undefined, true);
        return subscribe(xAirSubscriptionBuild({
            meterId: 4,
            shortIntegersToRead: 100,
        }), c, rtaBuild);
    },
});
