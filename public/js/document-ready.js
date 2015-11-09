$(document).ready(function() {
	// Load available group types
	$("#tpl-bundle .tpl-input-group-type-dropdown-menu").empty();
	$.each(availableGroupTypes, function(currAvailableGroupTypeKey, currAvailableGroupType) {
		$("#tpl-bundle .tpl-input-group-type-dropdown-menu").append(
			'<li class="tpl-input-group-type-dropdown-option" data-value="' + currAvailableGroupType + '">' +
				'<a href="javascript:void(0);">' +
					currAvailableGroupType.toUpperCase() +
				'</a>' +
			'</li>'
		);
	});
	
	// Load available compression options
	$("#tpl-bundle .tpl-input-group-compression-option-dropdown-menu").empty();
	$.each(availableCompressionOptions, function(currAvailableCompressionOptionKey, currAvailableCompressionOption) {
		$("#tpl-bundle .tpl-input-group-compression-option-dropdown-menu").append(
			'<li class="tpl-input-group-compression-option" data-value="' + currAvailableCompressionOption + '">' +
				'<a href="javascript:void(0);">' +
					currAvailableCompressionOption +
				'</a>' +
			'</li>'
		);
	});
	
	receiveData();
	
});

/* Modal */

$(".config-modal").on("shown.bs.modal", function() {
	$(this).find(".config-modal-code").select();
});

// Export whole config
$("#export-config-modal").on("show.bs.modal", function() {
	$(this).find(".config-modal-code").html(JSON.stringify(config));
});

// Export config of current project
$("#export-project-modal").on("show.bs.modal", function(event) {
	var button = $(event.relatedTarget);
	var projectID = button.closest(".project-id").attr("data-id");
	
	$(this).find(".config-modal-code").html(JSON.stringify(config.projects[projectID]));
});

// Set project ID to 'Start import' button as an attribute
$("#import-project-modal").on("show.bs.modal", function(event) {
	var button = $(event.relatedTarget);
	var projectID = button.closest(".project-id").attr("data-id");
	
	$("#import-project-go").attr("data-project-id", projectID);
});

/* Modal ENDE */

// Import and replace the whole config
$("#import-config-go").click(function() {
	config = JSON.parse($("#import-config-code").val());
	saveChanges();
	$('#import-config-modal').modal('hide');
});

// Import and replace the config of the current project
$("#import-project-go").click(function() {
	var projectID = $(this).attr("data-project-id");
	config.projects[projectID] = JSON.parse($("#import-project-code").val());
	saveChanges();
	$('#import-project-modal').modal('hide');	
});