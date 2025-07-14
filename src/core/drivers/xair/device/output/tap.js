// Requirements
import { outputGet, outputOsc } from './options.js';


// Constants
const tapOptions = [
    { id: 0, name: 'Analog' },
    { id: 1, name: 'Analog + mute' },
    { id: 2, name: 'Input' },
    { id: 3, name: 'Input + mute' },
    { id: 4, name: 'Pre equalizer' },
    { id: 5, name: 'Pre equalizer + mute' },
    { id: 6, name: 'Post equalizer' },
    { id: 7, name: 'Post equalizer + mute' },
    { id: 8, name: 'Pre level' },
    { id: 9, name: 'Pre level + mute' },
    { id: 10, name: 'Post level' },
];


// Exported
export const tap = ({ read, get, set }) => ({
    has: (outputId, c) => { c(['usb', 'ultranet', 'analog'].includes(outputGet(outputId).type)); },
    read: outputId => read(`${outputOsc(outputId)}pos`),
    get: (outputId, c) => get(`${outputOsc(outputId)}pos`, c),
    set: (outputId, v) => set(`${outputOsc(outputId)}pos`, v),
    // eslint-disable-next-line no-unused-vars
    options: outputId => tapOptions,
    // eslint-disable-next-line no-unused-vars
    defaultOption: outputId => tapOptions[3],
});
