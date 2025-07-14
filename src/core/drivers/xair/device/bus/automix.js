// Requirements
import { scaleLinear } from 'd3';
import { ONE, xAirSubscriptionBuild } from '../../shared.js';
import { noneOption, options } from '../automix/options.js';
import { busIsOfType, busOsc } from './options.js';


// Constants
const WEIGHT_MINIMUM = -12;

const WEIGHT_MAXIMUM = 12;

const busIdToBytePositionGainReduction = {
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
};


// Internal
const osc = busId => `${busOsc(busId)}/automix/`;

const weightToDecimal = scaleLinear().domain([WEIGHT_MINIMUM, WEIGHT_MAXIMUM]).range([0, ONE]);

const decimalToWeight = weightToDecimal.invert;

const gainReductionGet = busId => v => v[busIdToBytePositionGainReduction[busId]];

const automixHas = busId => busIsOfType(busId, 'channel');


// Exported
export const automix = ({
    read, get, set, subscribe,
}) => ({
    has: (busId, c) => { c(automixHas(busId)); },
    id: {
        has: (busId, c) => { c(automixHas(busId)); },
        read: busId => read(`${osc(busId)}group`),
        get: (busId, c) => get(`${osc(busId)}group`, c),
        set: (busId, v) => set(`${osc(busId)}group`, v),
        // eslint-disable-next-line no-unused-vars
        options: busId => options,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => noneOption,
    },
    weight: {
        has: (busId, c) => { c(automixHas(busId)); },
        read: busId => read(`${osc(busId)}weight`),
        get: (busId, c) => get(`${osc(busId)}weight`, c, decimalToWeight),
        set: (busId, v) => set(`${osc(busId)}weight`, v, weightToDecimal),
        minimum: WEIGHT_MINIMUM,
        maximum: WEIGHT_MAXIMUM,
        defaultValue: 0,
    },
    gainReduction: {
        has: (busId, c) => { c(automixHas(busId)); },
        get: (busId, c) => subscribe(xAirSubscriptionBuild({
            meterId: 7,
            shortIntegersToRead: 16,
        }), c, gainReductionGet(busId)),
    },
});
