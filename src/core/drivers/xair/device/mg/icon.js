/* eslint-disable no-unused-vars */


// Constants
const emptyArray = [];


// Exported
export const icon = () => ({
    has: (mgId, c) => { c(false); },
    read: mgId => undefined,
    get: (mgId, c) => {},
    set: (mgId, v) => {},
    options: mgId => emptyArray,
    defaultOption: mgId => ({ id: null }),
});
