<?php

namespace App\Http\Controllers\API\POST;

use App\Http\Controllers\Controller;
use App\Models\mrec_tbl;
use App\Models\hrec_tbl;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\ROMOPRT;
use App\Models\ApprMaster;
use Illuminate\Support\Facades\App;
use App\Mail\RomApprovalMail;
use Illuminate\Support\Facades\Mail;

class CreateDataController extends Controller
{
    public function createMasterReg(Request $request)
    {
        $validated = $request->validate([
            "customer" => "required|string",
            "modelname" => "required|string",
            "modelcode" => "required|string",
            "process" => "required|string",
            "part_no" => "required|string",
            "part_name" => "required|string",
            "position" => "required|string",
            "machine" => "required|string",
            "socket" => "required|string",
            "sumv" => "required|string",
            "marking" => "required|file|mimes:jpeg,png,jpg,gif,svg|max:5120",
            "remark" => "required|string",
            "empno" => "required|string",
            "prog_name" => "required|string",
        ]);





        DB::beginTransaction();

        try {

            $Ym = date('Ym');
            $romRegiId = '';
            $img_mId = "";



            $findPrevious = DB::table('ROM_MREC_TBL')
                ->select('MREC_ID')
                ->orderBy('MREC_ID', 'DESC')
                ->get();

            if (empty($findPrevious[0])) {
                $romRegiId = 'MREC-' . $Ym . '-000001';
                $img_mId = 'IMG-' . $Ym . '-000001';
            } else {
                $romRegiId = AutogenerateKey('MREC', $findPrevious[0]->MREC_ID);
                $img_mId = AutogenerateKey('IMG', $findPrevious[0]->MREC_ID);
            }

            $file = $request->file("marking");
            $extension = $file->getClientOriginalExtension();


            $filename = "{$img_mId}.{$extension}";

            $dotIcPath = $file->storeAs('register-types/dot-ic', $filename, 'public');

            $inserted = [
                'MREC_ID'           => $romRegiId,
                'MREC_CUS' => $validated['customer'],
                'MREC_MDLNM' => $validated['modelname'],
                'MREC_MDLCD' => $validated['modelcode'],
                'MREC_PRGNM' => $validated['prog_name'],
                'MREC_PROCS' => $validated['process'],
                'MREC_PARTNO' => $validated['part_no'],
                'MREC_PARTNM' => $validated['part_name'],
                'MREC_POSITION' => $validated['position'],
                'MREC_MACHINE' => $validated['machine'],
                'MREC_SOCKET' => $validated['socket'],
                'MREC_SUMV' => $validated['sumv'],
                'MREC_MARKING' => $dotIcPath,
                'MREC_REMARK' => $validated['remark'],
                'MREC_RECSTD' => 1,
                'MREC_DELSTD' => 0,
                'MREC_EDITSTD' => 0,
                'MREC_CREATEAT' => date('Y-m-d H:i:s'),
                'MREC_CREATEBY' => $validated['empno'],
                'MREC_CHOOSE' => 0,
            ];
            // return response()->json($inserted);

            mrec_tbl::create($inserted);



            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()
                ->withErrors(['items' => 'บันทึกข้อมูลไม่สำเร็จ: ' . $e->getMessage()])
                ->withInput();
        }

        return redirect()
            ->route('master-reg') // ปรับ route ตามจริง
            ->with('success', 'บันทึกข้อมูลสำเร็จ ' . count($inserted) . ' รายการ');
    }


