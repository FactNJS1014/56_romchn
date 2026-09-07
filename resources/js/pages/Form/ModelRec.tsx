import React, { FormEventHandler } from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import LayeredTabs, { type TabItem } from "@/components/Tabs/Layeredtabs";
import FormModel from "./Contents/FormModel";
import TableDataForm from "./Contents/TableDataForm";

function ModelRec() {
    const tabs: TabItem[] = [
        {
            id: "form-model",
            label: "แบบฟอร์มบันทึกข้อมูล",
            content: <FormModel />,
        },
        {
            id: "list-model",
            label: "รายการข้อมูล",
            content: <TableDataForm />,
        },
    ];

    return (
        <AppLayout>
            <Head title="Model Change" />
            <LayeredTabs tabs={tabs} />
        </AppLayout>
    );
}

export default ModelRec;
