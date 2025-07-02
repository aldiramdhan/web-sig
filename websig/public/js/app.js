document.addEventListener("livewire:init", function () {
    var map = L.map("indonesia-map").setView([-2.5489, 118.0149], 5); // Center Indonesia

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
});
const API_KEY = "0";
const map = L.map("map").setView([-2.5489, 118.0149], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let marker;
let polygonLayer;
let childPolygonsLayer;
let currentAdminLevel = null;
let currentLocation = null;

async function searchLocation(clickedLocation) {
    // Use either the clicked location name or the input value
    const location = clickedLocation || document.getElementById("locationInput").value;
    if (!location) return alert("Masukkan lokasi!");
    
    // Store current location for reference
    currentLocation = location;

    const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${location}&format=json&polygon_geojson=1`
    );
    const geoData = await geoRes.json();
    if (!geoData.length) return alert("Lokasi tidak ditemukan!");

    const { lat, lon, display_name, geojson, osm_type, osm_id } = geoData[0];
    map.setView([lat, lon], 10);

    // Clear previous layers
    if (marker) map.removeLayer(marker);
    if (polygonLayer) {
        map.removeLayer(polygonLayer);
        polygonLayer = null;
    }
    if (childPolygonsLayer) {
        map.removeLayer(childPolygonsLayer);
        childPolygonsLayer = null;
    }

    // Removed marker creation as per request

    // Add parent polygon if available
    if (geojson) {
        polygonLayer = L.geoJSON(geojson, {
            style: {
                color: "#1d4ed8",
                weight: 3,
                fillOpacity: 0.1,
            },
        }).addTo(map);
        map.fitBounds(polygonLayer.getBounds());
    }

    fetchTopicData(location);

    // Automatically show the sidebar and adjust map
    const sidebar = document.getElementById('sidebar');
    sidebar.classList.add("show");
    document.getElementById('main-container').style.gridTemplateColumns = '400px 1fr';
    setTimeout(() => {
        map.invalidateSize();
        if (polygonLayer) {
            map.fitBounds(polygonLayer.getBounds());
        }
    }, 300);

    // Determine admin level based on OSM data
    // This is a simplistic approach - in a real app, you might want to use the actual admin_level from OSM
    let adminLevel;
    if (osm_type === 'relation' && display_name.includes('country')) {
        adminLevel = 2; // Country level
    } else if (display_name.includes('province') || display_name.includes('prefecture') || display_name.includes('state')) {
        adminLevel = 4; // Province/state level
    } else if (display_name.includes('regency') || display_name.includes('district') || display_name.includes('county')) {
        adminLevel = 6; // Regency/district level
    } else if (display_name.includes('subdistrict') || display_name.includes('kecamatan')) {
        adminLevel = 8; // Subdistrict/kecamatan level
    } else {
        // Default to country level if we can't determine
        adminLevel = 2;
    }
    
    currentAdminLevel = adminLevel;
    
    // Fetch child administrative boundaries
    if (geojson && adminLevel < 8) { // Don't fetch children for subdistricts (kecamatan)
        fetchAdminBoundaries(geojson, adminLevel);
    }
}

async function fetchAdminBoundaries(parentGeojson, parentAdminLevel) {
    try {
        // Calculate bounding box from parent geojson
        let bounds = L.geoJSON(parentGeojson).getBounds();
        let south = bounds.getSouth();
        let west = bounds.getWest();
        let north = bounds.getNorth();
        let east = bounds.getEast();

        // Determine child admin level based on parent admin level
        let childAdminLevel;
        if (parentAdminLevel === 2) { // Country
            childAdminLevel = 4; // States/Provinces
        } else if (parentAdminLevel === 4) { // State/Province
            childAdminLevel = 6; // Districts/Regencies
        } else if (parentAdminLevel === 6) { // District/Regency
            childAdminLevel = 8; // Subdistricts/Kecamatan
        } else {
            console.log('No child admin levels to fetch for this level');
            return;
        }

        // Query for administrative boundaries within the bounding box
        let query = `[out:json];
        (relation["boundary"="administrative"]["admin_level"="${childAdminLevel}"](${south},${west},${north},${east});
         node["place"~"city|town|village"](${south},${west},${north},${east});
        );
        out geom;`;

        const overpassUrl = 'https://overpass-api.de/api/interpreter';
        const response = await fetch(overpassUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'data=' + encodeURIComponent(query)
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Overpass API error: ${response.status} ${response.statusText} - ${errorText}`);
        }

        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
            const errorText = await response.text();
            throw new Error(`Expected JSON but received ${contentType}: ${errorText}`);
        }

        const data = await response.json();
        console.log('Child admin boundaries:', data);

        // Convert Overpass data to GeoJSON using osmtogeojson library
        const geojsonData = osmtogeojson(data);

        // Remove previous child polygons layer if it exists
        if (childPolygonsLayer) {
            map.removeLayer(childPolygonsLayer);
        }

        // Add the child polygons to the map
        childPolygonsLayer = L.geoJSON(geojsonData, {
            style: function (feature) {
                return { color: "#4ade80", weight: 2, fillOpacity: 0.05, fillColor: '#4ade80' };
            },
            onEachFeature: function (feature, layer) {
                if (feature.properties && feature.properties.name) {
                    layer.bindTooltip(feature.properties.name, { permanent: false, direction: "auto" });
                }
                layer.on('mouseover', function () {
                    if (layer && typeof layer.setStyle === 'function') {
                        layer.setStyle({
                            weight: 5,
                            color: '#666',
                            dashArray: '',
                            fillOpacity: 0.7
                        });
                    }
                    if (childPolygonsLayer) {
                        childPolygonsLayer.bringToFront();
                    }
                });
                layer.on('mouseout', function () {
                    // Check if layer is a valid Leaflet Path object before calling setStyle
                    if (layer && typeof layer.setStyle === 'function') {
                        layer.setStyle({
                            weight: 2,
                            color: '#3388ff',
                            dashArray: '',
                            fillOpacity: 0.2
                        });
                    }
                });
                layer.on('click', function() {
                    // Only allow drill-down if not at the lowest level (kecamatan)
                    if (childAdminLevel < 8 && feature.properties && feature.properties.name) {
                        // Trigger search for this child location
                        searchLocation(feature.properties.name);
                    }
                });
            }
        }).addTo(map);
    } catch (error) {
        console.error('Error fetching admin boundaries:', error);
    }
}

