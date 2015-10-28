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
			$(inputGroupDom).find(".tpl-input-group-minify").attr("data-id", currInputGroupKey);
			
			$.each(currInputGroup.input, function(currInputKey, currInput) {
				var inputDom = $("#tpl-input").clone();
				
				$(inputDom).find(".tpl-input-file").text(currInput.file);
				$(inputDom).find(".tpl-input-position").text(currInput.position);
				
				$(inputGroupDom).find(".tpl-input-group-inputs").append($(inputDom).html());
			});
			
			$("#input-groups").append($(inputGroupDom).html());
		});
		
		$(".tpl-input-group-minify").click(function() {
			var inputGroupID = $(this).attr("data-id");
			var thisBtn = this;
			
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
					
					toggleMinifyBtnStatus(thisBtn, "btn-danger", "glyphicon-remove");
				}
			});
		});
	}
});

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