// Requirements
import { scaleLinear, scaleLog } from 'd3';
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { ONE, xAirSubscriptionBuild } from '../../shared.js';
import { busOsc, busIsOfType, busIdToMetersZeroId } from './options.js';


// Constants
const modeOptions = [
    { id: 0, name: 'Compressor' },
    { id: 1, name: 'Expander' },
];

const KNEE_MINIMUM = 0;

const KNEE_MAXIMUM = 5;

const KNEE_STEP = 1;

const THRESHOLD_MINIMUM = -60;

const THRESHOLD_MAXIMUM = 0;

const ratioOptions = [
    { id: 0, name: '1.1' },
    { id: 1, name: '1.3' },
    { id: 2, name: '1.5' },
    { id: 3, name: '2.0' },
    { id: 4, name: '2.5' },
    { id: 5, name: '3.0' },
    { id: 6, name: '4.0' },
    { id: 7, name: '5.0' },
    { id: 8, name: '7.0' },
    { id: 9, name: '10' },
    { id: 10, name: '20' },
    { id: 11, name: '100' },
];

const MIX_MINIMUM = 0;

const MIX_MAXIMUM = 100;

const GAIN_MINIMUM = 0;

const GAIN_MAXIMUM = 24;

const envelopeOptions = [
    { id: 0, name: 'Linear' },
    { id: 1, name: 'Logarithmic' },
];

const determinationOptions = [
    { id: 0, name: 'Peak' },
    { id: 1, name: 'RMS' },
];

const ATTACK_MINIMUM = 0;

const ATTACK_MAXIMUM = 120;

const HOLD_MINIMUM = 0.02;

const HOLD_MAXIMUM = 2000;

const RELEASE_MINIMUM = 5;

const RELEASE_MAXIMUM = 4000;

const sidechainSourceOptions = [
    { id: 0, name: 'Self' },
    { id: 1, name: 'Channel 1' },
    { id: 2, name: 'Channel 2' },
    { id: 3, name: 'Channel 3' },
    { id: 4, name: 'Channel 4' },
    { id: 5, name: 'Channel 5' },
    { id: 6, name: 'Channel 6' },
    { id: 7, name: 'Channel 7' },
    { id: 8, name: 'Channel 8' },
    { id: 9, name: 'Channel 9' },
    { id: 10, name: 'Channel 10' },
    { id: 11, name: 'Channel 11' },
    { id: 12, name: 'Channel 12' },
    { id: 13, name: 'Channel 13' },
    { id: 14, name: 'Channel 14' },
    { id: 15, name: 'Channel 15' },
    { id: 16, name: 'Channel 16' },
    { id: 17, name: 'Secondary 1' },
    { id: 18, name: 'Secondary 2' },
    { id: 19, name: 'Secondary 3' },
    { id: 20, name: 'Secondary 4' },
    { id: 21, name: 'Secondary 5' },
    { id: 22, name: 'Secondary 6' },
];

const sidechainTypeOptions = [
    { id: 0, name: 'Low cut 6' },
    { id: 1, name: 'Low cut 12' },
    { id: 2, name: 'High cut 6' },
    { id: 3, name: 'High cut 12' },
    { id: 4, name: 'Bell Q1' },
    { id: 5, name: 'Bell Q2' },
    { id: 6, name: 'Bell Q3' },
    { id: 7, name: 'Bell Q5' },
    { id: 8, name: 'Bell Q10' },
];

const FREQUENCY_MINIMUM = 20;

const FREQUENCY_MAXIMUM = 20000;


// Internal
const osc = busId => `${busOsc(busId)}/dyn/`;

const kneeToDecimal = scaleLinear()
    .domain([KNEE_MINIMUM, KNEE_MAXIMUM])
    .range([0, ONE]);

const decimalToKnee = kneeToDecimal.invert;

const thresholdToDecimal = scaleLinear()
    .domain([THRESHOLD_MINIMUM, THRESHOLD_MAXIMUM])
    .range([0, ONE]);

const decimalToThreshold = thresholdToDecimal.invert;

