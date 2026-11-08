// ==========================================
// GITHUB LEADERBOARD CONFIGURATION
// ==========================================
const GITHUB_TOKEN = "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"; 
const REPO_OWNER = "ALJE0123456789";
const REPO_NAME = "CEC-FUN-GAME";
const FILE_PATH = "leaderboard.json";
const BRANCH = "main";

// ==========================================
// GLOBAL NETWORK VARIABLES
// ==========================================
let peer = null;
let conn = null;
let isHost = false;
let roomCode = "";

// ==========================================
// SCENE 0: BOOT
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() { super('BootScene'); }

    preload() {
        this.load.image('background', 'assets/background.png');
        const chars = ['aadhil', 'muthalib', 'adhya', 'shifana', 'abhinanda', 'aadhiljunise'];
        chars.forEach(c => this.load.image(c, `assets/${c}.png`));

        this.load.audio('bgm_menu', 'assets/bgm_menu.mp3'); 
        this.load.audio('bgm_fight', 'assets/bgm_fight.mp3'); 
        this.load.audio('sfx_punch', 'assets/sfx_punch.mp3');
        this.load.audio('sfx_kick', 'assets/sfx_kick.mp3');
        this.load.audio('sfx_win', 'assets/sfx_win.mp3');
        this.load.audio('sfx_lose', 'assets/lose.mp3'); 
        
        chars.forEach(c => this.load.audio(`${c}_power`, `assets/${c}_power.mp3`));

        this.load.on('loaderror', (file) => {
            const g = this.make.graphics({x:0, y:0, add:false});
            g.fillStyle(0x4f46e5, 1); g.fillRect(0, 0, 100, 200);
            g.lineStyle(4, 0xffffff, 1); g.strokeRect(0, 0, 100, 200);
            g.generateTexture(file.key, 100, 200);
        });
    }
    create() { this.scene.start('MainMenu'); }
}

// ==========================================
// SCENE 1: MAIN MENU
// ==========================================
class MainMenu extends Phaser.Scene {
    constructor() { super('MainMenu'); }

    create() {
        if (this.cache.audio.exists('bgm_menu')) {
            let menuMusic = this.sound.get('bgm_menu');
            if (!menuMusic) menuMusic = this.sound.add('bgm_menu', { loop: true, volume: 0.5 });
            if (!menuMusic.isPlaying) menuMusic.play();
        }

        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.7); 
        
