<?php

class LittleHelpers {
	public static function isAbsolutePath($path) {
		return preg_match('/^(?:\/|\\\\|\w:\\\\|\w:\/).*$/', $path);
	}
	
	public static function isValidUrl($url) {
		return filter_var($url, FILTER_VALIDATE_URL);
	}
	
	public static function getGitHubInfo($repository, $default = 'master') {
		$file = @json_decode(@file_get_contents("https://api.github.com/repos/$repository/tags", false,
			stream_context_create(['http' => ['header' => "User-Agent: Vestibulum\r\n"]])
		));
		
		if ($file) {
			$tagName = reset($file)->name;
			$version = $tagName;
		}
		else {
			$tagName = $default;
			$version = "unknown";
		}
		
		$retVal = new stdClass();
		$retVal->downloadUrl = "https://github.com/$repository/releases/download/$tagName/Miniphpy.$tagName.zip";
		$retVal->version = $version;
		
		return $retVal;
	}
}