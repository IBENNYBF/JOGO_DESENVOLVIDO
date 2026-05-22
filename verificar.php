<?php
session_start();

include_once("./viewclass/conexao_user.php");

// Habilitar erros apenas para debug
// ini_set('display_errors', 1);
// error_reporting(E_ALL);

if (isset($_POST['email']) && isset($_POST['senha'])) {
    
    // Sanitização básica
    $email = mysqli_real_escape_string($conn_user, $_POST['email']);
    $senha = mysqli_real_escape_string($conn_user, $_POST['senha']);

    // QUERY
    $sql = "SELECT * FROM usuarios 
            WHERE EMAIL = ? AND SENHA = ? 
            LIMIT 1";

    $stmt = mysqli_prepare($conn_user, $sql);

    mysqli_stmt_bind_param($stmt, "ss", $email, $senha);

    mysqli_stmt_execute($stmt);

    $result = mysqli_stmt_get_result($stmt);

    if ($result && mysqli_num_rows($result) > 0) {

        $usuario = mysqli_fetch_assoc($result);

        mysqli_stmt_close($stmt);

        // SESSÃO
        $_SESSION['usuario_id'] = $usuario['id'];
        $_SESSION['usuario_nome'] = $usuario['NOME'];
        $_SESSION['usuario_email'] = $usuario['EMAIL'];

        // REDIRECIONA
        header("Location: ./jogo.php");
        exit;

    } else {

        mysqli_stmt_close($stmt);

        echo "

        <body onload='alertaErro()'>

        <script>

        function alertaErro(){

            Swal.fire({
                icon: 'error',
                title: 'Dados Inválidos...',
                text: 'Email ou senha incorretos',
                footer: '<a href=\"register.php\">Cadastre-se</a>'
            });

        }

        </script>

        <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>

        </body>

        ";

        exit;
    }

} else {

    header('Location: ./login.php');
    exit;
}
?>