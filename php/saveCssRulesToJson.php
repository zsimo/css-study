<?php



header('Content-type: application/json');
 echo '{';

	$test = $_REQUEST['test'];


    $fh = fopen("../cssRules.json", 'w');
    fwrite($fh, $_REQUEST['cssRules']);
    fclose($fh);

//    echo '"test" : "'.$_REQUEST['cssRules'].'",';

    echo '"test" : "json saved",';


 echo '"last": ""';

 echo '}';






?>









