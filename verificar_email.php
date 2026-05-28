<?php
session_start();

// Agora o conexao_user.php está na MESMA pasta (viewclass)
include_once("conexao_user.php");

ini_set('display_errors', 1);
error_reporting(E_ALL);

if ($_SERVER['REQUEST_METHOD'] === 'POST' && !empty($_POST['cdemail'])) {
    $email = mysqli_real_escape_string($conn_user, $_POST['cdemail']);

    // Verifica se o e-mail existe
    $sql = "SELECT ID FROM usuarios WHERE EMAIL = '$email' LIMIT 1";
    $result = mysqli_query($conn_user, $sql);

    if (mysqli_num_rows($result) > 0) {
        $codigo = mt_rand(100000, 999999);
        $codigoemail = $codigo; // para exibir no popup

        // Salva o código na coluna RECUPERAR
        $update_sql = "UPDATE usuarios SET RECUPERAR = '$codigo' WHERE EMAIL = '$email'";

        if (mysqli_query($conn_user, $update_sql)) {
            // Caminhos absolutos a partir da raiz do site (ajuste se necessário)
            // Supondo que a pasta 'pmce' esteja na raiz do site (mesmo nível de 'viewclass')
            require($_SERVER['DOCUMENT_ROOT'] . "/pmce/PHPMailer-master/src/PHPMailer.php");
            require($_SERVER['DOCUMENT_ROOT'] . "/pmce/PHPMailer-master/src/SMTP.php");

            $mail = new PHPMailer\PHPMailer\PHPMailer();
            $mail->IsSMTP();
            $mail->SMTPAuth = true;
            $mail->SMTPSecure = 'ssl';
            $mail->Host = "smtp.titan.email";
            $mail->Port = 465;
            $mail->IsHTML(true);
            $mail->Username = "servsolutiontech@servsolutiontech.com";
            $mail->Password = "kilpol@25";
            $mail->SetFrom("servsolutiontech@servsolutiontech.com", "Sistemas Internos");
            $mail->Subject = "Renovar Senha - Sistemas Internos";
            $mail->Body = "Bem-vindo! De volta, <br>Utilize este código para renovar sua senha:<br><strong style='font-size:24px;letter-spacing:4px;'>$codigo</strong><br>Liberação dos módulos pelo administrador.<br>Suporte: 2° Sgt Henrique Aux Adm";
            $mail->AddAddress($email);
            $mail->AddBCC("servsolution.suporte@gmail.com");

            if ($mail->Send()) {
                // Sucesso: exibe código e redireciona para update_senha.php (que está na raiz)
                echo "
                <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
                <script>
                    window.onload = function() {
                        Swal.fire({
                            title: 'E-mail Verificado!',
                            html: 'Seu código de recuperação é: <br><br>' +
                                  '<div id=\"copy-box\" onclick=\"copyToClipboard()\" style=\"cursor:pointer; background:#f8fafc; padding:20px; border-radius:15px; border:2px dashed #10b981; font-size:32px; font-weight:800; letter-spacing:8px; color:#065f46; transition: all 0.3s;\" onmouseover=\"this.style.backgroundColor=\\'#f0fdf4\\'\" onmouseout=\"this.style.backgroundColor=\\'#f8fafc\\'\">' +
                                  '$codigoemail</div><br>' +
                                  '<p id=\"copy-hint\" style=\"font-size:11px; color:#64748b; font-weight:bold; text-transform:uppercase;\">Clique no código acima para copiar</p>',
                            icon: 'success',
                            confirmButtonText: 'VOLTAR E INSERIR CÓDIGO',
                            confirmButtonColor: '#10b981',
                            allowOutsideClick: false
                        }).then((result) => {
                            window.location.href = '../update_senha.php';
                        });
                    };

                    function copyToClipboard() {
                        navigator.clipboard.writeText('$codigoemail').then(() => {
                            const hint = document.getElementById('copy-hint');
                            hint.innerText = '✓ COPIADO COM SUCESSO!';
                            hint.style.color = '#10b981';
                            setTimeout(() => {
                                hint.innerText = 'Clique no código acima para copiar';
                                hint.style.color = '#64748b';
                            }, 2000);
                        });
                    }
                </script>";
            } else {
                // Erro no envio – mostra detalhes
                $erro_msg = addslashes($mail->ErrorInfo);
                echo "
                <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
                <script>
                    window.onload = function() {
                        Swal.fire({
                            title: 'Erro no envio',
                            html: 'Não foi possível enviar o e-mail.<br><br>Detalhes: <strong>$erro_msg</strong><br><br>Entre em contato com o suporte.',
                            icon: 'error',
                            confirmButtonText: 'Voltar'
                        }).then(() => { window.history.back(); });
                    };
                </script>";
            }
        } else {
            echo "
            <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
            <script>
                window.onload = function() {
                    Swal.fire({ title: 'Erro!', text: 'Erro ao gerar código no banco.', icon: 'error' }).then(() => { window.history.back(); });
                };
            </script>";
        }
    } else {
        echo "
        <script src='https://cdn.jsdelivr.net/npm/sweetalert2@11'></script>
        <script>
            window.onload = function() {
                Swal.fire({ title: 'Não encontrado', text: 'Este e-mail não existe no cadastro.', icon: 'warning' }).then(() => { window.history.back(); });
            };
        </script>";
    }
} else {
    // Se não for POST ou email vazio, redireciona para a página de recuperação (na raiz)
    header("Location: ../update_senha.php");
    exit;
}
?>