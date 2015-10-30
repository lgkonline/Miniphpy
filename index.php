<?php

define("DEBUG_MODE", false);

require "classes/UserConfig.php";

$action_get = filter_input(INPUT_GET, "action");
$action_post = filter_input(INPUT_POST, "action");

if ($action_get || $action_post) {
	include "include/action.php";
}

include "public/views/index.html";