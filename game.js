// ==========================================
// SCENE 0: BOOT (Loads images)
// ==========================================
class BootScene extends Phaser.Scene {
    constructor() {
        super('BootScene'); 
    }

    preload() {
        const chars = ['aadhil', 'muthalib', 'adhya', 'shifana', 'abhinanda'];
        chars.forEach(c => this.load.image(c, `assets/${c}.png`));

        // FALLBACK: If an image is missing, draw a purple box
        this.load.on('loaderror', (file) => {
            console.log("Missing image: " + file.key);
            const g = this.make.graphics({x:0, y:0, add:false});
            g.fillStyle(0x4f46e5, 1); // Purple
            g.fillRect(0, 0, 100, 200);
            g.lineStyle(4, 0xffffff, 1);
            g.strokeRect(0, 0, 100, 200);
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
        this.cameras.main.setBackgroundColor('#1a1a1a');
        
        this.add.text(512, 100, 'FIGHT KARO', { fontSize: '80px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(512, 170, 'COLLEGE EDITION', { fontSize: '32px', fill: '#ecf0f1' }).setOrigin(0.5);

        // HOW TO PLAY SECTION
        this.add.text(512, 250, 'HOW TO PLAY', { fontSize: '28px', fill: '#3498db', fontStyle: 'bold' }).setOrigin(0.5);
        
        let controlsText = 
            "Move: Arrow Keys\n" +
            "Jump: Up Arrow\n" +
            "Punch (J): Fast, low damage\n" +
            "Kick (K): Slow, high damage\n" +
            "Special (F): Character's Ultimate";
            
        this.add.text(512, 330, controlsText, { 
            fontSize: '20px', 
            fill: '#bdc3c7', 
            align: 'center',
            lineSpacing: 8
        }).setOrigin(0.5);

        let playBtn = this.add.text(512, 470, 'PLAY', { 
            fontSize: '40px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 40, y: 20 } 
        }).setOrigin(0.5).setInteractive();

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
        this.p1Char = null;
        this.p2Char = null;
    }

    create() {
        this.p1Char = null;
        this.p2Char = null;

        this.cameras.main.setBackgroundColor('#2c3e50');
        this.add.text(512, 50, 'SELECT YOUR FIGHTERS', { fontSize: '40px', fill: '#fff', fontStyle: 'bold' }).setOrigin(0.5);
        
        this.p1Text = this.add.text(250, 100, 'Player 1: ?', { fontSize: '24px', fill: '#3498db' }).setOrigin(0.5);
        this.p2Text = this.add.text(774, 100, 'Player 2: ?', { fontSize: '24px', fill: '#e74c3c' }).setOrigin(0.5);

        const chars = ['aadhil', 'muthalib', 'adhya', 'shifana', 'abhinanda'];

        chars.forEach((char, index) => {
            let x = 200 + (index * 150);
            let y = 300;
            let sprite = this.add.image(x, y, char).setScale(0.4); 
            
            sprite.setInteractive();
            sprite.on('pointerdown', () => {
                if (!this.p1Char) {
                    this.p1Char = char;
                    this.p1Text.setText(`Player 1: ${char.toUpperCase()}`);
                    sprite.setTint(0x3498db);
                } else if (!this.p2Char && char !== this.p1Char) {
                    this.p2Char = char;
                    this.p2Text.setText(`Player 2: ${char.toUpperCase()}`);
                    sprite.setTint(0xe74c3c);
                    this.startBtn.setVisible(true);
                }
            });
            this.add.text(x, y + 120, char.toUpperCase(), { fontSize: '18px', fill: '#fff' }).setOrigin(0.5);
        });

        this.startBtn = this.add.text(512, 520, 'START FIGHT!', { 
            fontSize: '32px', fill: '#2ecc71', fontStyle: 'bold', backgroundColor: '#000', padding: { x: 20, y: 10 }
        }).setOrigin(0.5).setVisible(false);

        this.startBtn.setInteractive();
        this.startBtn.on('pointerdown', () => {
            this.scene.start('GameScene', { p1: this.p1Char, p2: this.p2Char });
        });
    }
}

// ==========================================
// SCENE 3: GAME
// ==========================================
class GameScene extends Phaser.Scene {
    constructor() {
        super('GameScene');
    }

    init(data) {
        this.p1Name = data.p1 || 'aadhil'; 
        this.p2Name = data.p2 || 'muthalib';
    }

    create() {
        this.playerHealth = 100; 
        this.enemyHealth = 100; 
        this.isGameOver = false;
        this.p1SpecialReady = true;
        this.p2SpecialReady = true;
        this.playerAttackCooldown = false;
        
        this.cameras.main.setBackgroundColor('#2c3e50'); 
        this.physics.world.setBounds(0, 0, 1024, 576);

        const ground = this.add.rectangle(512, 550, 1024, 50, 0x7f8c8d);
        this.physics.add.existing(ground, true); 

        this.player = this.physics.add.sprite(250, 400, this.p1Name).setScale(0.4);
        this.player.setCollideWorldBounds(true); 
        this.physics.add.collider(this.player, ground);

        this.enemy = this.physics.add.sprite(774, 400, this.p2Name).setScale(0.4).setFlipX(true); 
        this.enemy.setCollideWorldBounds(true); 
        this.physics.add.collider(this.enemy, ground);

        // UI Text
        this.add.text(50, 30, this.p1Name.toUpperCase(), { fontSize: '24px', fill: '#fff', fontStyle: 'bold' });
        this.playerHealthBar = this.add.rectangle(50, 60, 300, 20, 0x2ecc71).setOrigin(0, 0.5);
        this.p1SpecialText = this.add.text(50, 80, 'Special (F): READY', { fontSize: '16px', fill: '#f1c40f' });

        this.add.text(750, 30, this.p2Name.toUpperCase(), { fontSize: '24px', fill: '#fff', fontStyle: 'bold' });
        this.enemyHealthBar = this.add.rectangle(974, 60, 300, 20, 0x2ecc71).setOrigin(1, 0.5);

        // Keyboard Controls
        this.cursors = this.input.keyboard.createCursorKeys();
        this.punchKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.J);
        this.kickKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.K);
        this.specialKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F);

        // --- MOBILE TOUCH BUTTONS ---
        this.createTouchButton(850, 480, 'PUNCH (J)', 0xe74c3c, () => this.doPlayerAttack('punch'));
        this.createTouchButton(680, 480, 'KICK (K)', 0x3498db, () => this.doPlayerAttack('kick'));
        this.createTouchButton(510, 480, 'SPECIAL (F)', 0xf1c40f, () => { if(this.p1SpecialReady) this.useSpecial(this.p1Name, true); });
    }

    createTouchButton(x, y, label, color, callback) {
        let btn = this.add.text(x, y, label, { 
            fontSize: '20px', fill: '#fff', fontStyle: 'bold',
            backgroundColor: Phaser.Display.Color.IntegerToColor(color).rgba, 
            padding: { x: 15, y: 10 }
        }).setOrigin(0.5).setInteractive();

        // Make it semi-transparent so it doesn't block the view
        btn.setAlpha(0.6);

        btn.on('pointerover', () => btn.setAlpha(1));
        btn.on('pointerout', () => btn.setAlpha(0.6));
        btn.on('pointerdown', callback);
    }

    update() {
        if (this.isGameOver) return;

        // Player Movement
        if (this.cursors.left.isDown) this.player.setVelocityX(-250);
        else if (this.cursors.right.isDown) this.player.setVelocityX(250);
        else this.player.setVelocityX(0);

        if (this.cursors.up.isDown && this.player.body.touching.down) this.player.setVelocityY(-600);

        // Keyboard Attacks
        if (Phaser.Input.Keyboard.JustDown(this.punchKey) && !this.playerAttackCooldown) this.doPlayerAttack('punch');
        if (Phaser.Input.Keyboard.JustDown(this.kickKey) && !this.playerAttackCooldown) this.doPlayerAttack('kick');
        if (Phaser.Input.Keyboard.JustDown(this.specialKey) && this.p1SpecialReady) this.useSpecial(this.p1Name, true);

        // Enemy AI
        if (Math.abs(this.enemy.x - this.player.x) > 100) {
            if (this.enemy.x > this.player.x) { this.enemy.setVelocityX(-150); this.enemy.setFlipX(true); }
            else { this.enemy.setVelocityX(150); this.enemy.setFlipX(false); }
        } else {
            this.enemy.setVelocityX(0);
            if (Math.random() < 0.02) this.doEnemyAttack();
            if (Math.random() < 0.01 && this.p2SpecialReady) this.useSpecial(this.p2Name, false);
        }

        // Update Health Bars
        this.playerHealthBar.width = (Math.max(0, this.playerHealth) / 100) * 300;
        this.enemyHealthBar.width = (Math.max(0, this.enemyHealth) / 100) * 300;

        // Check Win/Lose
        if (this.enemyHealth <= 0 && !this.isGameOver) this.endGame('PLAYER');
        if (this.playerHealth <= 0 && !this.isGameOver) this.endGame('ENEMY');
    }

    // ==========================================
    // ATTACK LOGIC
    // ==========================================
    doPlayerAttack(type) {
        this.playerAttackCooldown = true;
        setTimeout(() => this.playerAttackCooldown = false, type === 'kick' ? 600 : 300); // Kick is slower

        let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
        let range = type === 'kick' ? 220 : 180; // Kick has slightly longer range
        let damage = type === 'kick' ? 15 : 10;  // Kick does more damage

        if (distance < range) {
            this.enemyHealth -= damage;
            this.player.x += (this.player.x < this.enemy.x ? (type === 'kick' ? 50 : 20) : (type === 'kick' ? -50 : -20)); // Kick lunges more
            
            // Visual effect based on attack type
            if (type === 'kick') {
                this.enemy.setTint(0xffaa00); // Orange flash for kick
                this.cameras.main.shake(100, 0.005); // Small screen shake
            } else {
                this.enemy.setTint(0xff0000); // Red flash for punch
            }
            setTimeout(() => this.enemy.clearTint(), 150);
        }
    }

    doEnemyAttack() {
        let distance = Phaser.Math.Distance.Between(this.player.x, this.player.y, this.enemy.x, this.enemy.y);
        if (distance < 200) {
            this.playerHealth -= 10;
            this.enemy.x += (this.enemy.x < this.player.x ? 30 : -30);
            this.player.setTint(0xff0000);
            setTimeout(() => this.player.clearTint(), 150);
        }
    }

    // ==========================================
    // SPECIAL POWERS & ANIMATIONS (Unchanged)
    // ==========================================
    useSpecial(character, isPlayer) {
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
        }
    }

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

