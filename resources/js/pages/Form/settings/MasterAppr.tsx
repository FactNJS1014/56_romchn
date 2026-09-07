import AppLayout from "@/layouts/AppLayout";
import MultiSelect, {
    MultiSelectOption,
} from "./../../../components/UI/MultiSelect";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Head, router, useForm } from "@inertiajs/react";
import {
    DocumentPlusIcon,
    PaperAirplaneIcon,
    PencilIcon,
    TableCellsIcon,
} from "@heroicons/react/24/outline";

interface UsersListAppr {
    EmpID: string;
    FName: string;
    LName: string;
    FNameEng: string;
    LNameEng: string;
}

async function fetchDataUsersAM(): Promise<UsersListAppr[]> {
    const response = await fetch(route("api.user-master-appr-settings"));
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data.users_AM as UsersListAppr[];
}

async function fetchDataUsersQC(): Promise<UsersListAppr[]> {
    const response = await fetch(route("api.user-master-appr-settings"));
    if (!response.ok) {
        throw new Error("Failed to fetch data");
    }

    const data = await response.json();
    return data.users_QC as UsersListAppr[];
}

export default function MasterAppr() {
    const [options, setOptions] = useState<MultiSelectOption[]>([]);
    const [optionsLeader, setOptionsLeader] = useState<MultiSelectOption[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [optionsQC, setOptionsQC] = useState<MultiSelectOption[]>([]);

    const [dataAllUsers, setDataAllUsers] = useState([]);

    const [apprData, setApprData] = useState([]);
    const [editId, setEditId] = useState<string | null>(null);

    const parseEmpIds = (raw?: string): string[] =>
        raw
            ? raw
                  .split(",")
                  .map((id) => id.trim())
                  .filter(Boolean)
            : [];

    const { data, setData, post, put, processing, errors, reset } = useForm<{
        firstlevel: (string | number)[];
        secondlevel: (string | number)[];
        shift: string;
    }>({
        firstlevel: [],
        secondlevel: [],
        shift: "DAY",
    });

    const LoadApprovers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDataUsersAM();
            // console.log("Fetched data:", data); // Log the fetched data for debugging
            const formattedOptions: MultiSelectOption[] = data.map((user) => ({
                value: user.EmpID,
                label: `${user.FName} ${user.LName} (${user.EmpID})`,
            }));
            setOptions(formattedOptions);
        } catch (err) {
            setError("Failed to load approvers.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        LoadApprovers();
    }, [LoadApprovers]);

    const LoadApproversLeader = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDataUsersAM();
            // console.log("Fetched data:", data); // Log the fetched data for debugging
            const formattedOptions: MultiSelectOption[] = data.map((user) => ({
                value: user.EmpID,
                label: `${user.FName} ${user.LName} (${user.EmpID})`,
            }));
            setOptionsLeader(formattedOptions);
        } catch (err) {
            setError("Failed to load approvers.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        LoadApproversLeader();
    }, [LoadApproversLeader]);

    const LoadQCApprovers = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchDataUsersQC();
            const formattedOptions: MultiSelectOption[] = data.map((user) => ({
                value: user.EmpID,
                label: `${user.FName} ${user.LName} (${user.EmpID})`,
            }));
            setOptionsQC(formattedOptions);
        } catch (err) {
            setError("Failed to load QC approvers.");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        LoadQCApprovers();
    }, [LoadQCApprovers]);

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log("data", data);

        if (editId) {
            // alert("Editing is " + editId + ". Please save as new entry.");
            put(route("api.update-master-appr-settings", { id: editId }), {
                onSuccess: () => {
                    ApiApprSettings();
                    reset();
                    setEditId(null);
                },
            });
        } else {
            post(route("api.save-master-appr-settings"), {
                onSuccess: () => {
                    ApiApprSettings();
                    reset();
                },
            });
        }
    };

    const LoadUsersAll = () => {
        fetch(route("api.user-master-appr-settings"))
            .then((response) => response.json())
            .then((data) => {
                setDataAllUsers(data.users_all);
            })
            .catch((error) => {
                console.error("Error fetching all users:", error);
            });
    };

    useEffect(() => {
        LoadUsersAll();
    }, []);

    const ApiApprSettings = useCallback(() => {
        fetch(route("api.master-appr-settings"))
            .then((response) => response.json())
            .then((data) => {
                setApprData(data);
            })
            .catch((error) => {
                console.error("Error fetching approver settings:", error);
            });
    }, []);

    useEffect(() => {
        ApiApprSettings();
    }, [ApiApprSettings]);

    const handleEdit = (item: any) => {
        setEditId(item.ROMAPPR_HID);
        const empIds = parseEmpIds(item.ROMAPPR_HEMPID);

        setData("shift", item.ROMAPPR_HSHIFT);

        if (item.ROMAPPR_HLV == 1) {
            setData("firstlevel", empIds);
        } else if (item.ROMAPPR_HLV == 2) {
            setData("secondlevel", empIds);
        }

        // route update to edit the item
    };
    return (
        <AppLayout>
            <Head title="Settings Master Approve" />
            <div className="max-w-full mx-auto">
                <div className="space-y-2">
                    <div>
                        <div className="flex items-center gap-4">
                            <DocumentPlusIcon className="w-6 h-6 text-blue-600" />
                            <h1 className="text-lg font-bold text-blue-800">
                                Settings Master Approve
                            </h1>
                        </div>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 font-medium">
                            แต่ละ input สามารถเลือกได้หลายคนตามหัวข้อที่กำหนด
                        </p>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                                <div className="flex flex-col gap-4">
                                    <label htmlFor="First Level">
                                        ลำดับที่ 1 (AM Sub Leader / Leader)
                                    </label>
                                    <MultiSelect
                                        options={options}
                                        value={data.firstlevel}
                                        onChange={(value) =>
                                            setData("firstlevel", value)
                                        }
                                        placeholder="เลือกผู้อนุมัติลำดับที่ 1..."
                                        isLoading={loading}
                                    />
                                    {error && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {error}
                                        </p>
                                    )}
                                </div>

                                <div className="flex flex-col gap-4">
                                    <label htmlFor="First Level">
                                        ลำดับที่ 2 (QC)
                                    </label>
                                    <MultiSelect
                                        options={optionsQC}
                                        value={data.secondlevel}
                                        onChange={(value) =>
                                            setData("secondlevel", value)
                                        }
                                        placeholder="เลือกผู้อนุมัติลำดับที่ 2..."
                                        isLoading={loading}
                                    />
                                    {error && (
                                        <p className="text-red-500 text-sm mt-1">
                                            {error}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8 justify-end flex items-center">
                                <button
                                    type="submit"
                                    className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 cursor-pointer flex items-center gap-2"
                                >
                                    <PaperAirplaneIcon className="h-5 w-5" />
                                    {editId ? (
                                        <span className="text-sm font-semibold text-white">
                                            บันทึกการแก้ไข
                                        </span>
                                    ) : (
                                        <span className="text-sm font-semibold text-white">
                                            บันทึก
                                        </span>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
                <div className="mt-4">
                    <div className="space-y-2">
                        <div>
                            <div className="flex items-center gap-4">
                                <TableCellsIcon className="w-6 h-6 text-blue-600" />
                                <h1 className="text-lg font-bold text-blue-800">
                                    ตารางแสดงรายการผู้อนุมัติที่ตั้งค่าไว้
                                </h1>
                            </div>
                        </div>
                        <div>
                            <p className="text-sm text-gray-600 font-medium">
                                ตารางนี้จะแสดงรายการผู้อนุมัติที่ถูกตั้งค่าไว้ในระบบ
                                โดยสามารถตรวจสอบและแก้ไขได้ตามความต้องการ
                            </p>
                        </div>
                    </div>
                    <div className="mt-4">
                        <div className="bg-white shadow rounded-lg p-4 border border-gray-200">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider font-semibold">
                                            ลำดับ
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider font-semibold">
                                            ชื่อผู้อนุมัติ
                                        </th>
                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider font-semibold">
                                            ระดับผู้อนุมัติ
                                        </th>

                                        <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 uppercase tracking-wider font-semibold"></th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {apprData.map(
                                        (item: any, index: number) => (
                                            <tr key={index}>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {index + 1}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 max-w-xs truncate">
                                                    {item.ROMAPPR_HEMPID.split(
                                                        ",",
                                                    ).map(
                                                        (
                                                            empId: string,
                                                            empIndex: number,
                                                        ) => {
                                                            const user =
                                                                dataAllUsers.find(
                                                                    (
                                                                        user: any,
                                                                    ) =>
                                                                        user.EmpID ===
                                                                        empId.trim(),
                                                                );
                                                            if (user) {
                                                                return (
                                                                    <span
                                                                        key={
                                                                            empIndex
                                                                        }
                                                                        className="font-medium text-gray-900"
                                                                    >
                                                                        {
                                                                            user?.FName
                                                                        }{" "}
                                                                        {
                                                                            user?.LName
                                                                        }{" "}
                                                                        {empIndex <
                                                                        item.ROMAPPR_HEMPID.split(
                                                                            ",",
                                                                        )
                                                                            .length -
                                                                            1
                                                                            ? ", "
                                                                            : ""}
                                                                    </span>
                                                                );
                                                            }
                                                            return null;
                                                        },
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                                    {item.ROMAPPR_HLV == 1 ? (
                                                        <p className="font-medium text-blue-600">
                                                            Sub Leader
                                                        </p>
                                                    ) : item.ROMAPPR_HLV ==
                                                      2 ? (
                                                        <p className="font-medium text-green-600">
                                                            Leader
                                                        </p>
                                                    ) : item.ROMAPPR_HLV ==
                                                      3 ? (
                                                        <p className="font-medium text-yellow-600">
                                                            QC
                                                        </p>
                                                    ) : (
                                                        ""
                                                    )}
                                                </td>

                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <button
                                                        className="text-yellow-600 hover:text-yellow-900 font-semibold cursor-pointer"
                                                        onClick={() =>
                                                            handleEdit(item)
                                                        }
                                                    >
                                                        <PencilIcon className="h-5 w-5" />
                                                    </button>
                                                </td>
                                            </tr>
                                        ),
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
