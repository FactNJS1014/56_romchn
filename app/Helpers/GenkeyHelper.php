<?php

/**
 * todo : 2024-05-30
 * * FN: สำหรับกำหนด primary key ให้กับตารางต่าง ๆ โดยรับค่าดังนี้
 * * 1. $textkey    :   คำขึ้นต้นของแต่ละตาราง ตย. TT , SUP , DV
 * * 2. $currentID  :   ID ปัจจุบันของตารางนั้น ๆ ที่ดึงมาจาก DB
 */
function AutogenerateKey($textkey, $currentID)
{
    //* กำหนดตัวแปร YearMonth ex. 202405
    $YM = date('Ym');
    //* นำตัวแปรที่ส่งมาจับแยกตำแหน่งก่อนโดยแบ่งจาก "-"
    $explodeKey = explode("-", $currentID);
    /**
     * * if     : ปีเดือนในระบบ = ปีเดือน php
     * * else   : ปีเดือนไม่เท่ากันหมายความว่าขึ้นเดือนใหม่ละ
     */
    if ($explodeKey[1] == $YM) {
        //* convert to integer and + 1
        $convtoInt = intval($explodeKey[2]) + 1;
        //* adjust format of ID
        $ID = $textkey . '-' . $YM . '-' . str_pad($convtoInt, 6, "0", STR_PAD_LEFT);
    } else {
        //* reset id = 000001 , EX. SUP-202406-000001
        $ID = $textkey . '-' . $YM . '-000001';
    }
    return $ID;
}
