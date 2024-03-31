function withActiveTab(cb) {
    return new Promise((resolve, reject) => {
        chrome.tabs.query({
            active: true
        }, tabs => {
            if (tabs.length > 0) {
                resolve(tabs[0]);
            } else {
                reject();
            }
        });
    })
}

export {withActiveTab}
