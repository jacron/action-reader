StorageArea = chrome.storage.local;
const KEY_DEFAULT = '_default';
const KEY_DARK = '_dark';

class Host {
    constructor(name) {
        this.name = name;
    }
    selector = [];
    css = '';

    store(changes) {
        this.get().then(oldHost => {
            const newHost = {};
            newHost.css = changes.css || oldHost.css;
            newHost.selector = changes.selector || oldHost.selector;
            StorageArea.set({[this.name]: newHost}, () => {});
        });
    }

    get() {
        const keys = [this.name, KEY_DEFAULT, KEY_DARK];
        return new Promise((resolve, reject) => {
            StorageArea.get(keys, results => {
                resolve(results)
            });
        });
    }

    delete() {
        StorageArea.remove([this.name]);
    }

    // setSelector(selector) { this.selector = selector}

    // setCss(css) {this.css = css}
}

function storeDefault(css) {
    StorageArea.set({[KEY_DEFAULT]: css})
}

function storeDark(css) {
    StorageArea.set({[KEY_DARK]: css})
}

