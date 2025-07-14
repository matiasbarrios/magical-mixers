// Requirements
import { sceneOsc } from './options.js';


// Internal
const osc = sceneId => `${sceneOsc(sceneId)}/name`;

const translate = v => typeof v === 'string' && v.trim() !== '';


// Exported
export const active = ({ read, get }) => ({
    has: (sceneId, c) => { c(true); },
    read: sceneId => translate(read(osc(sceneId))),
    get: (sceneId, c) => get(osc(sceneId), v => c(translate(v))),
});
