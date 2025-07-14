// Exported
export const options = [
    { id: 0, number: '1' },
    { id: 1, number: '2' },
    { id: 2, number: '3' },
    { id: 3, number: '4' },
];


export const dcaExists = dcaId => !!options[dcaId];


export const dcaGet = (dcaId) => {
    if (!options[dcaId]) throw new Error('Unknown DCA option');
    return options[dcaId];
};


export const dcaOsc = dcaId => `/dca/${dcaGet(dcaId).number}`;
