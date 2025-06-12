<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Province_profile extends Model
{
    protected $table = 'province_profiles';
    protected $fillable = [
        'population',
        'year',
        'gdp',
        'population',
        'total_sd',
        'total_smp',
        'total_sma',
        'total_pt',
        'province_id',
    ];

    public function province()
    {
        return $this->belongsTo(Province::class);
    }
}
