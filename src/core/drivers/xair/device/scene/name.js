// Requirements
import { sceneOsc } from './options.js';


// Internal
const osc = sceneId => `${sceneOsc(sceneId)}/name`;


// Exported
export const name = ({ read, get, set }) => ({
    has: (sceneId, c) => { c(true); },
    read: sceneId => read(osc(sceneId)),
    get: (sceneId, c) => get(osc(sceneId), c),
    set: (sceneId, v) => set(osc(sceneId), v),
});
