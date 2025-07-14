// Requirements
import { pad } from '../../../../helpers/values.js';
import { models12, models16, models18 } from '../../model.js';


// Constants
const oscPrefixPerType = {
    main: 'main',
    phones: 'main',
    analog: 'aux',
    usb: 'usb',
    ultranet: 'p16',
};


const allOptions = [
    // 18
    {
        id: 0, models: models18, stereo: true, type: 'main', number: '', xAirId: 1,
    },
    {
        id: 1, models: models18, stereo: true, type: 'phones', number: '', xAirId: 2,
    },
    {
        id: 2, models: models18, stereo: false, type: 'analog', number: '1', xAirId: 1,
    },
    {
        id: 3, models: models18, stereo: false, type: 'analog', number: '2', xAirId: 2,
    },
    {
        id: 4, models: models18, stereo: false, type: 'analog', number: '3', xAirId: 3,
    },
    {
        id: 5, models: models18, stereo: false, type: 'analog', number: '4', xAirId: 4,
    },
    {
        id: 6, models: models18, stereo: false, type: 'analog', number: '5', xAirId: 5,
    },
    {
        id: 7, models: models18, stereo: false, type: 'analog', number: '6', xAirId: 6,
    },
    {
        id: 8, models: models18, stereo: false, type: 'usb', number: '1', xAirId: 1,
    },
    {
        id: 9, models: models18, stereo: false, type: 'usb', number: '2', xAirId: 2,
    },
    {
        id: 10, models: models18, stereo: false, type: 'usb', number: '3', xAirId: 3,
    },
    {
        id: 11, models: models18, stereo: false, type: 'usb', number: '4', xAirId: 4,
    },
    {
        id: 12, models: models18, stereo: false, type: 'usb', number: '5', xAirId: 5,
    },
    {
        id: 13, models: models18, stereo: false, type: 'usb', number: '6', xAirId: 6,
    },
    {
        id: 14, models: models18, stereo: false, type: 'usb', number: '7', xAirId: 7,
    },
    {
        id: 15, models: models18, stereo: false, type: 'usb', number: '8', xAirId: 8,
    },
    {
        id: 16, models: models18, stereo: false, type: 'usb', number: '9', xAirId: 9,
    },
    {
        id: 17, models: models18, stereo: false, type: 'usb', number: '10', xAirId: 10,
    },
    {
        id: 18, models: models18, stereo: false, type: 'usb', number: '11', xAirId: 11,
    },
    {
        id: 19, models: models18, stereo: false, type: 'usb', number: '12', xAirId: 12,
    },
    {
        id: 20, models: models18, stereo: false, type: 'usb', number: '13', xAirId: 13,
    },
    {
        id: 21, models: models18, stereo: false, type: 'usb', number: '14', xAirId: 14,
    },
    {
        id: 22, models: models18, stereo: false, type: 'usb', number: '15', xAirId: 15,
    },
    {
        id: 23, models: models18, stereo: false, type: 'usb', number: '16', xAirId: 16,
    },
    {
        id: 24, models: models18, stereo: false, type: 'usb', number: '17', xAirId: 17,
    },
    {
        id: 25, models: models18, stereo: false, type: 'usb', number: '18', xAirId: 18,
    },
    {
        id: 26, models: models18, stereo: false, type: 'ultranet', number: '1', xAirId: 1,
    },
    {
        id: 27, models: models18, stereo: false, type: 'ultranet', number: '2', xAirId: 2,
    },
    {
        id: 28, models: models18, stereo: false, type: 'ultranet', number: '3', xAirId: 3,
    },
    {
        id: 29, models: models18, stereo: false, type: 'ultranet', number: '4', xAirId: 4,
    },
    {
        id: 30, models: models18, stereo: false, type: 'ultranet', number: '5', xAirId: 5,
    },
    {
        id: 31, models: models18, stereo: false, type: 'ultranet', number: '6', xAirId: 6,
    },
    {
        id: 32, models: models18, stereo: false, type: 'ultranet', number: '7', xAirId: 7,
    },
    {
        id: 33, models: models18, stereo: false, type: 'ultranet', number: '8', xAirId: 8,
    },
    {
        id: 34, models: models18, stereo: false, type: 'ultranet', number: '9', xAirId: 9,
    },
    {
        id: 35, models: models18, stereo: false, type: 'ultranet', number: '10', xAirId: 10,
    },
    {
        id: 36, models: models18, stereo: false, type: 'ultranet', number: '11', xAirId: 11,
    },
    {
        id: 37, models: models18, stereo: false, type: 'ultranet', number: '12', xAirId: 12,
    },
    {
        id: 38, models: models18, stereo: false, type: 'ultranet', number: '13', xAirId: 13,
    },
    {
        id: 39, models: models18, stereo: false, type: 'ultranet', number: '14', xAirId: 14,
    },
    {
        id: 40, models: models18, stereo: false, type: 'ultranet', number: '15', xAirId: 15,
    },
    {
        id: 41, models: models18, stereo: false, type: 'ultranet', number: '16', xAirId: 16,
    },
    // 16
    {
        id: 42, models: models16, stereo: true, type: 'main', number: '', xAirId: 1,
    },
    {
        id: 43, models: models16, stereo: true, type: 'phones', number: '', xAirId: 2,
    },
    {
        id: 44, models: models16, stereo: false, type: 'analog', number: '1', xAirId: 1,
    },
    {
        id: 45, models: models16, stereo: false, type: 'analog', number: '2', xAirId: 2,
    },
    {
        id: 46, models: models16, stereo: false, type: 'analog', number: '3', xAirId: 3,
    },
    {
        id: 47, models: models16, stereo: false, type: 'analog', number: '4', xAirId: 4,
    },
    // 12
    {
        id: 48, models: models12, stereo: true, type: 'main', number: '', xAirId: 1,
    },
    {
        id: 49, models: models12, stereo: true, type: 'phones', number: '', xAirId: 2,
    },
    {
        id: 50, models: models12, stereo: false, type: 'analog', number: '1', xAirId: 1,
    },
    {
        id: 51, models: models12, stereo: false, type: 'analog', number: '2', xAirId: 2,
    },
];


// Exported
export const optionsForModel = model => allOptions
    .filter(option => option.models.includes(model));


export const outputGet = (outputId) => {
    if (!allOptions[outputId]) throw new Error('Unknown output');
    return allOptions[outputId];
};


export const outputOsc = (outputId) => {
    const output = outputGet(outputId);
    return `/routing/${oscPrefixPerType[output.type]}/${pad(output.xAirId)}/`;
};
