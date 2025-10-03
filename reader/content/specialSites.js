export const specialSites = [
    {
        hostname: 'www.ft.com',
        barrierSelector: '#barrier-page',
        favicon: 'ftlogo-v1_brand-ft-logo-square-coloured.svg'
    }, // Financial Times
    {
        hostname: 'www.washingtonpost.com',
        hostname2: 'washingtonpost.com',
        barrierSelector: '.teaser-content',
        favicon: 'favicon-washingtonpost.svg'
    },
    {
        hostname: 'www.demorgen.be',
        barrierSelector: '[data-tm-template=PURCHASE_EXCL__OVERLAY]',
        favicon: 'favicon-demorgen.png'
    },
    {
        hostname: 'www.newyorker.com',
        favicon: 'favicon-newyorker.ico',
        barrierSelector: '[class^=InContentBarrierContainer-]',
        delay: 5000
    },
    {
        hostname: 'www.wsj.com',
        barrierSelector: '#cx-snippet-overlay-container',
        favicon: 'wsj_favicon.svg'
    },
    {
        hostname: 'www.bloomberg.com',
        barrierSelector: '[class^=media-ui-Placeholder_shimmeringLine-',
        favicon: 'favicon-black.png'
    }
]

