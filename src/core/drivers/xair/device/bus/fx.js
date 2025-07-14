// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { options as fxOptions } from '../fx/options.js';
import {
    DB_MAXIMUM, DB_MINIMUM, dbToDecimal, decimalToDb,
} from './level.js';
import { busGet, busIsOfType } from './options.js';


// Constants
const fxPerBusId = {
    '17': [fxOptions[0]],
    '18': [fxOptions[1]],
    '19': [fxOptions[2]],
    '20': [fxOptions[3]],
};


// Internal
const osc = busId => `/fxsend/${busGet(busId).number}/mix/`;


const fxHas = busId => busIsOfType(busId, 'effect');


// Exported
export const fx = ({ read, get, set }) => ({
    has: (busId, c) => { c(fxHas(busId)); },
    id: {
        has: (busId, c) => { c(fxHas(busId)); },
        read: busId => busGet(busId).fxId,
        get: (busId, c) => { c(busGet(busId).fxId); },
        set: () => {},
        options: busId => fxPerBusId[busId],
    },
    on: {
        has: (busId, c) => { c(fxHas(busId)); },
        read: busId => read(`${osc(busId)}on`),
        get: (busId, c) => get(`${osc(busId)}on`, c, binaryToBoolean),
        set: (busId, v) => set(`${osc(busId)}on`, v, booleanToBinary),
    },
    gain: {
        has: (busId, c) => { c(fxHas(busId)); },
        read: busId => read(`${osc(busId)}fader`),
        get: (busId, c) => get(`${osc(busId)}fader`, c, decimalToDb),
        set: (busId, v) => set(`${osc(busId)}fader`, v, dbToDecimal),
        minimum: DB_MINIMUM,
        maximum: DB_MAXIMUM,
    },
});
