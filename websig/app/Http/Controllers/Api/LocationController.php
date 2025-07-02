<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Province;
use App\Models\Regency;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;

class LocationController extends Controller
{
    /**
     * Get all provinces with their coordinates
     */
    public function getProvinces(): JsonResponse
    {
        $provinces = Province::select('id', 'name', 'alt_name', 'latitude', 'longitude')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'data' => $provinces,
            'count' => $provinces->count()
        ]);
    }

    /**
     * Get regencies for a specific province
     */
    public function getRegencies($id): JsonResponse
    {
        $province = Province::find($id);
        
        if (!$province) {
            return response()->json([
                'success' => false,
                'message' => 'Province not found'
            ], 404);
        }

        $regencies = Regency::where('province_id', $id)
            ->select('id', 'name', 'alt_name', 'latitude', 'longitude', 'province_id')
            ->orderBy('name')
            ->get();

        return response()->json([
            'success' => true,
            'province' => $province,
            'data' => $regencies,
            'count' => $regencies->count()
        ]);
    }

    /**
     * Get location by name (province or regency)
     */
    public function getLocationByName($name): JsonResponse
    {
        // Clean the name
        $cleanName = trim($name);
        
        // First, try to find as province
        $province = Province::where('name', 'LIKE', "%{$cleanName}%")
            ->orWhere('alt_name', 'LIKE', "%{$cleanName}%")
            ->first();

        if ($province) {
            return response()->json([
                'success' => true,
                'type' => 'province',
                'data' => $province
            ]);
        }

        // Then, try to find as regency
        $regency = Regency::where('name', 'LIKE', "%{$cleanName}%")
            ->orWhere('alt_name', 'LIKE', "%{$cleanName}%")
            ->with('province')
            ->first();

        if ($regency) {
            return response()->json([
                'success' => true,
                'type' => 'regency',
                'data' => $regency
            ]);
        }

        return response()->json([
            'success' => false,
            'message' => 'Location not found in database'
        ], 404);
    }
}
