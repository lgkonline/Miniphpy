<?php

header("Content-type: text/json");

if ($action_get == "minify") {
	$response = "Okay";
	$status_code = 200;
	
	if (filter_input(INPUT_POST, "inputGroupID")) {
		$inputGroupID = filter_input(INPUT_POST, "inputGroupID");
	}
	else {
		$inputGroupID = 1;
	}
	
	require "classes/Minifier.php";
	
	$config = UserConfig::getConfig();
	$inputGroup = $config->inputGroups->{$inputGroupID};
	
	$minifier = new Minifier();
	$content = "";
	
	foreach ($inputGroup->input as $currInput) {
		if ($currInput->file != "") {
			// Überprüft ob URL oder Datei existiert
			if (filter_var($currInput->file, FILTER_VALIDATE_URL) || file_exists($currInput->file)) {
				$file = file_get_contents($currInput->file);
				$content .= $file;
			}
			else {
				// Datei nicht gefunden
				$status_code = 400;
				$response = "We couldn't find/open '$currInput->file'";
			}
		}
	}
	
	if ($status_code == 200) {
		$output = $minifier->minify($inputGroup->groupType, $content, $inputGroup->compressionOption);
		
		$output_file = fopen($inputGroup->outputFile, "w") or die("Unable to open '$inputGroup->outputFile'.");
		fwrite($output_file, $output);
		fclose($output_file);		
	}
	
	http_response_code($status_code);
	
	echo json_encode(array("response" => $response));
}

if ($action_get == "config") {
	echo UserConfig::getConfigJson();
}

if ($action_get == "update-config") {
	$response = "Okay";
	$status_code = 200;
	
	$configJson = filter_input(INPUT_POST, "config");
	
	$config_file = fopen(UserConfig::$configFile, "w") or die("Unable to open 'UserConfig::$configFile'.");
	fwrite($config_file, $configJson);
	fclose($config_file);
	
	http_response_code($status_code);
	
	echo json_encode(array("response" => $response));
}

exit;