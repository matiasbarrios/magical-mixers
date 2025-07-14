// Requirements
import { lock } from './lock.js';
import { on } from './on.js';
import { options } from './options.js';


// Exported
export const automix = ({ read, get, set }) => ({
    has: (c) => { c(true); },
    options,
    on: on({ read, get, set }),
    lock: lock({ read, get, set }),
});
