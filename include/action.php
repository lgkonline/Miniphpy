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
	
	if (filter_input(INPUT_POST, "projectID")) {
		$projectID = filter_input(INPUT_POST, "projectID");
	}
	else {
		$projectID = 1;
	}
	
	require "classes/Minifier.php";
	
	$config = UserConfig::getConfig();
	$inputGroup = $config->projects->{$projectID}->bundles->{$inputGroupID};
	
	$minifier = new Minifier();
	$content = "";
	
	foreach ($inputGroup->inputs as $currInput) {
		if ($currInput->file != "") {
			// Is relative path, no URL and root path is set
			if (isset($inputGroup->rootPath) && $inputGroup->rootPath != "" && LittleHelpers::isAbsolutePath($currInput->file) == false && LittleHelpers::isValidUrl($currInput->file) == false) {
				$currInput->file = $inputGroup->rootPath . DIRECTORY_SEPARATOR . $currInput->file;
			}
			
			// Überprüft ob URL oder Datei existiert
			if (LittleHelpers::isValidUrl($currInput->file) || file_exists($currInput->file)) {
				$file = file_get_contents($currInput->file);
				$content .= $file . "\n";
			}
			// Maybe user missed to set the protocol to url
			elseif (LittleHelpers::isValidUrl("http:" . $currInput->file)) {
				$file = file_get_contents("http:" . $currInput->file);
				$content .= $file . "\n";
			}
			else {
				// Datei nicht gefunden
				$status_code = 400;
				$response = "We couldn't find/open '$currInput->file'";
			}
		}
	}
	
	if ($status_code == 200) {
		$output = $minifier->minify($inputGroup->dataType, $content, $inputGroup->compressionOption);
		
		$output = $content;
		
		// if root path is set 
		if (isset($inputGroup->rootPath) && $inputGroup->rootPath != "" && LittleHelpers::isAbsolutePath($inputGroup->outputFile) == false) {
			$inputGroup->outputFile = $inputGroup->rootPath . DIRECTORY_SEPARATOR . $inputGroup->outputFile;
		}
		
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
    
    UserConfig::updateConfig($configJson);
	
	http_response_code($status_code);
	
	echo json_encode(array("response" => $response));
}

if ($action_get == "check-version") {
	$gitHubInfo = LittleHelpers::getGitHubInfo("lgkonline/miniphpy");
	
	$response = new StdClass();
	$response->text = "";
	
	if (isset($gitHubInfo->version)) {
		$latestVersion = str_replace("v", "", $gitHubInfo->version);
		
		if ($latestVersion > APP_VERSION) {
			$response->isLatestVersion = false;
			$response->text = "A new version is available: " . $latestVersion;
		}
		else {
			$response->isLatestVersion = true;
			$response->text = "You already have the latest version installed.";
		}
		
		$response->latestVersion = $latestVersion;
	}
	else {
		$response->text = "We couldn't check the versions.";
	}
	
	echo json_encode($response);
}

if ($action_get == "ext-config") {
    $configPath = filter_input(INPUT_GET, "configPath");
    echo file_get_contents($configPath);
}

exit;