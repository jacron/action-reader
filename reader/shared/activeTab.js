function withActiveTab() {
    return new Promise((resolve, reject) => {
        chrome.windows.getCurrent({
            populate: true
        }).then(window => {
            const activeTab = window.tabs.filter(tab => tab.active);
            if (activeTab.length > 0) {
                resolve(activeTab[0]);
            } else {
                reject();
            }
        })
    })
}

export {withActiveTab}
