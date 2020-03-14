import {setFormActions, show} from './form.js';
import {setTabActions} from './tab.js';

document.addEventListener('DOMContentLoaded', function () {
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
