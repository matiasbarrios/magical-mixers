// Requirements
import { sceneOsc } from './options.js';


// Constants
const options = [
    {
        id: 0, category: 'bus', subcategory: '', type: 'channel', number: '1',
    },
    {
        id: 1, category: 'bus', subcategory: '', type: 'channel', number: '2',
    },
    {
        id: 2, category: 'bus', subcategory: '', type: 'channel', number: '3',
    },
    {
        id: 3, category: 'bus', subcategory: '', type: 'channel', number: '4',
    },
    {
        id: 4, category: 'bus', subcategory: '', type: 'channel', number: '5',
    },
    {
        id: 5, category: 'bus', subcategory: '', type: 'channel', number: '6',
    },
    {
        id: 6, category: 'bus', subcategory: '', type: 'channel', number: '7',
    },
    {
        id: 7, category: 'bus', subcategory: '', type: 'channel', number: '8',
    },
    {
        id: 8, category: 'bus', subcategory: '', type: 'channel', number: '9',
    },
    {
        id: 9, category: 'bus', subcategory: '', type: 'channel', number: '10',
    },
    {
        id: 10, category: 'bus', subcategory: '', type: 'channel', number: '11',
    },
    {
        id: 11, category: 'bus', subcategory: '', type: 'channel', number: '12',
    },
    {
        id: 12, category: 'bus', subcategory: '', type: 'channel', number: '13',
    },
    {
        id: 13, category: 'bus', subcategory: '', type: 'channel', number: '14',
    },
    {
        id: 14, category: 'bus', subcategory: '', type: 'channel', number: '15',
    },
    {
        id: 15, category: 'bus', subcategory: '', type: 'channel', number: '16',
    },
    {
        id: 16, category: 'bus', subcategory: '', type: 'line', number: '17/18',
    },
    {
        id: 17, category: 'bus', subcategory: '', type: 'effect', number: '1',
    },
    {
        id: 18, category: 'bus', subcategory: '', type: 'effect', number: '2',
    },
    {
        id: 19, category: 'bus', subcategory: '', type: 'effect', number: '3',
    },
    {
        id: 20, category: 'bus', subcategory: '', type: 'effect', number: '4',
    },
    {
        id: 21, category: 'bus', subcategory: '', type: 'secondary', number: '1',
    },
    {
        id: 22, category: 'bus', subcategory: '', type: 'secondary', number: '2',
    },
    {
        id: 23, category: 'bus', subcategory: '', type: 'secondary', number: '3',
    },
    {
        id: 24, category: 'bus', subcategory: '', type: 'secondary', number: '4',
    },
    {
        id: 25, category: 'bus', subcategory: '', type: 'secondary', number: '5',
    },
    {
        id: 26, category: 'bus', subcategory: '', type: 'secondary', number: '6',
    },
    {
        id: 27, category: 'bus', subcategory: '', type: 'effect', number: '1',
    },
    {
        id: 28, category: 'bus', subcategory: '', type: 'effect', number: '2',
    },
    {
        id: 29, category: 'bus', subcategory: '', type: 'effect', number: '3',
    },
    {
        id: 30, category: 'bus', subcategory: '', type: 'effect', number: '4',
    },
    {
        id: 31, category: 'bus', subcategory: '', type: 'main', number: '',
    },
    {
        id: 32, category: 'parameter', subcategory: 'source', type: '', number: '',
    },
    {
        id: 33, category: 'parameter', subcategory: 'input', type: '', number: '',
    },
    {
        id: 34, category: 'parameter', subcategory: 'configuration', type: '', number: '',
    },
    {
        id: 35, category: 'parameter', subcategory: 'equalization', type: '', number: '',
    },
    {
        id: 36, category: 'parameter', subcategory: 'dynamics', type: '', number: '',
    },
    {
        id: 37, category: 'parameter', subcategory: 'level & pan', type: '', number: '',
    },
    {
        id: 38, category: 'parameter', subcategory: 'mute', type: '', number: '',
    },
    {
        id: 39, category: 'parameter', subcategory: 'sends', type: 'secondary', number: '1',
    },
    {
        id: 40, category: 'parameter', subcategory: 'sends', type: 'secondary', number: '2',
    },
    {
        id: 41, category: 'parameter', subcategory: 'sends', type: 'secondary', number: '3',
    },
    {
        id: 42, category: 'parameter', subcategory: 'sends', type: 'secondary', number: '4',
    },
    {
        id: 43, category: 'parameter', subcategory: 'sends', type: 'secondary', number: '5',
    },
    {
        id: 44, category: 'parameter', subcategory: 'sends', type: 'secondary', number: '6',
    },
    {
        id: 45, category: 'parameter', subcategory: 'sends', type: 'effect', number: '1',
    },
    {
        id: 46, category: 'parameter', subcategory: 'sends', type: 'effect', number: '2',
    },
    {
        id: 47, category: 'parameter', subcategory: 'sends', type: 'effect', number: '3',
    },
    {
        id: 48, category: 'parameter', subcategory: 'sends', type: 'effect', number: '4',
    },
    {
        id: 49, category: 'global', subcategory: 'in / out', type: '', number: '',
    },
    {
        id: 50, category: 'global', subcategory: 'configuration', type: '', number: '',
    },
    {
        id: 51, category: 'global', subcategory: '', type: 'dca', number: '1',
    },
    {
        id: 52, category: 'global', subcategory: '', type: 'dca', number: '2',
    },
    {
        id: 53, category: 'global', subcategory: '', type: 'dca', number: '3',
    },
    {
        id: 54, category: 'global', subcategory: '', type: 'dca', number: '4',
    },
    {
        id: 55, category: 'global', subcategory: '', type: 'fx', number: '1',
    },
    {
        id: 56, category: 'global', subcategory: '', type: 'fx', number: '2',
    },
    {
        id: 57, category: 'global', subcategory: '', type: 'fx', number: '3',
    },
    {
        id: 58, category: 'global', subcategory: '', type: 'fx', number: '4',
    },
];


// Internal
const valueRead = scopeId => (v) => {
    if (typeof v !== 'string') return undefined;
    return v.charAt(scopeId) === '+';
};


const valueSet = (scopeId, readValue) => (value) => {
    let v = readValue();
    if (typeof v !== 'string') v = Array(options.length).fill('+').join('');
    v = v.split('');
    v[scopeId] = value ? '+' : '-';
    return v.join('');
};


const osc = sceneId => `${sceneOsc(sceneId)}/scope`;


// Exported
export const scope = ({ read, get, set }) => ({
    has: (sceneId, c) => { c(true); },
    on: {
        has: (sceneId, scopeId, c) => { c(true); },
        read: (sceneId, scopeId) => valueRead(scopeId)(read(osc(sceneId))),
        get: (sceneId, scopeId, c) => get(osc(sceneId), v => c(valueRead(scopeId)(v))),
        set: (sceneId, scopeId, v) => set(osc(sceneId), v, valueSet(scopeId,
            () => read(osc(sceneId)))),
    },
    // eslint-disable-next-line no-unused-vars
    options: sceneId => options,
});
