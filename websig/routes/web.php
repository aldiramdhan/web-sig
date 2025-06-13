<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\Map as MapComponent;
use App\Livewire\Geoexplorer as GeoexplorerComponent;


Route::get('/', function () {
    return view('welcome');
});

Route::get('/map', MapComponent::class)->name('map');
Route::get('/geoexplorer', GeoexplorerComponent::class)->name('geoexplorer');