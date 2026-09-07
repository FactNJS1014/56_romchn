import React, { FormEventHandler, useEffect, useState } from "react";
import { ModelRecFormInterface } from "@/types/ModelRec";
import { useForm } from "@inertiajs/react";
import dayjs, { nowDate } from "@/lib/dayjs";
import {
    CameraIcon,
    FolderIcon,
    PencilIcon,
    PlusIcon,
} from "@heroicons/react/24/outline";
import SearchableSelect from "@/components/SearchableSelect";
import axios from "axios";
import imageCompression from "browser-image-compression";

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

function FormEdit(props: any) {
    const { items, modalIsOpen, onSuccess } = props;
    console.log("modalIsOpen", modalIsOpen);

    const storageUrl = (path: string | null) =>
        path ? `/storage/${path}` : null;

    const [customerData, setCustomerData] = useState([]);
    const [wonData, setWonData] = useState([]);
    const [editID, setEditID] = useState("");
    const [existingMarkingUrl, setExistingMarkingUrl] = useState("");
    const [existingSumUrl, setExistingSumUrl] = useState("");

    const {
        data,
        setData,
        reset,
        post,
        put,
        errors,
        processing,
        clearErrors,
        progress,
    } = useForm<ModelRecFormInterface>({
        emp_id: "",
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
        verify_fs: "",
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
     * fetch api.customer and api.model
     */
    const fetchCustomer = async () => {
        try {
            const res = await axios.get(route("api.cus"));
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
    const handleEdit: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        put(
            route("api.update-operator", {
                id: editID,
            }),
            {
                preserveState: true, // ไม่ reset state ของ page
                preserveScroll: true, // ไม่เด้ง scroll
                onSuccess: () => {
                    reset();
                    onSuccess?.(); // ปิด modal ผ่าน parent
                    // location.reload();
                },
                onError: (errors) => {
                    console.log(errors);
                },
            },
        );
    };

    /**
     *
     */
    const handleCustomerChange = async (cus: string | null) => {
        console.log(cus);
        setData("customer", cus);

        if (cus) {
            try {
                const res = await axios.get(route("api.find-work-order", cus));
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
                const res = await axios.get(
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
    useEffect(() => {
        setData("emp_id", items.RHREC_RECBY);
        setData("date", nowDate());
        setData("line", items.RHREC_LINE);
        setData("customer", items.RHREC_CUS);
        setData("won", items.RHREC_WON);
        setData("model_name", items.RHREC_MDLNM);
        setData("model_code", items.RHREC_MDLCD);
        setData("lots", Number(items.RHREC_LOTS));
        setData("prog_name", items.RHREC_PRGNM);
        setData("process", items.RHREC_PROCS);
        setData("position", items.RHREC_POSITION);
        setData("machine", items.RHREC_MACHINE);
        setData("socket", items.RHREC_SOCKET);
        setData("remark", items.RHREC_REMARK);
        setData("partno", items.RHREC_PARTNO);
        setData("verify_fs", items.RHREC_FVERIFY);
        setData("partname", items.RHREC_PARTNM);
        setData("verify_sn", items.RHREC_SNVERIFY);
        setData("sumval", items.RHREC_SUMVAL);
        setData("verify_td", items.RHREC_SUMVERIFY);
        setData("marking", items.RHREC_MARKING);
        setData("pic_verify", items.RHREC_MARKVERIFY);
        setData("qty", Number(items.RHREC_QTY));
        setEditID(items.RHREC_ID);
        setExistingMarkingUrl(items.RHREC_MARKVERIFY);
        setExistingSumUrl(items.RHREC_SUMVERIFY);
        setData("mrec_id", items.MREC_ID);

        // ดึง wonData ตาม customer เดิมก่อน แล้วค่อย set won
        if (items.RHREC_CUS) {
            try {
                const res = axios.get(
                    route("api.find-work-order", items.RHREC_CUS),
                );
                res.then((response: any) => {
                    const list_won = response.data.map((item: any) =>
                        item.WON.trim(),
                    );
                    setWonData(list_won);
                });
            } catch (error) {
                console.log(error);
            }
        }
    }, []);

    return (
        <div className="p-5 mt-5 bg-white shadow-lg rounded-lg border border-blue-200">
            <form onSubmit={handleEdit as FormEventHandler<HTMLFormElement>}>
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
                                    <option key={item.value} value={item.value}>
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
                            <label htmlFor="model_name">Model Name</label>
                            <input
                                type="text"
                                value={data.model_name}
                                className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                onChange={(e) =>
                                    setData("model_name", e.target.value)
                                }
                                readOnly
                            />
                        </div>
                        <div className="flex flex-col">
                            <label htmlFor="model_code">Model Code</label>
                            <input
                                type="text"
                                value={data.model_code}
                                className="px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none "
                                onChange={(e) =>
                                    setData("model_code", e.target.value)
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
                                    setData("lots", Number(e.target.value))
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
                                    setData("qty", Number(e.target.value))
                                }
                            />
                        </div>
                    </div>
                </fieldset>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 mt-3">
                    <input type="hidden" name="mrec_id" value={data.mrec_id} />
                    <div className="flex flex-col">
                        <label htmlFor="model_code">Process</label>
                        <select
                            name="process"
                            id="process"
                            value={data.process}
                            onChange={(e) => setData("process", e.target.value)}
                            className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${data.verify_fs === true ? "border-green-500" : "border-gray-200"}`}
                        >
                            <option value="" disabled>
                                Select Process
                            </option>
                            {processOptions?.map((item) => (
                                <option key={item.value} value={item.value}>
                                    {item.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex flex-col">
                        <label htmlFor="program_name">Program Name</label>
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
                            onChange={(e) => setData("machine", e.target.value)}
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
                            onChange={(e) => setData("socket", e.target.value)}
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
                            onChange={(e) => setData("remark", e.target.value)}
                            placeholder="Input Remark"
                        />
                    </div>

                    <div className="flex flex-col">
                        <label htmlFor="partno">Part No</label>
                        <input
                            type="text"
                            value={data.partno}
                            className={`px-4 py-2 w-full border border-gray-200 rounded-lg focus:outline-none ${
                                data.verify_fs === true
                                    ? "border-green-500"
                                    : "border-gray-200"
                            }`}
                            onChange={(e) => setData("partno", e.target.value)}
                            placeholder="Input Part No"
                        />
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

                        <label htmlFor="verify_fs" className="cursor-pointer">
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

                        <label htmlFor="verify_sn" className="cursor-pointer">
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
                            onChange={(e) => setData("sumval", e.target.value)}
                            placeholder="Input Sum Value"
                        />
                        <div className="flex flex-col col-span-2 mt-2">
                            {existingSumUrl && (
                                <>
                                    <label htmlFor="existingSumUrl">
                                        Picture Sumval (รูปล่าสุดที่บันทึก)
                                    </label>
                                    <img
                                        src={storageUrl(existingSumUrl) || ""}
                                        alt="Existing Sumval"
                                        className="w-full h-auto rounded-lg shadow-sm"
                                    />
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col col-span-2">
                        {/* ปุ่มเลือกไฟล์ปกติ — แสดงทุกอุปกรณ์ */}
                        <label className="flex flex-1 items-center gap-1.5 cursor-pointer text-sm text-slate-500 hover:text-slate-700 rounded-md border border-dashed border-slate-300 px-4 py-1.5 hover:border-slate-400 transition min-w-0">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => handleFileChangeVerifyTD(e)}
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
                                onChange={(e) => handleFileChangeVerifyTD(e)}
                            />
                            <CameraIcon className="h-4 w-4" />
                        </label>
                        {data.verify_td instanceof File ? (
                            <img
                                src={URL.createObjectURL(data.verify_td)}
                                alt="Verify Sumval Picture"
                                className="mt-2 h-auto w-full rounded-lg shadow-sm"
                            />
                        ) : (
                            <div className="flex justify-center items-center">
                                <img
                                    src="storage/register-types/images/photo.png"
                                    alt="Verify Sumval Picture"
                                    className="mt-2 w-50 rounded-lg shadow-sm "
                                />
                            </div>
                        )}
                    </div>
                </div>
                <hr className="mt-5 mb-5" />
                <div className="grid grid-cols-4 gap-2">
                    <div className="flex flex-col col-span-2">
                        {existingMarkingUrl && (
                            <>
                                <label htmlFor="existingMarkingUrl">
                                    Picture DOT IC (รูปล่าสุดที่บันทึก)
                                </label>
                                <img
                                    src={storageUrl(existingMarkingUrl) || ""}
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
                        {data.pic_verify instanceof File ? (
                            <img
                                src={URL.createObjectURL(data.pic_verify)}
                                alt="Pic Verify"
                                className="w-full h-auto rounded-lg shadow-sm mt-2"
                            />
                        ) : (
                            <div className="flex justify-center items-center">
                                <img
                                    src="storage/register-types/images/photo.png"
                                    alt="Verify Sumval Picture"
                                    className="mt-2 w-50 rounded-lg shadow-sm "
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="mt-6 flex justify-center">
                    <button
                        type="submit"
                        disabled={processing}
                        className="w-[50%] rounded-lg bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-3 text-white font-medium shadow-md hover:from-blue-600 hover:to-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 cursor-pointer flex items-center justify-center gap-2"
                    >
                        <PencilIcon className="h-4 w-4" />
                        แก้ไขข้อมูล
                    </button>
                </div>
            </form>
        </div>
    );
}

export default FormEdit;
