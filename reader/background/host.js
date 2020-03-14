import {articleAddDark, initInject} from "./styling.js";
import {monacoDocuments} from "../shared/constants.js";
import {injectMakeReader} from "./makeReader.js";

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
        return new Promise((resolve) => {
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

function initExistingHost(_activeHost, _tabId) {
    const host = new Host(_activeHost);
    host.get().then(_data => {
        const hostdata = _data[_activeHost];
        if (hostdata) { // we have data for this host
            retrieveDefaultDark().then(dd_data => {
                initInject(_tabId, hostdata, dd_data);
            });
            monacoDocuments.selector.text = hostdata.selector;
            injectMakeReader(monacoDocuments.selector.text,
                _tabId, _activeHost);
            articleAddDark(_tabId);
        }
    })
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
    StorageArea.set({[KEY_DEFAULT]: css})
}

function storeDark(css) {
    StorageArea.set({[KEY_DARK]: css})
}

export { Host, storeDark, storeDefault, initExistingHost,
    retrieveDefaultDark}
