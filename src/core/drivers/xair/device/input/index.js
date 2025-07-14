// Requirements
import { optionsForModel } from './options.js';
import { name } from './name.js';
import { gain } from './gain.js';
import { phantom } from './phantom.js';


// Exported
export const input = ({
    read, get, set, subscribe, model,
}) => ({
    has: (c) => { c(true); },
    options: optionsForModel(model),
    name: name({ read, get, set }),
    gain: gain({
        read, get, set, subscribe,
    }),
    phantom: phantom({ read, get, set }),
});
