import AppLayout from "@/layouts/AppLayout";
import {
    CircleStackIcon,
    InformationCircleIcon,
    TableCellsIcon,
    TrashIcon,
    ArrowLeftIcon,
    PencilIcon,
    CheckCircleIcon,
} from "@heroicons/react/24/outline";
import { Head, router } from "@inertiajs/react";
import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/UI/Modal";
import { useUserSession } from "@/hooks/use-user-session";

// Small reusable row for the label/value pairs inside the modal
function InfoRow({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex items-center justify-between gap-4 px-4 py-2.5 odd:bg-white even:bg-slate-50">
            <span className="text-sm font-semibold tracking-wide text-slate-500 uppercase">
                {label}
            </span>
            <span className="text-sm font-medium text-slate-800 text-right">
                {value ?? "-"}
            </span>
        </div>
    );
}

export default function AppPage() {
    const [alldata, setAlldata] = useState([]);
    const [appData, setAppData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);

    const [approvedByMe, setApprovedByMe] = useState<string[]>([]);

    const [regiId, setRegiId] = useState([]);
    const [appLV, setAppLV] = useState([]);
    const [appEmp, setAppEmp] = useState([]);

    const [isOpenModal, setIsOpenModal] = useState(false);
    const [infoByItem, setInfoByItem] = useState<any>(null);
    // แปลง flag ที่เป็น string "0"/"1" ให้เทียบง่าย
    const toNum = (v: any) => Number(v ?? 0);
    const notYetSent = infoByItem && toNum(infoByItem.ROMOPRT_GOAPPSTD) === 0;
    const { empno } = useUserSession();

    const fetchAllDataReAndOpr = useCallback(() => {
        fetch(route("api.all-data"))
            .then((res) => res.json())
            .then((data) => {
                setAlldata(data.all_data ?? []);
                setAppData(data.app_data ?? []);
            })
            .catch((error) => {
                console.error("Error fetching all data:", error);
            });
    }, []);

    useEffect(() => {
        fetchAllDataReAndOpr();
    }, [fetchAllDataReAndOpr]);

    const approvalData = useCallback(async () => {
        const reg_id: any[] = [];
        const level: any[] = [];
        const empList: any[] = [];

        appData.forEach((item: any) => {
            const empId = item.ROMAPRH_EMPID.includes(",")
                ? item.ROMAPRH_EMPID.split(",")
                : [item.ROMAPRH_EMPID];

            const list_emp = empId.includes(String(empno));
            // console.log("List Emp: ", list_emp);

            if (list_emp) {
                reg_id.push(item.ROMREGI_ID);
                level.push(Number(item.ROMAPRH_SEQ));
            }

            empId.forEach((emp: string) => {
                if (!empList.includes(emp)) empList.push(emp);
            });
        });

        console.log("Reg ID:", reg_id);
        console.log("Level:", level);
        console.log("Emp List:", empList);

        setRegiId(reg_id);
        setAppLV(level);
        setAppEmp(empList);
    }, [appData, empno]);

    useEffect(() => {
        const load = async () => {
            await approvalData();
        };

        load();
    }, [approvalData]);

    const filterData = useCallback(async () => {
        const seen = new Set<string>();
        const filtered: any[] = [];

        alldata.forEach((item: any) => {
            const regiID = item.ROMREGI_ID;
            if (seen.has(regiID)) return;

            const itemLEV = Number(item.ROMREGI_LVL_APR);
            const goApp = Number(item.ROMOPRT_GOAPPSTD);
            const index = regiId.indexOf(regiID);
            console.log("Index: ", index);
            console.log("Item Lev: ", itemLEV);
            // console.log("Item GoApp: ", goApp);

            // 1. ส่งอนุมัติแล้ว และรอขั้นที่เราเป็นผู้อนุมัติ
            const isMyTurn =
                index !== -1 && goApp === 1 && itemLEV === Number(appLV[index]);

            // 2. ยังไม่ส่งอนุมัติ — แสดงเฉพาะคนที่ไม่ได้อยู่ในสายอนุมัติ
            const isDraft = goApp === 0 && itemLEV === 0;

            if (isMyTurn || isDraft) {
                seen.add(regiID);
                filtered.push(item);
            }
        });

        setFilteredData(filtered);
    }, [alldata, empno, regiId, appLV, appEmp]);

    useEffect(() => {
        const load = async () => {
            await filterData();
        };

        load();
    }, [filterData]);

    const currentLEV = appLV.length > 0 ? appLV[0] : 0;
    const handleOpenInfo = (data: any) => {
        setIsOpenModal(true);
        setInfoByItem(data);
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

    const handleCancel = (id: string) => {};

    const handleReject = (id: string) => {};

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
                            รายการข้อมูลอนุมัติ {currentLEV}
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
                            REGIS WO#
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-sky-50 uppercase">
                            OPRA WO#
                        </span>
                        <span className="text-xs font-semibold tracking-wider text-sky-50 uppercase text-right md:text-left">
                            Action
                        </span>
                    </div>

                    {filteredData.map((item: any) => (
                        <div
                            className="group bg-white border border-slate-200 rounded-xl px-5 sm:px-6 py-4
                                       shadow-sm hover:shadow-md hover:border-sky-300 transition-all duration-200
                                       grid grid-cols-3 gap-y-3 gap-x-4
                                       md:grid-cols-4 md:items-center md:gap-y-0"
                            key={item.ROMREGI_CUSTOMER}
                        >
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide md:hidden">
                                    Customer
                                </span>
                                <span className="text-sm text-slate-700 font-semibold">
                                    {item.ROMREGI_CUSTOMER}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide md:hidden">
                                    Register ID
                                </span>
                                <span className="text-sm font-semibold text-slate-800">
                                    {item.ROMREGI_WON}
                                </span>
                            </div>
                            <div className="flex flex-col gap-0.5">
                                <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wide md:hidden">
                                    Operator ROM ID
                                </span>
                                <span className="text-sm text-slate-700 font-semibold">
                                    {item.ROMOPRT_WON}
                                </span>
                            </div>

                            <div>
                                <button
                                    className="inline-flex items-center gap-2 bg-sky-600 text-white px-4 py-2
                                               rounded-lg text-sm font-medium cursor-pointer
                                               hover:bg-sky-700 active:bg-sky-800
                                               focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2
                                               transition-colors"
                                    onClick={() => handleOpenInfo(item)}
                                >
                                    <CircleStackIcon className="w-4 h-4" />
                                    ดูข้อมูล
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Detail modal */}
            <Modal
                open={isOpenModal}
                onClose={() => setIsOpenModal(false)}
                size="full"
                title="📋 รายการข้อมูลทั้งหมด"
            >
                <div className="w-full">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                        {/* Register ROM panel */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-blue-500 to-sky-500 rounded-lg shadow-sm">
                                    <InformationCircleIcon className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">
                                    รายการข้อมูล Register ROM
                                </h2>
                            </div>

                            {infoByItem && (
                                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    {/* Quick summary */}
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-3 bg-sky-50 border-b border-slate-200">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-sm font-semibold text-sky-700 uppercase">
                                                Customer:
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {infoByItem.ROMREGI_CUSTOMER}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-sm font-semibold text-sky-700 uppercase">
                                                Machine No:
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {infoByItem.ROMREGI_MACHINE_NO}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Detail list */}
                                    <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                                        <InfoRow
                                            label="Date"
                                            value={infoByItem.ROMREGI_DATE}
                                        />
                                        <InfoRow
                                            label="Time"
                                            value={infoByItem.ROMREGI_TIME}
                                        />
                                        <InfoRow
                                            label="Line"
                                            value={infoByItem.ROMREGI_LINE}
                                        />
                                        <InfoRow
                                            label="WO#"
                                            value={infoByItem.ROMREGI_WON}
                                        />
                                        <InfoRow
                                            label="Model"
                                            value={infoByItem.ROMREGI_MODEL}
                                        />
                                        <InfoRow
                                            label="Process"
                                            value={infoByItem.ROMREGI_PROCESS}
                                        />
                                        <InfoRow
                                            label="Lot size"
                                            value={infoByItem.ROMREGI_LOTS}
                                        />
                                        <InfoRow
                                            label="Part name"
                                            value={infoByItem.ROMREGI_PART_NAME}
                                        />
                                        <InfoRow
                                            label="Lot number"
                                            value={infoByItem.ROMREGI_LOT_NO}
                                        />
                                        <InfoRow
                                            label="Part no"
                                            value={infoByItem.ROMREGI_PART_NO}
                                        />
                                        <InfoRow
                                            label="Position"
                                            value={infoByItem.ROMREGI_POSITION}
                                        />
                                        <InfoRow
                                            label="ROM revision"
                                            value={infoByItem.ROMREGI_ROM_REV}
                                        />
                                        <InfoRow
                                            label="Maker"
                                            value={infoByItem.ROMREGI_MAKER}
                                        />
                                        <InfoRow
                                            label="Device no"
                                            value={infoByItem.ROMREGI_DEVICE_NO}
                                        />
                                        <InfoRow
                                            label="Socket no"
                                            value={infoByItem.ROMREGI_SOCKET_NO}
                                        />
                                        <InfoRow
                                            label="Program name"
                                            value={
                                                infoByItem.ROMREGI_PROGRAM_NAME
                                            }
                                        />
                                        <InfoRow
                                            label="Sum value"
                                            value={infoByItem.ROMREGI_SUM}
                                        />
                                        <InfoRow
                                            label="Dot IC"
                                            value={infoByItem.ROMREGI_DOT_IC}
                                        />
                                        <InfoRow
                                            label="Employee by record"
                                            value={infoByItem.ROMREGI_EMP_ID}
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Operator Input ROM panel */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-lg shadow-sm">
                                    <InformationCircleIcon className="w-5 h-5 text-white" />
                                </div>
                                <h2 className="text-sm font-semibold text-slate-800">
                                    รายการข้อมูล Operator Input ROM
                                </h2>
                            </div>

                            {infoByItem && (
                                <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
                                    <div className="flex flex-wrap gap-x-6 gap-y-1 px-4 py-3 bg-emerald-50 border-b border-slate-200">
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-sm font-semibold text-emerald-700 uppercase">
                                                Customer:
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {infoByItem.ROMREGI_CUSTOMER}
                                            </span>
                                        </div>
                                        <div className="flex items-baseline gap-1.5">
                                            <span className="text-sm font-semibold text-emerald-700 uppercase">
                                                Machine No:
                                            </span>
                                            <span className="text-sm font-medium text-slate-800">
                                                {infoByItem.ROMREGI_MACHINE_NO}
                                            </span>
                                        </div>
                                    </div>
                                    {/* Detail list */}
                                    <div className="divide-y divide-slate-100 max-h-[60vh] overflow-y-auto">
                                        <InfoRow
                                            label="Date"
                                            value={infoByItem.ROMOPRT_DATE}
                                        />
                                        <InfoRow
                                            label="Shift"
                                            value={infoByItem.ROMOPRT_SHIFT}
                                        />

                                        <InfoRow
                                            label="Line"
                                            value={infoByItem.ROMOPRT_LINE}
                                        />
                                        <InfoRow
                                            label="WO#"
                                            value={infoByItem.ROMOPRT_WON}
                                        />
                                        <InfoRow
                                            label="Model"
                                            value={infoByItem.ROMOPRT_MODEL}
                                        />
                                        <InfoRow
                                            label="Process"
                                            value={infoByItem.ROMOPRT_PROCS}
                                        />
                                        <InfoRow
                                            label="Lot size"
                                            value={infoByItem.ROMOPRT_LOTS}
                                        />

                                        <InfoRow
                                            label="Part Number"
                                            value={infoByItem.ROMOPRT_PARTNUM}
                                        />

                                        <InfoRow
                                            label="Program name"
                                            value={infoByItem.ROMOPRT_PROGNAME}
                                        />
                                        <InfoRow
                                            label="Sum value"
                                            value={infoByItem.ROMOPRT_SUMVAL}
                                        />
                                        <InfoRow
                                            label="Count by pass"
                                            value={infoByItem.ROMOPRT_CNTPASS}
                                        />
                                        <InfoRow
                                            label="count by fail"
                                            value={infoByItem.ROMOPRT_CNTFAIL}
                                        />
                                        <InfoRow
                                            label="count by total"
                                            value={infoByItem.ROMOPRT_CNTTOTAL}
                                        />

                                        <InfoRow
                                            label="Employee by record"
                                            value={infoByItem.ROMOPRT_EMPID}
                                        />
                                        <InfoRow
                                            label="comment"
                                            value={infoByItem.ROMOPRT_COMMENT}
                                        />
                                    </div>

                                    {/* Placeholder for when operator-specific fields are added */}
                                    {/* <div className="px-4 py-6 text-center text-sm text-slate-400">
                                        ยังไม่มีข้อมูล Operator Input ROM
                                        เพิ่มเติม
                                    </div> */}
                                </div>
                            )}
                        </div>
                    </div>
                    <hr className="mt-5 mb-5" />
                    <div className="flex items-center justify-between ">
                        <div className="flex items-center gap-4">
                            <button
                                className="flex items-center gap-2 bg-rose-500 text-rose-50 px-5 py-2 rounded-lg cursor-pointer"
                                onClick={() =>
                                    handleReject(infoByItem.ROMREGI_ID)
                                }
                            >
                                <ArrowLeftIcon className="w-5 h-5" />
                                ปฏิเสธ
                            </button>
                        </div>
                        <div className="flex items-center gap-4">
                            <div>
                                <button
                                    className="flex items-center gap-2 bg-red-500 text-red-50 px-5 py-2 rounded-lg cursor-pointer"
                                    onClick={() =>
                                        handleCancel(infoByItem.ROMREGI_ID)
                                    }
                                >
                                    <TrashIcon className="w-5 h-5" />
                                    ยกเลิกข้อมูล
                                </button>
                            </div>
                            <div>
                                {notYetSent ? (
                                    <button
                                        className="flex items-center gap-2 bg-green-500 text-green-50 px-5 py-2 rounded-lg cursor-pointer"
                                        onClick={() =>
                                            handleToApp(
                                                infoByItem.ROMREGI_ID,
                                                infoByItem.ROMOPRT_ID,
                                                infoByItem.ROMOPRT_SHIFT,
                                            )
                                        }
                                    >
                                        <CheckCircleIcon className="w-6 h-6" />
                                        ส่งให้อนุมัติ
                                    </button>
                                ) : (
                                    <button
                                        className="flex items-center gap-2 bg-emerald-600 text-white px-5 py-2 rounded-lg cursor-pointer hover:bg-emerald-700"
                                        onClick={() =>
                                            handleAppr(infoByItem.ROMREGI_ID)
                                        }
                                    >
                                        <CheckCircleIcon className="w-6 h-6" />
                                        อนุมัติ
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </AppLayout>
    );
}
