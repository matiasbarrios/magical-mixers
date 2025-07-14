// Requirements
import { busIsOfType, busOsc } from './options.js';


// Constants
const options = [
    { id: 0, name: 'none' },
    { id: 1, name: 'red' },
    { id: 2, name: 'green' },
    { id: 3, name: 'yellow' },
    { id: 4, name: 'blue' },
    { id: 5, name: 'magenta' },
    { id: 6, name: 'cyan' },
    { id: 7, name: 'white' },
    { id: 8, name: 'gray' },
    { id: 9, name: 'red border' },
    { id: 10, name: 'green border' },
    { id: 11, name: 'yellow border' },
    { id: 12, name: 'blue border' },
    { id: 13, name: 'magenta border' },
    { id: 14, name: 'cyan border' },
    { id: 15, name: 'white border' },
];


// Internal
const osc = busId => `${busOsc(busId)}/config/color`;


// Exported
export const color = ({ read, get, set }) => ({
    has: (busId, c) => { c(!busIsOfType(busId, 'monitor')); },
    read: busId => read(osc(busId)),
    get: (busId, c) => get(osc(busId), c),
    set: (busId, v) => set(osc(busId), v),
    // eslint-disable-next-line no-unused-vars
    options: busId => options,
    // eslint-disable-next-line no-unused-vars
    defaultOption: busId => options[0],
});


export { options };
