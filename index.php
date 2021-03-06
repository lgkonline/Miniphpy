<?php

define("DEBUG_MODE", true);
define("APP_VERSION", "1.5.1");

require "classes/UserConfig.php";
require "classes/LittleHelpers.php";

$action_get = filter_input(INPUT_GET, "action");
$action_post = filter_input(INPUT_POST, "action");

if ($action_get || $action_post) {
	include "include/action.php";
}

include "public/views/head.html";
include "public/views/templates.html";
include "public/views/content.html";
include "public/views/modals.html";
include "public/views/foot.html";
