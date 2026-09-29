// --- ЗБЕРЕЖЕННЯ ТА ЗМІННІ (localStorage) ---
let score = 0;
let totalCoins = parseInt(localStorage.getItem('totalCoins')) || 0;
let isGameOver = false;
let currentVolume = parseFloat(localStorage.getItem('currentVolume')) || 0.5;

let unlockedSkins = JSON.parse(localStorage.getItem('unlockedSkins')) || ['classic'];
let unlockedSkels = JSON.parse(localStorage.getItem('unlockedSkels')) || ['none'];

let currentSkin = localStorage.getItem('currentSkin') || 'classic';
let currentSkel = localStorage.getItem('currentSkel') || 'none';
let currentMusic = localStorage.getItem('currentMusic') || 'dudec';

// ✏️ ЗМІНИ ТУТ: Ціни для нових елементів
const prices = {
    gold: 100,
    phonk: 250,
    pro: 1000,
    skin_4: 1500, // Ціна Скін 4
    skin_5: 2000, // Ціна Скін 5
    skin_6: 3000, // Ціна Скін 6

    skel_1: 500,
    skel_2: 150,    
    skel_3: 500,
    skel_4: 1500,  // Ціна Скелет 4
    skel_5: 2000, // Ціна Скелет 5
    skel_6: 3500,  // Ціна Скелет 6
};

// ✏️ ЗМІНИ ТУТ: Назви файлів картинок скінів
const skinFiles = {
    classic: 'du.png',
    gold: '1.png',
    phonk: '2.png',
    pro: 'новий.png',
    skin_4: '4.png', // Твоя картинка Скін 4
    skin_5: '5.png', // Твоя картинка Скін 5
    skin_6: '6.png'  // Твоя картинка Скін 6
};

// ✏️ ЗМІНИ ТУТ: Назви файлів картинок скелетів
const skelFiles = {
    skel_1: 'ger.png',
    skel_2: 'fer.png',
    skel_3: 'sa.png',
    skel_4: 's4.png', // Твоя картинка Скелет 4
    skel_5: 's5.png', // Твоя картинка Скелет 5
    skel_6: 's6.png'  // Твоя картинка Скелет 6
};

// ✏️ ЗМІНИ ТУТ: Назви файлів треків
const musicFiles = {
    dudec: 'dudec.mp3',
    das: 'das.mp3',
    '1doot': '1doot.mp3',
    music_4: 'm4.mp3', // Твій трек 4
    music_5: 'm5.mp3'  // Твій трек 5
};

// Аудіо та таймери
let bgAudio = new Audio();
bgAudio.loop = true;
let stopTimer = null;
let skelSpawnInterval = null;

// Елементи DOM
const scoreEl = document.getElementById('score');
const totalCoinsEl = document.getElementById('total-coins');
const dudecImg = document.getElementById('dudec-img');
const dudecBox = document.getElementById('dudec-box');

const modalSkins = document.getElementById('modal-skins');
const modalSettings = document.getElementById('modal-settings');
const modalGameOver = document.getElementById('modal-gameover');

const selectSkin = document.getElementById('select-skin');
const selectSkel = document.getElementById('select-skel');
const selectMusic = document.getElementById('select-music');
const volumeRange = document.getElementById('volume-range');

// --- ІНІЦІАЛІЗАЦІЯ ГРИ ---
function initGame() {
    isGameOver = false;
    volumeRange.value = currentVolume;
    updateUI();
    applySkin(currentSkin);
    setupMusic(currentMusic);
    updateSelectLabels();
    startSkelSpawner();
}

function updateUI() {
    scoreEl.innerText = score;
    if (totalCoinsEl) totalCoinsEl.innerText = totalCoins;
}

function applySkin(skinKey) {
    if (skinFiles[skinKey]) dudecImg.src = skinFiles[skinKey];
}

function setupMusic(musicKey) {
    if (musicFiles[musicKey]) {
        bgAudio.src = musicFiles[musicKey];
        bgAudio.volume = currentVolume;
    }
}

