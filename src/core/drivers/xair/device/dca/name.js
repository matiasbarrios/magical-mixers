// Requirements
import { dcaOsc } from './options.js';


// Internal
const osc = dcaId => `${dcaOsc(dcaId)}/config/name`;


// Exported
export const name = ({ read, get, set }) => ({
    has: (dcaId, c) => { c(true); },
    read: dcaId => read(osc(dcaId)),
    get: (dcaId, c) => get(osc(dcaId), c),
    set: (dcaId, v) => set(osc(dcaId), v),
});
