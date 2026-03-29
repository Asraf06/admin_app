const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

// 1. Add Leaflet
if (!html.includes('leaflet.css')) {
    html = html.replace('<script src="capacitor.js"></script>', `<script src="capacitor.js"></script>

    <!-- Leaflet Location Map -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=" crossorigin=""/>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" integrity="sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=" crossorigin=""></script>`);
}

// 2. Add Sidebar Navigation
if (!html.includes('switchTab(\'location\')')) {
    const customTabHtml = `                    </button>
                    <button onclick="switchTab('location')" id="btn-location" title="Campus Map"
                        class="nav-btn w-full text-left py-3 px-2 font-mono text-sm border-2 border-transparent hover:border-black dark:hover:border-white transition-all flex items-center gap-3 font-bold rounded-lg relative">
                        <i data-lucide="map" class="w-5 h-5 shrink-0 text-blue-600"></i>
                        <span
                            class="md:opacity-0 md:group-hover/admin:opacity-100 transition-opacity duration-200 whitespace-nowrap">Campus Map</span>
                    </button>
                    <button onclick="switchTab('attendance')" id="btn-attendance"`;
    html = html.replace(`                    </button>
                    <button onclick="switchTab('attendance')" id="btn-attendance"`, customTabHtml);
}

// 3. Remove old GPS Config from Attendance Tab (Regex matching the exact injected structure)
html = html.replace(/<!-- GPS Configuration Card -->[\s\S]*?<\/form>\s*<\/div>/, '');

// Revert grid from lg:grid-cols-3 back to md:grid-cols-2
html = html.replace('<div class="grid grid-cols-1 lg:grid-cols-3 gap-6">', '<div class="grid grid-cols-1 md:grid-cols-2 gap-6">');

// 4. Inject #tab-location
const locationTabHTML = `
            <!-- Location Map Tab -->
            <div id="tab-location" class="hidden h-screen bg-gray-100 dark:bg-zinc-900 flex flex-col fixed inset-0 md:static z-[45]">
                <!-- Mobile Toggle inside full screen mode -->
                <button onclick="toggleSidebar()"
                    class="md:hidden absolute top-4 left-4 z-50 p-2 bg-black text-white rounded-full shadow-lg">
                    <i data-lucide="menu" class="w-4 h-4"></i>
                </button>
                <div class="p-4 pl-16 md:pl-4 border-b-2 border-black dark:border-white bg-white dark:bg-black shrink-0 flex items-center justify-between z-40 relative">
                    <div>
                        <h2 class="text-xl font-bold uppercase tracking-widest flex items-center gap-2">
                            <i data-lucide="map" class="w-5 h-5 text-blue-600"></i> Campus Map
                        </h2>
                        <p class="text-[10px] font-mono opacity-50 mt-1 uppercase tracking-widest">Attendance GPS Zone Bounds</p>
                    </div>
                    <button onclick="saveVisualGPS()" class="px-6 py-2 bg-blue-600 text-white font-black uppercase tracking-widest text-[10px] hover:-translate-y-1 shadow-[4px_4px_0px_0px_rgba(37,99,235,0.5)] transition-all flex items-center gap-2 border-2 border-transparent">
                        <i data-lucide="save" class="w-4 h-4 hidden sm:block"></i> Save
                    </button>
                </div>
                
                <div class="flex-1 relative flex flex-col md:flex-row h-[calc(100vh-80px)] md:h-full overflow-hidden">
                    <!-- Sidebar settings -->
                    <div class="w-full md:w-80 bg-white dark:bg-black border-r-0 md:border-r-2 border-b-2 md:border-b-0 border-black dark:border-white p-6 shrink-0 z-10 flex flex-col overflow-y-auto">
                        <div class="mb-6">
                            <label class="block text-xs uppercase font-bold mb-2 tracking-widest">Search Area</label>
                            <div class="flex gap-2">
                                <input type="text" id="mapSearchInput" placeholder="Name or city..." class="flex-1 p-3 bg-gray-50 dark:bg-zinc-900 border-2 border-black dark:border-white font-mono text-xs outline-none focus:bg-white dark:focus:bg-black transition-colors rounded-none placeholder-gray-400">
                                <button type="button" onclick="searchMapLocation()" class="p-3 bg-black dark:bg-white text-white dark:text-black border-2 border-black dark:border-white hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors shadow-[2px_2px_0px_0px_rgba(37,99,235,1)]"><i data-lucide="search" class="w-4 h-4"></i></button>
                            </div>
                        </div>

                        <div class="p-4 border-2 border-black dark:border-white bg-blue-50 dark:bg-blue-950 shadow-[4px_4px_0px_0px_rgba(37,99,235,1)] text-black dark:text-white mb-6">
                            <h3 class="font-bold uppercase text-[10px] mb-3 text-blue-800 dark:text-blue-300 tracking-widest flex items-center gap-2 border-b border-blue-200 pb-2"><i data-lucide="crosshair" class="w-4 h-4"></i> Center Point</h3>
                            <div class="space-y-3">
                                <div>
                                    <label class="text-[9px] uppercase font-bold opacity-70">Latitude</label>
                                    <input type="number" step="any" id="mapLat" onchange="updateMapFromInputs()" class="w-full mt-1 p-2 bg-white dark:bg-black border-2 border-black dark:border-white font-mono text-[10px] outline-none">
                                </div>
                                <div>
                                    <label class="text-[9px] uppercase font-bold opacity-70">Longitude</label>
                                    <input type="number" step="any" id="mapLng" onchange="updateMapFromInputs()" class="w-full mt-1 p-2 bg-white dark:bg-black border-2 border-black dark:border-white font-mono text-[10px] outline-none">
                                </div>
                            </div>
                        </div>

                        <div class="mb-4">
                            <label class="block text-xs uppercase font-bold mb-4 tracking-widest flex items-center justify-between relative text-blue-600 dark:text-blue-400 mt-2">Zone Radius
                                <span id="mapRadiusLabel" class="text-[10px] font-black bg-blue-600 text-white px-2 py-0.5 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,1)]">150m</span>
                            </label>
                            <input type="range" id="mapRadiusSlider" min="10" max="1000" step="10" value="150" oninput="updateMapRadius(this.value)" class="w-full accent-blue-600 block mb-2 cursor-pointer h-2 bg-gray-200 rounded-lg appearance-none">
                            <div class="flex justify-between items-center mt-1 font-mono font-bold text-[9px] uppercase text-gray-400">
                                <span>10m</span>
                                <span>1km</span>
                            </div>
                        </div>

                        <div class="mt-auto pt-4 border-t-2 border-dashed border-gray-300 dark:border-gray-800 text-[9px] uppercase font-mono opacity-60 leading-relaxed text-center">
                            <i data-lucide="mouse-pointer-2" class="w-4 h-4 mx-auto mb-2 opacity-50 block"></i>
                            Simply pan the map to move the center crosshair.
                        </div>
                    </div>

                    <!-- The Map -->
                    <div id="leafletMap" class="flex-1 w-full h-[400px] md:h-full z-0 relative cursor-crosshair"></div>
                </div>
            </div>`;
            
