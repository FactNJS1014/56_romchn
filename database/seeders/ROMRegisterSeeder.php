<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Rom_Register;

class ROMRegisterSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $romRegister = [
            [
                'ROMREGI_ID' => 'AMROM-202607-000001',
                'ROMREGI_CUSTOMER' => 'EPSON',
                'ROMREGI_MACHINE_NO' => '2',
                'ROMREGI_DATE' => '2026-07-06',
                'ROMREGI_TIME' => '15:38:00',
                'ROMREGI_LINE' => 'SMT-12',
                'ROMREGI_WON' => 'WO-EPSON-0239860',
                'ROMREGI_MODEL' => '223977607',
                'ROMREGI_PROCESS' => 'RF-2',
                'ROMREGI_LOTS' => 8000,
                'ROMREGI_PART_NAME' => 'W25Q128JVSIM',
                'ROMREGI_LOT_NO' => '654445000ZY',
                'ROMREGI_PART_NO' => '218612000',
                'ROMREGI_POSITION' => 'IC201',
                'ROMREGI_ROM_REV' => '0',
                'ROMREGI_MAKER' => 'WINDBOND',
                'ROMREGI_DEVICE_NO' => 'W25Q128JVSIM',
                'ROMREGI_SOCKET_NO' => 'PA-S560',
                'ROMREGI_PROGRAM_NAME' => '223977607',
                'ROMREGI_SUM' => '30E9',
                'ROMREGI_DOT_IC' => '',
                'ROMREGI_EMP_ID' => '2240003',
                'ROMREGI_STATUS' => 1,
                'ROMREGI_GETSTD' => 0,
                'ROMREGI_REJSTD' => 0,
                'ROMREGI_LVL_APR' => 0,
                'ROMREGI_CREATED_AT' => '2026-07-06 15:47:00',
                'ROMREGI_UPDATED_AT' => '',
            ],
            [
                'ROMREGI_ID' => 'AMROM-202607-000002',
                'ROMREGI_CUSTOMER' => 'EPSON',
                'ROMREGI_MACHINE_NO' => '2',
                'ROMREGI_DATE' => '2026-07-06',
                'ROMREGI_TIME' => '15:47:00',
                'ROMREGI_LINE' => 'SMT-12',
                'ROMREGI_WON' => 'WO-EPSON-0239860',
                'ROMREGI_MODEL' => '223977607',
                'ROMREGI_PROCESS' => 'RF-2',
                'ROMREGI_LOTS' => 8000,
                'ROMREGI_PART_NAME' => 'W25Q128JVSIM',
                'ROMREGI_LOT_NO' => '654445000ZY',
                'ROMREGI_PART_NO' => '218612000',
                'ROMREGI_POSITION' => 'IC201',
                'ROMREGI_ROM_REV' => '0',
                'ROMREGI_MAKER' => 'WINDBOND',
                'ROMREGI_DEVICE_NO' => 'W25Q128JVSIM',
                'ROMREGI_SOCKET_NO' => 'PA-S560',
                'ROMREGI_PROGRAM_NAME' => '223977607',
                'ROMREGI_SUM' => '30E9',
                'ROMREGI_DOT_IC' => '',
                'ROMREGI_EMP_ID' => '2240003',
                'ROMREGI_STATUS' => 1,
                'ROMREGI_GETSTD' => 0,
                'ROMREGI_REJSTD' => 0,
                'ROMREGI_LVL_APR' => 0,
                'ROMREGI_CREATED_AT' => '2026-07-06 15:47:00',
                'ROMREGI_UPDATED_AT' => '2026-07-06 15:47:00',
            ]
        ];

        foreach ($romRegister as $register) {
            Rom_Register::create([
                'ROMREGI_ID' => $register['ROMREGI_ID'],
                'ROMREGI_CUSTOMER' => $register['ROMREGI_CUSTOMER'],
                'ROMREGI_MACHINE_NO' => $register['ROMREGI_MACHINE_NO'],
                'ROMREGI_DATE' => $register['ROMREGI_DATE'],
                'ROMREGI_TIME' => $register['ROMREGI_TIME'],
                'ROMREGI_LINE' => $register['ROMREGI_LINE'],
                'ROMREGI_WON' => $register['ROMREGI_WON'],
                'ROMREGI_MODEL' => $register['ROMREGI_MODEL'],
                'ROMREGI_PROCESS' => $register['ROMREGI_PROCESS'],
                'ROMREGI_LOTS' => $register['ROMREGI_LOTS'],
                'ROMREGI_PART_NAME' => $register['ROMREGI_PART_NAME'],
                'ROMREGI_LOT_NO' => $register['ROMREGI_LOT_NO'],
                'ROMREGI_PART_NO' => $register['ROMREGI_PART_NO'],
                'ROMREGI_POSITION' => $register['ROMREGI_POSITION'],
                'ROMREGI_ROM_REV' => $register['ROMREGI_ROM_REV'],
                'ROMREGI_MAKER' => $register['ROMREGI_MAKER'],
                'ROMREGI_DEVICE_NO' => $register['ROMREGI_DEVICE_NO'],
                'ROMREGI_SOCKET_NO' => $register['ROMREGI_SOCKET_NO'],
                'ROMREGI_PROGRAM_NAME' => $register['ROMREGI_PROGRAM_NAME'],
                'ROMREGI_SUM' => $register['ROMREGI_SUM'],
                'ROMREGI_DOT_IC' => $register['ROMREGI_DOT_IC'],
                'ROMREGI_EMP_ID' => $register['ROMREGI_EMP_ID'],
                'ROMREGI_STATUS' => $register['ROMREGI_STATUS'],
                'ROMREGI_GETSTD' => $register['ROMREGI_GETSTD'],
                'ROMREGI_REJSTD' => $register['ROMREGI_REJSTD'],
                'ROMREGI_LVL_APR' => $register['ROMREGI_LVL_APR'],
                'ROMREGI_CREATED_AT' => $register['ROMREGI_CREATED_AT'],
                'ROMREGI_UPDATED_AT' => $register['ROMREGI_UPDATED_AT'] ?: null, // เดิมเป็น '' string ว่าง ควรเป็น null แทน
            ]);
        }
    }
}
