import React from "react";
import { Head } from "@inertiajs/react";
import AppLayout from "@/layouts/AppLayout";
import LayeredTabs, { type TabItem } from "@/components/Tabs/Layeredtabs";
import TableData from "./ReportPages/TableData";
import ChartData from "./ReportPages/ChartData";

function ReportDashboard() {
    const tabs: TabItem[] = [
        {
            id: "report-table",
            label: "Summary Record",
            content: <TableData />,
        },
        {
            id: "report-chart",
            label: "Dashboard",
            content: <ChartData />,
        },
    ];
    return (
        <AppLayout>
            <Head title="ReportDashboard" />
            <div className="w-full">
                <LayeredTabs tabs={tabs} />
            </div>
        </AppLayout>
    );
}

export default ReportDashboard;
