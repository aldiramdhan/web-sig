<div>
    <div id="main-container">
        <!-- Map container -->
        <div id="map">
            <!-- Floating Search Box -->
            <div class="floating-search">
                <h2>🌏 Geo Explorer</h2>
                <div class="search-container">
                    <input type="text" id="locationInput" placeholder="Contoh: Jawa Barat, Tokyo, Brazil" />
                    <button onclick="searchLocation()">Cari</button>
                </div>
            </div>
            
            <!-- Toggle Button -->
            <button id="toggleSidebarBtn" class="toggle-btn">AI Insights ✨</button>
        </div>

        <!-- Sidebar -->
        <div id="sidebar" class="sidebar">
            <div id="tabs" class="tabs"></div>
            <div id="tabContents">Cari lokasi dulu!</div>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script src="https://unpkg.com/osmtogeojson@3.0.0-beta.4/osmtogeojson.js"></script>
<script src="{{ asset('js/app.js') }}"></script>