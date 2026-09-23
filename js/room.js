// room.js - Pembuatan Ruangan 3D Perpustakaan Klasik Hangat, Rak Buku, dan Pencahayaan

import { GENRES } from './data.js';

export class LibraryRoom {
    constructor(scene) {
        this.scene = scene;
        this.shelfSlots = []; // Array of slot descriptors for book placement
        this.shelfSlotMeshes = []; // Three.js meshes for raycasting
        this.shelfSigns = [];
        this.decorations = [];

        this.initTextures();
        this.buildArchitecture();
        this.buildLighting();
        this.buildBookshelves();
        this.buildAtmosphere();
    }

    initTextures() {
        // 1. Procedural Wood Floor Texture
        const floorCanvas = document.createElement('canvas');
        floorCanvas.width = 512;
        floorCanvas.height = 512;
        const fCtx = floorCanvas.getContext('2d');
        fCtx.fillStyle = '#4a2c1d'; // Rich mahogany base
        fCtx.fillRect(0, 0, 512, 512);

        // Wood planks pattern
        const plankHeight = 32;
        for (let y = 0; y < 512; y += plankHeight) {
            fCtx.strokeStyle = 'rgba(20, 10, 5, 0.6)';
            fCtx.lineWidth = 2;
            fCtx.beginPath();
            fCtx.moveTo(0, y);
            fCtx.lineTo(512, y);
            fCtx.stroke();

            // Planks vertical joints
            const offset = (y / plankHeight) % 2 === 0 ? 0 : 128;
            for (let x = offset; x < 512; x += 256) {
                fCtx.beginPath();
                fCtx.moveTo(x, y);
                fCtx.lineTo(x, y + plankHeight);
                fCtx.stroke();
            }

            // Subtle wood grain lines
            fCtx.fillStyle = 'rgba(255, 200, 150, 0.05)';
            for (let i = 0; i < 6; i++) {
                fCtx.fillRect(0, y + i * 5, 512, 1);
            }
        }
        this.woodFloorTexture = new THREE.CanvasTexture(floorCanvas);
        this.woodFloorTexture.wrapS = THREE.RepeatWrapping;
        this.woodFloorTexture.wrapT = THREE.RepeatWrapping;
        this.woodFloorTexture.repeat.set(4, 4);

        // 2. Procedural Carpet Texture (Persian Rug)
        const rugCanvas = document.createElement('canvas');
        rugCanvas.width = 512;
        rugCanvas.height = 512;
        const rCtx = rugCanvas.getContext('2d');
        rCtx.fillStyle = '#6b1818'; // Deep crimson
        rCtx.fillRect(0, 0, 512, 512);

        // Gold border
        rCtx.strokeStyle = '#d4af37';
        rCtx.lineWidth = 16;
        rCtx.strokeRect(16, 16, 480, 480);
        rCtx.lineWidth = 6;
        rCtx.strokeRect(36, 36, 440, 440);

        // Ornate center medallion
        rCtx.fillStyle = '#1e3d59';
        rCtx.beginPath();
        rCtx.ellipse(256, 256, 140, 90, 0, 0, Math.PI * 2);
        rCtx.fill();
        rCtx.strokeStyle = '#d4af37';
        rCtx.lineWidth = 8;
        rCtx.stroke();

        this.rugTexture = new THREE.CanvasTexture(rugCanvas);

        // 3. Procedural Wallpaper Texture
        const wallCanvas = document.createElement('canvas');
        wallCanvas.width = 256;
        wallCanvas.height = 256;
        const wCtx = wallCanvas.getContext('2d');
        wCtx.fillStyle = '#2c332e'; // Dark vintage olive/slate
        wCtx.fillRect(0, 0, 256, 256);

        // Victorian Damask subtle pattern
        wCtx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
        wCtx.lineWidth = 3;
        for (let x = 32; x < 256; x += 64) {
            for (let y = 32; y < 256; y += 64) {
                wCtx.beginPath();
                wCtx.arc(x, y, 16, 0, Math.PI * 2);
                wCtx.stroke();
            }
        }
        this.wallpaperTexture = new THREE.CanvasTexture(wallCanvas);
        this.wallpaperTexture.wrapS = THREE.RepeatWrapping;
        this.wallpaperTexture.wrapT = THREE.RepeatWrapping;
        this.wallpaperTexture.repeat.set(8, 3);
    }

