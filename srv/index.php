<?php

if(isset($_POST["obsel"])){
	
	$data = $_POST["obsel"];
	$id = $_POST["id"];
	
	$dir = dirname(__FILE__);
	$dir1 = $dir.'/exper1';
	$dir2 = $dir1.'/'.$_SERVER["REMOTE_ADDR"];
	
	if(!is_dir($dir1)){
		mkdir($dir1);		
		if(!is_dir($dir2)){
			mkdir($dir2);
		}
	}
	
	$fp = fopen($dir2.'/'.$id.'.obs', 'w');
	if($fp===false){
		echo "cannot write log to".$dir2;
	}
	fwrite($fp, "".$data."\n");
	fclose($fp);
	
	$fp = fopen($dir2.'/events.log', 'a');
	
	fwrite($fp, date("D M j G:i:s T Y",time())." :".$id.".log \n");
	fclose($fp);
	
	echo "ok";
}