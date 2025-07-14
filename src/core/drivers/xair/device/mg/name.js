/* eslint-disable no-unused-vars */


// Exported
export const name = () => ({
    has: (mgId, c) => { c(false); },
    read: mgId => undefined,
    get: (mgId, c) => {},
    set: (mgId, v) => {},
});
