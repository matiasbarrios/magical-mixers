/* eslint-disable no-unused-vars */


// Exported
export const name = () => ({
    has: (inputId, c) => { c(false); },
    read: inputId => undefined,
    get: (inputId, c) => {},
    set: (inputId, v) => {},
});
