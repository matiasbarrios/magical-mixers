// Requirements
import { binaryToBoolean, booleanToBinary } from '../../../../helpers/values.js';
import { noneOption, automixOsc } from './options.js';


// Exported
export const on = ({ read, get, set }) => ({
    has: (automixId, c) => { c(automixId !== noneOption.id); },
    read: automixId => read(automixOsc(automixId, 'amixenable')),
    get: (automixId, c) => get(automixOsc(automixId, 'amixenable'), c, binaryToBoolean),
    set: (automixId, v) => set(automixOsc(automixId, 'amixenable'), v, booleanToBinary),
});
