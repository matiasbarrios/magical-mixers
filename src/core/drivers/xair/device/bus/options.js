// Requirements
import { pad } from '../../../../helpers/values.js';
import {
    models18, models16, modelsSupported,
} from '../../model.js';


// Constants
const models18Only = models18;

const models18And16 = [...models18, ...models16];

const modelsAll = modelsSupported;


// Exported
export const options = [
    {
        id: 0, type: 'channel', number: '1', models: modelsAll,
    },
    {
        id: 1, type: 'channel', number: '2', models: modelsAll,
    },
    {
        id: 2, type: 'channel', number: '3', models: modelsAll,
    },
    {
        id: 3, type: 'channel', number: '4', models: modelsAll,
    },
    {
        id: 4, type: 'channel', number: '5', models: modelsAll,
    },
    {
        id: 5, type: 'channel', number: '6', models: modelsAll,
    },
    {
        id: 6, type: 'channel', number: '7', models: modelsAll,
    },
    {
        id: 7, type: 'channel', number: '8', models: modelsAll,
    },
    {
        id: 8, type: 'channel', number: '9', models: modelsAll,
    },
    {
        id: 9, type: 'channel', number: '10', models: modelsAll,
    },
    {
        id: 10, type: 'channel', number: '11', models: modelsAll,
    },
    {
        id: 11, type: 'channel', number: '12', models: modelsAll,
    },
    {
        id: 12, type: 'channel', number: '13', models: models18And16,
    },
    {
        id: 13, type: 'channel', number: '14', models: models18And16,
    },
    {
        id: 14, type: 'channel', number: '15', models: models18And16,
    },
    {
        id: 15, type: 'channel', number: '16', models: models18And16,
    },
    {
        id: 16, type: 'line', number: '17/18', models: models18Only,
    },
    {
        id: 17, type: 'effect', number: '1', fxId: 0, models: modelsAll,
    },
    {
        id: 18, type: 'effect', number: '2', fxId: 1, models: modelsAll,
    },
    {
        id: 19, type: 'effect', number: '3', fxId: 2, models: modelsAll,
    },
    {
        id: 20, type: 'effect', number: '4', fxId: 3, models: modelsAll,
    },
    {
        id: 21, type: 'secondary', number: '1', models: modelsAll,
    },
    {
        id: 22, type: 'secondary', number: '2', models: modelsAll,
    },
    {
        id: 23, type: 'secondary', number: '3', models: modelsAll,
    },
    {
        id: 24, type: 'secondary', number: '4', models: modelsAll,
    },
    {
        id: 25, type: 'secondary', number: '5', models: models18And16,
    },
    {
        id: 26, type: 'secondary', number: '6', models: models18And16,
    },
    {
        id: 27, type: 'main', number: '', models: modelsAll,
    },
    {
        id: 28, type: 'monitor', number: '', models: modelsAll,
    },
];


export const optionsForModel = model => options.filter(option => option.models.includes(model));


export const busesMainAndMonitor = options.slice(27, 29);


export const busMain = options.slice(27, 28);


export const busMonitor = options.slice(28, 29);


export const busesChannels = options.slice(0, 16);


export const busLine1 = options.slice(16, 17);


export const busesSecondary = options.slice(21, 27);


export const busesEffect = options.slice(17, 21);


export const busesMainSecondaryEffectMonitor = options.slice(17, 29);


export const busIdToMetersZeroId = {
    // Channel
    '0': 0,
    '1': 1,
    '2': 2,
    '3': 3,
    '4': 4,
    '5': 5,
    '6': 6,
    '7': 7,
    '8': 8,
    '9': 9,
    '10': 10,
    '11': 11,
    '12': 12,
    '13': 13,
    '14': 14,
    '15': 15,

    // Line
    '16': 16,

    // Effect, show the ones of out
    '17': 27,
    '18': 28,
    '19': 29,
    '20': 30,

    // Secondary
    '21': 21,
    '22': 22,
    '23': 23,
    '24': 24,
    '25': 25,
    '26': 26,

    // Main
    '27': 31,
};


export const busGet = (busId) => {
    if (!options[busId]) {
        console.error('Unknown bus', busId);
        throw new Error(`Unknown bus: ${busId}`);
    }
    return options[busId];
};


export const busIsOfType = (busId, ...types) => {
    const bus = busGet(busId);
    return types.includes(bus.type);
};


export const busOsc = (busId) => {
    const { type, number } = busGet(busId);
    if (type === 'channel') return `/ch/${pad(number)}`;
    if (type === 'line') return '/rtn/aux'; // Only 1!
    if (type === 'effect') return `/rtn/${number}`;
    if (type === 'secondary') return `/bus/${number}`;
    if (type === 'main') return '/lr'; // Only 1!
    return '/config/solo'; // Only 1!
};
