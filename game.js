// ==========================================
// SCENE 0: BOOT
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene'); 
    }

        preload() {
        this.load.image('background', 'assets/background.png');
        const chars = ['aadhil', 'muthalib', 'adhya', 'shifana', 'abhinanda', 'aadhiljunise'];
        
        // Load character images
        chars.forEach(c => this.load.image(c, `assets/${c}.png`));

        // Load base audio
        this.load.audio('bgm_menu', 'assets/bgm_menu.mp3'); 
        this.load.audio('bgm_fight', 'assets/bgm_fight.mp3'); 
        this.load.audio('sfx_punch', 'assets/sfx_punch.mp3');
        this.load.audio('sfx_kick', 'assets/sfx_kick.mp3');
        this.load.audio('sfx_win', 'assets/sfx_win.mp3');
        this.load.audio('sfx_lose', 'assets/lose.mp3'); // Or sfx_lose.mp3
        
        // 👇 AUTOMATICALLY LOAD ALL 6 CUSTOM POWER SOUNDS 👇
        chars.forEach(c => {
            this.load.audio(`${c}_power`, `assets/${c}_power.mp3`);
        });

        // Image Fallback
        this.load.on('loaderror', (file) => {
            const g = this.make.graphics({x:0, y:0, add:false});
            g.fillStyle(0x4f46e5, 1); g.fillRect(0, 0, 100, 200);
            g.lineStyle(4, 0xffffff, 1); g.strokeRect(0, 0, 100, 200);
            g.generateTexture(file.key, 100, 200);
        });
    }
    create() {
        this.scene.start('MainMenu');
    }
}

// ==========================================
// SCENE 1: MAIN MENU
// ==========================================
class MainMenu extends Phaser.Scene {
    constructor() {
        super('MainMenu');
    }

    create() {
        // Safely play BGM if it exists
             if (this.cache.audio.exists('bgm_menu')) {
            let menuMusic = this.sound.get('bgm_menu');
            if (!menuMusic) {
                menuMusic = this.sound.add('bgm_menu', { loop: true, volume: 0.5 });
            }
            if (!menuMusic.isPlaying) {
                menuMusic.play();
            }
        }

        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.7); 
        
