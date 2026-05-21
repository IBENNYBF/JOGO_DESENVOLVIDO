// =========================
// SPLASH TEXT
// =========================

const splashTexts = [

    "Cada bloco pode esconder uma nova aventura.",
    "Construa. Explore. Sobreviva.",
    "O mundo está esperando por você.",
    "Cuidado com o que existe nas cavernas...",
    "Grandes aventuras começam com um bloco.",
    "Explore além do horizonte.",
    "Sobreviva à noite.",
    "Crie sua própria jornada.",
    "Nem toda criatura é amigável.",
    "Tesouros aguardam os corajosos."

];

const randomText =
    splashTexts[Math.floor(Math.random() * splashTexts.length)];

document.getElementById("splashText").innerText = randomText;


// =========================
// 🎵 MÚSICAS
// =========================

const musicList = [

    "./audio/index_inicio/airy.mp3",
    "./audio/index_inicio/pulse.mp3",
    "./audio/index_inicio/sector.mp3",
    "./audio/index_inicio/title.mp3",
    "./audio/index_inicio/transmission.mp3",
    "./audio/index_inicio/urgent.mp3",
    "./audio/index_inicio/victory.mp3"

];


// =========================
// PLAYER
// =========================

const music =
    document.getElementById("bgMusic");

const musicButton =
    document.getElementById("musicButton");

music.volume = 0.15;

let playing = false;


// =========================
// ESCOLHER MÚSICA
// =========================

function randomMusic() {

    const randomIndex =
        Math.floor(Math.random() * musicList.length);

    music.src = musicList[randomIndex];

}


// =========================
// BOTÃO
// =========================

function toggleMusic() {

    console.log("clicou");

    if (playing) {

        music.pause();

        playing = false;

        musicButton.innerText = "🔇";

    } else {

        randomMusic();

        music.play();

        playing = true;

        musicButton.innerText = "🔊";

    }

}


// =========================
// TROCAR AUTOMATICAMENTE
// =========================

music.addEventListener("ended", () => {

    randomMusic();

    music.play();

});


// =========================
// TESTE
// =========================

console.log("JS funcionando");