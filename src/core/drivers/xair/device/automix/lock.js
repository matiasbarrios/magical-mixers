// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { noneOption, automixOsc } from './options.js';


// Exported
export const lock = ({ read, get, set }) => ({
    has: (automixId, c) => { c(automixId !== noneOption.id); },
    read: automixId => read(automixOsc(automixId, 'amixlock')),
    get: (automixId, c) => get(automixOsc(automixId, 'amixlock'), c, binaryToBoolean),
    set: (automixId, v) => set(automixOsc(automixId, 'amixlock'), v, booleanToBinary),
});