    buildArchitecture() {
        const roomWidth = 14;
        const roomDepth = 14;
        const roomHeight = 4.2;

        // 1. Floor
        const floorGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const floorMat = new THREE.MeshStandardMaterial({
            map: this.woodFloorTexture,
            roughness: 0.4,
            metalness: 0.1
        });
        const floor = new THREE.Mesh(floorGeo, floorMat);
        floor.rotation.x = -Math.PI / 2;
        floor.receiveShadow = true;
        this.scene.add(floor);

        // 2. Large Central Persian Carpet (Floor scatter area)
        const rugGeo = new THREE.PlaneGeometry(7.5, 6.5);
        const rugMat = new THREE.MeshStandardMaterial({
            map: this.rugTexture,
            roughness: 0.9,
            metalness: 0.05
        });
        const rug = new THREE.Mesh(rugGeo, rugMat);
        rug.rotation.x = -Math.PI / 2;
        rug.position.set(0, 0.015, 0.8);
        rug.receiveShadow = true;
        this.scene.add(rug);

        // 3. Ceiling with wooden beams
        const ceilingGeo = new THREE.PlaneGeometry(roomWidth, roomDepth);
        const ceilingMat = new THREE.MeshStandardMaterial({
            color: '#2a1f18',
            roughness: 0.8
        });
        const ceiling = new THREE.Mesh(ceilingGeo, ceilingMat);
        ceiling.rotation.x = Math.PI / 2;
        ceiling.position.y = roomHeight;
        this.scene.add(ceiling);

        // Ceiling Wood Beams
        const beamMat = new THREE.MeshStandardMaterial({ color: '#1a1008', roughness: 0.7 });
        for (let x = -5; x <= 5; x += 2.5) {
            const beamGeo = new THREE.BoxGeometry(0.3, 0.25, roomDepth);
            const beam = new THREE.Mesh(beamGeo, beamMat);
            beam.position.set(x, roomHeight - 0.125, 0);
            this.scene.add(beam);
        }

        // 4. Walls Material
        const wallMat = new THREE.MeshStandardMaterial({
            map: this.wallpaperTexture,
            roughness: 0.7
        });

        // Wainscoting lower wood panel
        const panelMat = new THREE.MeshStandardMaterial({ color: '#2b170e', roughness: 0.5 });

        const createWall = (width, posX, posZ, rotY) => {
            const group = new THREE.Group();

            // Upper wallpaper wall
            const upperWallGeo = new THREE.PlaneGeometry(width, roomHeight - 1.2);
            const upperWall = new THREE.Mesh(upperWallGeo, wallMat);
            upperWall.position.y = (roomHeight + 1.2) / 2;
            upperWall.receiveShadow = true;
            group.add(upperWall);

            // Lower wood wainscoting
            const lowerWallGeo = new THREE.PlaneGeometry(width, 1.2);
            const lowerWall = new THREE.Mesh(lowerWallGeo, panelMat);
            lowerWall.position.y = 0.6;
            lowerWall.receiveShadow = true;
            group.add(lowerWall);

            // Wood molding divider
            const trimGeo = new THREE.BoxGeometry(width, 0.08, 0.05);
            const trim = new THREE.Mesh(trimGeo, panelMat);
            trim.position.set(0, 1.2, 0.02);
            group.add(trim);

            group.position.set(posX, 0, posZ);
            group.rotation.y = rotY;
            this.scene.add(group);
            return group;
        };

        // North Wall (Back of bookshelf)
        createWall(roomWidth, 0, -roomDepth / 2, 0);
        // South Wall (Behind player entrance)
        createWall(roomWidth, 0, roomDepth / 2, Math.PI);
        // West Wall (Left)
        createWall(roomDepth, -roomWidth / 2, 0, Math.PI / 2);
        // East Wall (Right)
        createWall(roomDepth, roomWidth / 2, 0, -Math.PI / 2);

        // 5. Large Stained Glass / Night Window on East Wall
        this.buildWindow();
    }

