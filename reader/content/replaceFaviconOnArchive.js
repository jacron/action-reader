// import {barrierSites} from "./barriersites.js";

import {barrierSites} from "./barriersites.js";

function originalHostOnArchive() {
    const tds = document.querySelectorAll('td');
    for (let td of tds) {
        if (td.innerText.includes('from host ')) {
            const a = td.querySelector('a');
            const hostName = a.innerText;
            const site = barrierSites.filter(s => s.hostname === hostName)[0];
            if (!site) {
                return barrierSites.filter(s => s.hostname2 === hostName)[0];
            }
            return site;
        }
    }
    return null;
}

async function setFaviconWithOverlay(favicon, letter = "a") {
    const baseUrl = chrome.runtime.getURL("assets/favicon/" + favicon);
    const img = new Image();
    img.src = baseUrl;

    img.onload = () => {
        const size = 32;
        const canvas = document.createElement("canvas");
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext("2d");

        ctx.drawImage(img, 0, 0, size, size);

        const badgeRadius = 5;
        const cx = size - badgeRadius;
        const cy = size - badgeRadius;
        ctx.beginPath();
        ctx.arc(cx, cy, badgeRadius, 0, Math.PI * 2);
        ctx.fillStyle = "white";
        ctx.fill();

        ctx.font = "bold 12px sans-serif";
        ctx.fillStyle = "red";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillText(letter, cx, cy);

        const newURL = canvas.toDataURL("image/png");
        document.querySelectorAll("link[rel*='icon']").forEach(e => e.remove());
        const link = document.createElement("link");
        link.rel = "icon";
        link.href = newURL;
        document.head.appendChild(link);
    };
}

export function replaceFaviconOnArchive(hostName) {
    if (hostName === 'archive.is') {
        const originalHost = originalHostOnArchive();
        if (!originalHost) return;
        setFaviconWithOverlay(originalHost.favicon).then();
    }
}
