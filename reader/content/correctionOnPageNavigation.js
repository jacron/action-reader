const hosts = [{
    name: 'theatlantic.com',
    selectors: ['#main-navigation',],
}];

function adjustScroll(headerHeight) {
    document.addEventListener("keydown", (e) => {
        if (e.code === "PageDown") {
            // Even wachten tot de browser zijn standaard scroll doet
            setTimeout(() => {
                window.scrollBy(0, -headerHeight);
            }, 0);
        }
        if (e.code === "PageUp") {
            // Even wachten tot de browser zijn standaard scroll doet
            setTimeout(() => {
                window.scrollBy(0, -headerHeight);
            }, 0);
        }
    });
}

function getHeaderHeight() {
    let headerHeight = 0;
    const headerSelectors = [
        '#main-navigation',
    ]
    for (const selector of headerSelectors) {
        const element = document.querySelector(selector);
        headerHeight += element?.offsetHeight || 0;
    }
    return headerHeight;
}

function correctHeaderScroll(hostName) {
    for (const host of hosts) {
        if (hostName === host.name) {
            const headerHeight = getHeaderHeight(host.selectors);
            adjustScroll(headerHeight);
        }
    }
}

export {correctHeaderScroll};