async function fetchTopicData(location) {
    const topics = [
        {
            key: "📜 Sejarah",
            prompt: `Jelaskan sejarah dan perkembangan ${location}. Tulis dalam bahasa Indonesia.`,
        },
        {
            key: "🌍 Geografi",
            prompt: `Deskripsikan kondisi geografis ${location} termasuk bentang alam, iklim, dan distribusi manusia. Tulis dalam bahasa Indonesia.`,
        },
        {
            key: "🏛️ Politik & Pemerintahan",
            prompt: `Gambarkan struktur pemerintahan, kebijakan penting, dan dinamika politik di ${location}. Tulis dalam bahasa Indonesia.`,
        },
        {
            key: "🌱 Lingkungan",
            prompt: `Jelaskan kondisi lingkungan di ${location} termasuk hutan, satwa liar, isu perubahan iklim, dan upaya pelestarian. Tulis dalam bahasa Indonesia.`,
        },
        {
            key: "🧪 Sains & Teknologi",
            prompt: `Sorot perkembangan sains dan teknologi di ${location}, termasuk inovasi lokal dan institusi riset. Tulis dalam bahasa Indonesia.`,
        },
        {
            key: "🛡️ Keamanan",
            prompt: `Diskusikan isu-isu keamanan dalam negeri di ${location}, seperti kejahatan, bencana, atau keamanan siber. Tulis dalam bahasa Indonesia.`,
        },
        {
            key: "🌾 Pertanian",
            prompt: `Jelaskan profil pertanian di ${location}, mencakup komoditas utama, irigasi, dan tantangan. Tulis dalam bahasa Indonesia.`,
        },
        {
            key: "💼 Ekonomi",
            prompt: `Deskripsikan struktur ekonomi di ${location}, termasuk sektor industri, perdagangan, dan infrastruktur. Tulis dalam bahasa Indonesia.`,
        },
    ];

    document.getElementById("tabs").innerHTML = "<p>🔄 Memuat insight...</p>";
    document.getElementById("tabContents").innerHTML = "";

    const responses = await Promise.all(
        topics.map((t) => queryGemini(t.prompt))
    );

    const tabsContainer = document.getElementById("tabs");
    const tabContentsContainer = document.getElementById("tabContents");

    tabsContainer.innerHTML = "";
    tabContentsContainer.innerHTML = "";

    topics.forEach((topic, index) => {
        const tab = document.createElement("div");
        tab.className = "tab" + (index === 0 ? " active" : "");
        tab.textContent = topic.key;
        tab.dataset.index = index;
        tabsContainer.appendChild(tab);

        const tabContent = document.createElement("div");
        tabContent.className = "tab-content" + (index === 0 ? " active" : "");

        const formatted = formatResponse(responses[index]);

        const contentBox = document.createElement('div');
        contentBox.className = 'content-box';
        contentBox.innerHTML = `<h3>${topic.key}</h3>${formatted}`;

        if (topic.key === '🌍 Geografi' || topic.key === '💼 Ekonomi') {
            const canvas = document.createElement('canvas');
            contentBox.appendChild(canvas);
            // Placeholder for chart data
            const chartData = {
                labels: ['2010', '2015', '2020'],
                datasets: [{
                    label: 'Population/GDP',
                    data: [100, 120, 150],
                    borderColor: '#4338ca',
                    tension: 0.1
                }]
            };
            new Chart(canvas, {
                type: 'line',
                data: chartData,
            });
        }

        tabContent.appendChild(contentBox);

        generateTopicInsight(location, topic.key).then((insight) => {
            const insightBox = document.createElement("div");
            insightBox.className = "content-box";
            insightBox.innerHTML = `
            <h3>📌 Wawasan Penting (${topic.key})</h3>
            ${insight}
          `;
            tabContent.appendChild(insightBox);
        });

        tabContentsContainer.appendChild(tabContent);

        tab.addEventListener("click", () => {
            document
                .querySelectorAll(".tab")
                .forEach((t) => t.classList.remove("active"));
            document
                .querySelectorAll(".tab-content")
                .forEach((c) => c.classList.remove("active"));
            tab.classList.add("active");
            tabContent.classList.add("active");
        });
    });
}

