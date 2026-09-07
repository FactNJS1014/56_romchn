import React, { FormEventHandler } from "react";
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
    ArrowDownCircleIcon,
    CameraIcon,
    FolderIcon,
} from "@heroicons/react/24/outline";
import Modal from "@/components/UI/Modal";
import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/lib/axios";
import { useForm } from "@inertiajs/react";
import { RomOperatorTypesInterface } from "@/types/RomOperatorTypesInterface";
import dayjs, { nowDate, nowTime } from "@/lib/dayjs";
import SearchableSelect from "@/components/SearchableSelect";
import { useUserSession } from "@/hooks/use-user-session";
import { ModelRecFormInterface } from "@/types/ModelRec";
import imageCompression from "browser-image-compression";
import { useScanInput } from "@/hooks/use-scan-input";
import { parseScan } from "@/lib/barcode-parser";
import { useDeviceType } from "@/hooks/use-device-type";
import QrScannerModal from "@/components/QrScannerModal";
import axios from "axios";

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

const headTable = [
    { key: "0", name: "" },
    { key: "1", name: "Customer" },
    { key: "2", name: "Model Name" },
    { key: "3", name: "Model Code" },
    { key: "4", name: "Process" },
    { key: "5", name: "Part No" },
];
function FormModel() {
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [masterData, setMasterData] = useState([]);
    const [customerData, setCustomerData] = useState([]);
    const [wonData, setWonData] = useState([]);
    const [workOrders, setWorkOrders] = useState([]);
    const [loadingWorkOrders, setLoadingWorkOrders] = useState(false);
    const [existingMarkingUrl, setExistingMarkingUrl] = useState<string | null>(
        null,
    );
    const [rawScan, setRawScan] = useState("");

    const storageUrl = (path: string | null) =>
        path ? `/56_romchn/storage/${path}` : null;

    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const { empno } = useUserSession();
    const partnoInputRef = useRef<HTMLInputElement>(null);
    const detectedDevice = useDeviceType();

    /** ให้ user สลับเองได้ เผื่อ auto-detect พลาด */
    const [scanMode, setScanMode] = useState<"auto" | "keyboard" | "camera">(
        "auto",
    );
    const effectiveMode =
        scanMode === "auto"
            ? detectedDevice === "tablet" || detectedDevice === "mobile"
                ? "camera"
                : "keyboard"
            : scanMode;

    const [isCameraOpen, setIsCameraOpen] = useState(false);

    const expectedRef = useRef({
        partno: "",
    });

    type ScanResult = { ok: boolean; text: string } | null;

    const [scanMsg, setScanMsg] = useState<{
        partno: ScanResult;
    }>({
        partno: null,
    });

    const norm = (v?: string | null) =>
        (v ?? "").replace(/[\s\r\n\t]/g, "").toUpperCase();

    const partnoScan = useScanInput({
        minLength: 10,
        endTimeoutMs: 300,
        transform: (raw) => parseScan(raw)?.partno ?? null,

        onInvalidFormat: (raw) => {
            setData("verify_fs", false);
            setScanMsg((s) => ({
                ...s,
                partno: {
                    ok: false,
                    text: `รูปแบบบาร์โค้ดไม่ถูกต้อง: ${raw.slice(0, 30)}...`,
                },
            }));
            partnoInputRef.current?.select();
        },

        onScan: (partno, raw) => {
            setData("partno", partno);
            setRawScan(raw);

            const expected = expectedRef.current.partno;
            if (!expected) {
                setData("verify_fs", false);
                setScanMsg((s) => ({
                    ...s,
                    partno: {
                        ok: false,
                        text: "กรุณาเลือก Master ROM ก่อนสแกน",
                    },
                }));
                partnoInputRef.current?.select();
                return;
            }

            const matched = norm(partno) === norm(expected);
            setData("verify_fs", matched);
            setScanMsg((s) => ({
                ...s,
                partno: matched
                    ? { ok: true, text: "Part No ตรงกับ Master ✓" }
                    : { ok: false, text: `ไม่ตรงกับ Master (${expected})` },
            }));

            if (!matched) partnoInputRef.current?.select();
        },
    });

    /**
     * State For Model Change ROM
     */
    const {
        data,
        setData,
        reset,
        post,
        errors,
        processing,
        clearErrors,
        progress,
    } = useForm<ModelRecFormInterface>({
        emp_id: empno,
        date: nowDate(),
        line: "",
        customer: "",
        won: "",
        model_name: "",
        model_code: "",
        lots: 0,
        prog_name: "",
        process: "",
        position: "",
        machine: "",
        socket: "",
        remark: "",
        partno: "",
        verify_fs: false,
        partname: "",
        verify_sn: "",
        sumval: "",
        verify_td: null,
        marking: null,
        pic_verify: null,
        qty: 0,
        mrec_id: "",
    });

    /**
     *  function fetch Data Master ROM
     */
    const fetchDataMasterROM = async () => {
        try {
            const res = await axiosInstance.get(route("api.master-reg-all"));
            setMasterData(res.data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        fetchDataMasterROM();
    }, []);

    /**
     * fetch api.customer and api.model
     */
    const fetchCustomer = async () => {
        try {
            const res = await axiosInstance.get(route("api.cus"));
            setCustomerData(res.data);
        } catch (error) {
            console.log(error);
        }
    };
    useEffect(() => {
        fetchCustomer();
    }, []);

    /**
     *  handle submit
     */
    const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        post(route("api.add-operator"), {
            onSuccess: () => {
                reset();
            },
            onError: (errors) => {
                console.log(errors);
            },
        });
    };

    /**
     *
     */
    const handleCustomerChange = async (cus: string | null) => {
        console.log(cus);
        setData("customer", cus);

        if (cus) {
            try {
                const res = await axiosInstance.get(
                    route("api.find-work-order", cus),
                );
                const list_won = res.data.map((item: any) => item.WON.trim());
                console.log(list_won);
                setWonData(list_won);
            } catch (error) {
                console.log(error);
            }
        }
    };

    const handleWonChange = async (won: string) => {
        console.log(won);
        setData("won", won);
        if (won) {
            try {
                const res = await axiosInstance.get(
                    route("api.find-model-by-won", won),
                );
                res.data.map((item: any) => {
                    const modelname = item.MDLNM.trim();
                    const modelcode = item.MDLCD.trim();
                    const lots = Number(item.WONQT.trim());

                    setData("model_name", modelname);
                    setData("model_code", modelcode);
                    setData("lots", lots);
                });
            } catch (error) {
                console.log(error);
            }
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

            setData("pic_verify", renamedFile);
        } catch (error) {
            console.error("Resize error:", error);
            // fallback: ถ้า resize ไม่สำเร็จ ใช้ไฟล์ต้นฉบับแทน
            const newName = generateDotIcFileName(file);
            const renamedFile = new File([file], newName, { type: file.type });
            setData("pic_verify", renamedFile);
        } finally {
            // เคลียร์ค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้ (เช่นถ่ายรูปใหม่ทับของเดิม)
            e.target.value = "";
        }
    };

    const handleFileChangeVerifyTD = async (
        e: React.ChangeEvent<HTMLInputElement>,
    ) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        try {
            // resize ก่อน (จำกัดความกว้าง/สูงสูงสุด ปรับตัวเลขได้ตามต้องการ)
            const compressedImage = await compressImage(file);

            const newName = generateDotIcFileName(file);
            const renamedFile = new File([compressedImage], newName, {
                type: compressedImage.type,
            });

            setData("verify_td", renamedFile);
        } catch (error) {
            console.error("Resize error:", error);
            // fallback: ถ้า resize ไม่สำเร็จ ใช้ไฟล์ต้นฉบับแทน
            const newName = generateDotIcFileName(file);
            const renamedFile = new File([file], newName, { type: file.type });
            setData("verify_td", renamedFile);
        } finally {
            // เคลียร์ค่า input เพื่อให้เลือกไฟล์เดิมซ้ำได้ (เช่นถ่ายรูปใหม่ทับของเดิม)
            e.target.value = "";
        }
    };
    /**
     * handle choose master
     */
    const handleSelectMaster = (master: any) => {
        setData("process", master.MREC_PROCS);
        setData("prog_name", master.MREC_PRGNM);
        setData("machine", master.MREC_MACHINE);
        setData("partno", master.MREC_PARTNO);
        setData("partname", master.MREC_PARTNM);
        setData("position", master.MREC_POSITION);
        setData("socket", master.MREC_SOCKET);
        setData("sumval", master.MREC_SUMV);
        setData("remark", master.MREC_REMARK);
        setData("marking", master.MREC_MARKING);
        setExistingMarkingUrl(master.MREC_MARKING);
        setData("mrec_id", master.MREC_ID);

        // ── ค่ามาตรฐานไว้เทียบกับ scanner ──
        expectedRef.current = {
            partno: (master.MREC_PARTNO ?? "").trim(),
        };
        // เคลียร์ช่องที่ต้องสแกน + ผลตรวจเดิม
        setData("partno", "");
        setData("verify_fs", false);
        setScanMsg((s) => ({ partno: null }));

        setIsOpenModal(false);
        setTimeout(() => partnoInputRef.current?.focus(), 100);
    };
    return (
        <div>
            <div className="max-w-full mx-auto">
                <div className="flex items-center gap-4">
                    <DocumentPlusIcon className="w-6 h-6 text-blue-600" />
                    <h1 className="text-lg font-bold text-blue-800">
                        บันทึกการเปลี่ยน Model ROM
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
                            เรียกข้อมูล Master ROM
                        </button>
                    </div>
                </div>
                <div className="flex flex-col lg:flex-row  lg:justify-between items-start lg:items-center">
                    <div className="mt-4 lg:mt-4 flex items-center gap-3">
                        <p className="text-lg lg:text-xl font-bold text-blue-700 border-l-4 border-blue-500 pl-3">
                            แบบฟอร์มบันทึก Model Change ROM
                        </p>
                        <div className="bg-linear-to-r from-blue-500 to-blue-600 text-white rounded-lg p-2">
                            <span className="text-2xl">📄</span>
                        </div>
                    </div>
                    {/* <div className="relative mt-4 lg:mt-0">
                        <button className="text-white text-lg font-bold bg-cyan-600 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2 cursor-pointer">
                            <BookOpenIcon className="w-5 h-5" />
                            รายการบันทึก Model ROM
                        </button>
                        <div className="absolute w-8 h-8 text-white rounded-full flex items-center justify-center -top-3 -right-2 bg-rose-500 shadow-lg">
                            0
                        </div>
                    </div> */}
                </div>

                <div className="p-5 mt-5 bg-white shadow-lg rounded-lg border border-blue-200">
                    <form
                        onSubmit={
                            handleSubmit as FormEventHandler<HTMLFormElement>
                        }
                    >
                        <fieldset className="relative border border-slate-300 rounded-lg px-5 pt-3 pb-5">
                            <legend className="px-2 text-md font-medium text-slate-700">
                                ข้อมูลที่ต้องกรอกเอง
                            </legend>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                <div className="flex flex-col">
                                    <label htmlFor="emp_id">รหัสพนักงาน</label>
                                    <input
                                        type="text"
                                        className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                        placeholder="Employee Code..."
                                        value={data.emp_id}
                                        onChange={(e) =>
                                            setData("emp_id", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="date">วันที่</label>
                                    <input
                                        type="date"
                                        value={data.date}
                                        className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                        onChange={(e) =>
                                            setData("date", e.target.value)
                                        }
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="line">Line</label>
                                    <select
                                        name="line"
                                        id="line"
                                        value={data.line}
                                        onChange={(e) =>
                                            setData("line", e.target.value)
                                        }
                                        className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                    >
                                        <option value="" disabled>
                                            Select Line
                                        </option>
                                        {lineData.map((item) => (
                                            <option
                                                key={item.value}
                                                value={item.value}
                                            >
                                                {item.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="customer">Customer</label>
                                    <select
                                        name="customer"
                                        id="customer"
                                        value={data.customer}
                                        onChange={(e) =>
                                            handleCustomerChange(e.target.value)
                                        }
                                        className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                    >
                                        <option value="" disabled>
                                            Select Customer
                                        </option>
                                        {customerData.map((item) => (
                                            <option key={item} value={item}>
                                                {item}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="won">WON</label>
                                    <SearchableSelect
                                        options={wonData.map((item: any) => ({
                                            id: item,
                                            label: item,
                                        }))}
                                        value={data.won}
                                        onChange={(val) => handleWonChange(val)}
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="model_name">
                                        Model Name
                                    </label>
                                    <input
                                        type="text"
                                        value={data.model_name}
                                        className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                        onChange={(e) =>
                                            setData(
                                                "model_name",
                                                e.target.value,
                                            )
                                        }
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="model_code">
                                        Model Code
                                    </label>
                                    <input
                                        type="text"
                                        value={data.model_code}
                                        className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                        onChange={(e) =>
                                            setData(
                                                "model_code",
                                                e.target.value,
                                            )
                                        }
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="lots">Lot Size</label>
                                    <input
                                        type="number"
                                        value={data.lots}
                                        className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                        onChange={(e) =>
                                            setData(
                                                "lots",
                                                Number(e.target.value),
                                            )
                                        }
                                        readOnly
                                    />
                                </div>
                                <div className="flex flex-col">
                                    <label htmlFor="qty">Qty</label>
                                    <input
                                        type="number"
                                        value={data.qty}
                                        className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                        onChange={(e) =>
                                            setData(
                                                "qty",
                                                Number(e.target.value),
                                            )
                                        }
                                    />
                                </div>
                            </div>
                        </fieldset>

                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
                            <input
                                type="hidden"
                                name="mrec_id"
                                value={data.mrec_id}
                            />
                            <div className="flex flex-col">
                                <label htmlFor="model_code">Process</label>
                                <select
                                    name="process"
                                    id="process"
                                    value={data.process}
                                    onChange={(e) =>
                                        setData("process", e.target.value)
                                    }
                                    className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${data.verify_fs === true ? "border-green-500" : "border-gray-200"}`}
                                >
                                    <option value="" disabled>
                                        Select Process
                                    </option>
                                    {processOptions?.map((item) => (
                                        <option
                                            key={item.value}
                                            value={item.value}
                                        >
                                            {item.label}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="program_name">
                                    Program Name
                                </label>
                                <input
                                    type="text"
                                    value={data.prog_name}
                                    className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${
                                        data.verify_fs === true
                                            ? "border-green-500"
                                            : "border-gray-200"
                                    }`}
                                    onChange={(e) =>
                                        setData("prog_name", e.target.value)
                                    }
                                    placeholder="Input Program Name"
                                />
                            </div>
                            <div>
                                <label htmlFor="position">Position</label>
                                <input
                                    type="text"
                                    value={data.position}
                                    className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${
                                        data.verify_fs === true
                                            ? "border-green-500"
                                            : "border-gray-200"
                                    }`}
                                    onChange={(e) =>
                                        setData("position", e.target.value)
                                    }
                                    placeholder="Input Position"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="machine">Machine</label>
                                <input
                                    type="text"
                                    value={data.machine}
                                    className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${
                                        data.verify_fs === true
                                            ? "border-green-500"
                                            : "border-gray-200"
                                    }`}
                                    onChange={(e) =>
                                        setData("machine", e.target.value)
                                    }
                                    placeholder="Input Machine"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="socket">Socket</label>
                                <input
                                    type="text"
                                    value={data.socket}
                                    className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${
                                        data.verify_fs === true
                                            ? "border-green-500"
                                            : "border-gray-200"
                                    }`}
                                    onChange={(e) =>
                                        setData("socket", e.target.value)
                                    }
                                    placeholder="Input Socket"
                                />
                            </div>
                            <div className="flex flex-col">
                                <label htmlFor="remark">Remark</label>
                                <input
                                    type="text"
                                    value={data.remark}
                                    className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${
                                        data.verify_fs === true
                                            ? "border-green-500"
                                            : "border-gray-200"
                                    }`}
                                    onChange={(e) =>
                                        setData("remark", e.target.value)
                                    }
                                    placeholder="Input Remark"
                                />
                            </div>

                            <div className="flex flex-col">
                                <div className="flex items-center justify-between">
                                    <label htmlFor="partno">Part No</label>
                                    <button
                                        type="button"
                                        onClick={() =>
                                            setScanMode((m) =>
                                                (m === "auto"
                                                    ? effectiveMode
                                                    : m) === "camera"
                                                    ? "keyboard"
                                                    : "camera",
                                            )
                                        }
                                        className="text-xs text-blue-500 hover:underline"
                                    >
                                        {effectiveMode === "camera"
                                            ? "สลับเป็นเครื่องยิง"
                                            : "สลับเป็นกล้อง"}
                                    </button>
                                </div>

                                {effectiveMode === "keyboard" ? (
                                    <input
                                        type="text"
                                        value={data.partno}
                                        ref={partnoInputRef}
                                        id="partno"
                                        autoComplete="off"
                                        spellCheck={false}
                                        onKeyDown={partnoScan.onKeyDown}
                                        onFocus={(e) =>
                                            e.currentTarget.select()
                                        }
                                        className={`px-4 py-2 w-full border rounded-lg focus:outline-none font-mono tracking-wider ${
                                            scanMsg.partno === null
                                                ? "border-gray-200"
                                                : scanMsg.partno.ok
                                                  ? "border-green-500 bg-green-50"
                                                  : "border-red-500 bg-red-50"
                                        }`}
                                        placeholder="ยิงบาร์โค้ด Part No"
                                        onChange={(e) => {
                                            const v = e.target.value;
                                            setData("partno", v);
                                            setData("verify_fs", false);
                                            setScanMsg((s) => ({
                                                ...s,
                                                partno: null,
                                            }));
                                            partnoScan.scheduleCommit(v);
                                        }}
                                    />
                                ) : (
                                    <>
                                        {/* แสดงค่าอ่านอย่างเดียว กันคีย์บอร์ดจอสัมผัสเด้งมาบัง */}
                                        <input
                                            type="text"
                                            value={data.partno}
                                            readOnly
                                            id="partno"
                                            placeholder="แตะปุ่มเพื่อสแกน"
                                            className={`px-4 py-2 w-full border rounded-lg font-mono tracking-wider bg-slate-50 ${
                                                scanMsg.partno === null
                                                    ? "border-gray-200"
                                                    : scanMsg.partno.ok
                                                      ? "border-green-500 bg-green-50"
                                                      : "border-red-500 bg-red-50"
                                            }`}
                                        />
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setScanMode(
                                                    effectiveMode === "camera"
                                                        ? "keyboard"
                                                        : "camera",
                                                )
                                            }
                                            className="text-xs text-blue-500 hover:underline"
                                        >
                                            {effectiveMode === "camera"
                                                ? "สลับเป็นเครื่องยิง"
                                                : "สลับเป็นกล้อง"}
                                        </button>
                                    </>
                                )}

                                {scanMsg.partno && (
                                    <span
                                        className={`mt-1 text-xs ${
                                            scanMsg.partno.ok
                                                ? "text-green-600"
                                                : "text-red-600"
                                        }`}
                                    >
                                        {scanMsg.partno.text}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center justify-center mt-5 gap-2">
                                <input
                                    id="verify_fs"
                                    name="verify_fs"
                                    type="checkbox"
                                    checked={data.verify_fs}
                                    onChange={(e) =>
                                        setData("verify_fs", e.target.checked)
                                    }
                                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                />

                                <label
                                    htmlFor="verify_fs"
                                    className="cursor-pointer"
                                >
                                    OK
                                </label>
                            </div>
                        </div>

                        <hr className="mt-5 mb-5" />

                        <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col col-span-2">
                                <label htmlFor="partname">Part Name</label>
                                <input
                                    type="text"
                                    value={data.partname}
                                    className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${
                                        data.verify_sn === true
                                            ? "border-green-500"
                                            : "border-gray-200"
                                    }`}
                                    onChange={(e) =>
                                        setData("partname", e.target.value)
                                    }
                                    placeholder="Input Part Name"
                                />
                            </div>

                            <div className="flex items-center justify-center mt-5 gap-2">
                                <input
                                    id="verify_sn"
                                    name="verify_sn"
                                    type="checkbox"
                                    checked={data.verify_sn}
                                    onChange={(e) =>
                                        setData("verify_sn", e.target.checked)
                                    }
                                    className="h-5 w-5 rounded border-gray-300 text-green-600 focus:ring-green-500 cursor-pointer"
                                />

                                <label
                                    htmlFor="verify_sn"
                                    className="cursor-pointer"
                                >
                                    OK
                                </label>
                            </div>
                        </div>
                        <hr className="mt-5 mb-5" />

                        <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col col-span-2">
                                <label htmlFor="sumval">Sum Value </label>
                                <input
                                    type="text"
                                    value={data.sumval}
                                    className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${
                                        data.verify_td === true
                                            ? "border-green-500"
                                            : "border-gray-200"
                                    }`}
                                    onChange={(e) =>
                                        setData("sumval", e.target.value)
                                    }
                                    placeholder="Input Sum Value"
                                />
                            </div>

                            <div className="flex flex-col col-span-2">
                                {/* ปุ่มเลือกไฟล์ปกติ — แสดงทุกอุปกรณ์ */}
                                <label className="flex flex-1 items-center gap-1.5 cursor-pointer text-sm text-slate-500 hover:text-slate-700 rounded-md border border-dashed border-slate-300 px-4 py-1.5 hover:border-slate-400 transition min-w-0">
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        onChange={(e) =>
                                            handleFileChangeVerifyTD(e)
                                        }
                                    />
                                    <FolderIcon className="h-4 w-4 shrink-0 text-slate-400" />
                                    <span className="truncate">
                                        {data.verify_td
                                            ? data.verify_td.name
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
                                            handleFileChangeVerifyTD(e)
                                        }
                                    />
                                    <CameraIcon className="h-4 w-4" />
                                </label>
                                {data.verify_td && (
                                    <img
                                        src={URL.createObjectURL(
                                            data.verify_td,
                                        )}
                                        alt="Verify Sumval Picture"
                                        className="w-full h-auto rounded-lg shadow-sm mt-2"
                                    />
                                )}
                            </div>
                        </div>
                        <hr className="mt-5 mb-5" />
                        <div className="grid grid-cols-4 gap-2">
                            <div className="flex flex-col col-span-2">
                                {existingMarkingUrl && (
                                    <>
                                        <label htmlFor="existingMarkingUrl">
                                            Picture Master
                                        </label>
                                        <img
                                            src={
                                                storageUrl(
                                                    existingMarkingUrl,
                                                ) || ""
                                            }
                                            alt="Existing Marking"
                                            className="w-full h-auto rounded-lg shadow-sm"
                                        />
                                    </>
                                )}
                            </div>

                            <div className="flex flex-col col-span-2">
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
                                        {data.pic_verify
                                            ? data.pic_verify.name
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
                                {data.pic_verify && (
                                    <img
                                        src={URL.createObjectURL(
                                            data.pic_verify,
                                        )}
                                        alt="Pic Verify"
                                        className="w-full h-auto rounded-lg shadow-sm mt-2"
                                    />
                                )}
                            </div>
                        </div>

                        <div className="mt-6 flex justify-center">
                            <button
                                type="submit"
                                disabled={processing}
                                className="w-[50%] rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 px-6 py-3 text-white font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                            >
                                <PlusIcon className="h-4 w-4" />
                                บันทึก
                            </button>
                        </div>
                    </form>
                </div>
            </div>

            <Modal
                open={isOpenModal}
                onClose={() => {
                    setIsOpenModal(false);
                }}
                size="full"
                title="เรียกข้อมูล Master ROM"
            >
                <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm max-h-[600px] overflow-y-auto">
                    <table className="min-w-full divide-y divide-gray-200 text-sm">
                        <thead className="bg-blue-500">
                            <tr>
                                {headTable.map((h) => (
                                    <th
                                        key={h.key}
                                        className="px-6 py-3 text-left text-xs font-medium text-white uppercase tracking-wider"
                                    >
                                        {h.name}
                                    </th>
                                ))}
                            </tr>
                        </thead>

                        <tbody className="bg-white divide-y divide-gray-200">
                            {masterData.map((row: any) => (
                                <tr key={row.MREC_ID}>
                                    <td className="px-6 py-4">
                                        <button
                                            className="bg-blue-700 text-white p-2 rounded-lg hover:bg-blue-800 flex items-center gap-2 cursor-pointer"
                                            onClick={() =>
                                                handleSelectMaster(row)
                                            }
                                        >
                                            <ArrowDownCircleIcon className="w-6 h-6" />
                                            <span>เลือก</span>
                                        </button>
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.MREC_CUS}
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.MREC_MDLNM}
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.MREC_MDLCD}
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.MREC_PROCS}
                                    </td>
                                    <td className="px-6 py-4">
                                        {row.MREC_PARTNO}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Modal>
            <QrScannerModal
                open={isCameraOpen}
                title="สแกน Part No"
                onClose={() => setIsCameraOpen(false)}
                onDecoded={(text) => {
                    // ✅ ใช้ commit() ตัวเดียวกับที่ onKeyDown เรียก
                    partnoScan.commit(text);
                }}
            />
        </div>
    );
}

export default FormModel;
