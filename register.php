<!DOCTYPE html>
<html lang="pt-BR">

<head>

    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <title>TerrariaCraft - Cadastro</title>

    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@300;400;600;700&display=swap"
        rel="stylesheet">

    <link rel="stylesheet" href="./css/register.css">

</head>

<body>

    <div class="bg"></div>

    <div class="register-container">

        <div class="logo">
            <h1>🎮 TERRARIACRAFT</h1>
            <p>Crie sua conta para começar a aventura</p>
        </div>

        <form id="registerForm" action="./cadastro.php" method="POST">

            <div class="form-group">

                <label>👤 Nome completo</label>

                <div class="input-wrapper">
                    <input type="text"
                           id="cdnome"
                           name="cdnome"
                           placeholder="Seu nome completo"
                           required>
                </div>
                

            </div>

            <div class="form-group">

                <label>📧 Email</label>

                <div class="input-wrapper">
                    <input type="email"
                           id="cdemail"
                           name="cdemail"
                           placeholder="seu@email.com"
                           required>
                </div>

            </div>

            <div class="form-group">

                <label>📱 Celular</label>

                <div class="input-wrapper">
                    <input type="tel"
                           id="cdcelular"
                           name="cdcelular"
                           placeholder="(00) 00000-0000">
                </div>

            </div>

            <div class="form-group">

                <label>🔒 Senha</label>

                <div class="input-wrapper">

                    <input type="password"
                           id="cdsenha"
                           name="cdsenha"
                           placeholder="Crie uma senha forte"
                           required
                           oninput="updatePasswordStrength(this.value)">

                    <button type="button"
                            class="toggle-password"
                            onclick="togglePassword()">

                        👁️

                    </button>

                </div>
                <div class="requirements">

    <div class="requirement" id="req-length">
        ⬜ Pelo menos 8 caracteres
    </div>

    <div class="requirement" id="req-uppercase">
        ⬜ Uma letra maiúscula
    </div>

    <div class="requirement" id="req-lowercase">
        ⬜ Uma letra minúscula
    </div>

    <div class="requirement" id="req-number">
        ⬜ Um número
    </div>

    <div class="requirement" id="req-special">
        ⬜ Um caractere especial
    </div>

</div>

                <div class="strength-meter">

                    <div class="strength-bar-bg">
                        <div class="strength-bar" id="strengthBar"></div>
                    </div>

                    <div class="strength-text" id="strengthText">
                        Força: -
                    </div>

                </div>

            </div>

            <button type="submit" class="btn-submit">
                📝 CADASTRAR
            </button>

        </form>

        <div class="divider">
            <span>ou</span>
        </div>

        <div class="link-login">
            Já tem conta?
            <a href="./login.php">Faça login</a>
        </div>

        <div class="back-link">
            <a href="./index_inicio.html">⬅ Voltar ao site</a>
        </div>

    </div>

<script src="./js/register.js"></script>

</body>
</html>