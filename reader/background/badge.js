import {getJcReaderHost} from "../lib/util.js";
import {getHostFieldValue} from "./host.js";

function updateBadge(url) {
    console.log(url)
    const activeHost = getJcReaderHost(url);
    if (!activeHost || activeHost.length === 0) {  // maybe the popup
        return;
    }
    getHostFieldValue(activeHost, 'active')
        .then(text => {
            console.log(text)
            chrome.action.setBadgeText({text: text}).then()
        })
}

export {updateBadge}
