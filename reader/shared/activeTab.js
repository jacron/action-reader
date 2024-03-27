function withActiveTab(cb) {
    chrome.tabs.query({
        active: true,
    }, tabs => {
        if (tabs.length > 0) {
            cb(tabs[0]);
        }
    });
}

export {withActiveTab}
