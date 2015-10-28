<?php

header("Content-type: text/json");

if ($action_get == "minify") {
	if (filter_input(INPUT_GET, "inputGroupID")) {
		$inputGroupID = filter_input(INPUT_GET, "inputGroupID");
	}
	else {
		$inputGroupID = 1;
	}
	
	if (filter_input(INPUT_GET, "format")) {
		$format = filter_input(INPUT_GET, "format");
	}
	else {
		$format = "js";
	}
	
	require "classes/Minifier.php";
	
	$config = UserConfig::getConfig();
	$inputGroup = $config->inputGroups->{$inputGroupID};
	
	$minifier = new Minifier();
	$content = "";
	
	foreach ($inputGroup->input as $currInput) {
		$file = file_get_contents($currInput->file);
		$content .= $file;
	}
	
	$output = $minifier->minify($format, $content);
	
	$output_file = fopen($inputGroup->outputFile, "w") or die("Unable to open '$output_file1'.");
	fwrite($output_file, $output);
	fclose($output_file);
	
	echo "Okay";
}

if ($action_get == "config") {
	echo UserConfig::getConfigJson();
}

exit;