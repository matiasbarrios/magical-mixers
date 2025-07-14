// Requirements
import { pad } from '../../../../helpers/values.js';
import {
    models18, models16, models12, modelIs18,
    modelIs16,
    modelIs12,
    modelsSupported,
} from '../../model.js';
import { busGet } from '../bus/options.js';


// Constants
const allOptions = [
    // 18
    {
        id: 0, models: models18, stereo: false, type: 'preamp', number: '1',
    },
    {
        id: 1, models: models18, stereo: false, type: 'preamp', number: '2',
    },
    {
        id: 2, models: models18, stereo: false, type: 'preamp', number: '3',
    },
    {
        id: 3, models: models18, stereo: false, type: 'preamp', number: '4',
    },
    {
        id: 4, models: models18, stereo: false, type: 'preamp', number: '5',
    },
    {
        id: 5, models: models18, stereo: false, type: 'preamp', number: '6',
    },
    {
        id: 6, models: models18, stereo: false, type: 'preamp', number: '7',
    },
    {
        id: 7, models: models18, stereo: false, type: 'preamp', number: '8',
    },
    {
        id: 8, models: models18, stereo: false, type: 'preamp', number: '9',
    },
    {
        id: 9, models: models18, stereo: false, type: 'preamp', number: '10',
    },
    {
        id: 10, models: models18, stereo: false, type: 'preamp', number: '11',
    },
    {
        id: 11, models: models18, stereo: false, type: 'preamp', number: '12',
    },
    {
        id: 12, models: models18, stereo: false, type: 'preamp', number: '13',
    },
    {
        id: 13, models: models18, stereo: false, type: 'preamp', number: '14',
    },
    {
        id: 14, models: models18, stereo: false, type: 'preamp', number: '15',
    },
    {
        id: 15, models: models18, stereo: false, type: 'preamp', number: '16',
    },
    {
        id: 16, models: models18, stereo: false, type: 'line', number: '17',
    },
    {
        id: 17, models: models18, stereo: false, type: 'line', number: '18',
    },
    {
        id: 18, models: models18, stereo: false, type: 'usb', number: '1',
    },
    {
        id: 19, models: models18, stereo: false, type: 'usb', number: '2',
    },
    {
        id: 20, models: models18, stereo: false, type: 'usb', number: '3',
    },
    {
        id: 21, models: models18, stereo: false, type: 'usb', number: '4',
    },
    {
        id: 22, models: models18, stereo: false, type: 'usb', number: '5',
    },
    {
        id: 23, models: models18, stereo: false, type: 'usb', number: '6',
    },
    {
        id: 24, models: models18, stereo: false, type: 'usb', number: '7',
    },
    {
        id: 25, models: models18, stereo: false, type: 'usb', number: '8',
    },
    {
        id: 26, models: models18, stereo: false, type: 'usb', number: '9',
    },
    {
        id: 27, models: models18, stereo: false, type: 'usb', number: '10',
    },
    {
        id: 28, models: models18, stereo: false, type: 'usb', number: '11',
    },
    {
        id: 29, models: models18, stereo: false, type: 'usb', number: '12',
    },
    {
        id: 30, models: models18, stereo: false, type: 'usb', number: '13',
    },
    {
        id: 31, models: models18, stereo: false, type: 'usb', number: '14',
    },
    {
        id: 32, models: models18, stereo: false, type: 'usb', number: '15',
    },
    {
        id: 33, models: models18, stereo: false, type: 'usb', number: '16',
    },
    {
        id: 34, models: models18, stereo: false, type: 'usb', number: '17',
    },
    {
        id: 35, models: models18, stereo: false, type: 'usb', number: '18',
    },
    {
        id: 36, models: models18, stereo: true, type: 'line', number: '17/18',
    },
    {
        id: 37, models: models18, stereo: true, type: 'usb', number: '1/2',
    },
    {
        id: 38, models: models18, stereo: true, type: 'usb', number: '3/4',
    },
    {
        id: 39, models: models18, stereo: true, type: 'usb', number: '5/6',
    },
    {
        id: 40, models: models18, stereo: true, type: 'usb', number: '7/8',
    },
    {
        id: 41, models: models18, stereo: true, type: 'usb', number: '9/10',
    },
    {
        id: 42, models: models18, stereo: true, type: 'usb', number: '11/12',
    },
    {
        id: 43, models: models18, stereo: true, type: 'usb', number: '13/14',
    },
    {
        id: 44, models: models18, stereo: true, type: 'usb', number: '15/16',
    },
    {
        id: 45, models: models18, stereo: true, type: 'usb', number: '17/18',
    },
    // 16
    {
        id: 46, models: models16, stereo: false, type: 'preamp', number: '1',
    },
    {
        id: 47, models: models16, stereo: false, type: 'preamp', number: '2',
    },
    {
        id: 48, models: models16, stereo: false, type: 'preamp', number: '3',
    },
    {
        id: 49, models: models16, stereo: false, type: 'preamp', number: '4',
    },
    {
        id: 50, models: models16, stereo: false, type: 'preamp', number: '5',
    },
    {
        id: 51, models: models16, stereo: false, type: 'preamp', number: '6',
    },
    {
        id: 52, models: models16, stereo: false, type: 'preamp', number: '7',
    },
    {
        id: 53, models: models16, stereo: false, type: 'preamp', number: '8',
    },
    {
        id: 54, models: models16, stereo: false, type: 'line', number: '9',
    },
    {
        id: 55, models: models16, stereo: false, type: 'line', number: '10',
    },
    {
        id: 56, models: models16, stereo: false, type: 'line', number: '11',
    },
    {
        id: 57, models: models16, stereo: false, type: 'line', number: '12',
    },
    {
        id: 58, models: models16, stereo: false, type: 'line', number: '13',
    },
    {
        id: 59, models: models16, stereo: false, type: 'line', number: '14',
    },
    {
        id: 60, models: models16, stereo: false, type: 'line', number: '15',
    },
    {
        id: 61, models: models16, stereo: false, type: 'line', number: '16',
    },
    {
        id: 62, models: models16, stereo: false, type: 'usb', number: 'L',
    },
    {
        id: 63, models: models16, stereo: false, type: 'usb', number: 'R',
    },
    // 12
    {
        id: 64, models: models12, stereo: false, type: 'preamp', number: '1',
    },
    {
        id: 65, models: models12, stereo: false, type: 'preamp', number: '2',
    },
    {
        id: 66, models: models12, stereo: false, type: 'preamp', number: '3',
    },
    {
        id: 67, models: models12, stereo: false, type: 'preamp', number: '4',
    },
    {
        id: 68, models: models12, stereo: false, type: 'line', number: '5',
    },
    {
        id: 69, models: models12, stereo: false, type: 'line', number: '6',
    },
    {
        id: 70, models: models12, stereo: false, type: 'line', number: '7',
    },
    {
        id: 71, models: models12, stereo: false, type: 'line', number: '8',
    },
    {
        id: 72, models: models12, stereo: false, type: 'line', number: '9',
    },
    {
        id: 73, models: models12, stereo: false, type: 'line', number: '10',
    },
    {
        id: 74, models: models12, stereo: false, type: 'line', number: '11',
    },
    {
        id: 75, models: models12, stereo: false, type: 'line', number: '12',
    },
    {
        id: 76, models: models12, stereo: false, type: 'usb', number: 'L',
    },
    {
        id: 77, models: models12, stereo: false, type: 'usb', number: 'R',
    },
];


