// Internal
const paramsTranslate = (p) => {
    // Conventions
    if (p === 'c') return 'callback';
    if (['v', 'x', 'y'].includes(p)) return 'value';
    return p;
};


const inferReturnType = (key) => {
    if (key === 'read') return 'any';
    if (key === 'get') return 'function';
    if ([
        'has', 'set', 'resetAll', 'save', 'erase', 'load', 'reset', 'clear', 'connect', 'halt',
        'resume', 'disconnect', 'dispose', 'definitionBuild', 'initialize',
        'cacheRefetch', 'cacheClear'].includes(key)) return 'undefined';
    if (['minimum', 'maximum', 'pair'].includes(key)) return 'number';
    if (key === 'side') return 'string';
    if (key === 'options') return 'array';
    if (key === 'isLowCut') return 'boolean';
    if (key === 'defaultOption') return 'object';
    return 'unknown';
};


const analyze = (definitionBuild, value, key, keysToIgnore) => {
    if (typeof value === 'function') {
        const params = value.toString().match(/\(([^)]*)\)/);
        let paramList = params ? params[1].split(',').map(p => p.trim()).filter(p => p) : [];
        paramList = paramList.map(p => paramsTranslate(p));
        const returnType = inferReturnType(key);
        return `(${paramList.join(', ')}) => ${returnType}`;
    } if (Array.isArray(value)) {
        // If an array, return a string that represents it and the values of the first element
        return JSON.stringify([analyze(definitionBuild, value[0], undefined, keysToIgnore)]).replace(/"/g, '\'');
    } if (typeof value === 'object' && value !== null) {
        return definitionBuild(value, keysToIgnore);
    }
    return typeof value; // Hoja como string con el tipo
};


const definitionBuild = (o, keysToIgnore) => {
    const result = {};
    Object.keys(o).forEach((key) => {
        if (keysToIgnore && keysToIgnore.includes(key)) return;
        if (!Object.prototype.hasOwnProperty.call(o, key) || key.startsWith('_')) return;
        if (key === 'configuration') {
            // Ignore the categories
            result[key] = analyze(definitionBuild, o[key], key, o[key]
                .categories.map(c => c.id));
            // Put one symbolic category
            result[key].categoryId = {
                optionId: {
                    name: 'string',
                    type: 'string',
                    minLength: 'number || function',
                    maxLength: 'number || fucntion',
                    options: 'array',
                    hideIf: '() => undefined',
                    isValid: '() => undefined',
                    has: '(callback) => undefined',
                    read: '() => any',
                    get: '(callback) => function',
                    set: '(value) => undefined',
                },
            };
        } else {
            result[key] = analyze(definitionBuild, o[key], key);
        }
    });

    return result;
};


// Exported
export const definitionDownload = (o) => {
    const content = JSON.stringify(definitionBuild(o, ['capture']), null, 4);
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'definition.json';
    document.body.appendChild(a);
    a.click();

    document.body.removeChild(a);
    URL.revokeObjectURL(url);
};
