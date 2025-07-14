/* eslint-disable no-unused-vars */


// Constants
const emptyArray = [];


// Exported
export const icon = () => ({
    has: (dcaId, c) => { c(false); },
    read: dcaId => undefined,
    get: (dcaId, c) => {},
    set: (dcaId, v) => {},
    options: dcaId => emptyArray,
    defaultOption: dcaId => ({ id: null }),
});