if (!html.includes('id="tab-location"')) {
    html = html.replace('<!-- Chat Tab -->', locationTabHTML + '\n\n            <!-- Chat Tab -->');
}

// 5. Inject JS logic
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
                dashArray: '4, 4' // neo dashed style
            }).addTo(locationMap);

            locationMap.on('move', () => {
                const center = locationMap.getCenter();
                centerMarker.setLatLng(center);
                radiusCircle.setLatLng(center);
                document.getElementById('mapLat').value = center.lat.toFixed(6);
                document.getElementById('mapLng').value = center.lng.toFixed(6);
            });
            
            // Allow CSS parsing to finish then re-snap
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
                // Uses strictly open source OpenStreetMap nominatim to maintain privacy / free tier
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
if (!html.includes('async function searchMapLocation')) { // check if logic is already in
    html = html.replace('// declareOffDay', mapJSLogic + '\n\n        // declareOffDay');
}

// 6. Fix \`switchTab\` logic
// Remove the old GPS config stuff unconditionally from switchTab 
html = html.replace("if (tab === 'attendance') { loadOffDays(); loadActiveQRs(); loadGPSConfig(); }", "if (tab === 'attendance') { loadOffDays(); loadActiveQRs(); }");
html = html.replace(/async function loadGPSConfig[\s\S]*?\/\/ declareOffDay/g, "// declareOffDay");

// Insert the new location initialization logic
if (!html.includes('if (tab === \'location\') { setTimeout(() => initLocationMap(), 50); }')) {
    html = html.replace("if (tab === 'attendance') { loadOffDays(); loadActiveQRs(); }", "if (tab === 'attendance') { loadOffDays(); loadActiveQRs(); }\n            if (tab === 'location') { setTimeout(() => initLocationMap(), 50); }");
}

fs.writeFileSync('index.html', html, 'utf8');
console.log('Update map GUI completed!');
