// ==========================================
// PROTEÇÃO DE LOGIN (desativada - sem banco de dados)
// ==========================================
// Descomente abaixo quando tiver auth.js + backend:
// if (!checkAuth()) {
//     throw new Error('Acesso negado - Faça login primeiro');
// }
// const session = getSession();
// const loggedUser = session ? session.username : 'default';

// Stub temporário para rodar sem banco de dados
function checkAuth() { return true; }
function getSession() { return { username: 'Jogador' }; }
function logout() { location.reload(); }

const loggedUser = 'Jogador';

// ==========================================
// TERRARIACRAFT v5.4 - SEGURANÇA + PERFORMANCE + COMBATE + INVENTÁRIO
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE = 32;
const WW = 100;
const WH = 60;

// === PERFORMANCE: Limitadores ===
const MAX_PARTICLES = 100;
const MAX_DROPS_RENDER = 50;
const MAX_ENEMIES_RENDER = 15;
const MAX_ENEMIES_TOTAL = 20;
let lastTime = 0;
let fps = 60;
let frameSkip = 0;

// === SEED ===
let SEED = 12345;
function srand(s){SEED=s;}
function rand(){SEED=(SEED*9301+49297)%233280;return SEED/233280;}
function randInt(min,max){return Math.floor(rand()*(max-min+1))+min;}
function hashString(str){let h=0;for(let i=0;i<str.length;i++){h=((h<<5)-h)+str.charCodeAt(i);h|=0;}return Math.abs(h);}

// === BLOCOS ===
const BLK = {
    0:{n:'Ar',s:false,c:null},
    1:{n:'Terra',s:true,c:'#8B6914',bd:'#6B5010',drop:1,tool:'shovel'},
    2:{n:'Pedra',s:true,c:'#7a7a7a',bd:'#5a5a5a',drop:2,tool:'pickaxe'},
    3:{n:'Grama',s:true,c:'#4ade80',bd:'#22c55e',drop:1,tool:'shovel'},
    4:{n:'Madeira',s:true,c:'#8B4513',bd:'#654321',drop:4,tool:'axe'},
    5:{n:'Folha',s:false,c:'#22c55e',bd:'#16a34a',drop:null},
    6:{n:'Ferro',s:true,c:'#94a3b8',bd:'#64748b',drop:6,tool:'pickaxe'},
    7:{n:'Ouro',s:true,c:'#fbbf24',bd:'#d97706',drop:7,tool:'pickaxe'},
    8:{n:'Tijolo',s:true,c:'#b91c1c',bd:'#991b1b',drop:8},
    9:{n:'Areia',s:true,c:'#fde047',bd:'#eab308',drop:9,tool:'shovel'},
    10:{n:'Vidro',s:true,c:'#bfdbfe',bd:'#93c5fd',drop:10},
    11:{n:'Tocha',s:false,c:'#f59e0b',bd:'#d97706',drop:11,light:true},
    12:{n:'Plataforma',s:false,c:'#a16207',bd:'#854d0e',drop:4,plat:true},
    13:{n:'Neve',s:true,c:'#f0f9ff',bd:'#cbd5e1',drop:13,tool:'shovel'},
    14:{n:'Gelo',s:true,c:'#bae6fd',bd:'#7dd3fc',drop:14,tool:'pickaxe'},
};

// === ITENS / FERRAMENTAS ===
const ITEMS = {...BLK,
    50:{n:'Picareta de Pedra',type:'tool',tool:'pickaxe',power:1,c:'#9ca3af'},
    51:{n:'Picareta de Ferro',type:'tool',tool:'pickaxe',power:2,c:'#64748b'},
    52:{n:'Machado de Pedra',type:'tool',tool:'axe',power:1,c:'#9ca3af'},
    53:{n:'Machado de Ferro',type:'tool',tool:'axe',power:2,c:'#64748b'},
    54:{n:'Pá de Pedra',type:'tool',tool:'shovel',power:1,c:'#9ca3af'},
    55:{n:'Pá de Ferro',type:'tool',tool:'shovel',power:2,c:'#64748b'},
    56:{n:'Espada de Madeira',type:'weapon',damage:12,c:'#8B4513'},
    57:{n:'Espada de Pedra',type:'weapon',damage:18,c:'#9ca3af'},
};

// === SISTEMA DE IMAGENS (TEXTURAS 2D) ===
const blockImages = {};
const imageLoadStatus = {};

// Mapeamento: ID do bloco -> arquivo PNG
const IMAGE_MAP = {
    1: 'img/jogo/terra.png',      // Terra
    2: 'img/jogo/pedra.png',      // Pedra
    3: 'img/jogo/grama.png',      // Grama
    4: 'img/jogo/madeira.png',    // Madeira
    5: 'img/jogo/folha.png',      // Folha
    6: 'img/jogo/ferro.png',      // Ferro
    7: 'img/jogo/ouro.png',       // Ouro
    8: 'img/jogo/tijolo.png',     // Tijolo
    9: 'img/jogo/areia.png',      // Areia
    10: 'img/jogo/vidro.png',     // Vidro
    11: 'img/jogo/tocha.png',     // Tocha
    12: 'img/jogo/plataforma.png',// Plataforma
    13: 'img/jogo/neve.png',      // Neve
    14: 'img/jogo/gelo.png',      // Gelo
};

// Mapeamento: ID da ferramenta/arma -> arquivo PNG
const TOOL_IMAGE_MAP = {
    50: 'img/jogo/picareta_pedra.png',  // Picareta de Pedra
    51: 'img/jogo/picareta_ferro.png',  // Picareta de Ferro
    52: 'img/jogo/machado_pedra.png',   // Machado de Pedra
    53: 'img/jogo/machado_ferro.png',   // Machado de Ferro
    54: 'img/jogo/pa_pedra.png',        // Pá de Pedra
    55: 'img/jogo/pa_ferro.png',        // Pá de Ferro
    56: 'img/jogo/espada_madeira.png',  // Espada de Madeira
    57: 'img/jogo/espada_pedra.png',    // Espada de Pedra
};

let imagesReady = false;
let imagesToLoad = 0;
let imagesLoadedCount = 0;

function loadBlockImages(callback) {
    const blockEntries = Object.entries(IMAGE_MAP);
    const toolEntries = Object.entries(TOOL_IMAGE_MAP);
    const allEntries = [...blockEntries, ...toolEntries];
    imagesToLoad = allEntries.length;
    imagesLoadedCount = 0;

    if (imagesToLoad === 0) {
        imagesReady = true;
        if (callback) callback();
        return;
    }

    allEntries.forEach(([id, src]) => {
        const img = new Image();
        img.onload = () => {
            blockImages[id] = img;
            imageLoadStatus[id] = 'loaded';
            imagesLoadedCount++;
            if (imagesLoadedCount >= imagesToLoad) {
                imagesReady = true;
                if (callback) callback();
            }
        };
        img.onerror = () => {
            imageLoadStatus[id] = 'error';
            imagesLoadedCount++;
            console.warn('Falha ao carregar imagem: ' + src);
            if (imagesLoadedCount >= imagesToLoad) {
                imagesReady = true;
                if (callback) callback();
            }
        };
        img.src = src;
    });
}

function drawBlockWithImage(ctx, bid, dx, dy) {
    const img = blockImages[bid];
    if (img && imageLoadStatus[bid] === 'loaded') {
        ctx.drawImage(img, dx, dy, TILE, TILE);
        // Borda opcional (se quiser manter o contorno)
        const b = BLK[bid];
        if (b && b.bd) {
            ctx.fillStyle = b.bd;
            ctx.fillRect(dx, dy, TILE, 2);
            ctx.fillRect(dx, dy, 2, TILE);
        }
        return true;
    }
    return false;
}

// === CRAFTING ===
const RECIPES = [
    {result:8,qty:1,needs:[{id:1,qty:2}],name:'Tijolo'},
    {result:10,qty:1,needs:[{id:9,qty:2}],name:'Vidro'},
    {result:50,qty:1,needs:[{id:2,qty:3},{id:4,qty:2}],name:'Picareta de Pedra'},
    {result:52,qty:1,needs:[{id:2,qty:3},{id:4,qty:2}],name:'Machado de Pedra'},
    {result:54,qty:1,needs:[{id:2,qty:3},{id:4,qty:2}],name:'Pá de Pedra'},
    {result:56,qty:1,needs:[{id:4,qty:5}],name:'Espada de Madeira'},
    {result:11,qty:3,needs:[{id:4,qty:1}],name:'Tocha'},
    {result:51,qty:1,needs:[{id:6,qty:3},{id:4,qty:2}],name:'Picareta de Ferro'},
    {result:57,qty:1,needs:[{id:2,qty:5}],name:'Espada de Pedra'},
];

