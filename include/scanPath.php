<?php

if (filter_input(INPUT_GET, "action") == "do") {
	$path = filter_input(INPUT_POST, "path");
	
	print_r(preg_match('/^(?:\/|\\\\|\w:\\\\|\w:\/).*$/', $path));
}

?>

<!DOCTYPE html>
<html>
	<head>
	</head>

	<body>
		<form action="?action=do" method="POST">
			<input type="text" name="path">
			
			<button type="submit"></button>
		</form>
	</body>
</html>