const channelOffOption = {
    id: 78, models: modelsSupported, stereo: false, type: 'off', number: '',
};


const effectDefaultOption = {
    id: 79, models: models18, stereo: false, type: 'default', number: '',
};


const optionsPerModelAndBusType = {
    X18: {
        channel: [
            { ...channelOffOption, xAirId: 18 },
            ...allOptions.slice(0, 18).map((o, i) => ({ ...o, xAirId: i })),
            ...allOptions.slice(18, 36).map((o, i) => ({ ...o, xAirId: i })),
        ],
        line: [
            ...allOptions.slice(36, 37).map(o => ({ ...o, xAirId: null })),
            ...allOptions.slice(37, 46).map((o, i) => ({ ...o, xAirId: i })),
        ],
        effect: [
            { ...effectDefaultOption, xAirId: null },
            ...allOptions.slice(37, 46).map((o, i) => ({ ...o, xAirId: i })),
        ],
    },
    XR16: {
        channel: [
            { ...channelOffOption, xAirId: 18 },
            ...allOptions.slice(46, 64).map((o, i) => ({ ...o, xAirId: i })),
        ],
    },
    XR12: {
        channel: [
            { ...channelOffOption, xAirId: 18 },
            ...allOptions.slice(64, 78).map((o, i) => ({ ...o, xAirId: i })),
        ],
    },
};
optionsPerModelAndBusType.XR18 = optionsPerModelAndBusType.X18;
optionsPerModelAndBusType.MR18 = optionsPerModelAndBusType.X18;
optionsPerModelAndBusType.MR12 = optionsPerModelAndBusType.XR12;


