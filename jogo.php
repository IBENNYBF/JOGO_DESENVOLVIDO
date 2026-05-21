<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TerrariaCraft - Jogo v5.4</title>
    <link rel="stylesheet" href="css/jogo.css">
</head>
<body>
    <div id="gameContainer">
        <canvas id="gameCanvas"></canvas>

        <div id="ui">
            <div id="topBar">
                <span id="hp">❤️❤️❤️❤️❤️ 100/100</span>
                <div id="xpBar"><div id="xpFill"></div></div>
                <span id="level">Lv:1</span>
                <span id="time">☀️ Dia</span>
                <span id="coords">X:0 Y:0</span>
                <span id="fps">60 FPS</span>
                <span id="userDisplay" style="color:#4ade80;font-size:11px;cursor:pointer;" onclick="if(confirm('Deseja sair?'))logout()" title="Clique para sair">👤 <span id="userName"></span></span>
            </div>

            <div id="hotbar"></div>

            <div id="inventory" style="display:none;">
                <h3>📦 INVENTÁRIO (Arraste os itens)</h3>
                <div class="inv-grid"></div>
                <p class="inv-hint">Arraste para mover | Shift+Click divide | E ou I para fechar</p>
            </div>

            <div id="crafting" style="display:none;">
                <h3>🔨 CRAFTING</h3>
                <div class="craft-list"></div>
                <p class="craft-hint">C para fechar</p>
            </div>

            <div id="controls">
                <span>WASD</span> Mover | <span>Click</span> Atacar/Quebrar | <span>Right</span> Colocar | 
                <span>1-0</span> Hotbar | <span>E</span> Inv | <span>C</span> Craft | <span>Esc</span> Pausa
            </div>
        </div>

        <div id="dragItem">
            <div class="item-icon"></div>
            <div class="count"></div>
        </div>

        <div id="tooltip"></div>

        <div id="startScreen">
            <div class="start-content">
                <h1>🎮 TERRARIACRAFT</h1>
                <p class="subtitle">Block & Adventure v5.4</p>
                <input type="text" id="worldSeed" placeholder="Seed do mundo (opcional)" maxlength="20">
                <input type="text" id="playerName" placeholder="Nome do jogador" maxlength="20" style="opacity:0.7;background:#0f172a;">
                <div class="buttons">
                    <button class="btn-primary" onclick="startGame()">▶ NOVO JOGO</button>
                    <button class="btn-secondary" onclick="loadGame()">📂 CARREGAR JOGO</button>
                </div>
                <p class="save-status" id="saveStatus"></p>
                <div class="help">
                    <h4>🕹️ CONTROLES</h4>
                    <div class="help-grid">
                        <span><kbd>WASD</kbd> Mover/Pular</span>
                        <span><kbd>Shift</kbd> Correr</span>
                        <span><kbd>Click</kbd> Atacar/Quebrar</span>
                        <span><kbd>Right</kbd> Colocar bloco</span>
                        <span><kbd>1-0</kbd> Hotbar</span>
                        <span><kbd>E / I</kbd> Inventário</span>
                        <span><kbd>C</kbd> Crafting</span>
                        <span><kbd>Esc</kbd> Pausar</span>
                    </div>
                </div>
                <p class="version">v5.4 | Segurança | Performance | Combate | Inventário</p>
            </div>
        </div>

        <div id="pauseScreen">
            <div class="pause-content">
                <h2>⏸️ JOGO PAUSADO</h2>
                <button class="pause-btn" onclick="togglePause()">▶ Continuar</button>
                <button class="pause-btn" onclick="saveGame();togglePause();">💾 Salvar Jogo</button>
                <button class="pause-btn" onclick="if(confirm('Deseja sair?'))logout()">🚪 Sair</button>
            </div>
        </div>
    </div>

<!--<script src="./auth.js"></script>-->
<script src="js/jogo.js"></script>
</body>
</html>