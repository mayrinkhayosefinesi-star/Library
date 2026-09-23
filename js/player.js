// player.js - First-Person Controller dengan Smoothing Anti-Pusing & Kolisi

import { sound } from './audio.js';

export class PlayerController {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        // Player Physical State
        this.position = this.camera.position;
        this.position.set(0, 1.65, 3.5); // Eye height 1.65m

        this.velocity = new THREE.Vector3();
        this.moveSpeed = 4.2; // Walk speed m/s
        this.damping = 10.0; // Friction

        // Camera Look State with Damping (Anti-Pusing / Anti-Motion Sickness)
        this.yaw = 0;
        this.pitch = 0;
        this.targetYaw = 0;
        this.targetPitch = 0;
        
        // Sensitivitas default yang lembut (diatur agar tidak tajam/pusing)
        this.sensitivity = 0.0018; 
        this.smoothing = 0.22; // Lerp smoothing factor for soft camera glide

        this.isLocked = false;
        this.isDragging = false;
        this.previousMousePosition = { x: 0, y: 0 };

        // Key states
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false
        };

        // Collision boundaries (Ruangan perpustakaan)
        this.bounds = {
            minX: -6.5,
            maxX: 6.5,
            minZ: -6.2,
            maxZ: 6.5
        };

        // Obstacles (Rak Buku)
        this.obstacles = [
            // Rak buku utama di dinding utara (Z: -6.0)
            { minX: -6.0, maxX: 6.0, minZ: -6.5, maxZ: -4.8 }
        ];

        // Raycasting for interaction
        this.raycaster = new THREE.Raycaster();
        this.raycaster.far = 4.0; // Maksimal jarak interaksi 4 meter
        this.hoveredObject = null;
        this.hoveredType = null; // 'book' or 'slot'

        this.initControls();
    }

    setSensitivity(value) {
        // value from UI slider 0.1 - 1.0
        // mapping to 0.0006 - 0.0035
        this.sensitivity = 0.0006 + (value * 0.003);
    }

    initControls() {
        // Keyboard listeners
        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));

        // Pointer Lock events
        this.domElement.addEventListener('click', () => {
            if (!this.isLocked && document.pointerLockElement !== this.domElement) {
                // Request pointer lock only when clicking canvas and no modal is active
                const activeModal = document.querySelector('.modal-overlay.active');
                if (!activeModal) {
                    this.domElement.requestPointerLock();
                }
            }
        });

        document.addEventListener('pointerlockchange', () => {
            this.isLocked = document.pointerLockElement === this.domElement;
            const crosshair = document.getElementById('crosshair');
            if (crosshair) {
                crosshair.style.opacity = this.isLocked ? '1' : '0.5';
            }
        });

        // Mouse Move Listener
        document.addEventListener('mousemove', (e) => this.onMouseMove(e));

        // Touch / Fallback Drag Support (for seamless non-locked interaction)
        this.domElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) {
                this.isDragging = true;
                this.previousMousePosition = { x: e.clientX, y: e.clientY };
            }
        });

        window.addEventListener('mouseup', () => {
            this.isDragging = false;
        });
    }

    onKeyDown(event) {
        // Ignore inputs when typing in an input field
        if (event.target.tagName === 'INPUT' || event.target.tagName === 'TEXTAREA') return;

        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = true;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = true;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = true;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = true;
                break;
        }
    }

    onKeyUp(event) {
        switch (event.code) {
            case 'KeyW':
            case 'ArrowUp':
                this.keys.forward = false;
                break;
            case 'KeyS':
            case 'ArrowDown':
                this.keys.backward = false;
                break;
            case 'KeyA':
            case 'ArrowLeft':
                this.keys.left = false;
                break;
            case 'KeyD':
            case 'ArrowRight':
                this.keys.right = false;
                break;
        }
    }

    onMouseMove(event) {
        let movementX = 0;
        let movementY = 0;

        if (this.isLocked) {
            movementX = event.movementX || 0;
            movementY = event.movementY || 0;
        } else if (this.isDragging) {
            movementX = event.clientX - this.previousMousePosition.x;
            movementY = event.clientY - this.previousMousePosition.y;
            this.previousMousePosition = { x: event.clientX, y: event.clientY };
        } else {
            return;
        }

        // Apply smooth sensitivity
        this.targetYaw -= movementX * this.sensitivity;
        this.targetPitch -= movementY * this.sensitivity;

        // Soft vertical clamp (Mencegah kamera jungkir balik / pusing)
        const maxPitch = Math.PI * 0.38; // ~68 derajat
        const minPitch = -Math.PI * 0.38;
        this.targetPitch = Math.max(minPitch, Math.min(maxPitch, this.targetPitch));
    }

    update(delta, interactables = []) {
        if (!delta || delta > 0.1) delta = 0.1; // Cap delta against frame hitch

        // 1. Camera Smoothing Interpolation (Anti-Jerkiness)
        this.yaw += (this.targetYaw - this.yaw) * this.smoothing;
        this.pitch += (this.targetPitch - this.pitch) * this.smoothing;

        // Apply Euler rotation with fixed order
        const euler = new THREE.Euler(0, 0, 0, 'YXZ');
        euler.x = this.pitch;
        euler.y = this.yaw;
        this.camera.quaternion.setFromEuler(euler);

        // 2. Movement direction in horizontal plane
        const moveVector = new THREE.Vector3();
        if (this.keys.forward) moveVector.z -= 1;
        if (this.keys.backward) moveVector.z += 1;
        if (this.keys.left) moveVector.x -= 1;
        if (this.keys.right) moveVector.x += 1;

        if (moveVector.lengthSq() > 0) {
            moveVector.normalize();

            // Transform movement relative to camera yaw
            const cameraYawQuat = new THREE.Quaternion().setFromAxisAngle(new THREE.Vector3(0, 1, 0), this.yaw);
            moveVector.applyQuaternion(cameraYawQuat);
            moveVector.y = 0;
            moveVector.normalize();

            // Accelerate
            this.velocity.x += moveVector.x * this.moveSpeed * delta * 12;
            this.velocity.z += moveVector.z * this.moveSpeed * delta * 12;

            // Play footsteps softly
            sound.playFootstep();
        }

        // Apply friction / damping
        this.velocity.x -= this.velocity.x * this.damping * delta;
        this.velocity.z -= this.velocity.z * this.damping * delta;

        // Potential next position
        const nextX = this.position.x + this.velocity.x * delta;
        const nextZ = this.position.z + this.velocity.z * delta;

        // 3. Collision Resolution
        const resolved = this.checkCollision(nextX, nextZ);
        this.position.x = resolved.x;
        this.position.z = resolved.z;
        this.position.y = 1.65; // Eye height constant

        // 4. Raycasting for Interaction (Targeting Books and Shelf Slots)
        this.updateRaycast(interactables);
    }

    checkCollision(targetX, targetZ) {
        const radius = 0.45; // Player bounding radius
        let resX = Math.max(this.bounds.minX + radius, Math.min(this.bounds.maxX - radius, targetX));
        let resZ = Math.max(this.bounds.minZ + radius, Math.min(this.bounds.maxZ - radius, targetZ));

        // Check against obstacle boxes (e.g., Bookshelves)
        for (const obs of this.obstacles) {
            if (
                resX > obs.minX - radius &&
                resX < obs.maxX + radius &&
                resZ > obs.minZ - radius &&
                resZ < obs.maxZ + radius
            ) {
                // Find nearest edge to push out
                const distLeft = Math.abs(resX - (obs.minX - radius));
                const distRight = Math.abs(resX - (obs.maxX + radius));
                const distFront = Math.abs(resZ - (obs.maxZ + radius));
                const distBack = Math.abs(resZ - (obs.minZ - radius));

                const minDist = Math.min(distLeft, distRight, distFront, distBack);
                if (minDist === distFront) resZ = obs.maxZ + radius;
                else if (minDist === distLeft) resX = obs.minX - radius;
                else if (minDist === distRight) resX = obs.maxX + radius;
                else if (minDist === distBack) resZ = obs.minZ - radius;
            }
        }

        return { x: resX, z: resZ };
    }

    updateRaycast(interactables) {
        // Cast from center of screen (0, 0 in NDC)
        this.raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
        const intersects = this.raycaster.intersectObjects(interactables, true);

        if (intersects.length > 0) {
            let hitObj = intersects[0].object;
            // Traverse up to find userData
            while (hitObj && !hitObj.userData.interactiveType && hitObj.parent) {
                hitObj = hitObj.parent;
            }

            if (hitObj && hitObj.userData && hitObj.userData.interactiveType) {
                this.hoveredObject = hitObj;
                this.hoveredType = hitObj.userData.interactiveType;
                return;
            }
        }

        this.hoveredObject = null;
        this.hoveredType = null;
    }
}
