

<!DOCTYPE html>


<!-- teste de atualização git
  -->sdgfsfdgdfgdfgfdgfdg
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>TerrariaCraft - Completo</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { background: #0f172a; overflow: hidden; font-family: 'Courier New', monospace; user-select: none; }
        #gameContainer { position: relative; width: 100vw; height: 100vh; }
        canvas { display: block; width: 100vw; height: 100vh; cursor: crosshair; }

        /* UI */
        #ui { position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none; display: flex; flex-direction: column; justify-content: space-between; padding: 10px; z-index: 10; }

        #topBar { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; background: rgba(0,0,0,0.6); border-radius: 6px; font-size: 13px; font-weight: bold; color: #fff; max-width: 450px; margin: 0 auto; width: 100%; border: 1px solid rgba(255,255,255,0.1); }
        #hp { color: #ef4444; }
        #time { color: #fbbf24; }
        #coords { color: #94a3b8; font-size: 12px; }

        /* Hotbar */
        #hotbar { position: absolute; bottom: 45px; left: 20px; display: flex; gap: 4px; pointer-events: auto; background: rgba(0,0,0,0.5); padding: 5px; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1); }
        .slot { width: 44px; height: 44px; background: rgba(0,0,0,0.7); border: 2px solid #475569; border-radius: 4px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; transition: all 0.15s; }
        .slot:hover { border-color: #64748b; }
        .slot.active { border-color: #4ade80; box-shadow: 0 0 10px rgba(74,222,128,0.5); transform: translateY(-3px); }
        .slot .item-icon { width: 24px; height: 24px; border-radius: 2px; border: 1px solid rgba(255,255,255,0.2); }
        .slot .count { position: absolute; bottom: 1px; right: 3px; font-size: 10px; color: #fff; font-weight: bold; text-shadow: 1px 1px 0 #000; }

        /* Inventário */
        #inventory { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(15,23,42,0.98); border: 2px solid #334155; border-radius: 10px; padding: 15px; pointer-events: auto; z-index: 100; display: none; min-width: 380px; max-width: 90vw; }
        #inventory h3 { color: #4ade80; text-align: center; margin-bottom: 10px; font-size: 14px; }
        .inv-grid { display: grid; grid-template-columns: repeat(10, 1fr); gap: 3px; }
        .inv-slot { width: 34px; height: 34px; background: rgba(30,41,59,0.8); border: 1px solid #475569; border-radius: 3px; display: flex; align-items: center; justify-content: center; position: relative; cursor: pointer; }
        .inv-slot.selected { border-color: #4ade80; }
        .inv-slot .item-icon { width: 20px; height: 20px; border-radius: 2px; }
        .inv-slot .count { position: absolute; bottom: 1px; right: 2px; font-size: 9px; color: #fff; }
        .inv-slot .key-hint { position: absolute; top: 1px; left: 2px; font-size: 8px; color: #64748b; }
        .inv-hint { text-align: center; color: #64748b; font-size: 11px; margin-top: 8px; }

        /* Crafting */
        #crafting { position: fixed; top: 50%; left: 50%; transform: translate(-50%,-50%); background: rgba(15,23,42,0.98); border: 2px solid #334155; border-radius: 10px; padding: 15px; pointer-events: auto; z-index: 100; display: none; min-width: 340px; max-width: 90vw; max-height: 70vh; overflow-y: auto; }
        #crafting h3 { color: #fbbf24; text-align: center; margin-bottom: 10px; font-size: 14px; }
        .craft-list { display: flex; flex-direction: column; gap: 6px; }
        .craft-item { background: rgba(30,41,59,0.8); border: 1px solid #475569; border-radius: 6px; padding: 8px 12px; display: flex; justify-content: space-between; align-items: center; }
        .craft-item.can-craft { border-color: #4ade80; }
        .craft-name { font-weight: bold; color: #e2e8f0; font-size: 12px; }
        .craft-ing { color: #94a3b8; font-size: 10px; }
        .craft-item button { padding: 4px 12px; background: #334155; color: #e2e8f0; border: 1px solid #475569; border-radius: 3px; cursor: pointer; font-size: 11px; }
        .craft-item.can-craft button { background: #4ade80; color: #0f172a; font-weight: bold; }
        .craft-item button:disabled { opacity: 0.4; cursor: not-allowed; }
        .craft-hint { text-align: center; color: #64748b; font-size: 11px; margin-top: 8px; }

        /* Controles */
        #controls { text-align: center; font-size: 10px; color: rgba(255,255,255,0.4); background: rgba(0,0,0,0.4); padding: 5px 12px; border-radius: 15px; align-self: center; margin-bottom: 2px; }
        #controls span { color: #94a3b8; font-weight: bold; }

        /* Tela inicial */
        #startScreen { position: fixed; top: 0; left: 0; width: 100%; height: 100%; z-index: 1000; display: flex; align-items: center; justify-content: center; background: linear-gradient(180deg, #0f172a 0%, #1e293b 100%); }
        .start-content { text-align: center; padding: 2rem; max-width: 420px; }
        .start-content h1 { color: #4ade80; font-size: 1.8rem; text-shadow: 3px 3px 0 #166534; margin-bottom: 0.5rem; }
        .subtitle { color: #94a3b8; margin-bottom: 1.5rem; }
        input { padding: 10px 16px; font-size: 14px; border: 2px solid #334155; border-radius: 6px; background: #1e293b; color: #fff; text-align: center; width: 220px; outline: none; font-family: monospace; margin-bottom: 6px; display: block; margin-left: auto; margin-right: auto; }
        input:focus { border-color: #4ade80; }
        input::placeholder { color: #475569; }
        .buttons { display: flex; flex-direction: column; gap: 8px; align-items: center; margin: 1rem 0; }
        button, .btn { padding: 12px 30px; font-size: 13px; font-family: monospace; font-weight: bold; border: none; border-radius: 6px; cursor: pointer; transition: all 0.2s; min-width: 200px; text-decoration: none; display: inline-block; }
        .btn-primary { background: #4ade80; color: #0f172a; }
        .btn-primary:hover { background: #22c55e; }
        .btn-secondary { background: transparent; color: #e2e8f0; border: 2px solid #475569; }
        .btn-secondary:hover { background: #334155; }
        .help { background: rgba(30,41,59,0.8); border: 1px solid #334155; border-radius: 8px; padding: 12px; text-align: left; margin-top: 1rem; }
        .help h4 { color: #4ade80; font-size: 11px; margin-bottom: 8px; text-align: center; }
        .help-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 4px; }
        .help-grid span { font-size: 11px; color: #94a3b8; }
        kbd { background: #334155; border: 1px solid #475569; border-radius: 2px; padding: 1px 4px; font-size: 9px; color: #e2e8f0; }
        .version { color: #475569; font-size: 10px; margin-top: 1rem; }
    </style>
</head>
<body>
    <div id="gameContainer">
        <canvas id="gameCanvas"></canvas>

        <div id="ui">
            <div id="topBar">
                <span id="hp">❤️❤️❤️❤️❤️ 100/100</span>
                <span id="time">☀️ Dia</span>
                <span id="coords">X:0 Y:0</span>
            </div>

            <div id="hotbar"></div>

            <div id="inventory" style="display:none;">
                <h3>📦 INVENTÁRIO</h3>
                <div class="inv-grid"></div>
                <p class="inv-hint">Clique no slot para selecionar | E para fechar</p>
            </div>

            <div id="crafting" style="display:none;">
                <h3>🔨 CRAFTING</h3>
                <div class="craft-list"></div>
                <p class="craft-hint">C para fechar</p>
            </div>

            <div id="controls">
                <span>WASD</span> Mover | <span>Mouse</span> Quebrar/Colocar | <span>1-0</span> Hotbar | <span>E</span> Inv | <span>C</span> Craft
            </div>
        </div>

        <div id="startScreen">
            <div class="start-content">
                <h1>🎮 TERRARIACRAFT</h1>
                <p class="subtitle">v5.1 - Unificado</p>
                <input type="text" id="worldSeed" placeholder="Seed do mundo (opcional)" maxlength="20">
                <div class="buttons">
                    <button class="btn-primary" onclick="startGame()">▶ NOVO JOGO</button>
                </div>
                <div class="help">
                    <h4>🕹️ CONTROLES</h4>
                    <div class="help-grid">
                        <span><kbd>WASD</kbd> Mover/Pular</span>
                        <span><kbd>Mouse Esq</kbd> Quebrar</span>
                        <span><kbd>Mouse Dir</kbd> Colocar</span>
                        <span><kbd>1-0</kbd> Hotbar</span>
                        <span><kbd>E / I</kbd> Inventário</span>
                        <span><kbd>C</kbd> Crafting</span>
                    </div>
                </div>
                <p class="version">v5.1 | Seed | Crafting | Ferramentas | Biomas</p>
            </div>
        </div>
    </div>

<script>
// ==========================================
// TERRARIACRAFT v5.1 - TUDO EM UM ARQUIVO
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE = 32;
const WW = 100;
const WH = 60;

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
    56:{n:'Espada de Madeira',type:'weapon',damage:8,c:'#8B4513'},
    57:{n:'Espada de Pedra',type:'weapon',damage:12,c:'#9ca3af'},
};

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
let frame=0;
let time=0;
let particles=[];
let drops=[];
let enemies=[];

// === PLAYER ===
let px=0,py=0,pvx=0,pvy=0;
let pw=28,ph=48;
let grounded=false,php=100;
let pface=1,pInv=0;
let mining=false,mineT=0,mineTarget=null;

// === INVENTÁRIO ===
let inv=[];
for(let i=0;i<40;i++)inv.push({id:0,qty:0});
let selSlot=0;
let showInv=false;
let showCraft=false;

// === CUSTOM ===
let custom=JSON.parse(localStorage.getItem('terrariacraft_custom')||'{}');
if(!custom.skin)custom={skin:'#ffdbac',hair:'#4a2c0f',hairStyle:0,shirt:'#3b82f6',pants:'#1e3a5f',shoes:'#374151',eyeColor:'#1f2937'};

// === INPUT ===
const keys={};
let mx=0,my=0,mDown=false,mRight=false;

document.addEventListener('keydown',e=>{
    keys[e.key]=true;
    if(e.key>='1'&&e.key<='9'){selSlot=parseInt(e.key)-1;updateUI();}
    if(e.key==='0'){selSlot=9;updateUI();}
    if(e.key.toLowerCase()==='e'||e.key==='Escape'||e.key.toLowerCase()==='i'){showInv=!showInv;showCraft=false;updateUI();updateCrafting();}
    if(e.key.toLowerCase()==='c'){showCraft=!showCraft;showInv=false;updateUI();updateCrafting();}
});
document.addEventListener('keyup',e=>keys[e.key]=false);
canvas.addEventListener('mousemove',e=>{const r=canvas.getBoundingClientRect();mx=e.clientX-r.left;my=e.clientY-r.top;});
canvas.addEventListener('mousedown',e=>{if(!gameOn)return;if(e.button===0){mDown=true;doMine();}else if(e.button===2){mRight=true;doPlace();}});
canvas.addEventListener('mouseup',e=>{if(e.button===0){mDown=false;mining=false;mineTarget=null;}if(e.button===2)mRight=false;});
canvas.addEventListener('contextmenu',e=>e.preventDefault());

// ==========================================
// GERAR MUNDO
// ==========================================
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

    // Bioma de neve
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

    // Spawn
    const sx=20;
    const sy=heights[sx]-3;
    px=sx*TILE;
    py=sy*TILE;
    pvx=0;pvy=0;php=100;grounded=false;

    // CÂMERA IMEDIATA
    camX=px-canvas.width/2+pw/2;
    camY=py-canvas.height/2+ph/2;
    camX=Math.max(0,Math.min(camX,WW*TILE-canvas.width));
    camY=Math.max(0,Math.min(camY,WH*TILE-canvas.height));

    // Inimigos
    enemies=[];
    for(let i=0;i<5;i++){
        const ex=40+randInt(0,40);
        const es=heights[ex]||25;
        enemies.push({x:ex*TILE,y:(es-3)*TILE,w:32,h:26,vx:(rand()-0.5)*2,vy:0,hp:3,color:'#ff6b6b',grounded:false,anim:0});
    }

    // Inventário
    inv=[];for(let i=0;i<40;i++)inv.push({id:0,qty:0});
    addItem(1,20);addItem(2,15);addItem(4,10);addItem(8,5);
    addItem(11,5);addItem(12,10);
    addItem(50,1);addItem(52,1);addItem(54,1);addItem(56,1);
    selSlot=0;

    particles=[];drops=[];
    time=0;frame=0;

    console.log('MUNDO GERADO! Player:',sx,sy,'Cam:',Math.floor(camX),Math.floor(camY));
}

function addItem(id,qty){
    for(let i=0;i<inv.length;i++)if(inv[i].id===id&&inv[i].qty>0){inv[i].qty+=qty;return;}
    for(let i=0;i<inv.length;i++)if(inv[i].id===0||inv[i].qty===0){inv[i].id=id;inv[i].qty=qty;return;}
}
function remItem(slot,qty){
    if(inv[slot].qty>=qty){inv[slot].qty-=qty;if(inv[slot].qty<=0){inv[slot].id=0;inv[slot].qty=0;}return true;}
    return false;
}

// ==========================================
// COLISÃO
// ==========================================
function hit(a,b){return!(b.x>=a.x+a.w||b.x+b.w<=a.x||b.y>=a.y+a.h||b.y+b.h<=a.y);}

function getTiles(x,y,w,h){
    const tiles=[];
    const sx=Math.max(0,Math.floor(x/TILE));
    const ex=Math.min(WW-1,Math.floor((x+w-0.1)/TILE));
    const sy=Math.max(0,Math.floor(y/TILE));
    const ey=Math.min(WH-1,Math.floor((y+h-0.1)/TILE));
    for(let ty=sy;ty<=ey;ty++){
        for(let tx=sx;tx<=ex;tx++){
            const b=BLK[world[ty][tx]];
            if(b&&(b.s||b.plat))tiles.push({x:tx*TILE,y:ty*TILE,plat:b.plat});
        }
    }
    return tiles;
}

function resolveEntity(e){
    e.x+=e.vx;
    let tiles=getTiles(e.x,e.y,e.w,e.h);
    for(const t of tiles){
        if(t.plat&&e.vy>=0)continue;
        if(hit(e,{x:t.x,y:t.y,w:TILE,h:TILE})){
            if(e.vx>0)e.x=t.x-e.w;
            else if(e.vx<0)e.x=t.x+TILE;
            e.vx=0;
        }
    }
    e.y+=e.vy;e.grounded=false;
    tiles=getTiles(e.x,e.y,e.w,e.h);
    for(const t of tiles){
        if(hit(e,{x:t.x,y:t.y,w:TILE,h:TILE})){
            if(e.vy>0){e.y=t.y-e.h;e.grounded=true;}
            else if(e.vy<0)e.y=t.y+TILE;
            e.vy=0;
        }
    }
}

// ==========================================
// MINERAR / COLOCAR
// ==========================================
function wPos(){return{x:Math.floor((mx+camX)/TILE),y:Math.floor((my+camY)/TILE)};}

function getHeldTool(){
    const item=ITEMS[inv[selSlot].id];
    if(item&&item.type==='tool')return item;
    return null;
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
    for(let i=0;i<6;i++)particles.push({x:bcx,y:bcy,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,life:25,color:BLK[bid].c,size:3+Math.random()*3});
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
    if(hit({x:tx*TILE,y:ty*TILE,w:TILE,h:TILE},{x:px,y:py,w:pw,h:ph}))return;

    world[ty][tx]=itemId;
    remItem(selSlot,1);
    updateUI();
    sfx('place');
    for(let i=0;i<4;i++)particles.push({x:bcx,y:bcy,vx:(Math.random()-0.5)*3,vy:(Math.random()-0.5)*3-1,life:12,color:BLK[itemId].c,size:3});
}

// ==========================================
// CRAFTING
// ==========================================
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
    updateUI();updateCrafting();
}

// ==========================================
// UPDATE
// ==========================================
function update(){
    if(!gameOn)return;
    frame++;

    let moving=false;
    if(keys['ArrowLeft']||keys['a']){pvx=-3.5;pface=-1;moving=true;}
    else if(keys['ArrowRight']||keys['d']){pvx=3.5;pface=1;moving=true;}
    else{pvx*=0.75;if(Math.abs(pvx)<0.1)pvx=0;}

    if((keys['ArrowUp']||keys['w']||keys[' '])&&grounded){
        pvy=-10;grounded=false;sfx('jump');
    }

    pvy+=0.45;
    if(pvy>12)pvy=12;

    const pObj={x:px,y:py,w:pw,h:ph,vx:pvx,vy:pvy};
    resolveEntity(pObj);
    px=pObj.x;py=pObj.y;pvx=pObj.vx;pvy=pObj.vy;grounded=pObj.grounded;

    if(px<0){px=0;pvx=0;}
    if(px>WW*TILE-pw){px=WW*TILE-pw;pvx=0;}
    if(py>WH*TILE){py=200;pvy=0;php-=20;}

    // Câmera
    const tx=px-canvas.width/2+pw/2;
    const ty=py-canvas.height/2+ph/2;
    const maxCX=Math.max(0,WW*TILE-canvas.width);
    const maxCY=Math.max(0,WH*TILE-canvas.height);
    camX+=(tx-camX)*0.1;
    camY+=(ty-camY)*0.1;
    camX=Math.max(0,Math.min(camX,maxCX));
    camY=Math.max(0,Math.min(camY,maxCY));

    // Drops
    for(let i=drops.length-1;i>=0;i--){
        const d=drops[i];
        d.vy+=0.3;d.x+=d.vx;d.y+=d.vy;d.life--;
        const dtx=Math.floor((d.x+d.w/2)/TILE);
        const dty=Math.floor((d.y+d.h)/TILE);
        if(dty>=0&&dty<WH&&dtx>=0&&dtx<WW){
            const b=BLK[world[dty][dtx]];
            if(b&&b.s){d.y=dty*TILE-d.h;d.vy=-d.vy*0.4;d.vx*=0.8;}
        }
        if(hit(d,{x:px,y:py,w:pw,h:ph})){addItem(d.id,1);drops.splice(i,1);updateUI();sfx('pickup');continue;}
        if(d.life<=0)drops.splice(i,1);
    }

    // Inimigos
    enemies.forEach(e=>{
        e.vy+=0.45;e.anim+=0.1;
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

        if(pInv<=0&&hit(e,{x:px,y:py,w:pw,h:ph})){
            php-=15;pInv=90;pvx=e.vx>0?10:-10;pvy=-6;
            sfx('hurt');updateUI();
            for(let i=0;i<5;i++)particles.push({x:px+pw/2,y:py+ph/2,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,life:18,color:'#ef4444',size:4});
        }
    });
    if(pInv>0)pInv--;

    // Partículas
    for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.1;p.life--;
        if(p.life<=0)particles.splice(i,1);
    }

    time=(time+0.3)%2400;

    if(mDown&&!showInv&&!showCraft)doMine();
    if(mRight&&!showInv&&!showCraft)doPlace();

    if(php<=0){
        toast('💀 MORREU! Respawnando...');
        setTimeout(()=>{genWorld();php=100;updateUI();},1500);
    }

    updateUI();
}

// ==========================================
// RENDER - GARANTIDO (mesma lógica do básico)
// ==========================================
function draw(){
    if(world.length === 0){
    return;
}
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
    if(night){ctx.fillStyle=`rgba(255,255,255,${np})`;for(let i=0;i<60;i++){const sx=(i*137.5)%canvas.width,sy=(i*53.3)%(canvas.height*0.5);ctx.globalAlpha=(Math.sin(time*0.05+i)*0.5+0.5)*np;ctx.fillRect(sx,sy,2,2);}ctx.globalAlpha=1;}

    // Nuvens
    ctx.fillStyle=night?'rgba(100,120,140,0.3)':'rgba(255,255,255,0.4)';
    for(let i=0;i<4;i++){const cx=((i*300+time*0.2)%(canvas.width+200))-100,cy=50+i*40+Math.sin(i+time*0.01)*20;ctx.beginPath();ctx.ellipse(cx,cy,55,22,0,0,Math.PI*2);ctx.fill();}

    // ===== MUNDO =====
    const sc=Math.max(0,Math.floor(camX/TILE));
    const ec=Math.min(WW-1,sc+Math.ceil(canvas.width/TILE)+2);
    const sr=Math.max(0,Math.floor(camY/TILE));
    const er=Math.min(WH-1,sr+Math.ceil(canvas.height/TILE)+2);

    for(let y=sr;y<=er;y++){
        for(let x=sc;x<=ec;x++){
            const bid=world[y][x];
            if(bid===0)continue;
            const b=BLK[bid];
            if(!b||!b.c)continue;
            const dx=x*TILE-Math.floor(camX);
            const dy=y*TILE-Math.floor(camY);
            if(dx<-TILE||dx>canvas.width||dy<-TILE||dy>canvas.height)continue;

            ctx.fillStyle=b.c;
            ctx.fillRect(dx,dy,TILE,TILE);
            ctx.fillStyle=b.bd;
            ctx.fillRect(dx,dy,TILE,2);
            ctx.fillRect(dx,dy,2,TILE);
            ctx.fillStyle='rgba(0,0,0,0.15)';
            ctx.fillRect(dx+TILE-2,dy,2,TILE);
            ctx.fillRect(dx,dy+TILE-2,TILE,2);
        }
    }

    // Drops
    drops.forEach(d=>{
        const b=BLK[d.id];if(!b)return;
        const dx=d.x-Math.floor(camX),dy=d.y-Math.floor(camY);
        ctx.fillStyle=b.c;ctx.fillRect(dx,dy,d.w,d.h);
        ctx.strokeStyle=b.bd;ctx.lineWidth=1;ctx.strokeRect(dx,dy,d.w,d.h);
    });

    // Inimigos
    enemies.forEach(e=>{
        const dx=e.x-Math.floor(camX),dy=e.y-Math.floor(camY);
        const sq=Math.sin(e.anim*3)*2;
        ctx.fillStyle=e.color;ctx.fillRect(dx,dy+sq,e.w,e.h-sq);
        ctx.fillStyle='#fff';ctx.fillRect(dx+6,dy+sq+8,8,8);ctx.fillRect(dx+18,dy+sq+8,8,8);
        ctx.fillStyle='#000';ctx.fillRect(dx+8,dy+sq+10,4,4);ctx.fillRect(dx+20,dy+sq+10,4,4);
    });

    // PLAYER
    drawPlayer();

    // Partículas
    particles.forEach(p=>{ctx.fillStyle=p.color;ctx.globalAlpha=p.life/25;ctx.fillRect(p.x-p.size/2-Math.floor(camX),p.y-p.size/2-Math.floor(camY),p.size,p.size);});
    ctx.globalAlpha=1;

    // Highlight mouse
    const mwx=Math.floor((mx+camX)/TILE)*TILE-Math.floor(camX);
    const mwy=Math.floor((my+camY)/TILE)*TILE-Math.floor(camY);
    ctx.strokeStyle='rgba(255,255,255,0.8)';ctx.lineWidth=2;ctx.strokeRect(mwx,mwy,TILE,TILE);

    // Mineração
    if(mining&&mineTarget){
        const mtx=mineTarget.tx*TILE-Math.floor(camX);
        const mty=mineTarget.ty*TILE-Math.floor(camY);
        const prog=mineT/20;
        ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(mtx,mty-5,TILE,3);
        ctx.fillStyle='#fbbf24';ctx.fillRect(mtx,mty-5,TILE*prog,3);
    }

    // Debug
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

    const armSwing=grounded&&Math.abs(pvx)>0.5?Math.sin(frame*0.15+Math.PI)*6:0;
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

    if(mining){
        ctx.fillStyle='#9ca3af';
        const tx=pface>0?pdx+pw+2:pdx-12,ty=pdy+22;
        ctx.fillRect(tx,ty,10,4);ctx.fillStyle='#4b5563';
        ctx.fillRect(tx+(pface>0?8:-2),ty-6,4,10);
    }
}

function drawDebug(){
    ctx.fillStyle='rgba(0,0,0,0.75)';
    ctx.fillRect(10,10,260,120);
    ctx.strokeStyle='#4ade80';ctx.lineWidth=1;ctx.strokeRect(10,10,260,120);
    ctx.fillStyle='#4ade80';ctx.font='12px monospace';
    ctx.fillText('=== DEBUG ===',18,26);
    ctx.fillStyle='#94a3b8';
    ctx.fillText('P: '+Math.floor(px)+','+Math.floor(py)+' G:'+grounded,18,42);
    ctx.fillText('Cam: '+Math.floor(camX)+','+Math.floor(camY),18,58);
    ctx.fillText('Tile: '+Math.floor(px/TILE)+','+Math.floor(py/TILE),18,74);
    ctx.fillText('HP:'+php+' Frame:'+frame,18,90);
    ctx.fillText('Slot:'+selSlot+' '+(ITEMS[inv[selSlot].id]?.n||'Vazio'),18,106);
    ctx.fillText('Drops:'+drops.length+' Enemies:'+enemies.length,18,122);
}

// ==========================================
// UI
// ==========================================
function updateUI(){
    const hb=document.getElementById('hotbar');
    if(hb){hb.innerHTML='';for(let i=0;i<10;i++){const slot=inv[i];const div=document.createElement('div');div.className='slot'+(i===selSlot?' active':'');if(slot.id!==0&&slot.qty>0){const item=ITEMS[slot.id];div.innerHTML='<div class="item-icon" style="background:'+(item.c||item.bd||'#666')+'"></div><span class="count">'+slot.qty+'</span>';div.title=item.n||'Item';}div.onclick=()=>{selSlot=i;updateUI();};hb.appendChild(div);}}

    const invEl=document.getElementById('inventory');
    if(invEl){if(showInv){invEl.style.display='block';const grid=invEl.querySelector('.inv-grid');if(grid){grid.innerHTML='';for(let i=0;i<40;i++){const slot=inv[i];const div=document.createElement('div');div.className='inv-slot'+(i===selSlot?' selected':'');div.dataset.slot=i;if(slot.id!==0&&slot.qty>0){const item=ITEMS[slot.id];div.innerHTML='<div class="item-icon" style="background:'+(item.c||item.bd||'#666')+'"></div><span class="count">'+slot.qty+'</span>';div.title=item.n||'Item';}if(i<10)div.innerHTML+='<span class="key-hint">'+(i===9?0:i+1)+'</span>';div.onclick=()=>{selSlot=i;updateUI();};grid.appendChild(div);}}}else{invEl.style.display='none';}}

    const hpEl=document.getElementById('hp');if(hpEl){let hearts='';const fh=Math.floor(php/20);for(let i=0;i<5;i++)hearts+=i<fh?'❤️':'🖤';hpEl.textContent=hearts+' '+php+'/100';}
    const coordsEl=document.getElementById('coords');if(coordsEl)coordsEl.textContent='X:'+Math.floor(px/TILE)+' Y:'+Math.floor(py/TILE);
}

function updateCrafting(){
    const craftEl=document.getElementById('crafting');
    if(!craftEl)return;
    if(showCraft){craftEl.style.display='block';const list=craftEl.querySelector('.craft-list');if(list){list.innerHTML='';RECIPES.forEach((recipe,idx)=>{const can=canCraft(recipe);const div=document.createElement('div');div.className='craft-item'+(can?' can-craft':'');let ingText='';recipe.needs.forEach(n=>{const item=ITEMS[n.id];ingText+=(item?.n||'???')+' x'+n.qty+' ';});div.innerHTML='<div><span class="craft-name">'+recipe.name+'</span><br><span class="craft-ing">'+ingText+'</span></div>'+'<button '+(can?'':'disabled')+' onclick="doCraft(RECIPES['+idx+'])">Criar</button>';list.appendChild(div);});}}else{craftEl.style.display='none';}
}

// ==========================================
// SONS
// ==========================================
let audioCtx = null;

function initAudio(){
    if(!audioCtx){
        audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
}function sfx(type){
    if(audioCtx.state==='suspended')audioCtx.resume();
    const osc=audioCtx.createOscillator(),gain=audioCtx.createGain();
    osc.connect(gain);gain.connect(audioCtx.destination);
    if(type==='jump'){osc.frequency.setValueAtTime(250,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(450,audioCtx.currentTime+0.1);gain.gain.setValueAtTime(0.08,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.1);osc.start();osc.stop(audioCtx.currentTime+0.1);}
    else if(type==='break'){osc.type='square';osc.frequency.setValueAtTime(180,audioCtx.currentTime);gain.gain.setValueAtTime(0.05,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.05);osc.start();osc.stop(audioCtx.currentTime+0.05);}
    else if(type==='place'){osc.frequency.setValueAtTime(400,audioCtx.currentTime);gain.gain.setValueAtTime(0.05,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.05);osc.start();osc.stop(audioCtx.currentTime+0.05);}
    else if(type==='pickup'){osc.type='sine';osc.frequency.setValueAtTime(500,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(800,audioCtx.currentTime+0.1);gain.gain.setValueAtTime(0.06,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.1);osc.start();osc.stop(audioCtx.currentTime+0.1);}
    else if(type==='hurt'){osc.type='sawtooth';osc.frequency.setValueAtTime(200,audioCtx.currentTime);osc.frequency.exponentialRampToValueAtTime(80,audioCtx.currentTime+0.2);gain.gain.setValueAtTime(0.08,audioCtx.currentTime);gain.gain.exponentialRampToValueAtTime(0.01,audioCtx.currentTime+0.2);osc.start();osc.stop(audioCtx.currentTime+0.2);}
}

// ==========================================
// START
// ==========================================
function startGame(){

    initAudio();

    const seedInput = document.getElementById('worldSeed');

    genWorld(seedInput ? seedInput.value : '');

    document.getElementById('startScreen').style.display = 'none';

    gameOn = true;

    updateUI();

    console.log("JOGO INICIADO");
}

function toast(msg){
    const t=document.createElement('div');
    t.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:8px;font-family:monospace;z-index:10000;border:1px solid #4ade80;font-size:14px;';
    t.textContent=msg;document.body.appendChild(t);setTimeout(()=>t.remove(),2500);
}

// ==========================================
// LOOP
// ==========================================
function loop(){update();draw();requestAnimationFrame(loop);}
loop();
window.addEventListener('resize', () => {

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

});
</script>
</body>
</html>
