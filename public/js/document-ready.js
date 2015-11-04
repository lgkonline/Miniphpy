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