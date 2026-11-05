// Requirements
import { modelsSupported } from '../../model.js';


// Internal
const firmwareSupportsExtendedWifi = (firmware) => {
    if (typeof firmware !== 'string') return false;

    const match = /^(\d+)\.(\d+)$/.exec(firmware.trim());
    if (!match) return false;

    const major = parseInt(match[1], 10);
    const minor = parseInt(match[2], 10);
    return major === 1 && minor >= 14;
};


// Exported
export const wifiSecurityIsExtended = (model, firmware) => (
    typeof model === 'string'
    && model.endsWith('V2')
    && modelsSupported.includes(model)
    && firmwareSupportsExtendedWifi(firmware)
);