// === STATE ===
let world=[];
let camX=0,camY=0;
let gameOn=false;
let gamePaused=false;
let frame=0;
let time=0;
let particles=[];
let drops=[];
let enemies=[];
let playerName=loggedUser;
let xp=0;
let level=1;

// === PLAYER ===
let px=0,py=0,pvx=0,pvy=0;
let pw=28,ph=48;
let grounded=false,php=100;
let pface=1,pInv=0;
let mining=false,mineT=0,mineTarget=null;
let attacking=false,attackTimer=0;
let attackHitbox={x:0,y:0,w:50,h:40};

// === INVENTÁRIO ===
let inv=[];
for(let i=0;i<40;i++)inv.push({id:0,qty:0});
let invDirty=true;
let isInventoryDragging=false;
let selSlot=0;
let showInv=false;
let showCraft=false;

// === INVENTÁRIO DRAG & DROP ===
let dragSource=null;
let dragItemData={id:0,qty:0};
let isDragging=false;

// === TEXTOS FLUTUANTES (declarado ANTES do uso!) ===
let floatingTexts=[];

// === CUSTOM ===
let custom=JSON.parse(localStorage.getItem('terrariacraft_custom')||'{}');
if(!custom.skin)custom={skin:'#ffdbac',hair:'#4a2c0f',hairStyle:0,shirt:'#3b82f6',pants:'#1e3a5f',shoes:'#374151',eyeColor:'#1f2937'};

// === INTERVALS (para cleanup) ===
let autoSaveInterval=null;
let regenInterval=null;

// === INPUT ===
const keys={};
let mx=0,my=0,mDown=false,mRight=false;

// === EVENT LISTENERS (com cleanup tracking) ===
const eventListeners=[];

function addTrackedListener(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    eventListeners.push({target, type, handler, options});
}

function removeAllListeners() {
    eventListeners.forEach(({target, type, handler, options}) => {
        target.removeEventListener(type, handler, options);
    });
    eventListeners.length = 0;
}

// Keyboard
addTrackedListener(document, 'keydown', e=>{
    if(e.key>='1'&&e.key<='9'){selSlot=parseInt(e.key)-1;updateUI();}
    if(e.key==='0'){selSlot=9;updateUI();}
    if(e.key.toLowerCase()==='e'||e.key==='Escape'||e.key.toLowerCase()==='i'){
        if(gamePaused){togglePause();}
        else if(e.key==='Escape'){togglePause();}
        else{toggleInv();}
    }
    if(e.key.toLowerCase()==='c'){toggleCraft();}
    keys[e.key]=true;
});

addTrackedListener(document, 'keyup', e=>{
    keys[e.key]=false;
});

// Mouse
addTrackedListener(canvas, 'mousemove', e=>{
    const r=canvas.getBoundingClientRect();
    mx=e.clientX-r.left;
    my=e.clientY-r.top;
    updateTooltip();
});

addTrackedListener(canvas, 'mousedown', e=>{
    if(!gameOn||gamePaused)return;
    if(e.button===0){
        mDown=true;
        if(tryAttack()) return;
        doMine();
    }else if(e.button===2){
        mRight=true;
        doPlace();
    }
});

addTrackedListener(canvas, 'mouseup', e=>{
    if(e.button===0){mDown=false;mining=false;mineTarget=null;}
    if(e.button===2)mRight=false;
});

addTrackedListener(canvas, 'contextmenu', e=>e.preventDefault());

// Window events
addTrackedListener(window, 'blur', ()=>{
    // Limpar todas as teclas quando perde foco
    Object.keys(keys).forEach(k=>keys[k]=false);
    mDown=false;
    mRight=false;
    mining=false;
    mineTarget=null;
});

addTrackedListener(window, 'resize', ()=>{
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
});

// Visibility API - pausar quando aba não está visível
addTrackedListener(document, 'visibilitychange', ()=>{
    if(document.hidden && gameOn && !gamePaused){
        togglePause();
    }
});

function toggleInv(){
    if(gamePaused)return;
    showInv=!showInv;
    showCraft=false;
    if(showInv){
        invDirty=true;
        isInventoryDragging=false;
    }
    updateUI();
    updateCrafting();
}

function toggleCraft(){
    if(gamePaused)return;
    showCraft=!showCraft;
    showInv=false;
    updateUI();
    updateCrafting();
}

function togglePause(){
    if(!gameOn)return;
    gamePaused=!gamePaused;
    const pauseScreen=document.getElementById('pauseScreen');
    if(pauseScreen){
        pauseScreen.style.display=gamePaused?'flex':'none';
    }
    // Limpar inputs ao pausar
    if(gamePaused){
        Object.keys(keys).forEach(k=>keys[k]=false);
        mDown=false;
        mRight=false;
        mining=false;
        mineTarget=null;
    }
}

// === TOOLTIP ===
function updateTooltip(){
    const tooltip=document.getElementById('tooltip');
    if(!tooltip)return;

    const p=wPos();
    const tx=p.x,ty=p.y;
    if(ty>=0&&ty<WH&&tx>=0&&tx<WW){
        const bid=world[ty][tx];
        if(bid!==0&&BLK[bid]){
            tooltip.style.display='block';
            tooltip.style.left=(mx+15)+'px';
            tooltip.style.top=(my+15)+'px';
            tooltip.textContent=BLK[bid].n;
            return;
        }
    }
    tooltip.style.display='none';
}

// === COMBATE: Sistema de Ataque ===
function tryAttack(){
    const held=ITEMS[inv[selSlot].id];
    if(!held||held.type!=='weapon')return false;

    const attackW=50,attackH=40;
    const ax=pface>0?px+pw:px-attackW;
    const ay=py+5;
    attackHitbox={x:ax,y:ay,w:attackW,h:attackH};

    let hitSomething=false;

    for(let i=enemies.length-1;i>=0;i--){
        const e=enemies[i];
        if(hit(attackHitbox,{x:e.x,y:e.y,w:e.w,h:e.h})){
            const dmg=held.damage||10;
            e.hp-=dmg;
            e.vx=pface>0?6:-6;
            e.vy=-3;
            e.hurtTimer=10;

            for(let p=0;p<8;p++){
                particles.push({
                    x:e.x+e.w/2,y:e.y+e.h/2,
                    vx:(Math.random()-0.5)*6,vy:(Math.random()-0.5)*6-2,
                    life:20,color:'#ff6b6b',size:4
                });
            }

            floatingTexts.push({
                x:e.x+e.w/2,y:e.y,
                text:'-'+dmg,
                life:40,color:'#ff4444',vy:-1
            });

            sfx('hurt');
            hitSomething=true;

            if(e.hp<=0){
                enemies.splice(i,1);
                xp+=15;
                if(xp>=level*50){level++;xp=0;toast('⭐ LEVEL UP! Nível '+level);}

                drops.push({x:e.x+e.w/2-8,y:e.y,w:16,h:16,id:4,vy:-4,vx:(Math.random()-0.5)*3,life:600});

                for(let p=0;p<12;p++){
                    particles.push({
                        x:e.x+e.w/2,y:e.y+e.h/2,
                        vx:(Math.random()-0.5)*8,vy:(Math.random()-0.5)*8,
                        life:30,color:e.color,size:4
                    });
                }
            }
        }
    }

    if(hitSomething){
        attacking=true;
        attackTimer=15;
        sfx('break');
    }

    return hitSomething;
}

