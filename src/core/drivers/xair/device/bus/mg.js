// Requirements
import { options as mgOptions, mgExists } from '../mg/options.js';
import { busIsOfType, busOsc } from './options.js';


// Internal
const readOn = mgId => (v) => {
    // The value has to be a number, which its binary representation indicates
    // to which mute groups the bus is assigned to
    if (v === undefined || v === false || Number.isNaN(v)) return false;
    return v.toString(2).padStart(mgOptions.length, '0').charAt(mgOptions.length - 1 - mgId) === '1';
};


const setOn = (mgId, readValue) => (value) => {
    // Return the integer value of the binary string to be set
    let v = readValue();
    if (v === undefined || v === false || Number.isNaN(v)) v = 0;
    v = v.toString(2).padStart(mgOptions.length, '0').split('');
    v[mgOptions.length - 1 - mgId] = value ? '1' : '0';
    return parseInt(v.join(''), 2);
};


const osc = busId => `${busOsc(busId)}/grp/mute`;


const mgHas = busId => !busIsOfType(busId, 'main', 'monitor');


// Exported
export const mg = ({ read, get, set }) => ({
    has: (busId, c) => { c(mgHas(busId)); },
    on: {
        has: (busId, mgId, c) => { c(mgHas(busId) && mgExists(mgId)); },
        read: (busId, mgId) => readOn(mgId)(read(osc(busId))),
        get: (busId, mgId, c) => get(osc(busId), v => c(readOn(mgId)(v))),
        set: (busId, mgId, v) => set(osc(busId), v, setOn(mgId, () => read(osc(busId)))),
    },
    // eslint-disable-next-line no-unused-vars
    options: busId => mgOptions,
});
