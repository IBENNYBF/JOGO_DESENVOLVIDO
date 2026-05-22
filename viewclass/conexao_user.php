<?php

$host = "localhost";
$usuario = "root";
$senha = "";
$banco = "jogo_terraria";

$conn_user = mysqli_connect(
    $host,
    $usuario,
    $senha,
    $banco
);

if (!$conn_user) {
    die("Erro ao conectar.");
}

?>