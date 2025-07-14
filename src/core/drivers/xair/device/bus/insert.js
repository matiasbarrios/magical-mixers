// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { busIsOfType, busOsc } from './options.js';


// Constants
const unassignedOption = { id: 0, name: 'Unassigned', fxId: null };

const mainOptions = [
    unassignedOption,
    { id: 1, name: 'FX 1', fxId: 0 },
    { id: 2, name: 'FX 2', fxId: 1 },
    { id: 3, name: 'FX 3', fxId: 2 },
    { id: 4, name: 'FX 4', fxId: 3 },
];

const channelSecondaryOptions = [
    unassignedOption,
    { id: 1, name: 'FX 1 Left', fxId: 0 },
    { id: 2, name: 'FX 1 Right', fxId: 0 },
    { id: 3, name: 'FX 2 Left', fxId: 1 },
    { id: 4, name: 'FX 2 Right', fxId: 1 },
    { id: 5, name: 'FX 3 Left', fxId: 2 },
    { id: 6, name: 'FX 3 Right', fxId: 2 },
    { id: 7, name: 'FX 4 Left', fxId: 3 },
    { id: 8, name: 'FX 4 Right', fxId: 3 },
];


// Internal
const osc = busId => `${busOsc(busId)}/insert/`;


const insertHas = busId => busIsOfType(busId, 'channel', 'secondary', 'main');


// Exported
export const insert = ({ read, get, set }) => ({
    has: (busId, c) => { c(insertHas(busId)); },
    on: {
        has: (busId, c) => { c(insertHas(busId)); },
        read: busId => read(`${osc(busId)}on`),
        get: (busId, c) => get(`${osc(busId)}on`, c, binaryToBoolean),
        set: (busId, v) => set(`${osc(busId)}on`, v, booleanToBinary),
    },
    fx: {
        has: (busId, c) => { c(insertHas(busId)); },
        read: busId => read(`${osc(busId)}sel`),
        get: (busId, c) => get(`${osc(busId)}sel`, c),
        set: (busId, v) => set(`${osc(busId)}sel`, v),
        options: busId => (busIsOfType(busId, 'main') ? mainOptions : channelSecondaryOptions),
        unassignedOption,
    },
});