// === SAVE / LOAD ===
async function saveGame(){
    if(!playerName){
        toast('⚠️ Digite um nome de jogador!');
        return;
    }

    // Sanitizar dados antes de enviar
    const safePlayerName = String(playerName).substring(0, 20).replace(/[^a-zA-Z0-9_-]/g, '');

    const data={
        player: safePlayerName,
        world: world,
        playerData:{
            x: Math.round(px),
            y: Math.round(py),
            hp: Math.max(0, Math.min(100, php)),
            xp: Math.max(0, xp),
            level: Math.max(1, level)
        },
        inventory: inv,
        time: time,
        enemies: enemies.slice(0, MAX_ENEMIES_TOTAL),
        seed: SEED,
        timestamp: new Date().toISOString(),
        version: '5.4'
    };

    try{
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

        const response=await fetch('./api.php',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data),
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if(!response.ok){
            throw new Error('HTTP ' + response.status);
        }

        const result=await response.json();
        if(result.status==='saved'){
            toast('💾 Salvo!');
        }else{
            throw new Error(result.message || 'Erro desconhecido');
        }
    }catch(e){
        console.warn('Falha ao salvar no servidor:', e.message);
        // Fallback para localStorage
        try{
            localStorage.setItem('tc_save_'+safePlayerName, JSON.stringify(data));
            toast('💾 Salvo localmente');
        }catch(storageErr){
            toast('❌ Falha ao salvar: ' + storageErr.message);
        }
    }
}

async function loadGame(){
    const nameInput=document.getElementById('playerName');
    const name=nameInput?nameInput.value.trim():'';
    if(!name){toast('⚠️ Digite o nome!');return;}

    const safeName = String(name).substring(0, 20).replace(/[^a-zA-Z0-9_-]/g, '');
    if(!safeName){toast('⚠️ Nome inválido!');return;}

    playerName=safeName;

    try{
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response=await fetch('./api.php?player='+encodeURIComponent(safeName), {
            signal: controller.signal
        });

        clearTimeout(timeoutId);

        if(!response.ok && response.status !== 404){
            throw new Error('HTTP ' + response.status);
        }

        const data=await response.json();
        if(data.status==='not_found'){
            const local=localStorage.getItem('tc_save_'+safeName);
            if(local){
                loadData(JSON.parse(local));
                toast('📂 Carregado do localStorage');
            }else{
                toast('❌ Save não encontrado');
            }
            return;
        }
        loadData(data);
        toast('📂 Carregado!');
    }catch(e){
        console.warn('Falha ao carregar do servidor:', e.message);
        const local=localStorage.getItem('tc_save_'+safeName);
        if(local){
            loadData(JSON.parse(local));
            toast('📂 Carregado localmente');
        }else{
            toast('❌ Erro: ' + e.message);
        }
    }
}

function loadData(data){
    if(!data || typeof data !== 'object'){
        toast('❌ Dados inválidos');
        return;
    }

    // Validar dados antes de carregar
    if(data.world && Array.isArray(data.world)){
        // Verificar dimensões do mundo
        if(data.world.length > WH + 10){
            console.warn('Mundo muito grande, truncando...');
            data.world = data.world.slice(0, WH);
        }
        world=data.world;
    }

    if(data.playerData && typeof data.playerData === 'object'){
        px=Math.max(0, Math.min(WW*TILE, data.playerData.x||px));
        py=Math.max(0, Math.min(WH*TILE, data.playerData.y||py));
        php=Math.max(0, Math.min(100, data.playerData.hp||100));
        xp=Math.max(0, data.playerData.xp||0);
        level=Math.max(1, data.playerData.level||1);
    }

    if(data.inventory && Array.isArray(data.inventory) && data.inventory.length === 40){
        inv=data.inventory;
        invDirty=true;
    }

    if(data.time!==undefined)time=data.time;
    if(data.enemies && Array.isArray(data.enemies)){
        enemies=data.enemies.slice(0, MAX_ENEMIES_TOTAL);
    }

    gameOn=true;
    gamePaused=false;
    document.getElementById('startScreen').style.display='none';
    document.getElementById('pauseScreen').style.display='none';
    initAudio();
    updateUI();
    startIntervals();
}

// === GERAR MUNDO ===
function genWorld(seedStr){
    const seed=seedStr?hashString(seedStr):Date.now();
    srand(seed);
    world=[];
    for(let y=0;y<WH;y++)world[y]=new Array(WW).fill(0);

    const heights=[];
    for(let x=0;x<WW;x++){
        let h=25+Math.sin(x*0.1)*3+Math.sin(x*0.04)*5;
        heights[x]=Math.floor(Math.max(15,Math.min(35,h)));
    }

    const snowStart=randInt(10,WW/2);
    const snowEnd=snowStart+randInt(15,30);

    for(let x=0;x<WW;x++){
        const s=heights[x];
        const isSnow=(x>=snowStart&&x<=snowEnd);
        for(let y=s;y<WH;y++){
            const d=y-s;
            if(d===0)world[y][x]=isSnow?13:3;
            else if(d<4)world[y][x]=isSnow?13:1;
            else if(d<8)world[y][x]=isSnow?14:(rand()<0.3?1:2);
            else if(d<15)world[y][x]=2;
            else if(d<25){const r=rand();if(r<0.12)world[y][x]=0;else if(r<0.18)world[y][x]=6;else world[y][x]=2;}
            else{const r=rand();if(r<0.15)world[y][x]=0;else if(r<0.20)world[y][x]=7;else world[y][x]=2;}
        }
    }

    // Árvores
    for(let x=5;x<WW-5;x++){
        if(rand()<0.08){
            const s=heights[x];
            if(world[s][x]===3||world[s][x]===13){
                const h=4+randInt(0,3);
                for(let i=1;i<=h;i++)if(s-i>=0)world[s-i][x]=4;
                const cy=s-h;
                for(let dy=-2;dy<=1;dy++){
                    for(let dx=-2;dx<=2;dx++){
                        const tx=x+dx,ty=cy+dy;
                        if(tx>=0&&tx<WW&&ty>=0&&ty<WH){
                            if(world[ty][tx]===0&&rand()<0.6)world[ty][tx]=5;
                        }
                    }
                }
            }
        }
    }

    const sx=20;
    const sy=heights[sx]-3;
    px=sx*TILE;py=sy*TILE;
    pvx=0;pvy=0;php=100;grounded=false;

    camX=px-canvas.width/2+pw/2;
    camY=py-canvas.height/2+ph/2;
    camX=Math.max(0,Math.min(camX,WW*TILE-canvas.width));
    camY=Math.max(0,Math.min(camY,WH*TILE-canvas.height));

    enemies=[];
    const enemyCount=Math.min(5, MAX_ENEMIES_TOTAL);
    for(let i=0;i<enemyCount;i++){
        const ex=40+randInt(0,40);
        const es=heights[ex]||25;
        const ey=(es-3)*TILE;
        // Verificar se não está dentro de bloco sólido
        if(!isSolid(ex, es-3)){
            enemies.push({
                x:ex*TILE,y:ey,w:32,h:26,
                vx:(rand()-0.5)*2,vy:0,
                hp:3,maxHp:3,color:'#ff6b6b',
                grounded:false,anim:0,hurtTimer:0
            });
        }
    }

    inv=[];for(let i=0;i<40;i++)inv.push({id:0,qty:0});
    addItem(1,20);addItem(2,15);addItem(4,10);addItem(8,5);
    addItem(11,5);addItem(12,10);
    addItem(50,1);addItem(52,1);addItem(54,1);addItem(56,1);
    selSlot=0;
    invDirty=true;

    particles=[];drops=[];floatingTexts=[];
    time=0;frame=0;xp=0;level=1;
}

function isSolid(tx, ty){
    if(ty<0||ty>=WH||tx<0||tx>=WW)return false;
    const bid=world[ty][tx];
    const b=BLK[bid];
    return b&&b.s&&bid!==5;
}

function addItem(id,qty){
    if(!id||qty<=0)return;
    let added=false;
    // Stackar primeiro
    for(let i=0;i<inv.length;i++){
        if(inv[i].id===id&&inv[i].qty>0&&inv[i].qty<99){
            const canAdd=Math.min(qty, 99-inv[i].qty);
            inv[i].qty+=canAdd;
            qty-=canAdd;
            added=true;
            if(qty<=0)break;
        }
    }
    // Novo slot
    if(qty>0){
        for(let i=0;i<inv.length;i++){
            if(inv[i].id===0||inv[i].qty===0){
                inv[i].id=id;
                inv[i].qty=Math.min(qty, 99);
                added=true;
                break;
            }
        }
    }
    if(added)invDirty=true;
}

function remItem(slot,qty){
    if(slot<0||slot>=inv.length)return false;
    if(inv[slot].qty>=qty){
        inv[slot].qty-=qty;
        if(inv[slot].qty<=0){inv[slot].id=0;inv[slot].qty=0;}
        invDirty=true;
        return true;
    }
    return false;
}

