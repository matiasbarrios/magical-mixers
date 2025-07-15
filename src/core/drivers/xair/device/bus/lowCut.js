// Requirements
import { scaleLog } from 'd3-scale';
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { ONE } from '../../shared.js';
import { busOsc, busIsOfType } from './options.js';


// Constants
const FREQUENCY_MINIMUM = 20;

const FREQUENCY_MAXIMUM = 400;


// Internal
const frequencyToDecimal = scaleLog()
    .domain([FREQUENCY_MINIMUM, FREQUENCY_MAXIMUM])
    .range([0, ONE]);


const decimalToFrequency = frequencyToDecimal.invert;


const osc = busId => `${busOsc(busId)}/preamp/`;


const lowCutHas = busId => busIsOfType(busId, 'channel');


// Exported
export const lowCut = ({ read, get, set }) => ({
    has: (busId, c) => { c(lowCutHas(busId)); },
    on: {
        has: (busId, c) => { c(lowCutHas(busId)); },
        read: busId => read(`${osc(busId)}hpon`),
        get: (busId, c) => get(`${osc(busId)}hpon`, c, binaryToBoolean),
        set: (busId, v) => set(`${osc(busId)}hpon`, v, booleanToBinary),
    },
    frequency: {
        has: (busId, c) => { c(lowCutHas(busId)); },
        read: busId => read(`${osc(busId)}hpf`),
        get: (busId, c) => get(`${osc(busId)}hpf`, c, decimalToFrequency),
        set: (busId, v) => set(`${osc(busId)}hpf`, v, frequencyToDecimal),
        minimum: FREQUENCY_MINIMUM,
        maximum: FREQUENCY_MAXIMUM,
    },
});
