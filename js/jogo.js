// ==========================================
// TERRARIACRAFT SURVIVAL HARDCORE v6.0
// Morreu = Game Over | Dias | Ondas | Dificuldade progressiva
// ==========================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const TILE = 32;
const WW = 100;
const WH = 60;

// === PERFORMANCE ===
const MAX_PARTICLES = 100;
const MAX_DROPS_RENDER = 50;
const MAX_ENEMIES_RENDER = 20;
const MAX_ENEMIES_TOTAL = 30;
let lastTime = 0;
let fps = 60;

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
    15:{n:'Cama',s:true,c:'#b91c1c',bd:'#7f1d1d',drop:15},
    16:{n:'Muro de Madeira',s:true,c:'#654321',bd:'#4a3018',drop:4,tool:'axe'},
    17:{n:'Porta',s:false,c:'#8B4513',bd:'#654321',drop:4},
    18:{n:'Fogueira',s:false,c:'#ea580c',bd:'#c2410c',drop:11,light:true},
};

// === ITENS ===
const ITEMS = {...BLK,
    50:{n:'Picareta de Pedra',type:'tool',tool:'pickaxe',power:1,c:'#9ca3af'},
    51:{n:'Picareta de Ferro',type:'tool',tool:'pickaxe',power:2,c:'#64748b'},
    52:{n:'Machado de Pedra',type:'tool',tool:'axe',power:1,c:'#9ca3af'},
    53:{n:'Machado de Ferro',type:'tool',tool:'axe',power:2,c:'#64748b'},
    54:{n:'Pá de Pedra',type:'tool',tool:'shovel',power:1,c:'#9ca3af'},
    55:{n:'Pá de Ferro',type:'tool',tool:'shovel',power:2,c:'#64748b'},
    56:{n:'Espada de Madeira',type:'weapon',damage:12,c:'#8B4513'},
    57:{n:'Espada de Pedra',type:'weapon',damage:18,c:'#9ca3af'},
    58:{n:'Espada de Ferro',type:'weapon',damage:25,c:'#64748b'},
    59:{n:'Arco de Madeira',type:'weapon',damage:15,c:'#8B4513',ranged:true},
    60:{n:'Flecha',type:'ammo',c:'#d4d4d4'},
    100:{n:'Poção de Vida',type:'potion',heal:50,c:'#ef4444'},
    101:{n:'Poção de Velocidade',type:'potion',buff:'speed',duration:600,c:'#3b82f6'},
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
    {result:58,qty:1,needs:[{id:6,qty:4},{id:4,qty:2}],name:'Espada de Ferro'},
    {result:15,qty:1,needs:[{id:4,qty:8},{id:1,qty:3}],name:'Cama'},
    {result:16,qty:2,needs:[{id:4,qty:2}],name:'Muro de Madeira'},
    {result:17,qty:1,needs:[{id:4,qty:4}],name:'Porta'},
    {result:18,qty:1,needs:[{id:4,qty:3},{id:1,qty:2}],name:'Fogueira'},
    {result:59,qty:1,needs:[{id:4,qty:5},{id:2,qty:1}],name:'Arco de Madeira'},
    {result:60,qty:10,needs:[{id:4,qty:1},{id:2,qty:1}],name:'Flecha'},
    {result:100,qty:2,needs:[{id:3,qty:2},{id:11,qty:1}],name:'Poção de Vida'},
];

// === SISTEMA DE DIFICULDADE ===
let dayCount = 1;
let dayTimer = 0;
const DAY_LENGTH = 2400; // um ciclo completo
let isNight = false;
let nightStarted = false;
let waveNumber = 0;
let waveTimer = 0;
let waveActive = false;
let enemiesSpawnedThisWave = 0;
let totalEnemiesInWave = 0;

function getDifficultyMult(){
    // Dia 1 = 1.0, Dia 5 = 2.0, Dia 10 = 3.5, Dia 20 = 6.0
    return 1 + (dayCount - 1) * 0.3 + Math.pow(dayCount, 1.5) * 0.05;
}

function getEnemyStats(baseStats){
    const mult = getDifficultyMult();
    return {
        hp: Math.floor(baseStats.hp * mult),
        maxHp: Math.floor(baseStats.hp * mult),
        damage: Math.floor(baseStats.damage * mult),
        speed: baseStats.speed * (1 + (dayCount - 1) * 0.05),
        xpValue: Math.floor(baseStats.xpValue * mult),
        color: baseStats.color,
        w: baseStats.w,
        h: baseStats.h,
        flying: baseStats.flying || false,
        type: baseStats.type
    };
}

function getWaveSize(){
    // Onda cresce com os dias
    const base = 3 + dayCount;
    const max = Math.min(MAX_ENEMIES_TOTAL - enemies.filter(e => e.active).length, base + Math.floor(dayCount * 0.5));
    return max;
}

// === STATE ===
let world=[];
let camX=0,camY=0;
let gameOn=false;
let gamePaused=false;
let gameOver=false;
let frame=0;
let time=0;
let particles=[];
let drops=[];
let enemies=[];
let projectiles=[];
let playerName='Jogador';
let xp=0;
let level=1;
let screenFlash = { active: false, color: '#ff0000', alpha: 0, duration: 0 };

// === PLAYER ===
let px=0,py=0,pvx=0,pvy=0;
let pw=28,ph=48;
let grounded=false,php=100;
let pface=1,pInv=0;
let mining=false,mineT=0,mineTarget=null;
let attacking=false,attackTimer=0;
let attackHitbox={x:0,y:0,w:50,h:40};
let spawnX=0,spawnY=0;
let buffs = [];
let bowCharge = 0;
let isChargingBow = false;

// === INVENTÁRIO ===
let inv=[];
for(let i=0;i<40;i++)inv.push({id:0,qty:0});
let invDirty=true;
let isInventoryDragging=false;
let selSlot=0;
let showInv=false;
let showCraft=false;
let dragSource=null;
let dragItemData={id:0,qty:0};
let isDragging=false;

let floatingTexts=[];

let custom=JSON.parse(localStorage.getItem('terrariacraft_custom')||'{}');
if(!custom.skin)custom={skin:'#ffdbac',hair:'#4a2c0f',hairStyle:0,shirt:'#3b82f6',pants:'#1e3a5f',shoes:'#374151',eyeColor:'#1f2937'};

let autoSaveInterval=null;
let regenInterval=null;

const keys={};
let mx=0,my=0,mDown=false,mRight=false;

let hotbarSlots = [];
let lastInvState = [];
let lastSelSlot = -1;
let hotbarInitialized = false;

// === IMAGENS ===
const blockImages = {};
const imageLoadStatus = {};

