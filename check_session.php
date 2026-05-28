<?php
/**
 * TerrariaCraft - Verificação de Sessão (Adaptado)
 */

session_start();
header('Content-Type: application/json');

// Em vez de procurar por 'logged_in', verificamos se o 'usuario_id' do verificar.php existe
if (isset($_SESSION['usuario_id'])) {

    // Se o ID existe na sessão, significa que o utilizador está logado com sucesso!
    echo json_encode([
        'logged_in'  => true,
        'user_id'    => $_SESSION['usuario_id'],
        'user_name'  => $_SESSION['usuario_nome'],
        'user_email' => $_SESSION['usuario_email'],
        'user_foto'  => $_SESSION['usuario_foto'] ?? 'default.png', // Fallback caso não exista foto
        'user_acesso'=> $_SESSION['usuario_acesso'] ?? 'user'      // Fallback caso não exista nível
    ]);

} else {
    // Se não encontrar o 'usuario_id', a sessão não existe ou caiu
    echo json_encode(['logged_in' => false]);
}
?>