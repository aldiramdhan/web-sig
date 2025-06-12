<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('province_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('province_id')->constrained('provinces')->onDelete('cascade');
            $table->integer('year')->default(2024);
            $table->bigInteger('population')->default(0);
            $table->bigInteger('gdp')->default(0);
            $table->bigInteger('total_sd')->default(0);
            $table->bigInteger('total_smp')->default(0);
            $table->bigInteger('total_sma')->default(0);
            $table->bigInteger('total_pt')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('province_profiles');
    }
};