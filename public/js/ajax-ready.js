function ajaxReady() {
    // Check if config version is okay. Else it will get updated
    configCompatibilityTool(config);

	// Read active tab from cookie and mark it
	var activeProject = getCookie("activeProject");
	if (activeProject != "" && (typeof config.projects[activeProject] != "undefined" || config.projects[activeProject] != null)) {
		$(".project-tab-link[data-project-id='" + activeProject + "']").tab("show");
	}
	else {
		$("#project-tabs > li:first-child .project-tab-link").tab("show");
	}

	$(".project-tab-link").on("show.bs.tab", function() {
		var projectID = $(this).attr("data-project-id");
		setCookie("activeProject", projectID, 365);
	});

	$(".dropdown-toggle").dropdown();

	// Btn Minify
	$(".tpl-input-group-minify").click(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
		var minifyBtn = this;
		minify(projectID, inputGroupID, minifyBtn);
	});

	// Btn Add input
	$(".tpl-input-group-add").click(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
		var inputID = makeInputID(projectID, inputGroupID);

		config.projects[projectID].bundles[inputGroupID].inputs[inputID] = {
			file: ""
		};

		saveChanges();
	});

	// Btn Remove input
	$(".tpl-input-remove").click(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
		var inputID = $(this).closest(".input-id").attr("data-id");

		delete config.projects[projectID].bundles[inputGroupID].inputs[inputID];

		saveChanges();
	});

	// Changed input
	$(".tpl-input-file").on("keypress focusout", function(e) {
		if (e.type == "focusout" || e.type == "keypress" && e.which == 13) {
			var projectID = $(this).closest(".project-id").attr("data-id");
			var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
			var inputID = $(this).closest(".input-id").attr("data-id");
			var file = $(this).val();

			config.projects[projectID].bundles[inputGroupID].inputs[inputID].file = file;

			saveChanges();
		}
	});

	// Toggle textarea for input files
	$(".tpl-input-group-edit").click(function() {
		$(this).closest(".input-group-id").find(".tpl-input-group-inputs-textarea ").toggle();
		$(this).closest(".input-group-id").find(".list-group").toggle();

		$(this).toggleClass("active");
	});

	// Changed input textarea
	$(".tpl-input-group-inputs-textarea").focusout(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var inputGroupID = $(this).closest(".input-group-id").attr("data-id");

		var inputFiles = $(this).val().split("\n");
		var input = {};

		var i = 0;

		$.each(inputFiles, function(currInputFileKey, currInputFile) {
			if (currInputFile != "") {
				// Is script HTML tag
				if (/<[script][\s\S]*>/i.test(currInputFile)) {
					// Take input file from src attribute
					currInputFile = $(currInputFile).attr("src");
				}
				// Is link HTML tag
				else if (/<[link][\s\S]*>/i.test(currInputFile)) {
					// Take input file from href attribute
					currInputFile = $(currInputFile).attr("href");
				}

				i++;
				input[i] = {
					file: currInputFile,
					position: i
				};
			}
		});

		config.projects[projectID].bundles[inputGroupID].inputs = input;
		saveChanges();
	});

	// Changed group output file
	$(".tpl-input-group-output-file").on("keypress focusout", function(e) {
		if (e.type == "focusout" || e.type == "keypress" && e.which == 13) {
			var projectID = $(this).closest(".project-id").attr("data-id");
			var inputGroupID = $(this).closest(".input-group-id").attr("data-id");

			config.projects[projectID].bundles[inputGroupID].outputFile = $(this).val();

			saveChanges();
		}
	});

	// Changed bundle title
	$(".tpl-input-group-title").on("keypress focusout", function(e) {
		if (e.type == "focusout" || e.type == "keypress" && e.which == 13) {
			var projectID = $(this).closest(".project-id").attr("data-id");
			var inputGroupID = $(this).closest(".input-group-id").attr("data-id");

			config.projects[projectID].bundles[inputGroupID].title = $(this).val();

			saveChanges();
		}
	});

	// Remove group
	$(".tpl-input-group-remove").click(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var inputGroupID = $(this).closest(".input-group-id").attr("data-id");

		delete config.projects[projectID].bundles[inputGroupID];

		saveChanges();
	});

	// Change input group type
	$(".tpl-input-group-type-dropdown-option").click(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var inputGroupID = $(this).closest(".input-group-id").attr("data-id");

		config.projects[projectID].bundles[inputGroupID].dataType = $(this).attr("data-value");

		saveChanges();
	});

	// Change compression option
	$(".tpl-input-group-compression-option:not(.active)").click(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
		config.projects[projectID].bundles[inputGroupID].compressionOption = $(this).attr("data-value");
		saveChanges();
	});

	// Toggle auto refresh
	$(".tpl-input-group-toggle-auto-refresh").click(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var inputGroupID = $(this).closest(".input-group-id").attr("data-id");
		var restart = false;

		if (config.projects[projectID].bundles[inputGroupID].autoRefresh == true) {
			config.projects[projectID].bundles[inputGroupID].autoRefresh = false;
			console.log("clear it");
			restart = true;
		}
		else {
			config.projects[projectID].bundles[inputGroupID].autoRefresh = true;
		}

		saveChanges(restart);
	});

	// Change root path
	$(".tpl-bundle-root-path").on("keypress focusout", function(e) {
		if (e.type == "focusout" || e.type == "keypress" && e.which == 13) {
			var projectID = $(this).closest(".project-id").attr("data-id");
			var inputGroupID = $(this).closest(".input-group-id").attr("data-id");

			config.projects[projectID].bundles[inputGroupID].rootPath = $(this).val();
			saveChanges();
		}
	});

	// Add input group (bundle)
	$(".add-input-group").click(function() {
		var projectID = $(this).closest(".project-id").attr("data-id");
		var bundleID = makeBundleID(projectID);

		config.projects[projectID].bundles[bundleID] = {
			dataType: "js",
			inputs: {},
			outputFile: "",
			title: "",
			autoRefresh: false,
			compressionOption: "remote",
			rootPath: config.projects[projectID].rootPath
		};

		saveChanges();
	});

	// Add project
    function addProject(returnVal, external, projectObj) {
        if (!isSet(external)) {
            external = false;
        }
        
        if (!isSet(projectObj)) {
            projectObj = {
                title: "New project",
                rootPath: "./",
                bundles: {},
                external: external
            };
        }
        
		var projectID = makeProjectID();

		config.projects[projectID] = projectObj;
        
		setCookie("activeProject", projectID, 365);
        
        if (isSet(returnVal)) {
            console.log("bla");
            
            if (returnVal == "projectID") {
                return projectID;
            }
            if (returnVal == "project") {
                return config.projects[projectID];
            }
        }
    }
    
	$(".add-project").click(function() {
        addProject();
		saveChanges();
	});

	// Remove project
	$("#delete-project-go").click(function() {
		var projectID = $(this).attr("data-project-id");
        
        if (isSet(config.projects[projectID].external) && config.projects[projectID].external) {
            delete config.externalProjects[config.projects[projectID].externalProjectID];
        }

		delete config.projects[projectID];
		saveChanges();
		$("#delete-project-modal").modal("hide");
	});

	// Remove project warning
	$("#delete-project-modal").on("show.bs.modal", function(event) {
		var button = $(event.relatedTarget);
		var projectID = button.closest(".project-id").attr("data-id");
		$("#delete-project-go").attr("data-project-id", projectID);
	});

	// Toggle rename project
	$(".edit-project-title-btn").click(function() {
		$(this).toggleClass("active");
		$(this).closest(".project-id").find(".edit-project-title-input").toggle();
		$(this).closest(".project-id").find(".edit-project-title-input").select();
	});

	// Rename project
	$(".edit-project-title-input").on("keypress focusout", function(e) {
		if (e.type == "focusout" || e.type == "keypress" && e.which == 13) {
			var projectID = $(this).closest(".project-id").attr("data-id");

			config.projects[projectID].title = $(this).val();
			saveChanges();
		}
	});
    
    // Change project root path
	$(".project-root-path").on("keypress focusout", function(e) {
		if (e.type == "focusout" || e.type == "keypress" && e.which == 13) {
			var projectID = $(this).closest(".project-id").attr("data-id");

			config.projects[projectID].rootPath = $(this).val();
			saveChanges();
		}
	});

	// On dblclick project tab toggle rename
	$("#project-tabs > li").dblclick(function() {
		var projectID = $(this).find(".project-tab-link").attr("data-project-id");
		$("#project-" + projectID).find(".edit-project-title-btn").click();
	});
    
    // Adding an external config file
    $("#add-ext-config-form").submit(function(e) {
        var projectID;
        var existingProject = $("#add-ext-config-existing").is(":checked");
        
        e.preventDefault();
        var configPath = $("#add-ext-config-path").val();
        
        if (existingProject) {
            $.ajax({
                url: "index.php?action=ext-config",
                data: {configPath: configPath },
                type: "GET",
                dataType: "json",
                success: function(receivedProject) {
                    console.log(receivedProject);
                    projectID = addProject("projectID", true, receivedProject);
                    
                    addExtProject(configPath, projectID);
                }
            });
        }
        else {
            projectID = addProject("projectID", true)
            addExtProject(configPath, projectID);
        }
    });
    
    $("#add-ext-config-modal").on("shown.bs.modal", function() {
        $("#add-ext-config-path").select();
    });
}

function addExtProject(configPath, projectID) {
    config.externalProjects[makeExtProjectID()] = {
        configPath: configPath,
        projectID: projectID,
    };
    
    saveChanges(true, config);
}