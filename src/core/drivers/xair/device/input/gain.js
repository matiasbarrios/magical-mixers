// Requirements
import { scaleLinear } from 'd3';
import { ONE, xAirSubscriptionBuild } from '../../shared.js';
import { inputIsPreamp, inputOsc, inputGet } from './options.js';


// Constants
const GAIN_MINIMUM_INPUT = -12;

const GAIN_MAXIMUM_INPUT = 60;

const GAIN_MINIMUM_LINE = -12;

const GAIN_MAXIMUM_LINE = 20;

const postInputIdToBytePosition = {
    // No usb inputs, they are shown in usb trim post
    // 18
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
    '16': 16,
    '17': 17,
    '36': [16, 17],
    // 16
    '46': 0,
    '47': 1,
    '48': 2,
    '49': 3,
    '50': 4,
    '51': 5,
    '52': 6,
    '53': 7,
    '54': 8,
    '55': 9,
    '56': 10,
    '57': 11,
    '58': 12,
    '59': 13,
    '60': 14,
    '61': 15,
    // 12
    '64': 0,
    '65': 1,
    '66': 2,
    '67': 3,
    '68': 4,
    '69': 5,
    '70': 6,
    '71': 7,
    '72': 8,
    '73': 9,
    '74': 10,
    '75': 11,

};


// Internal
const gainToDecimalInput = scaleLinear()
    .domain([GAIN_MINIMUM_INPUT, GAIN_MAXIMUM_INPUT]).range([0, ONE]);

const decimalToGainInput = gainToDecimalInput.invert;

const gainToDecimalLine = scaleLinear()
    .domain([GAIN_MINIMUM_LINE, GAIN_MAXIMUM_LINE]).range([0, ONE]);

const decimalToGainLine = gainToDecimalLine.invert;

const gainScaleForGet = inputId => (inputIsPreamp(inputId)
    ? decimalToGainInput : decimalToGainLine);

const gainScaleForSet = inputId => (inputIsPreamp(inputId)
    ? gainToDecimalInput : gainToDecimalLine);

const gainMinimum = inputId => (inputIsPreamp(inputId) ? GAIN_MINIMUM_INPUT : GAIN_MINIMUM_LINE);

const gainMaximum = inputId => (inputIsPreamp(inputId) ? GAIN_MAXIMUM_INPUT : GAIN_MAXIMUM_LINE);

const postValueGet = (inputId) => {
    if (!inputGet(inputId).stereo) return v => v[postInputIdToBytePosition[inputId]];
    return v => [
        v[postInputIdToBytePosition[inputId][0]],
        v[postInputIdToBytePosition[inputId][1]],
    ];
};

const gainHas = inputId => ['preamp', 'line'].includes(inputGet(inputId).type);


const inputPostSubscription = subscribe => (inputId, c) => subscribe(xAirSubscriptionBuild({
    meterId: 2,
    shortIntegersToRead: 36,
}), c, postValueGet(inputId));


const gainOsc = (inputId) => {
    // In model 18, that has line, they all have the same gain
    if (inputId === 17 || inputId === 36) return `${inputOsc(16)}gain`;
    return `${inputOsc(inputId)}gain`;
};


// Exported
export { inputPostSubscription };


export const gain = ({
    read, get, set, subscribe,
}) => ({
    has: (inputId, c) => { c(gainHas(inputId)); },
    read: inputId => read(gainOsc(inputId)),
    get: (inputId, c) => get(gainOsc(inputId), c, gainScaleForGet(inputId)),
    set: (inputId, v) => set(gainOsc(inputId), v, gainScaleForSet(inputId)),
    minimum: gainMinimum,
    maximum: gainMaximum,
    defaultValue: 0,
    post: {
        has: (inputId, c) => { c(gainHas(inputId)); },
        get: inputPostSubscription(subscribe),
    },
});
