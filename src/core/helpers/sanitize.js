// Strip all HTML markup from untrusted strings (OSC args, channel names, etc.).
// Replaces isomorphic-dompurify with ALLOWED_TAGS: [] — no jsdom, works in Node and browser.
export const sanitizeString = (value) => {
    if (typeof value !== 'string') return value;

    let result = '';
    let inTag = false;

    for (let i = 0; i < value.length; i += 1) {
        const char = value[i];
        if (char === '<') {
            inTag = true;
        } else if (char === '>') {
            inTag = false;
        } else if (!inTag) {
            result += char;
        }
    }

    return result;
};
