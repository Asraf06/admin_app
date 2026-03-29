const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// Replace standard high z-indexes with even higher ones to conquer Leaflet
html = html.replace(/z-\[200\]/g, 'z-[9999]');
html = html.replace(/z-\[300\]/g, 'z-[9999]');
html = html.replace(/z-\[250\]/g, 'z-[9999]');

// Increase the Toast Container z-index as well, usually 'z-50' or 'z-something'
// I'll just find id="toast-container" and enforce z-[9999]
html = html.replace(/id="toast-container" class="([^"]*)"/g, (match, classes) => {
    // remove existing z-index
    let newClasses = classes.replace(/z-\[?[0-9]+\]?/g, '');
    return 'id="toast-container" class="' + newClasses.trim() + ' z-[9999]"';
});

fs.writeFileSync('index.html', html, 'utf8');
console.log('Fixed z-indexes for overlays and toasts.');
