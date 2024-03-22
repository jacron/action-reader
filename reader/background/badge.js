import {getJcReaderHost} from "../lib/util.js";
import {Host} from "./host.js";

function updateBadge(url) {
    const activeHost = getJcReaderHost(url);
    if (!activeHost) {
        return;
    }
    const host = new Host(activeHost);
    if (host.name.length === 0) {  // maybe the popup
        return;
    }
    host.isActive().then(activeOn => {
        chrome.action.setBadgeText({
            text: activeOn ? 'on' : ''
        });
    })
}

export {updateBadge}
