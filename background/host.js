StorageArea = chrome.storage.local;
const KEY_DEFAULT = '_default';
const KEY_DARK = '_dark';

class Host {
    constructor(name) {
        this.name = name;
    }
    selector = {};
    css = '';

    store() {
        StorageArea.set({[this.name]: {
            selector: this.selector,
            css: this.css
        }}, () => {});
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

    setSelector(selector) { this.selector = selector}

    setCss(css) {this.css = css}
}

