function messageToContent(message) {
    chrome.tabs.query({
        active: true
    }, tabs => {
        chrome.tabs.sendMessage(tabs[0].id, message, () => {});
    })
}

function toggleOnOff(classList, cb) {
    if (classList.contains('on')) {
        classList.remove('on');
        classList.add('off');
        cb(false);
    } else {
        classList.remove('off');
        classList.add('on');
        cb(true);
    }
}

function toggleGeneralSettings(e) {
    toggleOnOff(e.target.classList, mode =>
    {
        messageToContent({message: 'toggleGeneralContent', mode})
    })
}

function toggleDarkSettings(e) {
    toggleOnOff(e.target.classList, mode =>
    {
        messageToContent({message: 'toggleDarkContent', mode})
    })
}

export {toggleGeneralSettings, toggleDarkSettings, messageToContent}
