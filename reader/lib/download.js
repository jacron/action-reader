function download(records, filename) {
    const json = JSON.stringify(records);
    const blob = new Blob([json], {type: "text/json"});
    const url = window.URL.createObjectURL(blob);
    chrome.downloads.download({
        url,
        filename,
        saveAs: true
    })
}

export {download}