// === COLISÃO ===
function hit(a,b){return!(b.x>=a.x+a.w||b.x+b.w<=a.x||b.y>=a.y+a.h||b.y+b.h<=a.y);}

function getTiles(x,y,w,h){
    const tiles=[];
    const sx=Math.max(0,Math.floor(x/TILE));
    const ex=Math.min(WW-1,Math.floor((x+w-0.1)/TILE));
    const sy=Math.max(0,Math.floor(y/TILE));
    const ey=Math.min(WH-1,Math.floor((y+h-0.1)/TILE));

    // Verificar bounds do array world
    if(sy>=world.length||ey<0||sx>=WW||ex<0)return tiles;

    for(let ty=sy;ty<=ey;ty++){
        if(!world[ty])continue;
        for(let tx=sx;tx<=ex;tx++){
            const bid=world[ty][tx];
            if(bid===undefined)continue;
            const b=BLK[bid];
            // Folhas (ID 5) não colidem!
            if(b&&b.s&&bid!==5)tiles.push({x:tx*TILE,y:ty*TILE,plat:b.plat});
        }
    }
    return tiles;
}

function resolveEntity(e){
    // Sub-stepping para evitar túneling em alta velocidade
    const steps=Math.max(1, Math.ceil(Math.abs(e.vx)/TILE));
    const stepVx=e.vx/steps;

    for(let s=0;s<steps;s++){
        e.x+=stepVx;
        let tiles=getTiles(e.x,e.y,e.w,e.h);
        for(const t of tiles){
            if(t.plat&&e.vy>=0)continue;
            if(hit(e,{x:t.x,y:t.y,w:TILE,h:TILE})){
                if(stepVx>0)e.x=t.x-e.w;
                else if(stepVx<0)e.x=t.x+TILE;
                e.vx=0;
                break;
            }
        }
    }

    e.y+=e.vy;e.grounded=false;
    let tiles=getTiles(e.x,e.y,e.w,e.h);
    for(const t of tiles){
        if(hit(e,{x:t.x,y:t.y,w:TILE,h:TILE})){
            if(e.vy>0){e.y=t.y-e.h;e.grounded=true;}
            else if(e.vy<0)e.y=t.y+TILE;
            e.vy=0;
        }
    }
}

// === MINERAR / COLOCAR ===
function wPos(){return{x:Math.floor((mx+camX)/TILE),y:Math.floor((my+camY)/TILE)};}

function getHeldTool(){
    const item=ITEMS[inv[selSlot].id];
    if(item&&item.type==='tool')return item;
    return null;
}

// Raycast simples para verificar linha de visão
function hasLineOfSight(x1, y1, x2, y2){
    const dx=Math.abs(x2-x1);
    const dy=Math.abs(y2-y1);
    const sx=x1<x2?1:-1;
    const sy=y1<y2?1:-1;
    let err=dx-dy;

    let cx=Math.floor(x1/TILE);
    let cy=Math.floor(y1/TILE);
    const tx2=Math.floor(x2/TILE);
    const ty2=Math.floor(y2/TILE);

    while(cx!==tx2||cy!==ty2){
        const e2=2*err;
        if(e2>-dy){err-=dy;cx+=sx;}
        if(e2<dx){err+=dx;cy+=sy;}
        if(cx>=0&&cx<WW&&cy>=0&&cy<WH){
            const bid=world[cy][cx];
            if(bid!==0&&BLK[bid]&&BLK[bid].s&&bid!==5){
                // Verificar se é o bloco alvo
                if(cx!==tx2||cy!==ty2)return false;
            }
        }
    }
    return true;
}

function doMine(){
    const p=wPos();const tx=p.x,ty=p.y;
    if(ty<0||ty>=WH||tx<0||tx>=WW)return;
    const bid=world[ty][tx];
    if(bid===0)return;

    const bcx=tx*TILE+TILE/2,bcy=ty*TILE+TILE/2;
    const pcx=px+pw/2,pcy=py+ph/2;
    const dist=Math.sqrt((bcx-pcx)**2+(bcy-pcy)**2);
    if(dist>6*TILE)return;

    // Verificar linha de visão
    if(!hasLineOfSight(pcx, pcy, bcx, bcy))return;

    const block=BLK[bid];
    const tool=getHeldTool();

    if(block.tool&&(!tool||tool.tool!==block.tool)){
        if(!mining||mineTarget?.tx!==tx||mineTarget?.ty!==ty){mining=true;mineTarget={tx,ty};mineT=0;}
        mineT++;
        if(mineT>50)breakBlock(tx,ty,bid,bcx,bcy);
        return;
    }

    if(!mining||mineTarget?.tx!==tx||mineTarget?.ty!==ty){mining=true;mineTarget={tx,ty};mineT=0;}
    mineT++;

    let mineSpeed=20;
    if(tool&&tool.power)mineSpeed=Math.max(6,20-tool.power*7);

    if(mineT>mineSpeed)breakBlock(tx,ty,bid,bcx,bcy);
}

function breakBlock(tx,ty,bid,bcx,bcy){
    world[ty][tx]=0;mining=false;mineTarget=null;mineT=0;
    const drop=BLK[bid].drop;
    if(drop)drops.push({x:bcx-8,y:bcy-8,w:16,h:16,id:drop,vy:-3,vx:(Math.random()-0.5)*2,life:600});
    sfx('break');
    xp+=1;
    if(xp>=level*50){level++;xp=0;toast('⭐ LEVEL UP! Nível '+level);}

    const pCount=Math.min(6,MAX_PARTICLES-particles.length);
    for(let i=0;i<pCount;i++){
        particles.push({x:bcx,y:bcy,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,life:25,color:BLK[bid].c,size:3+Math.random()*3});
    }
}

function doPlace(){
    const p=wPos();const tx=p.x,ty=p.y;
    if(ty<0||ty>=WH||tx<0||tx>=WW)return;
    if(world[ty][tx]!==0)return;

    const itemId=inv[selSlot].id;
    if(itemId===0||inv[selSlot].qty<=0)return;

    const item=ITEMS[itemId];
    if(item&&(item.type==='tool'||item.type==='weapon'))return;

    const bcx=tx*TILE+TILE/2,bcy=ty*TILE+TILE/2;
    const pcx=px+pw/2,pcy=py+ph/2;
    const dist=Math.sqrt((bcx-pcx)**2+(bcy-pcy)**2);
    if(dist>5*TILE)return;

    // Verificar se não está colocando dentro do player
    if(hit({x:tx*TILE,y:ty*TILE,w:TILE,h:TILE},{x:px,y:py,w:pw,h:ph}))return;

    // Verificar se não está colocando dentro de inimigo
    for(const e of enemies){
        if(hit({x:tx*TILE,y:ty*TILE,w:TILE,h:TILE},{x:e.x,y:e.y,w:e.w,h:e.h}))return;
    }

    world[ty][tx]=itemId;
    remItem(selSlot,1);
    updateUI();
    sfx('place');
    const pCount=Math.min(4,MAX_PARTICLES-particles.length);
    for(let i=0;i<pCount;i++){
        particles.push({x:bcx,y:bcy,vx:(Math.random()-0.5)*3,vy:(Math.random()-0.5)*3-1,life:12,color:BLK[itemId].c,size:3});
    }
}

// === CRAFTING ===
function canCraft(recipe){
    for(const need of recipe.needs){
        let total=0;
        for(const slot of inv)if(slot.id===need.id)total+=slot.qty;
        if(total<need.qty)return false;
    }
    return true;
}

function doCraft(recipe){
    if(!canCraft(recipe))return;
    for(const need of recipe.needs){
        let remaining=need.qty;
        for(const slot of inv){
            if(slot.id===need.id){
                const take=Math.min(remaining,slot.qty);
                slot.qty-=take;remaining-=take;
                if(slot.qty<=0){slot.id=0;slot.qty=0;}
                if(remaining<=0)break;
            }
        }
    }
    for(const slot of inv){if(slot.id===0||slot.qty===0){slot.id=recipe.result;slot.qty=recipe.qty;break;}}
    sfx('pickup');
    invDirty=true;
    updateUI();updateCrafting();
}

