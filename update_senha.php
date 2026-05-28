<?php
session_start();
include_once("viewclass/conexao_user.php");

// ── LÓGICA DE ATUALIZAÇÃO DE SENHA (POST com código + nova senha) ──────────
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['cdcodigo'])) {

    $codigo     = trim($_POST['cdcodigo'] ?? '');
    $nova_senha = $_POST['cdsenha'] ?? '';

    if (empty($codigo) || empty($nova_senha)) {
        echo "<script>alert('Por favor, preencha o código e a nova senha.'); window.history.back();</script>";
        exit;
    }

    $senha_final = hash('sha256', $nova_senha);

    $stmt = $conn_user->prepare("SELECT ID FROM usuarios WHERE RECUPERAR = ? AND RECUPERAR IS NOT NULL LIMIT 1");
    $stmt->bind_param("s", $codigo);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user   = $result->fetch_assoc();
        $userId = $user['ID'];

        $update_stmt = $conn_user->prepare("UPDATE usuarios SET SENHA = ?, RECUPERAR = NULL WHERE ID = ?");
        $update_stmt->bind_param("si", $senha_final, $userId);

        if ($update_stmt->execute()) {
            echo "<script>alert('Senha atualizada com sucesso! Você já pode realizar o login.'); window.location.href = '../index.html';</script>";
        } else {
            echo "Erro ao atualizar a senha no banco de dados: " . $conn_user->error;
        }
        $update_stmt->close();
    } else {
        echo "<script>alert('Código de recuperação inválido ou expirado.'); window.history.back();</script>";
    }

    $stmt->close();
    mysqli_close($conn_user);
    exit;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TerrariaCraft – Recuperar Senha</title>
    <link href="https://fonts.googleapis.com/css2?family=Orbitron:wght@700;900&family=Exo+2:wght@300;400;600&display=swap" rel="stylesheet">
    <script src="https://cdn.jsdelivr.net/npm/sweetalert2@11"></script>
    <style>
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        :root {
            --bg:        #060a10;
            --surface:   #0d1520;
            --border:    #1e3a52;
            --accent:    #00d4ff;
            --accent2:   #4ade80;
            --danger:    #f87171;
            --text:      #cce7f5;
            --muted:     #4a7a9b;
            --glow:      0 0 18px rgba(0,212,255,.35);
        }

        body {
            min-height: 100vh;
            background: var(--bg);
            display: flex;
            align-items: center;
            justify-content: center;
            font-family: 'Exo 2', sans-serif;
            color: var(--text);
            overflow: hidden;
        }

        /* ── Stars background ── */
        body::before {
            content: '';
            position: fixed; inset: 0;
            background-image:
                radial-gradient(1px 1px at 10% 20%, rgba(0,212,255,.5) 0%, transparent 100%),
                radial-gradient(1px 1px at 80% 10%, rgba(74,222,128,.4) 0%, transparent 100%),
                radial-gradient(1px 1px at 50% 75%, rgba(0,212,255,.3) 0%, transparent 100%),
                radial-gradient(1px 1px at 25% 60%, rgba(255,255,255,.2) 0%, transparent 100%),
                radial-gradient(1px 1px at 90% 50%, rgba(74,222,128,.3) 0%, transparent 100%),
                radial-gradient(1px 1px at 70% 85%, rgba(0,212,255,.4) 0%, transparent 100%);
            pointer-events: none;
            z-index: 0;
        }

        /* ── Grid overlay ── */
        body::after {
            content: '';
            position: fixed; inset: 0;
            background-image:
                linear-gradient(rgba(0,212,255,.04) 1px, transparent 1px),
                linear-gradient(90deg, rgba(0,212,255,.04) 1px, transparent 1px);
            background-size: 40px 40px;
            pointer-events: none;
            z-index: 0;
        }

        /* ── Card ── */
        .card {
            position: relative;
            z-index: 1;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 16px;
            padding: 40px 36px;
            width: min(440px, 94vw);
            box-shadow: 0 0 60px rgba(0,212,255,.08), 0 24px 64px rgba(0,0,0,.6);
        }

        /* corner decorations */
        .card::before, .card::after {
            content: '';
            position: absolute;
            width: 18px; height: 18px;
            border-color: var(--accent);
            border-style: solid;
        }
        .card::before { top: -1px; left: -1px; border-width: 2px 0 0 2px; border-radius: 16px 0 0 0; }
        .card::after  { bottom: -1px; right: -1px; border-width: 0 2px 2px 0; border-radius: 0 0 16px 0; }

        /* ── Logo / heading ── */
        .logo {
            text-align: center;
            margin-bottom: 6px;
        }
        .logo .game-title {
            font-family: 'Orbitron', monospace;
            font-size: 22px;
            font-weight: 900;
            letter-spacing: 4px;
            color: var(--accent);
            text-shadow: var(--glow);
        }
        .logo .subtitle {
            font-size: 11px;
            letter-spacing: 3px;
            text-transform: uppercase;
            color: var(--muted);
            margin-top: 2px;
        }

        .divider {
            border: none;
            border-top: 1px solid var(--border);
            margin: 22px 0;
            position: relative;
        }
        .divider span {
            position: absolute;
            top: 50%; left: 50%;
            transform: translate(-50%,-50%);
            background: var(--surface);
            padding: 0 10px;
            font-size: 10px;
            letter-spacing: 2px;
            text-transform: uppercase;
            color: var(--muted);
        }

        /* ── Tabs ── */
        .tabs {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 4px;
            margin-bottom: 28px;
        }
        .tab-btn {
            padding: 9px;
            border: none;
            border-radius: 7px;
            background: transparent;
            color: var(--muted);
            font-family: 'Exo 2', sans-serif;
            font-size: 12px;
            font-weight: 600;
            letter-spacing: 1px;
            text-transform: uppercase;
            cursor: pointer;
            transition: all .25s;
        }
        .tab-btn.active {
            background: var(--accent);
            color: var(--bg);
            box-shadow: var(--glow);
        }
        .tab-btn:not(.active):hover { color: var(--text); }

        /* ── Panels ── */
        .panel { display: none; }
        .panel.active { display: block; }

        /* ── Step indicator ── */
        .steps {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0;
            margin-bottom: 24px;
        }
        .step-dot {
            width: 28px; height: 28px;
            border-radius: 50%;
            border: 2px solid var(--border);
            display: flex; align-items: center; justify-content: center;
            font-size: 11px; font-weight: 700;
            color: var(--muted);
            background: var(--bg);
            transition: all .3s;
            position: relative;
            z-index: 1;
        }
        .step-dot.done   { border-color: var(--accent2); color: var(--accent2); background: rgba(74,222,128,.08); }
        .step-dot.active { border-color: var(--accent);  color: var(--accent);  background: rgba(0,212,255,.1); box-shadow: var(--glow); }
        .step-line {
            flex: 1;
            height: 2px;
            background: var(--border);
            max-width: 60px;
            transition: background .3s;
        }
        .step-line.done { background: var(--accent2); }

        /* ── Form fields ── */
        .field { margin-bottom: 16px; }
        label {
            display: block;
            font-size: 11px;
            font-weight: 600;
            letter-spacing: 1.5px;
            text-transform: uppercase;
            color: var(--muted);
            margin-bottom: 7px;
        }
        input[type="text"],
        input[type="email"],
        input[type="password"] {
            width: 100%;
            padding: 12px 14px;
            background: var(--bg);
            border: 1px solid var(--border);
            border-radius: 8px;
            color: var(--text);
            font-family: 'Exo 2', sans-serif;
            font-size: 14px;
            outline: none;
            transition: border-color .2s, box-shadow .2s;
        }
        input:focus {
            border-color: var(--accent);
            box-shadow: 0 0 0 3px rgba(0,212,255,.12);
        }
        input::placeholder { color: var(--muted); }

        /* password wrapper */
        .pass-wrap { position: relative; }
        .pass-wrap input { padding-right: 42px; }
        .toggle-eye {
            position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
            background: none; border: none; cursor: pointer;
            color: var(--muted); font-size: 16px;
            transition: color .2s;
        }
        .toggle-eye:hover { color: var(--accent); }

        /* ── Password strength ── */
        .strength-bar-wrap {
            height: 4px;
            background: var(--border);
            border-radius: 4px;
            margin: 8px 0 6px;
            overflow: hidden;
        }
        .strength-bar {
            height: 100%;
            width: 0%;
            border-radius: 4px;
            transition: width .4s, background .4s;
        }
        .req-list {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 4px 10px;
            margin-top: 8px;
        }
        .req-item {
            font-size: 10px;
            color: var(--muted);
            display: flex; align-items: center; gap: 4px;
            transition: color .2s;
        }
        .req-item.ok  { color: var(--accent2); }
        .req-item.bad { color: var(--danger); }
        .req-item .dot {
            width: 6px; height: 6px; border-radius: 50%;
            background: currentColor; flex-shrink: 0;
        }

        /* ── Buttons ── */
        .btn {
            width: 100%;
            padding: 13px;
            border: none;
            border-radius: 8px;
            font-family: 'Orbitron', monospace;
            font-size: 12px;
            font-weight: 700;
            letter-spacing: 2px;
            cursor: pointer;
            transition: all .25s;
            margin-top: 8px;
        }
        .btn-primary {
            background: var(--accent);
            color: var(--bg);
            box-shadow: var(--glow);
        }
        .btn-primary:hover:not(:disabled) {
            background: #33deff;
            box-shadow: 0 0 28px rgba(0,212,255,.55);
            transform: translateY(-1px);
        }
        .btn-primary:disabled {
            opacity: .4;
            cursor: not-allowed;
            box-shadow: none;
        }
        .btn-ghost {
            background: transparent;
            border: 1px solid var(--border);
            color: var(--muted);
            font-size: 11px;
        }
        .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }

        .back-link {
            display: block;
            text-align: center;
            margin-top: 18px;
            font-size: 11px;
            color: var(--muted);
            text-decoration: none;
            letter-spacing: 1px;
            transition: color .2s;
        }
        .back-link:hover { color: var(--accent); }

        /* ── Info box ── */
        .info-box {
            background: rgba(0,212,255,.06);
            border: 1px solid rgba(0,212,255,.2);
            border-radius: 8px;
            padding: 10px 14px;
            font-size: 11px;
            color: var(--accent);
            margin-bottom: 18px;
            line-height: 1.6;
        }

        /* ── Spinner ── */
        .spinner {
            display: inline-block;
            width: 14px; height: 14px;
            border: 2px solid rgba(6,10,16,.4);
            border-top-color: var(--bg);
            border-radius: 50%;
            animation: spin .6s linear infinite;
            vertical-align: middle;
            margin-right: 6px;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        /* ── Fade-in ── */
        .card { animation: fadeUp .45s ease both; }
        @keyframes fadeUp {
            from { opacity: 0; transform: translateY(24px); }
            to   { opacity: 1; transform: translateY(0); }
        }
    </style>
</head>
<body>

<div class="card">
    <div class="logo">
        <div class="game-title">🎮 TERRARIACRAFT</div>
        <div class="subtitle">Block &amp; Adventure v5.4</div>
    </div>

    <hr class="divider"><span>Acesso à conta</span></hr>

    <!-- TABS -->
    <div class="tabs">
        <button class="tab-btn active" id="tabLogin"   onclick="switchTab('login')">🔑 Login</button>
        <button class="tab-btn"        id="tabRecover" onclick="switchTab('recover')">🔒 Recuperar</button>
    </div>

    <!-- ═══════ PANEL: LOGIN ═══════ -->
    <div class="panel active" id="panelLogin">
        <p style="font-size:12px;color:var(--muted);text-align:center;margin-bottom:20px;letter-spacing:.5px;">
            Entre na sua conta para continuar sua aventura
        </p>
        <!-- Aqui você integra seu formulário de login existente -->
        <div class="info-box">
            💡 Use esta aba para acessar o jogo normalmente.<br>
            Esqueceu a senha? Clique em <strong>Recuperar</strong>.
        </div>
        <a href="index.html" class="btn btn-ghost" style="display:block;text-align:center;text-decoration:none;padding:13px;border-radius:8px;">
            ← Voltar à tela inicial
        </a>
    </div>

    <!-- ═══════ PANEL: RECUPERAR SENHA ═══════ -->
    <div class="panel" id="panelRecover">

        <!-- Step indicator -->
        <div class="steps" id="stepIndicator">
            <div class="step-dot active" id="dot1">1</div>
            <div class="step-line" id="line1"></div>
            <div class="step-dot" id="dot2">2</div>
        </div>

        <!-- ── STEP 1: Verificar e-mail (lógica: verificar_email.php) ── -->
        <div id="step1">
            <div class="info-box">
                📧 Informe seu e-mail cadastrado.<br>
                Enviaremos um código de <strong>6 dígitos</strong> para você.
            </div>

            <form method="POST" action="viewclass/verificar_email.php" id="formEmail" onsubmit="handleEmailSubmit(event)">
                <div class="field">
                    <label>E-mail cadastrado</label>
                    <input type="email" name="cdemail" id="emailInput"
                           placeholder="seu@email.com" required autocomplete="off">
                </div>
                <button type="submit" class="btn btn-primary" id="btnEmail">
                    ENVIAR CÓDIGO
                </button>
            </form>
        </div>

        <!-- ── STEP 2: Inserir código + nova senha (lógica: update_senha.php POST) ── -->
        <div id="step2" style="display:none;">
            <div class="info-box" id="emailConfirmBox">
                ✅ Código enviado! Verifique sua caixa de entrada.
            </div>

            <form method="POST" action="update_senha.php" id="formUpdate" onsubmit="handleUpdateSubmit(event)">
                <div class="field">
                    <label>Código de recuperação</label>
                    <input type="text" name="cdcodigo" id="codigoInput"
                           placeholder="000000" maxlength="6"
                           pattern="\d{6}" required autocomplete="off"
                           style="letter-spacing:8px;font-size:20px;text-align:center;font-family:'Orbitron',monospace;">
                </div>

                <div class="field">
                    <label>Nova senha</label>
                    <div class="pass-wrap">
                        <input type="password" name="cdsenha" id="novaSenha"
                               placeholder="Mínimo 6 caracteres"
                               required autocomplete="new-password"
                               oninput="checkStrength(this.value)">
                        <button type="button" class="toggle-eye" onclick="toggleVis()">👁</button>
                    </div>
                    <div class="strength-bar-wrap">
                        <div class="strength-bar" id="strengthBar"></div>
                    </div>
                    <div class="req-list">
                        <div class="req-item" id="r-len"><span class="dot"></span>Mín. 6 chars</div>
                        <div class="req-item" id="r-upp"><span class="dot"></span>Maiúscula</div>
                        <div class="req-item" id="r-low"><span class="dot"></span>Minúscula</div>
                        <div class="req-item" id="r-num"><span class="dot"></span>Número</div>
                        <div class="req-item" id="r-spe"><span class="dot"></span>Especial @#$%</div>
                    </div>
                </div>

                <button type="submit" class="btn btn-primary" id="btnUpdate">
                    ATUALIZAR SENHA
                </button>
            </form>

            <button class="btn btn-ghost" style="margin-top:8px;" onclick="goStep1()">
                ← Reenviar código
            </button>
        </div>

    </div><!-- /panelRecover -->

    <a href="jogo.php" class="back-link">🎮 Voltar ao jogo</a>
</div>

<script>
    // ── Tab switching ────────────────────────────────────────────────────────
    function switchTab(tab) {
        document.getElementById('panelLogin').classList.toggle('active', tab === 'login');
        document.getElementById('panelRecover').classList.toggle('active', tab === 'recover');
        document.getElementById('tabLogin').classList.toggle('active', tab === 'login');
        document.getElementById('tabRecover').classList.toggle('active', tab === 'recover');
    }

    // ── Step navigation ──────────────────────────────────────────────────────
    function goStep2(email) {
        document.getElementById('step1').style.display = 'none';
        document.getElementById('step2').style.display = 'block';
        document.getElementById('emailConfirmBox').innerHTML =
            '✅ Código enviado para <strong>' + email + '</strong>. Verifique sua caixa de entrada.';

        // Update step dots
        document.getElementById('dot1').className  = 'step-dot done';
        document.getElementById('dot1').textContent = '✓';
        document.getElementById('line1').className  = 'step-line done';
        document.getElementById('dot2').className   = 'step-dot active';
    }

    function goStep1() {
        document.getElementById('step2').style.display = 'none';
        document.getElementById('step1').style.display = 'block';
        document.getElementById('dot1').className  = 'step-dot active';
        document.getElementById('dot1').textContent = '1';
        document.getElementById('line1').className  = 'step-line';
        document.getElementById('dot2').className   = 'step-dot';
        document.getElementById('novaSenha').value = '';
        document.getElementById('codigoInput').value = '';
        resetStrength();
    }

    // ── Step 1: Enviar e-mail via verificar_email.php (POST nativo) ──────────
    function handleEmailSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('emailInput').value.trim();
        if (!email) return;

        const btn = document.getElementById('btnEmail');
        btn.innerHTML = '<span class="spinner"></span> ENVIANDO...';
        btn.disabled = true;

        // Submete para verificar_email.php via fetch para capturar a resposta
        // Se preferir redirect puro, remova o fetch e use form.submit()
        const fd = new FormData();
        fd.append('cdemail', email);

        fetch('viewclass/verificar_email.php', { method: 'POST', body: fd })
            .then(r => r.text())
            .then(html => {
                btn.innerHTML = 'ENVIAR CÓDIGO';
                btn.disabled = false;

                // verificar_email.php retorna SweetAlert; injetamos para rodar
                // e depois avançamos para o passo 2
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const scripts = tempDiv.querySelectorAll('script');
                scripts.forEach(s => {
                    const ns = document.createElement('script');
                    ns.textContent = s.textContent;
                    document.body.appendChild(ns);
                });

                // Aguarda o SweetAlert fechar (confirmButtonText devolve usuário)
                // e avança para step 2
                const checkSwal = setInterval(() => {
                    if (!document.querySelector('.swal2-container')) {
                        clearInterval(checkSwal);
                        goStep2(email);
                    }
                }, 300);
            })
            .catch(() => {
                btn.innerHTML = 'ENVIAR CÓDIGO';
                btn.disabled = false;
                Swal.fire({ title: 'Erro de conexão', text: 'Não foi possível contatar o servidor.', icon: 'error' });
            });
    }

    // ── Step 2: Submeter update_senha.php ────────────────────────────────────
    function handleUpdateSubmit(e) {
        e.preventDefault();
        const codigo = document.getElementById('codigoInput').value.trim();
        const senha  = document.getElementById('novaSenha').value;

        if (!codigo || !senha) {
            Swal.fire({ title: 'Campos obrigatórios', text: 'Preencha o código e a nova senha.', icon: 'warning' });
            return;
        }

        const btn = document.getElementById('btnUpdate');
        btn.innerHTML = '<span class="spinner"></span> ATUALIZANDO...';
        btn.disabled = true;

        const fd = new FormData();
        fd.append('cdcodigo', codigo);
        fd.append('cdsenha', senha);

        fetch('update_senha.php', { method: 'POST', body: fd })
            .then(r => r.text())
            .then(html => {
                btn.innerHTML = 'ATUALIZAR SENHA';
                btn.disabled = false;

                // Executa o script retornado pelo PHP (alert + redirect)
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = html;
                const scripts = tempDiv.querySelectorAll('script');
                if (scripts.length) {
                    scripts.forEach(s => {
                        const ns = document.createElement('script');
                        ns.textContent = s.textContent;
                        document.body.appendChild(ns);
                    });
                } else {
                    // fallback: exibe conteúdo raw se não houver script
                    Swal.fire({ title: 'Resposta do servidor', text: html || 'Operação concluída.', icon: 'info' });
                }
            })
            .catch(() => {
                btn.innerHTML = 'ATUALIZAR SENHA';
                btn.disabled = false;
                Swal.fire({ title: 'Erro de conexão', text: 'Não foi possível contatar o servidor.', icon: 'error' });
            });
    }

    // ── Password strength (baseado no seu validarSenhaForca) ────────────────
    const criteria = [
        { id: 'r-len', regex: null, test: v => v.length >= 6, pts: 25 },
        { id: 'r-upp', regex: /[A-Z]/, test: null, pts: 25 },
        { id: 'r-low', regex: /[a-z]/, test: null, pts: 20 },
        { id: 'r-num', regex: /[0-9]/, test: null, pts: 15 },
        { id: 'r-spe', regex: /[@#$%&*]/, test: null, pts: 15 },
    ];

    function checkStrength(val) {
        let score = 0;
        criteria.forEach(c => {
            const ok = c.test ? c.test(val) : c.regex.test(val);
            const el = document.getElementById(c.id);
            el.className = 'req-item' + (val.length === 0 ? '' : ok ? ' ok' : ' bad');
            if (ok && val.length > 0) score += c.pts;
        });

        const bar = document.getElementById('strengthBar');
        bar.style.width = val.length === 0 ? '0%' : score + '%';

        if (val.length === 0) { bar.style.background = ''; return; }
        if (score < 50)  bar.style.background = '#f87171';
        else if (score < 80) bar.style.background = '#fbbf24';
        else if (score < 100) bar.style.background = '#60a5fa';
        else bar.style.background = '#4ade80';
    }

    function resetStrength() {
        criteria.forEach(c => document.getElementById(c.id).className = 'req-item');
        const bar = document.getElementById('strengthBar');
        bar.style.width = '0%';
        bar.style.background = '';
    }

    function toggleVis() {
        const inp = document.getElementById('novaSenha');
        inp.type = inp.type === 'password' ? 'text' : 'password';
    }
</script>
</body>
</html>