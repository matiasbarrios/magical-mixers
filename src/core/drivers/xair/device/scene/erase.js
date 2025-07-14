// Requirements
import { sceneGet } from './options.js';


// Internal
const osc = '/-snap/delete';


// Exported
export const erase = ({ set }) => ({
    erase: sceneId => set(osc, parseInt(sceneGet(sceneId).number, 10)),
});
