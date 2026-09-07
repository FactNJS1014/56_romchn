import React, { useState, useEffect } from "react";
import axiosInstance from "@/lib/axios";
import DataTable, { useTableExport } from "react-data-table-component";
import dayjs from "dayjs";
import ExcelJS from "exceljs";

function TableData() {
    const [TotalRecord, setTotalRecord] = useState([]);
    const [perPage, setPerPage] = useState(5);
    const [userList, setUserList] = useState<any[]>([]);
    const [isExporting, setIsExporting] = useState(false);
    const [startDate, setStartDate] = useState<string>(""); // format: YYYY-MM-DD
    const [endDate, setEndDate] = useState<string>("");

    const storageUrl = (path: string | null) =>
        path ? `/56_romchn/storage/${path}` : null;

    const [previewImage, setPreviewImage] = useState<string | null>(null);

    const fetchData = async () => {
        try {
            const response = await axiosInstance.get("/api/total-record");
            // console.log(response.data);
            setTotalRecord(response.data);
        } catch (error) {
            console.error("Error fetching data:", error);
        }
    };
    const fetchUser = async () => {
        try {
            const res = await axiosInstance.get(
                route("api.user-master-appr-settings"),
            );
            setUserList(res.data.users_all);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUser();
        fetchData();
    }, []);

    const getUserName = (empIds: string | undefined) => {
        if (!empIds) return "-";
        const user = userList.find((u: any) => u.EmpID === empIds.trim());
        // console.log(user);
        return user ? user.FNameEng + " " + user.LNameEng : empIds.trim();
    };

    //Filter Data
    const filterData = () => {
        const map = new Map();

        TotalRecord.forEach((item: any) => {
            const id = item.RHREC_ID;
            const levels = item.ROMAPRH_SEQ;

            if (!map.has(id)) {
                map.set(id, {
                    ...item,
                    level: {},
                    raw: [],
                });
            }

            const items = map.get(id);
            const existing = items.level[levels];

            if (!existing) {
                items.level[levels] = {
                    levels,
                    empapp: item.ROMAPRH_EMPAPP,
                    stampdate: item.ROMAPRH_STAMPDATE,
                    data: item,
                };
            }

            items.raw.push(item);
        });
        return Array.from(map.values());
    };

    useEffect(() => {
        filterData();
        console.log(filterData());
    }, [TotalRecord]);

    //Generate Column
    const columns = [
        {
            name: "วันที่",
            selector: (row: any) => row.data?.RHREC_DATECT,
            sortable: true,
            filterable: true,
            filterType: "date",
            width: "150px",
        },
        {
            name: "เวลา",
            selector: (row: any) =>
                row.data?.RHREC_UPDATEAT === null
                    ? dayjs(row.data?.RHREC_CREATEAT).format("HH:mm:ss")
                    : dayjs(row.data?.RHREC_UPDATEAT).format("HH:mm:ss"),
            sortable: true,
            width: "150px",
        },
        {
            name: "ผู้บันทึก",
            selector: (row: any) => getUserName(row.data?.RHREC_RECBY) ?? "-",
            sortable: true,
            width: "250px",
        },
        {
            name: "LINE",
            selector: (row: any) => row.data?.RHREC_LINE,
            sortable: true,
            filterable: true,
            filterType: "text",
            width: "150px",
        },
        {
            name: "Customer",
            selector: (row: any) => row.data?.RHREC_CUS,
            sortable: true,
            filterable: true,
            filterType: "text",
            width: "150px",
        },
        {
            name: "WO#",
            selector: (row: any) => row.data?.RHREC_WON,
            sortable: true,
            width: "250px",
        },
        {
            name: "Model Code",
            selector: (row: any) => row.data?.RHREC_MDLCD,
            sortable: true,
            width: "250px",
        },
        {
            name: "Model Name",
            selector: (row: any) => row.data?.RHREC_MDLNM,
            sortable: true,
            width: "250px",
        },
        {
            name: "Lot Size",
            selector: (row: any) => row.data?.RHREC_LOTS,
            sortable: true,
        },
        {
            name: "Qty",
            selector: (row: any) => row.data?.RHREC_QTY,
            sortable: true,
        },
        {
            name: "Process",
            selector: (row: any) => row.data?.RHREC_PROCS,
            sortable: true,
        },

        {
            name: "Program Name",
            selector: (row: any) => row.data?.RHREC_PRGNM,
            sortable: true,
            width: "250px",
        },
        {
            name: "Machine",
            selector: (row: any) => row.data?.RHREC_MACHINE,
            sortable: true,
            width: "250px",
        },
        {
            name: "Socket",
            selector: (row: any) => row.data?.RHREC_SOCKET,
            sortable: true,
            width: "250px",
        },
        {
            name: "Remark",
            selector: (row: any) => row.data?.RHREC_REMARK,
            sortable: true,
            width: "250px",
        },
        {
            name: "Part No",
            selector: (row: any) => row.data?.RHREC_PARTNO,
            sortable: true,
            width: "250px",
        },
        {
            name: "Part Name",
            selector: (row: any) => row.data?.RHREC_PARTNM,
            sortable: true,
            width: "250px",
        },
        {
            name: "Sum Value",
            selector: (row: any) =>
                storageUrl(row.data?.RHREC_SUMVERIFY) ? (
                    <img
                        className="w-25"
                        src={storageUrl(row.data?.RHREC_SUMVERIFY) || "-"}
                        alt=""
                        onClick={() =>
                            setPreviewImage(
                                storageUrl(row.data?.RHREC_SUMVERIFY) || "-",
                            )
                        }
                        style={{ cursor: "pointer" }}
                    />
                ) : (
                    "-"
                ),
            sortable: true,
            width: "250px",
        },
        {
            name: "Dot IC",
            selector: (row: any) =>
                storageUrl(row.data?.RHREC_MARKVERIFY) ? (
                    <img
                        className="w-25"
                        src={storageUrl(row.data?.RHREC_MARKVERIFY) || "-"}
                        alt=""
                        style={{ cursor: "pointer" }}
                        onClick={() =>
                            setPreviewImage(
                                storageUrl(row.data?.RHREC_MARKVERIFY) || "-",
                            )
                        }
                    />
                ) : (
                    "-"
                ),
            sortable: true,
            width: "250px",
        },

        {
            name: "ผู้อนุมัติ Sup Lead/Leader",
            selector: (row: any) =>
                row.level1?.empapp !== null ? (
                    <p className="text-green-700 text-xs">
                        {getUserName(row.level1?.empapp)}
                    </p>
                ) : (
                    <p className="text-red-700 text-xs">รออนุมัติ</p>
                ),
            sortable: true,
            width: "250px",
        },
        {
            name: "วันที่/เวลาอนุมัติ",
            selector: (row: any) =>
                row.level1?.empapp !== null ? (
                    <p className="text-green-700 text-xs">
                        {dayjs(row.level1?.stampdate).format(
                            "YYYY-MM-DD HH:mm:ss",
                        )}
                    </p>
                ) : (
                    <p className="text-red-700 text-xs">-</p>
                ),
            sortable: true,
            width: "250px",
        },
        {
            name: "ผู้อนุมัติ QC",
            selector: (row: any) =>
                row.level2?.empapp !== null ? (
                    <p className="text-green-700 text-xs">
                        {getUserName(row.level2?.empapp)}
                    </p>
                ) : (
                    <p className="text-red-700 text-xs">รออนุมัติ</p>
                ),
            sortable: true,
            width: "250px",
        },
        {
            name: "วันที่/เวลาอนุมัติ",
            selector: (row: any) =>
                row.level2?.empapp !== null ? (
                    <p className="text-green-700 text-xs">
                        {dayjs(row.level2?.stampdate).format(
                            "YYYY-MM-DD HH:mm:ss",
                        )}
                    </p>
                ) : (
                    <p className="text-red-700 text-xs">-</p>
                ),
            sortable: true,
            width: "250px",
        },
    ];

    const data = filterData().map((item: any) => {
        return {
            RHREC_ID: item.RHREC_ID,
            ROMAPRH_SEQ: item.ROMAPRH_SEQ,
            level: item.level,
            data: item,
            level1: item.level[1],
            level2: item.level[2],
        };
    });
    const customStyles = {
        headCells: {
            style: {
                fontSize: "14px",
                fontWeight: 600,
                backgroundColor: "#48cae4",
                color: "black",
                width: "max-content",
            },
        },
    };

    // const conditionRow = [
    //     {
    //         when: (row: any) => row.data?.RHREC_LVAPP > 2,
    //         style: {
    //             backgroundColor: "#b9fbc0",
    //         },
    //     },
    //     {
    //         when: (row: any) =>
    //             row.data?.RHREC_LVAPP <= 2 && row.data?.RHREC_LVAPP > 0,
    //         style: {
    //             backgroundColor: "#ffccd5",
    //         },
    //     },
    // ];

    // แปลงความกว้าง column (หน่วยตัวอักษร Excel) เป็น pixel โดยประมาณ
    const columnWidthToPx = (charWidth: number) =>
        Math.round(charWidth * 7 + 5);

    // แปลง pixel เป็น point สำหรับ row height (96 dpi -> 72 point)
    const pxToPoint = (px: number) => px * 0.75;

    // โหลดรูปแล้วคืนทั้ง buffer และขนาดจริงของรูป
    const loadImageWithDimensions = (
        url: string,
    ): Promise<{
        buffer: ArrayBuffer;
        width: number;
        height: number;
        ext: "png" | "jpeg";
    }> => {
        return new Promise(async (resolve, reject) => {
            try {
                const res = await fetch(url);
                const buffer = await res.arrayBuffer();
                const blob = new Blob([buffer]);
                const objectUrl = URL.createObjectURL(blob);

                const img = new Image();
                img.onload = () => {
                    const extension = url.split(".").pop()?.toLowerCase();
                    resolve({
                        buffer,
                        width: img.naturalWidth,
                        height: img.naturalHeight,
                        ext:
                            extension === "jpg" || extension === "jpeg"
                                ? "jpeg"
                                : "png",
                    });
                    URL.revokeObjectURL(objectUrl);
                };
                img.onerror = reject;
                img.src = objectUrl;
            } catch (e) {
                reject(e);
            }
        });
    };

    // เพิ่มรูปโดยให้ "ความกว้าง = ความกว้าง cell" แล้วคำนวณความสูงตามสัดส่วนจริง
    // คืนค่าความสูง (px) ของรูปที่วางไปแล้ว เพื่อเอาไปเทียบหาความสูงแถวสูงสุด
    const addImageToCell = async (
        workbook: ExcelJS.Workbook,
        sheet: ExcelJS.Worksheet,
        url: string,
        rowIndex: number, // 1-based
        colIndex: number, // 0-based
        columnWidthChars: number,
        padding = 2, // เว้นขอบซ้าย-ขวาเล็กน้อย (px)
    ): Promise<number> => {
        try {
            const { buffer, width, height, ext } =
                await loadImageWithDimensions(url);

            const cellWidthPx = columnWidthToPx(columnWidthChars);
            const targetWidthPx = cellWidthPx - padding * 2;
            const scale = targetWidthPx / width;
            const targetHeightPx = height * scale;

            const imageId = workbook.addImage({ buffer, extension: ext });

            sheet.addImage(imageId, {
                tl: {
                    col: colIndex + padding / cellWidthPx,
                    row: rowIndex - 1 + 0.05,
                },
                ext: { width: targetWidthPx, height: targetHeightPx },
                editAs: "oneCell",
            });

            return targetHeightPx;
        } catch (e) {
            console.error("โหลดรูปไม่สำเร็จ:", url, e);
            return 0;
        }
    };

    // // ฟังก์ชันช่วยโหลดรูปแล้วฝังลง cell
    // const addImageToCell = async (
    //     workbook: ExcelJS.Workbook,
    //     sheet: ExcelJS.Worksheet,
    //     url: string,
    //     rowIndex: number, // 1-based (แถวจริงใน sheet)
    //     colIndex: number, // 0-based
    //     padding = 0.08, // ระยะขอบรูปห่างจากขอบ cell (8% ของขนาด cell แต่ละด้าน)
    // ) => {
    //     try {
    //         const res = await fetch(url);
    //         const buffer = await res.arrayBuffer();
    //         const ext = url.split(".").pop()?.toLowerCase();
    //         const imageId = workbook.addImage({
    //             buffer,
    //             extension: ext === "jpg" || ext === "jpeg" ? "jpeg" : "png",
    //         });

    //         sheet.addImage(imageId, {
    //             // มุมบนซ้ายของ cell (บวก padding เข้าไปเล็กน้อย)
    //             tl: { col: colIndex + padding, row: rowIndex - 1 + padding },
    //             // มุมล่างขวาของ cell (ลบ padding ออกเล็กน้อย)
    //             br: { col: colIndex + 1 - padding, row: rowIndex - padding },
    //             editAs: "oneCell", // รูปเลื่อนตาม cell เวลาแทรก/ลบแถว แต่ไม่ถูกยืดถ้ามีคน resize column ทีหลัง
    //         });
    //     } catch (e) {
    //         console.error("โหลดรูปไม่สำเร็จ:", url, e);
    //     }
    // };

    const exportToExcel = async (exportData: any[]) => {
        const workbook = new ExcelJS.Workbook();
        const sheet = workbook.addWorksheet("Summary Record");

        sheet.columns = [
            { header: "วันที่", key: "date", width: 15 },
            { header: "เวลา", key: "time", width: 15 },
            { header: "ผู้บันทึก", key: "recBy", width: 25 },
            { header: "LINE", key: "line", width: 12 },
            { header: "Customer", key: "cus", width: 15 },
            { header: "WO#", key: "won", width: 20 },
            { header: "Model Code", key: "mdlCd", width: 20 },
            { header: "Model Name", key: "mdlNm", width: 20 },
            { header: "Lot Size", key: "lots", width: 12 },
            { header: "Qty", key: "qty", width: 10 },
            { header: "Process", key: "procs", width: 15 },
            { header: "Program Name", key: "prgNm", width: 20 },
            { header: "Machine", key: "machine", width: 20 },
            { header: "Socket", key: "socket", width: 20 },
            { header: "Remark", key: "remark", width: 20 },
            { header: "Part No", key: "partNo", width: 20 },
            { header: "Part Name", key: "partNm", width: 20 },
            { header: "Sum Value", key: "sumValue", width: 12 },
            { header: "Dot IC", key: "dotIc", width: 12 },
            { header: "ผู้อนุมัติ Sup Lead/Leader", key: "appr1", width: 25 },
            {
                header: "วันที่/เวลาอนุมัติ Sup Lead/Leader",
                key: "appr1Time",
                width: 25,
            },
            { header: "ผู้อนุมัติ QC", key: "appr2", width: 20 },
            { header: "วันที่/เวลาอนุมัติ QC", key: "appr2Time", width: 25 },
        ];

        const headerRow = sheet.getRow(1);
        headerRow.font = { bold: true, color: { argb: "FFFFFFFF" } };
        headerRow.fill = {
            type: "pattern",
            pattern: "solid",
            fgColor: { argb: "FF00509D" },
        };
        headerRow.alignment = { vertical: "middle", horizontal: "center" };

        const SUM_VALUE_COL = 17;
        const DOT_IC_COL = 18;
        const SUM_VALUE_WIDTH_CHARS = 14; // ต้องตรงกับ width ที่ตั้งใน sheet.columns
        const DOT_IC_WIDTH_CHARS = 14;

        for (let i = 0; i < exportData.length; i++) {
            const item = exportData[i];

            const row = sheet.addRow({
                date: dayjs(item.data?.RHREC_DATECT).format("DD/MM/YYYY"),
                time:
                    item.data?.RHREC_UPDATEAT === null
                        ? dayjs(item.data?.RHREC_CREATEAT).format("HH:mm:ss")
                        : dayjs(item.data?.RHREC_UPDATEAT).format("HH:mm:ss"),
                recBy: getUserName(item.data?.RHREC_RECBY) ?? "-",
                line: item.data?.RHREC_LINE,
                cus: item.data?.RHREC_CUS,
                won: item.data?.RHREC_WON,
                mdlCd: item.data?.RHREC_MDLCD,
                mdlNm: item.data?.RHREC_MDLNM,
                lots: item.data?.RHREC_LOTS,
                qty: item.data?.RHREC_QTY,
                procs: item.data?.RHREC_PROCS,
                prgNm: item.data?.RHREC_PRGNM,
                machine: item.data?.RHREC_MACHINE,
                socket: item.data?.RHREC_SOCKET,
                remark: item.data?.RHREC_REMARK,
                partNo: item.data?.RHREC_PARTNO,
                partNm: item.data?.RHREC_PARTNM,
                sumValue: "",
                dotIc: "",
                appr1: getUserName(item.level1?.empapp) ?? "-",
                appr1Time:
                    item.level1?.stampdate &&
                    dayjs(item.level1?.stampdate).format("YYYY-MM-DD HH:mm:ss"),
                appr2: getUserName(item.level2?.empapp) ?? "-",
                appr2Time:
                    item.level2?.stampdate &&
                    dayjs(item.level2?.stampdate).format("YYYY-MM-DD HH:mm:ss"),
            });

            const sumUrl = storageUrl(item.data?.RHREC_SUMVERIFY);
            const dotUrl = storageUrl(item.data?.RHREC_MARKVERIFY);

            let sumImgHeight = 0;
            let dotImgHeight = 0;

            if (sumUrl) {
                sumImgHeight = await addImageToCell(
                    workbook,
                    sheet,
                    sumUrl,
                    row.number,
                    SUM_VALUE_COL,
                    SUM_VALUE_WIDTH_CHARS,
                );
            }

            if (dotUrl) {
                dotImgHeight = await addImageToCell(
                    workbook,
                    sheet,
                    dotUrl,
                    row.number,
                    DOT_IC_COL,
                    DOT_IC_WIDTH_CHARS,
                );
            }

            // ปรับความสูงแถวให้พอดีกับรูปที่สูงที่สุดในแถวนี้ (บวก padding เล็กน้อย)
            const maxImgHeightPx = Math.max(sumImgHeight, dotImgHeight);
            if (maxImgHeightPx > 0) {
                row.height = pxToPoint(maxImgHeightPx) + 6;
            }
        }

        // const SUM_VALUE_COL = 17;
        // const DOT_IC_COL = 18;

        // for (let i = 0; i < exportData.length; i++) {
        //     const item = exportData[i];

        //     const row = sheet.addRow({
        //         date: dayjs(item.data?.RHREC_DATECT).format("DD/MM/YYYY"),
        //         time:
        //             item.data?.RHREC_UPDATEAT === null
        //                 ? dayjs(item.data?.RHREC_CREATEAT).format("HH:mm:ss")
        //                 : dayjs(item.data?.RHREC_UPDATEAT).format("HH:mm:ss"),
        //         recBy: getUserName(item.data?.RHREC_RECBY) ?? "-",
        //         line: item.data?.RHREC_LINE,
        //         cus: item.data?.RHREC_CUS,
        //         won: item.data?.RHREC_WON,
        //         mdlCd: item.data?.RHREC_MDLCD,
        //         mdlNm: item.data?.RHREC_MDLNM,
        //         lots: item.data?.RHREC_LOTS,
        //         qty: item.data?.RHREC_QTY,
        //         procs: item.data?.RHREC_PROCS,
        //         prgNm: item.data?.RHREC_PRGNM,
        //         machine: item.data?.RHREC_MACHINE,
        //         socket: item.data?.RHREC_SOCKET,
        //         remark: item.data?.RHREC_REMARK,
        //         partNo: item.data?.RHREC_PARTNO,
        //         partNm: item.data?.RHREC_PARTNM,
        //         sumValue: "",
        //         dotIc: "",
        //         appr1: getUserName(item.level1?.empapp) ?? "-",
        //         appr2: getUserName(item.level2?.empapp) ?? "-",
        //     });

        //     row.height = 50;

        //     const sumUrl = storageUrl(item.data?.RHREC_SUMVERIFY);
        //     if (sumUrl) {
        //         await addImageToCell(
        //             workbook,
        //             sheet,
        //             sumUrl,
        //             row.number,
        //             SUM_VALUE_COL,
        //         );
        //     }

        //     const dotUrl = storageUrl(item.data?.RHREC_MARKVERIFY);
        //     if (dotUrl) {
        //         await addImageToCell(
        //             workbook,
        //             sheet,
        //             dotUrl,
        //             row.number,
        //             DOT_IC_COL,
        //         );
        //     }
        // }

        // ตั้งชื่อไฟล์ให้บอกด้วยว่า export ช่วงไหน (ช่วยตอน debug/ผู้ใช้เช็คไฟล์ย้อนหลัง)
        const fileSuffix =
            startDate || endDate
                ? `${startDate || "start"}_to_${endDate || "end"}`
                : "all";

        const buffer = await workbook.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `summary-record-${fileSuffix}.xlsx`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const isDateInRange = (dateValue: any) => {
        if (!startDate && !endDate) return true; // ไม่ได้เลือกช่วงวันที่ = ผ่านหมด

        const rowDate = dayjs(dateValue);
        if (!rowDate.isValid()) return false;

        if (startDate && rowDate.isBefore(dayjs(startDate), "day"))
            return false;
        if (endDate && rowDate.isAfter(dayjs(endDate), "day")) return false;

        return true;
    };

    // ข้อมูลที่ผ่าน filter วันที่ (และ search ถ้ามี)
    const dateFilteredData = data.filter((item: any) =>
        isDateInRange(item.data?.RHREC_DATECT),
    );

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // เงื่อนไข 1: มี filter ช่วงวันที่ -> export dateFilteredData (เฉพาะช่วงที่เลือก)
            // เงื่อนไข 2: ไม่มี filter ช่วงวันที่ -> export ข้อมูลทั้งหมด (data)
            const exportTarget = startDate || endDate ? dateFilteredData : data;

            await exportToExcel(exportTarget);
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <>
            <div className="flex justify-between items-center my-5 px-2">
                <p>📊 ตารางแสดงข้อมูล (Summary Record)</p>

                <div className="flex gap-3 items-center">
                    <div className="flex gap-2 items-center">
                        <label className="text-sm">ตั้งแต่วันที่:</label>
                        <input
                            type="date"
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            className="border rounded-md px-2 py-1 text-sm"
                        />
                        <label className="text-sm">ถึงวันที่:</label>
                        <input
                            type="date"
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            className="border rounded-md px-2 py-1 text-sm"
                        />
                        {(startDate || endDate) && (
                            <button
                                onClick={() => {
                                    setStartDate("");
                                    setEndDate("");
                                }}
                                className="text-sm text-red-600 underline"
                            >
                                ล้างวันที่
                            </button>
                        )}
                    </div>

                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex items-center gap-2 px-3 py-1.5 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isExporting ? (
                            <>
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>กำลังโหลด...</span>
                            </>
                        ) : (
                            "Export Excel"
                        )}
                    </button>
                </div>
            </div>

            <div className="rounded-md border overflow-x-auto">
                <DataTable
                    columns={columns}
                    data={data}
                    pagination
                    paginationPerPage={perPage}
                    paginationRowsPerPageOptions={[5, 10, 25, 50]}
                    paginationComponentOptions={{
                        rowsPerPageText: "แสดง",
                        rangeSeparatorText: "จาก",
                        selectAllRowsItem: false,
                        selectAllRowsItemText: "ทั้งหมด",
                    }}
                    onChangePage={(page) => console.log(page)}
                    onChangeRowsPerPage={setPerPage}
                    customStyles={customStyles}
                    filter
                />
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
        </>
    );
}

export default TableData;
