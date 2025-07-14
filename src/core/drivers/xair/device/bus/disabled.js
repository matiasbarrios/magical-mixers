// Requirements
import { binaryToBoolean } from '../../../../helpers/values.js';
import { fxGet } from '../fx/options.js';
import { busGet, busIsOfType } from './options.js';


// Internal
const osc = busId => `/fx/${fxGet(busGet(busId).fxId).number}/insert`;


// Exported
export const disabled = ({ read, get }) => ({
    has: (busId, c) => { c(busIsOfType(busId, 'effect')); },
    read: busId => read(osc(busId)),
    get: (busId, c) => get(osc(busId), c, binaryToBoolean),
});
