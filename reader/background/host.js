import {StorageArea} from "./backgroundState.js";

const KEY_DEFAULT = '_default';
const KEY_DARK = '_dark';
const KEY_HOSTNAME = 'hostname';

class Host {
    constructor(name) {
        this.name = name;
    }
    selector = [];
    css = '';

    store(changes) {
        this.getCustom().then(response => {
            const newHost = {};
            if (changes) {
                response = response[this.name];
                if (!response) {
                    newHost.default = changes.default || '';
                    newHost.dark = changes.dark || '';
                    newHost.selector = changes.selector || '';
                    newHost.active = changes.active || 'on';
                    newHost.delay = changes.delay;  // maybe null
                } else {
                    newHost.default = changes.default || response.default || '';
                    newHost.dark = changes.dark || response.dark || '';
                    newHost.selector = changes.selector || response.selector || '';
                    newHost.active = changes.active || response.active || 'on';
                    newHost.delay = changes.delay || response.delay;
                }
            }
            StorageArea.set({[this.name]: newHost}, () => {});
        });
    }

    isActive() {
        return new Promise((resolve) => {
            this.getCustom().then(response => {
                const entries = Object.entries(response);
                if (entries.length > 0) {
                    const [site, options] = entries[0];
                    if (site.length > 0 && options.active === 'on') {
                        resolve(true);
                    }
                }
                resolve(false);
            });
        })
    }

    getCustom() {
        const keys = [this.name];
        return new Promise((resolve) => {
            StorageArea.get(keys, results => {
                resolve(results)
            });
        });
    }

    getGeneral() {
        const keys = [KEY_DEFAULT, KEY_DARK];
        return new Promise((resolve) => {
            StorageArea.get(keys, results => {
                resolve(results)
            });
        });
    }
}

function storeDefault(css) {
    StorageArea.set({[KEY_DEFAULT]: css}).then(() => {})
}

function storeDark(css) {
    StorageArea.set({[KEY_DARK]: css}).then(() => {})
}

function getCurrentHost() {
    return new Promise((resolve, reject) => {
        StorageArea.get([KEY_HOSTNAME], results => {
            if (results) {
                resolve(new Host(results[KEY_HOSTNAME]));
            } else reject();
        })
    })
}

/* delete host: for options/storage */
function deleteHost(key) {
    StorageArea.remove([key]).then(() => {});
}

export { Host, storeDark, storeDefault, deleteHost, getCurrentHost}
