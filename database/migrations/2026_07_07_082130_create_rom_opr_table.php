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
        Schema::create('ROM_OPRT_TBL', function (Blueprint $table) {
            $table->string('ROMOPRT_ID')->primary();
            $table->string('ROMREGI_ID')->foreign('ROMREGI_ID')->references('ROMREGI_ID')->on('ROM_REGISTER_TBL');
            $table->string('ROMOPRT_DATE')->comment('วันที่ออก');
            $table->string('ROMOPRT_SHIFT')->comment('กะเข้างาน');
            $table->string('ROMOPRT_LINE')->comment('ไลน์การผลิต');
            $table->string('ROMOPRT_WON')->comment('Work Order');
            $table->string('ROMOPRT_MODEL')->comment('รุ่นผลิต');
            $table->integer('ROMOPRT_LOTS')->comment('จำนวน Lot');
            $table->string('ROMOPRT_PARTNUM')->comment('หมายเลขชิ้นส่วน');
            $table->string('ROMOPRT_PROGNAME')->comment('ชื่อโปรแกรม');
            $table->string('ROMOPRT_PROCS')->comment('Process');
            $table->string('ROMOPRT_POSITION')->comment('ตำแหน่ง');
            $table->string('ROMOPRT_SUMVAL')->comment('Sum Value');
            $table->integer('ROMOPRT_CNTPASS')->comment('Count Pass');
            $table->integer('ROMOPRT_CNTFAIL')->comment('Count Fail');
            $table->integer('ROMOPRT_CNTTOTAL')->comment('Count Total');
            $table->string('ROMOPRT_EMPID')->comment('รหัสพนักงาน');
            $table->string('ROMOPRT_COMMENT', 2000)->nullable()->comment('คอมเมนต์');
            $table->integer('ROMOPRT_STATUS')->comment('สถานะ');
            $table->dateTime('ROMOPRT_CREATED_AT')->comment('สร้างเมื่อ');
            $table->dateTime('ROMOPRT_UPDATED_AT')->nullable()->comment('อัปเดตเมื่อ');           
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ROM_OPRT_TBL');
    }
};