        this.add.text(512, 80, 'FIGHT KARO', { fontSize: '70px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(512, 140, 'COLLEGE EDITION', { fontSize: '30px', fill: '#ecf0f1' }).setOrigin(0.5);

        // MUTE BUTTON
        let isMuted = this.sound.mute;
        let muteBtn = this.add.text(900, 50, isMuted ? '🔇 Muted' : '🔊 Sound ON', { fontSize: '20px', fill: '#fff', backgroundColor: '#333', padding: { x: 10, y: 10 } }).setOrigin(0.5).setInteractive();
        muteBtn.on('pointerdown', () => {
            this.sound.mute = !this.sound.mute;
            muteBtn.setText(this.sound.mute ? '🔇 Muted' : '🔊 Sound ON');
        });

        // PLAY WITH COMPUTER BUTTON
        let playAI = this.add.text(512, 250, 'PLAY WITH COMPUTER', { fontSize: '28px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 40, y: 20 } }).setOrigin(0.5).setInteractive();
        playAI.on('pointerdown', () => { isHost = false; this.scene.start('CharSelectScene', { mode: 'ai' }); });
        playAI.on('pointerover', () => playAI.setStyle({ backgroundColor: '#27ae60' }));
        playAI.on('pointerout', () => playAI.setStyle({ backgroundColor: '#2ecc71' }));

        // PLAY ONLINE BUTTON
        let playOnline = this.add.text(512, 350, 'PLAY ONLINE (PVP)', { fontSize: '28px', fill: '#fff', backgroundColor: '#3498db', padding: { x: 40, y: 20 } }).setOrigin(0.5).setInteractive();
        playOnline.on('pointerdown', () => { this.scene.start('LobbyScene'); });
        playOnline.on('pointerover', () => playOnline.setStyle({ backgroundColor: '#2980b9' }));
        playOnline.on('pointerout', () => playOnline.setStyle({ backgroundColor: '#3498db' }));

        // LEADERBOARD BUTTON
        let leaderboardBtn = this.add.text(512, 470, '🏆 HALL OF FAME', { fontSize: '24px', fill: '#f1c40f', backgroundColor: '#333', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        leaderboardBtn.on('pointerdown', () => { this.scene.start('LeaderboardScene'); });
        leaderboardBtn.on('pointerover', () => leaderboardBtn.setStyle({ backgroundColor: '#555' }));
        leaderboardBtn.on('pointerout', () => leaderboardBtn.setStyle({ backgroundColor: '#333' }));
    }
}

// ==========================================
// SCENE 2: MULTIPLAYER LOBBY
// ==========================================
class LobbyScene extends Phaser.Scene {
    constructor() { super('LobbyScene'); }

    create() {
        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.8);
        
        this.add.text(512, 80, 'ONLINE MULTIPLAYER', { fontSize: '50px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);

        let backBtn = this.add.text(100, 50, '⬅ BACK', { fontSize: '20px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 15, y: 10 } }).setOrigin(0.5).setInteractive();
        backBtn.on('pointerdown', () => { this.scene.start('MainMenu'); });

        let hostBtn = this.add.text(512, 250, 'HOST A GAME', { fontSize: '30px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        hostBtn.on('pointerdown', () => this.hostGame());

        this.add.text(512, 350, 'OR JOIN A FRIEND', { fontSize: '24px', fill: '#bdc3c7' }).setOrigin(0.5);

        let joinBtn = this.add.text(512, 430, 'JOIN GAME', { fontSize: '30px', fill: '#fff', backgroundColor: '#3498db', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        joinBtn.on('pointerdown', () => {
            let code = prompt("Enter the Room Code from your friend (e.g., FIGHT-X7Y2B):");
            if (code) this.joinGame(code.trim().toUpperCase());
        });

        this.statusText = this.add.text(512, 520, '', { fontSize: '20px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
    }

    hostGame() {
        this.statusText.setText("Generating Room Code...");
        roomCode = "FIGHT-" + Math.random().toString(36).substring(2, 7).toUpperCase();
        peer = new Peer(roomCode);
        isHost = true;

        peer.on('open', (id) => {
            this.statusText.setText(`Room Code: ${roomCode} (Waiting for friend...)`);
        });

        peer.on('connection', (connection) => {
            conn = connection;
            this.statusText.setText("Friend Connected! Starting...");
            setTimeout(() => { this.scene.start('CharSelectScene', { mode: 'online' }); }, 1000);
        });
    }

    joinGame(code) {
        this.statusText.setText("Connecting... Please wait.");
        peer = new Peer(); 
        isHost = false;

        peer.on('open', () => {
            conn = peer.connect(code);
            conn.on('open', () => {
                this.statusText.setText("Connected to Host!");
                setTimeout(() => { this.scene.start('CharSelectScene', { mode: 'online' }); }, 500);
            });
            peer.on('error', (err) => {
                console.log(err);
                this.statusText.setText("Failed to connect. Check code and try again.");
            });
        });
    }
}

// ==========================================
// SCENE 3: CHARACTER SELECTION
// ==========================================
class CharSelectScene extends Phaser.Scene {
    constructor() { super('CharSelectScene'); }

    init(data) {
        this.gameMode = data.mode || 'ai'; 
        this.p1Char = null;
        this.p2Char = null;
        this.matchStarted = false;
        this.activePlayer = 1;
    }

    create() {
        if (this.cache.audio.exists('bgm_menu')) {
            let menuMusic = this.sound.get('bgm_menu');
            if (menuMusic && !menuMusic.isPlaying) menuMusic.play();
        }

        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.6); 

        let dismissBtn = this.add.text(100, 50, '⬅ DISMISS', { fontSize: '20px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 15, y: 10 } }).setOrigin(0.5).setInteractive();
        dismissBtn.on('pointerdown', () => {
            if (conn) { conn.close(); peer.destroy(); conn = null; peer = null; }
            this.scene.start('MainMenu');
        });

        let modeText = this.gameMode === 'online' ? 'ONLINE PVP' : 'VS COMPUTER';
        this.add.text(512, 50, `SELECT FIGHTERS (${modeText})`, { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        
        this.p1Text = this.add.text(250, 100, 'P1: PICKING...', { fontSize: '24px', fill: '#3498db', fontStyle: 'bold' }).setOrigin(0.5);
        this.p2Text = this.add.text(774, 100, 'P2: WAITING...', { fontSize: '24px', fill: '#7f8c8d' }).setOrigin(0.5);

        const chars = ['aadhil', 'muthalib', 'adhya', 'shifana', 'abhinanda', 'aadhiljunise'];
        this.sprites = []; 
        let startX = 512 - ((chars.length - 1) * 140) / 2; 

        chars.forEach((char, index) => {
            let x = startX + (index * 140);
            let y = 300;
            let sprite = this.add.image(x, y, char).setScale(0.35); 
            this.sprites.push({ name: char, sprite: sprite });
            
            sprite.setInteractive();
            sprite.on('pointerdown', () => { this.handleSelection(char, sprite); });
            
            let displayName = (char === 'aadhiljunise') ? 'AADHIL JUNISE' : char.toUpperCase();
            this.add.text(x, y + 120, displayName, { fontSize: '16px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        });

        this.startBtn = this.add.text(512, 520, 'CONTINUE', { fontSize: '32px', fill: '#2ecc71', fontStyle: 'bold', backgroundColor: '#000', padding: { x: 20, y: 10 } }).setOrigin(0.5).setVisible(false);

        this.startBtn.setInteractive();
        this.startBtn.on('pointerdown', () => {
            this.scene.start('DifficultyScene', { p1: this.p1Char, p2: this.p2Char });
        });

        if (this.gameMode === 'online' && conn) {
            conn.on('data', (data) => {
                if (data.type === 'pick') {
                    if (data.role === 'p1') { this.p1Char = data.char; this.updateUI(); } 
                    else if (data.role === 'p2') { this.p2Char = data.char; this.updateUI(); }
                    this.checkStartMatch();
                }
                if (data.type === 'start_match' && !isHost) {
                    this.scene.start('GameScene', { p1: data.p1, p2: data.p2, mode: 'online' });
                }
            });
        }
    }

    handleSelection(char, sprite) {
        if (this.gameMode === 'online') {
            if (isHost) {
                this.p1Char = char;
                this.updateUI();
                if (conn) conn.send({ type: 'pick', role: 'p1', char: char });
            } else {
                if (char === this.p1Char) return; 
                this.p2Char = char;
                this.updateUI();
                if (conn) conn.send({ type: 'pick', role: 'p2', char: char });
            }
            this.checkStartMatch();
        } else {
            if (this.activePlayer === 2 && char === this.p1Char) return; 
            if (this.activePlayer === 1) { this.p1Char = char; this.activePlayer = 2; } 
            else { this.p2Char = char; this.activePlayer = 1; }
            this.updateUI();
            if (this.p1Char && this.p2Char) this.startBtn.setVisible(true);
        }
    }

    updateUI() {
        this.sprites.forEach(s => s.sprite.clearTint());
        if (this.p1Char) {
            let p1Sprite = this.sprites.find(s => s.name === this.p1Char);
            if (p1Sprite) p1Sprite.sprite.setTint(0x3498db);
            let dName = (this.p1Char === 'aadhiljunise') ? 'AADHIL JUNISE' : this.p1Char.toUpperCase();
            this.p1Text.setText(`P1: ${dName}`);
            this.p1Text.setColor('#3498db');
        }
        if (this.p2Char) {
            let p2Sprite = this.sprites.find(s => s.name === this.p2Char);
            if (p2Sprite) p2Sprite.sprite.setTint(0xe74c3c);
            let dName = (this.p2Char === 'aadhiljunise') ? 'AADHIL JUNISE' : this.p2Char.toUpperCase();
            this.p2Text.setText(`P2: ${dName}`);
            this.p2Text.setColor('#e74c3c');
        }
    }

    checkStartMatch() {
        if (this.gameMode === 'online' && this.p1Char && this.p2Char && !this.matchStarted) {
            if (isHost) {
                this.matchStarted = true;
                if (conn) conn.send({ type: 'start_match', p1: this.p1Char, p2: this.p2Char });
                this.scene.start('GameScene', { p1: this.p1Char, p2: this.p2Char, mode: 'online' });
            }
        }
    }
}

// ==========================================
// SCENE 4: DIFFICULTY SELECTION
// ==========================================
class DifficultyScene extends Phaser.Scene {
    constructor() { super('DifficultyScene'); }

    init(data) {
        this.p1Char = data.p1;
        this.p2Char = data.p2;
    }

    create() {
        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.7);
        
        let backBtn = this.add.text(150, 450, '⬅ BACK', { fontSize: '24px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        backBtn.on('pointerdown', () => { this.scene.start('CharSelectScene', { p1: this.p1Char, p2: this.p2Char, mode: 'ai' }); });

        this.add.text(512, 150, 'SELECT DIFFICULTY', { fontSize: '50px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

        let easyBtn = this.add.text(300, 300, 'EASY', { fontSize: '32px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        easyBtn.on('pointerdown', () => { this.startGame('Easy'); });

        let normalBtn = this.add.text(512, 300, 'NORMAL', { fontSize: '32px', fill: '#fff', backgroundColor: '#f39c12', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        normalBtn.on('pointerdown', () => { this.startGame('Normal'); });

        let hardBtn = this.add.text(724, 300, 'HARD', { fontSize: '32px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        hardBtn.on('pointerdown', () => { this.startGame('Hard'); });
    }

    startGame(difficulty) {
        this.scene.start('GameScene', { p1: this.p1Char, p2: this.p2Char, diff: difficulty, mode: 'ai' });
    }
}

// ==========================================
// SCENE 5: LEADERBOARD (WITH TABS)
// ==========================================
class LeaderboardScene extends Phaser.Scene {
    constructor() { super('LeaderboardScene'); }

    create() {
        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.85);

        this.add.text(512, 60, '🏆 HALL OF FAME 🏆', { fontSize: '50px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);

        let backBtn = this.add.text(100, 50, '⬅ BACK', { fontSize: '20px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 15, y: 10 } }).setOrigin(0.5).setInteractive();
        backBtn.on('pointerdown', () => { this.scene.start('MainMenu'); });

        this.onlineTab = this.add.text(380, 130, '🌐 ONLINE PVP', { fontSize: '24px', fill: '#fff', backgroundColor: '#3498db', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        this.aiTab = this.add.text(644, 130, '🤖 VS COMPUTER', { fontSize: '24px', fill: '#fff', backgroundColor: '#7f8c8d', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();

        this.tableContainer = this.add.container(0, 0);
        this.loadingText = this.add.text(512, 288, 'Fetching Champions...', { fontSize: '24px', fill: '#fff' }).setOrigin(0.5);

        const rawUrl = `https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/${BRANCH}/${FILE_PATH}?t=${Date.now()}`;
        
        fetch(rawUrl)
            .then(response => response.json())
            .then(data => {
                this.loadingText.destroy();
                this.dbData = data;
                this.drawTable('online');
                
                this.onlineTab.on('pointerdown', () => { this.updateTabStyles('online'); this.drawTable('online'); });
                this.aiTab.on('pointerdown', () => { this.updateTabStyles('ai'); this.drawTable('ai'); });
            })
            .catch(err => {
                console.error(err);
                this.loadingText.setText("⚠️ Failed to load leaderboard. Check console.");
            });
    }

    updateTabStyles(mode) {
        if (mode === 'online') {
            this.onlineTab.setStyle({ backgroundColor: '#3498db' });
            this.aiTab.setStyle({ backgroundColor: '#7f8c8d' });
        } else {
            this.onlineTab.setStyle({ backgroundColor: '#7f8c8d' });
            this.aiTab.setStyle({ backgroundColor: '#e67e22' });
        }
    }

    drawTable(mode) {
        this.tableContainer.removeAll(true); 
        let modeData = this.dbData[mode] || {};
        let players = Object.keys(modeData).map(name => ({ name: name, wins: modeData[name] }));
        players.sort((a, b) => b.wins - a.wins);

        if (players.length === 0) {
            let emptyText = this.add.text(512, 300, `No ${mode === 'online' ? 'Online' : 'AI'} fights recorded yet!`, { fontSize: '24px', fill: '#bdc3c7' }).setOrigin(0.5);
            this.tableContainer.add(emptyText);
            return;
        }

        let tableBg = this.add.rectangle(512, 360, 800, 380, 0x222222, 0.8).setStrokeStyle(4, mode === 'online' ? 0x3498db : 0xe67e22);
        let headerRank = this.add.text(200, 190, 'RANK', { fontSize: '22px', fill: '#f1c40f', fontStyle: 'bold' });
        let headerName = this.add.text(400, 190, 'FIGHTER', { fontSize: '22px', fill: '#f1c40f', fontStyle: 'bold' });
        let headerWins = this.add.text(750, 190, 'WINS', { fontSize: '22px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(1, 0);
        
        this.tableContainer.add([tableBg, headerRank, headerName, headerWins]);

        players.slice(0, 7).forEach((player, index) => {
            let yPos = 250 + (index * 45);
            let color = '#fff';
            let rankIcon = `#${index + 1}`;
            if (index === 0) { color = '#f1c40f'; rankIcon = '🥇'; }
            else if (index === 1) { color = '#bdc3c7'; rankIcon = '🥈'; }
            else if (index === 2) { color = '#cd7f32'; rankIcon = '🥉'; }

            let displayName = (player.name === 'aadhiljunise') ? 'AADHIL JUNISE' : player.name.toUpperCase();
            
            if (index % 2 === 0) {
                let rowBg = this.add.rectangle(512, yPos, 760, 40, 0xffffff, 0.05).setOrigin(0.5);
                this.tableContainer.add(rowBg);
            }

            let rankText = this.add.text(220, yPos, rankIcon, { fontSize: '24px', fill: color, fontStyle: 'bold' }).setOrigin(0.5);
            let nameText = this.add.text(320, yPos, displayName, { fontSize: '24px', fill: color }).setOrigin(0, 0.5);
            let winsText = this.add.text(750, yPos, `${player.wins} WINS`, { fontSize: '24px', fill: color, fontStyle: 'bold' }).setOrigin(1, 0.5);
            
            this.tableContainer.add([rankText, nameText, winsText]);
        });
    }
}

// ==========================================
// SCENE 6: GAME
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() { super('GameScene'); }

    init(data) {
        this.p1Name = data.p1 || 'aadhil'; 
        this.p2Name = data.p2 || 'muthalib';
        this.difficulty = data.diff || 'Normal';
        this.gameMode = data.mode || 'ai'; 
        this.isPaused = false; 
    }

    create() {
        let menuMusic = this.sound.get('bgm_menu');
        if (menuMusic && menuMusic.isPlaying) menuMusic.stop();

        if (this.cache.audio.exists('bgm_fight')) {
            this.fightMusic = this.sound.add('bgm_fight', { loop: true, volume: 0.4 });
            this.fightMusic.play();
        }

        this.playerHealth = 100; this.enemyHealth = 100; this.isGameOver = false;
        this.p1SpecialReady = true; this.p2SpecialReady = true; this.playerAttackCooldown = false;
        this.btnLeftPressed = false; this.btnRightPressed = false; this.btnJumpPressed = false;

        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.4);

        this.physics.world.setBounds(0, 0, 1024, 576);
        const ground = this.add.rectangle(512, 550, 1024, 50, 0x7f8c8d);
        this.physics.add.existing(ground, true); 

        this.player = this.physics.add.sprite(250, 400, this.p1Name).setScale(0.4).setCollideWorldBounds(true);
        this.enemy = this.physics.add.sprite(774, 400, this.p2Name).setScale(0.4).setFlipX(true).setCollideWorldBounds(true);
        this.physics.add.collider(this.player, ground); this.physics.add.collider(this.enemy, ground);

        let p1Display = (this.p1Name === 'aadhiljunise') ? 'AADHIL JUNISE' : this.p1Name.toUpperCase();
        let p2Display = (this.p2Name === 'aadhiljunise') ? 'AADHIL JUNISE' : this.p2Name.toUpperCase();

        this.add.text(50, 30, p1Display, { fontSize: '24px', fill: '#fff', fontStyle: 'bold' });
        this.playerHealthBar = this.add.rectangle(50, 60, 300, 20, 0x2ecc71).setOrigin(0, 0.5);
        this.p1SpecialText = this.add.text(50, 80, 'Special (F): READY', { fontSize: '16px', fill: '#f1c40f' });

        this.add.text(750, 30, p2Display, { fontSize: '24px', fill: '#fff', fontStyle: 'bold' });
        this.enemyHealthBar = this.add.rectangle(974, 60, 300, 20, 0x2ecc71).setOrigin(1, 0.5);
        
        this.add.text(512, 30, `MODE: ${this.gameMode === 'online' ? 'ONLINE PVP' : this.difficulty.toUpperCase()}`, { fontSize: '20px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);

        // PAUSE UI
        this.pauseBtn = this.add.text(512, 75, '⏸️ PAUSE', { fontSize: '18px', fill: '#fff', backgroundColor: '#e67e22', padding: { x: 15, y: 5 } })
            .setOrigin(0.5).setInteractive().setDepth(500);
        this.pauseBtn.on('pointerdown', () => this.togglePause());
        
        this.pauseMenu = this.add.container(0, 0).setVisible(false).setDepth(1000);
        let pauseBg = this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.85);
        let pauseTitle = this.add.text(512, 150, 'PAUSED', { fontSize: '64px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
        
        let resumeBtn = this.add.text(512, 300, 'RESUME', { fontSize: '32px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        resumeBtn.on('pointerdown', () => this.togglePause());

        this.pauseMuteBtn = this.add.text(512, 400, this.sound.mute ? '🔇 SOUND OFF' : '🔊 SOUND ON', { fontSize: '32px', fill: '#fff', backgroundColor: '#34495e', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        this.pauseMuteBtn.on('pointerdown', () => {
            this.sound.mute = !this.sound.mute;
            this.pauseMuteBtn.setText(this.sound.mute ? '🔇 SOUND OFF' : '🔊 SOUND ON');
        });

        let leaveBtn = this.add.text(512, 500, 'LEAVE GAME', { fontSize: '32px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        leaveBtn.on('pointerdown', () => this.leaveGame());

        this.pauseMenu.add([pauseBg, pauseTitle, resumeBtn, this.pauseMuteBtn, leaveBtn]);

        // CONTROLS
        this.cursors = this.input.keyboard.createCursorKeys();
        this.keyW = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W);
        this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
        this.keyD = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D);
        this.punchKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.kickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.specialKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        this.createTouchButton(100, 480, '◀', 0x95a5a6, () => { this.btnLeftPressed = true; }, () => { this.btnLeftPressed = false; });
        this.createTouchButton(220, 480, '▶', 0x95a5a6, () => { this.btnRightPressed = true; }, () => { this.btnRightPressed = false; });
        this.createTouchButton(160, 380, '▲', 0x95a5a6, () => { this.btnJumpPressed = true; }, () => { this.btnJumpPressed = false; });
        this.createTouchButton(850, 480, 'PUNCH', 0xe74c3c, () => this.doLocalAttack('punch'), () => {});
        this.createTouchButton(700, 480, 'KICK', 0x3498db, () => this.doLocalAttack('kick'), () => {});
        this.createTouchButton(550, 480, 'SPECIAL', 0xf1c40f, () => this.doLocalSpecial(), () => {});

        // NETWORK SYNC
        if (this.gameMode === 'online' && conn) {
            this.syncTimer = this.time.addEvent({
                delay: 30, 
                callback: () => {
                    if (this.isPaused || this.isGameOver) return;
                    conn.send({
                        type: 'move',
                        x: isHost ? this.player.x : this.enemy.x,
                        y: isHost ? this.player.y : this.enemy.y,
                        flipX: isHost ? this.player.flipX : this.enemy.flipX
                    });
                },
                loop: true
            });

            conn.on('data', (data) => {
                if (this.isPaused || this.isGameOver) return; 
                if (data.type === 'move') {
                    if (isHost) { this.enemy.x = data.x; this.enemy.y = data.y; this.enemy.setFlipX(data.flipX); } 
                    else { this.player.x = data.x; this.player.y = data.y; this.player.setFlipX(data.flipX); }
                } else if (data.type === 'health') {
                    this.playerHealth = data.p1Health;
                    this.enemyHealth = data.p2Health;
                    if (data.attacker === 'p1') { this.enemy.setTint(0xff0000); setTimeout(() => this.enemy.clearTint(), 150); } 
                    else { this.player.setTint(0xff0000); setTimeout(() => this.player.clearTint(), 150); }
                }
            });

            conn.on('close', () => {
                if (!this.isGameOver) {
                    this.isGameOver = true;
                    if (this.fightMusic) this.fightMusic.stop();
                    this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.9).setDepth(1001);
                    this.add.text(512, 288, 'OPPONENT LEFT THE GAME', { fontSize: '50px', fill: '#e74c3c', fontStyle: 'bold' }).setOrigin(0.5).setDepth(1002);
                    this.time.delayedCall(3000, () => { this.scene.start('MainMenu'); });
                }
            });
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.physics.pause();
            if (this.syncTimer) this.syncTimer.paused = true; 
            this.pauseMenu.setVisible(true);
            this.pauseBtn.setVisible(false);
        } else {
            this.physics.resume();
            if (this.syncTimer) this.syncTimer.paused = false;
            this.pauseMenu.setVisible(false);
            this.pauseBtn.setVisible(true);
        }
    }

    leaveGame() {
        this.isGameOver = true;
        if (this.fightMusic) this.fightMusic.stop();
        this.sound.stopByKey('sfx_win'); 
        this.sound.stopByKey('sfx_lose');

        if (this.gameMode === 'online' && conn) { 
            conn.close(); peer.destroy(); conn = null; peer = null; 
        }

        if (this.cache.audio.exists('bgm_menu')) {
            let menuMusic = this.sound.get('bgm_menu');
            if (!menuMusic) menuMusic = this.sound.add('bgm_menu', { loop: true, volume: 0.5 });
            if (!menuMusic.isPlaying) menuMusic.play();
        }
        this.scene.start('MainMenu');
    }

    createTouchButton(x, y, label, color, callbackDown, callbackUp) {
        let btn = this.add.text(x, y, label, { fontSize: '24px', fill: '#fff', fontStyle: 'bold', backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba, padding: { x: 20, y: 15 } }).setOrigin(0.5).setInteractive().setAlpha(0.6);
        btn.on('pointerdown', () => { btn.setAlpha(1); callbackDown(); });
        btn.on('pointerup', () => { btn.setAlpha(0.6); callbackUp(); });
        btn.on('pointerout', () => { btn.setAlpha(0.6); callbackUp(); });
    }

    update() {
        if (this.isGameOver || this.isPaused) return;

        if (this.gameMode === 'ai' || (this.gameMode === 'online' && isHost)) {
            if (this.cursors.left.isDown || this.keyA.isDown || this.btnLeftPressed) { this.player.setVelocityX(-250); } 
            else if (this.cursors.right.isDown || this.keyD.isDown || this.btnRightPressed) { this.player.setVelocityX(250); } 
            else { this.player.setVelocityX(0); }

            if ((this.cursors.up.isDown || this.keyW.isDown || this.btnJumpPressed) && this.player.body.touching.down) {
                this.player.setVelocityY(-600); this.btnJumpPressed = false;
            }

            if (Phaser.Input.Keyboard.JustDown(this.punchKey)) this.doLocalAttack('punch');
            if (Phaser.Input.Keyboard.JustDown(this.kickKey)) this.doLocalAttack('kick');
            if (Phaser.Input.Keyboard.JustDown(this.specialKey)) this.doLocalSpecial();
        } 
        else if (this.gameMode === 'online' && !isHost) {
            if (this.cursors.left.isDown || this.keyA.isDown || this.btnLeftPressed) { this.enemy.setVelocityX(-250); } 
            else if (this.cursors.right.isDown || this.keyD.isDown || this.btnRightPressed) { this.enemy.setVelocityX(250); } 
            else { this.enemy.setVelocityX(0); }

            if ((this.cursors.up.isDown || this.keyW.isDown || this.btnJumpPressed) && this.enemy.body.touching.down) {
                this.enemy.setVelocityY(-600); this.btnJumpPressed = false;
            }

            if (Phaser.Input.Keyboard.JustDown(this.punchKey)) this.doLocalAttack('punch');
            if (Phaser.Input.Keyboard.JustDown(this.kickKey)) this.doLocalAttack('kick');
            if (Phaser.Input.Keyboard.JustDown(this.specialKey)) this.doLocalSpecial();
        }

        if (this.gameMode === 'ai') {
            let enemySpeed = 150; let attackChance = 0.02; let specialChance = 0.01;
            if (this.difficulty === 'Easy') { enemySpeed = 80; attackChance = 0.008; specialChance = 0.003; } 
            else if (this.difficulty === 'Hard') { enemySpeed = 250; attackChance = 0.05; specialChance = 0.03; }

            if (Math.abs(this.enemy.x - this.player.x) > 100) {
                if (this.enemy.x > this.player.x) { this.enemy.setVelocityX(-enemySpeed); this.enemy.setFlipX(true); }
                else { this.enemy.setVelocityX(enemySpeed); this.enemy.setFlipX(false); }
            } else {
                this.enemy.setVelocityX(0);
                if (Math.random() < attackChance) this.executeAttack(this.enemy, this.player, 'punch');
                if (Math.random() < specialChance && this.p2SpecialReady) this.useSpecial(this.p2Name, false);
            }
        }

        this.playerHealthBar.width = (Math.max(0, this.playerHealth) / 100) * 300;
        this.enemyHealthBar.width = (Math.max(0, this.enemyHealth) / 100) * 300;

        if (this.enemyHealth <= 0 && !this.isGameOver) this.endGame('PLAYER');
        if (this.playerHealth <= 0 && !this.isGameOver) this.endGame('ENEMY');
    }

    doLocalAttack(type) {
        if (this.playerAttackCooldown || this.isPaused) return;
        this.playerAttackCooldown = true;
        setTimeout(() => this.playerAttackCooldown = false, type === 'kick' ? 600 : 300);

        let sfxKey = type === 'kick' ? 'sfx_kick' : 'sfx_punch';
        if (!this.sound.mute && this.cache.audio.exists(sfxKey)) this.sound.play(sfxKey, { volume: 0.6 });

        let attacker = isHost || this.gameMode === 'ai' ? this.player : this.enemy;
        let defender = isHost || this.gameMode === 'ai' ? this.enemy : this.player;
        this.executeAttack(attacker, defender, type);
    }

    executeAttack(attacker, defender, type) {
        let distance = Phaser.Math.Distance.Between(attacker.x, attacker.y, defender.x, defender.y);
        if (distance < (type === 'kick' ? 220 : 180)) {
            if (defender === this.enemy) this.enemyHealth -= (type === 'kick' ? 15 : 10);
            if (defender === this.player) this.playerHealth -= (type === 'kick' ? 15 : 10);
            
            attacker.x += (attacker.x < defender.x ? 30 : -30);
            if (type === 'kick') { defender.setTint(0xffaa00); this.cameras.main.shake(100, 0.005); }
            else { defender.setTint(0xff0000); }
            setTimeout(() => defender.clearTint(), 150);

            if (this.gameMode === 'online' && conn) {
                conn.send({ type: 'health', p1Health: this.playerHealth, p2Health: this.enemyHealth, attacker: isHost ? 'p1' : 'p2' });
            }
        }
    }

    doLocalSpecial() {
        if (this.isPaused) return;
        let attacker = isHost || this.gameMode === 'ai' ? this.player : this.enemy;
        let characterName = isHost || this.gameMode === 'ai' ? this.p1Name : this.p2Name;
        let isP1 = isHost || this.gameMode === 'ai';
        
        if (isP1 && this.p1SpecialReady) {
            this.useSpecial(characterName, true);
            if (this.gameMode === 'online' && conn) conn.send({ type: 'health', p1Health: this.playerHealth, p2Health: this.enemyHealth, attacker: 'p1' });
        } else if (!isP1 && this.p2SpecialReady) {
            this.useSpecial(characterName, false);
            if (this.gameMode === 'online' && conn) conn.send({ type: 'health', p1Health: this.playerHealth, p2Health: this.enemyHealth, attacker: 'p2' });
        }
    }

    useSpecial(character, isPlayer) {
        let powerSfxKey = character + '_power';
        if (!this.sound.mute && this.cache.audio.exists(powerSfxKey)) this.sound.play(powerSfxKey, { volume: 0.8 });

        let targetHealth = isPlayer ? 'enemyHealth' : 'playerHealth';
        let targetSprite = isPlayer ? this.enemy : this.player;
        let attackerSprite = isPlayer ? this.player : this.enemy;
        
        if (isPlayer) {
            this.p1SpecialReady = false; this.p1SpecialText.setText('Special: COOLDOWN...');
            this.time.delayedCall(5000, () => { this.p1SpecialReady = true; this.p1SpecialText.setText('Special (F): READY'); });
        } else { this.p2SpecialReady = false; this.time.delayedCall(5000, () => { this.p2SpecialReady = true; }); }

        switch (character) {
            case 'aadhil': this.showFloatingText("ESP32 ZAP!", attackerSprite); this[targetHealth] -= 25; this.animateLightning(attackerSprite, targetSprite); break;
            case 'adhya': this.showFloatingText("Zzz... Healed!", attackerSprite); if (isPlayer) this.playerHealth = Math.min(100, this.playerHealth + 30); else this.enemyHealth = Math.min(100, this.enemyHealth + 30); this.animateHeal(attackerSprite); break;
            case 'shifana': this.showFloatingText("FLASH BANG!", attackerSprite); this.animateFlash(targetSprite); break;
            case 'abhinanda': this.showFloatingText("TRASH TALK!", attackerSprite); this[targetHealth] -= 15; this.animateSoundWaves(attackerSprite); break;
            case 'muthalib': this.showFloatingText("INVINCIBLE!", attackerSprite); if (isPlayer) this.playerHealth += 15; this.animateGoldShield(attackerSprite); break;
            case 'aadhiljunise': this.showFloatingText("SYSTEM OVERRIDE!", attackerSprite); this[targetHealth] -= 30; if (isPlayer) this.playerHealth = Math.min(100, this.playerHealth + 20); else this.enemyHealth = Math.min(100, this.enemyHealth + 20); this.animateCodeRain(targetSprite); break;
        }
    }

    animateLightning(attacker, target) { let lightning = this.add.graphics(); lightning.lineStyle(6, 0x00ffff, 1); lightning.beginPath(); lightning.moveTo(attacker.x, attacker.y - 50); let midX = (attacker.x + target.x) / 2; let midY = (attacker.y + target.y) / 2 - 100; lightning.lineTo(midX, midY + 50); lightning.lineTo(midX + 30, midY); lightning.lineTo(target.x, target.y - 50); lightning.strokePath(); this.tweens.add({ targets: lightning, alpha: 0, duration: 400, onComplete: () => lightning.destroy() }); }
    animateHeal(target) { let healCircle = this.add.circle(target.x, target.y, 50, 0x2ecc71, 0.5); this.tweens.add({ targets: healCircle, scale: 2, alpha: 0, duration: 800, onComplete: () => healCircle.destroy() }); for(let i=0; i<3; i++) { let plus = this.add.text(target.x + Phaser.Math.Between(-40, 40), target.y, "+", { fontSize: '40px', fill: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5); this.tweens.add({ targets: plus, y: target.y - 150, alpha: 0, duration: 1000, delay: i * 150, onComplete: () => plus.destroy() }); } }
    animateFlash(target) { let flash = this.add.circle(target.x, target.y, 20, 0xffffff, 1); this.tweens.add({ targets: flash, scale: 20, alpha: 0, duration: 600, ease: 'Expo.easeOut', onComplete: () => flash.destroy() }); target.setTint(0xffffff); setTimeout(() => target.clearTint(), 500); }
    animateSoundWaves(attacker) { for(let i=0; i<3; i++) { let wave = this.add.circle(attacker.x, attacker.y, 20).setStrokeStyle(4, 0xff00ff, 1); this.tweens.add({ targets: wave, scale: 6, alpha: 0, duration: 800, delay: i * 150, ease: 'Sine.easeOut', onComplete: () => wave.destroy() }); } }
    animateGoldShield(attacker) { attacker.setTint(0xffd700); let shield = this.add.circle(attacker.x, attacker.y, 60).setStrokeStyle(6, 0xffd700, 1); this.tweens.add({ targets: shield, scale: 1.3, alpha: 0.2, yoyo: true, repeat: 3, duration: 300, onComplete: () => { shield.destroy(); attacker.clearTint(); } }); }
    animateCodeRain(target) { target.setTint(0x00ff00); for(let i=0; i<6; i++) { let symbols = ['</>', '{}', 'AI', '0101', '&&']; let codeText = symbols[Phaser.Math.Between(0, symbols.length - 1)]; let codeSprite = this.add.text(target.x + Phaser.Math.Between(-60, 60), target.y - Phaser.Math.Between(50, 150), codeText, { fontSize: '28px', fill: '#00ff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5); this.tweens.add({ targets: codeSprite, y: codeSprite.y + 200, alpha: 0, duration: 800, delay: i * 100, onComplete: () => codeSprite.destroy() }); } let blast = this.add.circle(target.x, target.y, 30, 0x00ff00, 0.6); this.tweens.add({ targets: blast, scale: 4, alpha: 0, duration: 500, onComplete: () => blast.destroy() }); setTimeout(() => target.clearTint(), 600); }
    showFloatingText(text, sprite) { let txt = this.add.text(sprite.x, sprite.y - 100, text, { fontSize: '36px', fill: '#f1c40f', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5); this.tweens.add({ targets: txt, y: sprite.y - 200, alpha: 0, duration: 1200, onComplete: () => txt.destroy() }); }

    endGame(winner) {
        this.isGameOver = true; 
        this.player.setVelocityX(0); this.enemy.setVelocityX(0);
        if (this.syncTimer) this.syncTimer.remove(); 
        
        // ==========================================
        // SAVE WIN TO GITHUB
        // ==========================================
        let winnerName = (winner === 'PLAYER') ? this.p1Name : this.p2Name;
        let modeKey = (this.gameMode === 'online') ? 'online' : 'ai';
        
        const apiUrl = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${FILE_PATH}`;
        
        fetch(apiUrl, { headers: { Authorization: `token ${GITHUB_TOKEN}` } })
            .then(res => res.json())
            .then(fileData => {
                let cleanContent = fileData.content.replace(/\n/g, ''); 
                let currentData = JSON.parse(atob(cleanContent));
                
                if (!currentData.online) currentData.online = {};
                if (!currentData.ai) currentData.ai = {};
                
                currentData[modeKey][winnerName] = (currentData[modeKey][winnerName] || 0) + 1;
                
                let newContent = btoa(JSON.stringify(currentData, null, 2));

                return fetch(apiUrl, {
                    method: 'PUT',
                    headers: { Authorization: `token ${GITHUB_TOKEN}`, 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        message: `🏆 ${winnerName} won a ${modeKey} match!`,
                        content: newContent,
                        sha: fileData.sha,
                        branch: BRANCH
                    })
                });
            })
            .then(res => res.json())
            .then(data => console.log("Leaderboard Updated on GitHub!", data))
            .catch(err => console.error("GitHub Save Failed:", err));

        // ==========================================

        try { if (this.fightMusic) this.fightMusic.stop(); } catch (e) {}
        try {
            if (!this.sound.mute) {
                if (winner === 'PLAYER' && this.cache.audio.exists('sfx_win')) this.sound.play('sfx_win', { volume: 0.8 });
                else if (winner === 'ENEMY' && this.cache.audio.exists('sfx_lose')) this.sound.play('sfx_lose', { volume: 0.8 });
            }
        } catch (e) {}

        const winTexts = { 'aadhil': "Aadhil wins! The ESP32 short-circuited the competition.", 'muthalib': "Muthalib wins! Was there any doubt? (Spoiler: No).", 'adhya': "Adhya wins... *yawn*... wake me up when there's a real challenge.", 'shifana': "Shifana wins! Say cheese! 📸 That's going viral.", 'abhinanda': "Abhinanda wins! She literally talked the opponent to defeat.", 'aadhiljunise': "Aadhil Junise wins! Code compiled successfully with 0 errors. GG!" };
        const loseTexts = { 'aadhil': "Aadhil lost because he spent the whole fight debugging the hitbox.", 'muthalib': "Muthalib lost, but his confidence remains at 100%.", 'adhya': "Adhya fell asleep and forgot to block. Zzz...", 'shifana': "Shifana lost, but she got a great shot of the punch that KO'd her.", 'abhinanda': "Abhinanda lost, but she is still talking...", 'aadhiljunise': "Aadhil Junise lost. Time to check the stack trace and push a hotfix..." };

        let mainText = winner === 'PLAYER' ? `${this.p1Name.toUpperCase()} WINS!` : `${this.p2Name.toUpperCase()} WINS!`;
        let funnyText = winner === 'PLAYER' ? winTexts[this.p1Name] : winTexts[this.p2Name];
        let loserText = winner === 'PLAYER' ? loseTexts[this.p2Name] : loseTexts[this.p1Name];
        
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.85); 
        this.add.text(512, 150, mainText, { fontSize: '64px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(512, 230, funnyText, { fontSize: '24px', fill: '#2ecc71', fontStyle: 'italic', wordWrap: { width: 800 } }).setOrigin(0.5);
        this.add.text(512, 280, loserText, { fontSize: '20px', fill: '#e74c3c', wordWrap: { width: 800 } }).setOrigin(0.5);
        
        let replayBtn = this.add.text(512, 380, 'REPLAY', { fontSize: '32px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        replayBtn.on('pointerdown', () => { 
            this.sound.stopByKey('sfx_win'); this.sound.stopByKey('sfx_lose');
            this.scene.restart({ p1: this.p1Name, p2: this.p2Name, diff: this.difficulty, mode: this.gameMode }); 
        });
        
        let exitBtn = this.add.text(512, 460, 'CHANGE CHARACTERS', { fontSize: '24px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 15, y: 10 } }).setOrigin(0.5).setInteractive();
        exitBtn.on('pointerdown', () => { 
            this.sound.stopByKey('sfx_win'); this.sound.stopByKey('sfx_lose');
            if (this.cache.audio.exists('bgm_menu')) {
                let menuMusic = this.sound.get('bgm_menu');
                if (!menuMusic) menuMusic = this.sound.add('bgm_menu', { loop: true, volume: 0.5 });
                if (!menuMusic.isPlaying) menuMusic.play();
            }
            if (this.gameMode === 'online' && conn) { conn.close(); peer.destroy(); conn = null; peer = null; }
            this.scene.start('CharSelectScene', { mode: this.gameMode });
        });
    }
}

// ==========================================
// INITIALIZE THE GAME
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 576,
    parent: 'game-container',
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        activePointers: 4 
    },
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 1000 }, debug: false }
    },
    scene: [BootScene, MainMenu, LobbyScene, CharSelectScene, DifficultyScene, LeaderboardScene, GameScene] 
};

const game = new Phaser.Game(config);