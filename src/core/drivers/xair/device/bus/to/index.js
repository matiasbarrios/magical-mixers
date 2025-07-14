// Requirements
import { on } from './on.js';
import { level } from './level.js';
import { pan } from './pan.js';
import { tap } from './tap.js';
import { toHas } from './has.js';
import { options } from './options.js';
import { meter } from './meter.js';


// Exported
export const to = ({
    read, get, set, subscribe, model,
}) => ({
    has: (busId, c) => { c(toHas(busId)); },
    on: on({ read, get, set }),
    level: level({ read, get, set }),
    pan: pan({ read, get, set }),
    tap: tap({ read, get, set }),
    meter: meter({
        read, get, subscribe, model,
    }),
    options,
});
