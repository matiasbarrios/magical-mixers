// Requirements
import { options as fxAll } from '../fx/options.js';
import {
    busesMainAndMonitor, busesChannels, busesSecondary, busesEffect, busLine1, busMain,
} from '../bus/options.js';
import { inputsUsbMono18, inputsUsbStereo18 } from '../input/options.js';
import { outputGet, outputOsc } from './options.js';


// Internal
const stereoToLR = (idStart, entities, type) => {
    const res = [];
    let id = idStart;
    entities.forEach((e) => {
        res.push({
            id, type, externalId: e.id, side: 'Left',
        });
        id += 1;
        res.push({
            id, type, externalId: e.id, side: 'Right',
        });
        id += 1;
    });
    return res;
};


// Constants
const busesMainAndMonitorOptions = busesMainAndMonitor.map((e, i) => ({
    id: i, type: 'bus', externalId: e.id,
}));

const busesRestOptions = [
    ...busesChannels.map((e, i) => ({ id: i, type: 'bus', externalId: e.id })),
    ...stereoToLR(16, busLine1, 'bus'),
    ...stereoToLR(18, fxAll, 'fx'),
    ...busesSecondary.map((e, i) => ({ id: i + 26, type: 'bus', externalId: e.id })),
    ...busesEffect.map((e, i) => ({ id: i + 32, type: 'bus', externalId: e.id })),
    ...stereoToLR(36, busMain, 'bus'),
];

const optionsPerModelAndOutputType = {
    X18: {
        main: [
            ...busesMainAndMonitorOptions,
            ...inputsUsbStereo18.map((e, i) => ({
                id: i + 2, type: 'input', externalId: e.id,
            })),
        ],
        analog: [
            ...busesRestOptions,
            ...inputsUsbMono18.map((e, i) => ({
                id: i + 38, type: 'input', externalId: e.id,
            })),
        ],
        usb: busesRestOptions,
    },
    XR16: {
        main: busesMainAndMonitorOptions,
        analog: busesRestOptions,
    },
};
optionsPerModelAndOutputType.X18.phones = optionsPerModelAndOutputType.X18.main;
optionsPerModelAndOutputType.X18.ultranet = optionsPerModelAndOutputType.X18.analog;
optionsPerModelAndOutputType.XR18 = optionsPerModelAndOutputType.X18;
optionsPerModelAndOutputType.MR18 = optionsPerModelAndOutputType.X18;
optionsPerModelAndOutputType.XR16.phones = optionsPerModelAndOutputType.XR16.main;
optionsPerModelAndOutputType.XR12 = optionsPerModelAndOutputType.XR16;
optionsPerModelAndOutputType.MR12 = optionsPerModelAndOutputType.XR12;


const defaultSourcePerOutput = {
    // 18
    '0': 0,
    '1': 1,

    '2': 26,
    '3': 27,
    '4': 28,
    '5': 29,
    '6': 30,
    '7': 31,

    '8': 0,
    '9': 1,
    '10': 2,
    '11': 3,
    '12': 4,
    '13': 5,
    '14': 6,
    '15': 7,
    '16': 8,
    '17': 9,
    '18': 10,
    '19': 11,
    '20': 12,
    '21': 13,
    '22': 14,
    '23': 15,
    '24': 16,
    '25': 17,

    '26': 0,
    '27': 1,
    '28': 2,
    '29': 3,
    '30': 4,
    '31': 5,
    '32': 6,
    '33': 7,
    '34': 8,
    '35': 9,
    '36': 10,
    '37': 11,
    '38': 12,
    '39': 13,
    '40': 14,
    '41': 15,

    // 16
    '42': 0,
    '43': 1,

    '44': 26,
    '45': 27,
    '46': 28,
    '47': 29,

    // 12
    '48': 0,
    '49': 1,

    '50': 26,
    '51': 27,
};


// Internal
const optionsForOutputId = model => (outputId) => {
    const { type } = outputGet(outputId);
    return optionsPerModelAndOutputType[model][type] || [];
};


const defaultOption = model => (outputId) => {
    const options = optionsForOutputId(model)(outputId);
    return options.find(o => o.id === defaultSourcePerOutput[outputId]);
};


// Exported
export const source = ({
    read, get, set, model,
}) => ({
    has: (outputId, c) => { c(true); },
    read: outputId => read(`${outputOsc(outputId)}src`),
    get: (outputId, c) => get(`${outputOsc(outputId)}src`, c),
    set: (outputId, v) => set(`${outputOsc(outputId)}src`, v),
    options: optionsForOutputId(model),
    defaultOption: defaultOption(model),
});
