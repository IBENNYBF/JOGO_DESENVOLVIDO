<?php
/**
 * TerrariaCraft - Logout
 */

session_start();

// Limpar todas as variáveis de sessão
$_SESSION = array();

// Destruir o cookie de sessão
if (isset($_COOKIE[session_name()])) {
    setcookie(session_name(), '', time() - 3600, '/');
}

// Destruir a sessão
session_destroy();

header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'Logout realizado']);
?>
