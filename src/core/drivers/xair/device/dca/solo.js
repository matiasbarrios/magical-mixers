// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';


// Constants
const dcaToMonitor = {
    '0': 51,
    '1': 52,
    '2': 53,
    '3': 54,
};


// Internal
const dcaToMonitorOsc = (dcaId) => {
    if (!dcaToMonitor[dcaId]) throw new Error(`Invalid DCA ID: ${dcaId}`);
    return dcaToMonitor[dcaId];
};


const osc = dcaId => `/-stat/solosw/${dcaToMonitorOsc(dcaId)}`;


// Exported
export const solo = ({ read, get, set }) => ({
    has: (dcaId, c) => { c(true); },
    read: dcaId => read(osc(dcaId)),
    get: (dcaId, c) => get(osc(dcaId), c, binaryToBoolean),
    set: (dcaId, v) => set(osc(dcaId), v, booleanToBinary),
});
