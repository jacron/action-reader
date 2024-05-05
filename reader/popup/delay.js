import {StorageArea} from "../shared/constants.js";

function initDelay(hostName) {
    StorageArea.get([hostName], results => {
        const obj = results[hostName];
        if (obj) {
            const inputDelay = document.getElementById('editor-input-delay');
            inputDelay.value = obj.delay || '';
        }
    })
}

export {initDelay}