    buildWindow() {
        const windowGroup = new THREE.Group();
        windowGroup.position.set(6.85, 2.3, 0);
        windowGroup.rotation.y = -Math.PI / 2;

        // Window Frame
        const frameMat = new THREE.MeshStandardMaterial({ color: '#1b120c', roughness: 0.6 });
        const frameGeo = new THREE.BoxGeometry(3.2, 2.2, 0.15);
        const frame = new THREE.Mesh(frameGeo, frameMat);
        windowGroup.add(frame);

        // Night sky backdrop
        const glassGeo = new THREE.PlaneGeometry(2.9, 1.9);
        const glassMat = new THREE.MeshBasicMaterial({ color: '#0d1b2a' });
        const glass = new THREE.Mesh(glassGeo, glassMat);
        glass.position.z = 0.05;
        windowGroup.add(glass);

        // Glowing Moon
        const moonGeo = new THREE.CircleGeometry(0.3, 24);
        const moonMat = new THREE.MeshBasicMaterial({ color: '#fffae0' });
        const moon = new THREE.Mesh(moonGeo, moonMat);
        moon.position.set(0.6, 0.35, 0.06);
        windowGroup.add(moon);

        this.scene.add(windowGroup);
    }

    buildLighting() {
        // 1. Ambient Warm Light
        const ambientLight = new THREE.AmbientLight(0xffecd2, 0.45);
        this.scene.add(ambientLight);

        // 2. Grand Central Chandelier
        const chandelierGroup = new THREE.Group();
        chandelierGroup.position.set(0, 3.4, 0.5);

        const brassMat = new THREE.MeshStandardMaterial({ color: '#c59b27', metalness: 0.8, roughness: 0.2 });
        const chainGeo = new THREE.CylinderGeometry(0.02, 0.02, 0.8, 8);
        const chain = new THREE.Mesh(chainGeo, brassMat);
        chain.position.y = 0.4;
        chandelierGroup.add(chain);

        const ringGeo = new THREE.TorusGeometry(0.9, 0.04, 8, 24);
        const ring = new THREE.Mesh(ringGeo, brassMat);
        ring.rotation.x = Math.PI / 2;
        chandelierGroup.add(ring);

        // Chandelier Point Light (Warm main room glow)
        const mainLight = new THREE.PointLight(0xffd59e, 1.3, 14, 1.2);
        mainLight.position.set(0, -0.1, 0);
        mainLight.castShadow = true;
        mainLight.shadow.mapSize.width = 1024;
        mainLight.shadow.mapSize.height = 1024;
        mainLight.shadow.bias = -0.002;
        chandelierGroup.add(mainLight);

        this.scene.add(chandelierGroup);

        // 3. Bookshelf Spotlights (Highlights the shelves nicely)
        const shelfLight1 = new THREE.SpotLight(0xffeedd, 1.2, 9, Math.PI / 4, 0.4);
        shelfLight1.position.set(-3, 3.6, -3.5);
        shelfLight1.target.position.set(-3, 1.6, -5.5);
        this.scene.add(shelfLight1);
        this.scene.add(shelfLight1.target);

        const shelfLight2 = new THREE.SpotLight(0xffeedd, 1.2, 9, Math.PI / 4, 0.4);
        shelfLight2.position.set(3, 3.6, -3.5);
        shelfLight2.target.position.set(3, 1.6, -5.5);
        this.scene.add(shelfLight2);
        this.scene.add(shelfLight2.target);
    }

