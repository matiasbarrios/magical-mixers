/* eslint-disable no-unused-vars */


// Exported
export const name = () => ({
    has: (outputId, c) => { c(false); },
    read: outputId => undefined,
    get: (outputId, c) => {},
    set: (outputId, v) => {},
});
