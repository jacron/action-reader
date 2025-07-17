function lastThumbBlockItemHref(doc) {
    const divs = doc.querySelectorAll('.THUMBS-BLOCK > div');
    if (divs.length) {
        const lastDiv = divs[divs.length - 1];
        if (lastDiv) {
            return lastDiv.querySelector('a');
        }
    }
    return false;
}

function isNotGlobalSite(url) {
    const w = url.split('/');
    return w.length > 4;
}

export function fetchArchiveContent(url) {
    fetch(url)
        .then(response => response.text())
        .then(html => {
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const lastHref = lastThumbBlockItemHref(doc);
            const referer = doc.forms[0].querySelector('input[name=q]').value;
            if (lastHref) {
                if (isNotGlobalSite(referer)) {
                    console.log('*** Redirecting to last thumb block item:', lastHref.href);
                    document.location.replace(lastHref.href);
                } else {
                    return null;
                }
            }
        })
        .catch(error => {
            console.error('Error fetching archive:', error);
        });
}
