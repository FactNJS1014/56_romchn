Code backup

```
const approvalData = useCallback(() => {
        const romregi_Id: any = [];
        const appLEV: any = [];
        const appEMP: any = [];

        const approved_Id: string[] = [];
        const me = String(empno);
        console.log("empno", empno);

        appData.forEach((app: any) => {
            const empId = String(app.ROMAPRH_EMPID)
                .split(",")
                .map((e) => e.trim());

            const isApproved = Number(app.ROMAPRH_STDAPP) === 1;

            // ขั้นที่ "เรา" กดอนุมัติไปแล้ว
            if (isApproved && String(app.ROMAPRH_EMPAPP) === me) {
                if (!approved_Id.includes(app.ROMREGI_ID)) {
                    approved_Id.push(app.ROMREGI_ID);
                }
            }

            // ขั้นที่ยังรออนุมัติ และเราอยู่ในนั้น
            if (!isApproved && empId.includes(me)) {
                romregi_Id.push(app.ROMREGI_ID);
                appLEV.push(app.ROMAPRH_SEQ);
            }

            empId.forEach((emp) => {
                if (!appEMP.includes(emp)) appEMP.push(emp);
            });
        });

        console.log("ID: ", romregi_Id);
        console.log("LEV: ", appLEV);
        console.log("EMP: ", appEMP);

        setRegiId(romregi_Id);
        setAppLV(appLEV);
        setAppEmp(appEMP);
        setApprovedByMe(approved_Id);
    }, [appData, empno]);

    useEffect(() => {
        approvalData();
    }, [approvalData]);

    const filterData = useCallback(() => {
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
            console.log("Item GoApp: ", goApp);

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
        filterData();
    }, [filterData]);

    const currentLEV = appLV.length > 0 ? appLV[0] : 0;

```

---Code resize Image

```
/**
     * resize image
     */
    const resizeImage = (
        file: File,
        maxWidth: number,
        maxHeight: number,
        quality: number = 0.8,
    ): Promise<File> => {
        return new Promise((resolve, reject) => {
            const img = new Image();
            const objectUrl = URL.createObjectURL(file);

            img.onload = () => {
                URL.revokeObjectURL(objectUrl);

                let { width, height } = img;

                // คำนวณขนาดใหม่โดยรักษาสัดส่วนเดิม (aspect ratio)
                if (width > maxWidth || height > maxHeight) {
                    const ratio = Math.min(
                        maxWidth / width,
                        maxHeight / height,
                    );
                    width = Math.round(width * ratio);
                    height = Math.round(height * ratio);
                }

                const canvas = document.createElement("canvas");
                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext("2d");
                if (!ctx) {
                    reject(new Error("ไม่สามารถสร้าง canvas context ได้"));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error("ไม่สามารถแปลงรูปภาพได้"));
                            return;
                        }
                        const resizedFile = new File([blob], file.name, {
                            type: file.type,
                            lastModified: Date.now(),
                        });
                        resolve(resizedFile);
                    },
                    file.type,
                    quality,
                );
            };

            img.onerror = () => {
                URL.revokeObjectURL(objectUrl);
                reject(new Error("ไม่สามารถโหลดรูปภาพได้"));
            };

            img.src = objectUrl;
        });
    };


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] ?? null;
        if (!file) return;

        try {
            // resize ก่อน (จำกัดความกว้าง/สูงสูงสุด ปรับตัวเลขได้ตามต้องการ)
            const resizedImage = await resizeImage(file, 1280, 1280, 0.8);

            const newName = generateDotIcFileName(file);
            const renamedFile = new File([resizedImage], newName, {
                type: resizedImage.type,
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
```