// Exported
export const optionsForModel = model => allOptions
    .filter(option => option.models.includes(model));


export const inputGet = (inputId) => {
    if (allOptions[inputId]) return allOptions[inputId];
    if (inputId === channelOffOption.id) return channelOffOption;
    if (inputId === effectDefaultOption.id) return effectDefaultOption;
    throw new Error('Unknown input');
};


export const inputOsc = (inputId) => {
    const input = inputGet(inputId);
    if (!input.stereo && !['preamp', 'line'].includes(input.type)) throw new Error('Invalid input type for osc');
    return `/headamp/${pad(input.number || '')}/`;
};


export const inputIsPreamp = inputId => inputGet(inputId).type === 'preamp';


export const inputIdDefaultForBus = (model, busId) => {
    if (modelIs18(model)) {
        const defaults = {
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
            '16': 36,
            '17': effectDefaultOption.id,
            '18': effectDefaultOption.id,
            '19': effectDefaultOption.id,
            '20': effectDefaultOption.id,
        };
        return defaults[busId];
    } if (modelIs16(model)) {
        const defaults = {
            '0': 46,
            '1': 47,
            '2': 48,
            '3': 49,
            '4': 50,
            '5': 51,
            '6': 52,
            '7': 53,
            '8': 54,
            '9': 55,
            '10': 56,
            '11': 57,
            '12': 58,
            '13': 59,
            '14': 60,
            '15': 61,
        };
        return defaults[busId];
    } if (modelIs12(model)) {
        const defaults = {
            '0': 64,
            '1': 65,
            '2': 66,
            '3': 67,
            '4': 68,
            '5': 69,
            '6': 70,
            '7': 71,
            '8': 72,
            '9': 73,
            '10': 74,
            '11': 75,
        };
        return defaults[busId];
    }
    return undefined;
};


export const inputOptionsForBus = model => (busId) => {
    const { type } = busGet(busId);
    return optionsPerModelAndBusType[model][type] || [];
};


export const inputIdToXAirId = (model, busId) => (inputId) => {
    const options = inputOptionsForBus(model)(busId);
    return options.find(o => o.id === inputId)?.xAirId;
};


export const xAirIdToInputId = (model, busId, isUsb) => (xAirId) => {
    const options = inputOptionsForBus(model)(busId);
    return options.filter((o) => {
        if (isUsb === undefined) return true;
        return isUsb ? o.type === 'usb' : o.type !== 'usb';
    }).find(o => o.xAirId === xAirId)?.id;
};


export const inputsUsbMono18 = allOptions.slice(18, 36);


export const inputsUsbStereo18 = allOptions.slice(37, 46);
