import {fetchArchiveContent} from "./fetchArchiveContent.js";

const barrierSelectors = [
    '#barrier-page', // Financial Times
    '.teaser-content', // Washington Post
    '[data-tm-template=PURCHASE_EXCL__OVERLAY]', // De Morgen
    '[class*=InContentBarrier]', // The New Yorker
]
const delayableSites = [
    'www.newyorker.com', // The New Yorker
];
const probableBarrierSites = [
    'www.ft.com', // Financial Times
    'www.washingtonpost.com', // Washington Post
    'www.demorgen.be', // De Morgen
]

function isHomePage(href) {
    // url without querystring
    const url = href.split('?')[0];
    // check if the url is a homepage
    const slashes = url.split('/');
    // e.g. https://www.washingtonpost.com/
    if (slashes.length < 5) {
        console.log('*** Home page detected');
        return true; // home page
    }
}

function isProbableBarrierPage() {
    for (const site of probableBarrierSites) {
        if (document.location.hostname.includes(site) && !isHomePage(document.location.href)) {
            console.log(`*** ${site}: barrier-page detected`);
            return true;
        }
    }
}

function toArchive() {
    console.log('*** toArchive called');
    const w = document.location.href.split('?');
    const url = 'https://archive.is/search/?q=' + w[0];
    fetchArchiveContent(url);
    // document.location.replace(url);
}

function toArchiveAgain() {
    for (const selector of barrierSelectors) {
        if (document.querySelector(selector)) {
            toArchive();
            return true;
        }
    }
    return false;
}

function toArchiveOnBarrier() {
    if (toArchiveAgain()) return true;
    if (delayableSites.includes(document.location.hostname)) {
        console.log('Delayable site detected, waiting for barrier...');
        setTimeout(() => {
            if (toArchiveAgain()) return true;
            console.log('No barrier found');
            return false;
        }, 6000);
    }
    return false;
}



export { toArchiveOnBarrier, isProbableBarrierPage };
