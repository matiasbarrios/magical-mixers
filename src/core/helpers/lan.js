// Variables
let provider = null;


// Exported
export const lanSetProvider = (p) => {
    provider = p;
};


export const getLANInterfaces = () => {
    if (!provider) return null;
    return provider.getLANBroadcastAddress?.() ?? provider.getLANInterfaces?.();
};


export const getLocalAddressForIP = (targetIp) => {
    if (!provider?.getLocalAddressForIP) return null;
    return provider.getLocalAddressForIP(targetIp);
};
