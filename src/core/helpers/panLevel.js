// Requirements
import { scaleLinear } from 'd3';


// Constants
const QUARTER_PI = Math.PI / 4;

const SQRT_2 = Math.SQRT2;


// Internal
const normalizePan = (pan, panMinimum, panMaximum) => scaleLinear()
    .domain([panMinimum, panMaximum])
    .range([-1, 1])
    .clamp(true)(pan);


const panApplyToMono = (value, pan, panMinimum, panMaximum) => {
    const gain = 10 ** (value / 20);

    const panNormalized = normalizePan(pan, panMinimum, panMaximum);
    const angle = (panNormalized + 1) * QUARTER_PI;

    const gainL = gain * Math.cos(angle) * SQRT_2;
    const gainR = gain * Math.sin(angle) * SQRT_2;

    // Avoid log(0)
    const l = 20 * Math.log10(Math.max(gainL, 1e-10));
    const r = 20 * Math.log10(Math.max(gainR, 1e-10));

    return [l, r];
};


const panApplyToStereo = ([vl, vr], pan, panMinimum, panMaximum) => {
    const gainL = 10 ** (vl / 20);
    const gainR = 10 ** (vr / 20);

    const panNormalized = normalizePan(pan, panMinimum, panMaximum);

    const gainOutL = (gainL * (1 - panNormalized) + gainR * (1 - panNormalized)) / 2;
    const gainOutR = (gainL * (1 + panNormalized) + gainR * (1 + panNormalized)) / 2;

    // Avoid log(0)
    const l = 20 * Math.log10(Math.max(gainOutL, 1e-10));
    const r = 20 * Math.log10(Math.max(gainOutR, 1e-10));

    return [l, r];
};

const panApply = (value, pan, panMinimum, panMaximum) => {
    if (pan === 0) return value;
    if (!Array.isArray(value)) return panApplyToMono(value, pan, panMinimum, panMaximum);
    return panApplyToStereo(value, pan, panMinimum, panMaximum);
};


const levelApply = (value, level) => {
    const sum = v => Math.min(v + level, 0);
    if (!Array.isArray(value)) return sum(value);
    return value.map(sum);
};


// Exported
export const panAndLevelApply = (panMinimum, panMaximum) => (pan,
    level, value) => levelApply(panApply(value, pan, panMinimum, panMaximum), level);