        const winTexts = {
            'aadhil': "Aadhil wins! The ESP32 short-circuited the competition.",
            'muthalib': "Muthalib wins! Was there any doubt? (Spoiler: No).",
            'adhya': "Adhya wins... *yawn*... wake me up when there's a real challenge.",
            'shifana': "Shifana wins! Say cheese! 📸 That's going viral.",
            'abhinanda': "Abhinanda wins! She literally talked the opponent to defeat."
        };

        const loseTexts = {
            'aadhil': "Aadhil lost because he spent the whole fight debugging the hitbox.",
            'muthalib': "Muthalib lost, but his confidence remains at 100%.",
            'adhya': "Adhya fell asleep and forgot to block. Zzz...",
            'shifana': "Shifana lost, but she got a great shot of the punch that KO'd her.",
            'abhinanda': "Abhinanda lost, but she is still talking..."
        };

        let mainText = winner === 'PLAYER' ? `${this.p1Name.toUpperCase()} WINS!` : `${this.p2Name.toUpperCase()} WINS!`;
        let funnyText = winner === 'PLAYER' ? winTexts[this.p1Name] : winTexts[this.p2Name];
        let loserText = winner === 'PLAYER' ? loseTexts[this.p2Name] : loseTexts[this.p1Name];

        this.add.rectangle(512, 288, 1024, 576, 0x000000, 0.85); 
        this.add.text(512, 150, mainText, { fontSize: '64px', fill: '#f1c40f', fontStyle: 'bold' }).setOrigin(0.5);
        this.add.text(512, 230, funnyText, { fontSize: '24px', fill: '#2ecc71', fontStyle: 'italic', wordWrap: { width: 800 } }).setOrigin(0.5);
        this.add.text(512, 280, loserText, { fontSize: '20px', fill: '#e74c3c', wordWrap: { width: 800 } }).setOrigin(0.5);

        let replayBtn = this.add.text(512, 380, 'REPLAY', { fontSize: '32px', fill: '#fff', backgroundColor: '#2ecc71', padding: { x: 20, y: 10 } }).setOrigin(0.5).setInteractive();
        replayBtn.on('pointerdown', () => { this.scene.restart({ p1: this.p1Name, p2: this.p2Name }); });

        let exitBtn = this.add.text(512, 460, 'CHANGE CHARACTERS', { fontSize: '24px', fill: '#fff', backgroundColor: '#e74c3c', padding: { x: 15, y: 10 } }).setOrigin(0.5).setInteractive();
        exitBtn.on('pointerdown', () => { this.scene.start('CharSelectScene'); });
    }
}
// ==========================================
// INITIALIZE THE GAME (MUST BE AT THE BOTTOM)
// ==========================================
const config = {
    type: Phaser.AUTO,
    width: 1024,
    height: 576,
    parent: 'game-container',
    physics: {
        default: 'arcade',
        arcade: { gravity: { y: 1000 }, debug: false }
    },
    scene: [BootScene, MainMenu, CharSelectScene, GameScene] 
};

const game = new Phaser.Game(config);