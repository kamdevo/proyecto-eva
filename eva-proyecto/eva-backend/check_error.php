<?php
$ch = curl_init('http://api.eva2.huv.gov.co/api/v1/tickets/20221/enviar-cierre');
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, 'reparacion=test');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
$res = curl_exec($ch);
file_put_contents('full_error.json', $res);
echo "Result saved to full_error.json\n";
?>
