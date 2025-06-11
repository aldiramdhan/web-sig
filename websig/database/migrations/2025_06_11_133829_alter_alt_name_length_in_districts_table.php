<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class AlterAltNameLengthInDistrictsTable extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('districts', function (Blueprint $table) {
            $table->string('alt_name', 300)->change(); // Ganti 100 dengan panjang karakter yang kamu inginkan
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('districts', function (Blueprint $table) {
            $table->string('alt_name', 50)->change(); // Panjang sebelumnya (sebelum diubah)
        });
    }
}
