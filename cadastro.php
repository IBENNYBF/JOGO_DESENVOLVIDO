<?php
session_start();

header('Content-Type: text/html; charset=utf-8');

// MOSTRAR ERROS
ini_set('display_errors', 1);
error_reporting(E_ALL);

// ==========================================
// CONEXÃO COM BANCO
// ==========================================

include_once("./viewclass/conexao_user.php");

if (!$conn_user) {
    die("Erro na conexão com o banco.");
}

mysqli_set_charset($conn_user, "utf8mb4");

// ==========================================
// VERIFICA SE VEIO DO FORMULÁRIO
// ==========================================

if ($_SERVER['REQUEST_METHOD'] != 'POST') {
    die("Acesso inválido.");
}

// ==========================================
// RECEBE DADOS DO REGISTER.PHP
// ==========================================

$nome = trim($_POST['cdnome'] ?? '');
$email = trim($_POST['cdemail'] ?? '');
$celular = trim($_POST['cdcelular'] ?? '');
$senha = trim($_POST['cdsenha'] ?? '');

// ==========================================
// VALIDAÇÕES
// ==========================================

if (empty($nome)) {
    echo "<script>
        alert('Digite seu nome.');
        window.history.back();
    </script>";
    exit;
}

if (empty($email)) {
    echo "<script>
        alert('Digite seu email.');
        window.history.back();
    </script>";
    exit;
}

if (empty($senha)) {
    echo "<script>
        alert('Digite sua senha.');
        window.history.back();
    </script>";
    exit;
}

// ==========================================
// VERIFICA EMAIL EXISTENTE
// ==========================================

$sql_verifica = "SELECT id FROM usuarios WHERE EMAIL = ?";

$stmt_verifica = mysqli_prepare($conn_user, $sql_verifica);

mysqli_stmt_bind_param($stmt_verifica, "s", $email);

mysqli_stmt_execute($stmt_verifica);

mysqli_stmt_store_result($stmt_verifica);

if (mysqli_stmt_num_rows($stmt_verifica) > 0) {

    echo "<script>
        alert('Este email já está cadastrado.');
        window.history.back();
    </script>";

    exit;
}

mysqli_stmt_close($stmt_verifica);

// ==========================================
// INSERE NO BANCO
// ==========================================

$sql = "INSERT INTO usuarios 
        (NOME, EMAIL, CELULAR, SENHA)
        VALUES (?, ?, ?, ?)";

$stmt = mysqli_prepare($conn_user, $sql);

if (!$stmt) {
    die("Erro no prepare: " . mysqli_error($conn_user));
}

mysqli_stmt_bind_param(
    $stmt,
    "ssss",
    $nome,
    $email,
    $celular,
    $senha
);

// ==========================================
// EXECUTA
// ==========================================

if (mysqli_stmt_execute($stmt)) {

    echo "<script>
        alert('Cadastro realizado com sucesso!');
        window.location.href='./login.php';
    </script>";

} else {

    echo "<script>
        alert('Erro ao cadastrar.');
        window.history.back();
    </script>";

}

mysqli_stmt_close($stmt);

mysqli_close($conn_user);
?>