function isNotGlobalSite(url) {
    const w = url.split('/');
    return w.length > 4;
}

export function fetchArchiveContent(url) {
    fetch(`http://localhost:3099/archive-thumbs?url=${encodeURIComponent(url)}`)
        .then(response => response.json())
        .then(data => {
            console.log(`*** Found ${data.count} thumbnails`);
            console.log(data);
            const {thumbLinks, referer} = data;
            if (thumbLinks && thumbLinks.length > 0) {
                const lastHref = thumbLinks[thumbLinks.length - 1];
                if (referer) {
                    console.log('*** Found referer:', referer);
                    if (isNotGlobalSite(referer)) {
                        console.log('*** Redirecting to last thumb block item:', lastHref);
                        document.location.replace(lastHref);
                    }
                }
            } else {
                console.log('*** No last thumb block item found');
                document.location.replace(url);
            }
        })
        .catch(error => {
            console.error('Error fetching archive via Puppeteer API:', error);
        });
}
