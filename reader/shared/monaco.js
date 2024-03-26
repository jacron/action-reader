const vsPath = '../node_modules/monaco-editor/min/vs';

/**
 * Several tabs hold these instances of the monaco editor.
 *
 */
const monacoDocuments = {
    default: {
        name: 'default',
        description: 'General styling for @site',
        text: '',
        language: 'css',
        className: 'default',
        selector: '.default',
        editor: null,
        id: 'editor-default',
        styleId: 'splash-custom-default-style',
        lastSavedVersion: null,
    },
    dark: {
        name: 'dark',
        description: 'Dark mode styling for @site',
        text: '',
        language: 'css',
        className: 'dark',
        selector: '.dark',
        editor: null,
        id: 'editor-dark',
        styleId: 'splash-custom-dark-style',
        lastSavedVersion: null,
    },
    selector: {
        name: 'selector',
        description: 'Elements in @site to display (@ optional)',
        text: '',
        className: 'selector',
        selector: '.selector',
        editor: null,
        id: 'editor-selector',
        lastSavedVersion: null,
    },
    _default: {
        name: '_default',
        description: 'General styling for all sites',
        text: '',
        language: 'css',
        className: '_default',
        selector: '._default',
        editor: null,
        id: 'editor-_default',
        styleId: 'splash-default-style',
        lastSavedVersion: null,
    },
    _dark: {
        name: '_dark',
        description: 'Dark mode styling for all sites',
        text: '',
        language: 'css',
        className: '_dark',
        selector: '._dark',
        editor: null,
        id: 'editor-_dark',
        styleId: 'splash-dark-style',
        lastSavedVersion: null,
    },
};
export {monacoDocuments, vsPath}
