function saveChanges(restart) {
	if (typeof restart == "undefined" || restart == null) {
		restart = false;
	}
	
	$.ajax({
		url: "index.php?action=update-config",
		type: "POST",
		data: { "config": JSON.stringify(config) },
		dataType: "json",
		success: function(response) {
			if (restart) {
				location.reload();
			}
			else {
				receiveData();
			}
		}
	});
}

function makeInputID(projectID, bundleID) {
	// Get base ID
	var newInputID = Object.keys(config.projects[projectID].bundles[bundleID].inputs)[0];
	
	while (typeof config.projects[projectID].bundles[bundleID].inputs[newInputID] != "undefined" || 
			config.projects[projectID].bundles[bundleID].inputs[newInputID] != null) {
				newInputID++;
			}
			
	return newInputID;
}

function makeBundleID(projectID) {
	// Get base ID
	var newBundleID = Object.keys(config.projects[projectID].bundles)[0];
	
	while (typeof config.projects[projectID].bundles[newBundleID] != "undefined" || 
			config.projects[projectID].bundles[newBundleID] != null) {
				newBundleID++;
			}
			
	return newBundleID;
}

function makeProjectID() {
	// Get base ID
	var newProjectID = Object.keys(config.projects)[0];
	
	while (typeof config.projects[newProjectID] != "undefined" || 
			config.projects[newProjectID] != null) {
				newProjectID++;
			}
			
	return newProjectID;
}

function startLoading() {
	$("#loading").show();
}

function endLoading() {
	$("#loading").hide();
}

function minify(projectID, inputGroupID, minifyBtn, autoRefresh) {
	if (typeof autoRefresh == "undefined" || autoRefresh == null) {
		autoRefresh = false;
	}
	
	if (config.projects[projectID].bundles[inputGroupID].outputFile != "") {
		$(minifyBtn).find(".tpl-input-group-minify-icon").toggleClass("glyphicon-play glyphicon-refresh");
		$(minifyBtn).find(".tpl-input-group-minify-icon").addClass("spin");
		
		$.ajax({
			url: "index.php?action=minify",
			data: {"inputGroupID": inputGroupID, "projectID": projectID},
			type: "POST",
			dataType: "json",
			success: function(response) {
				console.log(response);
				
				toggleMinifyBtnStatus(minifyBtn, "btn-success", "glyphicon-ok");
				
				if (autoRefresh) {
					timer = setTimeout(function() {
						console.log("new interval");
						minify(projectID, inputGroupID, minifyBtn, config.projects[projectID].bundles[inputGroupID].autoRefresh);
					}, 4000);
				}
			},
			error: function(response) {
				console.log(response);
				
				$.toaster({ 
					priority : 'danger',
					title : 'Error', 
					message : response.responseJSON.response
				});
				
				toggleMinifyBtnStatus(minifyBtn, "btn-danger", "glyphicon-remove");
			}
		});
	}
	else {
		$.toaster({ 
			priority : 'warning',
			title : 'Warning', 
			message : 'Make sure to set the output file.'
		});
	}
}

function toggleMinifyBtnStatus(btn, btnClass, iconClass) {
	var defaultBtnClass = "btn-primary";
	var defaultIconClass = "glyphicon-refresh";
	var loadingIconClass = "glyphicon-play";
	
	$(btn).toggleClass(defaultBtnClass + " " + btnClass);
	$(btn).find(".tpl-input-group-minify-icon").removeClass("spin");
	$(btn).find(".tpl-input-group-minify-icon").toggleClass(defaultIconClass + " " + iconClass);
	
	setTimeout(function() {
		$(btn).toggleClass(defaultBtnClass + " " + btnClass);
		$(btn).find(".tpl-input-group-minify-icon").toggleClass(loadingIconClass + " " + iconClass);
	}, 3000);
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays*24*60*60*1000));
    var expires = "expires="+d.toUTCString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') c = c.substring(1);
        if (c.indexOf(name) == 0) return c.substring(name.length,c.length);
    }
    return "";
}