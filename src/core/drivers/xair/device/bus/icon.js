/* eslint-disable no-unused-vars */

// Constants
const emptyArray = [];


// Exported
export const icon = () => ({
    has: (busId, c) => { c(false); },
    read: busId => undefined,
    get: (busId, c) => {},
    set: (busId, v) => {},
    options: busId => emptyArray,
    defaultOption: busId => ({ id: null }),
});
