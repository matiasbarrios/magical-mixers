// Requirements
import { notBinaryToBoolean, notBooleanToBinary } from '../../../../helpers/values.js';
import { dcaOsc } from './options.js';


// Internal
const osc = dcaId => `${dcaOsc(dcaId)}/on`;


// Exported
export const mute = ({ read, get, set }) => ({
    has: (dcaId, c) => { c(true); },
    read: dcaId => read(osc(dcaId)),
    get: (dcaId, c) => get(osc(dcaId), c, notBinaryToBoolean),
    set: (dcaId, v) => set(osc(dcaId), v, notBooleanToBinary),
});
