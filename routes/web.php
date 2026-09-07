<?php

use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\API\DataController;
use App\Http\Controllers\API\POST\CreateDataController;
use App\Http\Controllers\API\PUT\UpdateController;
use Illuminate\Support\Facades\DB;
use App\Http\Controllers\User\Authcontroller;
use App\Http\Controllers\User\Usercontroller;

Route::get('/', function () {
    return Inertia::render('Welcome');
})->name('home');

Route::get('/register', function () {
    return Inertia::render('Form/Register');
})->name('register');

Route::get('/operator', function () {
    return Inertia::render('Form/Operator');
})->name('operator');

Route::get('/master-appr', function () {
    return Inertia::render('Form/settings/MasterAppr');
})->name('master-appr');

Route::get('/app-page', function () {
    return Inertia::render('Approval/AppPage');
})->name('app-page');

Route::get('/403', function () {
    return Inertia::render('Error/403');
})->name('error-page');

Route::get('/master-reg', function () {
    return Inertia::render('Form/MasterReg');
})->name('master-reg');

Route::get('/model-rec', function () {
    return Inertia::render('Form/ModelRec');
})->name('model-rec');

Route::get('/report', function () {
    return Inertia::render('Report/ReportDashboard');
})->name('report');

Route::get('/api/user-info', [Authcontroller::class, 'GetUserInfo'])->name('api.user-info');


//GET Data
Route::get('/api/customers', [DataController::class, 'customer'])->name('api.cus');
Route::get('/api/work-orders', [DataController::class, 'workOrders'])->name('api.work-orders');
Route::get('/api/master-reg', [DataController::class, 'readDataMasterRecord'])->name('api.master-record');
Route::get('/api/api-won', [DataController::class, 'ApiWON'])->name('api.api-won');
Route::get('/api/master-reg-all', [DataController::class, 'readDataMasterRegAll'])->name('api.master-reg-all');
Route::get('/api/rom-operator', [DataController::class, 'readDataShowROMOperator'])->name('api.rom-operator');
Route::get('/api/user-master-appr-settings', [DataController::class, 'GetApiUserMasterApprSettings'])->name('api.user-master-appr-settings');
Route::get('/api/master-appr-settings', [DataController::class, 'getApiApprSettings'])->name('api.master-appr-settings');
Route::get('/api/all-data', [DataController::class, 'GetDataRegAndOpr'])->name('api.all-data');
Route::get('/session', [Usercontroller::class, 'show'])->name('session.show');
Route::get('/api/api-all-appr', [DataController::class, 'GetDataAppAll'])->name('api.api-all-appr');
Route::get('/api/find-model/{customer}', [DataController::class, 'findModel'])->name('api.find-model');
Route::get('/api/find-work-order/{cus}', [DataController::class, 'findWorkOrder'])->name('api.find-work-order');
Route::get('/api/find-model-by-won/{won}', [DataController::class, 'findModelByWon'])->name('api.find-model-by-won');
Route::get('/api/Get-hrec-All', [DataController::class, 'GetHrecAll'])->name('api.Get-hrec-All');
Route::get('/api/total-record', [DataController::class, 'getTotalRecord'])->name('api.total-record');


//POST Data
Route::post('/api/master-reg', [CreateDataController::class, 'createMasterReg'])->name('api.master-reg');
Route::post('/api/add-operator', [CreateDataController::class, 'createOperator'])->name('api.add-operator');
Route::post('/api/save-master-appr-settings', [CreateDataController::class, 'saveMasterApprSettings'])->name('api.save-master-appr-settings');
Route::post('/api/send-to-app', [CreateDataController::class, 'sendToAppr'])
    ->name('api.send-to-app');


//PUT Data
Route::put('/master-reg-update/{id}', [UpdateController::class, 'update'])
    ->name('master-reg.update');
Route::put('/master-reg/{id}/delete', [UpdateController::class, 'destroy'])
    ->name('master-reg.destroy');
Route::put('/rom-operator/{id}', [UpdateController::class, 'updateOperator'])
    ->name('rom-operator.update');
Route::put('/rom-operator/{id}/next-to-status', [UpdateController::class, 'nextToStatus'])
    ->name('rom-operator.nextToStatus');
Route::put('/rom-operator/{id}', [UpdateController::class, 'destroyOperator'])
    ->name('rom-operator.destroy');
Route::put('/api/update-master-appr-settings/{id}', [UpdateController::class, 'updateMasterApprSettings'])
    ->name('api.update-master-appr-settings');

Route::put('/api/approve/{id}', [UpdateController::class, 'approve'])
    ->name('api.approve');
Route::put('/api/reject/{id}', [UpdateController::class, 'reject'])
    ->name('api.reject');
Route::delete('/session', [Usercontroller::class, 'clear'])->name('session.clear');
Route::put("/api/to-app", [UpdateController::class, 'toApp'])
    ->name("api.to-app");
Route::put('api/update-operator/{id}', [UpdateController::class, 'editOperator'])
    ->name('api.update-operator');


Route::get('/debug-columns', function () {
    return DB::select("
        SELECT COLUMN_NAME
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_NAME = 'ROM_REGISTER_TBL'
        ORDER BY ORDINAL_POSITION
    ");
});
