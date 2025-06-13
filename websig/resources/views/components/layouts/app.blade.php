<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">

<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>{{ $title ?? 'Page Title' }}</title>
    <!-- Leaflet CSS -->
    <link rel="stylesheet" href="https://unpkg.com/leaflet/dist/leaflet.css" />

    <!-- Leaflet JS -->
    <script src="https://unpkg.com/leaflet/dist/leaflet.js"></script>

    <script>
        document.addEventListener('livewire:init', function() {
            var map = L.map('indonesia-map').setView([-2.5489, 118.0149], 5); // Center Indonesia

            L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
                attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            }).addTo(map);
        });
    </script>
    <style>
        html,
        body {
            height: 100%;
            margin: 0;
            padding: 0;
            overflow: hidden;
        }

        main {
            padding: 20px;
            max-width: 1100px;
            margin: auto;
        }

        h2 {
            text-align: center;
            font-size: 2rem;
            margin-bottom: 1rem;
        }

        .search-container {
            display: flex;
            justify-content: center;
            flex-wrap: wrap;
            gap: 10px;
            margin-bottom: 15px;
        }

        input,
        button {
            padding: 10px 15px;
            font-size: 16px;
            border: 1px solid #ccc;
            border-radius: 8px;
            flex: 1;
            min-width: 200px;
        }

        button {
            background-color: #1e40af;
            color: white;
            cursor: pointer;
            transition: 0.3s;
        }

        button:hover {
            background-color: #1d4ed8;
        }

        #map {
            position: absolute;
            top: 0;
            left: 0;
            height: 100%;
            width: 100%;
            z-index: 1;
        }

        .tabs {
            display: flex;
            overflow-x: auto;
            gap: 8px;
            padding: 10px 0;
            border-bottom: 2px solid #ccc;
            margin-bottom: 1rem;
            -webkit-overflow-scrolling: touch;
            scrollbar-width: none;
            margin-top: 60px;
        }

        .tabs::-webkit-scrollbar {
            display: none;
        }

        .tab {
            flex-shrink: 0;
            padding: 8px 16px;
            background-color: #e0e7ff;
            border-radius: 20px;
            cursor: pointer;
            font-weight: 500;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            gap: 6px;
            white-space: nowrap;
        }

        .tab:hover {
            background-color: #c7d2fe;
            transform: scale(1.05);
        }

        .tab.active {
            background-color: #4338ca;
            color: white;
        }

        .tab-content {
            display: none;
        }

        .tab-content.active {
            display: block;
        }

        .content-box {
            background: white;
            padding: 20px;
            border-radius: 12px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
            line-height: 1.7;
            font-size: 16px;
            margin-bottom: 30px;
        }

        .content-box h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: #1e3a8a;
        }

        .content-box h3::before {
            content: "\1F7E3 ";
        }

        .content-box ul {
            padding-left: 1.5rem;
            margin-top: 1rem;
        }

        .content-box li {
            margin-bottom: 0.6rem;
        }

        .content-box strong {
            color: #1e3a8a;
        }

        @media (max-width: 768px) {

            input,
            button {
                width: 100%;
            }

            #map {
                height: 300px;
            }
        }

        .floating-search {
            position: absolute;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 999;
            background: rgba(255, 255, 255, 0.95);
            padding: 15px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        }

        /* .open-sidebar-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            z-index: 999;
            background: #1d4ed8;
            color: white;
            font-size: 20px;
            border: none;
            border-radius: 50%;
            padding: 10px 14px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            cursor: pointer;
        } */


        .sidebar {
            position: fixed;
            right: 0;
            top: 0;
            height: 100%;
            overflow-y: auto;
            padding: 20px;
            width: 400px;
            background: white;
            box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
            transition: transform 0.3s ease;
            transform: translateX(100%);
            /* Tersembunyi awal */
            z-index: 999;
        }

        .sidebar.show {
            transform: translateX(0);
            /* Muncul saat diklik */
        }

        .toggle-btn {
            position: absolute;
            right: 1rem;
            top: 1rem;
            z-index: 1000;
            border: none;
            font-size: 1.5rem;
            cursor: pointer;
            width: 48px;
            height: 48px;
            /* display: flex; */
            align-items: center;
            justify-content: center;
            box-shadow: 0 0 5px rgba(0, 0, 0, 0.2);
            padding: 0;
        }
    </style>
</head>

<body>
    {{ $slot }}
</body>

