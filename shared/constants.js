const documents = {
    css: {
        text: '',
        language: 'css',
        className: 'css',
        selector: '.css',
        editor: null,
        id: 'editor-css',
        styleId: 'splash-custom-style',
    },
    selector: {
        text: '',
        language: 'javascript',
        className: 'selector',
        selector: '.selector',
        editor: null,
        id: 'editor-selector',
    },
    default: {
        text: '',
        language: 'css',
        className: 'default',
        selector: '.default',
        editor: null,
        id: 'editor-default',
        styleId: 'splash-default-style',
    },
    dark: {
        text: '',
        language: 'css',
        className: 'dark',
        selector: '.dark',
        editor: null,
        id: 'editor-dark',
        styleId: 'splash-dark-style',
    },
};
const dynClass = {
    SELECTED: {
        className: 'selected',
        selector: '.selected',
    },
};
const sendMessage = chrome.runtime.sendMessage;

