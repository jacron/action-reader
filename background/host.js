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
        console.log('changes', changes);
        this.get().then(oldHost => {
            const newHost = {};
            if (changes) {
                oldHost = oldHost[this.name];
                if (!oldHost) {
                    newHost.css = changes.css || '';
                    newHost.selector = changes.selector || '';
                } else {
                    newHost.css = changes.css || oldHost.css || '';
                    newHost.selector = changes.selector || oldHost.selector || '';
                }
            }
            StorageArea.set({[this.name]: newHost}, () => {});
        });
    }

    get() {
        const keys = [this.name];
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

function retrieveDefaultDark() {
    const keys = [KEY_DEFAULT, KEY_DARK];
    return new Promise((resolve, reject) => {
        StorageArea.get(keys, results => {
            resolve(results)
        });
    });
}

function storeDefault(css) {
    StorageArea.set({[KEY_DEFAULT]: css})
}

function storeDark(css) {
    StorageArea.set({[KEY_DARK]: css})
}

