var config = {};
var availableGroupTypes = ["js", "css"];
var availableCompressionOptions = ["remote", "local"];

function saveChanges() {
	$.ajax({
		url: "index.php?action=update-config",
		type: "POST",
		data: { "config": JSON.stringify(config) },
		dataType: "json",
		success: function(response) {
			console.log(response);
			receiveData();
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

function receiveData() {
	$.ajax({
		url: "index.php?action=config",
		type: "GET",
		dataType: "json",
		success: function(receivedConfig) {
			config = receivedConfig;
			console.log(config);
			
			$("#input-groups").empty();
			
			$.each(config.inputGroups, function(currInputGroupKey, currInputGroup) {
				var inputGroupDom = $("#tpl-input-group").clone();
				var dropdownID = "dropdown-" + currInputGroupKey;
				
				$(inputGroupDom).find(".input-group-id").attr("data-id", currInputGroupKey);
				
				$(inputGroupDom).find(".tpl-input-group-type-dropdown-toggle").addClass("group-type-" + currInputGroup.groupType);
				$(inputGroupDom).find(".tpl-input-group-type-dropdown-toggle").attr("id", dropdownID);
				$(inputGroupDom).find(".tpl-input-group-type-dropdown-menu").attr("aria-labelledby", dropdownID);
				
				$(inputGroupDom).find(".tpl-input-group-type").text(currInputGroup.groupType);
				$(inputGroupDom).find(".tpl-input-group-output-file").attr("value", currInputGroup.outputFile);
				$(inputGroupDom).find(".tpl-input-group-title").attr("value", currInputGroup.title);
				
				// Place inputs
				$.each(currInputGroup.input, function(currInputKey, currInput) {
					var inputDom = $("#tpl-input").clone();
					
					$(inputDom).find(".input-id").attr("data-id", currInputKey);
					
					$(inputDom).find(".tpl-input-file").attr("value", currInput.file);
					$(inputDom).find(".tpl-input-position").text(currInput.position);
					
					$(inputGroupDom).find(".tpl-input-group-inputs").append($(inputDom).html());
				});
				
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
				
				$("#input-groups").append($(inputGroupDom).html());
			});
			
			$('.dropdown-toggle').dropdown();
			
			// Btn Minify
			$(".tpl-input-group-minify").click(function() {
				var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
				var thisBtn = this;
				
				if (config.inputGroups[inputGroupID].outputFile != "") {
					$(this).find(".tpl-input-group-minify-icon").addClass("spin");
					
					$.ajax({
						url: "index.php?action=minify",
						data: {"inputGroupID": inputGroupID},
						type: "POST",
						dataType: "json",
						success: function(response) {
							console.log(response);
							
							toggleMinifyBtnStatus(thisBtn, "btn-success", "glyphicon-ok");
						},
						error: function(response) {
							console.log(response);
							
							$.toaster({ 
								priority : 'danger',
								title : 'Error', 
								message : response.responseJSON.response
							});
							
							toggleMinifyBtnStatus(thisBtn, "btn-danger", "glyphicon-remove");
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
		}
	});
}

function toggleMinifyBtnStatus(btn, btnClass, iconClass) {
	var defaultBtnClass = "btn-primary";
	var defaultIconClass = "glyphicon-refresh";
	
	$(btn).toggleClass(defaultBtnClass + " " + btnClass);
	$(btn).find(".tpl-input-group-minify-icon").removeClass("spin");
	$(btn).find(".tpl-input-group-minify-icon").toggleClass(defaultIconClass + " " + iconClass);
	
	setTimeout(function() {
		$(btn).toggleClass(defaultBtnClass + " " + btnClass);
		$(btn).find(".tpl-input-group-minify-icon").toggleClass(defaultIconClass + " " + iconClass);
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
			autoRefresh: 0,
			compressionOption: "remote"
		};
		
		saveChanges();
	});
});