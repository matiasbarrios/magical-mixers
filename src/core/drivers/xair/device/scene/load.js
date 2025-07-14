// Requirements
import { sceneGet } from './options.js';


// Internal
const osc = '/-snap/load';


// Exported
export const load = ({ set }) => ({
    load: sceneId => set(osc, parseInt(sceneGet(sceneId).number, 10)),
});
