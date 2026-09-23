// main.js - Entry point game, Three.js Loop, dan Handler Interaksi

import { sound } from './audio.js';
import { PlayerController } from './player.js';
import { LibraryRoom } from './room.js';
import { BookManager } from './books.js';
import { GameManager } from './game.js';
import { getGenreById } from './data.js';

class GameApp {
    constructor() {
        this.container = document.getElementById('canvas-container');
        this.promptElem = document.getElementById('interaction-prompt');

        this.initThree();
        this.initGame();
        this.initEvents();

        this.clock = new THREE.Clock();
        this.animate = this.animate.bind(this);
        requestAnimationFrame(this.animate);
    }

    initThree() {
        // 1. Scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color('#0d0a08');
        this.scene.fog = new THREE.FogExp2(0x0d0a08, 0.04);

        // 2. Camera (POV Orang Pertama)
        // FOV 72 derajat yang nyaman dan natural
        this.camera = new THREE.PerspectiveCamera(
            72,
            window.innerWidth / window.innerHeight,
            0.1,
            50.0
        );
        this.scene.add(this.camera);

        // 3. WebGL Renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.15;

        this.container.appendChild(this.renderer.domElement);
    }

    initGame() {
        // Create Room & Shelves
        this.room = new LibraryRoom(this.scene);

        // Create Book Manager
        this.bookManager = new BookManager(this.scene, this.camera);

        // Create Player First-Person Controller
        this.player = new PlayerController(this.camera, this.renderer.domElement);

        // Create Game Progression & State Manager
        this.game = new GameManager(this.bookManager, this.room, this.player);

        // Start Level 1 (5 buku di lantai)
        this.game.startLevel(0);
    }

    initEvents() {
        // Window Resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });

        // Keydown Interactions
        window.addEventListener('keydown', (e) => {
            if (e.code === 'KeyE') {
                this.handleInteractAction();
            }
            if (e.code === 'KeyG' || e.code === 'KeyQ') {
                this.handleDropAction();
            }
        });

        // Mouse Click Interaction
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            // Left click to interact
            if (e.button === 0 && this.player.isLocked) {
                this.handleInteractAction();
            }
        });

        // Unlock pointer button for UI
        const resumeBtn = document.getElementById('btn-start-game');
        if (resumeBtn) {
            resumeBtn.addEventListener('click', () => {
                document.getElementById('start-screen').classList.add('hidden');
                sound.ensureContext();
                sound.startAmbient();
                this.renderer.domElement.requestPointerLock();
            });
        }
    }

    handleInteractAction() {
        sound.ensureContext();

        const hovered = this.player.hoveredObject;
        const type = this.player.hoveredType;
        const held = this.bookManager.heldBook;

        // 1. If looking at a book on the floor or shelf: Pick it up
        if (type === 'book' && hovered && hovered.userData && hovered.userData.bookInstance) {
            const bookInst = hovered.userData.bookInstance;
            if (!held) {
                const picked = this.bookManager.pickupBook(bookInst);
                if (picked) {
                    sound.playPickupBook();
                    this.game.updateHUD();
                    this.game.showToast(`Memegang: "${bookInst.data.title} (Part ${bookInst.data.part})"`, 'info');
                }
            }
            return;
        }

        // 2. If holding a book and looking at a shelf slot: Try placing it into slot
        if (held && type === 'slot' && hovered && hovered.userData) {
            this.game.tryPlaceHeldBook(hovered.userData);
            return;
        }
    }

    handleDropAction() {
        const held = this.bookManager.heldBook;
        if (held) {
            const dropped = this.bookManager.dropHeldBook(this.player.position, this.player.yaw);
            if (dropped) {
                sound.playDropBook();
                this.game.updateHUD();
                this.game.showToast('Buku diletakkan kembali ke lantai.', 'info');
            }
        }
    }

    updateInteractionHUD() {
        const hovered = this.player.hoveredObject;
        const type = this.player.hoveredType;
        const held = this.bookManager.heldBook;
        const crosshair = document.getElementById('crosshair');

        if (!this.promptElem) return;

        // Reset previous book highlights
        this.bookManager.books.forEach(b => {
            if (b !== held) this.bookManager.setHoveredBook(b, false);
        });

        // Reset all shelf slot highlights
        this.room.shelfSlotMeshes.forEach(sm => {
            sm.material.opacity = 0.0;
        });

        if (hovered && type === 'book' && hovered.userData && hovered.userData.bookInstance) {
            const bookInst = hovered.userData.bookInstance;
            this.bookManager.setHoveredBook(bookInst, true);

            if (crosshair) crosshair.classList.add('active');

            if (!held) {
                this.promptElem.innerHTML = `
                    <div class="prompt-badge">Tekan <kbd>E</kbd> / Klik Kiri</div>
                    <div class="prompt-desc">Ambil Buku: <strong>${bookInst.data.title}</strong> [Part ${bookInst.data.part}]</div>
                `;
                this.promptElem.classList.remove('hidden');
            } else {
                this.promptElem.innerHTML = `
                    <div class="prompt-desc">Tangan Anda sedang membawa buku lain! Letakkan dulu.</div>
                `;
                this.promptElem.classList.remove('hidden');
            }
        } else if (held && hovered && type === 'slot' && hovered.userData) {
            if (crosshair) crosshair.classList.add('active');
            
            // Highlight targeted slot
            hovered.material.opacity = 0.35;

            const genre = getGenreById(hovered.userData.genreId);
            this.promptElem.innerHTML = `
                <div class="prompt-badge">Tekan <kbd>E</kbd> / Klik Kiri</div>
                <div class="prompt-desc">Susun ke <strong>Rak ${genre.shortName}</strong> (Baris ${hovered.userData.tierIndex + 1})</div>
            `;
            this.promptElem.classList.remove('hidden');
        } else if (held) {
            if (crosshair) crosshair.classList.remove('active');
            this.promptElem.innerHTML = `
                <div class="prompt-desc">Tekan <kbd>G</kbd> untuk Meletakkan Buku di Lantai</div>
            `;
            this.promptElem.classList.remove('hidden');
        } else {
            if (crosshair) crosshair.classList.remove('active');
            this.promptElem.classList.add('hidden');
        }
    }

    animate() {
        requestAnimationFrame(this.animate);

        const delta = this.clock.getDelta();
        const elapsedTime = this.clock.getElapsedTime();

        // 1. Gather interactables for raycasting
        const interactables = [];
        // Books that are on floor or shelf
        this.bookManager.books.forEach(b => {
            if (b.state !== 'HELD') {
                interactables.push(b.mesh);
            }
        });
        // Shelf slots
        if (this.bookManager.heldBook) {
            this.room.shelfSlotMeshes.forEach(slotMesh => {
                interactables.push(slotMesh);
            });
        }

        // 2. Update Player Movement & Raycaster
        this.player.update(delta, interactables);

        // 3. Update Environment Atmosphere
        this.room.updateAtmosphere(delta);

        // 4. Update Held Book Bobbing
        const isWalking = this.player.velocity.lengthSq() > 0.1;
        this.bookManager.update(elapsedTime, isWalking);

        // 5. Update UI Prompts
        this.updateInteractionHUD();

        // 6. Render Scene
        this.renderer.render(this.scene, this.camera);
    }
}

// Start Game on Page Load
window.addEventListener('DOMContentLoaded', () => {
    window.gameApp = new GameApp();
});