// === UPDATE ===
function update(){
    if(!gameOn||gamePaused)return;
    frame++;

    // FPS counter com proteção contra divisão por zero
    const now=performance.now();
    if(frame%30===0){
        const delta=now-lastTime;
        fps=delta>0?Math.round(1000/delta*30):60;
        lastTime=now;
    }

    let moving=false;
    const speed=keys['Shift']?5.5:3.5;
    if(keys['ArrowLeft']||keys['a']){pvx=-speed;pface=-1;moving=true;}
    else if(keys['ArrowRight']||keys['d']){pvx=speed;pface=1;moving=true;}
    else{pvx*=0.75;if(Math.abs(pvx)<0.1)pvx=0;}

    if((keys['ArrowUp']||keys['w']||keys[' '])&&grounded){
        pvy=-10;grounded=false;sfx('jump');
    }

    pvy+=0.45;
    if(pvy>12)pvy=12;

    const pObj={x:px,y:py,w:pw,h:ph,vx:pvx,vy:pvy};
    resolveEntity(pObj);
    px=pObj.x;py=pObj.y;pvx=pObj.vx;pvy=pObj.vy;grounded=pObj.grounded;

    // Bounds do mundo
    if(px<0){px=0;pvx=0;}
    if(px>WW*TILE-pw){px=WW*TILE-pw;pvx=0;}
    if(py>WH*TILE){py=200;pvy=0;php-=20;}

    // Unstuck - se player ficar preso
    if(isSolid(Math.floor((px+pw/2)/TILE), Math.floor((py+ph/2)/TILE))){
        // Tentar teleportar para cima
        for(let i=1;i<10;i++){
            if(!isSolid(Math.floor((px+pw/2)/TILE), Math.floor((py+ph/2)/TILE)-i)){
                py-=i*TILE;
                break;
            }
        }
    }

    // Câmera suave
    const tx=px-canvas.width/2+pw/2;
    const ty=py-canvas.height/2+ph/2;
    const maxCX=Math.max(0,WW*TILE-canvas.width);
    const maxCY=Math.max(0,WH*TILE-canvas.height);
    camX+=(tx-camX)*0.1;
    camY+=(ty-camY)*0.1;
    camX=Math.max(0,Math.min(camX,maxCX));
    camY=Math.max(0,Math.min(camY,maxCY));

    // Drops
    const dropsToProcess=Math.min(drops.length,MAX_DROPS_RENDER);
    for(let i=drops.length-1;i>=drops.length-dropsToProcess;i--){
        if(i<0)break;
        const d=drops[i];
        d.vy+=0.3;d.x+=d.vx;d.y+=d.vy;d.life--;
        const dtx=Math.floor((d.x+d.w/2)/TILE);
        const dty=Math.floor((d.y+d.h)/TILE);
        if(dty>=0&&dty<WH&&dtx>=0&&dtx<WW){
            const b=BLK[world[dty][dtx]];
            if(b&&b.s&&world[dty][dtx]!==5){d.y=dty*TILE-d.h;d.vy=-d.vy*0.4;d.vx*=0.8;}
        }
        if(hit(d,{x:px,y:py,w:pw,h:ph})){addItem(d.id,1);drops.splice(i,1);updateUI();sfx('pickup');continue;}
        if(d.life<=0)drops.splice(i,1);
    }

    // Inimigos
    const enemiesToUpdate=Math.min(enemies.length,MAX_ENEMIES_RENDER);
    for(let i=0;i<enemiesToUpdate;i++){
        const e=enemies[i];
        if(!e)continue;
        e.vy+=0.45;e.anim+=0.1;
        if(e.hurtTimer>0)e.hurtTimer--;

        const dist=Math.sqrt((e.x-px)**2+(e.y-py)**2);
        if(dist<250&&Math.abs(e.y-py)<120){
            const dir=px>e.x?1:-1;e.vx+=dir*0.08;e.vx=Math.max(-2.5,Math.min(2.5,e.vx));
        }else{
            if(Math.random()<0.02)e.vx*=-1;
            if(Math.abs(e.vx)<0.5)e.vx=e.vx>0?1.2:-1.2;
        }
        const eObj={x:e.x,y:e.y,w:e.w,h:e.h,vx:e.vx,vy:e.vy};
        resolveEntity(eObj);
        e.x=eObj.x;e.y=eObj.y;e.vx=eObj.vx;e.vy=eObj.vy;e.grounded=eObj.grounded;

        // Verificar se inimigo não ficou preso
        if(isSolid(Math.floor((e.x+e.w/2)/TILE), Math.floor((e.y+e.h/2)/TILE))){
            e.y-=TILE; // Teleportar para cima
        }

        if(pInv<=0&&hit(e,{x:px,y:py,w:pw,h:ph})){
            php-=15;pInv=90;pvx=e.vx>0?10:-10;pvy=-6;
            sfx('hurt');updateUI();
            const pCount=Math.min(5,MAX_PARTICLES-particles.length);
            for(let i=0;i<pCount;i++){
                particles.push({x:px+pw/2,y:py+ph/2,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,life:18,color:'#ef4444',size:4});
            }
        }
    }
    if(pInv>0)pInv--;

    // Partículas
    if(particles.length>MAX_PARTICLES)particles.splice(0,particles.length-MAX_PARTICLES);
    for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.1;p.life--;
        if(p.life<=0)particles.splice(i,1);
    }

    // Textos flutuantes
    for(let i=floatingTexts.length-1;i>=0;i--){
        const ft=floatingTexts[i];
        ft.y+=ft.vy;ft.life--;
        if(ft.life<=0)floatingTexts.splice(i,1);
    }

    // Timer de ataque
    if(attackTimer>0){attackTimer--;if(attackTimer<=0)attacking=false;}

    time=(time+0.3)%2400;

    if(mDown&&!showInv&&!showCraft)doMine();
    if(mRight&&!showInv&&!showCraft)doPlace();

    // Spawn de inimigos (limitado)
    if(enemies.length<MAX_ENEMIES_TOTAL&&frame%600===0&&time>1200){
        const ex=Math.floor(px/TILE)+randInt(-20,20);
        const ey=Math.floor(py/TILE)+randInt(-5,5);
        if(ex>=0&&ex<WW&&ey>=0&&ey<WH&&!isSolid(ex,ey)){
            enemies.push({
                x:ex*TILE,y:ey*TILE,w:32,h:26,
                vx:(rand()-0.5)*2,vy:0,
                hp:3,maxHp:3,color:'#ff6b6b',
                grounded:false,anim:0,hurtTimer:0
            });
        }
    }

    if(php<=0){
        toast('💀 MORREU! Respawnando...');
        cleanupGame();
        setTimeout(()=>{
            genWorld();
            php=100;
            updateUI();
            startIntervals();
        },1500);
    }

    updateUI();
}

