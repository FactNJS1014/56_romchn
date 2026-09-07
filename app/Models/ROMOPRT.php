<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ROMOPRT extends Model
{
    protected $table = 'ROM_OPRT_TBL';
    protected $primaryKey = 'ROMOPRT_ID';
    public $timestamps = false;
    
    protected $fillable = [
        'ROMOPRT_ID',
        'ROMREGI_ID',
        'ROMOPRT_DATE',
        'ROMOPRT_SHIFT',
        'ROMOPRT_LINE',
        'ROMOPRT_WON',
        'ROMOPRT_MODEL',
        'ROMOPRT_LOTS',
        'ROMOPRT_PARTNUM',
        'ROMOPRT_PROGNAME',
        'ROMOPRT_PROCS',
        'ROMOPRT_POSITION',
        'ROMOPRT_SUMVAL',
        'ROMOPRT_CNTPASS',
        'ROMOPRT_CNTFAIL',
        'ROMOPRT_CNTTOTAL',
        'ROMOPRT_EMPID',
        'ROMOPRT_COMMENT',
        'ROMOPRT_STATUS',
        'ROMOPRT_DELSTD',
        'ROMOPRT_CREATED_AT',
        'ROMOPRT_UPDATED_AT',
    ];
}
