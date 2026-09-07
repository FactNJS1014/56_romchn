import AppLayout from "@/layouts/AppLayout";
import {
    CircleStackIcon,
    InformationCircleIcon,
    TableCellsIcon,
    TrashIcon,
    ArrowLeftIcon,
    PencilIcon,
    CheckCircleIcon,
    MagnifyingGlassIcon,
    XCircleIcon,
} from "@heroicons/react/24/outline";
import { Head, router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/UI/Modal";
import { useUserSession } from "@/hooks/use-user-session";
import { openInfoDocument } from "../document/Document";
import axiosInstance from "@/lib/axios";

export default function AppPage() {
    const [alldata, setAlldata] = useState([]);
    const [appData, setAppData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [approvalMap, setApprovalMap] = useState(new Map<string, number[]>());
    const [isDisabled, setIsDisabled] = useState(true);

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [infoByItem, setInfoByItem] = useState<any>(null);
    // แปลง flag ที่เป็น string "0"/"1" ให้เทียบง่าย
    const toNum = (v: any) => Number(v ?? 0);
    const notYetSent = infoByItem && toNum(infoByItem.ROMOPRT_GOAPPSTD) === 0;
    const { empno } = useUserSession();
    const [isOpenRejectModal, setIsOpenRejectModal] = useState(false);
    const [rejectReason, setRejectReason] = useState("");
    const [rejectItemId, setRejectItemId] = useState("");

    const storageUrl = (path: string | null) =>
        path ? `/storage/${path}` : null;

    /**
     * Fetch User Master Approval Settings
     */
    const fetchUser = async (empId: string) => {
        console.log("Emp ID: ", empId);
        try {
            const res = await axiosInstance.get(
                route("api.user-master-appr-settings"),
            );
            const data = res.data.users_all.filter(
                (item: any) => item.EmpID === empId,
            );
            console.log("Employee Data: ", data);
            return data;
        } catch (error) {
            console.error(error);
        }
    };

    const fetchAllDataReAndOpr = useCallback(() => {
        fetch(route("api.all-data"))
            .then((res) => res.json())
            .then((data) => {
                setAlldata(data.all_data ?? []);
                setAppData(data.app_data ?? []);
                console.log("All Data: ", data.all_data);
                console.log("App Data: ", data.app_data);
            })
            .catch((error) => {
                console.error("Error fetching all data:", error);
            });
    }, []);

    useEffect(() => {
        fetchAllDataReAndOpr();
    }, [fetchAllDataReAndOpr]);

    const approvalData = useCallback(async () => {
        const map = new Map<string, number[]>();

        appData.forEach((item: any) => {
            const empId = item.ROMAPRH_EMPID.includes(",")
                ? item.ROMAPRH_EMPID.split(",")
                : [item.ROMAPRH_EMPID];

            if (empId.includes(String(empno))) {
                const levels = map.get(item.RHREC_ID) ?? [];
                levels.push(Number(item.ROMAPRH_SEQ));
                map.set(item.RHREC_ID, levels);
            }
        });

        setApprovalMap(map);
    }, [appData, empno]);

    useEffect(() => {
        approvalData();
    }, [approvalData]);

    const filterData = useCallback(async () => {
        const filtered: any[] = [];

        alldata.forEach((item: any) => {
            const levels = approvalMap.get(item.RHREC_ID);
            // only show if the record's current pending level
            // is one this user is authorized to approve
            if (levels && levels.includes(Number(item.RHREC_LVAPP))) {
                filtered.push(item);
            }
        });

        console.log("Filtered Data: ", filtered);
        setFilteredData(filtered);
    }, [alldata, approvalMap]);

    useEffect(() => {
        filterData();
    }, [filterData]);

    const currentLEV =
        filteredData.length > 0 ? filteredData[0].RHREC_LVAPP : 0;

    const handleOpenInfo = async (data: any) => {
        const employee = await fetchUser(data.RHREC_RECBY);
        console.log("Employee: ", employee);
        openInfoDocument("ข้อมูลรายการอนุมัติ", [
            {
                label: "ผู้บันทึกข้อมูล",
                value:
                    employee.length > 0
                        ? employee[0].FNameEng + " " + employee[0].LNameEng
                        : "",
            },
            { label: "วันที่บันทึก", value: data.RHREC_DATECT },
            { label: "Line", value: data.RHREC_LINE },
            { label: "Customer", value: data.RHREC_CUS },
            { label: "Work Order", value: data.RHREC_WON },
            { label: "Model Code", value: data.RHREC_MDLCD },
            { label: "Model Name", value: data.RHREC_MDLNM },
            { label: "Lot Size", value: data.RHREC_LOTS },
            { label: "จำนวนที่เปลี่ยน", value: data.RHREC_QTY },
            { label: "Program name", value: data.RHREC_PRGNM },
            { label: "Process", value: data.RHREC_PROCS },
            { label: "Position", value: data.RHREC_POSITION },
            { label: "Machine", value: data.RHREC_MACHINE },
            { label: "Socket", value: data.RHREC_SOCKET },
            { label: "Remark", value: data.RHREC_REMARK },
            { label: "Part No", value: data.RHREC_PARTNO },
            { label: "Part Name", value: data.RHREC_PARTNM },
            {
                label: "Sum Value",
                value: storageUrl(data.RHREC_SUMVERIFY),
                imageSize: { width: "80mm", height: "80mm" },
            },
            {
                label: "Marking",
                value: storageUrl(data.RHREC_MARKVERIFY),
                imageSize: { width: "80mm", height: "80mm" },
            },
        ]);
    };

    const handleToApp = async (id: string, opId: string, shift: string) => {
        try {
            router.post(route("api.send-to-app"), {
                id,
                opId,
                shift,
            });

            setIsOpenModal(false);
            fetchAllDataReAndOpr();
        } catch (error) {
            console.error(error);
        }
    };

    const handleAppr = (id: string) => {
        const payload = {
            app_by: empno,
            app_lev: currentLEV,
            reg_id: id,
        };

        try {
            router.put(route("api.to-app"), payload);
            setIsOpenModal(false);
            fetchAllDataReAndOpr();
        } catch (error) {
            console.error(error);
        }
    };

    const handleOpenRejectModal = (id: string) => {
        setIsOpenRejectModal(true);
        setRejectItemId(id);
    };

    const handleReject = () => {
        const payload = {
            app_by: empno,
            app_lev: currentLEV,
            reg_id: rejectItemId,
            remark: rejectReason,
        };

        console.log("Reject Payload: ", payload);
    };

    return (
        <AppLayout>
            <Head title="Approve Page" />
            {/* Page header */}
            <div className="space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-sky-600 rounded-xl shadow-sm shadow-sky-200">
                        <TableCellsIcon className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h1 className="text-lg font-bold text-slate-800">
                            รายการข้อมูลอนุมัติ (
                            {currentLEV == 0 &&
                                "คุณไม่ได้อยู่ในสายอนุมัติหรือไม่มีข้อมูลให้อนุมัติ"}
                            {currentLEV == 1 &&
                                "คุณอยู่ในแผนก AM สามารถอนุมัติได้"}
                            {currentLEV == 2 &&
                                "คุณอยู่ในแผนก QC สามารถอนุมัติได้"}
                            )
                        </h1>
                        <p className="text-sm text-slate-500">
                            ข้อมูลอนุมัติมีทั้งของ Register ROM and Operator
                            Input ROM Writing
                        </p>
                    </div>
                </div>
            </div>

            {/* Data list */}
            <div className="mt-6">
                <div className="w-full space-y-2.5">
                    <div className="hidden md:grid grid-cols-4 bg-sky-600 text-white rounded-xl px-6 py-3.5 shadow-sm">
                        <span className="text-xs font-semibold tracking-wider text-sky-50 uppercase">
                            Customer
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-sky-50 uppercase">
                            Work Order
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-sky-50 uppercase">
                            Model Code
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-sky-50 uppercase">
                            Part No
                        </span>
                    </div>

                    {filteredData.length == 0 ? (
                        <div
                            className="bg-white border border-slate-200 rounded-xl px-5 sm:px-6 py-4
                                       shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200"
                        >
                            <div className="text-center text-slate-500 p-4">
                                <p className="text-lg font-medium font-family-mono">
                                    ไม่มีข้อมูล
                                </p>
                            </div>
                        </div>
                    ) : (
                        filteredData.map((item: any) => (
                            <div
                                className="bg-white border border-slate-200 rounded-xl px-5 sm:px-6 py-4
                                       shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200"
                            >
                                <div
                                    className="group 
                                       grid grid-cols-3 gap-y-3 gap-x-4
                                       md:grid-cols-4 md:items-center md:gap-y-0"
                                    key={item.RHREC_ID}
                                >
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide md:hidden">
                                            Customer
                                        </span>
                                        <span className="text-sm text-slate-700 font-semibold">
                                            {item.RHREC_CUS}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide md:hidden">
                                            Work Order
                                        </span>
                                        <span className="text-sm font-semibold text-slate-800">
                                            {item.RHREC_WON}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide md:hidden">
                                            Model Code
                                        </span>
                                        <span className="text-sm text-slate-700 font-semibold">
                                            {item.RHREC_MDLCD}
                                        </span>
                                    </div>
                                    <div className="flex flex-col gap-0.5">
                                        <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide md:hidden">
                                            Part No
                                        </span>
                                        <span className="text-sm text-slate-700 font-semibold">
                                            {item.RHREC_PARTNO}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between gap-2 mt-5">
                                    <div>
                                        <button
                                            className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2
                                               rounded-lg text-sm font-medium cursor-pointer
                                               hover:bg-sky-700 active:bg-sky-800
                                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2
                                               transition-colors"
                                            onClick={() => handleOpenInfo(item)}
                                        >
                                            <MagnifyingGlassIcon className="w-5 h-5" />
                                            ดูข้อมูล
                                        </button>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2
                                               rounded-lg text-sm font-medium cursor-pointer
                                               hover:bg-emerald-700 active:bg-emerald-800
                                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2
                                               transition-colors"
                                            onClick={() =>
                                                handleAppr(item.RHREC_ID)
                                            }
                                        >
                                            <CheckCircleIcon className="w-5 h-5" />
                                            อนุมัติ
                                        </button>
                                        <button
                                            className="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2
                                               rounded-lg text-sm font-medium cursor-pointer
                                               hover:bg-rose-700 active:bg-rose-800
                                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2
                                               transition-colors"
                                            onClick={() =>
                                                handleOpenRejectModal(
                                                    item.RHREC_ID,
                                                )
                                            }
                                            disabled={isDisabled}
                                        >
                                            <XCircleIcon className="w-5 h-5" />
                                            ไม่อนุมัติ
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
            <Modal
                open={isOpenRejectModal}
                onClose={() => setIsOpenRejectModal(false)}
                size="lg"
                title="Reject Modal : กรุณาระบุเหตุผลในการปฏิเสธ"
            >
                <textarea
                    className="block w-full max-w-lg border-gray-400 border p-4 mb-2 rounded-lg text-md focus:outline-none"
                    onChange={(e) => setRejectReason(e.target.value)}
                    placeholder="สาเหตุที่ปฏิเสธ"
                />
                <button
                    className="inline-flex items-center gap-2 bg-rose-600 text-white px-4 py-2
                                               rounded-lg text-sm font-medium cursor-pointer
                                               hover:bg-rose-700 active:bg-rose-800
                                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2
                                               transition-colors"
                    onClick={() => handleReject()}
                >
                    <XCircleIcon className="w-5 h-5" />
                    Reject
                </button>
            </Modal>
        </AppLayout>
    );
}