function formatResponse(text) {
    if (!text) return "<p>⚠️ Data tidak tersedia.</p>";

    const html = text
        .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
        .replace(/^\s*\*\s+(.*)/gm, "<li>$1</li>")
        .replace(/\n\n+/g, "</p><p>")
        .replace(/\n/g, "<br>");

    return `<p>${html}</p>`
        .replace(/<p><li>/g, "<ul><li>")
        .replace(/<\/li><\/p>/g, "</li></ul>");
}

async function generateTopicInsight(location, topic) {
    const prompt = `Berikan ringkasan atau wawasan utama tentang topik ${topic} di ${location}. Tulis dalam bahasa Indonesia. Fokus pada poin-poin penting, fakta menarik, dan relevansi global. Hindari format kuis atau pertanyaan.`;
    const response = await queryGemini(prompt);
    return formatResponse(response);
}

async function queryGemini(prompt) {
    try {
        const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
                API_KEY,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                {
                                    text: prompt,
                                },
                            ],
                        },
                    ],
                }),
            }
        );
        const data = await res.json();
        return (
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "⚠️ Tidak ada respons."
        );
    } catch (error) {
        console.error("Kesalahan saat mengakses Gemini:", error);
        return "⚠️ Terjadi kesalahan API.";
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggleSidebarBtn");
    const sidebar = document.getElementById("sidebar");

    // Sidebar awal disembunyikan
    // sidebar.classList.remove("show");
    // toggleBtn.innerText = "☰";

    toggleBtn.addEventListener("click", () => {
        const isVisible = sidebar.classList.contains("show");

        if (isVisible) {
            sidebar.classList.remove("show");
            toggleBtn.innerText = "AI Insights✨";
        } else {
            sidebar.classList.add("show");
            toggleBtn.innerText = "×";
        }
    });
});
