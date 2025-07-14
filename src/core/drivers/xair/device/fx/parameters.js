// Requirements
import { scaleLinear, scaleLog } from 'd3';
import { ONE } from '../../shared.js';
import { fxOsc } from './options.js';
import { types } from './type/index.js';


// Variables
const scalesAvailable = {};


// Internal
const parameterHas = (typeId, parameterId) => types[typeId] !== undefined
    && types[typeId].parameters[parameterId] !== undefined;


const parameterGet = (typeId, parameterId) => types[typeId].parameters[parameterId];


const scalesGet = (typeId, parameterId) => {
    const p = parameterGet(typeId, parameterId);
    if (!p) return { normal: undefined, inverted: undefined };

    const id = `${p.type}-${p.scale || ''}-0-${ONE}-${p.minimum || ''}-${p.maximum || ''}`;

    if (scalesAvailable[id]) return scalesAvailable[id];

    scalesAvailable[id] = { normal: undefined, inverted: undefined };

    if (p.type === 'double' && p.oscType === 'fractional') {
        if (p.scale === 'linear') {
            const s = scaleLinear()
                .domain([0, ONE])
                .range([p.minimum, p.maximum]);
            scalesAvailable[id] = {
                normal: s,
                inverted: s.invert,
            };
        } else if (p.scale === 'log') {
            const s = scaleLog()
                .domain([p.minimum, p.maximum])
                .range([0, ONE]);
            scalesAvailable[id] = {
                normal: s.invert,
                inverted: s,
            };
        }
    } else if (p.type === 'boolean') {
        scalesAvailable[id] = {
            normal: v => v === 1,
            inverted: v => (v ? 1 : 0),
        };
    } else if (p.type === 'select') {
        scalesAvailable[id] = {
            normal: v => v,
            inverted: v => v,
        };
    }

    return scalesAvailable[id];
};


const osc = (fxId, typeId, parameterId) => {
    const p = parameterGet(typeId, parameterId);
    if (!p) return ''; // If no address, nothing is done in udpOsc
    return `${fxOsc(fxId)}par/${p.number}`;
};


const cacheKey = (fxId, typeId, parameterId) => `fxpar-${fxId}-${typeId}-${parameterId}`;


// Exported
export const parameters = ({ read, get, set }) => ({
    has: (fxId, typeId, c) => { c(!!types[typeId]); },
    options: (fxId, typeId) => types[typeId].parameters,
    parameter: {
        has: (fxId, typeId, parameterId, c) => {
            c(parameterHas(typeId, parameterId));
        },
        read: (fxId, typeId, parameterId) => read(osc(fxId, typeId, parameterId),
            cacheKey(fxId, typeId, parameterId)),
        get: (fxId, typeId, parameterId, c) => get(osc(fxId, typeId, parameterId),
            c,
            scalesGet(typeId, parameterId).normal,
            cacheKey(fxId, typeId, parameterId)),
        set: (fxId, typeId, parameterId, v) => set(
            osc(fxId, typeId, parameterId),
            v,
            scalesGet(typeId, parameterId).inverted,
            undefined,
            cacheKey(fxId, typeId, parameterId)
        ),
    },
});
