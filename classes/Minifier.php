<?php

class Minifier {
	private $urlJS = "http://javascript-minifier.com/raw";
	private $urlCSS = "http://cssminifier.com/raw";
	
	public function minify($format, $content, $compression_option = "remote") {
		if ($format == "js") {
			if ($compression_option == "remote") {
				return $this->getMinified($this->urlJS, $content); // remote compression
			}
			else {
				require "vendor/JShrink/Minifier.php";
				return \JShrink\Minifier::minify($content); // local compression
			}
		}
		if ($format == "css") {
			if ($compression_option == "remote") {
				return $this->getMinified($this->urlCSS, $content);	 // remote compression
			}
			else {
				require "vendor/cssmin/cssmin-v3.0.1-minified.php";
				return CssMin::minify($content);	// local compression
			}
		}
	}
	
	private function getMinified($url, $content) {
		$postdata = array('http' => array(
	        'method'  => 'POST',
	        'header'  => 'Content-type: application/x-www-form-urlencoded',
	        'content' => http_build_query( array('input' => $content) ) ) );
		return file_get_contents($url, false, stream_context_create($postdata));
	}	
}