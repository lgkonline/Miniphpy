<?php

class Minifier {
	private $urlJS = "http://javascript-minifier.com/raw";
	private $urlCSS = "http://cssminifier.com/raw";
	
	public function minify($format, $content) {
		if ($format = "js") {
			return $this->minifyJS($content);
		}
		if ($format = "css") {
			return $this->minifyCSS($content);
		}
	}
	
	public function minifyJS($js) {
		return $this->getMinified($this->urlJS, $js);		
	}
	
	public function minifyCSS($css) {
		return $this->getMinified($this->urlCSS, $css);
	}
	
	private function getMinified($url, $content) {
		$postdata = array('http' => array(
	        'method'  => 'POST',
	        'header'  => 'Content-type: application/x-www-form-urlencoded',
	        'content' => http_build_query( array('input' => $content) ) ) );
		return file_get_contents($url, false, stream_context_create($postdata));
	}	
}