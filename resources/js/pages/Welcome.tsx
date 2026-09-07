import AppLayout from "@/layouts/AppLayout";
import { Head } from "@inertiajs/react";

export default function Welcome() {
    return (
        <AppLayout>
            <Head title="Welcome" />
            <div className="border rounded-lg p-4 border-gray-400 bg-gray-100">
                <div className="flex justify-center items-center">
                    <div className="flex items-center gap-2">
                        <div className="text-3xl">ℹ️</div>
                        <div className="text-lg font-semibold bg-blue-100 px-4 py-1 rounded-lg">
                            <p className="text-gray-800">
                                คุณได้เข้าสู่ระบบเปลี่ยนโมเดล ROM Writing
                            </p>
                        </div>
                    </div>
                </div>
                <div className="mt-4 space-y-2">
                    <div className="flex justify-start">
                        <p className="text-gray-50 bg-rose-500 px-2 py-1 rounded-lg">
                            กรณีที่ผู้ใช้งานติดปัญหาในการใช้งาน
                            หรือต้องการปรับปรุงระบบ
                        </p>
                    </div>

                    <div className="flex justify-start gap-2 items-center">
                        <p className="bg-rose-200 text-gray-800 px-2 py-1 rounded-lg text-sm font-semibold">
                            Step 1:
                        </p>
                        <p className="text-gray-900">
                            แจ้งหัวหน้างานของท่านได้รับทราบ
                        </p>
                    </div>
                    <div className="flex justify-start gap-2 items-center">
                        <p className="bg-rose-200 text-gray-800 px-2 py-1 rounded-lg text-sm font-semibold">
                            Step 2:
                        </p>
                        <p className="text-gray-900">
                            เมื่อแจ้งหัวหน้างานแล้ว ให้ติดต่อผู้ดูแลระบบ
                        </p>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex justify-start">
                        <p className="text-gray-50 bg-green-500 px-2 py-1 rounded-lg">
                            ข้อมูลการติดต่อผู้ดูแลระบบ
                        </p>
                    </div>

                    <div className="flex justify-start gap-2 items-center">
                        <p className="bg-green-200 text-gray-800 px-2 py-1 rounded-lg text-md font-semibold">
                            📞
                        </p>
                        <p className="text-gray-900">เบอร์ภายใน 415 หรือ 416</p>
                    </div>
                    <div className="flex justify-start gap-2 items-center">
                        <p className="bg-green-200 text-gray-800 px-2 py-1 rounded-lg text-md font-semibold">
                            📧
                        </p>
                        <p className="text-gray-900">
                            j-natdanai@alpine-asia.com
                            ,k-tossapon@alpine-asia.com
                            ,p-pakorn@alpine-asia.com
                        </p>
                    </div>
                </div>

                <div className="mt-4 space-y-2">
                    <div className="flex justify-start">
                        <p className="text-gray-50 bg-blue-500 px-2 py-1 rounded-lg">
                            File คู่มือการใช้งาน (มีทั้ง Document และ Video)
                        </p>
                    </div>
                    <div className="flex justify-start gap-2 items-center">
                        <p className="bg-blue-200 text-gray-800 px-2 py-1 rounded-lg text-md font-semibold">
                            📝
                        </p>
                        <p className="text-gray-900">Document</p>
                    </div>
                    <div className="flex justify-start gap-2 items-center">
                        <p className="bg-blue-200 text-gray-800 px-2 py-1 rounded-lg text-md font-semibold">
                            🎥
                        </p>
                        <p className="text-gray-900">Video</p>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
