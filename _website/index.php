<?php

define("DEBUG_MODE", false);

function getLatestTagUrl($repository, $default = 'master') {
    $file = @json_decode(@file_get_contents("https://api.github.com/repos/$repository/tags", false,
        stream_context_create(['http' => ['header' => "User-Agent: Vestibulum\r\n"]])
    ));
    return sprintf("https://github.com/$repository/archive/%s.zip", $file ? reset($file)->name : $default);
}

?>

<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<meta http-equiv="X-UA-Compatible" content="IE=edge">
		<meta name="viewport" content="width=device-width, initial-scale=1, user-scalable=no">
		<title>Miniphpy</title>
		
		<link rel="icon" type="image/png" href="images/logo-icon-only.png">
		
		<?php if (DEBUG_MODE == true) : ?>
			<link href='https://fonts.googleapis.com/css?family=Lato:400,300,700' rel='stylesheet' type='text/css'>
			<link rel="stylesheet" href="css/website.css">
		<?php else : ?>
			<link rel="stylesheet" href="css/minified.css">
		<?php endif; ?>		
	</head>

	<body>
		<header id="header">
			<div class="container">
				<a href="public" class="miniphpy-logo">
					<img src="images/logo.svg" alt="Miniphpy" onerror="this.onerror=null; this.src='images/logo.png'">
				</a>
			</div>
		</header>
		
		<section id="jumbotron" class="jumbotron">
			<div class="container">
				<div class="row">
					<div class="col-md-6">
						<img src="images/screenshot.png" alt="Screenshot" class="img-responsive">
					</div>	
					
					<div class="col-md-6">
						<h1>
							The easy way<br>
							<small>to combine and compress JavaScript and CSS</small>
						</h1>
					</div>
				</div>
			</div>
		</section>
		
		<main id="main">
			<div class="container">
				<div id="loading" class="sk-folding-cube">
					<div class="sk-cube1 sk-cube"></div>
					<div class="sk-cube2 sk-cube"></div>
					<div class="sk-cube4 sk-cube"></div>
					<div class="sk-cube3 sk-cube"></div>
				</div>
				
				<div class="row">
					<div class="col-md-4"></div>
					<div class="col-md-4">
						<a href="<?php echo getLatestTagUrl("lgkonline/miniphpy"); ?>" class="btn btn-primary btn-lg center-block">
							<span class="glyphicon glyphicon-arrow-down"></span>
							Download the latest release
						</a>						
					</div>
					<div class="col-md-4"></div>
				</div>
				
				<br><br>
				
				<div class="row">
					<div class="col-md-2"></div>
					<div class="col-md-8">
						<p>
							Miniphpy is a small tool for web developers to minify JavaScript and CSS files for their projects.<br>
							You can combine multiple files to bundles. Click "Minify" and Miniphpy will put your files together and compress them.
						</p>
						<p>
							Miniphpy is a PHP application and is designed to run on your developer PC. So to make it work, you need to have Apache installed.					
						</p>						
					</div>
					<div class="col-md-2"></div>
				</div>		
				
			</div>
		</main>
		
		<footer id="footer">
			<div class="container">
				<div class="row">
					<div class="col-md-4">
						<a href="http://github.com/lgkonline/miniphpy" target="_blank" class="btn btn-default btn-sm btn-outline">
							<span class="glyphicon glyphicon-globe"></span>
							Find Miniphpy on GitHub
						</a>
					</div>
					
					<div class="col-md-4" style="text-align: center;">
						<a href="http://twitter.com/lgkonline" target="_blank" class="btn btn-primary btn-sm btn-outline">
							Follow me on Twitter: @lgkonline
						</a>
					</div>
					
					<div class="col-md-4">
						<a href="http://lgk.io" target="_blank" class="lgk-logo pull-right">
							<img src="http://lib.lgkonline.com/logo.png" alt="LGK">
						</a>
					</div>
				</div>
			</div>
		</footer>
		<?php if (DEBUG_MODE == true) : ?>
			<script src="//code.jquery.com/jquery-1.11.0.min.js" type="text/javascript"></script>
			<script src="../public/lib/bootstrap/js/bootstrap.js"></script>
			<script src="js/website.js"></script>
		<?php else : ?>
			<script src="js/minified.js"></script>
		<?php endif; ?>
	</body>
</html>