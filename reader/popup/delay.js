import {Host} from "../background/host.js";

function getHostDelay(hostName) {
    return new Promise((resolve) => {
        const host = new Host(hostName);
        host.getCustom().then(results => {
            const obj = results[hostName];
            if (obj) {
                resolve(obj.delay);
            }
        })
    })
}

function initDelay(hostName) {
    getHostDelay(hostName).then(delay => {
        const inputDelay = document.getElementById('editor-input-delay');
        inputDelay.value = delay || '';
    })
}

export {initDelay}
