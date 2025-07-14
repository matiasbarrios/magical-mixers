// Requirements
import { pad } from '../../../../helpers/values.js';

// Exported
export const options = [
    ...Array.from({ length: 64 }, (_, i) => ({
        id: i,
        number: (i + 1).toString(),
    })),
];


export const sceneGet = (sceneId) => {
    if (!options[sceneId]) {
        console.error('Unknown scene', sceneId);
        throw new Error(`Unknown scene: ${sceneId}`);
    }
    return options[sceneId];
};


export const sceneOsc = (sceneId) => {
    const { number } = sceneGet(sceneId);
    return `/-snap/${pad(number)}`;
};
