const avoidablePages = [
    '/scrypto/',
    'nrc.nl/regio/'
];
const avoidableSelectors = [
    {
        selector: '[class^=dmt-podcastheader_]',
        host: 'www.nrc.nl'
    }
];

export async function isAvoidablePage() {
    const url = document.location.href;
    for (const avoidable of avoidablePages) {
        if (url.indexOf(avoidable) > -1) {
            console.log(`*** ${avoidable} page detected, not running content script`);
            return true; // don't run on these pages
        }
    }
    for (const {host, selector} of avoidableSelectors) {
        if (url.indexOf(host) > -1) {
            console.log(`*** ${host} host detected, maybe not running content script`);
            await new Promise(r => setTimeout(r, 500));
            console.log(`*** checking for selector: ${selector}`)
            if (document.querySelector(selector)) {
                console.log(`*** ${selector} selector detected, not running content script`);
                return true; // don't run on these pages
            }
        }
    }
    return false;
}

