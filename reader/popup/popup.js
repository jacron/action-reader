import {setFormActions, toggleForms} from './form.js';
import {show} from './editor.js';
import {setTabActions} from './tab.js';
import {sendMessage} from "../shared/constants.js";
import {popup} from "./popupState.js";

function initJcReader() {
    sendMessage({request: 'initHost', client: 'popup'}, () => {});
    // sendMessage({request: 'getInitial'},
    //     response => {
    //         popup.activeHost = response.activeHost;
    //         sendMessage({
    //             request: 'fetchHost',
    //             host: popup.activeHost}, () => { });
    //     });
}

chrome.runtime.onMessage.addListener(
    (req, sender, sendResponse) => {
        console.log(req);
        if (req.message === 'onInitHost') {
            popup.activeHost = req.host;
            document.getElementById('host-name').innerText = req.host;
            toggleForms(req.custom);
            if (req.custom) {
                show(req);
            }
        } else {
            sendResponse('no request handled');
        }
    });

document.addEventListener('DOMContentLoaded', function () {
    setFormActions();
    setTabActions();
    initJcReader();
});
