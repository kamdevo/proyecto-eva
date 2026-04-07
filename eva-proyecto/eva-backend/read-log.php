<?php
$f = __DIR__ . '/storage/logs/laravel.log';
$size = filesize($f);
$fp = fopen($f, 'r');
fseek($fp, max(0, $size - 6000));
echo fread($fp, 6000);
fclose($fp);