<script>
    const API_KEY = "AIzaSyD8fCpp71BUUXSm3H4KUqJp1vnUnOHa_U0";
    const map = L.map('map').setView([-2.5489, 118.0149], 5);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(map);

    let marker;
    let polygonLayer;

    async function searchLocation() {
        const location = document.getElementById("locationInput").value;
        if (!location) return alert("Masukkan lokasi!");

        const geoRes = await fetch(`https://nominatim.openstreetmap.org/search?q=${location}&format=json&polygon_geojson=1`);
        const geoData = await geoRes.json();
        if (!geoData.length) return alert("Lokasi tidak ditemukan!");

        const {
            lat,
            lon,
            display_name,
            geojson
        } = geoData[0];
        map.setView([lat, lon], 10);

        if (marker) map.removeLayer(marker);
        marker = L.marker([lat, lon]).addTo(map).bindPopup(display_name || location).openPopup();

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
                    fillOpacity: 0.1
                }
            }).addTo(map);
            map.fitBounds(polygonLayer.getBounds());
        }

        fetchTopicData(location);
    }

    async function fetchTopicData(location) {
        const topics = [{
                key: "📜 Sejarah",
                prompt: `Jelaskan sejarah dan perkembangan ${location}. Tulis dalam bahasa Indonesia.`
            },
            {
                key: "🌍 Geografi",
                prompt: `Deskripsikan kondisi geografis ${location} termasuk bentang alam, iklim, dan distribusi manusia. Tulis dalam bahasa Indonesia.`
            },
            {
                key: "🏛️ Politik & Pemerintahan",
                prompt: `Gambarkan struktur pemerintahan, kebijakan penting, dan dinamika politik di ${location}. Tulis dalam bahasa Indonesia.`
            },
            {
                key: "🌱 Lingkungan",
                prompt: `Jelaskan kondisi lingkungan di ${location} termasuk hutan, satwa liar, isu perubahan iklim, dan upaya pelestarian. Tulis dalam bahasa Indonesia.`
            },
            {
                key: "🧪 Sains & Teknologi",
                prompt: `Sorot perkembangan sains dan teknologi di ${location}, termasuk inovasi lokal dan institusi riset. Tulis dalam bahasa Indonesia.`
            },
            {
                key: "🛡️ Keamanan",
                prompt: `Diskusikan isu-isu keamanan dalam negeri di ${location}, seperti kejahatan, bencana, atau keamanan siber. Tulis dalam bahasa Indonesia.`
            },
            {
                key: "🌾 Pertanian",
                prompt: `Jelaskan profil pertanian di ${location}, mencakup komoditas utama, irigasi, dan tantangan. Tulis dalam bahasa Indonesia.`
            },
            {
                key: "💼 Ekonomi",
                prompt: `Deskripsikan struktur ekonomi di ${location}, termasuk sektor industri, perdagangan, dan infrastruktur. Tulis dalam bahasa Indonesia.`
            }
        ];

        document.getElementById("tabs").innerHTML = "<p>🔄 Memuat insight...</p>";
        document.getElementById("tabContents").innerHTML = "";

        const responses = await Promise.all(topics.map(t => queryGemini(t.prompt)));

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

            generateTopicInsight(location, topic.key).then(insight => {
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
                document.querySelectorAll(".tab").forEach(t => t.classList.remove("active"));
                document.querySelectorAll(".tab-content").forEach(c => c.classList.remove("active"));
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

        return `<p>${html}</p>`.replace(/<p><li>/g, "<ul><li>").replace(/<\/li><\/p>/g, "</li></ul>");
    }

    async function generateTopicInsight(location, topic) {
        const prompt = `Berikan ringkasan atau wawasan utama tentang topik ${topic} di ${location}. Tulis dalam bahasa Indonesia. Fokus pada poin-poin penting, fakta menarik, dan relevansi global. Hindari format kuis atau pertanyaan.`;
        const response = await queryGemini(prompt);
        return formatResponse(response);
    }

    async function queryGemini(prompt) {
        try {
            const res = await fetch(
                "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=" + API_KEY, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json"
                    },
                    body: JSON.stringify({
                        contents: [{
                            parts: [{
                                text: prompt
                            }]
                        }]
                    })
                }
            );
            const data = await res.json();
            return data?.candidates?.[0]?.content?.parts?.[0]?.text || "⚠️ Tidak ada respons.";
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
                toggleBtn.innerText = "☰";
            } else {
                sidebar.classList.add("show");
                toggleBtn.innerText = "×";
            }
        });
    });
</script>

</html>