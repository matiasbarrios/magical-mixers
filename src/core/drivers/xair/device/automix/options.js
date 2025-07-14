// Exported

export const noneOption = { id: 0, name: 'None' };


export const options = [
    noneOption,
    { id: 1, name: 'X' },
    { id: 2, name: 'Y' },
];


export const automixGet = (automixId) => {
    if (!options[automixId]) throw new Error('Unknown automix option');
    return options[automixId];
};


export const automixOsc = (automixId, operation) => `/config/${operation}/${automixGet(automixId).name}`;
