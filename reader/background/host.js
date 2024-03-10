const StorageArea = chrome.storage.local;
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
            if (changes) {
                oldHost = oldHost[this.name];
                if (!oldHost) {
                    newHost.default = changes.default || '';
                    newHost.dark = changes.dark || '';
                    newHost.selector = changes.selector || '';
                    newHost.active = changes.active || 'on';
                } else {
                    newHost.default = changes.default || oldHost.default || '';
                    newHost.dark = changes.dark || oldHost.dark || '';
                    newHost.selector = changes.selector || oldHost.selector || '';
                    newHost.active = changes.active || oldHost.active || 'on';
                }
            }
            StorageArea.set({[this.name]: newHost}, () => {});
        });
    }

    get() {
        const keys = [this.name];
        return new Promise((resolve) => {
            StorageArea.get(keys, results => {
                resolve(results)
            });
        });
    }

    delete() {
        StorageArea.remove([this.name]).then(() => {});
    }
}

function retrieveDefaultDark() {
    const keys = [KEY_DEFAULT, KEY_DARK];
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            resolve(results)
        });
    });
}

function storeDefault(css) {
    StorageArea.set({[KEY_DEFAULT]: css}).then(() => {})
}

function storeDark(css) {
    StorageArea.set({[KEY_DARK]: css}).then(() => {})
}

export { Host, storeDark, storeDefault, retrieveDefaultDark}
