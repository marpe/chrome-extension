const sheet = new CSSStyleSheet();
sheet.replaceSync(`
.ytp-cairo-refresh .ytp-swatch-background-color {
    background: #0e82ff;
}

.ytp-cairo-refresh-signature-moments .ytp-play-progress {
    background: linear-gradient(to right, #0e82ff 80%, #7bceff 100%);
}
`);

document.adoptedStyleSheets.push(sheet);
