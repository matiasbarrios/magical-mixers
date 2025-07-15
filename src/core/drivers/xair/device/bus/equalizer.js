// Requirements
import { scaleLog, scaleLinear } from 'd3-scale';
import { binaryToBoolean, booleanToBinary, dbAbsoluteMinimum } from '../../../../helpers/values.js';
import { ONE, xAirSubscriptionBuild } from '../../shared.js';
import { inputPostSubscription } from '../input/gain.js';
import { busOsc, busGet, busIsOfType } from './options.js';
import { busInputIdGet, busInputIdHas } from './input.js';


// Constants
const modeOptions = [
    { id: 0, name: 'Parametric' },
    { id: 1, name: 'Graphic' },
    { id: 2, name: 'True' },
];

const highPassType = { id: 0, name: 'Low cut', preset: 'highPassXAir' };

const types = [
    highPassType,
    { id: 1, name: 'Low shelf', preset: 'lowShelfXAir' },
    { id: 2, name: 'Parametric', preset: 'parametric' },
    { id: 3, name: 'Vintage', preset: 'parametricVintage' },
    { id: 4, name: 'High shelf', preset: 'highShelfXAir' },
    { id: 5, name: 'High cut', preset: 'lowPassXAir' },
];

const lowCutParameter = {
    id: 0, name: 'Low cut', types: [highPassType],
};

const fourParameters = [
    { id: 0, name: 'Low', types },
    { id: 1, name: 'Low mid', types },
    { id: 2, name: 'High mid', types },
    { id: 3, name: 'High', types },
];

const sixParameters = [
    { id: 0, name: 'Low', types },
    { id: 1, name: 'Low 2', types },
    { id: 2, name: 'Low mid', types },
    { id: 3, name: 'High mid', types },
    { id: 4, name: 'High', types },
    { id: 5, name: 'High 2', types },
];

const parametersPerType = {
    channel: [
        lowCutParameter,
        ...fourParameters.map(f => ({ ...f, id: f.id + 1 })),
    ],
    line: fourParameters,
    effect: fourParameters,
    secondary: sixParameters,
    main: sixParameters,
};

const graphOptions = [
    { id: 0, name: '20', frequency: 20 },
    { id: 1, name: '25', frequency: 25 },
    { id: 2, name: '31.5', frequency: 31.5 },
    { id: 3, name: '40', frequency: 40 },
    { id: 4, name: '50', frequency: 50 },
    { id: 5, name: '63', frequency: 63 },
    { id: 6, name: '80', frequency: 80 },
    { id: 7, name: '100', frequency: 100 },
    { id: 8, name: '125', frequency: 125 },
    { id: 9, name: '160', frequency: 160 },
    { id: 10, name: '200', frequency: 200 },
    { id: 11, name: '250', frequency: 250 },
    { id: 12, name: '315', frequency: 315 },
    { id: 13, name: '400', frequency: 400 },
    { id: 14, name: '500', frequency: 500 },
    { id: 15, name: '630', frequency: 630 },
    { id: 16, name: '800', frequency: 800 },
    { id: 17, name: '1k', frequency: 1000 },
    { id: 18, name: '1k25', frequency: 1250 },
    { id: 19, name: '1k6', frequency: 1600 },
    { id: 20, name: '2k', frequency: 2000 },
    { id: 21, name: '2k5', frequency: 2500 },
    { id: 22, name: '3k15', frequency: 3150 },
    { id: 23, name: '4k', frequency: 4000 },
    { id: 24, name: '5k', frequency: 5000 },
    { id: 25, name: '6k3', frequency: 6300 },
    { id: 26, name: '8k', frequency: 8000 },
    { id: 27, name: '10k', frequency: 10000 },
    { id: 28, name: '12k5', frequency: 12500 },
    { id: 29, name: '16k', frequency: 16000 },
    { id: 30, name: '20k', frequency: 20000 },
];


const TYPE_RESET = 2;

const FREQUENCY_MINIMUM = 20;

const FREQUENCY_MAXIMUM = 20000;

const FREQUENCY_HPF_MAXIMUM = 400;

const Q_MINIMUM = 0.3;

const Q_MAXIMUM = 10;

const Q_RESET = 2;

const GAIN_DB_RANGE = 15;

const GAIN_RESET = 0;

const preToBytePosition = {
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
};


// Internal
const busHasHPF = busId => busIsOfType(busId, 'channel');

const eqOsc = busId => `${busOsc(busId)}/eq/`;

const preampOsc = busId => `${busOsc(busId)}/preamp/`;

const parameterOsc = (busId, parameterId) => `${eqOsc(busId)}${parameterId + (busHasHPF(busId) ? 0 : 1)}/`;

const parametersGet = type => parametersPerType[type];

const parameterGet = (busId, parameterId) => parametersGet(busGet(busId)
    .type).find(f => f.id === parameterId);

const isLowCut = (busId, parameterId) => busGet(busId).type === 'channel' && parameterId === lowCutParameter.id;

const frequencyToDecimal = scaleLog().domain([FREQUENCY_MINIMUM, FREQUENCY_MAXIMUM])
    .range([0, ONE]);

