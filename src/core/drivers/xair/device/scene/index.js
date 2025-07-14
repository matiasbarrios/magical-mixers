// Requirements
import { name } from './name.js';
import { scope } from './scope.js';
import { active } from './active.js';
import { save } from './save.js';
import { erase } from './erase.js';
import { load } from './load.js';
import { options } from './options.js';


// Exported
export const scene = ({ read, get, set }) => ({
    has: (c) => { c(true); },
    name: name({ read, get, set }),
    scope: scope({ read, get, set }),
    active: active({ read, get }),
    ...save({ set }),
    ...erase({ set }),
    ...load({ set }),
    options,
});