// --- СПАВН ПЛАВАЮЧИХ СКЕЛЕТІВ ---
function startSkelSpawner() {
    if (skelSpawnInterval) clearInterval(skelSpawnInterval);

    skelSpawnInterval = setInterval(() => {
        if (!isGameOver && !bgAudio.paused && currentSkel !== 'none' && skelFiles[currentSkel]) {
            spawnFloatingSkeleton();
        }
    }, 2500);
}

function spawnFloatingSkeleton() {
    if (bgAudio.paused || isGameOver) return;

    const skel = document.createElement('img');
    skel.src = skelFiles[currentSkel];
    skel.className = 'floating-skel';

    const randomX = Math.floor(Math.random() * 65) + 10;
    const randomY = Math.floor(Math.random() * 55) + 15;

    skel.style.left = `${randomX}%`;
    skel.style.top = `${randomY}%`;

    skel.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        e.stopPropagation();
        handleTap(skel, true);
        skel.remove();
    });

    dudecBox.appendChild(skel);

    setTimeout(() => {
        if (skel.parentNode) {
            skel.style.opacity = '0';
            setTimeout(() => skel.remove(), 400);
        }
    }, 3000);
}

function clearAllSkeletons() {
    const activeSkels = document.querySelectorAll('.floating-skel');
    activeSkels.forEach(skel => skel.remove());
}

// --- ЛОГІКА ТАПІВ ТА GAME OVER ---
function handleTap(element, isSkeleton = false) {
    if (isGameOver) return;

    if (bgAudio.paused) {
        bgAudio.play().catch(() => {});
    }

    clearTimeout(stopTimer);

    stopTimer = setTimeout(() => {
        if (score > 0) {
            triggerGameOver();
        }
    }, 1000);

    const isBonus = isSkeleton ? (Math.random() < 0.5) : (Math.random() < 0.2);
    const pointsGained = isBonus ? 10 : 1;

    score += pointsGained;
    updateUI();

    element.style.transform = "scale(0.85)";
    setTimeout(() => {
        element.style.transform = "scale(1)";
    }, 100);
}

dudecImg.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handleTap(dudecImg, false);
});

// --- ВІКНО GAME OVER ---
function triggerGameOver() {
    isGameOver = true;
    bgAudio.pause();
    clearAllSkeletons();

    totalCoins += score;
    localStorage.setItem('totalCoins', totalCoins);

    document.getElementById('final-score').innerText = score;
    document.getElementById('earned-coins').innerText = score;

    modalGameOver.classList.remove('hidden');
}

document.getElementById('restart-btn').addEventListener('click', () => {
    score = 0;
    isGameOver = false;
    updateUI();
    modalGameOver.classList.add('hidden');
});

// --- МЕНЮ ТА НАЛАШТУВАННЯ ---
document.getElementById('btn-skins').addEventListener('click', () => {
    updateSelectLabels();
    modalSkins.classList.remove('hidden');
});

document.getElementById('close-skins').addEventListener('click', () => {
    modalSkins.classList.add('hidden');
});

document.getElementById('btn-settings').addEventListener('click', () => {
    modalSettings.classList.remove('hidden');
});

volumeRange.addEventListener('input', () => {
    currentVolume = parseFloat(volumeRange.value);
    bgAudio.volume = currentVolume;
});

document.getElementById('save-settings').addEventListener('click', () => {
    currentVolume = parseFloat(volumeRange.value);
    bgAudio.volume = currentVolume;
    localStorage.setItem('currentVolume', currentVolume);
    modalSettings.classList.add('hidden');
});