// === RENDER OTIMIZADO ===
function draw(){
    if(world.length===0)return;

    // Limpar canvas
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const night=time>1200;
    const np=night?Math.min(1,(time-1200)/400):0;

    // Céu
    let st,sb;
    if(night){st=`rgb(${10+np*5},${10+np*8},${25+np*15})`;sb=`rgb(${15+np*5},${15+np*10},${35+np*20})`;}
    else{const dp=time/1200;st=`rgb(${135-dp*30},${206-dp*60},${235-dp*40})`;sb=`rgb(${180-dp*40},${220-dp*50},${255-dp*30})`;}
    const grad=ctx.createLinearGradient(0,0,0,canvas.height);grad.addColorStop(0,st);grad.addColorStop(1,sb);
    ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);

    // Sol/Lua
    const cAngle=(time/2400)*Math.PI;
    const cX=canvas.width/2+Math.cos(cAngle-Math.PI/2)*(canvas.width/2-50);
    const cY=canvas.height-80+Math.sin(cAngle-Math.PI/2)*(canvas.height/2-80);
    if(night){ctx.fillStyle='#fefcd7';ctx.beginPath();ctx.arc(cX,cY,28,0,Math.PI*2);ctx.fill();}
    else{ctx.fillStyle='#fbbf24';ctx.beginPath();ctx.arc(cX,cY,32,0,Math.PI*2);ctx.fill();}

    // Estrelas
    if(night&&np>0.1){
        ctx.fillStyle=`rgba(255,255,255,${np})`;
        for(let i=0;i<60;i++){
            const sx=(i*137.5)%canvas.width,sy=(i*53.3)%(canvas.height*0.5);
            ctx.globalAlpha=(Math.sin(time*0.05+i)*0.5+0.5)*np;
            ctx.fillRect(sx,sy,2,2);
        }
        ctx.globalAlpha=1;
    }

    // Nuvens
    ctx.fillStyle=night?'rgba(100,120,140,0.3)':'rgba(255,255,255,0.4)';
    for(let i=0;i<3;i++){
        const cx=((i*400+time*0.15)%(canvas.width+200))-100;
        const cy=50+i*50+Math.sin(i+time*0.008)*15;
        ctx.beginPath();ctx.ellipse(cx,cy,50,18,0,0,Math.PI*2);ctx.fill();
    }

    // === MUNDO OTIMIZADO ===
    const sc=Math.max(0,Math.floor(camX/TILE));
    const ec=Math.min(WW-1,sc+Math.ceil(canvas.width/TILE)+1);
    const sr=Math.max(0,Math.floor(camY/TILE));
    const er=Math.min(WH-1,sr+Math.ceil(canvas.height/TILE)+1);

    for(let y=sr;y<=er;y++){
        if(!world[y])continue;
        for(let x=sc;x<=ec;x++){
            const bid=world[y][x];
            if(bid===0)continue;
            const b=BLK[bid];
            if(!b||!b.c)continue;
            const dx=x*TILE-Math.floor(camX);
            const dy=y*TILE-Math.floor(camY);
            if(dx<-TILE||dx>canvas.width||dy<-TILE||dy>canvas.height)continue;

            // Tenta desenhar com imagem, senão usa cor sólida
            if (!drawBlockWithImage(ctx, bid, dx, dy)) {
                ctx.fillStyle=b.c;
                ctx.fillRect(dx,dy,TILE,TILE);
                ctx.fillStyle=b.bd;
                ctx.fillRect(dx,dy,TILE,2);
                ctx.fillRect(dx,dy,2,TILE);
            }
        }
    }

    // Drops
    const dropsToRender=Math.min(drops.length,MAX_DROPS_RENDER);
    for(let i=0;i<dropsToRender;i++){
        const d=drops[drops.length-1-i];
        if(!d)continue;
        const b=BLK[d.id];if(!b)continue;
        const dx=d.x-Math.floor(camX),dy=d.y-Math.floor(camY);
        if(dx<-50||dx>canvas.width+50||dy<-50||dy>canvas.height+50)continue;
        ctx.fillStyle=b.c;ctx.fillRect(dx,dy,d.w,d.h);
        ctx.strokeStyle=b.bd;ctx.lineWidth=1;ctx.strokeRect(dx,dy,d.w,d.h);
    }

    // Inimigos
    enemies.forEach(e=>{
        const dx=e.x-Math.floor(camX),dy=e.y-Math.floor(camY);
        if(dx<-50||dx>canvas.width+50||dy<-50||dy>canvas.height+50)return;

        const sq=Math.sin(e.anim*3)*2;

        if(e.hp<e.maxHp){
            const hpPct=e.hp/e.maxHp;
            ctx.fillStyle='#333';ctx.fillRect(dx,dy-8,e.w,5);
            ctx.fillStyle=hpPct>0.5?'#4ade80':hpPct>0.25?'#fbbf24':'#ef4444';
            ctx.fillRect(dx,dy-8,e.w*hpPct,5);
        }

        if(e.hurtTimer>0){
            ctx.fillStyle='#fff';
            ctx.fillRect(dx,dy+sq,e.w,e.h-sq);
        }else{
            ctx.fillStyle=e.color;ctx.fillRect(dx,dy+sq,e.w,e.h-sq);
        }

        ctx.fillStyle='#fff';ctx.fillRect(dx+6,dy+sq+8,8,8);ctx.fillRect(dx+18,dy+sq+8,8,8);
        ctx.fillStyle='#000';ctx.fillRect(dx+8,dy+sq+10,4,4);ctx.fillRect(dx+20,dy+sq+10,4,4);
    });

    // PLAYER
    drawPlayer();

    // Partículas
    particles.forEach(p=>{
        ctx.fillStyle=p.color;ctx.globalAlpha=p.life/25;
        ctx.fillRect(p.x-p.size/2-Math.floor(camX),p.y-p.size/2-Math.floor(camY),p.size,p.size);
    });
    ctx.globalAlpha=1;

    // Textos flutuantes
    floatingTexts.forEach(ft=>{
        ctx.fillStyle=ft.color;ctx.font='bold 14px monospace';ctx.textAlign='center';
        ctx.fillText(ft.text,ft.x-Math.floor(camX),ft.y-Math.floor(camY));
    });
    ctx.textAlign='left';

    // Highlight mouse
    const mwx=Math.floor((mx+camX)/TILE)*TILE-Math.floor(camX);
    const mwy=Math.floor((my+camY)/TILE)*TILE-Math.floor(camY);
    ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.lineWidth=2;ctx.strokeRect(mwx,mwy,TILE,TILE);

    // Mineração
    if(mining&&mineTarget){
        const mtx=mineTarget.tx*TILE-Math.floor(camX);
        const mty=mineTarget.ty*TILE-Math.floor(camY);
        const prog=Math.min(1, mineT/20);
        ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(mtx,mty-5,TILE,3);
        ctx.fillStyle='#fbbf24';ctx.fillRect(mtx,mty-5,TILE*prog,3);
    }

    // Hitbox de ataque
    if(attacking){
        ctx.strokeStyle='rgba(255,100,100,0.6)';
        ctx.lineWidth=2;
        ctx.strokeRect(attackHitbox.x-Math.floor(camX),attackHitbox.y-Math.floor(camY),attackHitbox.w,attackHitbox.h);
    }

    drawDebug();
}

function drawPlayer(){
    const pdx=px-Math.floor(camX);
    const pdy=py-Math.floor(camY);

    ctx.fillStyle='rgba(0,0,0,0.2)';ctx.fillRect(pdx-2,pdy+ph-2,pw+4,4);

    const legOff=grounded&&Math.abs(pvx)>0.5?Math.sin(frame*0.15)*4:0;
    ctx.fillStyle=custom.pants;
    ctx.fillRect(pdx+2,pdy+ph-16+legOff,10,16-legOff);
    ctx.fillRect(pdx+pw-12,pdy+ph-16-legOff,10,16+legOff);
    ctx.fillStyle=custom.shoes;
    ctx.fillRect(pdx+1,pdy+ph-4,12,4);ctx.fillRect(pdx+pw-13,pdy+ph-4,12,4);

    ctx.fillStyle=custom.shirt;
    ctx.fillRect(pdx+2,pdy+16,pw-4,18);
    ctx.fillStyle='rgba(255,255,255,0.15)';ctx.fillRect(pdx+4,pdy+18,pw-8,2);

    let armSwing=0;
    if(attacking){
        armSwing=pface>0?15:-15;
    }else{
        armSwing=grounded&&Math.abs(pvx)>0.5?Math.sin(frame*0.15+Math.PI)*6:0;
    }

    ctx.fillStyle=custom.shirt;
    ctx.fillRect(pdx-2,pdy+18+armSwing,6,14);ctx.fillRect(pdx+pw-4,pdy+18-armSwing,6,14);
    ctx.fillStyle=custom.skin;
    ctx.fillRect(pdx-3,pdy+30+armSwing,7,6);ctx.fillRect(pdx+pw-4,pdy+30-armSwing,7,6);

    ctx.fillStyle=custom.skin;
    ctx.fillRect(pdx+2,pdy+2,pw-4,14);

    ctx.fillStyle='#fff';
    const eyeX=pface>0?pdx+14:pdx+6;
    ctx.fillRect(eyeX,pdy+8,6,5);ctx.fillRect(eyeX+(pface>0?8:-8),pdy+8,6,5);
    ctx.fillStyle=custom.eyeColor;
    ctx.fillRect(eyeX+2,pdy+9,3,3);ctx.fillRect(eyeX+(pface>0?10:-6),pdy+9,3,3);

    ctx.fillStyle=custom.hair;
    const hs=custom.hairStyle||0;
    if(hs===0){ctx.fillRect(pdx,pdy,pw,5);ctx.fillRect(pdx-1,pdy+2,4,8);ctx.fillRect(pdx+pw-3,pdy+2,4,8);}
    else if(hs===1){ctx.fillRect(pdx,pdy,pw,5);ctx.fillRect(pdx-2,pdy,4,14);ctx.fillRect(pdx+pw-2,pdy,4,14);ctx.fillRect(pdx-1,pdy+12,pw+2,4);}
    else if(hs===2){ctx.fillRect(pdx+6,pdy-3,8,8);ctx.fillRect(pdx+8,pdy-6,4,6);}
    else if(hs===3){ctx.fillRect(pdx+8,pdy-2,6,4);}

    ctx.fillStyle='rgba(0,0,0,0.1)';ctx.fillRect(pdx+pw/2-1,pdy+12,3,2);

    // Ferramenta/Arma visível na mão
    const held=ITEMS[inv[selSlot].id];
    if(held&&(held.type==='weapon'||held.type==='tool')){
        const toolId = inv[selSlot].id;
        const img = blockImages[toolId];
        const hasImg = img && imageLoadStatus[toolId] === 'loaded';

        const sx=pface>0?pdx+pw+2:pdx-14;
        const sy=pdy+20+(attacking?(pface>0?-8:8):0);

        if (hasImg) {
            // Desenha a imagem da ferramenta
            ctx.save();
            ctx.translate(sx+6, sy+6);
            if (pface < 0) ctx.scale(-1, 1);
            if (attacking) ctx.rotate(pface > 0 ? -0.5 : 0.5);
            ctx.drawImage(img, -12, -12, 24, 24);
            ctx.restore();
        } else {
            // Fallback: desenho original colorido
            ctx.fillStyle=held.c;
            ctx.fillRect(sx,sy,12,4);
            ctx.fillStyle='#666';
            ctx.fillRect(sx+(pface>0?8:-4),sy-2,4,8);
        }
    }
}

