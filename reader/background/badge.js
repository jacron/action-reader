import {getJcReaderHost} from "../lib/util.js";
import {Host} from "./host.js";

function updateBadge(url) {
    const activeHost = getJcReaderHost(url);
    if (!activeHost || activeHost.length === 0) {  // maybe the popup
        return;
    }
    const host = new Host(activeHost);
    host.isActive().then(activeOn => {
        chrome.action.setBadgeText({text: activeOn ? 'on' : ''});
    })
}

export {updateBadge}
