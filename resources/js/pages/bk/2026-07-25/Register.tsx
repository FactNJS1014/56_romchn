import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import {
    TableCellsIcon,
    CameraIcon,
    FolderIcon,
    PencilIcon,
    TrashIcon,
} from "@heroicons/react/16/solid";
import { useForm } from "@inertiajs/react";
import { FormEventHandler, Key, useEffect, useState, useRef } from "react";
import dayjs, { nowDate, nowTime } from "@/lib/dayjs";

import SearchableSelect from "@/components/SearchableSelect";
import {
    RegisterTypesForm,
    RegisterTypeRow,
} from "@/types/RegisterTypesInterface";
import axios from "axios";
import { useUserSession } from '@/hooks/use-user-session';

const emptyRow = (): RegisterTypeRow => ({
    date_rec: nowDate(),
    time_rec: nowTime(),
    line: "",
    model: "",
    process: "",
    won: "",
    lots: 1,
    part_name: "",
    lot_no: "",
    part_no: "",
    position: "",
    rom_rev: "",
    maker: "",
    device_no: "",
    socket_no: "",
    program_name: "",
    sum: "",
    dot_ic: null,
    emp_id: "",
});

const lineData = [
    { value: "SMT-1", label: "SMT-1" },
    { value: "SMT-2", label: "SMT-2" },
    { value: "SMT-3", label: "SMT-3" },
    { value: "SMT-4", label: "SMT-4" },
    { value: "SMT-5", label: "SMT-5" },
    { value: "SMT-6", label: "SMT-6" },
    { value: "SMT-7", label: "SMT-7" },
    { value: "SMT-8", label: "SMT-8" },
    { value: "SMT-9", label: "SMT-9" },
    { value: "SMT-10", label: "SMT-10" },
    { value: "SMT-11", label: "SMT-11" },
    { value: "SMT-12", label: "SMT-12" },
    { value: "SMT-13", label: "SMT-13" },
    { value: "SMT-14", label: "SMT-14" },
    { value: "SMT-15", label: "SMT-15" },
    { value: "SMT-16", label: "SMT-16" },
    { value: "SMT-17", label: "SMT-17" },
    { value: "SMT-18", label: "SMT-18" },
    { value: "SMT-19", label: "SMT-19" },
    { value: "SMT-20", label: "SMT-20" },
];

const processOptions = [
    { value: "RF", label: "RF" },
    { value: "RF-1", label: "RF-1" },
    { value: "RF-2", label: "RF-2" },
];

