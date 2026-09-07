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
        Schema::create('ROM_MREC_TBL', function (Blueprint $table) {
            $table->string('MREC_ID')->primary();
            $table->string('MREC_CUS');
            $table->string('MREC_MDLNM');
            $table->string('MREC_MDLCD');
            $table->string('MREC_PRGNM');
            $table->string('MREC_PROCS');
            $table->string('MREC_PARTNO');
            $table->string('MREC_PARTNM');
            $table->string('MREC_POSITION');
            $table->string('MREC_MACHINE');
            $table->string('MREC_SOCKET');
            $table->string('MREC_SUMV');
            $table->string('MREC_MARKING');
            $table->integer('MREC_RECSTD')->default(0)->comment('0 = ยังไม่ได้ส่ง, 1 = ส่งแล้ว');
            $table->integer('MREC_DELSTD')->default(0)->nullable()->comment('0 = ยังไม่ได้ลบ, 1 = ลบแล้ว');
            $table->integer('MREC_EDITSTD')->default(0)->nullable()->comment('0 = ยังไม่ได้แก้ไข, 1 = แก้ไขแล้ว');
            $table->dateTime('MREC_CREATEAT');
            $table->string('MREC_CREATEBY');
            $table->dateTime('MREC_UPDATEAT')->nullable();
            $table->string('MREC_UPDATEBY')->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ROM_MREC_TBL');
    }
};
