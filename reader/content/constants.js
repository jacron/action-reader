const StorageArea = chrome.storage.local;
const KEY_CLASSES = "hostClasses";
const KEY_IDS = 'hostIds';

const keysGeneral = {
    default: '_default',
    dark: '_dark'
}
const styleIds = {
    custom: {
        default: 'splash-custom-default-style',  // 'custom-default-style-id',
        dark: 'splash-custom-dark-style'  // 'custom-dark-style-id'
    },
    general: {
        default: 'splash-default-style',  // 'general-default-style-id',
        dark: 'splash-dark-style'  // 'general-dark-style-id'
    }
}
let initedHost = {
    custom: null,
    darkText: null,
    defaultText: null
}

export {StorageArea, KEY_CLASSES, KEY_IDS, styleIds, initedHost, keysGeneral}
