// Variables
let provider = null;


// Exported
export const lanSetProvider = (p) => {
    provider = p;
};


export const getLANBroadcastAddress = () => {
    if (!provider) return null;
    return provider.getLANBroadcastAddress();
};
