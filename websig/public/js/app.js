document.addEventListener("livewire:init", function () {
    var map = L.map("indonesia-map").setView([-2.5489, 118.0149], 5); // Center Indonesia

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);
});
const API_KEY = "AIzaSyD8fCpp71BUUXSm3H4KUqJp1vnUnOHa_U0";
const map = L.map("map").setView([-2.5489, 118.0149], 5);

L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
}).addTo(map);

let marker;
let polygonLayer;

async function searchLocation() {
    const location = document.getElementById("locationInput").value;
    if (!location) return alert("Masukkan lokasi!");

    const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${location}&format=json&polygon_geojson=1`
    );
    const geoData = await geoRes.json();
    if (!geoData.length) return alert("Lokasi tidak ditemukan!");

    const { lat, lon, display_name, geojson } = geoData[0];
    map.setView([lat, lon], 10);

    if (marker) map.removeLayer(marker);
    marker = L.marker([lat, lon])
        .addTo(map)
        .bindPopup(display_name || location)
        .openPopup();

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

    // Apply blur effect to the map tiles
    setTimeout(() => {
        document.querySelectorAll("img.leaflet-tile").forEach((tile) => {
            tile.style.filter = "blur(10px)";
            tile.style.transition = "filter 0.3s ease";
        });
    }, 300);

    // Disable map interactions
    map.dragging.disable();
    map.touchZoom.disable();
    map.scrollWheelZoom.disable();
    map.doubleClickZoom.disable();
    map.boxZoom.disable();

    // Re-enable map interactions when clicking anywhere on the map
    map.on("click", () => {
        document.querySelectorAll("img.leaflet-tile").forEach((tile) => {
            tile.style.filter = "blur(0)";
        });
        map.dragging.enable();
        map.touchZoom.enable();
        map.scrollWheelZoom.enable();
        map.doubleClickZoom.enable();
        map.boxZoom.enable();
    });

    // Automatically show the sidebar
    sidebar.classList.add("show");
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

        tabContent.innerHTML = `
          <div class="content-box">
            <h3>${topic.key}</h3>
            ${formatted}
          </div>
        `;

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
