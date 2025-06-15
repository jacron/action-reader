(async () => {
    const src = chrome.runtime.getURL('content/content.js');
    /** @type {{ main: Function }} */
    const contentScript = await import(src);
    contentScript.main();
})();
