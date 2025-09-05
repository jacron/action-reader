import {initedHost} from "../shared/constants.js";
import {deleteReaderArticle, reSelect} from "./select.js";
import {getClassAndIdNames} from "../shared/suggestions.js";
import {vaultToHead} from "./vault.js";
import {correctHeaderScroll} from "./correctionOnPageNavigation.js";
import {toArchiveOnBarrier} from "./archiveOnBarrier.js";
import {isAvoidablePage} from "./avoidable.js";
import {contentInitHost} from "./initHost.js";
import {injectStyle, removeMyStyles, removeStyle} from "./styles.js";
import {hideAnnoying, repairDynamicStyled} from "./annoying.js";
import {barrierSites} from "./barriersites.js";

/* initieel is readerOn true, als een soort quasi global hier */
let readerOn = true;

function getJcReaderHost(url) {
    if (!url) {
        return url;
    }
    url = url.replace(/https?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

function addDark() {
    if (document.getElementById('readerarticle')) {
        document.getElementById('readerarticle').classList.add('dark')
    }
    document.body.classList.add('dark');
    const {custom, darkText} = initedHost;
    injectStyle(custom.dark, 'splash-custom-dark-style');
    injectStyle(darkText, 'splash-dark-style');
}

function removeDark() {
    if (document.getElementById('readerarticle')) {
        document.getElementById('readerarticle').classList.remove('dark');
    }
    document.body.classList.remove('dark');
    removeStyle('splash-custom-dark-style');
    removeStyle('splash-dark-style');
    setTimeout(() => {
    });
}

function replaceStyle(req) {
    injectStyle(req.css, req.id);
}

function toggleGeneralContent(req) {
    const {mode} = req;
    if (mode) {
        contentInitHost().then();
    } else {
        removeMyStyles();
        deleteReaderArticle();
        vaultToHead();
    }
}

function toggleDarkContent(req) {
    const {mode} = req;
    if (mode) {
        addDark();
    } else {
        removeDark();
    }
}

function toggleDark() {
    if (document.body.classList.contains('dark')) {
        removeDark();
    } else {
        addDark();
    }
}

function toggleReader() {
    readerOn = !readerOn;
    if (readerOn) {
        contentInitHost().then();
    } else {
        removeMyStyles();
        deleteReaderArticle();
        vaultToHead();
    }
}

function _reSelect(req) {
    reSelect(req, getHostName());
}

const actionBindings = {
    replaceStyle,
    _reSelect,
    toggleGeneralContent,
    toggleDarkContent,
    toggleDark,
    toggleReader
};

function initActions(req, sendResponse) {
    if (req.message) {
        const func = actionBindings[req.message];
        if (func) {
            func(req);
            sendResponse('okay');
        } else {
            console.error('invalid request', req.message);
            sendResponse('invalid request:' + req.message);
        }
    }
}

function messageListener(req, sender, sendResponse) {
    initActions(req, sendResponse);
}

function imgClick(img) {
    img.addEventListener('click', () => {
        if (img.style.position === 'absolute') {
            img.style.position = 'relative';
        } else {
            img.style.width = '100%';
            img.style.position = 'absolute';
            img.style.left = '0';
        }
    })
}

function imgMagnify() {
    const imgs = document.getElementsByTagName('img');
    // console.log(imgs)
    setTimeout(() => {
        for (let img of imgs) {
            imgClick(img)
        }
    },1000)
}

function getCurrentHost() {
    return getJcReaderHost(document.location.href);
}

let _hostname = null;

function setHostName(hostName) {
    _hostname = hostName
}

function getHostName() {
    return _hostname
}

function originalHostOnArchive() {
    const tds = document.querySelectorAll('td');
    for (let td of tds) {
        if (td.innerText.includes('from host ')) {
            const a = td.querySelector('a');
            const hostName = a.innerText;
            return barrierSites.filter(s => s.hostname === hostName)[0];
        }
    }
    return null;
}

function replaceFaviconOnArchive(hostName) {
    if (hostName === 'archive.is') {
        const originalHost = originalHostOnArchive();
        if (!originalHost) return;

        console.log(originalHost);
        const link = document.querySelector('link[rel*="icon"]') || document.createElement('link');
        link.type = 'image/x-icon';
        link.rel = 'shortcut icon';
        link.href = originalHost.favicon;
        document.getElementsByTagName('head')[0].appendChild(link);
    }
}

/**
 * this export is making content.js a module
 */
// noinspection JSUnusedGlobalSymbols
export function main() {
    const hostName = getCurrentHost();
    setHostName(hostName);
    console.log(`*** contentscript loaded for jreader, in ${hostName}!`);
    if (isAvoidablePage()) return;
    if (toArchiveOnBarrier()) return;
    console.log(`*** running content init host for jreader, in ${hostName}!`);
    contentInitHost(hostName).then(() => {
        getClassAndIdNames();
        hideAnnoying();
        imgMagnify();
        repairDynamicStyled();
    });
    replaceFaviconOnArchive(hostName)
    chrome.runtime.onMessage.addListener(messageListener);

    correctHeaderScroll(hostName);
}
