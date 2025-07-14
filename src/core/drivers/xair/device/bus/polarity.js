// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { busOsc, busIsOfType } from './options.js';


// Internal
const osc = busId => `${busOsc(busId)}/preamp/invert`;


// Exported
export const polarity = ({ read, get, set }) => ({
    has: (busId, c) => { c(busIsOfType(busId, 'channel')); },
    read: busId => read(osc(busId)),
    get: (busId, c) => get(osc(busId), c, binaryToBoolean),
    set: (busId, v) => set(osc(busId), v, booleanToBinary),
});
