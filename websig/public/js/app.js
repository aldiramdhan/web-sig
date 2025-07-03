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

let polygonLayer;

async function searchLocation() {
    const location = document.getElementById("locationInput").value;
    if (!location) return alert("Masukkan lokasi!");

    try {
        const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/search?q=${location}&format=json&polygon_geojson=1`,
            {
                headers: {
                    'User-Agent': 'GeoExplorer/1.0 (https://example.com)' // Add a User-Agent header
                }
            }
        );

        if (!geoRes.ok) {
            throw new Error(`HTTP error! status: ${geoRes.status}`);
        }

        const geoData = await geoRes.json();
        if (!geoData.length) return alert("Lokasi tidak ditemukan!");

        const { lat, lon, geojson } = geoData[0];
        map.setView([lat, lon], 10);

        // Remove previous polygon
        if (polygonLayer) {
            map.removeLayer(polygonLayer);
            polygonLayer = null;
        }

        // Add polygon if available
        if (geojson) {
            polygonLayer = L.geoJSON(geojson, {
                style: {
                    color: "#1d4ed8",
                    weight: 2,
                    fillOpacity: 0.1,
                },
            }).addTo(map);
            map.fitBounds(polygonLayer.getBounds());
        }

        fetchTopicData(location);

        // Automatically show the sidebar and adjust map layout
        const sidebar = document.getElementById('sidebar');
        const mainContainer = document.getElementById('main-container');
        
        sidebar.classList.add("show");
        mainContainer.classList.add('sidebar-visible');

        // Invalidate map size to ensure it resizes correctly
        setTimeout(() => {
            map.invalidateSize();
            if (polygonLayer) {
                map.fitBounds(polygonLayer.getBounds());
            }
        }, 300); // Corresponds to the transition duration

    } catch (error) {
        console.error("Fetch error:", error);
        alert("Gagal mengambil data lokasi. Server mungkin sedang sibuk atau terjadi masalah jaringan. Silakan tunggu sejenak dan coba lagi.");
    }
}

async function fetchTopicData(location) {
    const topics = [
        {
            key: "📜 Sejarah",
            prompt: `Berikan data sejarah untuk ${location} dalam format JSON. Pastikan semua respons dalam Bahasa Indonesia. JSON harus berisi "summary" (string) dan "timeline" (array objek dengan "year" dan "event").`,
        },
        {
            key: "🌍 Geografi",
            prompt: `Berikan data geografis untuk ${location} dalam format JSON. Pastikan semua respons dalam Bahasa Indonesia. JSON harus berisi "summary" (string) dan "statistics" (array objek dengan "label" dan "value").`,
        },
        {
            key: "🏛️ Politik & Pemerintahan",
            prompt: `Berikan data politik dan pemerintahan untuk ${location} dalam format JSON. Pastikan semua respons dalam Bahasa Indonesia. JSON harus berisi "summary" (string) dan "details" (array objek dengan "label" dan "value").`,
        },
        {
            key: "🌱 Lingkungan",
            prompt: `Berikan data lingkungan untuk ${location} dalam format JSON. Pastikan semua respons dalam Bahasa Indonesia. JSON harus berisi "summary" (string) dan "key_issues" (array string).`,
        },
        {
            key: "🧪 Sains & Teknologi",
            prompt: `Berikan data sains dan teknologi untuk ${location} dalam format JSON. Pastikan semua respons dalam Bahasa Indonesia. JSON harus berisi "summary" (string) dan "innovations" (array string).`,
        },
        {
            key: "🛡️ Keamanan",
            prompt: `Berikan data keamanan untuk ${location} dalam format JSON. Pastikan semua respons dalam Bahasa Indonesia. JSON harus berisi "summary" (string) dan "security_points" (array string).`,
        },
        {
            key: "🌾 Pertanian",
            prompt: `Berikan data pertanian untuk ${location} dalam format JSON. Pastikan semua respons dalam Bahasa Indonesia. JSON harus berisi "summary" (string) dan "main_commodities" (array string).`,
        },
        {
            key: "💼 Ekonomi",
            prompt: `Berikan data ekonomi untuk ${location} dalam format JSON. Pastikan semua respons dalam Bahasa Indonesia. JSON harus berisi "summary" (string) dan "statistics" (array objek dengan "label" dan "value" untuk PDB, populasi, dll).`,
        },
    ];

    document.getElementById("tabs").innerHTML = "<p>🔄 Memuat wawasan...</p>";
    document.getElementById("tabContents").innerHTML = "";

    const responses = await Promise.all(
        topics.map((t) => queryGemini(t.prompt, true))
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

        const contentBox = document.createElement('div');
        contentBox.className = 'content-box';
        contentBox.innerHTML = `<h3>${topic.key}</h3>`;

        try {
            // Clean the response to ensure it is valid JSON
            const cleanedResponse = responses[index].replace(/```json|```/g, '').trim();
            const data = JSON.parse(cleanedResponse);
            contentBox.appendChild(renderStructuredResponse(data));
        } catch (e) {
            console.error("JSON parsing error:", e, responses[index]);
            const errorMsg = document.createElement('p');
            errorMsg.textContent = "Gagal memuat data terstruktur. Menampilkan teks mentah.";
            contentBox.appendChild(errorMsg);
            // Fallback to plain text formatting if JSON parsing fails
            const formatted = formatResponse(responses[index]);
            contentBox.innerHTML += formatted;
        }

        tabContent.appendChild(contentBox);
        tabContentsContainer.appendChild(tabContent);

        tab.addEventListener("click", () => {
            document.querySelectorAll(".tab").forEach((t) => t.classList.remove("active"));
            document.querySelectorAll(".tab-content").forEach((c) => c.classList.remove("active"));
            tab.classList.add("active");
            tabContent.classList.add("active");
        });
    });
}

function renderStructuredResponse(data) {
    const container = document.createElement('div');

    if (data.summary) {
        const summary = document.createElement('p');
        summary.className = 'summary';
        summary.textContent = data.summary;
        container.appendChild(summary);
    }

    if (data.statistics && data.statistics.length > 0) {
        const statsGrid = document.createElement('div');
        statsGrid.className = 'stats-grid';
        data.statistics.forEach(stat => {
            const statCard = document.createElement('div');
            statCard.className = 'stat-card';
            statCard.innerHTML = `<span class="stat-label">${stat.label}</span><span class="stat-value">${stat.value}</span>`;
            statsGrid.appendChild(statCard);
        });
        container.appendChild(statsGrid);
    }

    if (data.timeline && data.timeline.length > 0) {
        const timeline = document.createElement('ul');
        timeline.className = 'timeline';
        data.timeline.forEach(item => {
            const timelineItem = document.createElement('li');
            timelineItem.innerHTML = `<span class="year">${item.year}</span><p>${item.event}</p>`;
            timeline.appendChild(timelineItem);
        });
        container.appendChild(timeline);
    }

    const listKeys = ['details', 'key_issues', 'innovations', 'security_points', 'main_commodities'];
    listKeys.forEach(key => {
        if (data[key] && data[key].length > 0) {
            const list = document.createElement('ul');
            list.className = 'info-list';
            data[key].forEach(item => {
                const listItem = document.createElement('li');
                if (typeof item === 'object') {
                    listItem.innerHTML = `<strong>${item.label}:</strong> ${item.value}`;
                } else {
                    listItem.textContent = item;
                }
                list.appendChild(listItem);
            });
            container.appendChild(list);
        }
    });

    return container;
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

async function queryGemini(prompt, isJson = false) {
    try {
        const body = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt,
                        },
                    ],
                },
            ],
        };

        if (isJson) {
            body.generationConfig = {
                response_mime_type: "application/json",
            };
        }

        const res = await fetch(
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" +
                API_KEY,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body),
            }
        );
        const data = await res.json();
        return (
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            (isJson ? '{ "summary": "Tidak ada respons.", "statistics": [] }' : "⚠️ Tidak ada respons.")
        );
    } catch (error) {
        console.error("Kesalahan saat mengakses Gemini:", error);
        return (isJson ? '{ "summary": "Terjadi kesalahan API.", "statistics": [] }' : "⚠️ Terjadi kesalahan API.");
    }
}

document.addEventListener("DOMContentLoaded", () => {
    const toggleBtn = document.getElementById("toggleSidebarBtn");
    const sidebar = document.getElementById("sidebar");
    const mainContainer = document.getElementById('main-container');

    if (!toggleBtn || !sidebar) return;

    toggleBtn.addEventListener("click", () => {
        const isVisible = sidebar.classList.toggle("show");
        mainContainer.classList.toggle('sidebar-visible', isVisible);

        if (isVisible) {
            toggleBtn.innerHTML = "×";
        } else {
            toggleBtn.innerHTML = "AI Insights ✨";
        }

        // Adjust map size after transition
        setTimeout(() => {
            map.invalidateSize();
        }, 300);
    });
});
