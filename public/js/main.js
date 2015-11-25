var config = {};
var availableGroupTypes = ["js", "css"];
var availableCompressionOptions = ["remote", "local"];
var timer;

function receiveData() {
	startLoading();

	$.ajax({
		url: "index.php?action=config",
		type: "GET",
		dataType: "json",
		success: function(receivedConfig) {
			endLoading();

			config = receivedConfig;
			var countBundles = 0;

			$("#projects, #project-tabs").empty();

			$.each(config.projects, function(currProjectKey, currProject) {
				var projectDomID = "project-" + currProjectKey;

				var projectTabDom = $("#tpl-project-tab").clone();
				$(projectTabDom).find(".project-tab-link").attr("href", "#" + projectDomID);
				$(projectTabDom).find(".project-tab-link").attr("aria-controls", projectDomID);
				$(projectTabDom).find(".project-tab-link").attr("data-project-id", currProjectKey);
				$(projectTabDom).find(".project-tab-link").html(currProject.title);
				$("#project-tabs").append($(projectTabDom).html());

				var projectDom = $("#tpl-project").clone();
				$(projectDom).find(".project-id").attr("data-id", currProjectKey);
				$(projectDom).find(".project-id").attr("id", projectDomID);

				$(projectDom).find(".edit-project-title-input").attr("value", currProject.title);

				$(projectDom).find(".bundles").empty();
				$.each(currProject.bundles, function(currBundleKey, currBundle) {
					countBundles++;

					var bundleDom = $("#tpl-bundle").clone();
					var dropdownID = "dropdown-" + currProjectKey + "-" + currBundleKey;

					$(bundleDom).find(".input-group-id").attr("data-id", currBundleKey);

					$(bundleDom).find(".tpl-input-group-type-dropdown-toggle").addClass("group-type-" + currBundle.dataType);
					$(bundleDom).find(".tpl-input-group-type-dropdown-toggle").attr("id", dropdownID);
					$(bundleDom).find(".tpl-input-group-type-dropdown-menu").attr("aria-labelledby", dropdownID);

					$(bundleDom).find(".tpl-input-group-type").text(currBundle.dataType);
					$(bundleDom).find(".tpl-input-group-output-file").attr("value", currBundle.outputFile);
					$(bundleDom).find(".tpl-input-group-title").attr("value", currBundle.title);

					$(bundleDom).find(".tpl-bundle-root-path").attr("value", currBundle.rootPath);

					var countInputs = 0;

					$(bundleDom).find(".tpl-input-group-inputs").empty();

					// Place inputs
					$.each(currBundle.inputs, function(currInputKey, currInput) {
						countInputs++;

						var inputDom = $("#tpl-input").clone();

						$(inputDom).find(".input-id").attr("data-id", currInputKey);

						$(inputDom).find(".tpl-input-file").attr("id", "input-file-" + currProjectKey + "-" + currBundleKey + "-" + currInputKey);
						$(inputDom).find(".tpl-input-file").attr("value", currInput.file);
						$(inputDom).find(".tpl-input-position").text(currInput.position);

						$(bundleDom).find(".tpl-input-group-inputs").append($(inputDom).html());

						$(bundleDom).find(".tpl-input-group-inputs-textarea").append(currInput.file + "\n");
					});

					if (countInputs == 0) {
						var noInputsDom = $("#tpl-no-inputs").clone();
						$(bundleDom).find(".tpl-input-group-inputs").html($(noInputsDom).html());
					}

					// Remove current group type as a option from dropdown
					$(bundleDom).find(".tpl-input-group-type-dropdown-option").each(function() {
						if ($(this).attr("data-value") == currBundle.dataType) {
							$(this).remove();
						}
					});

					// Mark active compression option
					$(bundleDom).find(".tpl-input-group-compression-option").each(function() {
						if ($(this).attr("data-value") == currBundle.compressionOption) {
							$(this).addClass("active");
						}
					});

					// Mark auto refresh btn
					if (currBundle.autoRefresh == true) {
						$(bundleDom).find(".tpl-input-group-toggle-auto-refresh").addClass("btn-primary-reverse");
					}
					else {
						$(bundleDom).find(".tpl-input-group-toggle-auto-refresh").addClass("btn-default-reverse");
					}

					$(projectDom).find(".bundles").append($(bundleDom).html());

					if (currBundle.autoRefresh == true) {
						minify(currProjectKey, currBundleKey, ".input-group-id[data-id='" + currBundleKey + "'] .tpl-input-group-minify", true);
					}
				}); // end of each inputGroup

				if (countBundles == 0) {
					$(projectDom).find(".bundles").empty();
					var noBundlesDom = $("#tpl-no-bundles").clone();
					$(projectDom).find(".bundles").html($(noBundlesDom).html());
				}

				$("#projects").append($(projectDom).html());
			}); // each project

			// Out sourced to ajax-ready.js
			ajaxReady();

		} // end of success function
	}); // end of ajax
} // end of receiveData()