// ОНОВЛЕННЯ ТЕКСТУ В SELECT СПИСКАХ
function updateSelectLabels() {
    // Скіни
    const optGold = document.getElementById('opt-skin-gold');
    const optPro = document.getElementById('opt-skin-pro');
    const optPhonk = document.getElementById('opt-skin-phonk');
    const optSkin4 = document.getElementById('opt-skin-4');
    const optSkin5 = document.getElementById('opt-skin-5');
    const optSkin6 = document.getElementById('opt-skin-6');

    // Скелети
    const optSkel1 = document.getElementById('opt-skel-1');
    const optSkel2 = document.getElementById('opt-skel-2');
    const optSkel3 = document.getElementById('opt-skel-3');
    const optSkel4 = document.getElementById('opt-skel-4');
    const optSkel5 = document.getElementById('opt-skel-5');
    const optSkel6 = document.getElementById('opt-skel-6');

    if (optGold) optGold.innerText = unlockedSkins.includes('gold') ? "Скін 2 (майкрафт) - [КУПЛЕНО]" : `Скін 2 (майкрафт) - ${prices.gold} 🪙`;
    if (optPro) optPro.innerText = unlockedSkins.includes('pro') ? "pro (pro) - [КУПЛЕНО]" : `pro (pro) - ${prices.pro} 🪙`;
    if (optPhonk) optPhonk.innerText = unlockedSkins.includes('phonk') ? "Скін 3 (чоткий) - [КУПЛЕНО]" : `Скін 3 (чоткий) - ${prices.phonk} 🪙`;
    if (optSkin4) optSkin4.innerText = unlockedSkins.includes('skin_4') ? "Скін 4 - [КУПЛЕНО]" : `Скін 4 - ${prices.skin_4} 🪙`;
    if (optSkin5) optSkin5.innerText = unlockedSkins.includes('skin_5') ? "Скін 5 - [КУПЛЕНО]" : `Скін 5 - ${prices.skin_5} 🪙`;
    if (optSkin6) optSkin6.innerText = unlockedSkins.includes('skin_6') ? "Скін 6 - [КУПЛЕНО]" : `Скін 6 - ${prices.skin_6} 🪙`;

    if (optSkel1) optSkel1.innerText = unlockedSkels.includes('skel_1') ? "Скелет 1 - [КУПЛЕНО]" : `Скелет 1 - ${prices.skel_1} 🪙`;
    if (optSkel2) optSkel2.innerText = unlockedSkels.includes('skel_2') ? "Скелет 2 - [КУПЛЕНО]" : `Скелет 2 - ${prices.skel_2} 🪙`;
    if (optSkel3) optSkel3.innerText = unlockedSkels.includes('skel_3') ? "Скелет 3 - [КУПЛЕНО]" : `Скелет 3 - ${prices.skel_3} 🪙`;
    if (optSkel4) optSkel4.innerText = unlockedSkels.includes('skel_4') ? "Скелет 4 - [КУПЛЕНО]" : `Скелет 4 - ${prices.skel_4} 🪙`;
    if (optSkel5) optSkel5.innerText = unlockedSkels.includes('skel_5') ? "Скелет 5 - [КУПЛЕНО]" : `Скелет 5 - ${prices.skel_5} 🪙`;
    if (optSkel6) optSkel6.innerText = unlockedSkels.includes('skel_6') ? "Скелет 6 - [КУПЛЕНО]" : `Скелет 6 - ${prices.skel_6} 🪙`;

    selectSkin.value = currentSkin;
    selectSkel.value = currentSkel;
    selectMusic.value = currentMusic;
}

document.getElementById('save-skins').addEventListener('click', () => {
    const sSkin = selectSkin.value;
    const sSkel = selectSkel.value;
    const sMusic = selectMusic.value;

    if (!unlockedSkins.includes(sSkin)) {
        if (totalCoins >= prices[sSkin]) {
            totalCoins -= prices[sSkin];
            unlockedSkins.push(sSkin);
            currentSkin = sSkin;
        } else {
            alert("Не вистачає монет!");
            return;
        }
    } else {
        currentSkin = sSkin;
    }

    if (sSkel !== 'none' && !unlockedSkels.includes(sSkel)) {
        if (totalCoins >= prices[sSkel]) {
            totalCoins -= prices[sSkel];
            unlockedSkels.push(sSkel);
            currentSkel = sSkel;
        } else {
            alert("Не вистачає монет!");
            return;
        }
    } else {
        currentSkel = sSkel;
    }

    currentMusic = sMusic;
    localStorage.setItem('totalCoins', totalCoins);
    localStorage.setItem('unlockedSkins', JSON.stringify(unlockedSkins));
    localStorage.setItem('unlockedSkels', JSON.stringify(unlockedSkels));
    localStorage.setItem('currentSkin', currentSkin);
    localStorage.setItem('currentSkel', currentSkel);
    localStorage.setItem('currentMusic', currentMusic);

    applySkin(currentSkin);
    setupMusic(currentMusic);
    updateUI();

    modalSkins.classList.add('hidden');
});

initGame();
