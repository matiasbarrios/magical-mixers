// Exported
export const device = ({ read, get, set }) => ({
    name: {
        name: 'Name',
        type: 'string',
        has: (c) => { c(true); },
        read: () => read('/-prefs/name'),
        get: c => get('/-prefs/name', c),
        set: v => set('/-prefs/name', v),
    },
});
