import { Head, router } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import {
    TableCellsIcon,
    CameraIcon,
    FolderIcon,
    PencilIcon,
    TrashIcon,
    BookOpenIcon,
    PlusIcon,
    CheckIcon,
} from "@heroicons/react/16/solid";
import { useForm } from "@inertiajs/react";
import {
    FormEventHandler,
    Key,
    useEffect,
    useState,
    useRef,
    useCallback,
} from "react";
import dayjs, { nowDate, nowTime } from "@/lib/dayjs";
import { Modal } from "@/components/UI/Modal";
import type { MasterRegType } from "@/types/MasterRegInterface";
import axios from "axios";
import { useUserSession } from "@/hooks/use-user-session";
import SearchableSelect from "@/components/SearchableSelect";
import Pagination from "@/components/Table/Pagination";
import type { PaginatedResponse, MasterReg } from "@/types/pagination";
import imageCompression from "browser-image-compression";

export default function MasterReg() {
    /**
     * สร้าง State สำหรับเปิด/ปิด Modal
     */
    const [isOpenModal, setIsOpenModal] = useState(false);
    const { empno } = useUserSession();

    /**
     * สร้าง Form สำหรับส่งข้อมูล
     */
    const {
        data,
        setData,
        reset,
        post,
        errors,
        put,
        processing,
        clearErrors,
        progress,
        transform,
    } = useForm<MasterRegType>({
        customer: "",
        modelname: "",
        modelcode: "",
        prog_name: "",
        process: "",
        part_no: "",
        part_name: "",
        position: "",
        machine: "",
        socket: "",
        sumv: "",
        marking: null,
        remark: "",
        empno: empno,
    });

    /**
     * ตัวแปรสำหรับเก็บข้อมูล
     */
    const [customer, setCustomer] = useState([]);
    const [modelName, setModelName] = useState([]);
    const [modelCode, setModelCode] = useState([]);
    const [process, setProcess] = useState(["RF", "RF-1", "RF-2"]);

    const [response, setResponse] =
        useState<PaginatedResponse<MasterReg> | null>(null);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");
    const [sort, setSort] = useState("created_at");
    const [direction, setDirection] = useState<SortDirection>("desc");
    const [perPage, setPerPage] = useState(10);
    const [url, setUrl] = useState<string>("/api/master-reg");
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const storageUrl = (path: string | null) =>
        path ? `/storage/${path}` : null;

    const [editId, setEditId] = useState("");

    const [existingMarkingUrl, setExistingMarkingUrl] = useState<string | null>(
        null,
    );

    useEffect(() => {
        if (!previewImage) return;

        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === "Escape") setPreviewImage(null);
        };

        window.addEventListener("keydown", handleEsc);
        return () => window.removeEventListener("keydown", handleEsc);
    }, [previewImage]);

    /**
     * useEffect สำหรับดึงข้อมูลลูกค้า
     */
    useEffect(() => {
        axios.get(route("api.cus")).then((response) => {
            const list_cus = response.data;
            setCustomer(list_cus);
        });
    }, []);

    const handleChange = (value: string | null) => {
        if (value === null) {
            reset();
            clearErrors();
        } else {
            console.log(value);
            setData("customer", String(value));

            axios.get(route("api.find-model", value)).then((response) => {
                const list_modelnm = response.data.map((item: any) =>
                    item.MDLNM.trim(),
                );
                const list_modelcd = response.data.map((item: any) =>
                    item.MDLCD.trim(),
                );
                // console.log(list_model);
                setModelName(list_modelnm);
                setModelCode(list_modelcd);
            });
        }
    };

    /**
     * Image Compression
     */
    const compressImage = async (file: File) => {
        const options = {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
        };
        try {
            const compressedFile = await imageCompression(file, options);
            return compressedFile;
        } catch (error) {
            console.log(error);
            return file;
        }
    };

    /**
     * image
     */

    // Generate DOTIC file name with format: DOTIC_{WON}_{YYYYMMDD_HHmmss}.{ext}
    const generateDotIcFileName = (originalFile: File) => {
        const ext = originalFile.name.split(".").pop()?.toLowerCase() || "jpg";
        const timestamp = dayjs().format("YYYYMMDD_HHmmss");
        return `IMAGE_${timestamp}.${ext}`;
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        try {
            // resize ก่อน (จำกัดความกว้าง/สูงสูงสุด ปรับตัวเลขได้ตามต้องการ)
            const compressedImage = await compressImage(file);

            const newName = generateDotIcFileName(file);
            const renamedFile = new File([compressedImage], newName, {
                type: compressedImage.type,
            });

            setData("marking", renamedFile);
        } catch (error) {
            console.error("Resize error:", error);
            // fallback: ถ้า resize ไม่สำเร็จ ใช้ไฟล์ต้นฉบับแทน
            const newName = generateDotIcFileName(file);
            const renamedFile = new File([file], newName, { type: file.type });
            setData("marking", renamedFile);
        } finally {
            // เคลียร์ค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้ (เช่นถ่ายรูปใหม่ทับของเดิม)
            e.target.value = "";
        }
    };

    const fetchMasterReg = useCallback(
        async (targetUrl: string) => {
            setLoading(true);
            try {
                const { data } = await axios.get<PaginatedResponse<MasterReg>>(
                    targetUrl,
                    {
                        params: {
                            search: search || undefined,
                            sort,
                            direction,
                            per_page: perPage,
                        },
                    },
                );
                setResponse(data);
            } finally {
                setLoading(false);
            }
        },
        [search, sort, direction, perPage],
    );

    useEffect(() => {
        fetchMasterReg(url);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [url, sort, direction, perPage]);

    // ค้นหาแบบ debounce สั้น ๆ แล้วกลับไปหน้า 1
    useEffect(() => {
        const timer = setTimeout(() => {
            setUrl("/api/master-reg");
            fetchMasterReg("/api/master-reg");
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    const handleSort = (column: string) => {
        if (sort === column) {
            setDirection(direction === "asc" ? "desc" : "asc");
        } else {
            setSort(column);
            setDirection("asc");
        }
    };

    const sortIcon = (column: string) => {
        if (sort !== column) return null;
        return direction === "asc" ? "▲" : "▼";
    };

    /**
     * Handle submit form
     */
    const handleSubmit: FormEventHandler<HTMLFormElement> = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                transform((data) => {
                    return {
                        ...data,
                        _method: "PUT",
                    };
                });

                post(
                    route("master-reg.update", {
                        id: editId,
                        marking: data.marking,
                    }),
                    {
                        forceFormData: true,
                        onSuccess: () => {
                            setIsOpenModal(false);
                            fetchMasterReg(url);
                            reset();
                        },
                    },
                );
            } else {
                post(route("api.master-reg"), {
                    onSuccess: () => {
                        setEditId("");
                        setIsOpenModal(false);
                        fetchMasterReg(url);
                        reset();
                    },
                    onError: (error) => {
                        console.log(error);
                    },
                });
            }
        } catch (error) {
            console.log(error);
        }
    };

    // Edit
    const handleEdit = async (id: string) => {
        const res = response?.data?.find((item: any) => item.MREC_ID === id);
        setEditId(id);

        // preload ให้ SearchableSelect มี option ของค่าปัจจุบันอยู่แล้ว
        if (res?.MREC_MDLNM) {
            setModelName((prev) =>
                prev.includes(res.MREC_MDLNM)
                    ? prev
                    : [res.MREC_MDLNM, ...prev],
            );
        }
        if (res?.MREC_MDLCD) {
            setModelCode((prev) =>
                prev.includes(res.MREC_MDLCD)
                    ? prev
                    : [res.MREC_MDLCD, ...prev],
            );
        }
        setIsOpenModal(true);
        setData((prev) => ({
            ...prev,
            customer: res?.MREC_CUS ?? prev.customer,
            modelname: res?.MREC_MDLNM ?? prev.modelname,
            modelcode: res?.MREC_MDLCD ?? prev.modelcode,
            prog_name: res?.MREC_PRGNM ?? prev.prog_name,
            process: res?.MREC_PROCS ?? prev.process,
            part_no: res?.MREC_PARTNO ?? prev.part_no,
            part_name: res?.MREC_PARTNM ?? prev.part_name,
            position: res?.MREC_POSITION ?? prev.position,
            machine: res?.MREC_MACHINE ?? prev.machine,
            socket: res?.MREC_SOCKET ?? prev.socket,
            sumv: res?.MREC_SUMV ?? prev.sumv,
            marking: null,
            remark: res?.MREC_REMARK ?? prev.remark,
            empno: res?.MREC_CREATEBY ?? prev.empno,
        }));

        setExistingMarkingUrl(res?.MREC_MARKING ?? null);
    };

    // Delete
    const handleDelete = (id: string) => {
        transform((data) => {
            return {
                ...data,
                _method: "PUT",
            };
        });
        post(route("master-reg.destroy", id), {
            onSuccess: () => {
                fetchMasterReg(url);
            },
            onError: (error) => {
                console.log(error);
            },
        });
    };

    return (
        <AppLayout>
            <Head title="Master Register" />
            <div className="max-w-full mx-auto">
                <div className="flex items-center gap-4">
                    <TableCellsIcon className="w-6 h-6 text-blue-600" />
                    <h1 className="text-lg font-bold text-blue-800">
                        บันทึก Master ROM แต่ละลูกค้า
                    </h1>
                </div>
                <div className="mt-2 space-y-2">
                    <p className="text-gray-500 font-medium text-sm">
                        หน้านี้สำหรับบันทึก Master ROM ของแต่ละลูกค้า
                    </p>
                    <div className="flex">
                        <button
                            className="px-4 py-2 bg-cyan-800 text-white rounded-md hover:bg-zinc-900 flex items-center cursor-pointer"
                            onClick={() => setIsOpenModal(true)}
                        >
                            <PlusIcon className="w-5 h-5 inline mr-2" />
                            เพิ่ม Master ROM
                        </button>
                    </div>
                </div>
            </div>
            <div className="max-w-full mt-5">
                {/* Toolbar */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ค้นหา Model Code"
                        className="w-full sm:w-72 rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />

                    <select
                        value={perPage}
                        onChange={(e) => setPerPage(Number(e.target.value))}
                        className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {[10, 25, 50, 100].map((n) => (
                            <option key={n} value={n}>
                                {n} / หน้า
                            </option>
                        ))}
                    </select>
                </div>

                {/* Table */}
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-gray-50">
                            <tr>
                                {[
                                    { key: "", label: "" },
                                    { key: "customer", label: "Customer" },
                                    { key: "model_code", label: "Model Code" },
                                    { key: "model_name", label: "Model Name" },
                                    { key: "prog_name", label: "Program Name" },
                                    { key: "process", label: "Process" },
                                    { key: "part_no", label: "Part No" },
                                    { key: "part_name", label: "Part Name" },
                                    { key: "position", label: "Position" },
                                    { key: "socket", label: "Socket" },
                                    { key: "sumv", label: "SUMV" },
                                    { key: "marking", label: "Marking" },
                                    { key: "remark", label: "Remark" },
                                    { key: "empno", label: "Emp No" },
                                    { key: "create_at", label: "Date Create" },
                                ].map((col) => (
                                    <th
                                        key={col.key}
                                        onClick={() => handleSort(col.key)}
                                        className="px-4 py-3 text-left font-medium text-gray-600 cursor-pointer select-none hover:bg-gray-100 min-w-40"
                                    >
                                        <span className="inline-flex items-center gap-1">
                                            {col.label}
                                            <span className="text-xs text-gray-400">
                                                {sortIcon(col.key)}
                                            </span>
                                        </span>
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="divide-y divide-gray-100 bg-white">
                            {loading && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-gray-400"
                                    >
                                        กำลังโหลดข้อมูล...
                                    </td>
                                </tr>
                            )}

                            {!loading && response?.data.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={7}
                                        className="px-4 py-6 text-center text-gray-400"
                                    >
                                        ไม่พบข้อมูล
                                    </td>
                                </tr>
                            )}

                            {!loading &&
                                response?.data.map((item: any) => (
                                    <tr
                                        key={item.MREC_ID}
                                        className={
                                            item.MREC_DELSTD == 1
                                                ? "bg-rose-200"
                                                : ""
                                        }
                                    >
                                        <td>
                                            <div className="flex justify-center items-center gap-3">
                                                <button
                                                    className="bg-amber-500 text-white p-3 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={
                                                        item.MREC_DELSTD == 1
                                                    }
                                                    onClick={() =>
                                                        handleEdit(item.MREC_ID)
                                                    }
                                                >
                                                    <PencilIcon className="w-5 h-5" />
                                                </button>
                                                <button
                                                    className="bg-red-500 text-white p-3 rounded cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                                                    disabled={
                                                        item.MREC_DELSTD == 1
                                                    }
                                                    onClick={() =>
                                                        handleDelete(
                                                            item.MREC_ID,
                                                        )
                                                    }
                                                >
                                                    <TrashIcon className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {item.MREC_CUS}
                                        </td>
                                        <td className="px-4 py-3 text-gray-800 font-medium">
                                            {item.MREC_MDLCD}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_MDLNM}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_PRGNM}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_PROCS}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_PARTNO}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_PARTNM}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_POSITION}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_SOCKET}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_SUMV}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_MARKING ? (
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        setPreviewImage(
                                                            storageUrl(
                                                                item.MREC_MARKING,
                                                            ) || "",
                                                        )
                                                    }
                                                    className="cursor-pointer"
                                                >
                                                    <img
                                                        src={
                                                            storageUrl(
                                                                item.MREC_MARKING,
                                                            ) || ""
                                                        }
                                                        alt="Dot IC"
                                                        className="h-15 w-15 object-cover rounded border border-slate-200 hover:opacity-80 hover:scale-105 transition"
                                                    />
                                                </button>
                                            ) : (
                                                <span className="text-slate-300 text-xs">
                                                    ไม่มีรูป
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600 min-w-[300px]">
                                            {item.MREC_REMARK}
                                        </td>
                                        <td className="px-4 py-3 text-gray-600">
                                            {item.MREC_CREATEBY}
                                        </td>
                                        <td className="px-4 py-3 text-gray-500">
                                            {new Date(
                                                item.MREC_CREATEAT,
                                            ).toLocaleDateString("th-TH")}
                                        </td>
                                    </tr>
                                ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer: summary + pagination */}
                {response && (
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
                        <p className="text-sm text-gray-500">
                            แสดง {response.from ?? 0}–{response.to ?? 0}{" "}
                            จากทั้งหมด {response.total} รายการ
                        </p>

                        <Pagination
                            links={response.links}
                            onNavigate={(nextUrl) => {
                                setUrl(nextUrl);
                                fetchMasterReg(nextUrl);
                            }}
                        />
                    </div>
                )}
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
                                className="h-10 w-10"
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
                            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                            width={500}
                        />
                    </div>
                </div>
            )}

            <Modal
                open={isOpenModal}
                onClose={() => {
                    setIsOpenModal(false);
                    reset();
                    clearErrors();
                }}
                size="full"
                title="แบบฟอร์มบันทึก Master ROM"
            >
                <form
                    className="space-y-4"
                    onSubmit={handleSubmit as FormEventHandler<HTMLFormElement>}
                >
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                        <input type="hidden" value={data.empno} />
                        <div className="flex flex-col gap-2">
                            <label htmlFor="customer">Customer :</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.customer}
                                onChange={(e) =>
                                    handleChange(e.target.value || null)
                                }
                            >
                                <option value="" disabled selected>
                                    เลือก customer
                                </option>
                                {customer.map((item: string) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            {errors.customer && (
                                <p className="text-red-500 text-sm">
                                    {errors.customer}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="modelname">Model Name :</label>
                            <SearchableSelect
                                options={modelName.map((item: any) => ({
                                    id: item,
                                    label: item,
                                }))}
                                value={data.modelname}
                                onChange={(val) => setData("modelname", val)}
                            />
                            {errors.modelname && (
                                <p className="text-red-500 text-sm">
                                    {errors.modelname}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="modelcode">Model Code :</label>
                            <SearchableSelect
                                options={modelCode.map((item: any) => ({
                                    id: item,
                                    label: item,
                                }))}
                                value={data.modelcode}
                                onChange={(val) => setData("modelcode", val)}
                            />
                            {errors.modelcode && (
                                <p className="text-red-500 text-sm">
                                    {errors.modelcode}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="process">Process :</label>
                            <select
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.process}
                                onChange={(e) =>
                                    setData("process", e.target.value)
                                }
                            >
                                <option value="" disabled selected>
                                    เลือก process
                                </option>
                                {process.map((item: any) => (
                                    <option key={item} value={item}>
                                        {item}
                                    </option>
                                ))}
                            </select>
                            {errors.process && (
                                <p className="text-red-500 text-sm">
                                    {errors.process}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="prog_name">Program Name :</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.prog_name}
                                onChange={(e) =>
                                    setData("prog_name", e.target.value)
                                }
                                placeholder="กรอก Program name..."
                            />
                            {errors.prog_name && (
                                <p className="text-red-500 text-sm">
                                    {errors.prog_name}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="part_no">Part No :</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.part_no}
                                onChange={(e) =>
                                    setData("part_no", e.target.value)
                                }
                                placeholder="กรุณากรอก part no"
                            />
                            {errors.part_no && (
                                <p className="text-red-500 text-sm">
                                    {errors.part_no}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="part_name">Part Name :</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.part_name}
                                onChange={(e) =>
                                    setData("part_name", e.target.value)
                                }
                                placeholder="กรุณากรอก part name"
                            />
                            {errors.part_name && (
                                <p className="text-red-500 text-sm">
                                    {errors.part_name}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="position">Position :</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.position}
                                onChange={(e) =>
                                    setData("position", e.target.value)
                                }
                                placeholder="กรุณากรอก position"
                            />
                            {errors.position && (
                                <p className="text-red-500 text-sm">
                                    {errors.position}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="sum">SUM Value:</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.sumv}
                                onChange={(e) =>
                                    setData("sumv", e.target.value)
                                }
                                placeholder="กรุณากรอกค่า SUM"
                            />
                            {errors.sumv && (
                                <p className="text-red-500 text-sm">
                                    {errors.sumv}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="machine">Machine :</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.machine}
                                onChange={(e) =>
                                    setData("machine", e.target.value)
                                }
                                placeholder="กรุณากรอก machine"
                            />
                            {errors.machine && (
                                <p className="text-red-500 text-sm">
                                    {errors.machine}
                                </p>
                            )}
                        </div>
                        <div className="flex flex-col gap-2">
                            <label htmlFor="socket">Adapter / Socket :</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.socket}
                                onChange={(e) =>
                                    setData("socket", e.target.value)
                                }
                                placeholder="กรุณากรอก Adapter / Socket"
                            />
                            {errors.socket && (
                                <p className="text-red-500 text-sm">
                                    {errors.socket}
                                </p>
                            )}
                        </div>

                        <div className="flex flex-col gap-2">
                            <label htmlFor="remark">Remark :</label>
                            <input
                                type="text"
                                className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 px-4 py-2.5"
                                value={data.remark}
                                onChange={(e) =>
                                    setData("remark", e.target.value)
                                }
                                placeholder="กรุณากรอกค่า Remark"
                            />
                            {errors.remark && (
                                <p className="text-red-500 text-sm">
                                    {errors.sumv}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* input image */}
                    <div className="grid grid-cols-2 gap-2">
                        <div className="flex flex-col gap-2">
                            {/* ปุ่มเลือกไฟล์ปกติ — แสดงทุกอุปกรณ์ */}
                            <label className="flex flex-1 items-center gap-1.5 cursor-pointer text-sm text-slate-500 hover:text-slate-700 rounded-md border border-dashed border-slate-300 px-4 py-1.5 hover:border-slate-400 transition min-w-0">
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    onChange={(e) => handleFileChange(e)}
                                />
                                <FolderIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                <span className="truncate">
                                    {data.marking
                                        ? data.marking.name
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
                                    onChange={(e) => handleFileChange(e)}
                                />
                                <CameraIcon className="h-4 w-4" />
                            </label>

                            {errors.marking && (
                                <div className="text-red-500 text-[11px] mt-0.5">
                                    {errors.marking}
                                </div>
                            )}
                        </div>
                        <div className="flex justify-center items-center">
                            {data.marking ? (
                                <img
                                    src={URL.createObjectURL(data.marking)}
                                    alt="Preview"
                                    className="w-full max-w-sm rounded-md border border-dashed border-slate-300"
                                />
                            ) : existingMarkingUrl ? (
                                <img
                                    src={storageUrl(existingMarkingUrl) || ""}
                                    alt="Current"
                                    className="w-full max-w-sm rounded-md border border-dashed border-slate-300"
                                />
                            ) : null}
                        </div>
                    </div>
                    {/* button submit */}
                    <div className="mt-5">
                        <div className="flex justify-center items-center gap-2 ">
                            {editId ? (
                                <button
                                    type="submit"
                                    className="w-1/4 rounded-md border border-slate-300 bg-slate-800 px-4 py-3 text-white hover:bg-slate-700 transition flex items-center gap-2 justify-center"
                                >
                                    <PencilIcon className="h-5 w-5" />
                                    แก้ไข
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    className="w-1/4 rounded-md border border-slate-300 bg-slate-800 px-4 py-3 text-white hover:bg-slate-700 transition flex items-center gap-2 justify-center"
                                >
                                    <PlusIcon className="h-5 w-5" />
                                    บันทึก
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </Modal>
        </AppLayout>
    );
}