const frequencyToDecimalHPF = scaleLog().domain([FREQUENCY_MINIMUM, FREQUENCY_HPF_MAXIMUM])
    .range([0, ONE]);

const decimalToFrequency = frequencyToDecimal.invert;

const decimalToFrequencyHPF = frequencyToDecimalHPF.invert;

const qToDecimal = scaleLog().domain([Q_MAXIMUM, Q_MINIMUM]).range([0, ONE]);

const decimalToQ = qToDecimal.invert;

const gainToDecimal = scaleLinear().domain([-GAIN_DB_RANGE, GAIN_DB_RANGE]).range([0, ONE]);

const decimalToGain = gainToDecimal.invert;

const graphGet = (graphId) => {
    if (!graphOptions[graphId]) {
        console.error('Unknown graph', graphId);
        throw new Error(`Unknown graph: ${graphId}`);
    }
    return graphOptions[graphId];
};

const graphEqGainOsc = (busId, graphId) => `${busOsc(busId)}/geq/${graphGet(graphId).name}`;

const trueEqGainOsc = (busId, graphId) => `${busOsc(busId)}/geq/${graphGet(graphId).name}`;

const equalizerHas = busId => !busIsOfType(busId, 'monitor');

const modeHas = busId => busIsOfType(busId, 'main', 'secondary');

const graphicHas = busId => busIsOfType(busId, 'main', 'secondary');

const trueHas = busId => busIsOfType(busId, 'main', 'secondary');

const preHas = (busId, c) => { c(busIsOfType(busId, 'channel')); };

const postHas = (busId, c) => { c(false); };

const dynamicsPreValueGet = busId => v => v[preToBytePosition[busId]];

const preSubscription = (model, read, get, subscribe) => (busId, c) => {
    let inputIdHasValue = false;
    let inputIdValue;
    let inputPostValue;

    const inputIdHas = busInputIdHas(model);
    const inputIdGet = busInputIdGet(model, read, get);
    const inputPost = inputPostSubscription(subscribe);

    let inputIdGetUnistener;
    let inputPostUnlistener;

    const inputIdHasUnistener = inputIdHas(busId, (has) => {
        if (inputIdHasValue === has) return;
        inputIdHasValue = has;
        if (inputIdGetUnistener) inputIdGetUnistener();
        if (!has) return;
        inputIdGetUnistener = inputIdGet(busId, (inputId) => {
            if (inputIdValue === inputId) return;
            inputIdValue = inputId;
            if (inputPostUnlistener) inputPostUnlistener();
            if (inputId === undefined) return;
            inputPostUnlistener = inputPost(inputIdValue, (v) => { inputPostValue = v; });
        });
    });

    // Get the gain reduction
    const doGet = dynamicsPreValueGet(busId);
    const subscriptionUnlistener = subscribe(xAirSubscriptionBuild({
        meterId: 6,
        shortIntegersToRead: 39,
    }), c, (v) => {
        // If we havent got the input level yet, assume the minimum
        if (inputPostValue === undefined) return dbAbsoluteMinimum;
        const gateGainReductionValue = doGet(v);
        return inputPostValue + gateGainReductionValue;
    });

    return () => {
        if (inputIdHasUnistener) inputIdHasUnistener();
        if (inputIdGetUnistener) inputIdGetUnistener();
        if (inputPostUnlistener) inputPostUnlistener();
        if (subscriptionUnlistener) subscriptionUnlistener();
    };
};


// Exported
export {
    preSubscription as preEqualizerSubscription,
};


