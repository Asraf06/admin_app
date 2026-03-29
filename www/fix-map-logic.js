const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const mapJSLogic = `
        // == LOCATION MAP ADMIN LOGIC ==
        let locationMap = null;
        let centerMarker = null;
        let radiusCircle = null;

        async function initLocationMap() {
            if (locationMap) {
                locationMap.invalidateSize();
                return; 
            }
            
            let lat = 23.8103;
            let lng = 90.4125;
            let radius = 150;

            try {
                const docSnap = await db.collection('settings').doc('gps_config').get();
                if (docSnap.exists) {
                    const data = docSnap.data();
                    if(data.lat) lat = data.lat;
                    if(data.lng) lng = data.lng;
                    if(data.radius) radius = data.radius;
                }
            } catch(e) { console.error("Error loading GPS config for map:", e); }

            document.getElementById('mapLat').value = lat;
            document.getElementById('mapLng').value = lng;
            document.getElementById('mapRadiusSlider').value = radius;
            document.getElementById('mapRadiusLabel').textContent = radius + "m";

            locationMap = L.map('leafletMap', { zoomControl: false }).setView([lat, lng], 17);
            L.control.zoom({ position: 'bottomright' }).addTo(locationMap);

            L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
                attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
                maxZoom: 20
            }).addTo(locationMap);

            const crosshairIcon = L.divIcon({
                className: 'custom-crosshair border-none bg-transparent',
                html: '<div style="width:24px;height:24px;border:3px solid #2563EB;border-radius:50%;position:relative;background:rgba(255,255,255,0.6);box-shadow:0px 4px 10px rgba(0,0,0,0.5);"><div style="width:6px;height:6px;background:#2563EB;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);"></div></div>',
                iconSize: [24, 24],
                iconAnchor: [12, 12]
            });

            centerMarker = L.marker([lat, lng], {icon: crosshairIcon}).addTo(locationMap);
            
            radiusCircle = L.circle([lat, lng], {
                color: '#2563EB',
                fillColor: '#3B82F6',
                fillOpacity: 0.15,
                radius: radius,
                weight: 2,
                dashArray: '4, 4'
            }).addTo(locationMap);

            locationMap.on('move', () => {
                const center = locationMap.getCenter();
                centerMarker.setLatLng(center);
                radiusCircle.setLatLng(center);
                document.getElementById('mapLat').value = center.lat.toFixed(6);
                document.getElementById('mapLng').value = center.lng.toFixed(6);
            });
            
            setTimeout(() => {
                locationMap.invalidateSize();
                locationMap.setView([lat, lng], 17);
            }, 300);
        }

        function updateMapFromInputs() {
            if(!locationMap) return;
            const lat = parseFloat(document.getElementById('mapLat').value);
            const lng = parseFloat(document.getElementById('mapLng').value);
            if(!isNaN(lat) && !isNaN(lng)) locationMap.setView([lat, lng], locationMap.getZoom());
        }

        function updateMapRadius(val) {
            const radius = parseInt(val);
            document.getElementById('mapRadiusLabel').textContent = radius + "m";
            if (radiusCircle) radiusCircle.setRadius(radius);
        }

        async function searchMapLocation() {
            const query = document.getElementById('mapSearchInput').value.trim();
            if (!query) return;
            try {
                showCustomAlert("Exploring", "Locating over network...", "info");
                const res = await fetch(\`https://nominatim.openstreetmap.org/search?format=json&q=\${encodeURIComponent(query)}\`, {
                    headers: { 'Accept-Language': 'en' }
                });
                const data = await res.json();
                if(data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lng = parseFloat(data[0].lon);
                    locationMap.setView([lat, lng], 17);
                    showCustomAlert("Success", \`Identified: \${data[0].display_name.substring(0, 40)}...\`, "success");
                } else {
                    showCustomAlert("Missing Data", "Location query yielded zero geographic matches.", "error");
                }
            } catch(e) {
                console.error(e);
                showCustomAlert("Error", "Routing search completely rejected.", "error");
            }
        }

        async function saveVisualGPS() {
            const lat = parseFloat(document.getElementById('mapLat').value);
            const lng = parseFloat(document.getElementById('mapLng').value);
            const radius = parseInt(document.getElementById('mapRadiusSlider').value);

            try {
                showCustomAlert("Saving", "Uploading map zone policy...", "info");
                await db.collection('settings').doc('gps_config').set({ lat, lng, radius }, { merge: true });
                showCustomAlert("Secure", "Area enforcement verified.", "success");
            } catch(err) { showCustomAlert("Error", err.message, "error"); }
        }
`;

if (!html.includes('function initLocationMap')) {
    html = html.replace('</script>\n</body>', mapJSLogic + '\n</script>\n</body>');
    fs.writeFileSync('index.html', html, 'utf8');
    console.log('Injected JS.');
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Done fixing missing JS logic.');
