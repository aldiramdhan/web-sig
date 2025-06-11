<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Village extends Model
{
    use HasFactory;
    protected $table = 'villages';
    protected $fillable = [
        'name',
        'alt_name',
        'latitude',
        'longitude',
        'district_id',
    ];

    public function district()
    {
        return $this->belongsTo(District::class);
    }
}