const IMAGE_MAP = {
    1:'img/jogo/terra.png',2:'img/jogo/pedra.png',3:'img/jogo/grama.png',
    4:'img/jogo/madeira.png',5:'img/jogo/folha.png',6:'img/jogo/ferro.png',
    7:'img/jogo/ouro.png',8:'img/jogo/tijolo.png',9:'img/jogo/areia.png',
    10:'img/jogo/vidro.png',11:'img/jogo/tocha.png',12:'img/jogo/plataforma.png',
    13:'img/jogo/neve.png',14:'img/jogo/gelo.png',
};

const TOOL_IMAGE_MAP = {
    50:'img/jogo/picareta_pedra.png',51:'img/jogo/picareta_ferro.png',
    52:'img/jogo/machado_pedra.png',53:'img/jogo/machado_ferro.png',
    54:'img/jogo/pa_pedra.png',55:'img/jogo/pa_ferro.png',
    56:'img/jogo/espada_madeira.png',57:'img/jogo/espada_pedra.png',
};

let imagesReady = false;
let imagesToLoad = 0;
let imagesLoadedCount = 0;

function loadBlockImages(callback) {
    const allEntries = [...Object.entries(IMAGE_MAP), ...Object.entries(TOOL_IMAGE_MAP)];
    imagesToLoad = allEntries.length;
    imagesLoadedCount = 0;
    if(imagesToLoad === 0){imagesReady=true;if(callback)callback();return;}
    allEntries.forEach(([id,src])=>{
        const img=new Image();
        img.onload=()=>{blockImages[id]=img;imageLoadStatus[id]='loaded';imagesLoadedCount++;if(imagesLoadedCount>=imagesToLoad){imagesReady=true;if(callback)callback();}};
        img.onerror=()=>{imageLoadStatus[id]='error';imagesLoadedCount++;console.warn('Falha: '+src);if(imagesLoadedCount>=imagesToLoad){imagesReady=true;if(callback)callback();}};
        img.src=src;
    });
}

function drawBlockWithImage(ctx,bid,dx,dy){
    const img=blockImages[bid];
    if(img&&imageLoadStatus[bid]==='loaded'){
        ctx.drawImage(img,dx,dy,TILE,TILE);
        const b=BLK[bid];
        if(b&&b.bd){ctx.fillStyle=b.bd;ctx.fillRect(dx,dy,TILE,2);ctx.fillRect(dx,dy,2,TILE);}
        return true;
    }
    return false;
}

// === HOTBAR CACHE ===
function initHotbarCache() {
    const hb = document.getElementById('hotbar');
    if(!hb) return;
    hb.innerHTML = '';
    hotbarSlots = [];
    lastInvState = [];
    for(let i=0;i<10;i++){
        const div = document.createElement('div');
        div.className = 'slot';
        div.innerHTML = '<div class="item-icon"></div><span class="count"></span>';
        div.onclick = ()=>{selSlot=i;updateUI();};
        hb.appendChild(div);
        hotbarSlots.push({
            el: div,
            icon: div.querySelector('.item-icon'),
            count: div.querySelector('.count')
        });
        lastInvState.push({id:-1,qty:-1});
    }
    hotbarInitialized = true;
}

// === EVENT LISTENERS ===
const eventListeners=[];

function addTrackedListener(target,type,handler,options){
    target.addEventListener(type,handler,options);
    eventListeners.push({target,type,handler,options});
}

function removeAllListeners(){
    eventListeners.forEach(({target,type,handler,options})=>{
        target.removeEventListener(type,handler,options);
    });
    eventListeners.length=0;
}

