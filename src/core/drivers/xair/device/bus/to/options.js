// Requirements
import {
    busesMainSecondaryEffectMonitor, busGet, busesMainAndMonitor, busMonitor,
} from '../options.js';


// Constants
const emptyArray = [];


// Internal
const toOptionsPerType = {
    line: busesMainSecondaryEffectMonitor,
    channel: busesMainSecondaryEffectMonitor,
    effect: busesMainSecondaryEffectMonitor,
    main: busMonitor,
    secondary: busesMainAndMonitor,
};


// Exported
export const options = busId => toOptionsPerType[busGet(busId).type] || emptyArray;
