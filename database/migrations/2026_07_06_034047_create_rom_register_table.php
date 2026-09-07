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
        Schema::create('ROM_REGISTER_TBL', function (Blueprint $table) {
            $table->string('ROMREGI_ID')->primary()->comment('ID สำหรับการบันทึกข้อมูล');
             // ข้อมูลรายแถว
            $table->string('ROMREGI_CUSTOMER')->comment('Customer name');
            $table->string('ROMREGI_MACHINE_NO')->comment('Machine number');
            $table->string('ROMREGI_DATE');
            $table->string('ROMREGI_TIME');
            $table->string('ROMREGI_LINE');
            $table->string('ROMREGI_WON');                 // work order number
            $table->string('ROMREGI_MODEL');   // MDLCD จาก work order ที่เลือก
            $table->string('ROMREGI_PROCESS');
            $table->integer('ROMREGI_LOTS');
            $table->string('ROMREGI_PART_NAME');
            $table->string('ROMREGI_LOT_NO');
            $table->string('ROMREGI_PART_NO');
            $table->string('ROMREGI_POSITION');
            $table->string('ROMREGI_ROM_REV');
            $table->string('ROMREGI_MAKER');
            $table->string('ROMREGI_DEVICE_NO');
            $table->string('ROMREGI_SOCKET_NO');
            $table->string('ROMREGI_PROGRAM_NAME');
            $table->string('ROMREGI_SUM');
            $table->string('ROMREGI_DOT_IC')->nullable()->comment('เก็บ path รูปที่ upload');
            $table->string('ROMREGI_EMP_ID');
            $table->integer('ROMREGI_STATUS')->default(0)->comment('0 = New or cancelled, 1 = Completed');
            $table->integer('ROMREGI_GETSTD')->default(0)->comment('1 = เลือกแล้ว, 0 = ยังไม่เลือก');
            $table->integer('ROMREGI_REJSTD')->default(0)->comment('1 = ปฏิเสธ, 0 = ยังไม่ปฏิเสธ');
            $table->string('ROMREGI_REJSTD_REM')->nullable()->comment('เหตุผลการปฏิเสธ');
            $table->string('ROMREGI_REJSTD_BY')->nullable()->comment('ผู้ปฏิเสธ');
            $table->integer('ROMREGI_LVL_APR')->default(0)->comment('ระดับการอนุมัติ');
            $table->timestamp('ROMREGI_CREATED_AT');
            $table->timestamp('ROMREGI_UPDATED_AT')->nullable()->comment('เวลาที่อัปเดตล่าสุด');


            // index ที่มักใช้ query/filter บ่อย
            $table->index('ROMREGI_CUSTOMER');
            $table->index('ROMREGI_WON');
            $table->index('ROMREGI_DATE');

        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ROM_REGISTER_TBL');
    }
};
