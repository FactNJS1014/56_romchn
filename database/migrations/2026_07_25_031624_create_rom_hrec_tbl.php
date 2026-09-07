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
        Schema::create('ROM_HREC_TBL', function (Blueprint $table) {
            $table->string('RHREC_ID')->primary();
            $table->string('MREC_ID')->foreign('MREC_ID')->references('MREC_ID')->on('ROM_MREC_TBL');
            $table->string('RHREC_RECBY')->comment('ผู้บันทึก');
            $table->string('RHREC_DATECT')->comment('วันที่');
            $table->string('RHREC_CUS')->comment('ลูกค้า');
            $table->string('RHREC_WON')->comment('Work Order');
            $table->integer('RHREC_LOTS')->comment('Lot Size');
            $table->string('RHREC_MDLNM')->comment('ชื่อรุ่น');
            $table->string('RHREC_MDLCD')->comment('รหัสรุ่น');
            $table->string('RHREC_PRGNM')->comment('ชื่อโปรแกรม');
            $table->string('RHREC_PROCS')->comment('Process');
            $table->string('RHREC_POSITION')->comment('Position');
            $table->string('RHREC_MACHINE')->comment('เครื่องจักร');
            $table->string('RHREC_SOCKET')->comment('Socket');
            $table->string('RHREC_REMARK')->comment('หมายเหตุ');
            $table->string('RHREC_PARTNO')->comment('รหัสชิ้นส่วน');
            $table->string('RHREC_FVERIFY')->comment('Check ข้อมูลส่วนแรก');
            $table->string('RHREC_PARTNM')->comment('ชื่อชิ้นส่วน');
            $table->string('RHREC_SNVERIFY')->comment('Check ข้อมูลส่วนที่สอง');
            $table->string('RHREC_SUMVAL')->comment('Sum Value');
            $table->string('RHREC_SUMVERIFY')->comment('Check ค่า sum');
            $table->string('RHREC_MARKING')->comment('Marking');
            $table->string('RHREC_MARKVERIFY')->comment('Check Marking');
            $table->integer('RHREC_QTY')->comment('จำนวนที่เข้า');
            $table->integer('RHREC_STD')->comment('สถานะบันทึก');
            $table->integer('RHREC_UPD')->default(0)->nullable()->comment('สถานะแก้ไข');
            $table->dateTime('RHREC_CREATEAT')->comment('วันที่สร้าง');
            $table->dateTime('RHREC_UPDATEAT')->nullable()->comment('วันที่แก้ไข');
            $table->integer('RHREC_LVAPP')->comment('Level App');
            $table->string('ROMAPRH_ID')->comment('ID Approve');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ROM_HREC_TBL');
    }
};
