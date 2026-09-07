<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Rom_Register extends Model
{
    protected $table = 'ROM_REGISTER_TBL';

    // ตารางนี้คุม timestamps เองผ่าน ROMREGI_CREATED_AT / ROMREGI_UPDATED_AT
    public $timestamps = false;

    // ROMREGI_ID เป็น string ที่ generate เอง ไม่ใช่ auto-increment
    protected $primaryKey = 'ROMREGI_ID';
    public $incrementing = false;
    protected $keyType = 'string';

    protected $fillable = [
        'ROMREGI_ID',
        'ROMREGI_CUSTOMER',
        'ROMREGI_MACHINE_NO',
        'ROMREGI_DATE',
        'ROMREGI_TIME',
        'ROMREGI_LINE',
        'ROMREGI_WON',
        'ROMREGI_MODEL',
        'ROMREGI_PROCESS',
        'ROMREGI_LOTS',
        'ROMREGI_PART_NAME',
        'ROMREGI_LOT_NO',
        'ROMREGI_PART_NO',
        'ROMREGI_POSITION',
        'ROMREGI_ROM_REV',
        'ROMREGI_MAKER',
        'ROMREGI_DEVICE_NO',
        'ROMREGI_SOCKET_NO',
        'ROMREGI_PROGRAM_NAME',
        'ROMREGI_SUM',
        'ROMREGI_DOT_IC',
        'ROMREGI_EMP_ID',
        'ROMREGI_STATUS',
        'ROMREGI_GETSTD',
        'ROMREGI_REJSTD',
        'ROMREGI_REJSTD_REM',
        'ROMREGI_REJSTD_BY',
        'ROMREGI_LVL_APR',
        'ROMREGI_CREATED_AT',
        'ROMREGI_UPDATED_AT',
    ];
}
