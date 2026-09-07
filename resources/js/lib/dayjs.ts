// resources/js/lib/dayjs.ts
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import buddhistEra from 'dayjs/plugin/buddhistEra';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(buddhistEra);
dayjs.extend(customParseFormat);
dayjs.locale('th');

export default dayjs;

// ค่า default ตอนเพิ่มแถวใหม่ (ใช้เวลาปัจจุบัน)
export const nowDate = () => dayjs().format('YYYY-MM-DD');   // สำหรับ <input type="date">
export const nowTime = () => dayjs().format('HH:mm');        // สำหรับ <input type="time">

// format สำหรับส่งไป backend (Laravel: date / time column)
export const toApiDate = (value: string) => dayjs(value, 'YYYY-MM-DD').format('YYYY-MM-DD');
export const toApiTime = (value: string) => dayjs(value, 'HH:mm').format('HH:mm:ss');

// format สำหรับแสดงผลให้คนอ่าน (เช่นใน preview หรือหน้า index)
export const displayDate = (value: string) => dayjs(value, 'YYYY-MM-DD').format('D MMM BBBB'); // พ.ศ.
export const displayDateTime = (date: string, time: string) =>
    dayjs(`${date} ${time}`, 'YYYY-MM-DD HH:mm').format('D MMM YYYY HH:mm');