$(document).ready(function() {
	$("#loading").hide();
});

$.ajax({
	url: "index.php?action=github-info",
	type: "GET",
	dataType: "json",
	success: function(data) {
		console.log(data);
		$("#download-btn").animate({
			opacity: 1
		});
		$("#download-btn").attr("href", data.downloadUrl);
		$("#download-version").text("(" + data.version + ")");
	}
});