addTrackedListener(document,'keydown',e=>{
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

addTrackedListener(document,'keyup',e=>{
    keys[e.key]=false;
    if(e.key==='Shift'){
        // Soltar shift = atirar arco se estava carregando
        if(isChargingBow){
            fireBow();
            isChargingBow = false;
            bowCharge = 0;
        }
    }
});

addTrackedListener(canvas,'mousemove',e=>{
    const r=canvas.getBoundingClientRect();
    mx=e.clientX-r.left;
    my=e.clientY-r.top;
    updateTooltip();
});

addTrackedListener(canvas,'mousedown',e=>{
    if(!gameOn||gamePaused||gameOver)return;
    if(e.button===0){
        mDown=true;
        const held=ITEMS[inv[selSlot].id];
        if(held&&held.type==='weapon'&&held.ranged){
            // Arco - começa carregar
            if(inv.some(s=>s.id===60&&s.qty>0)){
                isChargingBow=true;
                bowCharge=0;
            }else{
                toast('⚠️ Sem flechas!');
            }
            return;
        }
        if(tryAttack())return;
        if(keys['Shift']){usePotion();return;}
        doMine();
    }else if(e.button===2){
        mRight=true;
        doPlace();
    }
});

addTrackedListener(canvas,'mouseup',e=>{
    if(e.button===0){
        mDown=false;mining=false;mineTarget=null;
        // Soltar mouse = atirar arco se estava carregando
        if(isChargingBow){
            fireBow();
            isChargingBow=false;
            bowCharge=0;
        }
    }
    if(e.button===2)mRight=false;
});

addTrackedListener(canvas,'contextmenu',e=>e.preventDefault());

addTrackedListener(window,'blur',()=>{
    Object.keys(keys).forEach(k=>keys[k]=false);
    mDown=false;mRight=false;mining=false;mineTarget=null;
    isChargingBow=false;bowCharge=0;
});

addTrackedListener(window,'resize',()=>{
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
});

addTrackedListener(document,'visibilitychange',()=>{
    if(document.hidden&&gameOn&&!gamePaused){togglePause();}
});

function toggleInv(){
    if(gamePaused||gameOver)return;
    showInv=!showInv;showCraft=false;
    if(showInv){invDirty=true;isInventoryDragging=false;}
    updateUI();updateCrafting();
}

function toggleCraft(){
    if(gamePaused||gameOver)return;
    showCraft=!showCraft;showInv=false;
    updateUI();updateCrafting();
}

function togglePause(){
    if(!gameOn||gameOver)return;
    gamePaused=!gamePaused;
    const pauseScreen=document.getElementById('pauseScreen');
    if(pauseScreen)pauseScreen.style.display=gamePaused?'flex':'none';
    if(gamePaused){
        Object.keys(keys).forEach(k=>keys[k]=false);
        mDown=false;mRight=false;mining=false;mineTarget=null;
        isChargingBow=false;bowCharge=0;
    }
}

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

// === ARCO E FLECHA ===
function fireBow(){
    if(bowCharge<10){toast('⚠️ Muito rápido! Segure mais.');return;}
    const chargeMult=Math.min(1,bowCharge/60);
    const held=ITEMS[inv[selSlot].id];
    if(!held||!held.ranged)return;

    // Encontra flecha no inventário
    let arrowSlot=-1;
    for(let i=0;i<inv.length;i++){if(inv[i].id===60&&inv[i].qty>0){arrowSlot=i;break;}}
    if(arrowSlot===-1){toast('⚠️ Sem flechas!');return;}

    remItem(arrowSlot,1);

    const angle=Math.atan2((my+camY)-(py+ph/2),(mx+camX)-(px+pw/2));
    const speed=8+chargeMult*8;
    projectiles.push({
        x:px+pw/2,y:py+ph/2,
        vx:Math.cos(angle)*speed,
        vy:Math.sin(angle)*speed,
        damage:Math.floor(held.damage*chargeMult),
        life:120,
        color:'#d4d4d4',
        size:3,
        piercing:false
    });
    sfx('break');
    updateUI();
}

function updateProjectiles(){
    for(let i=projectiles.length-1;i>=0;i--){
        const p=projectiles[i];
        p.x+=p.vx;
        p.y+=p.vy;
        p.vy+=0.15; // gravidade leve
        p.life--;

        // Colisão com mundo
        const tx=Math.floor(p.x/TILE);
        const ty=Math.floor(p.y/TILE);
        if(tx>=0&&tx<WW&&ty>=0&&ty<WH){
            const bid=world[ty][tx];
            if(bid!==0&&BLK[bid]&&BLK[bid].s&&bid!==5){
                p.life=0;
                // Partículas de impacto
                for(let j=0;j<3;j++){
                    particles.push({x:p.x,y:p.y,vx:(Math.random()-0.5)*3,vy:(Math.random()-0.5)*3,life:10,color:'#d4d4d4',size:2});
                }
            }
        }

        // Colisão com inimigos
        for(let j=enemies.length-1;j>=0;j--){
            const e=enemies[j];
            if(!e.active)continue;
            if(hit({x:p.x-2,y:p.y-2,w:4,h:4},{x:e.x,y:e.y,w:e.w,h:e.h})){
                e.hp-=p.damage;
                e.vx=p.vx>0?3:-3;
                e.hurtTimer=10;
                floatingTexts.push({x:e.x+e.w/2,y:e.y,text:'-'+p.damage,life:40,color:'#ff4444',vy:-1});
                if(!p.piercing)p.life=0;
                if(e.hp<=0){
                    e.active=false;
                    xp+=e.xpValue||15;
                    if(xp>=level*50){level++;xp=0;toast('⭐ LEVEL UP! Nível '+level);}
                    drops.push({x:e.x+e.w/2-8,y:e.y,w:16,h:16,id:4,vy:-4,vx:(Math.random()-0.5)*3,life:600});
                }
                break;
            }
        }

        if(p.life<=0)projectiles.splice(i,1);
    }
}

function drawProjectiles(){
    projectiles.forEach(p=>{
        const dx=p.x-Math.floor(camX);
        const dy=p.y-Math.floor(camY);
        ctx.fillStyle=p.color;
        ctx.beginPath();
        ctx.arc(dx,dy,p.size,0,Math.PI*2);
        ctx.fill();
        // Rastro
        ctx.strokeStyle='rgba(255,255,255,0.3)';
        ctx.lineWidth=1;
        ctx.beginPath();
        ctx.moveTo(dx,dy);
        ctx.lineTo(dx-p.vx*2,dy-p.vy*2);
        ctx.stroke();
    });
}

// === USAR POÇÃO ===
function usePotion(){
    const held=ITEMS[inv[selSlot].id];
    if(!held||held.type!=='potion')return;
    if(held.heal){
        const oldHp=php;
        php=Math.min(100,php+held.heal);
        const healed=php-oldHp;
        if(healed>0){
            floatingTexts.push({x:px+pw/2,y:py,text:'+'+healed,life:40,color:'#4ade80',vy:-1});
            screenFlash={active:true,color:'#4ade80',alpha:0.3,duration:10};
        }
    }
    if(held.buff){
        buffs.push({type:held.buff,duration:held.duration,timer:held.duration});
        toast('⚡ Buff: '+held.n);
    }
    remItem(selSlot,1);
    sfx('pickup');
    updateUI();
}

function playerHasBuff(type){
    return buffs.some(b=>b.type===type&&b.timer>0);
}

function updateBuffs(){
    for(let i=buffs.length-1;i>=0;i--){
        buffs[i].timer--;
        if(buffs[i].timer<=0)buffs.splice(i,1);
    }
}

// === COMBATE ===
function tryAttack(){
    const held=ITEMS[inv[selSlot].id];
    if(!held||held.type!=='weapon'||held.ranged)return false;

    const attackW=50,attackH=40;
    const ax=pface>0?px+pw:px-attackW;
    const ay=py+5;
    attackHitbox={x:ax,y:ay,w:attackW,h:attackH};
    let hitSomething=false;

    for(let i=enemies.length-1;i>=0;i--){
        const e=enemies[i];
        if(!e||!e.active)continue;
        if(hit(attackHitbox,{x:e.x,y:e.y,w:e.w,h:e.h})){
            let dmg=held.damage||10;
            if(playerHasBuff('damage'))dmg=Math.floor(dmg*1.3);
            e.hp-=dmg;
            e.vx=pface>0?6:-6;
            e.vy=-3;
            e.hurtTimer=10;
            for(let p=0;p<6;p++){
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
                e.active=false;
                xp+=e.xpValue||15;
                if(xp>=level*50){level++;xp=0;toast('⭐ LEVEL UP! Nível '+level);}
                drops.push({x:e.x+e.w/2-8,y:e.y,w:16,h:16,id:4,vy:-4,vx:(Math.random()-0.5)*3,life:600});
                for(let p=0;p<8;p++){
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
    if(!playerName||gameOver){toast('⚠️ Não pode salvar!');return;}
    const safePlayerName=String(playerName).substring(0,20).replace(/[^a-zA-Z0-9_-]/g,'');
    const data={
        player:safePlayerName,
        world:world,
        playerData:{x:Math.round(px),y:Math.round(py),hp:Math.max(0,Math.min(100,php)),xp:Math.max(0,xp),level:Math.max(1,level),spawnX,spawnY},
        inventory:inv,
        time:time,
        dayCount:dayCount,
        waveNumber:waveNumber,
        enemies:[],
        seed:SEED,
        timestamp:new Date().toISOString(),
        version:'6.0'
    };
    try{
        const controller=new AbortController();
        const timeoutId=setTimeout(()=>controller.abort(),10000);
        const response=await fetch('./api.php',{
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body:JSON.stringify(data),
            signal:controller.signal
        });
        clearTimeout(timeoutId);
        if(!response.ok)throw new Error('HTTP '+response.status);
        const result=await response.json();
        if(result.status==='saved'){toast('💾 Salvo!');}
        else throw new Error(result.message||'Erro');
    }catch(e){
        console.warn('Falha servidor:',e.message);
        try{
            localStorage.setItem('tc_save_'+safePlayerName,JSON.stringify(data));
            toast('💾 Salvo localmente');
        }catch(storageErr){toast('❌ Falha: '+storageErr.message);}
    }
}

async function loadGame(){
    const nameInput=document.getElementById('playerName');
    const name=nameInput?nameInput.value.trim():'';
    if(!name){toast('⚠️ Digite o nome!');return;}
    const safeName=String(name).substring(0,20).replace(/[^a-zA-Z0-9_-]/g,'');
    if(!safeName){toast('⚠️ Nome inválido!');return;}
    playerName=safeName;
    try{
        const controller=new AbortController();
        const timeoutId=setTimeout(()=>controller.abort(),10000);
        const response=await fetch('./api.php?player='+encodeURIComponent(safeName),{signal:controller.signal});
        clearTimeout(timeoutId);
        if(!response.ok&&response.status!==404)throw new Error('HTTP '+response.status);
        const data=await response.json();
        if(data.status==='not_found'){
            const local=localStorage.getItem('tc_save_'+safeName);
            if(local){loadData(JSON.parse(local));toast('📂 Carregado localStorage');}
            else{toast('❌ Save não encontrado');}
            return;
        }
        loadData(data);
        toast('📂 Carregado!');
    }catch(e){
        console.warn('Falha servidor:',e.message);
        const local=localStorage.getItem('tc_save_'+safeName);
        if(local){loadData(JSON.parse(local));toast('📂 Carregado localmente');}
        else{toast('❌ Erro: '+e.message);}
    }
}

function loadData(data){
    if(!data||typeof data!=='object'){toast('❌ Dados inválidos');return;}
    if(data.world&&Array.isArray(data.world)){world=data.world;}
    if(data.playerData&&typeof data.playerData==='object'){
        px=Math.max(0,Math.min(WW*TILE,data.playerData.x||px));
        py=Math.max(0,Math.min(WH*TILE,data.playerData.y||py));
        php=Math.max(0,Math.min(100,data.playerData.hp||100));
        xp=Math.max(0,data.playerData.xp||0);
        level=Math.max(1,data.playerData.level||1);
        spawnX=data.playerData.spawnX||px;
        spawnY=data.playerData.spawnY||py;
    }
    if(data.inventory&&Array.isArray(data.inventory)&&data.inventory.length===40){inv=data.inventory;invDirty=true;}
    if(data.time!==undefined)time=data.time;
    if(data.dayCount!==undefined)dayCount=data.dayCount;
    if(data.waveNumber!==undefined)waveNumber=data.waveNumber;
    gameOn=true;gamePaused=false;gameOver=false;
    document.getElementById('startScreen').style.display='none';
    document.getElementById('pauseScreen').style.display='none';
    document.getElementById('gameOverScreen').style.display='none';
    initAudio();initHotbarCache();updateUI();startIntervals();
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
    px=sx*TILE;py=sy*TILE;spawnX=px;spawnY=py;
    pvx=0;pvy=0;php=100;grounded=false;

    camX=px-canvas.width/2+pw/2;
    camY=py-canvas.height/2+ph/2;
    camX=Math.max(0,Math.min(camX,WW*TILE-canvas.width));
    camY=Math.max(0,Math.min(camY,WH*TILE-canvas.height));

    enemies=[];
    projectiles=[];
    spawnEnemyType(sx+20,sy-3,'slime');
    spawnEnemyType(sx+30,sy-3,'slime');

    inv=[];for(let i=0;i<40;i++)inv.push({id:0,qty:0});
    addItem(1,20);addItem(2,15);addItem(4,10);addItem(8,5);
    addItem(11,5);addItem(12,10);
    addItem(50,1);addItem(52,1);addItem(54,1);addItem(56,1);
    selSlot=0;invDirty=true;

    particles=[];drops=[];floatingTexts=[];
    time=0;frame=0;xp=0;level=1;
    dayCount=1;
    dayTimer=0;
    isNight=false;
    nightStarted=false;
    waveNumber=0;
    waveTimer=0;
    waveActive=false;
    enemiesSpawnedThisWave=0;
    totalEnemiesInWave=0;
    gameOver=false;
    buffs=[];
}

function spawnEnemyType(tx,ty,type){
    const baseStats={
        slime:{w:32,h:26,hp:3,maxHp:3,damage:15,speed:1.2,color:'#ff6b6b',xpValue:15},
        zombie:{w:32,h:36,hp:8,maxHp:8,damage:20,speed:0.8,color:'#4ade80',xpValue:25},
        skeleton:{w:28,h:34,hp:5,maxHp:5,damage:18,speed:1.5,color:'#e2e8f0',xpValue:20},
        bat:{w:24,h:20,hp:2,maxHp:2,damage:10,speed:2.5,color:'#8b5cf6',xpValue:10,flying:true},
        fast_slime:{w:28,h:22,hp:2,maxHp:2,damage:12,speed:2.0,color:'#f97316',xpValue:12},
        tank_zombie:{w:40,h:40,hp:20,maxHp:20,damage:25,speed:0.5,color:'#166534',xpValue:40},
    };
    const base=baseStats[type]||baseStats.slime;
    const stats=getEnemyStats(base);
    if(!isSolid(tx,ty)){
        enemies.push({
            x:tx*TILE,y:ty*TILE,w:stats.w,h:stats.h,
            vx:(rand()-0.5)*2,vy:0,
            hp:stats.hp,maxHp:stats.maxHp,damage:stats.damage,speed:stats.speed,
            color:stats.color,xpValue:stats.xpValue,flying:stats.flying||false,
            grounded:false,anim:0,hurtTimer:0,active:true,
            type:type
        });
    }
}

function isSolid(tx,ty){
    if(ty<0||ty>=WH||tx<0||tx>=WW)return false;
    const bid=world[ty][tx];
    const b=BLK[bid];
    return b&&b.s&&bid!==5;
}

function addItem(id,qty){
    if(!id||qty<=0)return;
    let added=false;
    for(let i=0;i<inv.length;i++){
        if(inv[i].id===id&&inv[i].qty>0&&inv[i].qty<99){
            const canAdd=Math.min(qty,99-inv[i].qty);
            inv[i].qty+=canAdd;qty-=canAdd;added=true;
            if(qty<=0)break;
        }
    }
    if(qty>0){
        for(let i=0;i<inv.length;i++){
            if(inv[i].id===0||inv[i].qty===0){
                inv[i].id=id;inv[i].qty=Math.min(qty,99);added=true;break;
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
        invDirty=true;return true;
    }
    return false;
}

function hit(a,b){return!(b.x>=a.x+a.w||b.x+b.w<=a.x||b.y>=a.y+a.h||b.y+b.h<=a.y);}

function getTiles(x,y,w,h){
    const tiles=[];
    const sx=Math.max(0,Math.floor(x/TILE));
    const ex=Math.min(WW-1,Math.floor((x+w-0.1)/TILE));
    const sy=Math.max(0,Math.floor(y/TILE));
    const ey=Math.min(WH-1,Math.floor((y+h-0.1)/TILE));
    if(sy>=world.length||ey<0||sx>=WW||ex<0)return tiles;
    for(let ty=sy;ty<=ey;ty++){
        if(!world[ty])continue;
        for(let tx=sx;tx<=ex;tx++){
            const bid=world[ty][tx];
            if(bid===undefined)continue;
            const b=BLK[bid];
            if(b&&b.s&&bid!==5)tiles.push({x:tx*TILE,y:ty*TILE,plat:b.plat});
        }
    }
    return tiles;
}

function resolveEntity(e){
    const steps=Math.max(1,Math.ceil(Math.abs(e.vx)/TILE));
    const stepVx=e.vx/steps;
    for(let s=0;s<steps;s++){
        e.x+=stepVx;
        let tiles=getTiles(e.x,e.y,e.w,e.h);
        for(const t of tiles){
            if(t.plat&&e.vy>=0)continue;
            if(hit(e,{x:t.x,y:t.y,w:TILE,h:TILE})){
                if(stepVx>0)e.x=t.x-e.w;
                else if(stepVx<0)e.x=t.x+TILE;
                e.vx=0;break;
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

function wPos(){return{x:Math.floor((mx+camX)/TILE),y:Math.floor((my+camY)/TILE)};}

function getHeldTool(){
    const item=ITEMS[inv[selSlot].id];
    if(item&&item.type==='tool')return item;
    return null;
}

function hasLineOfSight(x1,y1,x2,y2){
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
    if(!hasLineOfSight(pcx,pcy,bcx,bcy))return;
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
    for(let i=0;i<6;i++){
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
    if(item&&(item.type==='tool'||item.type==='weapon'||item.type==='potion'||item.type==='ammo'))return;
    const bcx=tx*TILE+TILE/2,bcy=ty*TILE+TILE/2;
    const pcx=px+pw/2,pcy=py+ph/2;
    const dist=Math.sqrt((bcx-pcx)**2+(bcy-pcy)**2);
    if(dist>5*TILE)return;
    if(hit({x:tx*TILE,y:ty*TILE,w:TILE,h:TILE},{x:px,y:py,w:pw,h:ph}))return;
    for(const e of enemies){if(e.active&&hit({x:tx*TILE,y:ty*TILE,w:TILE,h:TILE},{x:e.x,y:e.y,w:e.w,h:e.h}))return;}
    world[ty][tx]=itemId;
    if(itemId===15){
        spawnX=tx*TILE;spawnY=(ty-1)*TILE;
        toast('🏠 Spawn definido!');
        screenFlash={active:true,color:'#fbbf24',alpha:0.4,duration:20};
    }
    remItem(selSlot,1);
    updateUI();
    sfx('place');
    for(let i=0;i<4;i++){
        particles.push({x:bcx,y:bcy,vx:(Math.random()-0.5)*3,vy:(Math.random()-0.5)*3-1,life:12,color:BLK[itemId].c,size:3});
    }
}

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

function cleanupEnemies(){
    for(let i=enemies.length-1;i>=0;i--){
        if(!enemies[i].active)enemies.splice(i,1);
    }
}

function cleanupParticles(){
    let writeIndex=0;
    for(let i=0;i<particles.length;i++){
        if(particles[i].life>0){
            particles[writeIndex++]=particles[i];
        }
    }
    particles.length=writeIndex;
    if(particles.length>MAX_PARTICLES){
        particles.splice(0,particles.length-MAX_PARTICLES);
    }
}

function cleanupFloatingTexts(){
    let writeIndex=0;
    for(let i=0;i<floatingTexts.length;i++){
        if(floatingTexts[i].life>0){
            floatingTexts[writeIndex++]=floatingTexts[i];
        }
    }
    floatingTexts.length=writeIndex;
}

// === SISTEMA DE ONDAS ===
function startNight(){
    isNight=true;
    nightStarted=true;
    waveNumber=0;
    waveActive=true;
    waveTimer=0;
    enemiesSpawnedThisWave=0;
    totalEnemiesInWave=getWaveSize();
    toast('🌙 NOITE ' + dayCount + ' COMEÇOU! Prepare-se...');
    screenFlash={active:true,color:'#8b0000',alpha:0.3,duration:30};
}

function endNight(){
    isNight=false;
    nightStarted=false;
    waveActive=false;
    dayCount++;
    toast('☀️ DIA ' + dayCount + '! Você sobreviveu mais uma noite!');
    screenFlash={active:true,color:'#fbbf24',alpha:0.3,duration:30};
    // Cura bônus ao amanhecer
    php=Math.min(100,php+20);
}

function spawnWaveEnemy(){
    if(enemiesSpawnedThisWave>=totalEnemiesInWave)return;
    const types=['slime'];
    if(dayCount>=2)types.push('zombie');
    if(dayCount>=3)types.push('skeleton');
    if(dayCount>=4)types.push('bat');
    if(dayCount>=5)types.push('fast_slime');
    if(dayCount>=7)types.push('tank_zombie');

    const type=types[randInt(0,types.length-1)];
    const side=randInt(0,1); // 0=esquerda, 1=direita
    const ex=side===0?Math.floor(px/TILE)-15:Math.floor(px/TILE)+15;
    const ey=Math.floor(py/TILE)+randInt(-3,3);

    if(ex>=0&&ex<WW&&ey>=0&&ey<WH&&!isSolid(ex,ey)){
        spawnEnemyType(ex,ey,type);
        enemiesSpawnedThisWave++;
    }
}

function updateWave(){
    if(!waveActive)return;
    waveTimer++;

    // Spawn gradual de inimigos
    const spawnInterval=Math.max(30,120-dayCount*5);
    if(waveTimer%spawnInterval===0&&enemiesSpawnedThisWave<totalEnemiesInWave){
        spawnWaveEnemy();
    }

    // Nova onda se matou todos
    if(enemiesSpawnedThisWave>=totalEnemiesInWave&&enemies.filter(e=>e.active).length===0){
        waveNumber++;
        enemiesSpawnedThisWave=0;
        totalEnemiesInWave=getWaveSize();
        toast('🌊 ONDA ' + waveNumber + '! Mais ' + totalEnemiesInWave + ' inimigos!');
    }
}

// === UPDATE ===
function update(){
    if(!gameOn||gamePaused||gameOver)return;
    frame++;

    const now=performance.now();
    if(frame%30===0){
        const delta=now-lastTime;
        fps=delta>0?Math.round(1000/delta*30):60;
        lastTime=now;
    }

    updateBuffs();
    updateProjectiles();
    updateWave();

    // Controle de dia/noite
    time=(time+0.3)%DAY_LENGTH;
    dayTimer+=0.3;

    // Detectar mudança dia/noite
    const wasNight=isNight;
    isNight=time>DAY_LENGTH*0.5;

    if(isNight&&!wasNight&&!nightStarted){
        startNight();
    }
    if(!isNight&&wasNight&&nightStarted){
        endNight();
    }

    // Carregar arco
    if(isChargingBow){
        bowCharge++;
        if(bowCharge>60)bowCharge=60;
    }

    let moving=false;
    let speed=keys['Shift']?5.5:3.5;
    if(playerHasBuff('speed'))speed*=1.5;

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

    if(px<0){px=0;pvx=0;}
    if(px>WW*TILE-pw){px=WW*TILE-pw;pvx=0;}
    if(py>WH*TILE){py=spawnY||200;pvy=0;php-=20;screenFlash={active:true,color:'#ff0000',alpha:0.5,duration:20};}

    if(grounded&&pvy>12){
        const fallDmg=Math.floor((pvy-12)*2);
        if(fallDmg>0){
            php-=fallDmg;
            floatingTexts.push({x:px+pw/2,y:py,text:'-'+fallDmg,life:40,color:'#ff4444',vy:-1});
            screenFlash={active:true,color:'#ff0000',alpha:0.3,duration:15};
        }
    }

    if(isSolid(Math.floor((px+pw/2)/TILE),Math.floor((py+ph/2)/TILE))){
        for(let i=1;i<10;i++){
            if(!isSolid(Math.floor((px+pw/2)/TILE),Math.floor((py+ph/2)/TILE)-i)){py-=i*TILE;break;}
        }
    }

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
        if(!e||!e.active)continue;
        e.vy+=e.flying?0:0.45;e.anim+=0.1;
        if(e.hurtTimer>0)e.hurtTimer--;

        const dist=Math.sqrt((e.x-px)**2+(e.y-py)**2);
        const detectRange=isNight?400:250;
        const speedMult=isNight?1.5:1;

        if(dist<detectRange&&Math.abs(e.y-py)<120){
            const dir=px>e.x?1:-1;
            e.vx+=dir*0.08*speedMult;
            e.vx=Math.max(-e.speed*speedMult,Math.min(e.speed*speedMult,e.vx));
        }else{
            if(Math.random()<0.02)e.vx*=-1;
            if(Math.abs(e.vx)<0.5)e.vx=e.vx>0?1.2:-1.2;
        }

        const eObj={x:e.x,y:e.y,w:e.w,h:e.h,vx:e.vx,vy:e.vy};
        resolveEntity(eObj);
        e.x=eObj.x;e.y=eObj.y;e.vx=eObj.vx;e.vy=eObj.vy;e.grounded=eObj.grounded;

        if(isSolid(Math.floor((e.x+e.w/2)/TILE),Math.floor((e.y+e.h/2)/TILE))){e.y-=TILE;}

        if(pInv<=0&&e.active&&hit(e,{x:px,y:py,w:pw,h:ph})){
            const dmg=isNight?Math.floor(e.damage*1.5):e.damage;
            php-=dmg;
            pInv=90;
            pvx=e.vx>0?10:-10;
            pvy=-6;
            sfx('hurt');
            updateUI();
            screenFlash={active:true,color:'#ff0000',alpha:0.4,duration:15};
            for(let i=0;i<5;i++){
                particles.push({x:px+pw/2,y:py+ph/2,vx:(Math.random()-0.5)*5,vy:(Math.random()-0.5)*5,life:18,color:'#ef4444',size:4});
            }
            floatingTexts.push({x:px+pw/2,y:py,text:'-'+dmg,life:40,color:'#ff4444',vy:-1});
        }
    }
    if(pInv>0)pInv--;

    if(frame%5===0){
        cleanupParticles();
        cleanupEnemies();
        cleanupFloatingTexts();
    }

    for(let i=particles.length-1;i>=0;i--){
        const p=particles[i];p.x+=p.vx;p.y+=p.vy;p.vy+=0.1;p.life--;
    }

    for(let i=floatingTexts.length-1;i>=0;i--){
        const ft=floatingTexts[i];
        ft.y+=ft.vy;ft.life--;
    }

    if(attackTimer>0){attackTimer--;if(attackTimer<=0)attacking=false;}

    if(mDown&&!showInv&&!showCraft)doMine();
    if(mRight&&!showInv&&!showCraft)doPlace();

    // Spawn diurno raro
    if(!isNight&&enemies.length<MAX_ENEMIES_TOTAL&&frame%600===0&&Math.random()<0.3){
        const ex=Math.floor(px/TILE)+randInt(-20,20);
        const ey=Math.floor(py/TILE)+randInt(-5,5);
        if(ex>=0&&ex<WW&&ey>=0&&ey<WH&&!isSolid(ex,ey)){spawnEnemyType(ex,ey,'slime');}
    }

    // GAME OVER
    if(php<=0&&!gameOver){
        gameOver=true;
        showGameOver();
    }

    if(screenFlash.active){
        screenFlash.duration--;
        screenFlash.alpha*=0.9;
        if(screenFlash.duration<=0||screenFlash.alpha<0.01){screenFlash.active=false;}
    }

    updateUI();
}

// === GAME OVER ===
function showGameOver(){
    const goScreen=document.getElementById('gameOverScreen');
    if(goScreen){
        goScreen.style.display='flex';
        const statsEl=document.getElementById('gameOverStats');
        if(statsEl){
            statsEl.innerHTML='Dias sobrevividos: <strong>'+dayCount+'</strong><br>Nível: <strong>'+level+'</strong><br>XP: <strong>'+xp+'</strong>';
        }
    }
    cleanupIntervals();
    toast('💀 GAME OVER - Você sobreviveu '+dayCount+' dias!');
}

function restartGame(){
    gameOver=false;
    const goScreen=document.getElementById('gameOverScreen');
    if(goScreen)goScreen.style.display='none';
    const startScreen=document.getElementById('startScreen');
    if(startScreen)startScreen.style.display='flex';
    cleanupGame();
}

// === RENDER ===
function draw(){
    if(world.length===0)return;
    ctx.clearRect(0,0,canvas.width,canvas.height);

    const night=time>DAY_LENGTH*0.5;
    const np=night?Math.min(1,(time-DAY_LENGTH*0.5)/(DAY_LENGTH*0.2)):0;

    // Céu
    let st,sb;
    if(night){
        st='rgb(15,5,25)';
        sb='rgb(25,10,40)';
    }else{
        const dp=time/(DAY_LENGTH*0.5);
        st=`rgb(${135-dp*30},${206-dp*60},${235-dp*40})`;
        sb=`rgb(${180-dp*40},${220-dp*50},${255-dp*30})`;
    }
    const grad=ctx.createLinearGradient(0,0,0,canvas.height);
    grad.addColorStop(0,st);grad.addColorStop(1,sb);
    ctx.fillStyle=grad;ctx.fillRect(0,0,canvas.width,canvas.height);

    // Sol/Lua
    const cAngle=(time/DAY_LENGTH)*Math.PI*2;
    const cX=canvas.width/2+Math.cos(cAngle-Math.PI/2)*(canvas.width/2-50);
    const cY=canvas.height-80+Math.sin(cAngle-Math.PI/2)*(canvas.height/2-80);
    if(night){
        ctx.fillStyle='#8b0000';
        ctx.beginPath();ctx.arc(cX,cY,30,0,Math.PI*2);ctx.fill();
        ctx.fillStyle='rgba(139,0,0,0.2)';
        ctx.beginPath();ctx.arc(cX,cY,50,0,Math.PI*2);ctx.fill();
    }else{
        ctx.fillStyle='#fbbf24';
        ctx.beginPath();ctx.arc(cX,cY,32,0,Math.PI*2);ctx.fill();
    }

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
    ctx.fillStyle=night?'rgba(100,20,20,0.3)':'rgba(255,255,255,0.4)';
    for(let i=0;i<3;i++){
        const cx=((i*400+time*0.15)%(canvas.width+200))-100;
        const cy=50+i*50+Math.sin(i+time*0.008)*15;
        ctx.beginPath();ctx.ellipse(cx,cy,50,18,0,0,Math.PI*2);ctx.fill();
    }

    // MUNDO
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
            if(!drawBlockWithImage(ctx,bid,dx,dy)){
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
        if(!e.active)return;
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

    // Projeteis
    drawProjectiles();

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
        const prog=Math.min(1,mineT/20);
        ctx.fillStyle='rgba(0,0,0,0.5)';ctx.fillRect(mtx,mty-5,TILE,3);
        ctx.fillStyle='#fbbf24';ctx.fillRect(mtx,mty-5,TILE*prog,3);
    }

    // Hitbox de ataque
    if(attacking){
        ctx.strokeStyle='rgba(255,100,100,0.6)';
        ctx.lineWidth=2;
        ctx.strokeRect(attackHitbox.x-Math.floor(camX),attackHitbox.y-Math.floor(camY),attackHitbox.w,attackHitbox.h);
    }

    // Carregamento do arco
    if(isChargingBow){
        const pdx=px-Math.floor(camX);
        const pdy=py-Math.floor(camY);
        const chargePct=bowCharge/60;
        ctx.fillStyle='rgba(255,255,255,0.3)';
        ctx.fillRect(pdx-15,pdy-25,30,4);
        ctx.fillStyle=`rgb(${255*chargePct},${255*(1-chargePct)},0)`;
        ctx.fillRect(pdx-15,pdy-25,30*chargePct,4);
    }

    // Screen flash
    if(screenFlash.active){
        ctx.fillStyle=screenFlash.color;
        ctx.globalAlpha=screenFlash.alpha;
        ctx.fillRect(0,0,canvas.width,canvas.height);
        ctx.globalAlpha=1;
    }

    // Indicador de noite
    if(isNight){
        ctx.fillStyle='rgba(139,0,0,0.8)';
        ctx.font='bold 18px monospace';
        ctx.textAlign='center';
        ctx.fillText('🌙 NOITE ' + dayCount + ' - ONDA ' + waveNumber, canvas.width/2, 60);
        ctx.font='bold 12px monospace';
        ctx.fillText('Inimigos: ' + enemies.filter(e=>e.active).length + '/' + totalEnemiesInWave, canvas.width/2, 80);
        ctx.textAlign='left';
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
    if(attacking){armSwing=pface>0?15:-15;}
    else if(isChargingBow){armSwing=pface>0?-10:10;}
    else{armSwing=grounded&&Math.abs(pvx)>0.5?Math.sin(frame*0.15+Math.PI)*6:0;}
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
    const held=ITEMS[inv[selSlot].id];
    if(held&&(held.type==='weapon'||held.type==='tool')){
        const toolId=inv[selSlot].id;
        const img=blockImages[toolId];
        const hasImg=img&&imageLoadStatus[toolId]==='loaded';
        const sx=pface>0?pdx+pw+2:pdx-14;
        const sy=pdy+20+(attacking?(pface>0?-8:8):0);
        if(hasImg){
            ctx.save();
            ctx.translate(sx+6,sy+6);
            if(pface<0)ctx.scale(-1,1);
            if(attacking)ctx.rotate(pface>0?-0.5:0.5);
            ctx.drawImage(img,-12,-12,24,24);
            ctx.restore();
        }else{
            ctx.fillStyle=held.c;
            ctx.fillRect(sx,sy,12,4);
            ctx.fillStyle='#666';
            ctx.fillRect(sx+(pface>0?8:-4),sy-2,4,8);
        }
    }
}

function drawDebug(){
    ctx.fillStyle='rgba(0,0,0,0.75)';
    ctx.fillRect(10,10,280,170);
    ctx.strokeStyle='#4ade80';ctx.lineWidth=1;ctx.strokeRect(10,10,280,170);
    ctx.fillStyle='#4ade80';ctx.font='12px monospace';
    ctx.fillText('=== SURVIVAL v6.0 ===',18,26);
    ctx.fillStyle='#94a3b8';
    ctx.fillText('P: '+Math.floor(px)+','+Math.floor(py)+' G:'+grounded,18,42);
    ctx.fillText('Cam: '+Math.floor(camX)+','+Math.floor(camY),18,58);
    ctx.fillText('HP:'+php+' XP:'+xp+' Lv:'+level,18,74);
    ctx.fillText('Slot:'+selSlot+' '+(ITEMS[inv[selSlot].id]?.n||'Vazio'),18,90);
    ctx.fillText('Drops:'+drops.length+' Enemies:'+enemies.filter(e=>e.active).length,18,106);
    ctx.fillText('Parts:'+particles.length+' FPS:'+fps,18,122);
    ctx.fillText('Dia:'+dayCount+' Noite:'+(isNight?'SIM':'nao'),18,138);
    ctx.fillText('Dificuldade:'+getDifficultyMult().toFixed(1)+'x',18,154);
    ctx.fillText('Onda:'+waveNumber+'/'+totalEnemiesInWave,18,170);
}

// === UI OTIMIZADA ===
function updateUI(){
    updateHUD();
    if(showInv&&invDirty&&!isInventoryDragging){
        renderInventory();
        invDirty=false;
    }
}

function updateHUD(){
    if(!hotbarInitialized)initHotbarCache();
    if(hotbarSlots.length===0)return;

    for(let i=0;i<10;i++){
        const slot=hotbarSlots[i];
        const data=inv[i];
        const state=lastInvState[i];

        if(state.id!==data.id||state.qty!==data.qty){
            state.id=data.id;
            state.qty=data.qty;
            if(data.id!==0&&data.qty>0){
                const item=ITEMS[data.id];
                const imgPath=TOOL_IMAGE_MAP[data.id];
                const hasImg=imgPath&&imageLoadStatus[data.id]==='loaded';
                if(hasImg){
                    slot.icon.style.backgroundImage='url('+imgPath+')';
                    slot.icon.style.backgroundSize='cover';
                    slot.icon.style.backgroundPosition='center';
                    slot.icon.style.backgroundColor=item.c||'#666';
                }else{
                    slot.icon.style.background=item.c||item.bd||'#666';
                    slot.icon.style.backgroundImage='none';
                }
                slot.count.textContent=data.qty;
                slot.el.title=item.n||'Item';
            }else{
                slot.icon.style.background='none';
                slot.icon.style.backgroundImage='none';
                slot.count.textContent='';
                slot.el.title='';
            }
        }
        slot.el.classList.toggle('active',i===selSlot);
    }
    lastSelSlot=selSlot;

    const invEl=document.getElementById('inventory');
    if(invEl)invEl.style.display=showInv?'block':'none';

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

    const timeEl=document.getElementById('time');
    if(timeEl){
        if(isNight)timeEl.textContent='🌙 Noite '+dayCount;
        else timeEl.textContent='☀️ Dia '+dayCount;
    }
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
            const imgPath=TOOL_IMAGE_MAP[slot.id];
            const hasImg=imgPath&&imageLoadStatus[slot.id]==='loaded';
            if(hasImg){
                div.innerHTML='<div class="item-icon" style="background-image:url('+imgPath+');background-size:cover;background-position:center;background-color:'+(item.c||'#666')+';"></div><span class="count">'+slot.qty+'</span>';
            }else{
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
    if(inv[slotIdx].id===0||inv[slotIdx].qty===0){e.preventDefault();return;}
    dragSource=slotIdx;
    dragItemData={...inv[slotIdx]};
    isInventoryDragging=true;
    e.currentTarget.classList.add('dragging');
    e.dataTransfer.effectAllowed='move';
    e.dataTransfer.setData('text/plain',String(slotIdx));
    const dragEl=document.getElementById('dragItem');
    if(dragEl&&dragItemData.id!==0){
        const item=ITEMS[dragItemData.id];
        const imgPath=TOOL_IMAGE_MAP[dragItemData.id];
        const hasImg=imgPath&&imageLoadStatus[dragItemData.id]==='loaded';
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
        e.dataTransfer.setDragImage(dragEl,20,20);
    }
}

function handleDragOver(e){e.preventDefault();e.dataTransfer.dropEffect='move';}

function handleDragEnter(e){e.preventDefault();e.stopPropagation();const el=e.currentTarget;if(el&&el.classList.contains('inv-slot'))el.classList.add('drag-over');}

function handleDragLeave(e){e.stopPropagation();const el=e.currentTarget;if(el&&el.classList.contains('inv-slot'))el.classList.remove('drag-over');}

function handleDrop(e){
    e.preventDefault();e.stopPropagation();
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
    dragSource=null;
    dragItemData={id:0,qty:0};
    isInventoryDragging=false;
    document.getElementById('dragItem').style.display='none';
    document.querySelectorAll('.inv-slot').forEach(el=>el.classList.remove('drag-over','dragging'));
    invDirty=true;
    updateUI();
}

function handleDragEnd(e){
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
    if(!audioCtx){audioCtx=new(window.AudioContext||window.webkitAudioContext)();}
}

function closeAudio(){
    if(audioCtx){audioCtx.close().catch(()=>{});audioCtx=null;}
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

function startGame(){
    initAudio();
    const seedInput=document.getElementById('worldSeed');
    const nameInput=document.getElementById('playerName');
    playerName=nameInput.value||'Jogador';
    const startScreen=document.getElementById('startScreen');
    const oldContent=startScreen.innerHTML;
    startScreen.innerHTML='<div class="start-content"><h1>🎮 TERRARIACRAFT SURVIVAL</h1><p class="subtitle">Hardcore Mode v6.0</p><div style="margin-top:20px;font-size:24px;">⏳</div></div>';
    loadBlockImages(()=>{
        genWorld(seedInput&&seedInput.value?seedInput.value:'');
        startScreen.style.display='none';
        startScreen.innerHTML=oldContent;
        gameOn=true;
        gamePaused=false;
        gameOver=false;
        initHotbarCache();
        updateUI();
        startIntervals();
        console.log("JOGO INICIADO v6.0 - Player: "+playerName);
    });
}
//Sessiooonnnn
async function checkSession() {
    try {
        const res = await fetch('./check_session.php');
        const data = await res.json();
        if (!data.logged_in) {
            alert('Sessão expirada! Faça login novamente.');
            window.location.href = 'login.php';
            return false;
        }
        // Preenche o nome do jogador automaticamente
        if (data.user_name) {
            document.getElementById('playerName').value = data.user_name;
            document.getElementById('userName').textContent = data.user_name;
        }
        return true;
    } catch (e) {
        console.error('Erro ao verificar sessão:', e);
        return true; // deixa passar se for falha de rede
    }
}

// Chamar no carregamento
checkSession();

function toast(msg){
    const t=document.createElement('div');
    t.style.cssText='position:fixed;top:20px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.85);color:#fff;padding:12px 24px;border-radius:8px;font-family:monospace;z-index:10000;border:1px solid #4ade80;font-size:14px;';
    t.textContent=msg;
    document.body.appendChild(t);
    setTimeout(()=>t.remove(),2500);
}

function startIntervals(){
    cleanupIntervals();
    regenInterval=setInterval(()=>{
        if(gameOn&&!gamePaused&&!gameOver&&php<100){
            const regenRate=playerHasBuff('regen')?2:1;
            php=Math.min(100,php+regenRate);
            updateUI();
        }
    },2500);
    autoSaveInterval=setInterval(()=>{
        if(gameOn&&!gamePaused&&!gameOver&&playerName!=='default'){saveGame();}
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
    projectiles=[];
    hotbarInitialized=false;
    hotbarSlots=[];
}

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
        console.error('Erro no loop:',err);
        if(err.message&&err.message.includes('Acesso negado')){cleanupGame();}
    }
}

animationFrameId=requestAnimationFrame(loop);

document.getElementById('playerName').value='Jogador';
const userNameEl=document.getElementById('userName');
if(userNameEl)userNameEl.textContent='Jogador';

window.addEventListener('beforeunload',()=>{cleanupGame();});

// ==========================================
// VERIFICAÇÃO DE SESSÃO (Adiciona isto no FINAL do teu ficheiro jogo.js)
// ==========================================
function verificarSessao() {
    fetch('check_session.php')
        .then(response => response.json())
        .then(data => {
            if (!data.logged_in) {
                // Se não tiver a sessão iniciada, redireciona para a página de login
                window.location.href = 'login.php';
            } else {
                // Se a sessão estiver ativa, atualiza automaticamente o nome do jogador!
                playerName = data.user_name;
                console.log("Jogador com sessão iniciada:", playerName);
            }
        })
        .catch(error => console.error('Erro na verificação de sessão:', error));
}

// Executa a função assim que a página terminar de carregar o HTML
window.addEventListener('DOMContentLoaded', verificarSessao);