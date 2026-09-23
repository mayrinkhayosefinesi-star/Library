// books.js - Pembuatan Model 3D Buku Prosedural, Cover Dinamis, dan Manajemen Posisi

import { GENRES, getSeriesById, getGenreById } from './data.js';

export class BookManager {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.books = []; // All current level book instances
        this.heldBook = null; // Currently carried book

        // Container attached to camera for first-person hand-held book
        this.heldBookContainer = new THREE.Group();
        this.camera.add(this.heldBookContainer);
        // Positioned at bottom right of first-person view
        this.heldBookContainer.position.set(0.35, -0.32, -0.65);
        this.heldBookContainer.rotation.set(0.2, -0.35, 0.1);
    }

    clearLevel() {
        // Remove all books from scene & held container
        if (this.heldBook) {
            this.heldBookContainer.remove(this.heldBook.mesh);
            this.heldBook = null;
        }

        this.books.forEach(b => {
            if (b.mesh.parent) {
                b.mesh.parent.remove(b.mesh);
            }
        });
        this.books = [];
    }

    // Spawn scattered books on floor based on level config
    spawnLevelBooks(levelConfig) {
        this.clearLevel();
        const bookList = [];

        // Compile list of books
        levelConfig.seriesList.forEach(seriesItem => {
            const seriesData = getSeriesById(seriesItem.seriesId);
            const genreData = getGenreById(seriesData.genreId);

            seriesItem.parts.forEach(partNum => {
                const partInfo = seriesData.parts.find(p => p.part === partNum) || {
                    part: partNum,
                    subtitle: `Bagian ${partNum}`
                };

                bookList.push({
                    seriesId: seriesData.seriesId,
                    genreId: seriesData.genreId,
                    genre: genreData,
                    series: seriesData,
                    part: partNum,
                    subtitle: partInfo.subtitle,
                    author: seriesData.author,
                    title: seriesData.title,
                    totalParts: seriesData.totalParts
                });
            });
        });

        // Shuffle books before scattering
        for (let i = bookList.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bookList[i], bookList[j]] = [bookList[j], bookList[i]];
        }

        // Scatter on floor rug (Z between -1.5 and 2.5, X between -2.5 and 2.5)
        bookList.forEach((data, index) => {
            const book = this.createBook3D(data, index);
            
            // Random scatter coordinates on rug
            const angle = Math.random() * Math.PI * 2;
            const distance = 0.6 + Math.random() * 2.2;
            const posX = Math.cos(angle) * distance;
            const posZ = 0.8 + Math.sin(angle) * (distance * 0.8);
            const rotY = Math.random() * Math.PI * 2;
            const rotZ = (Math.random() - 0.5) * 0.15; // Natural slight tilt

            book.mesh.position.set(posX, 0.04, posZ);
            book.mesh.rotation.set(0, rotY, rotZ);

            book.state = 'ON_FLOOR';
            this.scene.add(book.mesh);
            this.books.push(book);
        });

        return this.books;
    }

    // Generate procedural 3D Book Mesh with rich Canvas Texture
    createBook3D(bookData, index) {
        const width = 0.22;   // X (Depth of book cover)
        const height = 0.32;  // Y (Height of book)
        const depth = 0.055;  // Z (Spine thickness)

        const bookGroup = new THREE.Group();

        // 1. Generate Cover Canvas Texture
        const coverTexture = this.generateCoverTexture(bookData);
        const spineTexture = this.generateSpineTexture(bookData);
        const pageTexture = this.generatePageTexture();

        // Standard materials for 6 faces of BoxGeometry
        // [Right, Left, Top, Bottom, Front, Back]
        const coverMat = new THREE.MeshStandardMaterial({
            map: coverTexture,
            roughness: 0.35,
            metalness: 0.1
        });

        const spineMat = new THREE.MeshStandardMaterial({
            map: spineTexture,
            roughness: 0.35,
            metalness: 0.1
        });

        const pagesMat = new THREE.MeshStandardMaterial({
            map: pageTexture,
            roughness: 0.9,
            metalness: 0.0
        });

        const materials = [
            pagesMat,  // +X (Page edges)
            spineMat,  // -X (Book Spine)
            pagesMat,  // +Y (Top pages)
            pagesMat,  // -Y (Bottom pages)
            coverMat,  // +Z (Front Cover)
            coverMat   // -Z (Back Cover)
        ];

        const bookGeo = new THREE.BoxGeometry(width, height, depth);
        const bookMesh = new THREE.Mesh(bookGeo, materials);
        bookMesh.castShadow = true;
        bookMesh.receiveShadow = true;

        // Bounding box collider/trigger for raycasting
        const interactGeo = new THREE.BoxGeometry(width + 0.15, height + 0.15, depth + 0.15);
        const interactMat = new THREE.MeshBasicMaterial({ visible: false });
        const interactHit = new THREE.Mesh(interactGeo, interactMat);

        bookGroup.add(bookMesh);
        bookGroup.add(interactHit);

        // Hover highlight outline box
        const highlightGeo = new THREE.BoxGeometry(width + 0.02, height + 0.02, depth + 0.02);
        const highlightMat = new THREE.MeshBasicMaterial({
            color: 0xffe066,
            wireframe: true,
            transparent: true,
            opacity: 0.0
        });
        const highlightMesh = new THREE.Mesh(highlightGeo, highlightMat);
        bookGroup.add(highlightMesh);

        // Store user data
        const bookInstance = {
            id: `book_${index}_${bookData.seriesId}_p${bookData.part}`,
            data: bookData,
            mesh: bookGroup,
            bookMesh: bookMesh,
            highlightMesh: highlightMesh,
            state: 'ON_FLOOR', // 'ON_FLOOR', 'HELD', 'ON_SHELF'
            currentSlot: null,
            targetPosition: new THREE.Vector3(),
            targetQuaternion: new THREE.Quaternion(),
            isAnimating: false
        };

        bookGroup.userData = {
            interactiveType: 'book',
            bookInstance: bookInstance
        };

        return bookInstance;
    }

    generateCoverTexture(bookData) {
        const canvas = document.createElement('canvas');
        canvas.width = 512;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        // Background gradient based on Genre color
        const baseColor = bookData.genre.color;
        const grad = ctx.createLinearGradient(0, 0, 512, 768);
        grad.addColorStop(0, baseColor);
        grad.addColorStop(1, '#0e0b09');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 512, 768);

        // Ornate Vintage Golden Frame Border
        ctx.strokeStyle = '#e5c158';
        ctx.lineWidth = 14;
        ctx.strokeRect(24, 24, 464, 720);
        ctx.lineWidth = 4;
        ctx.strokeRect(44, 44, 424, 680);

        // Genre Badge
        ctx.fillStyle = bookData.genre.accentColor || '#ff4d4d';
        ctx.fillRect(140, 70, 232, 48);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        ctx.strokeRect(140, 70, 232, 48);
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 24px "Segoe UI", Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`${bookData.genre.icon} ${bookData.genre.shortName}`, 256, 102);

        // Main Title (Multi-line wrap)
        ctx.fillStyle = '#fffaea';
        ctx.font = 'bold 42px "Playfair Display", Georgia, serif';
        ctx.textAlign = 'center';

        const titleWords = bookData.title.split(' ');
        if (titleWords.length > 3) {
            const line1 = titleWords.slice(0, Math.ceil(titleWords.length / 2)).join(' ');
            const line2 = titleWords.slice(Math.ceil(titleWords.length / 2)).join(' ');
            ctx.fillText(line1, 256, 260);
            ctx.fillText(line2, 256, 315);
        } else {
            ctx.fillText(bookData.title, 256, 290);
        }

        // Subtitle / Part Name
        ctx.fillStyle = '#d4af37';
        ctx.font = 'italic 28px Georgia, serif';
        ctx.fillText(`"${bookData.subtitle}"`, 256, 380);

        // Big Part Badge (Jilid / Part)
        ctx.fillStyle = 'rgba(212, 175, 55, 0.2)';
        ctx.beginPath();
        ctx.arc(256, 490, 70, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#d4af37';
        ctx.lineWidth = 6;
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 22px "Segoe UI", sans-serif';
        ctx.fillText('BAGIAN', 256, 470);
        ctx.font = 'bold 54px "Segoe UI", sans-serif';
        ctx.fillText(`${bookData.part}`, 256, 525);

        // Author at bottom
        ctx.fillStyle = '#e0d6c3';
        ctx.font = '24px "Segoe UI", sans-serif';
        ctx.fillText(`Karya: ${bookData.author}`, 256, 670);

        return new THREE.CanvasTexture(canvas);
    }

    generateSpineTexture(bookData) {
        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 768;
        const ctx = canvas.getContext('2d');

        // Spine Background
        ctx.fillStyle = bookData.genre.color;
        ctx.fillRect(0, 0, 128, 768);

        // Gold bands on top and bottom of spine
        ctx.fillStyle = '#d4af37';
        ctx.fillRect(10, 30, 108, 12);
        ctx.fillRect(10, 52, 108, 6);
        ctx.fillRect(10, 700, 108, 6);
        ctx.fillRect(10, 718, 108, 12);

        // Part Badge on top of spine
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 32px "Segoe UI", sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`P-${bookData.part}`, 64, 115);

        // Genre Icon
        ctx.font = '36px "Segoe UI"';
        ctx.fillText(bookData.genre.icon, 64, 175);

        // Spine Title rotated vertically
        ctx.save();
        ctx.translate(64, 450);
        ctx.rotate(-Math.PI / 2);
        ctx.fillStyle = '#fffaea';
        ctx.font = 'bold 28px "Segoe UI", Georgia, sans-serif';
        ctx.textAlign = 'center';
        // Clip title if too long
        let shortTitle = bookData.title;
        if (shortTitle.length > 18) shortTitle = shortTitle.substring(0, 16) + '...';
        ctx.fillText(shortTitle, 0, 10);
        ctx.restore();

        return new THREE.CanvasTexture(canvas);
    }

    generatePageTexture() {
        const canvas = document.createElement('canvas');
        canvas.width = 256;
        canvas.height = 256;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#f4eedb'; // Aged cream parchment
        ctx.fillRect(0, 0, 256, 256);

        // Page line ridges
        ctx.strokeStyle = 'rgba(180, 160, 130, 0.4)';
        ctx.lineWidth = 1;
        for (let y = 0; y < 256; y += 4) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(256, y);
            ctx.stroke();
        }

        return new THREE.CanvasTexture(canvas);
    }

    // Pick up a book from the floor or shelf
    pickupBook(bookInstance) {
        if (this.heldBook) return false;

        // If it was on a slot, free the slot
        if (bookInstance.currentSlot) {
            bookInstance.currentSlot.occupied = null;
            bookInstance.currentSlot = null;
        }

        // Remove from current parent
        if (bookInstance.mesh.parent) {
            bookInstance.mesh.parent.remove(bookInstance.mesh);
        }

        // Add to held container attached to camera
        this.heldBookContainer.add(bookInstance.mesh);
        bookInstance.mesh.position.set(0, 0, 0);
        // Face spine slightly angled so player sees title and cover
        bookInstance.mesh.rotation.set(0.2, 1.1, -0.15);
        bookInstance.mesh.scale.set(1.15, 1.15, 1.15); // Slightly larger for comfortable inspection

        bookInstance.state = 'HELD';
        bookInstance.highlightMesh.material.opacity = 0;
        this.heldBook = bookInstance;

        return true;
    }

    // Drop book back to floor in front of player
    dropHeldBook(playerPos, playerYaw) {
        if (!this.heldBook) return null;

        const dropped = this.heldBook;
        this.heldBookContainer.remove(dropped.mesh);
        this.scene.add(dropped.mesh);

        // Drop 1 meter in front of player on the floor
        const dropX = playerPos.x - Math.sin(playerYaw) * 1.0;
        const dropZ = playerPos.z - Math.cos(playerYaw) * 1.0;

        dropped.mesh.scale.set(1, 1, 1);
        dropped.mesh.position.set(dropX, 0.04, dropZ);
        dropped.mesh.rotation.set(0, playerYaw + Math.PI / 2, 0);
        dropped.state = 'ON_FLOOR';

        this.heldBook = null;
        return dropped;
    }

    // Place held book into shelf slot
    placeBookIntoSlot(bookInstance, slot) {
        if (this.heldBook !== bookInstance) return false;

        this.heldBookContainer.remove(bookInstance.mesh);
        this.scene.add(bookInstance.mesh);

        bookInstance.mesh.scale.set(1, 1, 1);
        // Position upright in shelf slot, spine facing forward (+Z)
        const targetWorldPos = slot.worldPosition.clone().add(new THREE.Vector3(0, 0.16, 0));
        bookInstance.mesh.position.copy(targetWorldPos);
        bookInstance.mesh.rotation.set(0, 0, 0); // Spine facing room (+Z)

        bookInstance.state = 'ON_SHELF';
        bookInstance.currentSlot = slot;
        slot.occupied = bookInstance;

        this.heldBook = null;
        return true;
    }

    // Highlight hovered book
    setHoveredBook(bookInstance, isHovered) {
        if (!bookInstance || !bookInstance.highlightMesh) return;
        bookInstance.highlightMesh.material.opacity = isHovered ? 0.8 : 0.0;
    }

    // Update bobbing animation for held book
    update(time, isWalking) {
        if (this.heldBook) {
            const bobFrequency = isWalking ? 9 : 2;
            const bobIntensity = isWalking ? 0.015 : 0.003;
            this.heldBookContainer.position.y = -0.32 + Math.sin(time * bobFrequency) * bobIntensity;
            this.heldBookContainer.position.x = 0.35 + Math.cos(time * (bobFrequency / 2)) * (bobIntensity * 0.5);
        }
    }
}