function drawDebug(){
    ctx.fillStyle='rgba(0,0,0,0.75)';
    ctx.fillRect(10,10,280,140);
    ctx.strokeStyle='#4ade80';ctx.lineWidth=1;ctx.strokeRect(10,10,280,140);
    ctx.fillStyle='#4ade80';ctx.font='12px monospace';
    ctx.fillText('=== DEBUG v5.4 ===',18,26);
    ctx.fillStyle='#94a3b8';
    ctx.fillText('P: '+Math.floor(px)+','+Math.floor(py)+' G:'+grounded,18,42);
    ctx.fillText('Cam: '+Math.floor(camX)+','+Math.floor(camY),18,58);
    ctx.fillText('HP:'+php+' XP:'+xp+' Lv:'+level,18,74);
    ctx.fillText('Slot:'+selSlot+' '+(ITEMS[inv[selSlot].id]?.n||'Vazio'),18,90);
    ctx.fillText('Drops:'+drops.length+' Enemies:'+enemies.length,18,106);
    ctx.fillText('Parts:'+particles.length+' FPS:'+fps,18,122);
    ctx.fillText('Player: '+playerName,18,138);
}

// === UI COM DRAG AND DROP ===
function updateUI(){
    updateHUD();
    if(showInv && invDirty && !isInventoryDragging){
        renderInventory();
        invDirty=false;
    }
}

function updateHUD(){
    // Hotbar
    const hb=document.getElementById('hotbar');
    if(hb){
        hb.innerHTML='';
        for(let i=0;i<10;i++){
            const slot=inv[i];
            const div=document.createElement('div');
            div.className='slot'+(i===selSlot?' active':'');
            if(slot.id!==0&&slot.qty>0){
                const item=ITEMS[slot.id];
                const imgPath = TOOL_IMAGE_MAP[slot.id];
                const hasImg = imgPath && imageLoadStatus[slot.id] === 'loaded';
                if (hasImg) {
                    div.innerHTML='<div class="item-icon" style="background-image:url('+imgPath+');background-size:cover;background-position:center;background-color:'+(item.c||'#666')+';"></div><span class="count">'+slot.qty+'</span>';
                } else {
                    div.innerHTML='<div class="item-icon" style="background:'+(item.c||item.bd||'#666')+'"></div><span class="count">'+slot.qty+'</span>';
                }
                div.title=item.n||'Item';
            }
            div.onclick=()=>{selSlot=i;updateUI();};
            hb.appendChild(div);
        }
    }

    // Mostrar/esconder inventário (sem recriar)
    const invEl=document.getElementById('inventory');
    if(invEl){
        invEl.style.display=showInv?'block':'none';
    }

    const hpEl=document.getElementById('hp');
    if(hpEl){let hearts='';const fh=Math.floor(php/20);for(let i=0;i<5;i++)hearts+=i<fh?'❤️':'🖤';hpEl.textContent=hearts+' '+php+'/100';}
    const coordsEl=document.getElementById('coords');
    if(coordsEl)coordsEl.textContent='X:'+Math.floor(px/TILE)+' Y:'+Math.floor(py/TILE);
    const levelEl=document.getElementById('level');
    if(levelEl)levelEl.textContent='Lv:'+level;
    const xpFill=document.getElementById('xpFill');
    if(xpFill)xpFill.style.width=((xp/(level*50))*100)+'%';
    const fpsEl=document.getElementById('fps');
    if(fpsEl)fpsEl.textContent=fps+' FPS';
}

function renderInventory(){
    const invEl=document.getElementById('inventory');
    if(!invEl)return;
    const grid=invEl.querySelector('.inv-grid');
    if(!grid)return;

    grid.innerHTML='';
    for(let i=0;i<40;i++){
        const slot=inv[i];
        const div=document.createElement('div');
        div.className='inv-slot'+(i===selSlot?' selected':'')+(i===dragSource?' dragging':'');
        div.dataset.slot=i;
        div.draggable=true;

        if(slot.id!==0&&slot.qty>0){
            const item=ITEMS[slot.id];
            const imgPath = TOOL_IMAGE_MAP[slot.id];
            const hasImg = imgPath && imageLoadStatus[slot.id] === 'loaded';
            if (hasImg) {
                div.innerHTML='<div class="item-icon" style="background-image:url('+imgPath+');background-size:cover;background-position:center;background-color:'+(item.c||'#666')+';"></div><span class="count">'+slot.qty+'</span>';
            } else {
                div.innerHTML='<div class="item-icon" style="background:'+(item.c||item.bd||'#666')+'"></div><span class="count">'+slot.qty+'</span>';
            }
            div.title=item.n||'Item';
        }
        if(i<10)div.innerHTML+='<span class="key-hint">'+(i===9?0:i+1)+'</span>';

        div.addEventListener('mousedown',handleInvMouseDown);
        div.addEventListener('dragstart',handleDragStart);
        div.addEventListener('dragover',handleDragOver);
        div.addEventListener('drop',handleDrop);
        div.addEventListener('dragenter',handleDragEnter);
        div.addEventListener('dragleave',handleDragLeave);
        div.addEventListener('dragend',handleDragEnd);

        div.onclick=()=>{selSlot=i;updateUI();};
        grid.appendChild(div);
    }
}

// === SISTEMA DE DRAG AND DROP ===
function handleInvMouseDown(e){
    if(e.shiftKey){
        const slotIdx=parseInt(e.currentTarget.dataset.slot);
        if(isNaN(slotIdx))return;
        const slot=inv[slotIdx];
        if(slot.id!==0&&slot.qty>1){
            const half=Math.floor(slot.qty/2);
            for(let i=0;i<inv.length;i++){
                if(inv[i].id===0||inv[i].qty===0){
                    inv[i]={id:slot.id,qty:half};
                    slot.qty-=half;
                    invDirty=true;
                    updateUI();sfx('pickup');
                    break;
                }
            }
        }
    }
}

function handleDragStart(e){
    const slotIdx=parseInt(e.currentTarget.dataset.slot);
    if(isNaN(slotIdx))return;

    // Não permite drag de slot vazio
    if(inv[slotIdx].id===0||inv[slotIdx].qty===0){
        e.preventDefault();
        return;
    }

    dragSource=slotIdx;
    dragItemData={...inv[slotIdx]};
    isInventoryDragging=true;

    // Marca visual no slot de origem
    e.currentTarget.classList.add('dragging');

    // Configura dataTransfer
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain', String(slotIdx));

    // Cria imagem de drag customizada (opcional)
    const dragEl=document.getElementById('dragItem');
    if(dragEl&&dragItemData.id!==0){
        const item=ITEMS[dragItemData.id];
        const imgPath = TOOL_IMAGE_MAP[dragItemData.id];
        const hasImg = imgPath && imageLoadStatus[dragItemData.id] === 'loaded';
        if(hasImg){
            dragEl.querySelector('.item-icon').style.backgroundImage='url('+imgPath+')';
            dragEl.querySelector('.item-icon').style.backgroundSize='cover';
            dragEl.querySelector('.item-icon').style.backgroundPosition='center';
            dragEl.querySelector('.item-icon').style.backgroundColor=item.c||'#666';
        }else{
            dragEl.querySelector('.item-icon').style.background=item.c||item.bd||'#666';
            dragEl.querySelector('.item-icon').style.backgroundImage='none';
        }
        dragEl.querySelector('.count').textContent=dragItemData.qty;
        dragEl.style.display='block';
        e.dataTransfer.setDragImage(dragEl, 20, 20);
    }
}

