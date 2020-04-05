/**
 * tabs that hold instances of the monaco editor
 *
 * @type {{css: {editor: null, styleId: string, name: string, language: string, className: string, selector: string, text: string, id: string}, default: {editor: null, styleId: string, name: string, language: string, className: string, selector: string, text: string, id: string}, dark: {editor: null, styleId: string, name: string, language: string, className: string, selector: string, text: string, id: string}, selector: {editor: null, name: string, language: string, className: string, selector: string, text: string, id: string}}}
 */
const monacoDocuments = {
    default: {
        name: 'default',
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
        text: '',
        language: 'css',
        className: 'selector',
        selector: '.selector',
        editor: null,
        id: 'editor-selector',
        lastSavedVersion: null,
    },
    _default: {
        name: '_default',
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
/**
 * 'selected' or '.selected'
 *
 * @type {{SELECTED: {className: string, selector: string}}}
 */
const dynClass = {
    SELECTED: {
        className: 'selected',
        selector: '.selected',
    },
};
/**
 * shorthand function call
 *
 */
const sendMessage = chrome.runtime.sendMessage;

/**
 * systemLibraryUrl for server handling read/write json file
 */
const jsonStorage = {
    systemLibraryUrl: 'http://localhost:3006',
    jsonmap: '/Volumes/Media/Download',
    jsonfile: 'readerdata.json',
};

export {monacoDocuments, dynClass, sendMessage, jsonStorage}
