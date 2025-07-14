// Requirements
import { scaleLinear } from 'd3';
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { ONE } from '../../shared.js';
import { busIsOfType, busOsc } from './options.js';


// Constants
const tapOptions = [
    { id: 0, name: 'Pre level' },
    { id: 1, name: 'Post level' },
];

const sourceIdBusReceptionOnly = { id: 0, name: 'Bus reception only' };

const sourceIdOptions = [
    sourceIdBusReceptionOnly,
    { id: 1, name: 'Bus reception + main' },
    { id: 2, name: 'Bus reception + main pre level' },
    { id: 3, name: 'Bus reception + main post level' },
    { id: 4, name: 'Bus reception + line 17/18' },
    { id: 5, name: 'Bus reception + usb 17/18' },
    { id: 6, name: 'Bus reception + secondary 1' },
    { id: 7, name: 'Bus reception + secondary 2' },
    { id: 8, name: 'Bus reception + secondary 3' },
    { id: 9, name: 'Bus reception + secondary 4' },
    { id: 10, name: 'Bus reception + secondary 5' },
    { id: 11, name: 'Bus reception + secondary 6' },
    { id: 12, name: 'Bus reception + secondary 1/2' },
    { id: 13, name: 'Bus reception + secondary 3/4' },
    { id: 14, name: 'Bus reception + secondary 5/6' },
];

const TRIM_MINIMUM = -18;

const TRIM_MAXIMUM = 18;

const DIM_ATTENUATION_MINIMUM = -40;

const DIM_ATTENUATION_MAXIMUM = 0;


// Internal
const osc = busId => `${busOsc(busId)}/`;

const oscChannelLineEffectTap = busId => `${osc(busId)}chmode`;

const oscSecondaryTap = busId => `${osc(busId)}busmode`;


const trimToDecimal = scaleLinear().domain([TRIM_MINIMUM, TRIM_MAXIMUM]).range([0, ONE]);


const decimalToTrim = trimToDecimal.invert;


const dimAttenuationToDecimal = scaleLinear()
    .domain([DIM_ATTENUATION_MINIMUM, DIM_ATTENUATION_MAXIMUM])
    .range([0, ONE]);


const decimalToDimAttenuation = dimAttenuationToDecimal.invert;


const monitorHas = busId => busIsOfType(busId, 'monitor');


const channelLineEffectTapGet = get => (busId, c) => get(oscChannelLineEffectTap(busId), c);


const secondaryTapGet = get => (busId, c) => get(oscSecondaryTap(busId), c);


// Exported
export {
    channelLineEffectTapGet as monitorChannelLineEffectTapGet,
    secondaryTapGet as monitorSecondaryTapGet,
};


export const monitorChannelLineEffectTapIsPostLevel = (read,
    busId) => read(oscChannelLineEffectTap(busId)) === tapOptions[1].id;


export const monitorSecondaryTapIsPostLevel = (read,
    busId) => read(oscSecondaryTap(busId)) === tapOptions[1].id;


export const monitor = ({ read, get, set }) => ({
    has: (busId, c) => { c(monitorHas(busId)); },
    mono: {
        has: (busId, c) => { c(monitorHas(busId)); },
        read: busId => read(`${osc(busId)}mono`),
        get: (busId, c) => get(`${osc(busId)}mono`, c, binaryToBoolean),
        set: (busId, v) => set(`${osc(busId)}mono`, v, booleanToBinary),
    },
    channelLineEffectTap: {
        has: (busId, c) => { c(monitorHas(busId)); },
        read: busId => read(oscChannelLineEffectTap(busId)),
        get: channelLineEffectTapGet(get),
        set: (busId, v) => set(oscChannelLineEffectTap(busId), v),
        // eslint-disable-next-line no-unused-vars
        options: busId => tapOptions,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => tapOptions[0],
    },
    secondaryTap: {
        has: (busId, c) => { c(monitorHas(busId)); },
        read: busId => read(oscSecondaryTap(busId)),
        get: secondaryTapGet(get),
        set: (busId, v) => set(oscSecondaryTap(busId), v),
        // eslint-disable-next-line no-unused-vars
        options: busId => tapOptions,
        // eslint-disable-next-line no-unused-vars
        defaultOption: busId => tapOptions[0],
    },
    source: {
        has: (busId, c) => { c(monitorHas(busId)); },
        id: {
            has: (busId, c) => { c(monitorHas(busId)); },
            read: busId => read(`${osc(busId)}source`),
            get: (busId, c) => get(`${osc(busId)}source`, c),
            set: (busId, v) => set(`${osc(busId)}source`, v),
            // eslint-disable-next-line no-unused-vars
            options: busId => sourceIdOptions,
            // eslint-disable-next-line no-unused-vars
            defaultOption: busId => sourceIdOptions[3],
        },
        trim: {
            has: (busId, c) => {
                if (!monitorHas(busId)) {
                    c(false);
                    return undefined;
                }
                return get(`${osc(busId)}source`, () => {
                    c(read(`${osc(busId)}source`) !== sourceIdBusReceptionOnly.id);
                });
            },
            read: busId => read(`${osc(busId)}sourcetrim`),
            get: (busId, c) => get(`${osc(busId)}sourcetrim`, c, decimalToTrim),
            set: (busId, v) => set(`${osc(busId)}sourcetrim`, v, trimToDecimal),
            minimum: TRIM_MINIMUM,
            maximum: TRIM_MAXIMUM,
            defaultValue: 0,
        },
    },
    dim: {
        has: (busId, c) => { c(monitorHas(busId)); },
        on: {
            has: (busId, c) => { c(monitorHas(busId)); },
            read: busId => read(`${osc(busId)}dim`),
            get: (busId, c) => get(`${osc(busId)}dim`, c, binaryToBoolean),
            set: (busId, v) => set(`${osc(busId)}dim`, v, booleanToBinary),
        },
        attenuation: {
            has: (busId, c) => { c(monitorHas(busId)); },
            read: busId => read(`${osc(busId)}dimatt`),
            get: (busId, c) => get(`${osc(busId)}dimatt`, c, decimalToDimAttenuation),
            set: (busId, v) => set(`${osc(busId)}dimatt`, v, dimAttenuationToDecimal),
            minimum: DIM_ATTENUATION_MINIMUM,
            maximum: DIM_ATTENUATION_MAXIMUM,
        },
        atPreLevel: {
            has: (busId, c) => { c(monitorHas(busId)); },
            read: busId => read(`${osc(busId)}dimpfl`),
            get: (busId, c) => get(`${osc(busId)}dimpfl`, c, binaryToBoolean),
            set: (busId, v) => set(`${osc(busId)}dimpfl`, v, booleanToBinary),
        },
    },
});
