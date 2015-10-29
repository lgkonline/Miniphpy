<?php

class UserConfig {
	private static $config;
	private static $configJson;
	public static $configFile = "data/config.json";
	
	public static function getConfig() {
		if (!isset(self::$config)) {
			self::$config = json_decode(self::getConfigJson());
		}
		return self::$config;
	}
	
	public static function getConfigJson() {
		if (!isset(self::$config)) {
			self::$configJson = file_get_contents(self::$configFile);
		}
		return self::$configJson;
	}
}