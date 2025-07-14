// Requirements
import { options } from './options.js';
import { name } from './name.js';
import { color } from './color.js';
import { mute } from './mute.js';
import { level } from './level.js';
import { solo } from './solo.js';
import { icon } from './icon.js';


// Exported
export const dca = ({
    read, get, set, subscribe,
}) => ({
    has: (c) => { c(true); },
    options,
    name: name({ read, get, set }),
    color: color({ read, get, set }),
    icon: icon({ read, get, set }),
    mute: mute({ read, get, set }),
    level: level({
        read, get, set, subscribe,
    }),
    solo: solo({ read, get, set }),
});
