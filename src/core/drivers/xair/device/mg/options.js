// Exported
export const options = [
    { id: 0, number: '1' },
    { id: 1, number: '2' },
    { id: 2, number: '3' },
    { id: 3, number: '4' },
];


export const mgExists = mgId => !!options[mgId];


export const mgGet = (mgId) => {
    if (!options[mgId]) throw new Error('Unknown mute group option');
    return options[mgId];
};
