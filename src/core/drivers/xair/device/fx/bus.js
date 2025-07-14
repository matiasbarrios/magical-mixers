// Requirements
import { options as busOptions } from '../bus/options.js';
import { fxGet } from './options.js';


// Constants
const busPerFxId = {
    '0': [busOptions[17]],
    '1': [busOptions[18]],
    '2': [busOptions[19]],
    '3': [busOptions[20]],
};


// Exported
export const bus = {
    has: (fxId, c) => { c(true); },
    read: fxId => fxGet(fxId).busId,
    get: (fxId, c) => { c(fxGet(fxId).busId); },
    set: () => {},
    options: fxId => busPerFxId[fxId],
};
