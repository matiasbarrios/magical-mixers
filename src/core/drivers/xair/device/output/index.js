// Requirements
import { optionsForModel } from './options.js';
import { name } from './name.js';
import { source } from './source.js';
import { tap } from './tap.js';
import { volume } from './volume.js';


// Exported
export const output = ({
    read, get, set, subscribe, model,
}) => ({
    has: (c) => { c(true); },
    options: optionsForModel(model),
    name: name({ read, get, set }),
    source: source({
        read, get, set, model,
    }),
    tap: tap({ read, get, set }),
    volume: volume({ subscribe }),
});
