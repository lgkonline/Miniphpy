$.ajax({
	url: "index.php?action=check-version",
	type: "GET",
	dataType: "json",
	success: function(data) {
		if (!data.isLatestVersion) {
			$.toaster({ 
				priority : 'info',
				title : 'Info', 
				message : data.text
			});			
		}
	}
});