    buildBookshelves() {
        const shelfWoodMat = new THREE.MeshStandardMaterial({
            color: '#3d2314', // Polished dark walnut
            roughness: 0.4,
            metalness: 0.1
        });

        const brassMat = new THREE.MeshStandardMaterial({
            color: '#d4af37',
            metalness: 0.85,
            roughness: 0.25
        });

        // 5 Genre Cabinets arranged side by side along North Wall (Z = -5.4)
        const genresList = [GENRES.HOROR, GENRES.FANTASI, GENRES.MISTERI, GENRES.SAINS, GENRES.PETUALANGAN];
        const cabinetWidth = 2.2;
        const startX = -((genresList.length - 1) * (cabinetWidth + 0.15)) / 2;
        const cabinetDepth = 0.55;
        const cabinetHeight = 3.2;
        const numShelves = 3; // 3 tiers per genre cabinet

        genresList.forEach((genre, gIdx) => {
            const cabinetX = startX + gIdx * (cabinetWidth + 0.15);
            const cabinetZ = -5.4;

            const cabinetGroup = new THREE.Group();
            cabinetGroup.position.set(cabinetX, 0, cabinetZ);

            // Left & Right Vertical Panels
            const sideGeo = new THREE.BoxGeometry(0.06, cabinetHeight, cabinetDepth);
            const leftSide = new THREE.Mesh(sideGeo, shelfWoodMat);
            leftSide.position.set(-cabinetWidth / 2, cabinetHeight / 2, 0);
            cabinetGroup.add(leftSide);

            const rightSide = new THREE.Mesh(sideGeo, shelfWoodMat);
            rightSide.position.set(cabinetWidth / 2, cabinetHeight / 2, 0);
            cabinetGroup.add(rightSide);

            // Back Panel
            const backGeo = new THREE.BoxGeometry(cabinetWidth, cabinetHeight, 0.04);
            const backPanel = new THREE.Mesh(backGeo, shelfWoodMat);
            backPanel.position.set(0, cabinetHeight / 2, -cabinetDepth / 2 + 0.02);
            cabinetGroup.add(backPanel);

            // Top Decorative Arch / Crown
            const crownGeo = new THREE.BoxGeometry(cabinetWidth + 0.1, 0.18, cabinetDepth + 0.08);
            const crown = new THREE.Mesh(crownGeo, shelfWoodMat);
            crown.position.set(0, cabinetHeight + 0.09, 0);
            cabinetGroup.add(crown);

            // 3D Genre Signboard Plaque
            const plaque = this.createGenrePlaque(genre);
            plaque.position.set(0, cabinetHeight - 0.2, cabinetDepth / 2 + 0.02);
            cabinetGroup.add(plaque);
            this.shelfSigns.push(plaque);

            // 3 Shelf Planks (Tiers)
            const shelfPlankGeo = new THREE.BoxGeometry(cabinetWidth, 0.05, cabinetDepth - 0.04);
            const shelfYPositions = [0.8, 1.6, 2.4]; // 3 shelf heights

            shelfYPositions.forEach((sY, tierIdx) => {
                const plank = new THREE.Mesh(shelfPlankGeo, shelfWoodMat);
                plank.position.set(0, sY, 0);
                cabinetGroup.add(plank);

                // Slot generation for this shelf tier
                // Each tier can hold up to 4 books / series slots
                const slotsPerTier = 4;
                const slotSpacing = (cabinetWidth - 0.3) / slotsPerTier;
                const slotStartX = -((slotsPerTier - 1) * slotSpacing) / 2;

                for (let s = 0; s < slotsPerTier; s++) {
                    const localSlotX = slotStartX + s * slotSpacing;
                    const worldSlotX = cabinetX + localSlotX;
                    const worldSlotY = sY + 0.025; // Top of the plank
                    const worldSlotZ = cabinetZ + 0.05;

                    // Slot interactive hit-mesh
                    const slotGeo = new THREE.BoxGeometry(0.24, 0.5, 0.35);
                    const slotMat = new THREE.MeshBasicMaterial({
                        color: new THREE.Color(genre.color),
                        transparent: true,
                        opacity: 0.0,
                        wireframe: false
                    });
                    const slotMesh = new THREE.Mesh(slotGeo, slotMat);
                    slotMesh.position.set(localSlotX, sY + 0.26, 0.05);

                    // Outline / Marker indicator for hovering
                    const markerGeo = new THREE.PlaneGeometry(0.22, 0.02);
                    const markerMat = new THREE.MeshBasicMaterial({
                        color: '#d4af37',
                        transparent: true,
                        opacity: 0.4
                    });
                    const marker = new THREE.Mesh(markerGeo, markerMat);
                    marker.rotation.x = -Math.PI / 2;
                    marker.position.set(0, -0.24, 0.12);
                    slotMesh.add(marker);

                    slotMesh.userData = {
                        interactiveType: 'slot',
                        genreId: genre.id,
                        shelfIndex: gIdx,
                        tierIndex: tierIdx,
                        slotIndex: s,
                        worldPosition: new THREE.Vector3(worldSlotX, worldSlotY, worldSlotZ),
                        occupied: null // Will reference book instance if filled
                    };

                    cabinetGroup.add(slotMesh);
                    this.shelfSlotMeshes.push(slotMesh);
                    this.shelfSlots.push(slotMesh.userData);
                }
            });

            this.scene.add(cabinetGroup);
        });
    }

