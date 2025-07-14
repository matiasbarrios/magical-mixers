// Requirements
import { busOsc, busIsOfType } from './options.js';


// Internal
const osc = busId => `${busOsc(busId)}/config/name`;


// Exported
export const name = ({ read, get, set }) => ({
    has: (busId, c) => { c(!busIsOfType(busId, 'monitor')); },
    read: busId => read(osc(busId)),
    get: (busId, c) => get(osc(busId), c),
    set: (busId, v) => set(osc(busId), v),
});
