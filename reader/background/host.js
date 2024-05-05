import {StorageArea} from "../shared/constants.js";

class Host {
    constructor(name) {
        this.name = name;
    }
    selector = [];
    css = '';

    isActive() {
        return new Promise((resolve) => {
            StorageArea.get([this.name], results => {
                const obj = results[this.name];
                if (obj && obj.active === 'on') {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });
        })
    }

    storeActive(active) {
        this.storeSomething('active', active ? 'on' : 'off');
    }

    storeSomething(field, value) {
        StorageArea.get([this.name], results => {
            let obj = results[this.name];
            if (!obj) obj = {};
            obj[field] = value;
            StorageArea.set({[this.name]: obj}, () => {});
        })
    }

}

function getHostFieldValue(hostname, field) {
    return new Promise((resolve) => {
        StorageArea.get([hostname], results => {
            const obj = results[hostname];
            if (obj) resolve(obj[field]);
            else resolve(null);
        });
    })
}

export { Host, getHostFieldValue }