const mixToDecimal = scaleLinear()
    .domain([MIX_MINIMUM, MIX_MAXIMUM])
    .range([0, ONE]);

const decimalToMix = mixToDecimal.invert;

const gainToDecimal = scaleLinear()
    .domain([GAIN_MINIMUM, GAIN_MAXIMUM])
    .range([0, ONE]);

const decimalToGain = gainToDecimal.invert;

const attackToDecimal = scaleLinear()
    .domain([ATTACK_MINIMUM, ATTACK_MAXIMUM])
    .range([0, ONE]);

const decimalToAttack = attackToDecimal.invert;

const holdToDecimal = scaleLog()
    .domain([HOLD_MINIMUM, HOLD_MAXIMUM])
    .range([0, ONE]);

const decimalToHold = holdToDecimal.invert;

const releaseToDecimal = scaleLog()
    .domain([RELEASE_MINIMUM, RELEASE_MAXIMUM])
    .range([0, ONE]);

const decimalToRelease = releaseToDecimal.invert;

const frequencyToDecimal = scaleLog()
    .domain([FREQUENCY_MINIMUM, FREQUENCY_MAXIMUM])
    .range([0, ONE]);

const decimalToFrequency = frequencyToDecimal.invert;

const compressorHas = busId => busIsOfType(busId, 'channel', 'secondary', 'main');

const sidechainHas = busId => busIsOfType(busId, 'channel', 'secondary');


