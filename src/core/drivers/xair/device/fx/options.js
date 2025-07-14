// Exported
export const options = [
    {
        id: 0, name: 'FX 1', number: '1', busId: 17,
    },
    {
        id: 1, name: 'FX 2', number: '2', busId: 18,
    },
    {
        id: 2, name: 'FX 3', number: '3', busId: 19,
    },
    {
        id: 3, name: 'FX 4', number: '4', busId: 20,
    },
];


export const fxGet = (fxId) => {
    if (!options[fxId]) throw new Error('Unknown fx');
    return options[fxId];
};


export const fxOsc = (fxId) => {
    const fx = fxGet(fxId);
    return `/fx/${fx.number}/`;
};
