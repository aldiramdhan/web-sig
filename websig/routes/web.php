<?php

use Illuminate\Support\Facades\Route;
use App\Livewire\Map as MapComponent;

use function PHPSTORM_META\map;

Route::get('/', function () {
    return view('welcome');
});

Route::get('/map', MapComponent::class)->name('map');