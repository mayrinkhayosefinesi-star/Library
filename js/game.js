// game.js - Logika Validasi Susunan Buku, Progresi Level 1-10, dan Pengelola UI

import { LEVELS, GENRES, BOOK_SERIES, getSeriesById, getGenreById } from './data.js';
import { sound } from './audio.js';

export class GameManager {
    constructor(bookManager, libraryRoom, playerController) {
        this.bookManager = bookManager;
        this.room = libraryRoom;
        this.player = playerController;

        this.currentLevelIndex = 0; // 0 = Level 1, 9 = Level 10
        this.levelStartTime = 0;
        this.isLevelActive = false;
        this.placedCount = 0;
        this.mistakesCount = 0;

        this.initUI();
    }

    startLevel(levelIndex) {
        this.currentLevelIndex = Math.max(0, Math.min(LEVELS.length - 1, levelIndex));
        const levelConfig = LEVELS[this.currentLevelIndex];

        this.placedCount = 0;
        this.mistakesCount = 0;
        this.levelStartTime = performance.now();
        this.isLevelActive = true;

        // Reset all shelf slot occupancy
        this.room.shelfSlots.forEach(slot => {
            slot.occupied = null;
        });

        // Spawn level books
        const spawnedBooks = this.bookManager.spawnLevelBooks(levelConfig);

        // Update UI
        this.updateHUD();
        this.showToast(`Level ${levelConfig.level}: ${levelConfig.title}`, 'info');

        // Close any open modals
        this.closeAllModals();
    }

    restartCurrentLevel() {
        this.startLevel(this.currentLevelIndex);
    }

    nextLevel() {
        if (this.currentLevelIndex < LEVELS.length - 1) {
            this.startLevel(this.currentLevelIndex + 1);
        } else {
            // Already at level 10
            this.showVictoryModal();
        }
    }

    // --- Validation Logic: Menyusun Buku ke Rak ---
    tryPlaceHeldBook(slotUserData) {
        const held = this.bookManager.heldBook;
        if (!held) return;

        // 1. Check if slot is already occupied
        if (slotUserData.occupied) {
            this.showToast('Slot rak ini sudah terisi buku lain!', 'warning');
            sound.playWrongSound();
            return;
        }

        // 2. Check Genre Match
        if (slotUserData.genreId !== held.data.genreId) {
            const targetGenre = getGenreById(held.data.genreId);
            const slotGenre = getGenreById(slotUserData.genreId);
            this.showToast(`Salah Rak! Buku ini bergenre "${targetGenre.shortName}", bukan "${slotGenre.shortName}".`, 'error');
            sound.playWrongSound();
            this.mistakesCount++;
            return;
        }

        // 3. Check Series grouping and sequential Part order
        // Find all slots in the same shelf tier
        const tierSlots = this.room.shelfSlots.filter(s => 
            s.shelfIndex === slotUserData.shelfIndex && 
            s.tierIndex === slotUserData.tierIndex
        ).sort((a, b) => a.slotIndex - b.slotIndex);

        // Check if other parts of this series are already placed on this shelf
        const sameSeriesBooksInTier = tierSlots
            .filter(s => s.occupied && s.occupied.data.seriesId === held.data.seriesId)
            .map(s => ({ slotIndex: s.slotIndex, part: s.occupied.data.part }));

        // Also check if this series is placed on a DIFFERENT tier/cabinet of this genre
        const sameSeriesInOtherTiers = this.room.shelfSlots.filter(s => 
            s.occupied && 
            s.occupied.data.seriesId === held.data.seriesId &&
            (s.shelfIndex !== slotUserData.shelfIndex || s.tierIndex !== slotUserData.tierIndex)
        );

        if (sameSeriesInOtherTiers.length > 0) {
            this.showToast(`Serial "${held.data.title}" sudah mulai disusun di baris rak yang lain! Letakkan di baris yang sama.`, 'warning');
            sound.playWrongSound();
            this.mistakesCount++;
            return;
        }

        // Rule for sequential ordering (Part 1 < Part 2 < Part 3 from left to right)
        let orderValid = true;
        let orderReason = '';

        for (const other of sameSeriesBooksInTier) {
            if (held.data.part > other.part && slotUserData.slotIndex < other.slotIndex) {
                // Placing higher part to the left of lower part
                orderValid = false;
                orderReason = `Part ${held.data.part} harus berada di sebelah kanan Part ${other.part}!`;
                break;
            }
            if (held.data.part < other.part && slotUserData.slotIndex > other.slotIndex) {
                // Placing lower part to the right of higher part
                orderValid = false;
                orderReason = `Part ${held.data.part} harus berada di sebelah kiri Part ${other.part}!`;
                break;
            }
        }

        if (!orderValid) {
            this.showToast(orderReason, 'error');
            sound.playWrongSound();
            this.mistakesCount++;
            return;
        }

        // Placement SUCCESS!
        const placed = this.bookManager.placeBookIntoSlot(held, slotUserData);
        if (placed) {
            sound.playPlaceBook();
            sound.playSuccessChime();
            this.showToast(`Bagus! "${held.data.title} - Part ${held.data.part}" tersusun rapi.`, 'success');
            
            this.placedCount++;
            this.updateHUD();
            this.checkLevelCompletion();
        }
    }

