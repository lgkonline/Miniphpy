function configCompatibilityTool(config) {
    var latestVersion = 2;
    
    if (typeof config.configVersion == "undefined" || config.configVersion == null) {
        config.configVersion = 1;
    }
    
    if (config.configVersion < latestVersion) {
        console.log("Version veraltet");
        
        updateConfig(config.configVersion, latestVersion, config);
    }
}

function updateConfig(currentVersion, latestVersion, config) {
    
    if (currentVersion == 1 && latestVersion == 2) {
        $.each(config.projects, function(currProjectKey, currProject) {
            currProject.rootPath = "./";
        });
        
        console.log(config);
    }
    
    config.configVersion = 2;
    saveChanges(false, config);
    
    alert("We updated your config to the latest version.");
}