// Requirements
import { options } from '../bus/color.js';
import { dcaOsc } from './options.js';

// Internal
const osc = dcaId => `${dcaOsc(dcaId)}/config/color`;


// Exported
export const color = ({ read, get, set }) => ({
    has: (dcaId, c) => { c(true); },
    read: dcaId => read(osc(dcaId)),
    get: (dcaId, c) => get(osc(dcaId), c),
    set: (dcaId, v) => set(osc(dcaId), v),
    // eslint-disable-next-line no-unused-vars
    options: dcaId => options,
    // eslint-disable-next-line no-unused-vars
    defaultOption: dcaId => options[0],
});
