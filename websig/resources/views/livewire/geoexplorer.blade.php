<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Geo Explorer</title>
    <link rel="icon" href="{{ asset('assets/logo/logo.png') }}" type="image/png">
</head>

<div>
    <div id="main-container">
        <!-- Map container -->
        <div id="map">
            <!-- Floating Search Box -->
            <div class="floating-search">
                <div class="logo-container">
                    <img src="{{ asset('assets/logo/geoexplore.png') }}" alt="Geo Explorer Logo" class="logo-img">
                    <h2>Geo Explorer</h2>
                </div>
                <div class="search-container">
                    <input type="text" id="locationInput" placeholder="Contoh: Jawa Barat, Tokyo, Brazil" />
                    <button onclick="searchLocation()">Cari</button>
                </div>
            </div>
        </div>

        <!-- Sidebar -->
        <div id="sidebar" class="sidebar">
            <div id="tabs" class="tabs"></div>
            <div id="tabContents">Cari lokasi dulu!</div>
        </div>
    </div>

    <!-- Toggle Button -->
    <button id="toggleSidebarBtn" class="ai-insights-btn">AI Insights ✨</button>
</div>