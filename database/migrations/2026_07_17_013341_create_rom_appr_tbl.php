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
        Schema::create('ROM_APPR_TBL', function (Blueprint $table) {
            $table->string('ROMAPRH_ID')->primary();
            $table->string('ROMREGI_ID')->foreign('ROMREGI_ID')->references('ROMREGI_ID')->on('ROM_REGISTER_TBL');
            $table->string('ROMOPRT_ID')->foreign('ROMOPRT_ID')->references('ROMOPRT_ID')->on('ROM_OPRT_TBL');
            $table->string('ROMAPPR_ID')->foreign('ROMAPPR_ID')->references('ROMAPPR_ID')->on('ROMAPPR_H_TBL');
            $table->string('ROMAPRH_EMPID')->comment('รหัสพนักงานที่เกี่ยวข้องการอนุมัติแต่ละลำดับ');
            $table->integer('ROMAPRH_SEQ')->comment('ลำดับการอนุมัติ');
            $table->string('ROMAPRH_EMPAPP')->nullable()->comment('รหัสพนักงานที่อนุมัติ');
            $table->integer('ROMAPRH_STDAPP')->default(0)->comment('สถานะการอนุมัติ');
            $table->dateTime('ROMAPRH_CREATAT')->comment('วันที่อนุมัติ');
            $table->dateTime('ROMAPRH_STAMPDATE')->nullable()->comment('วันที่บันทึก');
            $table->integer('ROMAPRH_STDCANCEL')->default(0)->comment('สถานะการยกเลิก');
            $table->string('ROMAPRH_CANCELBY')->nullable()->comment('ผู้ยกเลิก');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ROM_APPR_TBL');
    }
};
