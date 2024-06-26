import {getJcReaderHost} from "../lib/util.js";
import {getHostFieldValue} from "./host.js";

function updateBadge(url) {
    const activeHost = getJcReaderHost(url);
    if (!activeHost || activeHost.length === 0) {  // maybe the popup
        return;
    }
    getHostFieldValue(activeHost, 'active')
        .then(text => {
            chrome.action.setBadgeText({text: text}).then()
        })
}

export {updateBadge}