export const equalizer = ({
    read, get, set, subscribe, model,
}) => ({
    has: (busId, c) => { c(equalizerHas(busId)); },
    on: {
        has: (busId, c) => { c(equalizerHas(busId)); },
        read: busId => read(`${eqOsc(busId)}on`),
        get: (busId, c) => get(`${eqOsc(busId)}on`, c, binaryToBoolean),
        set: (busId, v) => set(`${eqOsc(busId)}on`, v, booleanToBinary),
    },
    mode: {
        has: (busId, c) => { c(modeHas(busId)); },
        read: busId => read(`${eqOsc(busId)}mode`),
        get: (busId, c) => get(`${eqOsc(busId)}mode`, c),
        set: (busId, v) => set(`${eqOsc(busId)}mode`, v),
        // eslint-disable-next-line no-unused-vars
        options: busId => modeOptions,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => modeOptions[0],
    },
    parametric: {
        has: (busId, c) => { c(equalizerHas(busId)); },
        options: busId => parametersGet(busGet(busId).type),
        on: {
            has: (busId, parameterId, c) => {
                c(equalizerHas(busId) && !!parameterGet(busId, parameterId)
                    && isLowCut(busId, parameterId));
            },
            read: busId => read(`${preampOsc(busId)}hpon`),
            get: (busId, parameterId, c) => get(`${preampOsc(busId)}hpon`, c, binaryToBoolean),
            set: (busId, parameterId, v) => set(`${preampOsc(busId)}hpon`, v, booleanToBinary),
        },
        type: {
            has: (busId, parameterId, c) => {
                c(equalizerHas(busId) && !!parameterGet(busId, parameterId));
            },
            read: (busId, parameterId) => (isLowCut(busId, parameterId)
                ? highPassType.id
                : read(`${parameterOsc(busId, parameterId)}type`)),
            get: (busId, parameterId, c) => (isLowCut(busId, parameterId)
                ? c(highPassType.id)
                : get(`${parameterOsc(busId, parameterId)}type`, c)),
            set: (busId, parameterId, v) => (isLowCut(busId, parameterId)
                ? () => {}
                : set(`${parameterOsc(busId, parameterId)}type`, v)),
            options: (busId, parameterId) => parameterGet(busId, parameterId).types,
            defaultOption: (busId, parameterId) => parameterGet(busId, parameterId)
                .types.find(t => t.id === TYPE_RESET),
        },
        frequency: {
            has: (busId, parameterId, c) => {
                c(equalizerHas(busId) && !!parameterGet(busId, parameterId));
            },
            read: (busId, parameterId) => (isLowCut(busId, parameterId)
                ? read(`${preampOsc(busId)}hpf`)
                : read(`${parameterOsc(busId, parameterId)}f`)),
            get: (busId, parameterId, c) => (isLowCut(busId, parameterId)
                ? get(`${preampOsc(busId)}hpf`, c, decimalToFrequencyHPF)
                : get(`${parameterOsc(busId, parameterId)}f`, c, decimalToFrequency)),
            set: (busId, parameterId, v) => (isLowCut(busId, parameterId)
                ? set(`${preampOsc(busId)}hpf`, v, frequencyToDecimalHPF)
                : set(`${parameterOsc(busId, parameterId)}f`, v, frequencyToDecimal)),
            minimum: () => FREQUENCY_MINIMUM,
            maximum: (busId, parameterId) => (isLowCut(busId, parameterId)
                ? FREQUENCY_HPF_MAXIMUM
                : FREQUENCY_MAXIMUM),
        },
        q: {
            has: (busId, parameterId, c) => {
                c(equalizerHas(busId) && !!parameterGet(busId, parameterId)
                    && !isLowCut(busId, parameterId));
            },
            read: (busId, parameterId) => read(`${parameterOsc(busId, parameterId)}q`),
            get: (busId, parameterId, c) => get(`${parameterOsc(busId, parameterId)}q`, c, decimalToQ),
            set: (busId, parameterId, v) => set(`${parameterOsc(busId, parameterId)}q`, v, qToDecimal),
            minimum: Q_MINIMUM,
            maximum: Q_MAXIMUM,
            defaultValue: Q_RESET,
        },
        gain: {
            has: (busId, parameterId, c) => {
                c(equalizerHas(busId) && !!parameterGet(busId, parameterId));
            },
            read: (busId, parameterId) => (isLowCut(busId, parameterId)
                ? read(`${preampOsc(busId)}hpf`)
                : read(`${parameterOsc(busId, parameterId)}g`)),
            get: (busId, parameterId, c) => {
                if (isLowCut(busId, parameterId)) {
                    c(0);
                    return () => {};
                }
                return get(`${parameterOsc(busId, parameterId)}g`, c, decimalToGain);
            },
            set: (busId, parameterId, v) => {
                if (isLowCut(busId, parameterId)) return;
                set(`${parameterOsc(busId, parameterId)}g`, v, gainToDecimal);
            },
            minimum: -GAIN_DB_RANGE,
            maximum: GAIN_DB_RANGE,
            defaultValue: GAIN_RESET,
        },
        isLowCut,
    },
    graphic: {
        has: (busId, c) => { c(graphicHas(busId)); },
        // eslint-disable-next-line no-unused-vars
        options: busId => graphOptions,
        gain: {
            has: (busId, graphId, c) => { c(graphicHas(busId) && !!graphOptions[graphId]); },
            read: (busId, graphId) => read(graphEqGainOsc(busId, graphId)),
            get: (busId, graphId, c) => get(graphEqGainOsc(busId, graphId), c, decimalToGain),
            set: (busId, graphId, v) => set(graphEqGainOsc(busId, graphId), v, gainToDecimal),
            minimum: -GAIN_DB_RANGE,
            maximum: GAIN_DB_RANGE,
            defaultValue: GAIN_RESET,
        },
    },
    true: {
        has: (busId, c) => { c(trueHas(busId)); },
        // eslint-disable-next-line no-unused-vars
        options: busId => graphOptions,
        gain: {
            has: (busId, graphId, c) => { c(trueHas(busId) && !!graphOptions[graphId]); },
            read: (busId, graphId) => read(trueEqGainOsc(busId, graphId)),
            get: (busId, graphId, c) => get(trueEqGainOsc(busId, graphId), c, decimalToGain),
            set: (busId, graphId, v) => set(trueEqGainOsc(busId, graphId), v, gainToDecimal),
            minimum: -GAIN_DB_RANGE,
            maximum: GAIN_DB_RANGE,
            defaultValue: GAIN_RESET,
        },
    },
    pre: {
        has: preHas,
        get: preSubscription(model, read, get, subscribe),
    },
    post: {
        has: postHas,
        get: (busId, c) => { c(undefined); },
    },
});

