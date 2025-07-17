/* ft.com has some hard-to-hide elements */
let annoying = [];
export function setAnnoying(annoyingSelectors) {
    if (annoyingSelectors) {
        annoying = annoyingSelectors;
    } else {
        annoying = [];
    }
}

/**
 * laat js elementen verbergen... maar let erop dat het element readerarticle een duplicaat is
 * dus verberg alle elementen die op een selector passen
 */
export function hideAnnoying() {
    if (annoying.length) {
        for (const selector of annoying.split('\n')) {
            try {
                const elements = document.querySelectorAll(selector);
                if (elements) {
                    for (const element of elements) {
                        element.style.display = 'none';
                    }
                }
            } catch (e) {
                console.error(e)
            }
        }

    }
}

