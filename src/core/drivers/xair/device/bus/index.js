// Requirements
import { options } from './options.js';
import { name } from './name.js';
import { color } from './color.js';
import { icon } from './icon.js';
import { mute } from './mute.js';
import { level } from './level.js';
import { pan } from './pan.js';
import { polarity } from './polarity.js';
import { stereoLink } from './stereoLink.js';
import { lowCut } from './lowCut.js';
import { input } from './input.js';
import { fx } from './fx.js';
import { insert } from './insert.js';
import { monitor } from './monitor.js';
import { automix } from './automix.js';
import { dca } from './dca.js';
import { mg } from './mg.js';
import { to } from './to/index.js';
import { equalizer } from './equalizer.js';
import { compressor } from './compressor.js';
import { rta } from './rta.js';
import { gate } from './gate.js';
import { disabled } from './disabled.js';


// Exported
export const bus = ({
    read, get, set, subscribe, model,
}) => ({
    has: (c) => { c(true); },
    options,
    name: name({ read, get, set }),
    color: color({ read, get, set }),
    icon: icon({ read, get, set }),
    disabled: disabled({ read, get, set }),
    mute: mute({ read, get, set }),
    level: level({
        read, get, set, subscribe,
    }),
    pan: pan({ read, get, set }),
    polarity: polarity({ read, get, set }),
    stereoLink: stereoLink({ read, get, set }),
    lowCut: lowCut({ read, get, set }),
    input: input({
        read, get, set, subscribe, model,
    }),
    equalizer: equalizer({
        read, get, set, subscribe, model,
    }),
    compressor: compressor({
        read, get, set, subscribe,
    }),
    gate: gate({
        read, get, set, subscribe,
    }),
    fx: fx({
        read, get, set, subscribe,
    }),
    insert: insert({ read, get, set }),
    monitor: monitor({ read, get, set }),
    automix: automix({
        read, get, set, subscribe,
    }),
    dca: dca({ read, get, set }),
    mg: mg({ read, get, set }),
    to: to({
        read, get, set, subscribe, model,
    }),
    rta: rta({
        read, get, set, subscribe,
    }),
});
