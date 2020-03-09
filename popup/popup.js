import {setFormActions, show} from './form.js';
import {setTabActions} from './tab.js';

// let activeHost;

// function dumpStorage() {
//     chrome.storage.local.get(null,
//         response => {
//             console.log('storage dump');
//             console.dir(response);
//         });
// }

document.addEventListener('DOMContentLoaded', function () {
    // dumpStorage();
    setFormActions();
    setTabActions();
});

chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
        if (req.result) {
            document.getElementById('host-name').innerText = req.host;
            show(req);
        } else {
            sendResponse('no request handled');
        }
    });
