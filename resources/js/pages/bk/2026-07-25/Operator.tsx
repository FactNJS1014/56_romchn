import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import {
    DocumentPlusIcon,
    BookOpenIcon,
    ArrowDownTrayIcon,
    PlusIcon,
    CircleStackIcon,
    PencilIcon,
    TrashIcon,
    XMarkIcon,
    CheckIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/UI/Modal";
import { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useForm } from "@inertiajs/react";
import { RomOperatorTypesInterface } from "@/types/RomOperatorTypesInterface";
import dayjs, { nowDate, nowTime } from "@/lib/dayjs";
import SearchableSelect from "@/components/SearchableSelect";
import { useUserSession } from "@/hooks/use-user-session";

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

export default function Operator() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [romRegisterData, setRomRegisterData] = useState<any[]>([]);
    const [workOrders, setWorkOrders] = useState<any[]>([]);
    const [loadingWorkOrders, setLoadingWorkOrders] = useState(true);
    const [loadingRomOpr, setLoadingRomOpr] = useState(true);
    const [romOprData, setRomOprData] = useState<any[]>([]);
    const [isOpenModalOpr, setIsOpenModalOpr] = useState(false);
    const [countROMOpr, setCountROMOpr] = useState(0);
    const [editId, setEditId] = useState<string>("");
    const [keyword, setKeyword] = useState("");
    const [countROMreg, setCountROMreg] = useState(0);

    const { empno, username } = useUserSession();

    const { data, setData, post, put, processing, errors, reset, transform } =
        useForm<RomOperatorTypesInterface>({
            date: nowDate(),
            shift:
                nowTime() > "19:59" && nowTime() <= "07:59" ? "Night" : "Day",
            line: "",
            model: "",
            won: "",
            lots: 0,
            part_number: "",
            program_name: "",
            process: "",
            ic_position: "",
            sum_value: "",
            c_pass: 0,
            c_fail: 0,
            c_total: 0,
            empid: "",
            remarks: "",
            romRegisterId: "",
        });

    const storageUrl = (path: string | null) =>
        path ? `/storage/${path}` : null;

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    // fetch data from api
    const Register_ROM_data = () => {
        axios.get(route("api.rom-register-show")).then((response) => {
            setRomRegisterData(response.data);
            setCountROMreg(response.data.length);
        });
    };
    useEffect(() => {
        Register_ROM_data();
    }, []);

    const fetchROMOperator = async (keyword = "") => {
        try {
            const response = await axios.get(route("api.rom-operator"), {
                params: {
                    search: keyword,
                },
            });

            setRomOprData(response.data);
            setCountROMOpr(response.data.length);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchROMOperator(keyword);
        }, 500); // รอ 500ms หลังหยุดพิมพ์

        return () => clearTimeout(timer);
    }, [keyword]);

    const searchWorkOrders = async (workOrder: string) => {
        setLoadingWorkOrders(true);
        fetch(
            route("api.api-won", {
                q: workOrder,
            }),
        )
            .then((res) => res.json())
            .then((json) => {
                const normalized = json.map((item: any) => {
                    // console.log(item);
                    return {
                        ...item,
                        WON: item.WON?.trim(),
                        MDLCD: item.MDLCD?.trim(),
                        WONQT: item.WONQT?.trim(),
                    };
                });
                // console.log(normalized);
                setWorkOrders(normalized);
            })
            .catch(() => setWorkOrders([]))
            .finally(() => setLoadingWorkOrders(false));
    };

    const handleWorkOrderChange = (wonValue: string) => {
        const matched = workOrders.find((item: any) => item.WON === wonValue);
        console.log(matched);

        setData((prev) => ({
            ...prev,
            won: wonValue,

            model: matched?.MDLCD ?? prev.model,
            lots: parseInt(matched?.WONQT) ?? prev.lots,
            // เติม field อื่นๆ ที่ API ส่งมาตามจริง เช่น
            // model: matched?.MODEL ?? prev.model,
        }));
    };

    const handleSelectRomRegister = (romRegisterId: string) => {
        // console.log(romRegisterId);
        // TODO: Implement select functionality
        const selectedRomRegister = romRegisterData.find(
            (item: any) => item.ROMREGI_ID === romRegisterId,
        );
        // console.log(selectedRomRegister);
        setData((prev) => ({
            ...prev,
            romRegisterId: selectedRomRegister?.ROMREGI_ID,
            part_number:
                selectedRomRegister?.ROMREGI_PART_NO ?? prev.part_number,
            program_name:
                selectedRomRegister?.ROMREGI_PROGRAM_NAME ?? prev.program_name,
            ic_position:
                selectedRomRegister?.ROMREGI_POSITION ?? prev.ic_position,
            sum_value: selectedRomRegister?.ROMREGI_SUM ?? prev.sum_value,
        }));
        setIsOpenModal(false);
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        // TODO: Implement submit functionality

        if (editId) {
            // TODO: Implement update functionality
            transform((data) => {
                return {
                    ...data,
                    _method: "PUT",
                };
            });

            post(
                route("rom-operator.update", {
                    id: editId,
                    remark: data.remarks,
                }),
                {
                    forceFormData: true,
                    onSuccess: () => {
                        setEditId("");
                        fetchROMOperator();
                        reset();
                    },
                    onError: (errors) => {
                        console.log(errors);
                    },
                },
            );
        } else {
            post(
                route("rom-operator.store", {
                    rom_register_id: data.romRegisterId,
                    remark: data.remarks,
                }),
                {
                    forceFormData: true,
                    onSuccess: () => {
                        // console.log(response);
                        Register_ROM_data();
                        fetchROMOperator();
                        reset();
                    },
                    onError: (errors) => {
                        console.log(errors);
                    },
                },
            );
        }
    };

    const handleEditOpr = (id: string) => {
        // TODO: Implement edit functionality
        const includeROMOprData = romOprData.find(
            (item: any) => item.ROMOPRT_ID === id,
        );

        setEditId(id);

        //show Data Edit
        setData((prev) => ({
            ...prev,
            date: includeROMOprData.ROMOPRT_DATE ?? prev.date,
            shift: includeROMOprData.ROMOPRT_SHIFT ?? prev.shift,
            line: includeROMOprData.ROMOPRT_LINE ?? prev.line,
            won: includeROMOprData.ROMOPRT_WON ?? prev.won,
            model: includeROMOprData.ROMOPRT_MODEL ?? prev.model,
            lots: includeROMOprData.ROMOPRT_LOTS ?? prev.lots,
            part_number: includeROMOprData.ROMOPRT_PARTNUM ?? prev.part_number,
            program_name:
                includeROMOprData.ROMOPRT_PROGNAME ?? prev.program_name,
            process: includeROMOprData.ROMOPRT_PROCS ?? prev.process,
            ic_position: includeROMOprData.ROMOPRT_POSITION ?? prev.ic_position,
            sum_value: includeROMOprData.ROMOPRT_SUMVAL ?? prev.sum_value,
            c_pass: includeROMOprData.ROMOPRT_CNTPASS ?? prev.c_pass,
            c_fail: includeROMOprData.ROMOPRT_CNTFAIL ?? prev.c_fail,
            c_total: includeROMOprData.ROMOPRT_CNTTOTAL ?? prev.c_total,
            remarks: includeROMOprData.ROMOPRT_COMMENT ?? prev.remarks,
            empid: includeROMOprData.ROMOPRT_EMPID ?? prev.empid,
        }));

        if (includeROMOprData.ROMOPRT_WON) {
            setLoadingWorkOrders(true);
            fetch(
                route("api.api-won", {
                    q: includeROMOprData.ROMOPRT_WON,
                }),
            )
                .then((res) => res.json())
                .then((json) => {
                    const normalized = json.map((item: any) => {
                        // console.log(item);
                        return {
                            ...item,
                            WON: item.WON?.trim(),
                            MDLCD: item.MDLCD?.trim(),
                            WONQT: item.WONQT?.trim(),
                        };
                    });
                    // console.log(normalized);
                    setWorkOrders(normalized);
                })
                .catch(() => setWorkOrders([]))
                .finally(() => setLoadingWorkOrders(false));
        }

        setIsOpenModalOpr(false);
    };

    const handleDelete = (id: string) => {
        put(route("rom-operator.destroy", id), {
            onSuccess: () => {
                fetchROMOperator();
            },
        });
    };

    const handleToNextStatus = (id: string) => {
        put(route("rom-operator.nextToStatus", id), {
            onSuccess: () => {
                fetchROMOperator();
                setIsOpenModalOpr(false);
            },
        });
    };
    return (
        <AppLayout>
            <Head title="Operator" />
            <div className="max-w-full mx-auto">
                <div className="flex items-center gap-4">
                    <DocumentPlusIcon className="w-6 h-6 text-blue-600" />
                    <h1 className="text-lg font-bold text-blue-800">
                        บันทึกการเขียนโปรแกรม ROM Writing
                    </h1>
                </div>
                <div className="mt-2 space-y-2">
                    <p className="text-gray-500 font-medium text-sm">
                        ปุ่มสำหรับเรียกข้อมูลจาก Register ROM Writing
                    </p>

                    <div className="relative mr-3">
                        <button
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center cursor-pointer"
                            onClick={() => setIsOpenModal(true)}
                        >
                            <BookOpenIcon className="w-5 h-5 inline mr-2" />
                            เรียกข้อมูล Register ROM Writing
                        </button>
                    </div>
                </div>

                <div className="flex justify-between items-center">
                    <div className="flex flex-col">
                        <div className="flex items-center gap-4 mt-6">
                            <DocumentPlusIcon className="w-6 h-6 text-sky-600" />
                            <h1 className="text-lg font-bold text-sky-800">
                                แบบฟอร์มบันทึกการเขียนโปรแกรม ROM Writing
                            </h1>
                        </div>
                        <p className="text-gray-500 font-medium text-sm mt-2">
                            ควรบันทึกหลังจากเรียกข้อมูลจาก Register ROM Writing
                            เสร็จแล้ว
                        </p>
                    </div>
                    <div className="relative mr-3">
                        <button
                            className="bg-sky-950 text-white px-5 py-2 cursor-pointer rounded flex items-center gap-2 "
                            onClick={() => setIsOpenModalOpr(true)}
                        >
                            <CircleStackIcon className="w-5 h-5" />
                            เปิดดูข้อมูลหลังบันทึก
                        </button>
                        <div
                            className={`absolute w-8 h-8 text-white rounded-full flex items-center justify-center -top-3 -right-2 ${countROMOpr == 0 ? "bg-green-500" : "bg-red-500"} `}
                        >
                            <p>{countROMOpr}</p>
                        </div>
                    </div>
                </div>

                <div className="mt-5 border border-slate-200 rounded-lg p-6 bg-slate-50">
                    <form className="space-y-4" onSubmit={handleSubmit}>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">
                                    วันที่:
                                </label>
                                <input
                                    type="date"
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    value={data.date}
                                    onChange={(e) => {
                                        setData("date", e.target.value);
                                    }}
                                />
                                {errors.date && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.date}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">
                                    Shift:
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    placeholder="Day or Night..."
                                    value={data.shift}
                                    onChange={(e) => {
                                        setData("shift", e.target.value);
                                    }}
                                />
                                {errors.shift && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.shift}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">
                                    Line:
                                </label>
                                <select
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    value={data.line}
                                    onChange={(e) => {
                                        setData("line", e.target.value);
                                    }}
                                >
                                    <option value="" selected disabled>
                                        Select Line
                                    </option>
                                    {lineData.map((line) => (
                                        <option
                                            key={line.value}
                                            value={line.value}
                                        >
                                            {line.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.line && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.line}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-3">
                                    Work Order:
                                </label>
                                <SearchableSelect
                                    options={workOrders.map((wo: any) => ({
                                        value: wo.WON,
                                        label: wo.WON,
                                    }))}
                                    value={data.won}
                                    onChange={(val) =>
                                        handleWorkOrderChange(val)
                                    }
                                    onSearchChange={searchWorkOrders}
                                    minSearchLength={4}
                                    searchPlaceholder="พิมพ์ 4 ตัวท้าย work order..."
                                />
                                {errors.won && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.won}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Model:
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    value={data.model}
                                    onChange={(e) => {
                                        setData("model", e.target.value);
                                    }}
                                    readOnly
                                />
                                {errors.model && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.model}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Lots:
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    value={data.lots}
                                    onChange={(e) => {
                                        setData(
                                            "lots",
                                            parseInt(e.target.value),
                                        );
                                    }}
                                    readOnly
                                />
                                {errors.lots && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.lots}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Part Number:
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    value={data.part_number}
                                    onChange={(e) => {
                                        setData("part_number", e.target.value);
                                    }}
                                />
                                {errors.part_number && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.part_number}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Program Name:
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    value={data.program_name}
                                    onChange={(e) => {
                                        setData("program_name", e.target.value);
                                    }}
                                />
                                {errors.program_name && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.program_name}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700 mb-1">
                                    Process:
                                </label>
                                <select
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    value={data.process}
                                    onChange={(e) => {
                                        setData("process", e.target.value);
                                    }}
                                >
                                    <option value="" selected disabled>
                                        Select Process
                                    </option>
                                    {processOptions.map((option) => (
                                        <option
                                            key={option.value}
                                            value={option.value}
                                        >
                                            {option.label}
                                        </option>
                                    ))}
                                </select>
                                {errors.process && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.process}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
                            <div className="flex gap-2">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        IC Position:
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                        value={data.ic_position}
                                        onChange={(e) => {
                                            setData(
                                                "ic_position",
                                                e.target.value,
                                            );
                                        }}
                                    />
                                    {errors.ic_position && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.ic_position}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Sum Value:
                                    </label>
                                    <input
                                        type="text"
                                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                        value={data.sum_value}
                                        onChange={(e) => {
                                            setData(
                                                "sum_value",
                                                e.target.value,
                                            );
                                        }}
                                    />
                                    {errors.sum_value && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.sum_value}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Count Pass:
                                    </label>
                                    <input
                                        type="number"
                                        className="mt-1 px-2 py-2 border border-gray-300 rounded-md focus:outline-none bg-white w-35"
                                        value={data.c_pass}
                                        onChange={(e) => {
                                            setData(
                                                "c_pass",
                                                parseInt(e.target.value),
                                            );
                                        }}
                                    />
                                    {errors.c_pass && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.c_pass}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Count Fail:
                                    </label>
                                    <input
                                        type="number"
                                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white
                                        w-35"
                                        value={data.c_fail}
                                        onChange={(e) => {
                                            setData(
                                                "c_fail",
                                                parseInt(e.target.value),
                                            );
                                        }}
                                    />
                                    {errors.c_fail && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.c_fail}
                                        </p>
                                    )}
                                </div>
                                <div className="flex flex-col">
                                    <label className="text-sm font-medium text-gray-700 mb-1">
                                        Count Total:
                                    </label>
                                    <input
                                        type="number"
                                        className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white w-35"
                                        value={data.c_total}
                                        onChange={(e) => {
                                            setData(
                                                "c_total",
                                                parseInt(e.target.value),
                                            );
                                        }}
                                    />
                                    {errors.c_total && (
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.c_total}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">
                                    Record By (EMP CODE):
                                </label>
                                <input
                                    type="text"
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    placeholder="EMP CODE..."
                                    value={empno || ""}
                                    onChange={(e) => {
                                        setData("empid", e.target.value);
                                    }}
                                    readOnly
                                />
                                <p className="text-gray-500 font-medium">
                                    {username}
                                </p>
                                {errors.empid && (
                                    <p className="text-red-500 text-xs mt-1">
                                        {errors.empid}
                                    </p>
                                )}
                            </div>
                            <div className="flex flex-col">
                                <label className="text-sm font-medium text-gray-700">
                                    Comment:
                                </label>
                                <textarea
                                    name="comment"
                                    id="comment"
                                    className="mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none bg-white"
                                    placeholder="Comment..."
                                    value={data.remarks}
                                    onChange={(e) => {
                                        setData("remarks", e.target.value);
                                    }}
                                />
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-start">
                            {editId ? (
                                <div className="flex items-center gap-3">
                                    <button className="flex items-center justify-center gap-2 bg-sky-600 text-white px-5 py-2 rounded-md w-50 hover:bg-sky-100 hover:text-sky-700 font-medium cursor-pointer">
                                        <PencilIcon className="w-5 h-5" />
                                        Update
                                    </button>
                                    <button
                                        className="flex items-center justify-center gap-2 bg-red-600 text-white px-5 py-2 rounded-md w-50 hover:bg-red-100 hover:text-red-700 font-medium cursor-pointer"
                                        onClick={() => {
                                            setEditId("");
                                            reset();
                                        }}
                                    >
                                        <XMarkIcon className="w-5 h-5" />
                                        Cancel
                                    </button>
                                </div>
                            ) : (
                                <button className="flex items-center justify-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-md w-50 hover:bg-blue-100 hover:text-blue-700 font-medium cursor-pointer">
                                    <PlusIcon className="w-5 h-5" />
                                    Save
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
            <Modal
                open={isOpenModal}
                onClose={() => setIsOpenModal(false)}
                size="full"
                title="📋 รายการ Register ROM Writing"
            >
                <div className="rounded-sm border border-slate-200 shadow-sm overflow-hidden bg-white mt-5">
                    <div className="relative max-h-[80vh] overflow-auto">
                        <table className="border-collapse text-md min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10 bg-slate-300 text-gray-900 dark:bg-slate-700 dark:text-white">
                                <tr>
                                    <th style={{ minWidth: "150px" }}>
                                        Action
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Record By
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Date
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Time
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Customer
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Machine No
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "100px" }}
                                    >
                                        Line
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Work Order
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "220px" }}
                                    >
                                        Model
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "160px" }}
                                    >
                                        Lots
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "200px" }}
                                    >
                                        Process
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Part name
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Lot No.
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Part No.
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Position
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "200px" }}
                                    >
                                        Maker
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "150px" }}
                                    >
                                        ROM Rev
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Device No.
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Socket No.
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Program Name
                                    </th>
                                    <th
                                        className="px-4 py-2 text-center"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Sum Value
                                    </th>
                                    <th
                                        className="px-4 py-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Dot IC (Image)
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {romRegisterData.map((item, index) => (
                                    <tr key={item.ROMREGI_ID}>
                                        <td className="px-2 py-2.5">
                                            <button
                                                className="px-4 py-2 bg-blue-500 text-white rounded flex items-center gap-2
                                            hover:bg-blue-600 transition-colors"
                                                onClick={() =>
                                                    handleSelectRomRegister(
                                                        item.ROMREGI_ID,
                                                    )
                                                }
                                            >
                                                <ArrowDownTrayIcon className="w-5 h-5" />
                                                เลือก
                                            </button>
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_EMP_ID}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_DATE}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_TIME}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_CUSTOMER}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_MACHINE_NO}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_LINE}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_WON}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_MODEL}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_LOTS}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_PROCESS}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_PART_NAME}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_LOT_NO}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_PART_NO}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_POSITION}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_MAKER}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_ROM_REV}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_DEVICE_NO}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_SOCKET_NO}
                                        </td>
                                        <td className="px-4 py-2 text-left">
                                            {item.ROMREGI_PROGRAM_NAME}
                                        </td>
                                        <td className="text-center">
                                            {item.ROMREGI_SUM}
                                        </td>
                                        <td className="px-4 py-2 text-left">
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
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>

            <Modal
                open={isOpenModalOpr}
                onClose={() => setIsOpenModalOpr(false)}
                size="full"
                title="📋 รายการ Operator Output ROM Writing"
            >
                <div className="rounded-sm border border-slate-200 shadow-sm overflow-hidden bg-white mt-5">
                    <div className="p-4 flex items-center justify-between">
                        <div>
                            <p className="font-semibold mb-2 text-slate-700 underline">
                                คำอธิบายปุ่มการใช้งาน
                            </p>
                            <div className="flex items-center gap-4 ">
                                <div className="flex items-center gap-2">
                                    <div className="bg-green-500 text-white rounded p-1">
                                        <CheckIcon className="w-5 h-5 " />
                                    </div>
                                    <span>: ยืนยันข้อมูล</span>
                                </div>
                                ,
                                <div className="flex items-center gap-2">
                                    <div className="bg-amber-500 text-white rounded p-1">
                                        <PencilIcon className="w-5 h-5" />
                                    </div>
                                    <span>: แก้ไขข้อมูล</span>
                                </div>
                                ,
                                <div className="flex items-center gap-2">
                                    <div className="bg-red-500 text-white rounded p-1">
                                        <TrashIcon className="w-5 h-5" />
                                    </div>
                                    <span>: ลบข้อมูล</span>
                                </div>
                            </div>
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
                    <div className="relative max-h-[50vh] overflow-auto">
                        <table className="border-collapse text-md min-w-full divide-y divide-gray-200">
                            <thead className="sticky top-0 z-10 bg-slate-300 text-gray-900 dark:bg-slate-700 dark:text-white">
                                <tr>
                                    <th
                                        style={{ minWidth: "300px" }}
                                        className="p-2"
                                    >
                                        Action
                                    </th>

                                    <th
                                        className="p-2 text-left"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Record By
                                    </th>
                                    <th
                                        className="text-left p-2"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Date
                                    </th>

                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "100px" }}
                                    >
                                        Line
                                    </th>
                                    <th
                                        className="text-left p-2"
                                        style={{ minWidth: "250px" }}
                                    >
                                        Work Order
                                    </th>
                                    <th
                                        className="text-left p-2"
                                        style={{ minWidth: "220px" }}
                                    >
                                        Model
                                    </th>
                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "100px" }}
                                    >
                                        Lots
                                    </th>
                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "200px" }}
                                    >
                                        Process
                                    </th>

                                    <th
                                        className="text-left p-2"
                                        style={{ minWidth: "210px" }}
                                    >
                                        Part No.
                                    </th>
                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Position
                                    </th>
                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Program Name
                                    </th>

                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "150px" }}
                                    >
                                        Sum Value
                                    </th>
                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "180px" }}
                                    >
                                        Count Pass
                                    </th>
                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "180px" }}
                                    >
                                        Count Fail
                                    </th>
                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "180px" }}
                                    >
                                        Count Total
                                    </th>
                                    <th
                                        className="text-center p-2"
                                        style={{ minWidth: "300px" }}
                                    >
                                        Comment
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {romOprData.map((val) => (
                                    <tr key={val.ROMOPRT_ID}>
                                        <td className="px-2 py-2.5 flex justify-center gap-4">
                                            <button
                                                className="bg-green-500 text-slate-50 px-5 py-3 rounded flex items-center gap-2 cursor-pointer"
                                                onClick={() =>
                                                    handleToNextStatus(
                                                        val.ROMOPRT_ID,
                                                    )
                                                }
                                            >
                                                <CheckIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="bg-amber-500 text-slate-50 px-5 py-3 rounded flex items-center gap-2 cursor-pointer"
                                                onClick={() =>
                                                    handleEditOpr(
                                                        val.ROMOPRT_ID,
                                                    )
                                                }
                                            >
                                                <PencilIcon className="w-5 h-5" />
                                            </button>
                                            <button
                                                className="bg-red-500 text-slate-50 px-5 py-3 rounded flex items-center gap-2 cursor-pointer"
                                                onClick={() =>
                                                    handleDelete(val.ROMOPRT_ID)
                                                }
                                            >
                                                <TrashIcon className="w-5 h-5" />
                                            </button>
                                        </td>
                                        <td className="px-2 py-2.5 ">
                                            {val.ROMOPRT_EMPID}
                                        </td>
                                        <td className="px-2 py-2.5 ">
                                            {val.ROMOPRT_DATE}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {val.ROMOPRT_LINE}
                                        </td>
                                        <td className="px-2 py-2.5 ">
                                            {val.ROMOPRT_WON}
                                        </td>
                                        <td className="px-2 py-2.5 ">
                                            {val.ROMOPRT_MODEL}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {val.ROMOPRT_LOTS}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {val.ROMOPRT_PROCS}
                                        </td>
                                        <td className="px-2 py-2.5 ">
                                            {val.ROMOPRT_PARTNUM}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {val.ROMOPRT_POSITION}
                                        </td>
                                        <td className="px-2 py-2.5 ">
                                            {val.ROMOPRT_PROGNAME}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {val.ROMOPRT_SUMVAL}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {val.ROMOPRT_CNTPASS}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {val.ROMOPRT_CNTFAIL}
                                        </td>
                                        <td className="px-2 py-2.5 text-center">
                                            {val.ROMOPRT_CNTTOTAL}
                                        </td>
                                        <td className="px-2 py-2.5 ">
                                            {val.ROMOPRT_COMMENT ? (
                                                <p className="font-medium text-slate-900">
                                                    {val.ROMOPRT_COMMENT}
                                                </p>
                                            ) : (
                                                <p className="text-slate-400 text-center">
                                                    -
                                                </p>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </Modal>
            {/* Show image after click image in table */}
            {previewImage && (
                <div
                    className="fixed inset-0 z-100 flex items-center justify-center bg-black/70 p-4"
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
