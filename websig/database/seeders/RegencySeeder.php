<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Regency;
use App\Models\Province;

class RegencySeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        // Get Jawa Barat province
        $jabar = Province::where('name', 'Jawa Barat')->first();
        
        if ($jabar) {
            $regencies = [
                ['name' => 'Kota Bogor', 'alt_name' => 'Bogor City', 'latitude' => '-6.595038', 'longitude' => '106.816635', 'province_id' => $jabar->id],
                ['name' => 'Kabupaten Bogor', 'alt_name' => 'Bogor Regency', 'latitude' => '-6.518232', 'longitude' => '106.717632', 'province_id' => $jabar->id],
                ['name' => 'Kota Bandung', 'alt_name' => 'Bandung City', 'latitude' => '-6.917464', 'longitude' => '107.619123', 'province_id' => $jabar->id],
                ['name' => 'Kabupaten Bandung', 'alt_name' => 'Bandung Regency', 'latitude' => '-7.050676', 'longitude' => '107.532167', 'province_id' => $jabar->id],
                ['name' => 'Kota Bekasi', 'alt_name' => 'Bekasi City', 'latitude' => '-6.238270', 'longitude' => '106.975571', 'province_id' => $jabar->id],
                ['name' => 'Kabupaten Bekasi', 'alt_name' => 'Bekasi Regency', 'latitude' => '-6.264451', 'longitude' => '107.001373', 'province_id' => $jabar->id],
            ];

            foreach ($regencies as $regency) {
                Regency::create($regency);
            }
        }

        // Get DKI Jakarta province
        $jakarta = Province::where('name', 'DKI Jakarta')->first();
        
        if ($jakarta) {
            $jakartaRegencies = [
                ['name' => 'Jakarta Pusat', 'alt_name' => 'Central Jakarta', 'latitude' => '-6.186486', 'longitude' => '106.834091', 'province_id' => $jakarta->id],
                ['name' => 'Jakarta Utara', 'alt_name' => 'North Jakarta', 'latitude' => '-6.138414', 'longitude' => '106.863956', 'province_id' => $jakarta->id],
                ['name' => 'Jakarta Selatan', 'alt_name' => 'South Jakarta', 'latitude' => '-6.261493', 'longitude' => '106.810600', 'province_id' => $jakarta->id],
                ['name' => 'Jakarta Timur', 'alt_name' => 'East Jakarta', 'latitude' => '-6.225014', 'longitude' => '106.900447', 'province_id' => $jakarta->id],
                ['name' => 'Jakarta Barat', 'alt_name' => 'West Jakarta', 'latitude' => '-6.168270', 'longitude' => '106.763100', 'province_id' => $jakarta->id],
            ];

            foreach ($jakartaRegencies as $regency) {
                Regency::create($regency);
            }
        }
    }
}
