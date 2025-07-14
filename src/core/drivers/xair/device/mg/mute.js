// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { mgGet } from './options.js';


// Internal
const osc = mgId => `/config/mute/${mgGet(mgId).number}`;


// Exported
export const mute = ({ read, get, set }) => ({
    has: (mgId, c) => { c(true); },
    read: mgId => read(osc(mgId)),
    get: (mgId, c) => get(osc(mgId), c, binaryToBoolean),
    set: (mgId, v) => set(osc(mgId), v, booleanToBinary),
});
