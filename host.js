StorageArea = chrome.storage.local;

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
        return new Promise((resolve, reject) => {
            StorageArea.get([this.name], results => {
                resolve(results[this.name])
            });
        });
    }

    delete() {
        StorageArea.remove([this.name]);
    }

    setSelector(selector) { this.selector = selector}

    setCss(css) {this.css = css}
}

