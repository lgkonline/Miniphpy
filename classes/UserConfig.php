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
            $receivedConfig = json_decode(file_get_contents(self::$configFile));
            
            // Include external config projects
            foreach ($receivedConfig->externalProjects as $key=>$currExtProject) {
                $newProjectID = count((array)$receivedConfig->projects) + 1;
                
                while (isset($receivedConfig->projects->{$newProjectID})) {
                    $newProjectID++;
                }
                
                $extProject = json_decode(file_get_contents($currExtProject->configPath));
                
                // Does received project exist?
                if (isset($extProject)) {
                    $extProject->external = true;
                    $extProject->externalProjectID = $key;
                    
                    $receivedConfig->projects->{$newProjectID} = $extProject;
                    $receivedConfig->externalProjects->{$key}->projectID = $newProjectID;
                }

            }
            
			self::$configJson = json_encode($receivedConfig);
		}
		return self::$configJson;
	}
    
    public static function updateConfig($configJson) {
        
        // $configJson = self::getConfigJson();
        
        $config_file = fopen(self::$configFile, "w") or die("Unable to open 'UserConfig::$configFile'.");
        
        $config = json_decode($configJson);
        
        // print_r($config);
        // die();
        
        
        // Update external projects
        foreach ($config->externalProjects as $currExtProject) {
            self::updateExternalConfig($currExtProject->configPath, $config->projects->{$currExtProject->projectID});
        }
        
        // Delete external projects from actual projects
        foreach($config->projects as $currKey=>$currProject) {
            if (isset($currProject->external) && $currProject->external == true) {
                unset($config->projects->{$currKey});
            }
        }
        
        $configJson = json_encode($config);
        
        if (isset($configJson) && $configJson != "" && $configJson != "null" && $configJson != null) {
            fwrite($config_file, $configJson);
        }
        fclose($config_file);        
    }
    
    private static function updateExternalConfig($configPath, $config) {
        $config_file = fopen($configPath, "w") or die("Unable to open '$configPath'.");
        $configJson = json_encode($config);
        
        fwrite($config_file, $configJson);
        fclose($config_file);            
    }
}