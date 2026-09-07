export interface ModelRecFormInterface {
    emp_id: string;
    date: string;
    line: string;
    customer: string;
    won: string;
    model_name: string;
    model_code: string;
    lots: number;
    prog_name: string;
    process: string;
    position: string;
    machine: string;
    socket: string;
    remark: string;
    partno: string;
    verify_fs: boolean;
    partname: string;
    verify_sn: string;
    sumval: string;
    verify_td: File | null;    
    marking: File | null;
    pic_verify: File | null;
    qty: number;
    mrec_id: string;
   
}