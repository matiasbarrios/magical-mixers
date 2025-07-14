// Requirements
import { bus } from './bus.js';
import { options } from './options.js';
import { insert } from './insert.js';
import { type } from './type/index.js';
import { parameters } from './parameters.js';


// Exported
export const fx = ({ read, get, set }) => ({
    has: (c) => { c(true); },
    options,
    insert: insert({ read, get, set }),
    bus,
    type: type({ read, get, set }),
    parameters: parameters({ read, get, set }),
});
