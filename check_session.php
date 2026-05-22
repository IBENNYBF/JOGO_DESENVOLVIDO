<?php
/**
 * TerrariaCraft - Verificação de Sessão
 */

session_start();
header('Content-Type: application/json');

if (isset($_SESSION['logged_in']) && $_SESSION['logged_in'] === true) {
    // Verificar se sessão não expirou (24 horas)
    if (isset($_SESSION['login_time']) && (time() - $_SESSION['login_time']) > 86400) {
        session_destroy();
        echo json_encode(['logged_in' => false]);
        exit;
    }

    echo json_encode([
        'logged_in' => true,
        'user_id' => $_SESSION['user_id'],
        'user_name' => $_SESSION['user_name'],
        'user_email' => $_SESSION['user_email'],
        'user_foto' => $_SESSION['user_foto'],
        'user_acesso' => $_SESSION['user_acesso']
    ]);
} else {
    echo json_encode(['logged_in' => false]);
}
?>
