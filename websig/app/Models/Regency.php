<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Regency extends Model
{
    use HasFactory;
    protected $table = 'regencies';
    protected $fillable = [
        'name',
        'alt_name',
        'latitude',
        'longitude',
        'province_id',
    ];

    public function province()
    {
        return $this->belongsTo(Province::class);
    }
}