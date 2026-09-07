<?php
$files = glob(__DIR__ . "/*Helper.php");
foreach ($files as $file){
    $filename = (string) $file;
    if(strpos($filename,'Helper.php') !== false){
        require_once $filename;
    }
}