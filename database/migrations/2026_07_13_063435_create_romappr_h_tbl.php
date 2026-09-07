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
        Schema::create('ROMAPPR_H_TBL', function (Blueprint $table) {
            $table->string('ROMAPPR_HID', 500)->primary();
            $table->integer('ROMAPPR_HLV')->comment('Level of approval');
            $table->string('ROMAPPR_HEMPID', 1000)->comment('Approver ID');
            $table->integer('ROMAPPR_HSTD')->comment('Status of approval');
            $table->dateTime('ROMAPPR_HLSTDT')->comment('create_at_record');
            $table->dateTime('ROMAPPR_HUPDATEAT')->nullable()->comment('update_at_record');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ROMAPPR_H_TBL');
    }
};
