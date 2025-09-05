export const barrierSites = [
    {
        hostname: 'www.ft.com',
        barrierSelector: '#barrier-page',
        favicon: 'https://images.ft.com/v3/image/raw/ftlogo-v1%3Abrand-ft-logo-square-coloured?source=page-kit&format=svg'
    }, // Financial Times
    {
        hostname: 'www.washingtonpost.com',
        barrierSelector: '.teaser-content',
        favicon: 'https://www.washingtonpost.com/favicon.svg'
    },
    {
        hostname: 'www.demorgen.be',
        barrierSelector: '[data-tm-template=PURCHASE_EXCL__OVERLAY]',
        favicon: 'https://www.demorgen.be/static/favicon-196x196.png'
    },
    {
        hostname: 'www.newyorker.com',
        favicon: 'https://www.newyorker.com/verso/static/thenewyorker-us/assets/favicon.ico',
        delay: 6000
    },
    {
        hostname: 'www.wsj.com',
        barrierSelector: '#cx-snippet-overlay-container',
        favicon: 'https://s.wsj.net/img/meta/wsj_favicon.svg'
    },
    {
        hostname: 'www.bloomberg.com',
        barrierSelector: '[class^=media-ui-Placeholder_shimmeringLine-',
        favicon: 'https://www.bloomberg.com/favicon-black.png'
    }
]

