<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class hrec_tbl extends Model
{
    protected $table = 'ROM_HREC_TBL';
    protected $primaryKey = 'RHREC_ID';
    protected $fillable = [
        'RHREC_ID',
        'MREC_ID',
        'RHREC_RECBY',
        'RHREC_DATECT',
        'RHREC_CUS',
        'RHREC_WON',
        'RHREC_LOTS',
        'RHREC_MDLNM',
        'RHREC_MDLCD',
        'RHREC_PRGNM',
        'RHREC_PROCS',
        'RHREC_POSITION',
        'RHREC_MACHINE',
        'RHREC_SOCKET',
        'RHREC_REMARK',
        'RHREC_PARTNO',
        'RHREC_FVERIFY',
        'RHREC_PARTNM',
        'RHREC_SNVERIFY',
        'RHREC_SUMVAL',
        'RHREC_SUMVERIFY',
        'RHREC_MARKING',
        'RHREC_MARKVERIFY',
        'RHREC_QTY',
        'RHREC_STD',
        'RHREC_UPD',
        'RHREC_CREATEAT',
        'RHREC_UPDATEAT',
        'RHREC_LVAPP',
        'ROMAPRH_ID',
        'RHREC_LINE',
    ];
    public $timestamps = false;
}
