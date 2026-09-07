<?php

namespace App\Http\Controllers\API;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DataController extends Controller
{
    public function customer()
    {
        $customers = DB::table('VWORLIST')
            ->distinct()
            ->orderBy('BGCD')
            ->pluck('BGCD');

        return response()->json($customers);
    }

    public function findModel(Request $request, $customer)
    {
        $model = DB::table('VWORLIST')
            ->where('BGCD', $customer)
            ->select('MDLCD', 'MDLNM')
            ->get();

        return response()->json($model);
    }

    public function findWorkOrder(Request $request, $cus)
    {
        $won = DB::table('VWORLIST')
            ->where('BGCD', $cus)
            ->select('WON')
            ->get();

        return response()->json($won);
    }

    public function findModelByWon(Request $request, $won)
    {
        $model = DB::table('VWORLIST')
            ->where('WON', 'LIKE', '%' . $won . '%')
            ->select('MDLCD', 'MDLNM', 'WONQT')
            ->get();

        return response()->json($model);
    }



    public function workOrders(Request $request)
    {
        $request->validate([
            'customer' => 'required|string',
            'q' => 'nullable|string|max:50',
        ]);

        $query = DB::table('VWORLIST')
            ->where('BGCD', $request->customer)
            ->select('WON', 'MDLCD', 'WONQT');

        if ($request->filled('q')) {
            $q = $request->query('q');
            // ค้นหาแบบ "มีเลขนี้อยู่ตรงไหนก็ได้ในเลข WON" (contains)
            $query->where('WON', 'LIKE', '%' . $q . '%');
        }

        $workOrders = $query->get();

        return response()->json($workOrders);
    }

    public function ApiWON(Request $request)
    {
        $request->validate([
            'q' => 'nullable|string|max:50',
        ]);
        $query = DB::table('VWORLIST')
            ->select('WON', 'MDLCD', 'WONQT');

        if ($request->filled('q')) {
            $query->where('WON', 'LIKE', '%' . $request->query('q') . '%');
        }

        $results = $query->get();

        return response()->json($results);
    }

    public function readDataMasterRecord(Request $request)
    {
        $keyword = $request->query('search', '');
        $perPage = $request->input('per_page', 10);

        $query = DB::table('ROM_MREC_TBL')
            ->where('MREC_RECSTD', 1);

        if ($keyword) {
            $query->where('MREC_MDLCD', 'LIKE', '%' . $keyword . '%');
        }

        $data = $query->orderBy('MREC_ID', 'desc')->paginate($perPage)->withQueryString();

        return response()->json($data);
    }

    public function readDataMasterRegAll()
    {
        $data = DB::table('ROM_MREC_TBL')
            ->where('MREC_RECSTD', 1)
            ->where('MREC_DELSTD', 0)
            ->where('MREC_CHOOSE', 0)
            ->orderBy('MREC_ID', 'desc')
            ->get();
        return response()->json($data);
    }

    public function readDataShowROMOperator(Request $request)
    {
        $keyword = $request->query('search', '');

        if ($keyword) {
            $data = DB::table('ROM_OPRT_TBL')
                ->where('ROMOPRT_STATUS', 0)
                ->where('ROMOPRT_DELSTD', 0)
                ->where('ROMOPRT_WON', 'LIKE', '%' . $keyword . '%')
                ->orderBy('ROMOPRT_ID', 'desc')
                ->get();
        } else {
            $data = DB::table('ROM_OPRT_TBL')
                ->where('ROMOPRT_STATUS', 0)
                ->where('ROMOPRT_DELSTD', 0)
                ->orderBy('ROMOPRT_ID', 'desc')
                ->get();
        }

        return response()->json($data);
    }

    public function GetApiUserMasterApprSettings()
    {
        $sectCodes_AM = [
            '4001-01',
            '4001-02'
        ];
        $sectCodes_QC = [
            '3002-01',
            '3002-02',
            '3002-03',
        ];

        $get_users_AM = DB::connection('sqlsrv_sn')
            ->table('Employee_Cache')
            ->select('EmpID', 'FNameEng', 'LNameEng', 'FName', 'LName')
            ->whereIn('SectCD', $sectCodes_AM)
            ->get();

        $get_users_QC = DB::connection('sqlsrv_sn')
            ->table('Employee_Cache')
            ->select('EmpID', 'FNameEng', 'LNameEng', 'FName', 'LName')
            ->whereIn('SectCD', $sectCodes_QC)
            ->get();

        $get_users_all = DB::connection('sqlsrv_sn')
            ->table('Employee_Cache')
            ->select('EmpID', 'FNameEng', 'LNameEng', 'FName', 'LName')
            ->get();

        return response()->json([
            'users_AM' => $get_users_AM,
            'users_QC' => $get_users_QC,
            'users_all' => $get_users_all
        ]);
    }


    public function getApiApprSettings()
    {
        $db_appr = DB::table('ROMAPPR_H_TBL')
            ->select('ROMAPPR_HID', 'ROMAPPR_HLV', 'ROMAPPR_HEMPID', 'ROMAPPR_HSTD', 'ROMAPPR_HLSTDT', 'ROMAPPR_HSHIFT')
            ->get();
        return response()->json($db_appr);
    }

    public function GetDataRegAndOpr()
    {
        $api_all_data = DB::table('ROM_HREC_TBL as re')
            ->where('re.RHREC_STD', 1)
            ->where('re.RHREC_REJSTD', null)
            ->orderBy('re.RHREC_ID', 'desc')
            ->get();


        $all_app = DB::table('ROM_APPR_TBL as rpa')
            ->join('ROM_HREC_TBL as rpt', 'rpt.RHREC_ID', '=', 'rpa.RHREC_ID')
            ->select('rpt.*', 'rpa.*')
            ->where('rpt.RHREC_STD', 1)
            ->where('rpt.RHREC_LVAPP', '!=', 0)
            ->where('rpt.RHREC_REJSTD', null)
            ->orderBy('rpt.RHREC_ID', 'desc')
            ->get();

        return response()->json([
            'all_data' => $api_all_data,
            'app_data' => $all_app
        ]);
    }

    public function GetDataAppAll()
    {
        $all_app = DB::table('ROM_APPR_TBL as rpa')
            ->join('ROM_OPRT_TBL as rpt', 'rpt.ROMREGI_ID', '=', 'rpa.ROMREGI_ID')
            ->join('ROM_REGISTER_TBL as rpg', 'rpt.ROMREGI_ID', '=', 'rpg.ROMREGI_ID')
            ->select('rpt.*', 'rpa.*', 'rpg.*')
            ->where('rpg.ROMREGI_STATUS', 1)
            ->where('rpt.ROMOPRT_GOAPPSTD', 1)
            ->where('rpt.ROMOPRT_STATUS', 1)
            ->where('rpg.ROMREGI_LVL_APR', '!=', 0)
            ->get();

        return response()->json($all_app);
    }

    public function GetHrecAll()
    {
        $hrec_all = DB::table('ROM_HREC_TBL')
            ->orderBy('RHREC_ID', 'desc')
            ->where('RHREC_LVAPP', '=', 0)
            ->get();

        return response()->json($hrec_all);
    }

    public function getTotalRecord()
    {
        $total_data = DB::table('ROM_HREC_TBL as rpt')
            ->join('ROM_APPR_TBL as rpa', 'rpt.RHREC_ID', '=', 'rpa.RHREC_ID')
            ->select('rpt.*', 'rpa.*')
            ->where('rpt.RHREC_LVAPP', '>', 0)
            ->orderBy('rpt.RHREC_ID', 'desc')
            ->get();
        return response()->json($total_data);
    }
}