    createGenrePlaque(genre) {
        const group = new THREE.Group();

        // Brass plate border
        const plateGeo = new THREE.BoxGeometry(1.5, 0.32, 0.03);
        const plateMat = new THREE.MeshStandardMaterial({
            color: '#c59b27',
            metalness: 0.85,
            roughness: 0.3
        });
        const plate = new THREE.Mesh(plateGeo, plateMat);
        group.add(plate);

        // Sign text canvas texture
        const signCanvas = document.createElement('canvas');
        signCanvas.width = 512;
        signCanvas.height = 128;
        const sCtx = signCanvas.getContext('2d');

        // Dark background with genre accent border
        sCtx.fillStyle = '#140c06';
        sCtx.fillRect(0, 0, 512, 128);

        sCtx.strokeStyle = genre.accentColor || '#d4af37';
        sCtx.lineWidth = 8;
        sCtx.strokeRect(6, 6, 500, 116);

        // Icon & Text
        sCtx.fillStyle = '#fffae0';
        sCtx.font = 'bold 36px "Segoe UI", Arial, sans-serif';
        sCtx.textAlign = 'center';
        sCtx.textBaseline = 'middle';
        sCtx.fillText(`${genre.icon} ${genre.shortName.toUpperCase()}`, 256, 64);

        const signTexture = new THREE.CanvasTexture(signCanvas);
        const signFaceGeo = new THREE.PlaneGeometry(1.42, 0.28);
        const signFaceMat = new THREE.MeshBasicMaterial({
            map: signTexture,
            transparent: false
        });
        const signFace = new THREE.Mesh(signFaceGeo, signFaceMat);
        signFace.position.z = 0.02;
        group.add(signFace);

        return group;
    }

    buildAtmosphere() {
        // Floating Dust Motes / Magical Library Sparkles
        const particleCount = 70;
        const particleGeo = new THREE.BufferGeometry();
        const positions = new Float32Array(particleCount * 3);

        for (let i = 0; i < particleCount * 3; i += 3) {
            positions[i] = (Math.random() - 0.5) * 12;     // X
            positions[i + 1] = 0.3 + Math.random() * 3.5;  // Y
            positions[i + 2] = (Math.random() - 0.5) * 10; // Z
        }

        particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const particleMat = new THREE.PointsMaterial({
            color: 0xffe6a3,
            size: 0.04,
            transparent: true,
            opacity: 0.65,
            blending: THREE.AdditiveBlending
        });

        this.particles = new THREE.Points(particleGeo, particleMat);
        this.scene.add(this.particles);
    }

    updateAtmosphere(delta) {
        if (!this.particles) return;
        const positions = this.particles.geometry.attributes.position.array;
        for (let i = 1; i < positions.length; i += 3) {
            positions[i] += delta * 0.06; // Drift up slowly
            if (positions[i] > 3.9) {
                positions[i] = 0.4;
            }
        }
        this.particles.geometry.attributes.position.needsUpdate = true;
    }
}
