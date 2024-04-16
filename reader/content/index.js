(async () => {
    const src = chrome.runtime.getURL('content/content.js');
    const contentScript = await import(src);
    contentScript.main();
})();
