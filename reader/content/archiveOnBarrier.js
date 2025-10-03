import {fetchArchiveContent} from "./fetchArchiveContent.js";
import {specialSites} from "./specialSites.js";

/*
| Syntax            | Description | Example                                                    |
| ----------------- | ----------- | ---------------------------------------------------------- |
| `[attr^="value"]` | Starts with | `a[href^="https://"]` matches links starting with HTTPS    |
| `[attr$="value"]` | Ends with   | `img[src$=".jpg"]` matches all `.jpg` images               |
| `[attr*="value"]` | Contains    | `div[class*="card"]` matches all classes containing "card" |

 */
function isHomePage(href) {
    // url without querystring
    const url = href.split('?')[0];
    // check if the url is a homepage
    const slashes = url.split('/');
    // e.g. https://www.washingtonpost.com/
    if (slashes.length < 5) {
        return true; // home page
    }
}

function hasBarrierPage() {
    for (const site of specialSites) {
        if (document.location.hostname.includes(site.hostname) && !isHomePage(document.location.href)) {
            return site;
        }
    }
    return null;
}

function toArchive() {
    const w = document.location.href.split('?');
    const url = 'https://archive.is/search/?q=' + w[0];
    fetchArchiveContent(url);
}

function toArchiveAgain(site) {
    if (document.querySelector(site.barrierSelector)) {
        toArchive();
        return true;
    }
    return false;
}

function _toArchiveOnBarrier(site) {
    if (toArchiveAgain(site)) return true;
    if (site.delay) {
        setTimeout(() => {
            if (toArchiveAgain(site)) return true;
            console.log('No barrier found');
            return false;
        }, site.delay);
    }
    return false;
}

function toArchiveOnBarrier() {
    const site = hasBarrierPage();
    if (site) {
        if (_toArchiveOnBarrier(site)) return true;

        setTimeout(() => {
            return _toArchiveOnBarrier(site);
        }, 1000);
    }
}

export { toArchiveOnBarrier, hasBarrierPage };
