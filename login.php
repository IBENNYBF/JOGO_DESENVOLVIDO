<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TerrariaCraft - Login</title>
    <link href="https://fonts.googleapis.com/css2?family=Press+Start+2P&family=Inter:wght@300;400;600;700&display=swap" rel="stylesheet">
    
    <link rel="stylesheet" href="./css/login.css">

</head>
<body>
    <div class="bg"></div>

    <div class="login-container">
        <div class="logo">
            <h1>🎮 TERRARIACRAFT</h1>
            <p>Entre na sua conta para jogar</p>
        </div>

        

        <form method="POST" action="./verificar.php">
            
        <div class="form-group">
                <label for="email">📧 Email</label>
                <div class="input-wrapper">
                    <input type="email" name="email" placeholder="seu@email.com" 
                           maxlength="255" required autocomplete="email" autofocus>
                </div>
            </div>

            <div class="form-group">
                <label for="senha">🔒 Senha</label>
                <div class="input-wrapper">
                    <input type="password" id="senha" name="senha" placeholder="Sua senha" required autocomplete="current-password">
                    
                    <button type="button" class="toggle-password" id="togglePass" 
                            onclick="togglePassword()" aria-label="Mostrar senha">👁️</button>
                </div>
            </div>

            <button type="submit" class="btn-submit" >▶ ENTRAR</button>
        </form>

        <div class="divider">
            <span>ou</span>
        </div>

        <div class="link-register">
            Não tem conta? <a href="./register.php">Cadastre-se aqui</a>
        </div>

        <div class="back-link">
            <a href="./index.html">⬅ Voltar ao site</a>
        </div>
    </div>

<script>
function togglePassword() {
    const input = document.getElementById('senha');
    const toggle = document.getElementById('togglePass');
    if (input.type === 'password') {
        input.type = 'text';
        toggle.textContent = '🙈';
    } else {
        input.type = 'password';
        toggle.textContent = '👁️';
    }
}


</script>
</body>
</html>