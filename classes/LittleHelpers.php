<?php

class LittleHelpers {
	public static function isAbsolutePath($path) {
		return preg_match('/^(?:\/|\\\\|\w:\\\\|\w:\/).*$/', $path);
	}
	
	public static function isValidUrl($url) {
		return filter_var($url, FILTER_VALIDATE_URL);
	}
}