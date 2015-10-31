var config = {};
var availableGroupTypes = ["js", "css"];
var availableCompressionOptions = ["remote", "local"];
var timer;

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
			console.log(response);
			if (restart) {
				location.reload();
			}
			else {
				receiveData();
			}
		}
	});
}

function makeInputID(inputGroupID) {
	var newInputID = 1;
	
	while (typeof config.inputGroups[inputGroupID].input[newInputID] != "undefined" || 
			config.inputGroups[inputGroupID].input[newInputID] != null) {
				newInputID++;
			}
			
	return newInputID;
}

function makeInputGroupID() {
	var newInputGroupID = 1;
	
	while (typeof config.inputGroups[newInputGroupID] != "undefined" || 
			config.inputGroups[newInputGroupID] != null) {
				newInputGroupID++;
			}
			
	return newInputGroupID;
}

function startLoading() {
	$("#loading").show();
}

function endLoading() {
	$("#loading").hide();
}

function receiveData() {
	startLoading();
	
	$.ajax({
		url: "index.php?action=config",
		type: "GET",
		dataType: "json",
		success: function(receivedConfig) {
			endLoading();
			
			config = receivedConfig;
			var countInputGroups = 0;
			console.log(config);
			
			$("#input-groups").empty();
			
			$.each(config.inputGroups, function(currInputGroupKey, currInputGroup) {
				countInputGroups++;
				
				var inputGroupDom = $("#tpl-input-group").clone();
				var dropdownID = "dropdown-" + currInputGroupKey;
				
				$(inputGroupDom).find(".input-group-id").attr("data-id", currInputGroupKey);
				
				$(inputGroupDom).find(".tpl-input-group-type-dropdown-toggle").addClass("group-type-" + currInputGroup.groupType);
				$(inputGroupDom).find(".tpl-input-group-type-dropdown-toggle").attr("id", dropdownID);
				$(inputGroupDom).find(".tpl-input-group-type-dropdown-menu").attr("aria-labelledby", dropdownID);
				
				$(inputGroupDom).find(".tpl-input-group-type").text(currInputGroup.groupType);
				$(inputGroupDom).find(".tpl-input-group-output-file").attr("value", currInputGroup.outputFile);
				$(inputGroupDom).find(".tpl-input-group-title").attr("value", currInputGroup.title);
				
				var countInputs = 0;
				
				$(inputGroupDom).find(".tpl-input-group-inputs").empty();
				
				// Place inputs
				$.each(currInputGroup.input, function(currInputKey, currInput) {
					countInputs++;
					
					var inputDom = $("#tpl-input").clone();
					
					$(inputDom).find(".input-id").attr("data-id", currInputKey);
					
					$(inputDom).find(".tpl-input-file").attr("value", currInput.file);
					$(inputDom).find(".tpl-input-position").text(currInput.position);
					
					$(inputGroupDom).find(".tpl-input-group-inputs").append($(inputDom).html());
				});
				
				if (countInputs == 0) {
					var noInputsDom = $("#tpl-no-inputs").clone();
					$(inputGroupDom).find(".tpl-input-group-inputs").html($(noInputsDom).html());
				}
				
				// Remove current group type as a option from dropdown
				$(inputGroupDom).find(".tpl-input-group-type-dropdown-option").each(function() {
					if ($(this).attr("data-value") == currInputGroup.groupType) {
						$(this).remove();
					}
				});
				
				// Mark active compression option
				$(inputGroupDom).find(".tpl-input-group-compression-option").each(function() {
					if ($(this).attr("data-value") == currInputGroup.compressionOption) {
						$(this).addClass("active");
					}
				});
				
				// Mark auto refresh btn
				if (currInputGroup.autoRefresh == true) {
					$(inputGroupDom).find(".tpl-input-group-toggle-auto-refresh").addClass("btn-primary-reverse");
				}
				else {
					$(inputGroupDom).find(".tpl-input-group-toggle-auto-refresh").addClass("btn-default-reverse");
				}
				
				$("#input-groups").append($(inputGroupDom).html());
				
				if (currInputGroup.autoRefresh == true) {
					minify(currInputGroupKey, ".input-group-id[data-id='" + currInputGroupKey + "'] .tpl-input-group-minify", true);
				}				
			}); // end of each inputGroup
			
			if (countInputGroups == 0) {
				var noBundlesDom = $("#tpl-no-bundles").clone();
				$("#input-groups").html($(noBundlesDom).html());
			}
			
			$(".dropdown-toggle").dropdown();
			
			// Btn Minify
			$(".tpl-input-group-minify").click(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				var minifyBtn = this;	
				minify(inputGroupID, minifyBtn);			
			});
			
			// Btn Add input
			$(".tpl-input-group-add").click(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				var inputID = makeInputID(inputGroupID);
				
				config.inputGroups[inputGroupID].input[inputID] = {
					file: "",
					position: inputID
				};
				
				saveChanges();
			});
			
			// Btn Remove input
			$(".tpl-input-remove").click(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				var inputID = $(this).closest(".input-id").attr("data-id");
				
				delete config.inputGroups[inputGroupID].input[inputID];
				
				saveChanges();
			});
			
			// Changed input
			$(".tpl-input-file").blur(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				var inputID = $(this).closest(".input-id").attr("data-id");
				var file = $(this).val();
				
				config.inputGroups[inputGroupID].input[inputID].file = file;
				
				saveChanges();
			});
			
			// Changed group
			$(".tpl-input-group-output-file").blur(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				
				config.inputGroups[inputGroupID].outputFile = $(this).val();
				
				saveChanges();
			});
			
			// Changed bundle title
			$(".tpl-input-group-title").blur(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				
				config.inputGroups[inputGroupID].title = $(this).val();
				
				saveChanges();
			});
			
			// Remove group
			$(".tpl-input-group-remove").click(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				
				delete config.inputGroups[inputGroupID];
				
				saveChanges();
			});
			
			// Change input group type
			$(".tpl-input-group-type-dropdown-option").click(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				
				config.inputGroups[inputGroupID].groupType = $(this).attr("data-value");
				
				saveChanges();
			});
			
			// Change compression option
			$(".tpl-input-group-compression-option:not(.active)").click(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				config.inputGroups[inputGroupID].compressionOption = $(this).attr("data-value");
				saveChanges();
			});
			
			// Toggle auto refresh
			$(".tpl-input-group-toggle-auto-refresh").click(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				var restart = false;
				
				if (config.inputGroups[inputGroupID].autoRefresh == true) {
					config.inputGroups[inputGroupID].autoRefresh = false;
					console.log("clear it");
					restart = true;
					// window.clearTimeout(timer);
				}
				else {
					config.inputGroups[inputGroupID].autoRefresh = true;
				}
				
				saveChanges(restart);
			});
			
		} // end of success function
	}); // end of ajax
} // end of receiveData()
			
