<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ApprMaster extends Model
{
    protected $table = 'ROMAPPR_H_TBL';
    protected $primaryKey = 'ROMAPPR_HID';
    public $timestamps = false;

    protected $fillable = [
        'ROMAPPR_HID',
        'ROMAPPR_HLV',
        'ROMAPPR_HEMPID',
        'ROMAPPR_HSTD',
        'ROMAPPR_HLSTDT',
        'ROMAPPR_HUPDATEAT',
        'ROMAPPR_HSHIFT'
    ];
}
