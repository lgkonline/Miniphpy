$.ajax({
	url: "index.php?action=config",
	type: "GET",
	dataType: "json",
	success: function(config) {
		console.log(config);
		
		$("#input-groups").empty();
		
		$.each(config.inputGroups, function(currInputGroupKey, currInputGroup) {
			var inputGroupDom = $("#tpl-input-group").clone();
			
			$(inputGroupDom).find(".tpl-input-group-type").text(currInputGroup.groupType);
			$(inputGroupDom).find(".tpl-input-group-output-file").text(currInputGroup.outputFile);
			
			$.each(currInputGroup.input, function(currInputKey, currInput) {
				var inputDom = $("#tpl-input").clone();
				
				$(inputDom).find(".tpl-input-file").text(currInput.file);
				$(inputDom).find(".tpl-input-position").text(currInput.position);
				
				$(inputGroupDom).find(".tpl-input-group-inputs").append($(inputDom).html());
			});
			
			$("#input-groups").append($(inputGroupDom).html());
		});
	}
});