    checkLevelCompletion() {
        const levelConfig = LEVELS[this.currentLevelIndex];
        const totalBooks = this.bookManager.books.length;

        // Check if all books are placed in valid shelf slots
        const allPlaced = this.bookManager.books.every(b => b.state === 'ON_SHELF');

        if (allPlaced) {
            this.isLevelActive = false;
            const elapsedTime = Math.round((performance.now() - this.levelStartTime) / 1000);

            // Calculate Stars (1 to 3 stars based on mistakes)
            let stars = 3;
            if (this.mistakesCount >= 3) stars = 2;
            if (this.mistakesCount >= 6) stars = 1;

            if (this.currentLevelIndex === LEVELS.length - 1) {
                // Game Finished! (Level 10 Complete)
                sound.playGameVictory();
                this.showVictoryModal();
            } else {
                // Level Finished
                sound.playLevelWin();
                this.showLevelCompleteModal(stars, elapsedTime);
            }
        }
    }

    // --- UI Controls & Modals ---
    initUI() {
        this.hudLevel = document.getElementById('hud-level');
        this.hudLevelTitle = document.getElementById('hud-level-title');
        this.hudBooksProgress = document.getElementById('hud-books-progress');
        this.hudBooksBar = document.getElementById('hud-books-bar');
        this.heldCard = document.getElementById('held-book-card');
        this.toastContainer = document.getElementById('toast-container');

        // Buttons
        document.getElementById('btn-help')?.addEventListener('click', () => this.toggleCatalogModal());
        document.getElementById('btn-settings')?.addEventListener('click', () => this.toggleSettingsModal());
        document.getElementById('btn-restart')?.addEventListener('click', () => this.restartCurrentLevel());
        document.getElementById('btn-next-level')?.addEventListener('click', () => this.nextLevel());
        document.getElementById('btn-play-again')?.addEventListener('click', () => this.startLevel(0));

        // Settings Sliders
        const sensSlider = document.getElementById('sensitivity-slider');
        if (sensSlider) {
            sensSlider.addEventListener('input', (e) => {
                const val = parseFloat(e.target.value);
                this.player.setSensitivity(val);
                document.getElementById('sens-val').innerText = `${Math.round(val * 100)}%`;
            });
        }

        const sfxSlider = document.getElementById('sfx-slider');
        if (sfxSlider) {
            sfxSlider.addEventListener('input', (e) => {
                sound.setSfxVolume(parseFloat(e.target.value));
            });
        }

        const musicSlider = document.getElementById('music-slider');
        if (musicSlider) {
            musicSlider.addEventListener('input', (e) => {
                sound.setMusicVolume(parseFloat(e.target.value));
            });
        }

        const ambientToggle = document.getElementById('ambient-toggle');
        if (ambientToggle) {
            ambientToggle.addEventListener('change', (e) => {
                if (e.target.checked) sound.startAmbient();
                else sound.stopAmbient();
            });
        }

        // Close modal buttons
        document.querySelectorAll('.modal-close-btn').forEach(btn => {
            btn.addEventListener('click', () => this.closeAllModals());
        });

        // Tab key for Catalog
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Tab') {
                e.preventDefault();
                this.toggleCatalogModal();
            }
            if (e.code === 'Escape') {
                this.closeAllModals();
            }
        });
    }

    updateHUD() {
        const levelConfig = LEVELS[this.currentLevelIndex];
        const total = this.bookManager.books.length || levelConfig.targetBooks;
        const placed = this.placedCount;

        if (this.hudLevel) this.hudLevel.innerText = `LEVEL ${levelConfig.level} / 10`;
        if (this.hudLevelTitle) this.hudLevelTitle.innerText = levelConfig.title;
        if (this.hudBooksProgress) this.hudBooksProgress.innerText = `${placed} / ${total} Buku`;
        if (this.hudBooksBar) {
            const percent = total > 0 ? (placed / total) * 100 : 0;
            this.hudBooksBar.style.width = `${percent}%`;
        }

        // Update held book card
        const held = this.bookManager.heldBook;
        if (held && this.heldCard) {
            this.heldCard.classList.remove('hidden');
            document.getElementById('held-genre-badge').innerText = `${held.data.genre.icon} ${held.data.genre.shortName}`;
            document.getElementById('held-genre-badge').style.backgroundColor = held.data.genre.color;
            document.getElementById('held-title').innerText = held.data.title;
            document.getElementById('held-part').innerText = `Part ${held.data.part} (${held.data.subtitle})`;
            document.getElementById('held-author').innerText = `Penulis: ${held.data.author}`;
            document.getElementById('held-synopsis').innerText = held.data.series.synopsis;
        } else if (this.heldCard) {
            this.heldCard.classList.add('hidden');
        }
    }

    showToast(message, type = 'info') {
        if (!this.toastContainer) return;
        const toast = document.createElement('div');
        toast.className = `toast-item toast-${type}`;
        
        let icon = 'ℹ️';
        if (type === 'success') icon = '✨';
        if (type === 'error') icon = '⚠️';
        if (type === 'warning') icon = '💡';

        toast.innerHTML = `<span class="toast-icon">${icon}</span> <span>${message}</span>`;
        this.toastContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 400);
        }, 3200);
    }

    toggleCatalogModal() {
        const modal = document.getElementById('catalog-modal');
        if (!modal) return;
        if (modal.classList.contains('active')) {
            modal.classList.remove('active');
        } else {
            this.populateCatalog();
            modal.classList.add('active');
        }
    }

    populateCatalog() {
        const levelConfig = LEVELS[this.currentLevelIndex];
        const container = document.getElementById('catalog-content');
        if (!container) return;

        let html = `
            <div class="catalog-header-info">
                <h3>Panduan Susunan Rak - Level ${levelConfig.level}: ${levelConfig.title}</h3>
                <p class="catalog-hint">${levelConfig.hint}</p>
            </div>
            <div class="catalog-grid">
        `;

        levelConfig.seriesList.forEach(item => {
            const series = getSeriesById(item.seriesId);
            const genre = getGenreById(series.genreId);

            html += `
                <div class="catalog-series-card" style="border-left: 5px solid ${genre.color}">
                    <div class="card-genre-tag" style="background: ${genre.color}">${genre.icon} Rak ${genre.shortName}</div>
                    <h4>${series.title}</h4>
                    <p class="series-author">Penulis: ${series.author}</p>
                    <div class="series-parts-pills">
                        ${item.parts.map(p => `<span class="part-pill">Part ${p}</span>`).join('')}
                    </div>
                </div>
            `;
        });

        html += `</div>`;
        container.innerHTML = html;
    }

    toggleSettingsModal() {
        const modal = document.getElementById('settings-modal');
        if (!modal) return;
        modal.classList.toggle('active');
    }

    showLevelCompleteModal(stars, timeSeconds) {
        const modal = document.getElementById('level-win-modal');
        if (!modal) return;

        const levelConfig = LEVELS[this.currentLevelIndex];
        document.getElementById('win-level-title').innerText = `Level ${levelConfig.level} Selesai!`;
        document.getElementById('win-subtitle').innerText = levelConfig.title;
        document.getElementById('win-time').innerText = `${timeSeconds} Detik`;
        document.getElementById('win-mistakes').innerText = `${this.mistakesCount} Kesalahan`;

        // Render stars
        const starsContainer = document.getElementById('win-stars');
        if (starsContainer) {
            starsContainer.innerHTML = '★'.repeat(stars) + '☆'.repeat(3 - stars);
        }

        modal.classList.add('active');
    }

    showVictoryModal() {
        const modal = document.getElementById('game-victory-modal');
        if (!modal) return;
        modal.classList.add('active');
    }

    closeAllModals() {
        document.querySelectorAll('.modal-overlay').forEach(m => m.classList.remove('active'));
    }
}
