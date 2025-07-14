// Requirements
import { dcaExists, options as dcaOptions } from '../dca/options.js';
import { busIsOfType, busOsc } from './options.js';


// Internal
const readOn = dcaId => (v) => {
    // The value has to be a number, which its binary representation indicates
    // to which mute groups the bus is assigned to
    if (v === undefined || v === false || Number.isNaN(v)) return false;
    return v.toString(2).padStart(dcaOptions.length, '0').charAt(dcaOptions.length - 1 - dcaId) === '1';
};


const setOn = (dcaId, readValue) => (value) => {
    // Return the integer value of the binary string to be set
    let v = readValue();
    if (v === undefined || v === false || Number.isNaN(v)) v = 0;
    v = v.toString(2).padStart(dcaOptions.length, '0').split('');
    v[dcaOptions.length - 1 - dcaId] = value ? '1' : '0';
    return parseInt(v.join(''), 2);
};


const osc = busId => `${busOsc(busId)}/grp/dca`;


const dcaHas = busId => !busIsOfType(busId, 'main', 'monitor');


// Exported
export const dca = ({ read, get, set }) => ({
    has: (busId, c) => { c(dcaHas(busId)); },
    on: {
        has: (busId, dcaId, c) => { c(dcaHas(busId) && dcaExists(dcaId)); },
        read: (busId, dcaId) => readOn(dcaId)(read(osc(busId))),
        get: (busId, dcaId, c) => get(osc(busId), v => c(readOn(dcaId)(v))),
        set: (busId, dcaId, v) => set(osc(busId), v, setOn(dcaId, () => read(osc(busId)))),
    },
    // eslint-disable-next-line no-unused-vars
    options: busId => dcaOptions,
});
