import {StorageArea} from "../shared/constants.js";

function getHostFieldValue(hostname, field) {
    return new Promise((resolve) => {
        StorageArea.get([hostname], results => {
            const obj = results[hostname];
            if (obj) resolve(obj[field]);
            else resolve(null);
        });
    })
}

function getCurrentHost() {
    const KEY_HOSTNAME = 'hostname';
    return new Promise((resolve, reject) => {
        StorageArea.get([KEY_HOSTNAME], results => {
            if (results) {
                resolve(results[KEY_HOSTNAME]);
            } else reject();
        })
    })
}

function setHostFieldValue(hostname, field, value) {
    StorageArea.get([hostname], results => {
        let obj = results[hostname];
        if (!obj) obj = {};
        obj[field] = value;
        StorageArea.set({[hostname]: obj}, () => {});
    })
}

export { getHostFieldValue, setHostFieldValue, getCurrentHost }
