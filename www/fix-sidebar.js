const fs = require('fs');
let html = fs.readFileSync('index.html', 'utf8');

const t = `                    <button onclick="switchTab('chat')" id="btn-chat" title="Chats"`;

const r = `                    <!-- Location Map Tab Button -->
                    <button onclick="switchTab('location')" id="btn-location" title="Campus Map"
                        class="nav-btn w-full text-left py-3 px-2 font-mono text-sm border-2 border-transparent hover:border-black dark:hover:border-white transition-all flex items-center gap-3 font-bold rounded-lg relative">
                        <i data-lucide="map" class="w-5 h-5 shrink-0 text-blue-600"></i>
                        <span
                            class="md:opacity-0 md:group-hover/admin:opacity-100 transition-opacity duration-200 whitespace-nowrap">Campus Map</span>
                    </button>
                    <button onclick="switchTab('chat')" id="btn-chat" title="Chats"`;

html = html.replace(t, r);
fs.writeFileSync('index.html', html, 'utf8');
console.log('Sidebar fixed.');
