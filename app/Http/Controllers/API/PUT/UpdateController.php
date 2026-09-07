<?php

namespace App\Http\Controllers\API\PUT;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use App\Models\ROMOPRT;
use App\Models\ApprMaster;
use App\Models\mrec_tbl;
use App\Models\hrec_tbl;
use App\Mail\RomApprovalMail;
use Illuminate\Support\Facades\Mail;



class UpdateController extends Controller
{
    public function update(Request $request, $id)
    {
        $record = mrec_tbl::find($id);
        // return response()->json(["record" => $record, "id" => $id]);


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
            "remark" => "required|string",
            "empno" => "required|string",
            "prog_name" => "required|string",
        ]);


        DB::beginTransaction();

        try {

            $file = $request->file("marking");
            if ($file) {
                $extension = $file->getClientOriginalExtension();
                $nextNumber = mrec_tbl::count() + 1;

                // สร้างเลขรัน (เช่น ดึงจากจำนวนไฟล์ที่มีอยู่ + 1 หรือใช้ตาราง sequence)
                $runningNumber = str_pad($nextNumber, 6, '0', STR_PAD_LEFT); // เช่น 000001

                $filename = "IMG-{$runningNumber}.{$extension}";

                $dotIcPath = $file->storeAs('register-types/dot-ic', $filename, 'public');
            } else {
                $dotIcPath = $record->MREC_MARKING;
            }

            $record->update([
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
                'MREC_EDITSTD' => 1,
                'MREC_UPDATEAT' => date('Y-m-d H:i:s'),
                'MREC_UPDATEBY' => $validated['empno'],
            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();

            return back()
                ->withErrors(['items' => 'แก้ไขข้อมูลไม่สำเร็จ: ' . $e->getMessage()])
                ->withInput();
        }

        return redirect()
            ->route('master-reg')
            ->with('success', 'แก้ไขข้อมูลสำเร็จ');
    }

    public function destroy($id)
    {
        $record = mrec_tbl::find($id);
        if (!$record) {
            return back()->withErrors(['items' => 'ไม่พบข้อมูล'])->withInput();
        }

        try {
            $record->MREC_DELSTD = 1;
            $record->save();

            return back()->with('success', 'ลบข้อมูลสำเร็จ');
        } catch (\Throwable $e) {
            return back()
                ->withErrors(['items' => 'ลบข้อมูลไม่สำเร็จ: ' . $e->getMessage()])
                ->withInput();
        }
    }

    public function updateOperator($id, Request $request)
    {
        $record = ROMOPRT::find($id);

        $validated = $request->validate([
            'date' => 'required|string|max:255',
            'shift' => 'required|string|max:255',
            'line' => 'required|string|max:255',
            'model' => 'required|string|max:255',
            'won' => 'required|string|max:255',
            'lots' => 'required|integer',
            'part_number' => 'required|string|max:255',
            'program_name' => 'required|string|max:255',
            'process' => 'required|string|max:255',
            'ic_position' => 'required|string|max:255',
            'sum_value' => 'required|string|max:255',
            'c_pass' => 'required|integer',
            'c_fail' => 'required|integer',
            'c_total' => 'required|integer',
            'empid' => 'required|string|max:255',


        ]);

        $remark = $request->input('remark');

        DB::beginTransaction();
        try {
            $record->update([
                'ROMOPRT_DATE' => $validated['date'],
                'ROMOPRT_SHIFT' => $validated['shift'],
                'ROMOPRT_LINE' => $validated['line'],
                'ROMOPRT_MODEL' => $validated['model'],
                'ROMOPRT_WON' => $validated['won'],
                'ROMOPRT_LOTS' => $validated['lots'],
                'ROMOPRT_PARTNUM' => $validated['part_number'],
                'ROMOPRT_PROGNAME' => $validated['program_name'],
                'ROMOPRT_PROCS' => $validated['process'],
                'ROMOPRT_POSITION' => $validated['ic_position'],
                'ROMOPRT_SUMVAL' => $validated['sum_value'],
                'ROMOPRT_CNTPASS' => $validated['c_pass'],
                'ROMOPRT_CNTFAIL' => $validated['c_fail'],
                'ROMOPRT_CNTTOTAL' => $validated['c_total'],
                'ROMOPRT_EMPID' => $validated['empid'],
            ]);
            $record->ROMOPRT_COMMENT = $remark;
            $record->ROMOPRT_UPDATED_AT = date('Y-m-d H:i:s');
            $record->save();
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Operator updated failed',
                'error' => $e->getMessage()
            ], 500);
        }
        return redirect()->route('operator')->with('success', 'Operator updated successfully');
    }

    public function nextToStatus($id)
    {
        $upToStd  = ROMOPRT::find($id);

        DB::beginTransaction();
        try {
            // TODO: Implement next to status logic
            $upToStd->ROMOPRT_STATUS = 1;
            $upToStd->save();

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Next to status failed',
                'error' => $e->getMessage()
            ], 500);
        }
        return redirect()->route('operator')->with('success', 'Next to status successfully');
    }

    public function destroyOperator($id)
    {
        $record = ROMOPRT::find($id);
        DB::beginTransaction();
        try {
            $record->ROMOPRT_DELSTD = 1;
            $record->save();
            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Operator deleted failed',
                'error' => $e->getMessage()
            ], 500);
        }
        return redirect()->route('operator')->with('success', 'Operator deleted successfully');
    }

    public function updateMasterApprSettings(Request $request, $id)
    {
        $apprMaster = ApprMaster::findOrFail($id);

        $validatedData = $request->validate([
            'firstlevel'    => 'array',
            'firstlevel.*'  => 'string',
            'secondlevel'   => 'array',
            'secondlevel.*' => 'string',
        ]);

        // ใช้ level จริงของ record นี้เป็นตัวตัดสิน ไม่ใช่เดาจาก field ที่ไม่ว่าง
        $empIds = match ((int) $apprMaster->ROMAPPR_HLV) {
            1 => $validatedData['firstlevel'] ?? [],
            2 => $validatedData['secondlevel'] ?? [],

            default => null,
        };

        if ($empIds === null) {
            return back()->withErrors(['message' => 'ไม่พบระดับผู้อนุมัติที่ถูกต้องสำหรับรายการนี้']);
        }

        DB::beginTransaction();
        try {
            $apprMaster->update([
                'ROMAPPR_HEMPID'    => implode(',', $empIds),
                'ROMAPPR_HUPDATEAT' => now(),

            ]);

            DB::commit();
        } catch (\Throwable $e) {
            DB::rollBack();
            return back()->withErrors([
                'message' => 'อัปเดตข้อมูลไม่สำเร็จ: ' . $e->getMessage(),
            ]);
        }

        return redirect()->route('master-appr')->with('success', 'บันทึกข้อมูลสำเร็จ');
    }

    public function ToApp(Request $request)
    {
        $data = $request->all();

        // dd($data);

        DB::beginTransaction();

        try {
            $db_regi = DB::table("ROM_HREC_TBL")->where("RHREC_ID", $data['reg_id'])
                ->update([
                    'RHREC_LVAPP' => DB::raw('RHREC_LVAPP + 1')
                ]);

            $db_app = DB::table('ROM_APPR_TBL')->where('RHREC_ID', $data['reg_id'])->where('ROMAPRH_SEQ', $data['app_lev'])
                ->update([
                    'ROMAPRH_EMPAPP' => $data['app_by'],
                    'ROMAPRH_STDAPP' => 1,
                    'ROMAPRH_STAMPDATE' => date('Y-m-d H:i:s'),
                ]);

            if ($db_regi > 0 && $db_app > 0) {
                DB::commit();
                $user_mail = ['j-natdanai@alpine-asia.com', 'natda002@gmail.com'];
                $link      = 'http://172.22.64.11/menu.php'; // ไม่ต้องครอบ url() ถ้าเป็น absolute URL อยู่แล้ว

                $data_mail = DB::table('ROM_HREC_TBL')
                    ->where('RHREC_ID', $data['reg_id'])
                    ->where('RHREC_LVAPP', 2)
                    ->first();

                if ($data_mail) {
                    Mail::to($user_mail)->send(new RomApprovalMail($data_mail, $link));
                }
                return redirect()->route('app-page')->with('success', 'Next to status successfully');
            } else {
                DB::rollBack();
                return response()->json([
                    'message' => 'Next to status failed',
                ], 500);
            }
        } catch (\Throwable $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Next to status failed',
                'error' => $e->getMessage()
            ], 500);
        }
    }

    public function editOperator(Request $request, $id)
    {
        $record = hrec_tbl::find($id);
        $data = $request->all();
        // dd($data);
        DB::beginTransaction();
        try {
            $record->update([
                'RHREC_RECBY' => $data['emp_id'],
                'RHREC_DATECT' => $data['date'],
                'RHREC_CUS' => $data['customer'],
                'RHREC_WON' => $data['won'],
                'RHREC_LOTS' => $data['lots'],
                'RHREC_MDLNM' => $data['model_name'],
                'RHREC_MDLCD' => $data['model_code'],
                'RHREC_PRGNM' => $data['prog_name'],
                'RHREC_LINE' => $data['line'],
                'RHREC_PROCS' => $data['process'],
                'RHREC_POSITION' => $data['position'],
                'RHREC_MACHINE' => $data['machine'],
                'RHREC_SOCKET' => $data['socket'],
                'RHREC_REMARK' => $data['remark'],
                'RHREC_PARTNO' => $data['partno'],
                'RHREC_FVERIFY' => $data['verify_fs'],
                'RHREC_PARTNAME' => $data['partname'],
                'RHREC_SNVERIFY' => $data['verify_sn'],
                'RHREC_SUMVAL' => $data['sumval'],
                'RHREC_SUMVERIFY' => $data['verify_td'],
                'RHREC_MARKING' => $data['marking'],
                'RHREC_MARKVERIFY' => $data['pic_verify'],
                'RHREC_QTY' => $data['qty'],
                'RHREC_UPD' => 1,
                'RHREC_UPDATED_AT' => date('Y-m-d H:i:s'),
                'MREC_ID' => $data['mrec_id'],
            ]);

            DB::commit();
        } catch (\Throwable $th) {
            DB::rollBack();
            return response()->json([
                'message' => 'Edit operator failed',
                'error' => $th->getMessage()
            ], 500);
        }

        return back()->with('success', 'Edit operator successfully');
    }
}
