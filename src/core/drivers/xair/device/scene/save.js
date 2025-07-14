// Requirements
import { sceneGet, sceneOsc } from './options.js';


// Exported
export const save = ({ set }) => ({
    save: (sceneId, sceneName) => {
        if (!sceneName) return;
        set('/-snap/save', parseInt(sceneGet(sceneId).number, 10));
        set(`${sceneOsc(sceneId)}/name`, sceneName);
    },
});