function minify(inputGroupID, minifyBtn, autoRefresh) {
	if (typeof autoRefresh == "undefined" || autoRefresh == null) {
		autoRefresh = false;
	}
	
	if (config.inputGroups[inputGroupID].outputFile != "") {
		$(minifyBtn).find(".tpl-input-group-minify-icon").toggleClass("glyphicon-play glyphicon-refresh");
		$(minifyBtn).find(".tpl-input-group-minify-icon").addClass("spin");
		
		$.ajax({
			url: "index.php?action=minify",
			data: {"inputGroupID": inputGroupID},
			type: "POST",
			dataType: "json",
			success: function(response) {
				console.log(response);
				
				toggleMinifyBtnStatus(minifyBtn, "btn-success", "glyphicon-ok");
				
				if (autoRefresh) {
					timer = setTimeout(function() {
						console.log("new interval");
						minify(inputGroupID, minifyBtn, config.inputGroups[inputGroupID].autoRefresh);
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

$(document).ready(function() {
	// Load available group types
	$("#tpl-input-group .tpl-input-group-type-dropdown-menu").empty();
	$.each(availableGroupTypes, function(currAvailableGroupTypeKey, currAvailableGroupType) {
		$("#tpl-input-group .tpl-input-group-type-dropdown-menu").append(
			'<li class="tpl-input-group-type-dropdown-option" data-value="' + currAvailableGroupType + '">' +
				'<a href="javascript:void(0);">' +
					currAvailableGroupType.toUpperCase() +
				'</a>' +
			'</li>'
		);
	});
	
	// Load available compression options
	$("#tpl-input-group .tpl-input-group-compression-option-dropdown-menu").empty();
	$.each(availableCompressionOptions, function(currAvailableCompressionOptionKey, currAvailableCompressionOption) {
		$("#tpl-input-group .tpl-input-group-compression-option-dropdown-menu").append(
			'<li class="tpl-input-group-compression-option" data-value="' + currAvailableCompressionOption + '">' +
				'<a href="javascript:void(0);">' +
					currAvailableCompressionOption +
				'</a>' +
			'</li>'
		);
	});
	
	receiveData();
			
	// Add input group (bundle)
	$(".add-input-group").click(function() {
		var inputGroupID = makeInputGroupID();
		
		config.inputGroups[inputGroupID] = {
			groupType: "js",
			input: {},
			outputFile: "",
			title: "",
			autoRefresh: false,
			compressionOption: "remote"
		};
		
		saveChanges();
	});
});

$("#export-config-modal").on("show.bs.modal", function() {
	$(this).find(".config-modal-code").html(JSON.stringify(config));
});

$("#export-config-modal, #import-config-modal").on("shown.bs.modal", function() {
	$(this).find(".config-modal-code").select();
});

$("#import-config-go").click(function() {
	config = JSON.parse($("#import-config-code").val());
	saveChanges();
	$('#import-config-modal').modal('hide');
});