// Exported
export const compressor = ({
    read, get, set, subscribe,
}) => ({
    has: (busId, c) => { c(compressorHas(busId)); },
    on: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}on`),
        get: (busId, c) => get(`${osc(busId)}on`, c, binaryToBoolean),
        set: (busId, v) => set(`${osc(busId)}on`, v, booleanToBinary),
    },
    mode: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}mode`),
        get: (busId, c) => get(`${osc(busId)}mode`, c),
        set: (busId, v) => set(`${osc(busId)}mode`, v),
        // eslint-disable-next-line no-unused-vars
        options: busId => modeOptions,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => modeOptions[0],
    },
    knee: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}knee`),
        get: (busId, c) => get(`${osc(busId)}knee`, c, decimalToKnee),
        set: (busId, v) => set(`${osc(busId)}knee`, v, kneeToDecimal),
        minimum: KNEE_MINIMUM,
        maximum: KNEE_MAXIMUM,
        step: KNEE_STEP,
    },
    threshold: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}thr`),
        get: (busId, c) => get(`${osc(busId)}thr`, c, decimalToThreshold),
        set: (busId, v) => set(`${osc(busId)}thr`, v, thresholdToDecimal),
        minimum: THRESHOLD_MINIMUM,
        maximum: THRESHOLD_MAXIMUM,
    },
    ratio: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}ratio`),
        get: (busId, c) => get(`${osc(busId)}ratio`, c),
        set: (busId, v) => set(`${osc(busId)}ratio`, v),
        // eslint-disable-next-line no-unused-vars
        options: busId => ratioOptions,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => ratioOptions[0],
    },
    mix: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}mix`),
        get: (busId, c) => get(`${osc(busId)}mix`, c, decimalToMix),
        set: (busId, v) => set(`${osc(busId)}mix`, v, mixToDecimal),
        minimum: MIX_MINIMUM,
        maximum: MIX_MAXIMUM,
    },
    gain: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}mgain`),
        get: (busId, c) => get(`${osc(busId)}mgain`, c, decimalToGain),
        set: (busId, v) => set(`${osc(busId)}mgain`, v, gainToDecimal),
        minimum: GAIN_MINIMUM,
        maximum: GAIN_MAXIMUM,
    },
    envelope: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}env`),
        get: (busId, c) => get(`${osc(busId)}env`, c),
        set: (busId, v) => set(`${osc(busId)}env`, v),
        // eslint-disable-next-line no-unused-vars
        options: busId => envelopeOptions,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => envelopeOptions[0],
    },
    determination: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}det`),
        get: (busId, c) => get(`${osc(busId)}det`, c),
        set: (busId, v) => set(`${osc(busId)}det`, v),
        // eslint-disable-next-line no-unused-vars
        options: busId => determinationOptions,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => determinationOptions[0],
    },
    automatic: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}auto`),
        get: (busId, c) => get(`${osc(busId)}auto`, c, binaryToBoolean),
        set: (busId, v) => set(`${osc(busId)}auto`, v, booleanToBinary),
    },
    attack: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}attack`),
        get: (busId, c) => get(`${osc(busId)}attack`, c, decimalToAttack),
        set: (busId, v) => set(`${osc(busId)}attack`, v, attackToDecimal),
        minimum: ATTACK_MINIMUM,
        maximum: ATTACK_MAXIMUM,
    },
    hold: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}hold`),
        get: (busId, c) => get(`${osc(busId)}hold`, c, decimalToHold),
        set: (busId, v) => set(`${osc(busId)}hold`, v, holdToDecimal),
        minimum: HOLD_MINIMUM,
        maximum: HOLD_MAXIMUM,
    },
    release: {
        has: (busId, c) => { c(compressorHas(busId)); },
        read: busId => read(`${osc(busId)}release`),
        get: (busId, c) => get(`${osc(busId)}release`, c, decimalToRelease),
        set: (busId, v) => set(`${osc(busId)}release`, v, releaseToDecimal),
        minimum: RELEASE_MINIMUM,
        maximum: RELEASE_MAXIMUM,
    },
    sidechain: {
        has: (busId, c) => { c(sidechainHas(busId)); },
        on: {
            has: (busId, c) => { c(sidechainHas(busId)); },
            read: busId => read(`${osc(busId)}filter/on`),
            get: (busId, c) => get(`${osc(busId)}filter/on`, c, binaryToBoolean),
            set: (busId, v) => set(`${osc(busId)}filter/on`, v, booleanToBinary),
        },
        source: {
            has: (busId, c) => { c(sidechainHas(busId)); },
            read: busId => read(`${osc(busId)}keysrc`),
            get: (busId, c) => get(`${osc(busId)}keysrc`, c),
            set: (busId, v) => set(`${osc(busId)}keysrc`, v),
            // eslint-disable-next-line no-unused-vars
            options: busId => sidechainSourceOptions,
            // eslint-disable-next-line no-unused-vars
            defaultOption: busId => sidechainSourceOptions[0],
        },
        type: {
            has: (busId, c) => { c(sidechainHas(busId)); },
            read: busId => read(`${osc(busId)}filter/type`),
            get: (busId, c) => get(`${osc(busId)}filter/type`, c),
            set: (busId, v) => set(`${osc(busId)}filter/type`, v),
            // eslint-disable-next-line no-unused-vars
            options: busId => sidechainTypeOptions,
            // eslint-disable-next-line no-unused-vars
            defaultOption: busId => sidechainTypeOptions[0],
        },
        frequency: {
            has: (busId, c) => { c(sidechainHas(busId)); },
            read: busId => read(`${osc(busId)}filter/f`),
            get: (busId, c) => get(`${osc(busId)}filter/f`, c, decimalToFrequency),
            set: (busId, v) => set(`${osc(busId)}filter/f`, v, frequencyToDecimal),
            minimum: FREQUENCY_MINIMUM,
            maximum: FREQUENCY_MAXIMUM,
        },
    },
    gainReduction: {
        has: (busId, c) => { c(compressorHas(busId)); },
        get: (busId, c) => subscribe(xAirSubscriptionBuild({
            meterId: 0,
            shortIntegersToRead: 8,
            argOne: busIdToMetersZeroId[busId],
        }), c, v => v[3]),
    },
    key: {
        has: (busId, c) => { c(compressorHas(busId)); },
        get: (busId, c) => subscribe(xAirSubscriptionBuild({
            meterId: 0,
            shortIntegersToRead: 8,
            argOne: busIdToMetersZeroId[busId],
        }), c, v => v[7]),
    },
});
