// Requirements
import { bus } from './bus.js';
import { options } from './options.js';
import { insert } from './insert.js';
import { type } from './type/index.js';
import { parameters } from './parameters.js';


// Exported
export const fx = ({ read, get, set, setBatch }) => ({
    has: (c) => { c(true); },
    options,
    insert: insert({ read, get, set, setBatch }),
    bus,
    type: type({ read, get, set }),
    parameters: parameters({ read, get, set }),
});
