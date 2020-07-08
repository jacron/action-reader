import {compile} from './compile.mjs';
/*
// probleem 1
@media (min-width: 1024px) {
    .css-1ygdjhk {
        margin-left: -15px;
        margin-right: 0;
        width: 500px;
        max-width: initial;
    }
}
@media (min-width: 102px) {
    .css-adam {
        width: 500px;
        max-width: initial;
    }
}
// probleem 2
#readerarticle {
    a, b {
        color: yellow;
    }
}
*/
const scss = `// scss
#id1, 
#id2 {
    color: green;
}
@media (min-width: 102px) {
    .css-adam {
        width: 500px;
        max-width: initial;
    }
}
#readerarticle {
    background-color: #666;
    a:after {
        background-color: purple;
    }
    a, .bag {
        color: yellow;
    }
    box-shadow: 0 6px 12px 3px rgba(0, 0, 0, 0.24);
    a {
        color: rgb(90, 200, 250) !important;
        text-decoration: none;
        border-bottom: none !important;
    } 
    * {
        color: rgba(255, 255, 255, 0.780392);
        background-color: #666;
    }
    aside * {
        color: inherit;
    }
} 
.content-container {
    background-color: #555;
}
html.article-page {
    background-color: #333333;
}
    `;

const problem = `// scss
#readerarticle {
    .split-screen-content-header-theme-standard .split-screen-content-header__main,
    h1, p {
        background-color: rgb(74, 74, 77) !important;
    }
    .split-screen-content-header-theme-standard .caption__text, .split-screen-content-header-theme-standard .split-screen-content-header__publish-date,
    .grid, figcaption.caption__text  {
        color: rgba(255, 255, 255, 0.780392) !important;
    }
    .grid .body__container>p.has-dropcap.has-dropcap__lead-standard-heading:first-letter {
        color: yellow;
    }
}
`;

const css = compile(problem);
console.log(css);