export default function Register() {
    const { empno } = useUserSession();
    
    const { data, setData, post, transform, processing, errors, reset } =
        useForm<RegisterTypesForm>({
            customer: "",
            mc_no: "",
            items: [emptyRow()],
        });

    const [customers, setCustomers] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [loadingCustomers, setLoadingCustomers] = useState(false);
    const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);
    const [romRegister, setRomRegister] = useState([]);
    const [editingID, setEditingID] = useState<string | null>(null);
    const [keyword, setKeyword] = useState("");

    const storageUrl = (path: string | null) =>
        path ? `/storage/${path}` : null;

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fieldRefs = useRef<Record<string, HTMLInputElement | null>>({});

    const setFieldRef = (key: string) => (el: HTMLInputElement | null) => {
        fieldRefs.current[key] = el;
    };

    const mapRecordToRow = (item: any): RegisterTypeRow => ({
        date_rec: item.ROMREGI_DATE,
        time_rec: item.ROMREGI_TIME,
        line: item.ROMREGI_LINE ?? "",
        model: item.ROMREGI_MODEL ?? "",
        process: item.ROMREGI_PROCESS ?? "",
        won: item.ROMREGI_WON ?? "",
        lots: item.ROMREGI_LOTS ?? 1,
        part_name: item.ROMREGI_PART_NAME ?? "",
        lot_no: item.ROMREGI_LOT_NO ?? "",
        part_no: item.ROMREGI_PART_NO ?? "",
        position: item.ROMREGI_POSITION ?? "",
        rom_rev: item.ROMREGI_ROM_REV ?? "",
        maker: item.ROMREGI_MAKER ?? "",
        device_no: item.ROMREGI_DEVICE_NO ?? "",
        socket_no: item.ROMREGI_SOCKET_NO ?? "",
        program_name: item.ROMREGI_PROGRAM_NAME ?? "",
        sum: item.ROMREGI_SUM ?? "",
        dot_ic: null, // existing file path can't become a File object; keep null, show filename separately if needed
        emp_id: item.ROMREGI_EMP_ID ?? "",
    });

    useEffect(() => {
        fetch(route("api.cus"))
            .then((res) => res.json())
            .then((json) => {
                // console.log(json);
                // console.log(typeof json[0]);
                setCustomers(json);
            });
    }, []);

    const fetchRomRegister = async (keyword = "") => {
        try {
            const response = await axios.get(route("api.rom-register"), {
                params: {
                    search: keyword,
                },
            });

            setRomRegister(response.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchRomRegister(keyword);
        }, 500); // รอ 500ms หลังหยุดพิมพ์

        return () => clearTimeout(timer);
    }, [keyword]);

    useEffect(() => {
        if (!previewImage) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPreviewImage(null);
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [previewImage]);

    const addRow = () => {
        setData("items", [...data.items, emptyRow()]);
    };

    const removeRow = (index: number) => {
        setData(
            "items",
            data.items.filter((_, i) => i !== index),
        );
    };

    const updateRow = <K extends keyof RegisterTypeRow>(
        index: number,
        field: K,
        value: RegisterTypeRow[K],
    ) => {
        const rows = [...data.items];
        rows[index] = { ...rows[index], [field]: value };
        setData("items", rows);
    };

    // Generate DOTIC file name with format: DOTIC_{WON}_{YYYYMMDD_HHmmss}.{ext}
    const generateDotIcFileName = (
        row: RegisterTypeRow,
        originalFile: File,
    ) => {
        const ext = originalFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const wonPart = row.won
            ? row.won.replace(/[^a-zA-Z0-9-]/g, "")
            : "NOWON";
        const timestamp = dayjs().format("YYYYMMDD_HHmmss");
        return `DOTIC_${wonPart}_${timestamp}.${ext}`;
    };

    const handleFileChange = (
        index: number,
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        const row = data.items[index];
        const newName = generateDotIcFileName(row, file);
        const renamedFile = new File([file], newName, { type: file.type });

        updateRow(index, "dot_ic", renamedFile);

        // เคลียร์ค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้ (เช่นถ่ายรูปใหม่ทับของเดิม)
        e.target.value = "";
    };

    const inputClass =
        "w-full rounded-md border border-gray-200 bg-transparent px-3 py-2 text-slate-700 hover:border-slate-200 focus:border-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-slate-100 transition font-medium ";

    // แปลง items ปัจจุบันเป็น JSON string ที่ serialize ได้ (ไฟล์ -> ชื่อ/ขนาด)
    const buildPreviewJson = () =>
        JSON.stringify(
            data.items.map((row) => ({
                ...row,
                dot_ic: row.dot_ic
                    ? {
                          name: row.dot_ic.name,
                          size_kb: Math.round(row.dot_ic.size / 1024),
                      }
                    : null,
            })),
            null,
            2,
        );

    // ---- จุดที่เปลี่ยน: ไม่ post() ไป backend แล้ว แค่โชว์ JSON บนหน้าจอ ----
    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (editingID) {
            transform((data) => ({
                ...data,
                _method: "put",
            }));

            post(route("register-types.update", editingID), {
                forceFormData: true,
                onSuccess: () => {
                    setEditingID(null);
                    transform((data) => data); // reset transform กลับเป็นปกติ จะได้ไม่กระทบตอน create ครั้งถัดไป
                    fetchRomRegister();
                    reset();
                },
            });
        } else {
            post(route("register-types.store"), {
                forceFormData: true,
                onSuccess: () => {
                    fetchRomRegister();
                    reset();
                },
            });
        }
    };
    // เมื่อเลือก customer -> ไปดึง work order ที่ผูกกับ customer นั้นจาก controller
    const handleCustomerChange = (key: Key | null) => {
        const customerValue = (key as string) ?? "";

        setData((prev) => ({
            ...prev,
            customer: customerValue,
            items: prev.items.map((row) => ({ ...row, won: "", model: "" })), // เคลียร์ won/model ทุกแถวแทน
        }));

        setWorkOrders([]);
        if (!customerValue) return;

        setLoadingWorkOrders(true);
        fetch(route("api.work-orders", { customer: customerValue }))
            .then((res) => res.json())
            .then((json) => {
                const normalized = json.map((item: any) => ({
                    ...item,
                    WON: item.WON?.trim(),
                }));
                setWorkOrders(normalized);
            })
            .catch(() => setWorkOrders([]))
            .finally(() => setLoadingWorkOrders(false));
    };
    const handleWorkOrderChange = (index: number, wonValue: string) => {
        const matched = workOrders.find((item: any) => item.WON === wonValue);

        const rows = [...data.items];
        rows[index] = {
            ...rows[index],
            won: wonValue,
            model: matched ? (matched as any).MDLCD?.trim() : rows[index].model,
            lots: matched ? parseInt((matched as any).WONQT) : rows[index].lots,
        };
        setData("items", rows);
    };

    const searchWorkOrders = (query: string) => {
        if (!data.customer) return;

        setLoadingWorkOrders(true);
        fetch(
            route("api.work-orders", {
                customer: data.customer,
                q: query,
            }),
        )
            .then((res) => res.json())
            .then((json) => {
                const normalized = json.map((item: any) => ({
                    ...item,
                    WON: item.WON?.trim(),
                }));
                setWorkOrders(normalized);
            })
            .catch(() => setWorkOrders([]))
            .finally(() => setLoadingWorkOrders(false));
    };

    //กรณีใช้เครื่องยิงสแกนบาร์โค้ด ให้ใส่ focus ที่ input ถัดไป
    const handleScanEnter = (
        e: React.KeyboardEvent<HTMLInputElement>,
        nextKey?: string,
    ) => {
        if (e.key !== "Enter") return;
        e.preventDefault(); // กัน enter ที่เครื่องยิงส่งมา ไม่ให้ไป submit ฟอร์ม

        if (nextKey) {
            const nextEl = fieldRefs.current[nextKey];
            nextEl?.focus();
            nextEl?.select(); // เผื่อช่องถัดไปมีค่าเดิมอยู่ จะได้ยิงทับได้เลยโดยไม่ต้องลบก่อน
        }
    };

    const handleEdit = (id: string) => {
        const record = romRegister.find((r: any) => r.ROMREGI_ID === id);
        if (!record) return;

        setEditingID(id);

        setData({
            customer: record.ROMREGI_CUSTOMER ?? "",
            mc_no: record.ROMREGI_MACHINE_NO ?? "",
            items: [mapRecordToRow(record)],
        });

        // ถ้า customer เปลี่ยน ต้องโหลด work order ของ customer นั้นด้วย
        if (record.ROMREGI_CUSTOMER) {
            setLoadingWorkOrders(true);
            fetch(
                route("api.work-orders", { customer: record.ROMREGI_CUSTOMER }),
            )
                .then((res) => res.json())
                .then((json) => {
                    const normalized = json.map((item: any) => ({
                        ...item,
                        WON: item.WON?.trim(),
                    }));
                    setWorkOrders(normalized);
                })
                .finally(() => setLoadingWorkOrders(false));
        }

        // scroll ไปที่ฟอร์มด้านบน ให้ user เห็นว่ากำลังแก้ไข
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = (id: string) => {
        if (confirm("คุณต้องการลบข้อมูลนี้หรือไม่?")) {
            router.put(route("register-types.destroy", id));
            fetchRomRegister();
        }
    };

    const errorFor = (index: number, field: string) =>
        (errors as Record<string, string>)[`items.${index}.${field}`];

    return (
        <AppLayout>
            <Head title="Register" />
            <div className="max-w-full mx-auto">
                <div className="flex items-center gap-4">
                    <TableCellsIcon className="w-6 h-6 text-blue-600" />
                    <h1 className="text-lg font-bold text-blue-800">
                        บันทึกข้อมูล Register ROM Writing new version
                    </h1>
                </div>

                <form onSubmit={submit} className="mt-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mb-4">
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                Customer
                            </label>
                            <select
                                className={`w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100 transition ${
                                    errors.customer
                                        ? "border-red-400 focus:border-red-400"
                                        : "border-slate-300 focus:border-slate-400"
                                }`}
                                value={data.customer}
                                onChange={(e) =>
                                    handleCustomerChange(e.target.value || null)
                                }
                            >
                                <option value="" disabled>
                                    {loadingCustomers
                                        ? "กำลังโหลด..."
                                        : "เลือก customer"}
                                </option>
                                {customers.map((customer: string) => (
                                    <option key={customer} value={customer}>
                                        {customer.trim()}
                                    </option>
                                ))}
                            </select>
                            {errors.customer && (
                                <div className="text-red-500 text-xs mt-1">
                                    {errors.customer}
                                </div>
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-slate-600 mb-1">
                                M/C No.
                            </label>
                            <input
                                type="text"
                                value={data.mc_no}
                                onChange={(e) =>
                                    setData("mc_no", e.target.value)
                                }
                                placeholder="เลขเครื่องจักร"
                                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:border-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-100 transition "
                            />
                            {errors.mc_no && (
                                <div className="text-red-500 text-xs mt-1">
                                    {errors.mc_no}
                                </div>
                            )}
                        </div>
                    </div>
                    {/* Toolbar */}
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <button
                            type="button"
                            onClick={addRow}
                            className="text-sm font-medium px-3.5 py-1.5 rounded-lg bg-slate-800 text-white hover:bg-slate-700 transition"
                        >
                            + เพิ่มแถว
                        </button>
                    </div>

                    {/* Table card */}
                    <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white">
                        <div className="overflow-x-auto">
                            <table className="border-collapse text-sm min-w-full">
                                <thead>
                                    <tr className="bg-slate-50 border-b border-slate-200">
                                        <th className="sticky left-0 bg-slate-50 border-r border-slate-200 px-2 py-2.5 text-xs font-medium text-slate-500 w-10 text-center">
                                            #
                                        </th>

                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "110px" }}
                                        >
                                            วันที่
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "80px" }}
                                        >
                                            เวลา
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "150px" }}
                                        >
                                            Line
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "280px" }}
                                        >
                                            Won
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "220px" }}
                                        >
                                            Model
                                        </th>

                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "140px" }}
                                        >
                                            Lots
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "150px" }}
                                        >
                                            Process
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "300px" }}
                                        >
                                            Part name
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "300px" }}
                                        >
                                            Lot no
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "300px" }}
                                        >
                                            Part no
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "100px" }}
                                        >
                                            Position
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "90px" }}
                                        >
                                            ROM rev
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "250px" }}
                                        >
                                            Maker
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "280px" }}
                                        >
                                            Device no
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "280px" }}
                                        >
                                            Socket no
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "260px" }}
                                        >
                                            Program
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "150px" }}
                                        >
                                            Sum
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "130px" }}
                                        >
                                            Dot IC
                                        </th>
                                        <th
                                            className="px-2 py-2.5 text-left text-xs font-medium text-slate-500"
                                            style={{ minWidth: "130px" }}
                                        >
                                            Emp ID
                                        </th>
                                        <th className="px-2 py-2.5 w-12" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {data.items.map((row, index) => (
                                        <tr
                                            key={index}
                                            className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60 transition-colors"
                                        >
                                            <td className="sticky left-0 bg-white border-r border-slate-100 px-2 py-1.5 text-center text-xs font-mono text-slate-400">
                                                {String(index + 1).padStart(
                                                    2,
                                                    "0",
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="date"
                                                    value={row.date_rec}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "date_rec",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                />

                                                {errorFor(
                                                    index,
                                                    "date_rec",
                                                ) && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "date_rec",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="time"
                                                    value={row.time_rec}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "time_rec",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                                {errorFor(
                                                    index,
                                                    "time_rec",
                                                ) && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "time_rec",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <select
                                                    className={`w-full rounded-lg border bg-white px-3 py-2 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-100 transition ${
                                                        errors.customer
                                                            ? "border-red-400 focus:border-red-400"
                                                            : "border-slate-300 focus:border-slate-400"
                                                    }`}
                                                    value={row.line}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "line",
                                                            e.target.value,
                                                        )
                                                    }
                                                >
                                                    <option
                                                        value=""
                                                        selected
                                                        disabled
                                                    >
                                                        Select Line
                                                    </option>
                                                    {lineData.map(
                                                        (line: {
                                                            value: string;
                                                            label: string;
                                                        }) => (
                                                            <option
                                                                key={line.value}
                                                                value={
                                                                    line.value
                                                                }
                                                            >
                                                                {line.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                {errorFor(index, "line") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "line",
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <SearchableSelect
                                                    options={workOrders.map(
                                                        (wo: any) => ({
                                                            value: wo.WON,
                                                            label: wo.WON,
                                                        }),
                                                    )}
                                                    value={row.won}
                                                    onChange={(val) =>
                                                        handleWorkOrderChange(
                                                            index,
                                                            val,
                                                        )
                                                    }
                                                    onSearchChange={
                                                        searchWorkOrders
                                                    }
                                                    minSearchLength={4}
                                                    placeholder={
                                                        data.customer
                                                            ? "เลือก/ค้นหา work order"
                                                            : "เลือก customer ก่อน"
                                                    }
                                                    disabled={!data.customer}
                                                    loading={loadingWorkOrders}
                                                    isInvalid={
                                                        !!errorFor(index, "won")
                                                    }
                                                    searchPlaceholder="พิมพ์ 4 ตัวท้าย work order..."
                                                />
                                                {errorFor(index, "won") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(index, "won")}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="text"
                                                    value={row.model}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "model",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Model Code..."
                                                    readOnly
                                                />
                                                {errorFor(index, "model") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "model",
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={row.lots}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "lots",
                                                            Number(
                                                                e.target.value,
                                                            ),
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                                {errorFor(index, "lots") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "lots",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <select
                                                    value={row.process}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "process",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                >
                                                    <option
                                                        value=""
                                                        selected
                                                        disabled
                                                    >
                                                        Select Process
                                                    </option>
                                                    {processOptions.map(
                                                        (option) => (
                                                            <option
                                                                key={
                                                                    option.value
                                                                }
                                                                value={
                                                                    option.value
                                                                }
                                                            >
                                                                {option.label}
                                                            </option>
                                                        ),
                                                    )}
                                                </select>
                                                {errorFor(index, "process") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "process",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Part name */}
                                            <td className="px-2 py-1.5">
                                                <input
                                                    ref={setFieldRef(
                                                        `part_name-${index}`,
                                                    )}
                                                    type="text"
                                                    value={row.part_name}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "part_name",
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleScanEnter(
                                                            e,
                                                            `lot_no-${index}`,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Part Name..."
                                                />
                                                {errorFor(
                                                    index,
                                                    "part_name",
                                                ) && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "part_name",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Lot no */}
                                            <td className="px-2 py-1.5">
                                                <input
                                                    ref={setFieldRef(
                                                        `lot_no-${index}`,
                                                    )}
                                                    type="text"
                                                    value={row.lot_no}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "lot_no",
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleScanEnter(
                                                            e,
                                                            `part_no-${index}`,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Lot No..."
                                                />
                                                {errorFor(index, "lot_no") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "lot_no",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            {/* Part no */}
                                            <td className="px-2 py-1.5">
                                                <input
                                                    ref={setFieldRef(
                                                        `part_no-${index}`,
                                                    )}
                                                    type="text"
                                                    value={row.part_no}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "part_no",
                                                            e.target.value,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleScanEnter(
                                                            e,
                                                            `position-${index}`,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Part No..."
                                                />
                                                {errorFor(index, "part_no") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "part_no",
                                                        )}
                                                    </div>
                                                )}
                                            </td>
                                            <td className="px-2 py-1.5">
                                                <input
                                                    ref={setFieldRef(
                                                        `position-${index}`,
                                                    )}
                                                    type="text"
                                                    value={row.position}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "position",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Position..."
                                                />
                                                {errorFor(
                                                    index,
                                                    "position",
                                                ) && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "position",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="text"
                                                    value={row.rom_rev}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "rom_rev",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                />
                                                {errorFor(index, "rom_rev") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "rom_rev",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="text"
                                                    value={row.maker}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "maker",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Maker..."
                                                />
                                                {errorFor(index, "maker") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "maker",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="text"
                                                    value={row.device_no}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "device_no",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Device No..."
                                                />
                                                {errorFor(
                                                    index,
                                                    "device_no",
                                                ) && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "device_no",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="text"
                                                    value={row.socket_no}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "socket_no",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Socket No..."
                                                />
                                                {errorFor(
                                                    index,
                                                    "socket_no",
                                                ) && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "socket_no",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="text"
                                                    value={row.program_name}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "program_name",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Program Name..."
                                                />
                                                {errorFor(
                                                    index,
                                                    "program_name",
                                                ) && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "program_name",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="text"
                                                    value={row.sum}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "sum",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Value Sum..."
                                                />
                                                {errorFor(index, "sum") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(index, "sum")}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <div className="flex gap-1">
                                                    {/* ปุ่มเลือกไฟล์ปกติ — แสดงทุกอุปกรณ์ */}
                                                    <label className="flex flex-1 items-center gap-1.5 cursor-pointer text-xs text-slate-500 hover:text-slate-700 rounded-md border border-dashed border-slate-300 px-2 py-1.5 hover:border-slate-400 transition min-w-0">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            className="hidden"
                                                            onChange={(e) =>
                                                                handleFileChange(
                                                                    index,
                                                                    e,
                                                                )
                                                            }
                                                        />
                                                        <FolderIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                                        <span className="truncate">
                                                            {row.dot_ic
                                                                ? row.dot_ic
                                                                      .name
                                                                : "เลือกไฟล์"}
                                                        </span>
                                                    </label>

                                                    {/* ปุ่มถ่ายรูป — โชว์เฉพาะอุปกรณ์จอสัมผัส (มือถือ/tablet) */}
                                                    <label className="[@media(hover:hover)]:hidden flex shrink-0 items-center justify-center cursor-pointer rounded-md border border-slate-300 bg-slate-800 px-2.5 py-1.5 text-white hover:bg-slate-700 transition">
                                                        <input
                                                            type="file"
                                                            accept="image/*"
                                                            capture="environment"
                                                            className="hidden"
                                                            onChange={(e) =>
                                                                handleFileChange(
                                                                    index,
                                                                    e,
                                                                )
                                                            }
                                                        />
                                                        <CameraIcon className="h-4 w-4" />
                                                    </label>
                                                </div>
                                                {errorFor(index, "dot_ic") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "dot_ic",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5">
                                                <input
                                                    type="text"
                                                    value={empno}
                                                    onChange={(e) =>
                                                        updateRow(
                                                            index,
                                                            "emp_id",
                                                            e.target.value,
                                                        )
                                                    }
                                                    className={inputClass}
                                                    placeholder="Employee Code..."
                                                    maxLength={7}
                                                    readOnly
                                                />
                                                {errorFor(index, "emp_id") && (
                                                    <div className="text-red-500 text-[11px] mt-0.5">
                                                        {errorFor(
                                                            index,
                                                            "emp_id",
                                                        )}
                                                    </div>
                                                )}
                                            </td>

                                            <td className="px-2 py-1.5 text-center">
                                                {data.items.length > 1 && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            removeRow(index)
                                                        }
                                                        className=" hover:text-red-500 transition text-sm font-medium hover:bg-red-100 px-2 py-1 rounded bg-red-500 text-white
                                                        cursor-pointer"
                                                    >
                                                        Remove
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div className="mt-5">
                        <button
                            type="submit"
                            disabled={processing}
                            className="bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition"
                        >
                            {processing
                                ? "กำลังบันทึก..."
                                : editingID
                                  ? "บันทึกการแก้ไข"
                                  : `บันทึกทั้งหมด (${data.items.length} รายการ)`}
                        </button>

                        {editingID && (
                            <button
                                type="button"
                                onClick={() => {
                                    setEditingID(null);
                                    reset();
                                }}
                                className="ml-2 text-sm font-medium px-5 py-2.5 rounded-lg bg-slate-200 text-slate-700 hover:bg-slate-300 transition"
                            >
                                ยกเลิกการแก้ไข
                            </button>
                        )}
                    </div>
                </form>

                <div className="flex items-center justify-between">
                    <div>
                        <div className="flex items-center gap-4 mt-5">
                            <TableCellsIcon className="w-6 h-6 text-blue-600" />
                            <h1 className="text-lg font-bold text-blue-800">
                                รายการข้อมูล Register ROM Writing ทั้งหมด
                            </h1>
                        </div>
                        <p className="text-gray-700 text-md font-medium">
                            เพื่อทำการตรวจสอบและดำเนินการให้ operator
                            ในไลน์ทำการบันทึกถัดไป
                        </p>
                    </div>
                    <div>
                        <input
                            type="text"
                            className="w-full p-2 border border-gray-300 rounded focus:outline-none"
                            placeholder="ค้นหา WO#...."
                            value={keyword}
                            onChange={(e) => setKeyword(e.target.value)}
                        />
                    </div>
                </div>

                {/* Table show Output */}
                <div className="rounded-xl border border-slate-200 shadow-sm overflow-hidden bg-white mt-5">
                    <div className="relative max-h-[40vh] overflow-auto">
                        <table className="border-collapse text-sm min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10">
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "110px" }}
                                    >
                                        Action Edit
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "110px" }}
                                    >
                                        Action Delete
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "100px" }}
                                    >
                                        Customer
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "100px" }}
                                    >
                                        M/C No.
                                    </th>

                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "110px" }}
                                    >
                                        วันที่
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "100px" }}
                                    >
                                        เวลา
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "110px" }}
                                    >
                                        Line
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "280px" }}
                                    >
                                        Won
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "220px" }}
                                    >
                                        Model
                                    </th>

                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "90px" }}
                                    >
                                        Lots
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "110px" }}
                                    >
                                        Process
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "300px" }}
                                    >
                                        Part Name
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "300px" }}
                                    >
                                        Lot No.
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "300px" }}
                                    >
                                        Part No.
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "100px" }}
                                    >
                                        Position
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "90px" }}
                                    >
                                        ROM rev
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Maker
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "280px" }}
                                    >
                                        Device No.
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "280px" }}
                                    >
                                        Socket No.
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "260px" }}
                                    >
                                        Program
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Sum Value
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "130px" }}
                                    >
                                        Dot IC
                                    </th>
                                    <th
                                        className="px-2 py-2.5 text-left text-sm font-medium text-slate-500"
                                        style={{ minWidth: "130px" }}
                                    >
                                        Emp ID
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {romRegister.map((item: any) => (
                                    <tr key={item.ROMREGI_ID}>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            <button
                                                className="flex items-center gap-2 text-yellow-600 bg-yellow-100 px-5 py-2 rounded cursor-pointer"
                                                onClick={() =>
                                                    handleEdit(item.ROMREGI_ID)
                                                }
                                            >
                                                <PencilIcon className="w-4 h-4" />
                                                Edit
                                            </button>
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            <button
                                                className="flex items-center gap-2 text-red-600 bg-red-100 px-5 py-2 rounded cursor-pointer"
                                                onClick={() =>
                                                    handleDelete(
                                                        item.ROMREGI_ID,
                                                    )
                                                }
                                            >
                                                <TrashIcon className="w-4 h-4" />
                                                Delete
                                            </button>
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_CUSTOMER}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_MACHINE_NO}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_DATE}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_TIME}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_LINE}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_WON}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_MODEL}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_LOTS}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_PROCESS}
                                        </td>

                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_PART_NAME}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_LOT_NO}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_PART_NO}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_POSITION}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_ROM_REV}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_MAKER}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_DEVICE_NO}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_SOCKET_NO}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_PROGRAM_NAME}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_SUM}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_DOT_IC ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewImage(
                                                            storageUrl(
                                                                item.ROMREGI_DOT_IC,
                                                            ) || "",
                                                        )
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <img
                                                        src={
                                                            storageUrl(
                                                                item.ROMREGI_DOT_IC,
                                                            ) || ""
                                                        }
                                                        alt="Dot IC"
                                                        className="h-12 w-12 object-cover rounded border border-slate-200 hover:opacity-80 hover:scale-105 transition"
                                                    />
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 text-xs">
                                                    ไม่มีรูป
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-2 py-2.5 text-sm text-slate-700">
                                            {item.ROMREGI_EMP_ID}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Show image after click image in table */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
                    onClick={() => setPreviewImage(null)}
                >
                    <div
                        className="relative max-w-4xl max-h-[90vh]"
                        onClick={(e) => e.stopPropagation()} // กันไม่ให้คลิกที่รูปแล้ว modal ปิด
                    >
                        <button
                            type="button"
                            onClick={() => setPreviewImage(null)}
                            className="absolute -top-10 right-0 text-white hover:text-slate-300 transition"
                        >
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-8 w-8"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                            >
                                <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M6 18L18 6M6 6l12 12"
                                />
                            </svg>
                        </button>

                        <img
                            src={previewImage}
                            alt="Dot IC Preview"
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                        />
                    </div>
                </div>
            )}
        </AppLayout>
    );
}
