export interface MasterReg {
    customer: string,
    modelname: string,
    modelcode: string,
    prog_name: string,
    process: string,
    part_no: string,
    part_name: string,
    position: string,
    machine: string,
    socket: string,
    sumv: string,
    marking: File | null,
    remark: string,
    empno: string,
}

// โครงสร้างตรงกับ Laravel Paginator (paginate() -> toJson)
export interface PaginationLink {
  url: string | null;
  label: string;
  active: boolean;
}

export interface PaginatedResponse<T> {
  data: T[];
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
  links: PaginationLink[];
  next_page_url: string | null;
  prev_page_url: string | null;
}