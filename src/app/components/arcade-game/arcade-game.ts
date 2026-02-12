import { Component, ElementRef, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface GameObject {
    x: number;
    y: number;
    width: number;
    height: number;
    active: boolean;
}

interface Player extends GameObject {
    speed: number;
}

interface Enemy extends GameObject {
    points: number;
}

interface Bullet extends GameObject {
    speed: number;
    isPlayerBullet: boolean;
}

@Component({
    selector: 'app-arcade-game',
    imports: [CommonModule],
    templateUrl: './arcade-game.html',
    styleUrl: './arcade-game.scss',
    standalone: true
})
export class ArcadeGame implements OnInit, OnDestroy, AfterViewInit {
    @ViewChild('gameCanvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;

    private ctx!: CanvasRenderingContext2D;
    private animationId: number = 0;
    private canvas!: HTMLCanvasElement;

    // Game state
    gameStarted = false;
    gameOver = false;
    score = 0;

    // Game objects
    private player!: Player;
    private enemies: Enemy[] = [];
    private bullets: Bullet[] = [];

    // Enemy movement
    private enemyDirection = 1;
    private enemySpeed = 1;
    private enemyDropDistance = 20;

    // AI Control
    private aiMoveTimer = 0;
    private aiMoveInterval = 100; // ms between AI move decisions
    private aiTargetX = 0;

    // Timing
    private lastEnemyShot = 0;
    private enemyShootInterval = 1500;
    private lastPlayerShot = 0;
    private playerShootInterval = 800;
    private lastTime = 0;
    private restartTimer = 0;

    ngOnInit(): void {
        // No keyboard listeners needed for auto mode
    }

    ngAfterViewInit(): void {
        this.canvas = this.canvasRef.nativeElement;
        this.ctx = this.canvas.getContext('2d')!;

        // Set canvas size
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeCanvas);

        // Initialize game
        this.initGame();

        // Start game loop
        this.gameLoop(0);
    }

    ngOnDestroy(): void {
        window.removeEventListener('resize', this.resizeCanvas);
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }

    private resizeCanvas = (): void => {
        if (!this.canvas) return;

        const container = this.canvas.parentElement;
        if (container) {
            this.canvas.width = container.clientWidth;
            this.canvas.height = container.clientHeight;
        }
    }

    private initGame(): void {
        // Initialize player
        this.player = {
            x: this.canvas.width / 2 - 15,
            y: this.canvas.height - 40,
            width: 30, // Smaller player
            height: 20,
            speed: 3, // Slower for AI to look more natural
            active: true
        };

        // Initialize enemies (5 columns x 3 rows) - Fewer rows for smaller container
        this.enemies = [];
        const enemyWidth = 25; // Smaller enemies
        const enemyHeight = 15;
        const spacing = 40;
        const startX = (this.canvas.width - (5 * spacing)) / 2;
        const startY = 30;

        for (let row = 0; row < 3; row++) {
            for (let col = 0; col < 5; col++) {
                this.enemies.push({
                    x: startX + col * spacing,
                    y: startY + row * spacing,
                    width: enemyWidth,
                    height: enemyHeight,
                    active: true,
                    points: (2 - row + 1) * 10
                });
            }
        }

        this.bullets = [];
        this.score = 0;
        this.gameOver = false;
        this.gameStarted = true;
        this.aiTargetX = this.player.x;
    }

    private shoot(): void {
        if (!this.gameStarted || this.gameOver) return;

        // Player can only have 3 bullets on screen
        const playerBullets = this.bullets.filter(b => b.isPlayerBullet && b.active);
        if (playerBullets.length >= 3) return;

        this.bullets.push({
            x: this.player.x + this.player.width / 2 - 2,
            y: this.player.y,
            width: 4,
            height: 10,
            speed: 7,
            active: true,
            isPlayerBullet: true
        });
    }

    private enemyShoot(): void {
        const activeEnemies = this.enemies.filter(e => e.active);
        if (activeEnemies.length === 0) return;

        // Random enemy shoots
        const shooter = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];

        this.bullets.push({
            x: shooter.x + shooter.width / 2 - 2,
            y: shooter.y + shooter.height,
            width: 4,
            height: 10,
            speed: 4,
            active: true,
            isPlayerBullet: false
        });
    }

    private updateAI(currentTime: number): void {
        // AI Movement Logic
        if (currentTime - this.aiMoveTimer > this.aiMoveInterval) {
            // Find nearest enemy or bullet to dodge
            const incomingBullets = this.bullets.filter(b => !b.isPlayerBullet && b.active && b.y > this.canvas.height / 2);

            if (incomingBullets.length > 0) {
                // Dodge logic: move away from nearest bullet
                const nearestBullet = incomingBullets.reduce((prev, curr) =>
                    (Math.abs(curr.x - this.player.x) < Math.abs(prev.x - this.player.x) ? curr : prev));

                if (Math.abs(nearestBullet.x - (this.player.x + this.player.width / 2)) < 50) {
                    // If bullet is close, move away
                    if (nearestBullet.x > this.player.x) {
                        this.aiTargetX = Math.max(0, this.player.x - 50);
                    } else {
                        this.aiTargetX = Math.min(this.canvas.width - this.player.width, this.player.x + 50);
                    }
                }
            } else {
                // Attack logic: align with nearest enemy
                const activeEnemies = this.enemies.filter(e => e.active);
                if (activeEnemies.length > 0) {
                    // Sometimes target a random enemy to look more human
                    const targetEnemy = activeEnemies[Math.floor(Math.random() * activeEnemies.length)];
                    this.aiTargetX = targetEnemy.x;
                }
            }

            this.aiMoveTimer = currentTime;
        }

        // Execute movement towards target
        if (Math.abs(this.player.x - this.aiTargetX) > this.player.speed) {
            if (this.player.x < this.aiTargetX) {
                this.player.x += this.player.speed;
            } else {
                this.player.x -= this.player.speed;
            }
        }

        // AI Shooting Logic
        if (currentTime - this.lastPlayerShot > this.playerShootInterval) {
            // Shoot if aligned with an enemy (roughly)
            const center = this.player.x + this.player.width / 2;
            const alignedEnemy = this.enemies.some(e => e.active && center > e.x && center < e.x + e.width);

            if (alignedEnemy || Math.random() < 0.3) { // Sometimes shoot randomly
                this.shoot();
                this.lastPlayerShot = currentTime;
                // Randomize interval slightly
                this.playerShootInterval = 500 + Math.random() * 800;
            }
        }
    }

    private update(deltaTime: number): void {
        if (!this.gameStarted) return;

        if (this.gameOver) {
            // Auto restart after 2 seconds
            if (Date.now() - this.restartTimer > 2000) {
                this.initGame();
            }
            return;
        }

        const currentTime = Date.now();
        this.updateAI(currentTime);

        // Update bullets
        this.bullets.forEach(bullet => {
            if (!bullet.active) return;

            if (bullet.isPlayerBullet) {
                bullet.y -= bullet.speed;
                if (bullet.y < 0) bullet.active = false;
            } else {
                bullet.y += bullet.speed;
                if (bullet.y > this.canvas.height) bullet.active = false;
            }
        });

        // Update enemies
        let shouldMoveDown = false;
        const activeEnemies = this.enemies.filter(e => e.active);

        activeEnemies.forEach(enemy => {
            enemy.x += this.enemyDirection * this.enemySpeed;

            if (enemy.x <= 0 || enemy.x >= this.canvas.width - enemy.width) {
                shouldMoveDown = true;
            }
        });

        if (shouldMoveDown) {
            this.enemyDirection *= -1;
            this.enemies.forEach(enemy => {
                if (enemy.active) {
                    enemy.y += this.enemyDropDistance;
                }
            });
        }

        // Enemy shooting
        if (currentTime - this.lastEnemyShot > this.enemyShootInterval) {
            this.enemyShoot();
            this.lastEnemyShot = currentTime;
        }

        // Collision detection
        this.checkCollisions();

        // Check win/lose conditions
        if (activeEnemies.length === 0) {
            this.gameOver = true;
            this.restartTimer = Date.now();
        }

        if (activeEnemies.some(e => e.y + e.height >= this.player.y)) {
            this.gameOver = true;
            this.restartTimer = Date.now();
        }
    }

    private checkCollisions(): void {
        // Bullet-Enemy collisions
        this.bullets.forEach(bullet => {
            if (!bullet.active || !bullet.isPlayerBullet) return;

            this.enemies.forEach(enemy => {
                if (!enemy.active) return;

                if (this.isColliding(bullet, enemy)) {
                    bullet.active = false;
                    enemy.active = false;
                    this.score += enemy.points;
                }
            });
        });

        // Enemy bullet-Player collisions
        this.bullets.forEach(bullet => {
            if (!bullet.active || bullet.isPlayerBullet) return;

            if (this.isColliding(bullet, this.player)) {
                this.gameOver = true;
                this.restartTimer = Date.now();
            }
        });
    }

    private isColliding(obj1: GameObject, obj2: GameObject): boolean {
        return obj1.x < obj2.x + obj2.width &&
            obj1.x + obj1.width > obj2.x &&
            obj1.y < obj2.y + obj2.height &&
            obj1.y + obj1.height > obj2.y;
    }

    private draw(): void {
        // Clear canvas
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)'; // transparent black for trail effect
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        if (!this.gameStarted) {
            return;
        }

        // Draw player
        this.drawPlayer();

        // Draw enemies
        this.enemies.forEach(enemy => {
            if (enemy.active) {
                this.drawEnemy(enemy);
            }
        });

        // Draw bullets
        this.bullets.forEach(bullet => {
            if (bullet.active) {
                this.drawBullet(bullet);
            }
        });

        // Draw game over/win overlay
        if (this.gameOver) {
            this.drawGameOver();
        }
    }

    private drawPlayer(): void {
        const gradient = this.ctx.createLinearGradient(
            this.player.x, this.player.y,
            this.player.x, this.player.y + this.player.height
        );
        gradient.addColorStop(0, '#00ffff');
        gradient.addColorStop(1, '#9897f4');

        this.ctx.fillStyle = gradient;
        this.ctx.shadowBlur = 10;
        this.ctx.shadowColor = '#00ffff';

        // Draw ship shape
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y);
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.shadowBlur = 0;
    }

    private drawEnemy(enemy: Enemy): void {
        this.ctx.fillStyle = '#ff00ff';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = '#ff00ff';

        // Draw invader shape (simple rectangle with antenna)
        this.ctx.fillRect(enemy.x, enemy.y + 4, enemy.width, enemy.height - 4);

        // Antenna
        this.ctx.fillRect(enemy.x + 8, enemy.y, 4, 6);
        this.ctx.fillRect(enemy.x + enemy.width - 12, enemy.y, 4, 6);

        this.ctx.shadowBlur = 0;
    }

    private drawBullet(bullet: Bullet): void {
        this.ctx.fillStyle = bullet.isPlayerBullet ? '#00ffff' : '#ff00ff';
        this.ctx.shadowBlur = 5;
        this.ctx.shadowColor = bullet.isPlayerBullet ? '#00ffff' : '#ff00ff';

        this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);

        this.ctx.shadowBlur = 0;
    }

    private drawGameOver(): void {
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        this.ctx.font = 'bold 24px "Orbitron", sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.shadowBlur = 10;

        const activeEnemies = this.enemies.filter(e => e.active).length;

        if (activeEnemies === 0) {
            this.ctx.fillStyle = '#00ffff';
            this.ctx.shadowColor = '#00ffff';
            this.ctx.fillText('SYSTEM SECURED', this.canvas.width / 2, this.canvas.height / 2);
        } else {
            this.ctx.fillStyle = '#ff00ff';
            this.ctx.shadowColor = '#ff00ff';
            this.ctx.fillText('SYSTEM BREACH', this.canvas.width / 2, this.canvas.height / 2);
        }

        this.ctx.shadowBlur = 0;
    }

    private gameLoop = (timestamp: number): void => {
        const deltaTime = timestamp - this.lastTime;
        this.lastTime = timestamp;

        this.update(deltaTime);
        this.draw();

        this.animationId = requestAnimationFrame(this.gameLoop);
    }
}