        this.add.text(512, 100, 'FIGHT KARO', { fontSize: '80px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(512, 170, 'COLLEGE EDITION', { fontSize: '32px', fill: '#ecf0f1' }).setOrigin(0.5);

        this.add.text(512, 250, 'HOW TO PLAY', { fontSize: '28px', fill: '#3498db', fontStyle: 'bold' }).setOrigin(0.5);
        let controlsText = "Move: Arrow Keys / WASD / On-Screen Buttons\nJump: Up Arrow / W / On-Screen Button\nPunch (J): Fast, low damage\nKick (K): Slow, high damage\nSpecial (F): Character's Ultimate";
        this.add.text(512, 330, controlsText, { fontSize: '20px', fill: '#bdc3c7', align: 'center', lineSpacing: 8 }).setOrigin(0.5);

        // MUTE BUTTON
        let isMuted = this.sound.mute;
        let muteBtn = this.add.text(900, 50, isMuted ? '🔇 Muted' : '🔊 Sound ON', { 
            fontSize: '20px', fill: '#fff', backgroundColor: '#333', padding: { x: 10, y: 10 } 
        }).setOrigin(0.5).setInteractive();

        muteBtn.on('pointerdown', () => {
            this.sound.mute = !this.sound.mute;
            muteBtn.setText(this.sound.mute ? '🔇 Muted' : '🔊 Sound ON');
        });

        let playBtn = this.add.text(512, 470, 'PLAY', { fontSize: '40px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 40, y: 20 } }).setOrigin(0.5).setInteractive();
        
        playBtn.on('pointerdown', () => { 
            this.scene.start('CharSelectScene'); 
        });
        playBtn.on('pointerover', () => playBtn.setStyle({ backgroundColor: '#27ae60' }));
        playBtn.on('pointerout', () => playBtn.setStyle({ backgroundColor: '#2ecc71' }));
    }
}

// ==========================================
// SCENE 2: CHARACTER SELECTION
// ==========================================
class CharSelectScene extends Phaser.Scene {
    constructor() {
        super('CharSelectScene');
    }

    // 👇 ADDED INIT TO RECEIVE DATA BACK FROM DIFFICULTY SCENE 👇
    init(data) {
        this.p1Char = data.p1 || null;
        this.p2Char = data.p2 || null;
        this.activePlayer = this.p2Char ? 1 : (this.p1Char ? 2 : 1);
    }

    create() {
        if (this.cache.audio.exists('bgm_menu')) {
            let menuMusic = this.sound.get('bgm_menu');
            if (menuMusic && !menuMusic.isPlaying) menuMusic.play();
        }

        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.6); 

        // 👇 ADDED BACK TO MAIN MENU BUTTON 👇
        let backBtn = this.add.text(100, 50, '⬅ MAIN MENU', { 
            fontSize: '20px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 15, y: 10 } 
        }).setOrigin(0.5).setInteractive();
        
        backBtn.on('pointerdown', () => {
            this.scene.start('MainMenu');
        });

        this.add.text(512, 50, 'SELECT YOUR FIGHTERS', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        
        // Show previously selected characters if coming back
        let p1Display = this.p1Char ? ((this.p1Char === 'aadhiljunise') ? 'AADHIL JUNISE' : this.p1Char.toUpperCase()) : 'PICKING...';
        let p2Display = this.p2Char ? ((this.p2Char === 'aadhiljunise') ? 'AADHIL JUNISE' : this.p2Char.toUpperCase()) : 'WAITING...';
        
        this.p1Text = this.add.text(250, 100, `Player 1: ${p1Display}`, { fontSize: '24px', fill: '#3498db', fontStyle: 'bold' }).setOrigin(0.5);
        this.p2Text = this.add.text(774, 100, `Player 2: ${p2Display}`, { fontSize: '24px', fill: this.p2Char ? '#e74c3c' : '#7f8c8d' }).setOrigin(0.5);

        const chars = ['aadhil', 'muthalib', 'adhya', 'shifana', 'abhinanda', 'aadhiljunise'];
        this.sprites = []; 
        let startX = 512 - ((chars.length - 1) * 140) / 2; 

        chars.forEach((char, index) => {
            let x = startX + (index * 140);
            let y = 300;
            let sprite = this.add.image(x, y, char).setScale(0.35); 
            this.sprites.push({ name: char, sprite: sprite });
            
            sprite.setInteractive();
            sprite.on('pointerdown', () => {
                this.handleSelection(char, sprite);
            });
            
            let displayName = (char === 'aadhiljunise') ? 'AADHIL JUNISE' : char.toUpperCase();
            this.add.text(x, y + 120, displayName, { fontSize: '16px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        });

        // Re-apply the tints if coming back from Difficulty screen
        this.sprites.forEach(s => s.sprite.clearTint());
        let p1Sprite = this.sprites.find(s => s.name === this.p1Char);
        if (p1Sprite) p1Sprite.sprite.setTint(0x3498db);
        let p2Sprite = this.sprites.find(s => s.name === this.p2Char);
        if (p2Sprite) p2Sprite.sprite.setTint(0xe74c3c);

        this.startBtn = this.add.text(512, 520, 'CONTINUE TO DIFFICULTY', { 
            fontSize: '32px', fill: '#2ecc71', fontStyle: 'bold', backgroundColor: '#000', padding: { x: 20, y: 10 } 
        }).setOrigin(0.5).setVisible(this.p1Char !== null && this.p2Char !== null);

        this.startBtn.setInteractive();
        this.startBtn.on('pointerdown', () => {
            this.scene.start('DifficultyScene', { p1: this.p1Char, p2: this.p2Char });
        });
    }

    handleSelection(char, sprite) {
        if (this.activePlayer === 2 && char === this.p1Char) return; 

        if (this.activePlayer === 1) {
            this.p1Char = char;
            let displayName = (char === 'aadhiljunise') ? 'AADHIL JUNISE' : char.toUpperCase();
            this.p1Text.setText(`Player 1: ${displayName}`);
            this.p2Text.setColor('#e74c3c');
            if (!this.p2Char) this.p2Text.setText('Player 2: PICKING...');
            this.activePlayer = 2;
        } else {
            this.p2Char = char;
            let displayName = (char === 'aadhiljunise') ? 'AADHIL JUNISE' : char.toUpperCase();
            this.p2Text.setText(`Player 2: ${displayName}`);
            this.p1Text.setColor('#3498db');
            this.p2Text.setColor('#e74c3c');
            this.activePlayer = 1; 
        }

        this.sprites.forEach(s => s.sprite.clearTint());
        
        let p1Sprite = this.sprites.find(s => s.name === this.p1Char);
        if (p1Sprite) p1Sprite.sprite.setTint(0x3498db);
        let p2Sprite = this.sprites.find(s => s.name === this.p2Char);
        if (p2Sprite) p2Sprite.sprite.setTint(0xe74c3c);

        if (this.p1Char && this.p2Char) this.startBtn.setVisible(true);
    }
}
// ==========================================
// SCENE 3: DIFFICULTY SELECTION
// ==========================================
class DifficultyScene extends Phaser.Scene {
    constructor() {
        super('DifficultyScene');
    }

    init(data) {
        this.p1Char = data.p1;
        this.p2Char = data.p2;
    }

    create() {
        this.add.image(512, 288, 'background').setDisplaySize(1024, 576);
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.7);
        
        // 👇 ADDED BACK TO CHARACTER SELECT BUTTON 👇
        let backBtn = this.add.text(150, 450, '⬅ BACK', { 
            fontSize: '24px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 20, y: 10 } 
        }).setOrigin(0.5).setInteractive();
        
        backBtn.on('pointerdown', () => {
            // Pass the characters back so they stay selected!
            this.scene.start('CharSelectScene', { p1: this.p1Char, p2: this.p2Char });
        });

        this.add.text(512, 150, 'SELECT DIFFICULTY', { fontSize: '50px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);

        let easyBtn = this.add.text(300, 300, 'EASY', { fontSize: '32px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        easyBtn.on('pointerdown', () => { this.startGame('Easy'); });

        let normalBtn = this.add.text(512, 300, 'NORMAL', { fontSize: '32px', fill: '#fff', backgroundColor: '#f39c12', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        normalBtn.on('pointerdown', () => { this.startGame('Normal'); });

        let hardBtn = this.add.text(724, 300, 'HARD', { fontSize: '32px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 30, y: 15 } }).setOrigin(0.5).setInteractive();
        hardBtn.on('pointerdown', () => { this.startGame('Hard'); });
    }

    startGame(difficulty) {
        this.scene.start('GameScene', { p1: this.p1Char, p2: this.p2Char, diff: difficulty });
    }
}

// ==========================================
// SCENE 4: GAME
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.p1Name = data.p1 || 'aadhil'; 
        this.p2Name = data.p2 || 'muthalib';
        this.difficulty = data.diff || 'Normal';
    }

    create() {
        let menuMusic = this.sound.get('bgm_menu');
        if (menuMusic && menuMusic.isPlaying) {
            menuMusic.stop();
        }

        // 👇 START THE FIGHT MUSIC HERE 👇
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
        
        this.add.text(512, 30, `MODE: ${this.difficulty.toUpperCase()}`, { fontSize: '20px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);

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
        this.createTouchButton(850, 480, 'PUNCH', 0xe74c3c, () => this.doPlayerAttack('punch'), () => {});
        this.createTouchButton(700, 480, 'KICK', 0x3498db, () => this.doPlayerAttack('kick'), () => {});
        this.createTouchButton(550, 480, 'SPECIAL', 0xf1c40f, () => { if(this.p1SpecialReady) this.useSpecial(this.p1Name, true); }, () => {});
    }

    createTouchButton(x, y, label, color, callbackDown, callbackUp) {
        let btn = this.add.text(x, y, label, { fontSize: '24px', fill: '#fff', fontStyle: 'bold', backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba, padding: { x: 20, y: 15 } }).setOrigin(0.5).setInteractive().setAlpha(0.6);
        btn.on('pointerdown', () => { btn.setAlpha(1); callbackDown(); });
        btn.on('pointerup', () => { btn.setAlpha(0.6); callbackUp(); });
        btn.on('pointerout', () => { btn.setAlpha(0.6); callbackUp(); });
    }

    update() {
        if (this.isGameOver) return;

        let enemySpeed = 150; let attackChance = 0.02; let specialChance = 0.01; let enemyDamage = 10;
        if (this.difficulty === 'Easy') { enemySpeed = 80; attackChance = 0.008; specialChance = 0.003; enemyDamage = 5; } 
        else if (this.difficulty === 'Hard') { enemySpeed = 250; attackChance = 0.05; specialChance = 0.03; enemyDamage = 15; }

        if (this.cursors.left.isDown || this.keyA.isDown || this.btnLeftPressed) { this.player.setVelocityX(-250); } 
        else if (this.cursors.right.isDown || this.keyD.isDown || this.btnRightPressed) { this.player.setVelocityX(250); } 
        else { this.player.setVelocityX(0); }

        if ((this.cursors.up.isDown || this.keyW.isDown || this.btnJumpPressed) && this.player.body.touching.down) {
            this.player.setVelocityY(-600); this.btnJumpPressed = false;
        }

        if (Phaser.Input.Keyboard.JustDown(this.punchKey) && !this.playerAttackCooldown) this.doPlayerAttack('punch');
        if (Phaser.Input.Keyboard.JustDown(this.kickKey) && !this.playerAttackCooldown) this.doPlayerAttack('kick');
        if (Phaser.Input.Keyboard.JustDown(this.specialKey) && this.p1SpecialReady) this.useSpecial(this.p1Name, true);

        if (Math.abs(this.enemy.x - this.player.x) > 100) {
            if (this.enemy.x > this.player.x) { this.enemy.setVelocityX(-enemySpeed); this.enemy.setFlipX(true); }
            else { this.enemy.setVelocityX(enemySpeed); this.enemy.setFlipX(false); }
        } else {
            this.enemy.setVelocityX(0);
            if (Math.random() < attackChance) this.doEnemyAttack(enemyDamage);
            if (Math.random() < specialChance && this.p2SpecialReady) this.useSpecial(this.p2Name, false);
        }

        this.playerHealthBar.width = (Math.max(0, this.playerHealth) / 100) * 300;
        this.enemyHealthBar.width = (Math.max(0, this.enemyHealth) / 100) * 300;

        if (this.enemyHealth <= 0 && !this.isGameOver) this.endGame('PLAYER');
        if (this.playerHealth <= 0 && !this.isGameOver) this.endGame('ENEMY');
    }

    doPlayerAttack(type) {
        this.playerAttackCooldown = true;
        setTimeout(() => this.playerAttackCooldown = false, type === 'kick' ? 600 : 300);

        let sfxKey = type === 'kick' ? 'sfx_kick' : 'sfx_punch';
        if (!this.sound.mute && this.cache.audio.exists(sfxKey)) this.sound.play(sfxKey, { volume: 0.6 });

        let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
        if (distance < (type === 'kick' ? 220 : 180)) {
            this.enemyHealth -= (type === 'kick' ? 15 : 10);
            this.player.x += (this.player.x < this.enemy.x ? 30 : -30);
            if (type === 'kick') { this.enemy.setTint(0xffaa00); this.cameras.main.shake(100, 0.005); }
            else { this.enemy.setTint(0xff0000); }
            setTimeout(() => this.enemy.clearTint(), 150);
        }
    }

    doEnemyAttack(damage) {
        let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
        if (distance < 200) {
            if (!this.sound.mute && this.cache.audio.exists('sfx_punch')) this.sound.play('sfx_punch', { volume: 0.4 }); 
            this.playerHealth -= damage;
            this.enemy.x += (this.enemy.x < this.player.x ? 30 : -30);
            this.player.setTint(0xff0000);
            setTimeout(() => this.player.clearTint(), 150);
        }
    }

        useSpecial(character, isPlayer) {
        // 👇 PLAY THE CUSTOM POWER SOUND BASED ON WHO IS ATTACKING 👇
        let powerSfxKey = character + '_power';
        if (!this.sound.mute && this.cache.audio.exists(powerSfxKey)) {
            this.sound.play(powerSfxKey, { volume: 0.8 });
        }

        let targetHealth = isPlayer ? 'enemyHealth' : 'playerHealth';
        let targetSprite = isPlayer ? this.enemy : this.player;
        let attackerSprite = isPlayer ? this.player : this.enemy;
        
        if (isPlayer) {
            this.p1SpecialReady = false; 
            this.p1SpecialText.setText('Special: COOLDOWN...');
            this.time.delayedCall(5000, () => { 
                this.p1SpecialReady = true; 
                this.p1SpecialText.setText('Special (F): READY'); 
            });
        } else { 
            this.p2SpecialReady = false; 
            this.time.delayedCall(5000, () => { this.p2SpecialReady = true; }); 
        }

        switch (character) {
            case 'aadhil': 
                this.showFloatingText("ESP32 ZAP!", attackerSprite); 
                this[targetHealth] -= 25; 
                this.animateLightning(attackerSprite, targetSprite); 
                targetSprite.setTint(0x00ffff); 
                setTimeout(() => targetSprite.clearTint(), 500); 
                break;
            case 'adhya': 
                this.showFloatingText("Zzz... Healed!", attackerSprite); 
                if (isPlayer) this.playerHealth = Math.min(100, this.playerHealth + 30); 
                else this.enemyHealth = Math.min(100, this.enemyHealth + 30); 
                this.animateHeal(attackerSprite); 
                break;
            case 'shifana': 
                this.showFloatingText("FLASH BANG!", attackerSprite); 
                this.animateFlash(targetSprite); 
                targetSprite.body.moves = false; 
                setTimeout(() => { targetSprite.body.moves = true; }, 2000); 
                break;
            case 'abhinanda': 
                this.showFloatingText("TRASH TALK!", attackerSprite); 
                this[targetHealth] -= 15; 
                this.animateSoundWaves(attackerSprite); 
                break;
            case 'muthalib': 
                this.showFloatingText("INVINCIBLE!", attackerSprite); 
                if (isPlayer) this.playerHealth += 15; 
                this.animateGoldShield(attackerSprite); 
                break;
            case 'aadhiljunise': 
                this.showFloatingText("SYSTEM OVERRIDE!", attackerSprite); 
                this[targetHealth] -= 30; 
                if (isPlayer) this.playerHealth = Math.min(100, this.playerHealth + 20); 
                else this.enemyHealth = Math.min(100, this.enemyHealth + 20); 
                this.animateCodeRain(targetSprite); 
                break;
        }
    }

    // ==========================================
    // ANIMATIONS
    // ==========================================
    animateLightning(attacker, target) {
        let lightning = this.add.graphics(); 
        lightning.lineStyle(6, 0x00ffff, 1); 
        lightning.beginPath(); 
        lightning.moveTo(attacker.x, attacker.y - 50);
        let midX = (attacker.x + target.x) / 2; 
        let midY = (attacker.y + target.y) / 2 - 100;
        lightning.lineTo(midX, midY + 50); 
        lightning.lineTo(midX + 30, midY); 
        lightning.lineTo(target.x, target.y - 50); 
        lightning.strokePath();
        this.tweens.add({ targets: lightning, alpha: 0, duration: 400, onComplete: () => lightning.destroy() });
    }

    animateHeal(target) {
        let healCircle = this.add.circle(target.x, target.y, 50, 0x2ecc71, 0.5);
        this.tweens.add({ targets: healCircle, scale: 2, alpha: 0, duration: 800, onComplete: () => healCircle.destroy() });
        for(let i=0; i<3; i++) {
            let plus = this.add.text(target.x + Phaser.Math.Between(-40, 40), target.y, "+", { fontSize: '40px', fill: '#2ecc71', fontStyle: 'bold' }).setOrigin(0.5);
            this.tweens.add({ targets: plus, y: target.y - 150, alpha: 0, duration: 1000, delay: i * 150, onComplete: () => plus.destroy() });
        }
    }

    animateFlash(target) {
        let flash = this.add.circle(target.x, target.y, 20, 0xffffff, 1);
        this.tweens.add({ targets: flash, scale: 20, alpha: 0, duration: 600, ease: 'Expo.easeOut', onComplete: () => flash.destroy() });
        target.setTint(0xffffff); 
        setTimeout(() => target.clearTint(), 500);
    }

    animateSoundWaves(attacker) {
        for(let i=0; i<3; i++) {
            let wave = this.add.circle(attacker.x, attacker.y, 20).setStrokeStyle(4, 0xff00ff, 1);
            this.tweens.add({ targets: wave, scale: 6, alpha: 0, duration: 800, delay: i * 150, ease: 'Sine.easeOut', onComplete: () => wave.destroy() });
        }
    }

    animateGoldShield(attacker) {
        attacker.setTint(0xffd700); 
        let shield = this.add.circle(attacker.x, attacker.y, 60).setStrokeStyle(6, 0xffd700, 1);
        this.tweens.add({ targets: shield, scale: 1.3, alpha: 0.2, yoyo: true, repeat: 3, duration: 300, onComplete: () => { shield.destroy(); attacker.clearTint(); } });
    }

    animateCodeRain(target) {
        target.setTint(0x00ff00);
        for(let i=0; i<6; i++) {
            let symbols = ['</>', '{}', 'AI', '0101', '&&'];
            let codeText = symbols[Phaser.Math.Between(0, symbols.length - 1)];
            let codeSprite = this.add.text(target.x + Phaser.Math.Between(-60, 60), target.y - Phaser.Math.Between(50, 150), codeText, { fontSize: '28px', fill: '#00ff00', fontStyle: 'bold', stroke: '#000', strokeThickness: 2 }).setOrigin(0.5);
            this.tweens.add({ targets: codeSprite, y: codeSprite.y + 200, alpha: 0, duration: 800, delay: i * 100, onComplete: () => codeSprite.destroy() });
        }
        let blast = this.add.circle(target.x, target.y, 30, 0x00ff00, 0.6);
        this.tweens.add({ targets: blast, scale: 4, alpha: 0, duration: 500, onComplete: () => blast.destroy() });
        setTimeout(() => target.clearTint(), 600);
    }

    showFloatingText(text, sprite) {
        let txt = this.add.text(sprite.x, sprite.y - 100, text, { fontSize: '36px', fill: '#f1c40f', fontStyle: 'bold', stroke: '#000', strokeThickness: 4 }).setOrigin(0.5);
        this.tweens.add({ targets: txt, y: sprite.y - 200, alpha: 0, duration: 1200, onComplete: () => txt.destroy() });
    }

    // ==========================================
    // GAME OVER
    // ==========================================
    endGame(winner) {
        this.isGameOver = true; 
        this.player.setVelocityX(0); 
        this.enemy.setVelocityX(0);
        
        try { if (this.fightMusic) this.fightMusic.stop(); } catch (e) {}

        try {
            if (!this.sound.mute) {
                if (winner === 'PLAYER' && this.cache.audio.exists('sfx_win')) {
                    this.sound.play('sfx_win', { volume: 0.8 });
                } else if (winner === 'ENEMY' && this.cache.audio.exists('sfx_lose')) {
                    this.sound.play('sfx_lose', { volume: 0.8 });
                }
            }
        } catch (e) {}

        const winTexts = { 
            'aadhil': "Aadhil wins! The ESP32 short-circuited the competition.", 
            'muthalib': "Muthalib wins! Was there any doubt? (Spoiler: No).", 
            'adhya': "Adhya wins... *yawn*... wake me up when there's a real challenge.", 
            'shifana': "Shifana wins! Say cheese! 📸 That's going viral.", 
            'abhinanda': "Abhinanda wins! She literally talked the opponent to defeat.",
            'aadhiljunise': "Aadhil Junise wins! Code compiled successfully with 0 errors. GG!"
        };
        const loseTexts = { 
            'aadhil': "Aadhil lost because he spent the whole fight debugging the hitbox.", 
            'muthalib': "Muthalib lost, but his confidence remains at 100%.", 
            'adhya': "Adhya fell asleep and forgot to block. Zzz...", 
            'shifana': "Shifana lost, but she got a great shot of the punch that KO'd her.", 
            'abhinanda': "Abhinanda lost, but she is still talking...",
            'aadhiljunise': "Aadhil Junise lost. Time to check the stack trace and push a hotfix..."
        };

        let mainText = winner === 'PLAYER' ? `${this.p1Name.toUpperCase()} WINS!` : `${this.p2Name.toUpperCase()} WINS!`;
        let funnyText = winner === 'PLAYER' ? winTexts[this.p1Name] : winTexts[this.p2Name];
        let loserText = winner === 'PLAYER' ? loseTexts[this.p2Name] : loseTexts[this.p1Name];
        
        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.85); 
        this.add.text(512, 150, mainText, { fontSize: '64px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(512, 230, funnyText, { fontSize: '24px', fill: '#2ecc71', fontStyle: 'italic', wordWrap: { width: 800 } }).setOrigin(0.5);
        this.add.text(512, 280, loserText, { fontSize: '20px', fill: '#e74c3c', wordWrap: { width: 800 } }).setOrigin(0.5);
        
        let replayBtn = this.add.text(512, 380, 'REPLAY', { fontSize: '32px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        
        replayBtn.on('pointerdown', () => { 
            this.sound.stopByKey('sfx_win');
            this.sound.stopByKey('sfx_lose');
            this.scene.restart({ p1: this.p1Name, p2: this.p2Name, diff: this.difficulty }); 
        });
        
        let exitBtn = this.add.text(512, 460, 'CHANGE CHARACTERS', { fontSize: '24px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 15, y: 10 } }).setOrigin(0.5).setInteractive();
        
        exitBtn.on('pointerdown', () => { 
            this.sound.stopByKey('sfx_win');
            this.sound.stopByKey('sfx_lose');
            
            if (this.cache.audio.exists('bgm_menu')) {
                let menuMusic = this.sound.get('bgm_menu');
                if (!menuMusic) menuMusic = this.sound.add('bgm_menu', { loop: true, volume: 0.5 });
                if (!menuMusic.isPlaying) menuMusic.play();
            }
            
            this.scene.start('CharSelectScene'); 
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
    scene: [BootScene, MainMenu, CharSelectScene, DifficultyScene, GameScene] 
};

const game = new Phaser.Game(config);