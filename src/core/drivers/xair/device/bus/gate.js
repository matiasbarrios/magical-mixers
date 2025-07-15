// Requirements
import { scaleLinear, scaleLog } from 'd3-scale';
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { ONE, xAirSubscriptionBuild } from '../../shared.js';
import { busOsc, busIsOfType, busIdToMetersZeroId } from './options.js';


// Constants
const modeOptions = [
    { id: 0, name: 'Exp 2:1' },
    { id: 1, name: 'Exp 3:1' },
    { id: 2, name: 'Exp 4:1' },
    { id: 3, name: 'Gate' },
    { id: 4, name: 'Ducker' },
];

const THRESHOLD_MINIMUM = -80;

const THRESHOLD_MAXIMUM = 0;

const RANGE_MINIMUM = 3;

const RANGE_MAXIMUM = 60;

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
const osc = busId => `${busOsc(busId)}/gate/`;

const thresholdToDecimal = scaleLinear()
    .domain([THRESHOLD_MINIMUM, THRESHOLD_MAXIMUM])
    .range([0, ONE]);

const decimalToThreshold = thresholdToDecimal.invert;

const rangeToDecimal = scaleLinear()
    .domain([RANGE_MINIMUM, RANGE_MAXIMUM])
    .range([0, ONE]);

const decimalToRange = rangeToDecimal.invert;

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

const gateHas = busId => busIsOfType(busId, 'channel');


// Exported
export const gate = ({
    read, get, set, subscribe,
}) => ({
    has: (busId, c) => { c(gateHas(busId)); },
    on: {
        has: (busId, c) => { c(gateHas(busId)); },
        read: busId => read(`${osc(busId)}on`),
        get: (busId, c) => get(`${osc(busId)}on`, c, binaryToBoolean),
        set: (busId, v) => set(`${osc(busId)}on`, v, booleanToBinary),
    },
    mode: {
        has: (busId, c) => { c(gateHas(busId)); },
        read: busId => read(`${osc(busId)}mode`),
        get: (busId, c) => get(`${osc(busId)}mode`, c),
        set: (busId, v) => set(`${osc(busId)}mode`, v),
        // eslint-disable-next-line no-unused-vars
        options: busId => modeOptions,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => modeOptions[0],
    },
    threshold: {
        has: (busId, c) => { c(gateHas(busId)); },
        read: busId => read(`${osc(busId)}thr`),
        get: (busId, c) => get(`${osc(busId)}thr`, c, decimalToThreshold),
        set: (busId, v) => set(`${osc(busId)}thr`, v, thresholdToDecimal),
        minimum: THRESHOLD_MINIMUM,
        maximum: THRESHOLD_MAXIMUM,
    },
    range: {
        has: (busId, c) => { c(gateHas(busId)); },
        read: busId => read(`${osc(busId)}range`),
        get: (busId, c) => get(`${osc(busId)}range`, c, decimalToRange),
        set: (busId, v) => set(`${osc(busId)}range`, v, rangeToDecimal),
        minimum: RANGE_MINIMUM,
        maximum: RANGE_MAXIMUM,
    },
    attack: {
        has: (busId, c) => { c(gateHas(busId)); },
        read: busId => read(`${osc(busId)}attack`),
        get: (busId, c) => get(`${osc(busId)}attack`, c, decimalToAttack),
        set: (busId, v) => set(`${osc(busId)}attack`, v, attackToDecimal),
        minimum: ATTACK_MINIMUM,
        maximum: ATTACK_MAXIMUM,
    },
    hold: {
        has: (busId, c) => { c(gateHas(busId)); },
        read: busId => read(`${osc(busId)}hold`),
        get: (busId, c) => get(`${osc(busId)}hold`, c, decimalToHold),
        set: (busId, v) => set(`${osc(busId)}hold`, v, holdToDecimal),
        minimum: HOLD_MINIMUM,
        maximum: HOLD_MAXIMUM,
    },
    release: {
        has: (busId, c) => { c(gateHas(busId)); },
        read: busId => read(`${osc(busId)}release`),
        get: (busId, c) => get(`${osc(busId)}release`, c, decimalToRelease),
        set: (busId, v) => set(`${osc(busId)}release`, v, releaseToDecimal),
        minimum: RELEASE_MINIMUM,
        maximum: RELEASE_MAXIMUM,
    },
    sidechain: {
        has: (busId, c) => { c(gateHas(busId)); },
        on: {
            has: (busId, c) => { c(gateHas(busId)); },
            read: busId => read(`${osc(busId)}filter/on`),
            get: (busId, c) => get(`${osc(busId)}filter/on`, c, binaryToBoolean),
            set: (busId, v) => set(`${osc(busId)}filter/on`, v, booleanToBinary),
        },
        source: {
            has: (busId, c) => { c(gateHas(busId)); },
            read: busId => read(`${osc(busId)}keysrc`),
            get: (busId, c) => get(`${osc(busId)}keysrc`, c),
            set: (busId, v) => set(`${osc(busId)}keysrc`, v),
            // eslint-disable-next-line no-unused-vars
            options: busId => sidechainSourceOptions,
            // eslint-disable-next-line no-unused-vars
            defaultOption: busId => sidechainSourceOptions[0],
        },
        type: {
            has: (busId, c) => { c(gateHas(busId)); },
            read: busId => read(`${osc(busId)}filter/type`),
            get: (busId, c) => get(`${osc(busId)}filter/type`, c),
            set: (busId, v) => set(`${osc(busId)}filter/type`, v),
            // eslint-disable-next-line no-unused-vars
            options: busId => sidechainTypeOptions,
            // eslint-disable-next-line no-unused-vars
            defaultOption: busId => sidechainTypeOptions[0],
        },
        frequency: {
            has: (busId, c) => { c(gateHas(busId)); },
            read: busId => read(`${osc(busId)}filter/f`),
            get: (busId, c) => get(`${osc(busId)}filter/f`, c, decimalToFrequency),
            set: (busId, v) => set(`${osc(busId)}filter/f`, v, frequencyToDecimal),
            minimum: FREQUENCY_MINIMUM,
            maximum: FREQUENCY_MAXIMUM,
        },
    },
    gainReduction: {
        has: (busId, c) => { c(gateHas(busId)); },
        get: (busId, c) => subscribe(xAirSubscriptionBuild({
            meterId: 0,
            shortIntegersToRead: 8,
            argOne: busIdToMetersZeroId[busId],
        }), c, v => v[2]),
    },
    key: {
        has: (busId, c) => { c(gateHas(busId)); },
        get: (busId, c) => subscribe(xAirSubscriptionBuild({
            meterId: 0,
            shortIntegersToRead: 8,
            argOne: busIdToMetersZeroId[busId],
        }), c, v => v[6]),
    },
});
