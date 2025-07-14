// Requirements
import { options } from './options.js';
import { name } from './name.js';
import { icon } from './icon.js';
import { mute } from './mute.js';


// Exported
export const mg = ({ read, get, set }) => ({
    has: (c) => { c(true); },
    options,
    name: name(),
    icon: icon({ read, get, set }),
    mute: mute({ read, get, set }),
});