function handleDragOver(e){
    e.preventDefault();
    e.dataTransfer.dropEffect='move';
}

function handleDragEnter(e){
    e.preventDefault();
    e.stopPropagation();
    const el=e.currentTarget;
    if(el&&el.classList.contains('inv-slot')){
        el.classList.add('drag-over');
    }
}

function handleDragLeave(e){
    e.stopPropagation();
    const el=e.currentTarget;
    if(el&&el.classList.contains('inv-slot')){
        el.classList.remove('drag-over');
    }
}

function handleDrop(e){
    e.preventDefault();
    e.stopPropagation();
    const targetEl=e.currentTarget;
    if(!targetEl||!targetEl.classList.contains('inv-slot'))return;
    const targetSlot=parseInt(targetEl.dataset.slot);
    if(isNaN(targetSlot))return;

    if(dragSource!==null&&dragSource!==targetSlot){
        const temp={...inv[targetSlot]};
        inv[targetSlot]={...dragItemData};
        inv[dragSource]=temp;
        sfx('pickup');
    }

    // Limpa estado
    dragSource=null;
    dragItemData={id:0,qty:0};
    isInventoryDragging=false;

    document.getElementById('dragItem').style.display='none';
    document.querySelectorAll('.inv-slot').forEach(el=>el.classList.remove('drag-over','dragging'));

    invDirty=true;
    updateUI();
}

function handleDragEnd(e){
    // Sempre limpa quando o drag termina (mesmo se cancelado)
    isInventoryDragging=false;
    dragSource=null;
    dragItemData={id:0,qty:0};
    document.getElementById('dragItem').style.display='none';
    document.querySelectorAll('.inv-slot').forEach(el=>el.classList.remove('drag-over','dragging'));
    invDirty=true;
    updateUI();
}

function updateCrafting(){
    const craftEl=document.getElementById('crafting');
    if(!craftEl)return;
    if(showCraft){
        craftEl.style.display='block';
        const list=craftEl.querySelector('.craft-list');
        if(list){
            list.innerHTML='';
            RECIPES.forEach((recipe,idx)=>{
                const can=canCraft(recipe);
                const div=document.createElement('div');
                div.className='craft-item'+(can?' can-craft':'');
                let ingText='';
                recipe.needs.forEach(n=>{const item=ITEMS[n.id];ingText+=(item?.n||'???')+' x'+n.qty+' ';});
                div.innerHTML='<div><span class="craft-name">'+recipe.name+'</span><br><span class="craft-ing">'+ingText+'</span></div>'+'<button '+(can?'':'disabled')+' onclick="doCraft(RECIPES['+idx+'])">Criar</button>';
                list.appendChild(div);
            });
        }
    }else{
        craftEl.style.display='none';
    }
}

// === SONS ===
let audioCtx=null;
function initAudio(){
    if(!audioCtx){
        audioCtx=new(window.AudioContext||window.webkitAudioContext)();
    }
}

function closeAudio(){
    if(audioCtx){
        audioCtx.close().catch(()=>{});
        audioCtx=null;
    }
}

function sfx(type){
    if(!audioCtx)return;
    if(audioCtx.state==='suspended')audioCtx.resume();
    const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
    osc.connect(gain);gain.connect(audioCtx.destination);
    if(type==='jump'){osc.frequency.setValueAtTime(250,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(450,audioCtx.currentTime+0.1);gain.gain.setValueAtTime(0.08,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.1);osc.start();osc.stop(audioCtx.currentTime+0.1);}
    else if(type==='break'){osc.type='square';osc.frequency.setValueAtTime(180,audioCtx.currentTime);gain.gain.setValueAtTime(0.05,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.05);osc.start();osc.stop(audioCtx.currentTime+0.05);}
    else if(type==='place'){osc.frequency.setValueAtTime(400,audioCtx.currentTime);gain.gain.setValueAtTime(0.05,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.05);osc.start();osc.stop(audioCtx.currentTime+0.05);}
    else if(type==='pickup'){osc.type='sine';osc.frequency.setValueAtTime(500,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(800,audioCtx.currentTime+0.1);gain.gain.setValueAtTime(0.06,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.1);osc.start();osc.stop(audioCtx.currentTime+0.1);}
    else if(type==='hurt'){osc.type='sawtooth';osc.frequency.setValueAtTime(200,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(80,audioCtx.currentTime+0.2);gain.gain.setValueAtTime(0.08,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.2);osc.start();osc.stop(audioCtx.currentTime+0.2);}
}

// === START ===
function startGame(){
    initAudio();
    const seedInput=document.getElementById('worldSeed');
    const nameInput=document.getElementById('playerName');
    playerName=nameInput.value || 'Jogador';

    // Mostrar tela de carregamento
    const startScreen = document.getElementById('startScreen');
    const oldContent = startScreen.innerHTML;
    startScreen.innerHTML = '<div class="start-content"><h1>🎮 TERRARIACRAFT</h1><p class="subtitle">Carregando texturas...</p><div style="margin-top:20px;font-size:24px;">⏳</div></div>';

    // Carrega imagens e depois inicia o jogo
    loadBlockImages(() => {
        genWorld(seedInput && seedInput.value ? seedInput.value : '');
        startScreen.style.display='none';
        startScreen.innerHTML = oldContent; // restaura para próxima vez
        gameOn=true;
        gamePaused=false;
        updateUI();
        startIntervals();
        console.log("JOGO INICIADO v5.4 - Player: "+playerName);
    });
}

function toast(msg){
    const t=document.createElement('div');
    t.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:8px;font-family:monospace;z-index:10000;border:1px solid #4ade80;font-size:14px;';
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),2500);
}

// === INTERVALS ===
function startIntervals(){
    cleanupIntervals();

    // Regeneração de HP
    regenInterval=setInterval(()=>{
        if(gameOn&&!gamePaused&&php<100){
            php+=1;
            updateUI();
        }
    },2500);

    // Auto-save
    autoSaveInterval=setInterval(()=>{
        if(gameOn&&!gamePaused&&playerName!=='default'){
            saveGame();
        }
    },60000);
}

function cleanupIntervals(){
    if(autoSaveInterval){clearInterval(autoSaveInterval);autoSaveInterval=null;}
    if(regenInterval){clearInterval(regenInterval);regenInterval=null;}
}

function cleanupGame(){
    gameOn=false;
    gamePaused=false;
    cleanupIntervals();
    closeAudio();
    removeAllListeners();
    particles=[];
    drops=[];
    floatingTexts=[];
}

// === LOOP OTIMIZADO COM TRY/CATCH ===
let lastFrameTime=0;
const TARGET_FPS=60;
const FRAME_TIME=1000/TARGET_FPS;
let animationFrameId=null;

function loop(currentTime){
    animationFrameId=requestAnimationFrame(loop);

    try{
        const deltaTime=currentTime-lastFrameTime;
        if(deltaTime<FRAME_TIME)return;
        lastFrameTime=currentTime-(deltaTime%FRAME_TIME);

        update();
        draw();
    }catch(err){
        console.error('Erro no loop do jogo:', err);
        // Não crashar completamente, tentar continuar
        if(err.message && err.message.includes('Acesso negado')){
            cleanupGame();
        }
    }
}

// Iniciar loop
animationFrameId=requestAnimationFrame(loop);

// === PREENCHER DADOS DO USUÁRIO ===
document.getElementById('playerName').value = loggedUser;
const userNameEl = document.getElementById('userName');
if(userNameEl) userNameEl.textContent = loggedUser;

// Cleanup ao sair da página
window.addEventListener('beforeunload', ()=>{
    cleanupGame();
});