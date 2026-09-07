@component('mail::message')
# แจ้งเตือนรายการรอการอนุมัติของแผนก {{ $data_mail->RHREC_LVAPP == 1 ? 'AM' : 'QC' }}

@component('mail::table')
| รายการ | ข้อมูล |
| :----- | :----- |
| เลขที่เอกสาร | {{ $data_mail->RHREC_ID }} |
| ลูกค้า | {{ $data_mail->RHREC_CUS ?? '-' }} |
| วันที่พนักงานบันทึก | {{ $data_mail->RHREC_DATECT ?? '-' }} |
| Work Order | {{ $data_mail->RHREC_WON ?? '-' }} |
| Model Code | {{ $data_mail->RHREC_MDLCD ?? '-' }} |
| Process | {{ $data_mail->RHREC_PROCS ?? '-' }} |
@endcomponent

@component('mail::button', ['url' => $link])
เข้าสู่ระบบเพื่ออนุมัติ
@endcomponent

ขอบคุณครับ,<br>
{{ config('app.name') }}
@endcomponent