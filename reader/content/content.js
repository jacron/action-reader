import {parseFunctionInStyle} from "../shared/parse/parse.js";
import {initedHost, keysGeneral, StorageArea, styleIds} from "../shared/constants.js";
import {deleteReaderArticle, reSelect, select} from "./select.js";
import {getClassAndIdNames} from "../shared/suggestions.js";
import {vaultToHead} from "./vault.js";
import {correctHeaderScroll} from "./correctionOnPageNavigation.js";

const barrierSelectors = [
    '#barrier-page', // Financial Times
    '.teaser-content', // Washington Post
    '[data-tm-template=PURCHASE_EXCL__OVERLAY]', // De Morgen
]
const avoidablePages = [
    'nrc.nl/scrypto/',
    'nrc.nl/regio/'
];

/* initieel is readerOn true, als een soort quasi global hier */
let readerOn = true;

/* ft.com has some hard to hide elements */
let annoying = [];

function getHostDelay(hostName) {
    const keys = [hostName];
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            const obj = results[hostName];
            if (obj) {
                resolve(obj.delay);
            }
        });
    })
}

function getJcReaderHost(url) {
    if (!url) {
        return url;
    }
    url = url.replace(/https?:\/\//, '');
    const host = url.split('/')[0];
    return host.replace('www.', '');
}

function injectStyle(css, id) {
    removeStyle(id);
    const styleElement = document.createElement('style');
    styleElement.id = id;
    styleElement.innerHTML = css;
    document.head.appendChild(styleElement);
}

function removeStyle(id) {
    const style = document.getElementById(id);
    if (style) style.parentNode.removeChild(style);
    // else console.log(id + ' is een onbekend style element')
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

function removeMyStyles() {
    for (const theme in styleIds) {
        for (const styleId of Object.values(styleIds[theme])) {
            removeStyle(styleId);
        }
    }
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

function reinjectStyles() {
    const {custom, darkText, defaultText} = initedHost;
    /* dark styles */
    injectStyle(custom.dark, 'splash-custom-dark-style');
    injectStyle(darkText, 'splash-dark-style');
    /* default styles */
    injectStyle(custom.default, 'splash-custom-default-style');
    injectStyle(defaultText, 'splash-default-style');
    /* correct later injected styles */
    hideAnnoying();
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

const actionBindings = {
    replaceStyle,
    reSelect,
    toggleGeneralContent,
    toggleDarkContent,
    toggleDark,
    toggleReader
};

function initActions(req, sendResponse) {
    if (req.message) {
        // console.log(req)
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

function fromStorage(keys) {
    return new Promise((resolve) => {
        StorageArea.get(keys, results => {
            resolve(results)
        });
    });
}

function messageListener(req, sender, sendResponse) {
    initActions(req, sendResponse);
}

/**
 * laat js elementen verbergen... maar let erop dat het element readerarticle een duplicaat is
 * dus verberg alle elementen die op een selector passen
 */
function hideAnnoying() {
    if (annoying.length) {
        for (const selector of annoying.split('\n')) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements) {
                    for (const element of elements) {
                        element.style.display = 'none';
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }

    }
}

async function setDefaultStyles(websiteProps, immersive) {
    const defaultStyleObject = await fromStorage(keysGeneral.default);
    const defaultStyle = defaultStyleObject[keysGeneral.default];
    if (immersive) {
        injectStyle(defaultStyle, styleIds.general.default);
        initedHost.defaultText = defaultStyle;
    }
    injectStyle(websiteProps.default, styleIds.custom.default);
    parseFunctionInStyle(websiteProps.default, results => annoying = results);
}

async function setDarkStyles(websiteProps, immersive) {
    if (immersive) {
        const darkStyleObject = await fromStorage(keysGeneral.dark);
        const darkStyle = darkStyleObject[keysGeneral.dark];
        injectStyle(darkStyle, styleIds.general.dark);
        initedHost.darkText = darkStyle;
    }
    else {
        injectStyle(websiteProps.dark, styleIds.custom.dark);
        document.body.classList.add('dark');
    }
}

async function setStyles(websiteProps, hostName) {
    /* als er geen selector aanwezig is of van toepassing is, is immersive false */
    const immersive = select(websiteProps.selector, useHeaderTitle);
    await setDefaultStyles(websiteProps, immersive);
    await setDarkStyles(websiteProps, immersive);
    getHostDelay(hostName).then(delay => {
        if (delay) {
            setTimeout(() => reinjectStyles(), +delay);
        }
    })
}

/**
 *
 * @param {null|string} hostName (referer)
 * @returns {Promise<void>}
 */
async function contentInitHost(hostName = null) {
    const websitePropsObject = await fromStorage(hostName);
    if (websitePropsObject) {  // host exists
        StorageArea.set({['hostname']: hostName}, () => {});
        const websiteProps = websitePropsObject[hostName];
        initedHost.custom = websiteProps;
        if (websiteProps && websiteProps.active === 'on') {
            await setStyles(websiteProps, hostName);
        }
    }
}

function isNotGlobalSite(url) {
    const w = url.split('/');
    // console.log(url); // https://fd.nl/
    // console.log(w); // (4) ['https:', '', 'fd.nl', '']
    return w.length > 4;
}

function toArchive() {
    console.log('*** toArchive called');
    const w = document.location.href.split('?');
    const url = 'https://archive.is/search/?q=' + w[0];
    document.location.replace(url);
}

function toArchiveOnBarrier() {
    for (const selector of barrierSelectors) {
        if (document.querySelector(selector)) {
            toArchive();
            return true;
        }
    }
    return false;
}

let useHeaderTitle = false;

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

function lastThumbBlockItemHref() {
    const divs = document.querySelectorAll('.THUMBS-BLOCK > div');
    if (divs.length) {
        const lastDiv = divs[divs.length - 1];
        if (lastDiv) {
            return lastDiv.querySelector('a');
        }
    }
    return false;
}

function onArchiveIs() {
    const lastHref = lastThumbBlockItemHref();
    const referer = document.forms[0].querySelector('input[name=q]').value;
    // console.log('referer=' + referer);
    if (lastHref) {
        if (isNotGlobalSite(referer)) {
            lastHref.click(); // This stops further processing
        } else {
            return null;
        }
    } else {
        useHeaderTitle = true;
        // treat referer as hostName
        return getJcReaderHost(referer);
    }
}

function getCurrentHost() {
    let hostName = getJcReaderHost(document.location.href);
    if (hostName === 'archive.is') {
        onArchiveIs()
    }
    return hostName;
}

function openArchiveMostRecentFound(hostName) {
    if (hostName === 'archive.is') {
        // If on 'archive.is', we need to handle the click on the last thumbnail.
        const lastHref = lastThumbBlockItemHref();
        if (lastHref) {
            lastHref.addEventListener('click', () => {
                setTimeout(() => {
                    const newHostName = onArchiveIs();
                    if (newHostName) {
                        contentInitHost(newHostName).then(() => {
                            getClassAndIdNames();
                            hideAnnoying();
                            imgMagnify();
                        });
                    }
                }, 1000);
            });
        }
    }
}

function isAvoidablePage() {
    for (const avoidable of avoidablePages) {
        if (document.location.href.indexOf(avoidable) > -1) {
            console.log(`*** ${avoidable} page detected, not running content script`);
            return true; // don't run on these pages
        }
    }
    return false;
}

/**
 * this export is making content.js a module
 */
// noinspection JSUnusedGlobalSymbols
export function main() {
    if (isAvoidablePage()) return; // don't run on avoidable pages
    if (toArchiveOnBarrier()) return; // Go to 'archive.is' on barrier pages.

    setTimeout(() => {
        toArchiveOnBarrier();
    }, 1000); // check again after 1 second
    const hostName = getCurrentHost();
    console.log(`*** contentscript loaded for jreader, in ${hostName}!`);
    contentInitHost(hostName).then(() => {
        getClassAndIdNames();
        hideAnnoying();
        imgMagnify();
    });
    chrome.runtime.onMessage.addListener(messageListener);

    openArchiveMostRecentFound(hostName);
    correctHeaderScroll(hostName);
}

export {injectStyle, removeStyle}
