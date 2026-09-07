import Modal from "@/components/UI/Modal";
import {
    CheckIcon,
    MagnifyingGlassCircleIcon,
    PencilIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect, useState } from "react";
import EditForm from "../UpdateForm/FormEdit";
import axiosInstance from "@/lib/axios";

function TableDataForm() {
    const [data, setData] = useState([]);
    const [isOpenModal, setIsOpenModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [itemData, setItemData] = useState([]);

    const [editDataItem, setEditDataItem] = useState([]);
    const [isEditModalForm, setIsEditModalForm] = useState(false);

    const storageUrl = (path: string | null) =>
        path ? `/56_romchn/storage/${path}` : null;

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const getData = async () => {
        try {
            const res = await fetch(route("api.Get-hrec-All"), {
                cache: "no-store",
            });
            const data = await res.json();
            setData(data);
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const handleView = (item: any) => {
        setIsOpenModal(true);
        setItemData(item);
    };

    const handleSendApp = async (item: any) => {
        console.log(item);
        const id = item.RHREC_ID;
        try {
            const res = await axiosInstance.post(route("api.send-to-app"), {
                id: id,
            });
            console.log(res.data);
            if (res) {
                setIsOpenModal(false);
                getData();
            }
        } catch (error) {
            console.log(error);
        }
    };

    const handleShowEditForm = (item: any) => {
        setIsEditModalForm(true);
        setEditDataItem(item);
    };

    return (
        <>
            <div className="overflow-x-auto rounded-lg border border-gray-200 shadow-sm max-h-[40rem] overflow-y-auto">
                <table className="min-w-full divide-y divide-gray-200 text-sm">
                    <thead className="bg-cyan-400">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-950 uppercase tracking-wider"></th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-950 uppercase tracking-wider">
                                บันทึกโดย
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-950 uppercase tracking-wider">
                                วันที่บันทึก
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-950 uppercase tracking-wider">
                                Customer
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-950 uppercase tracking-wider">
                                Work Order
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-950 uppercase tracking-wider">
                                Lot Size
                            </th>
                            <th className="px-4 py-3 text-left text-sm font-semibold text-gray-950 uppercase tracking-wider">
                                Qty
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((item: any) => (
                            <tr key={item.id}>
                                <td className="px-4 py-3">
                                    <button
                                        onClick={() => handleView(item)}
                                        className="bg-sky-600 text-white px-4 py-2 rounded-lg cursor-pointer"
                                    >
                                        <MagnifyingGlassCircleIcon className="w-7 h-7" />
                                    </button>
                                </td>
                                <td className="px-4 py-3">
                                    {item.RHREC_RECBY}
                                </td>
                                <td className="px-4 py-3">
                                    {item.RHREC_DATECT}
                                </td>
                                <td className="px-4 py-3">{item.RHREC_CUS}</td>
                                <td className="px-4 py-3">{item.RHREC_WON}</td>
                                <td className="px-4 py-3">{item.RHREC_LOTS}</td>
                                <td className="px-4 py-3">{item.RHREC_QTY}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <Modal
                open={isOpenModal}
                onClose={() => {
                    setIsOpenModal(false);
                }}
                size="full"
                title="ข้อมูลที่บันทึกทั้งหมดจากแบบฟอร์ม"
            >
                <fieldset className="relative border border-slate-300 rounded-lg px-5 pt-3 pb-5">
                    <legend className="px-2 text-md font-medium text-slate-700">
                        ข้อมูลที่กรอก
                    </legend>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                        <div className="flex items-center gap-2">
                            <label className="text-md">วันที่บันทึก:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_DATECT}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Employee:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_RECBY}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Customer:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_CUS}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Line:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_LINE}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Work Order:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_WON}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Model Code:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_MDLCD}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Model Name:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_MDLNM}
                            </p>
                        </div>

                        <div className="flex items-center gap-2">
                            <label className="text-md">Lot Size:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_LOTS}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Qty:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_QTY}
                            </p>
                        </div>
                    </div>
                </fieldset>
                <fieldset
                    className={`relative border mt-3 ${itemData.RHREC_FVERIFY == 1 ? "border-green-300 bg-green-200" : "border-slate-300"} rounded-lg px-5 pt-3 pb-5`}
                >
                    <legend
                        className={`px-2 text-md font-medium ${itemData.RHREC_FVERIFY == 1 ? "text-green-600 bg-white rounded-b-lg" : "text-slate-700"}`}
                    >
                        ข้อมูลที่รับจาก Master ส่วนที่ 1
                    </legend>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 p-3">
                        <div className="flex items-center gap-2">
                            <label className="text-md">Process:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_PROCS}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Program Name:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_PRGNM}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Position:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_POSITION}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Machine:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_MACHINE}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Socket:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_SOCKET}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Remark:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_REMARK}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Part No:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_PARTNO}
                            </p>
                        </div>
                    </div>
                </fieldset>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-2 mt-3">
                    <fieldset
                        className={`relative border mt-3 ${itemData.RHREC_SNVERIFY == 1 ? "border-green-300 bg-green-200" : "border-slate-300"} rounded-lg px-5 pt-3 pb-5`}
                    >
                        <legend
                            className={`px-2 text-md font-medium ${itemData.RHREC_SNVERIFY == 1 ? "text-green-600 bg-white rounded-b-lg" : "text-slate-700"}`}
                        >
                            ข้อมูลที่รับจาก Master ส่วนที่ 2
                        </legend>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Part Name:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_PARTNM}
                            </p>
                        </div>
                    </fieldset>

                    <fieldset
                        className={`relative border mt-3 ${itemData.RHREC_SUMVERIFY == 1 ? "border-green-300 bg-green-200" : "border-slate-300"} rounded-lg px-5 pt-3 pb-5`}
                    >
                        <legend
                            className={`px-2 text-md font-medium ${itemData.RHREC_SUMVERIFY == 1 ? "text-green-600 bg-white rounded-b-lg" : "text-slate-700"}`}
                        >
                            ข้อมูลที่รับจาก Master ส่วนที่ 3
                        </legend>
                        <div className="flex items-center gap-2">
                            <label className="text-md">Sum Value:</label>
                            <p className="font-semibold">
                                {itemData.RHREC_SUMVAL}
                            </p>
                        </div>
                        {itemData.RHREC_SUMVERIFY && (
                            <img
                                src={storageUrl(itemData.RHREC_SUMVERIFY) || ""}
                                alt="Existing Marking"
                                className="w-full h-auto rounded-lg shadow-sm mt-3"
                            />
                        )}
                    </fieldset>
                    <fieldset className="relative border border-green-300 rounded-lg px-5 pt-3 pb-5 mt-3 bg-green-200">
                        <legend className="px-2 text-md font-medium text-green-600 bg-white rounded-b-lg">
                            ข้อมูลที่รับจาก Master ส่วนที่ 4 (รูปภาพที่เทียบกับ
                            Master แล้ว:)
                        </legend>
                        <div className="flex items-center gap-2">
                            <img
                                src={
                                    storageUrl(itemData.RHREC_MARKVERIFY) || ""
                                }
                                alt="Existing Marking"
                                className="w-full h-auto rounded-lg shadow-sm"
                            />
                        </div>
                    </fieldset>
                </div>
                <div className="mt-6">
                    <div className="flex items-center justify-end gap-4">
                        <button
                            className="flex-1 md:flex-none px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            onClick={() => handleSendApp(itemData)}
                        >
                            <CheckIcon className="w-4 h-4" />
                            ส่งอนุมัติ
                        </button>
                        <button
                            className="flex-1 md:flex-none px-6 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold rounded-lg transition shadow-md flex items-center justify-center gap-2 cursor-pointer"
                            onClick={() => handleShowEditForm(itemData)}
                        >
                            <PencilIcon className="w-4 h-4" />
                            แก้ไขข้อมูล
                        </button>
                    </div>
                </div>
            </Modal>
            <Modal
                open={isEditModalForm}
                onClose={() => {
                    setIsEditModalForm(false);
                }}
                size="full"
                title="แบบฟอร์มแก้ไขข้อมูล"
            >
                <EditForm
                    items={editDataItem}
                    modalIsOpen={isEditModalForm}
                    onSuccess={() => {
                        setIsEditModalForm(false);
                        location.reload();
                    }}
                />
            </Modal>
        </>
    );
}

export default TableDataForm;
