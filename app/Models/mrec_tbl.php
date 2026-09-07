<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class mrec_tbl extends Model
{
    protected $table = "ROM_MREC_TBL";
    protected $primaryKey = "MREC_ID";
    protected $fillable = [
        'MREC_ID',
        'MREC_CUS',
        'MREC_MDLNM',
        'MREC_MDLCD',
        'MREC_PRGNM',
        'MREC_PROCS',
        'MREC_PARTNO',
        'MREC_PARTNM',
        'MREC_POSITION',
        'MREC_MACHINE',
        'MREC_SOCKET',
        'MREC_SUMV',
        'MREC_MARKING',
        'MREC_REMARK',
        'MREC_RECSTD',
        'MREC_DELSTD',
        'MREC_EDITSTD',
        'MREC_CREATEAT',
        'MREC_CREATEBY',
        'MREC_UPDATEAT',
        'MREC_UPDATEBY',
        'MREC_DEVICENO',
        'MREC_CODE',
        'MREC_MAKER',
        'MREC_DENSITY',
        'MREC_QTY',
        'MREC_CHOOSE',
        'RHREC_ID'
    ];
    public $timestamps = false;
}
