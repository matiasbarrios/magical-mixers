// Internal
const clampValue = (value, a, b) => {
    const lo = Math.min(a, b);
    const hi = Math.max(a, b);
    return Math.min(hi, Math.max(lo, value));
};


const scaleBuilder = (map, invertMap) => () => {
    let d0;
    let d1;
    let r0;
    let r1;
    let clamp = false;

    const scale = (value) => {
        const x = clamp ? clampValue(value, d0, d1) : value;
        const y = map(
            x, d0, d1, r0, r1
        );
        return clamp ? clampValue(y, r0, r1) : y;
    };

    scale.invert = (value) => {
        const y = clamp ? clampValue(value, r0, r1) : value;
        const x = invertMap(
            y, d0, d1, r0, r1
        );
        return clamp ? clampValue(x, d0, d1) : x;
    };

    scale.domain = ([a, b]) => {
        d0 = a;
        d1 = b;
        return scale;
    };

    scale.range = ([a, b]) => {
        r0 = a;
        r1 = b;
        return scale;
    };

    scale.clamp = (enabled) => {
        clamp = enabled;
        return scale;
    };

    return scale;
};


const linearMap = (
    x, d0, d1, r0, r1
) => {
    if (d0 === d1) return r0;
    const t = (x - d0) / (d1 - d0);
    return r0 + t * (r1 - r0);
};


const linearInvert = (
    y, d0, d1, r0, r1
) => {
    if (r0 === r1) return d0;
    const t = (y - r0) / (r1 - r0);
    return d0 + t * (d1 - d0);
};


const logMap = (
    x, d0, d1, r0, r1
) => {
    if (d0 === d1) return r0;
    const ld0 = Math.log(d0);
    const ld1 = Math.log(d1);
    const t = (Math.log(x) - ld0) / (ld1 - ld0);
    return r0 + t * (r1 - r0);
};


const logInvert = (
    y, d0, d1, r0, r1
) => {
    if (r0 === r1) return d0;
    const ld0 = Math.log(d0);
    const ld1 = Math.log(d1);
    const t = (y - r0) / (r1 - r0);
    return Math.exp(t * (ld1 - ld0) + ld0);
};


// Exported
export const scaleLinear = scaleBuilder(linearMap, linearInvert);


export const scaleLog = scaleBuilder(logMap, logInvert);
