const avoidablePages = [
    '/scrypto/',
    'nrc.nl/regio/'
];

export function isAvoidablePage() {
    for (const avoidable of avoidablePages) {
        if (document.location.href.indexOf(avoidable) > -1) {
            console.log(`*** ${avoidable} page detected, not running content script`);
            return true; // don't run on these pages
        }
    }
    return false;
}

