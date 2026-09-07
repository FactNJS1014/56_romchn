export interface RegisterTypeRow {
    date_rec: string
    time_rec: string
    line: string
    model: string
    process: string
    won: string
    lots: number
    part_name: string
    lot_no: string
    part_no: string
    position: string
    rom_rev: string
    maker: string
    device_no: string
    socket_no: string
    program_name: string
    sum: string
    dot_ic: File | null
    emp_id: string
    
}

export type RegisterTypesForm = {
    items: RegisterTypeRow[]
    customer: string
    mc_no: string
} & Record<string, any>