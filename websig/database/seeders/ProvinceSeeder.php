<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Province;

class ProvinceSeeder extends Seeder
{
    /**
     * Run the database seeders.
     */
    public function run(): void
    {
        $provinces = [
            ['name' => 'Jawa Barat', 'alt_name' => 'West Java', 'latitude' => '-6.914744', 'longitude' => '107.609810'],
            ['name' => 'Jawa Tengah', 'alt_name' => 'Central Java', 'latitude' => '-7.150975', 'longitude' => '110.140259'],
            ['name' => 'Jawa Timur', 'alt_name' => 'East Java', 'latitude' => '-7.250445', 'longitude' => '112.768845'],
            ['name' => 'DKI Jakarta', 'alt_name' => 'Jakarta', 'latitude' => '-6.211544', 'longitude' => '106.845172'],
            ['name' => 'DI Yogyakarta', 'alt_name' => 'Yogyakarta', 'latitude' => '-7.797068', 'longitude' => '110.370529'],
            ['name' => 'Banten', 'alt_name' => 'Banten', 'latitude' => '-6.120000', 'longitude' => '106.150276'],
            ['name' => 'Sumatera Utara', 'alt_name' => 'North Sumatra', 'latitude' => '2.1153547', 'longitude' => '99.5450974'],
            ['name' => 'Sumatera Barat', 'alt_name' => 'West Sumatra', 'latitude' => '-0.7399397', 'longitude' => '100.8000051'],
            ['name' => 'Sumatera Selatan', 'alt_name' => 'South Sumatra', 'latitude' => '-3.2384616', 'longitude' => '103.8648731'],
            ['name' => 'Bali', 'alt_name' => 'Bali', 'latitude' => '-8.4095178', 'longitude' => '115.188916'],
        ];

        foreach ($provinces as $province) {
            Province::create($province);
        }
    }
}