    public function createOperator(Request $request)
    {
        $validated = $request->validate([

            'line' => 'required|string|max:255',
            'customer' => 'required|string|max:255',

            'verify_fs' => 'required|boolean',
            'verify_sn' => 'required|boolean',

            'qty' => 'required|integer',
        ]);
        $data = $request->all();
        $Ym = date('Ym');
        $hrec_id = "";
        $img_id = "";


        DB::beginTransaction();
        try {


            $findPrevious = DB::table('ROM_HREC_TBL')
                ->select('RHREC_ID')
                ->orderBy('RHREC_ID', 'DESC')
                ->get();

            if (empty($findPrevious[0])) {
                $hrec_id = 'RHREC-' . $Ym . '-000001';
                $img_id = "IMG-" . $Ym . "-000001";
                $simg_id = "SDOT-" . $Ym . "-000001";
            } else {
                $hrec_id = AutogenerateKey('RHREC', $findPrevious[0]->RHREC_ID);
                $img_id = AutogenerateKey('IMG', $findPrevious[0]->RHREC_ID);
                $simg_id = AutogenerateKey('SDOT', $findPrevious[0]->RHREC_ID);
            }

            $file = $request->file("pic_verify");
            $extension = $file->getClientOriginalExtension();

            $fileSumImage = $request->file("verify_td");
            $extensionSumImage = $fileSumImage->getClientOriginalExtension();

            $filename = "{$img_id}.{$extension}";
            $sum_filename = "{$simg_id}.{$extensionSumImage}";

            $dotIcPath = $file->storeAs('register-types/dot-ic', $filename, 'public');
            $sumIcPath = $fileSumImage->storeAs('register-types/sum-ic', $sum_filename, 'public');

            $insert = [
                'RHREC_ID' => $hrec_id,
                'MREC_ID' => $data['mrec_id'],
                'RHREC_CUS' => $validated['customer'],
                'RHREC_LINE' => $validated['line'],
                'RHREC_DATECT' => $data['date'],
                'RHREC_WON' => $data['won'],
                'RHREC_LOTS' => $data['lots'],
                'RHREC_MDLNM' => $data['model_name'],
                'RHREC_MDLCD' => $data['model_code'],
                'RHREC_PRGNM' => $data['prog_name'],
                'RHREC_PROCS' => $data['process'],
                'RHREC_POSITION' => $data['position'],
                'RHREC_MACHINE' => $data['machine'],
                'RHREC_SOCKET' => $data['socket'],
                'RHREC_REMARK' => $data['remark'],
                'RHREC_PARTNO' => $data['partno'],
                'RHREC_FVERIFY' => $validated['verify_fs'],
                'RHREC_PARTNM' => $data['partname'],
                'RHREC_SNVERIFY' => $validated['verify_sn'],
                'RHREC_SUMVAL' => $data['sumval'],
                'RHREC_SUMVERIFY' => $sumIcPath,
                'RHREC_MARKING' => $data['marking'],
                'RHREC_MARKVERIFY' => $dotIcPath,
                'RHREC_QTY' => $validated['qty'],
                'RHREC_STD' => 1,
                'RHREC_CREATEAT' => date('Y-m-d H:i:s'),
                'RHREC_RECBY' => $data['emp_id'],
                'RHREC_LVAPP' => 0

            ];

            // dd($insert);
            hrec_tbl::create($insert);

            $update_db = [
                'MREC_CHOOSE' => 1,
                'RHREC_ID' => $hrec_id
            ];
            mrec_tbl::where('MREC_ID', $data['mrec_id'])->update($update_db);

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'message' => 'บันทึกข้อมูลไม่สำเร็จ: ' . $th->getMessage()
            ], 500);
        }

        return back()->with('success', 'insert successfully');
    }

    public function saveMasterApprSettings(Request $request)
    {
        $Ym = date('Ym');

        $validated = $request->validate([
            'firstlevel'    => 'array',
            'firstlevel.*'  => 'string',
            'secondlevel'   => 'array',
            'secondlevel.*' => 'string',

        ]);

        $levels = [
            ['level' => 1, 'approvers' => $validated['firstlevel'] ?? []],
            ['level' => 2, 'approvers' => $validated['secondlevel'] ?? []],

        ];

        DB::beginTransaction();
        try {

            foreach ($levels as $levelData) {
                $findPrevious = DB::table('ROMAPPR_H_TBL')
                    ->select('ROMAPPR_HID')
                    ->orderBy('ROMAPPR_HID', 'DESC')
                    ->get();

                $romappr = empty($findPrevious[0])
                    ? 'ROMAPP-' . $Ym . '-000001'
                    : AutogenerateKey('ROMAPP', $findPrevious[0]->ROMAPPR_HID);

                ApprMaster::create([
                    'ROMAPPR_HID'    => $romappr,
                    'ROMAPPR_HLV'    => $levelData['level'],
                    'ROMAPPR_HEMPID' => implode(',', $levelData['approvers']),
                    'ROMAPPR_HSTD'   => 1,
                    'ROMAPPR_HLSTDT' => now()
                ]);
            }

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors(['message' => 'บันทึกข้อมูลไม่สำเร็จ: ' . $e->getMessage()]);
        }

        return redirect()->route('master-appr')->with('success', 'บันทึกข้อมูลสำเร็จ');
    }

    public function sendToAppr(Request $request)
    {
        $data = $request->all();
        $hrec_id = $data['id'];

        // dd($hrec_id);

        DB::beginTransaction();
        $app_h_id = '';
        $Ym = date('Ym');

        $findPrevious = DB::table('ROM_APPR_TBL')
            ->select('ROMAPRH_ID')
            ->orderBy('ROMAPRH_ID', 'DESC')
            ->get();

        if (empty($findPrevious[0])) {
            $app_h_id = 'ROMAPR-' . $Ym . '-000001';
        } else {
            $app_h_id = AutogenerateKey('ROMAPR', $findPrevious[0]->ROMAPRH_ID);
        }

        try {
            $appms = DB::table('ROMAPPR_H_TBL')
                ->where('ROMAPPR_HSTD', 1)
                ->get();

            if (empty($appms)) {
                throw new \Exception('ไม่พบข้อมูลสายอนุมัติ');
            }

            // return response()->json([
            //     'message' => 'บันทึกข้อมูลสำเร็จ',
            //     'data' => $appms,
            //     'size' => sizeof($appms)
            // ], 200);

            $insertrows = [];
            $dateTime = date('Y-m-d H:i:s');
            $currentId = '';
            for ($i = 0; $i < sizeof($appms); $i++) {

                $rows = $appms[$i];

                if ($i === 0) {
                    $currentId = $app_h_id;
                } else {
                    $currentId = AutogenerateKey('ROMAPR', $currentId);
                }


                $insertrows[] = [
                    'ROMAPRH_ID' => $currentId,
                    'RHREC_ID' => $hrec_id,
                    'ROMAPPR_ID' => $rows->ROMAPPR_HID,
                    'ROMAPRH_EMPID' => $rows->ROMAPPR_HEMPID,
                    'ROMAPRH_SEQ' => $rows->ROMAPPR_HLV,
                    'ROMAPRH_EMPAPP' => null,
                    'ROMAPRH_STDAPP' => 0,
                    'ROMAPRH_CREATAT' => $dateTime,
                    'ROMAPRH_STAMPDATE' => null,
                    'ROMAPRH_STDCANCEL' => 0,
                    'ROMAPRH_CANCELBY' => null,

                ];
                // dd($rows);
            }
            DB::table('ROM_APPR_TBL')->insert($insertrows);

            $update_hrec = [
                'RHREC_LVAPP' => 1
            ];

            DB::table('ROM_HREC_TBL')->where('RHREC_ID', $hrec_id)->update($update_hrec);



            if (empty($insertrows)) {
                throw new \Exception('ไม่พบข้อมูลในการส่งอนุมัติ');
            } else {
                DB::commit();
            }

            $user_mail = ['j-natdanai@alpine-asia.com', 'natda002@gmail.com'];
            $link      = 'http://172.22.64.11/menu.php'; // ไม่ต้องครอบ url() ถ้าเป็น absolute URL อยู่แล้ว

            $data_mail = DB::table('ROM_HREC_TBL')
                ->where('RHREC_ID', $hrec_id)
                ->where('RHREC_LVAPP', 1)
                ->first();

            if ($data_mail) {
                Mail::to($user_mail)->send(new RomApprovalMail($data_mail, $link));
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'ส่งข้อมูลไม่สำเร็จ: ' . $e->getMessage()
            ], 500);
        }

        return back()->with('success', 'ส่งข้อมูลสำเร็จ');
    }
}
