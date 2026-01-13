import { getAssetPath } from "../utils/getAssetPath";

// Lazy-loaded audio elements - created on first access after initAssetPath
let _unlockFX: HTMLAudioElement | null = null;
let _lockFX: HTMLAudioElement | null = null;
let _notifyFX: HTMLAudioElement | null = null;
let _errorFX: HTMLAudioElement | null = null;

export const unlockFX = {
    get element(): HTMLAudioElement {
        if (!_unlockFX) {
            _unlockFX = new Audio(getAssetPath("sounds/unlock.ogg"));
            _unlockFX.load();
        }
        return _unlockFX;
    },
    play(): Promise<void> {
        return this.element.play();
    },
    pause(): void {
        this.element.pause();
    },
    get duration(): number {
        return this.element.duration;
    },
    get paused(): boolean {
        return this.element.paused;
    },
    get currentTime(): number {
        return this.element.currentTime;
    },
    set currentTime(value: number) {
        this.element.currentTime = value;
    },
};

export const lockFX = {
    get element(): HTMLAudioElement {
        if (!_lockFX) {
            _lockFX = new Audio(getAssetPath("sounds/lock.ogg"));
            _lockFX.load();
        }
        return _lockFX;
    },
    play(): Promise<void> {
        return this.element.play();
    },
    pause(): void {
        this.element.pause();
    },
    get duration(): number {
        return this.element.duration;
    },
    get paused(): boolean {
        return this.element.paused;
    },
    get currentTime(): number {
        return this.element.currentTime;
    },
    set currentTime(value: number) {
        this.element.currentTime = value;
    },
};

export const notifyFX = {
    get element(): HTMLAudioElement {
        if (!_notifyFX) {
            _notifyFX = new Audio(getAssetPath("sounds/notification.ogg"));
            _notifyFX.load();
        }
        return _notifyFX;
    },
    play(): Promise<void> {
        return this.element.play();
    },
    pause(): void {
        this.element.pause();
    },
    get duration(): number {
        return this.element.duration;
    },
    get paused(): boolean {
        return this.element.paused;
    },
    get currentTime(): number {
        return this.element.currentTime;
    },
    set currentTime(value: number) {
        this.element.currentTime = value;
    },
};

export const errorFX = {
    get element(): HTMLAudioElement {
        if (!_errorFX) {
            _errorFX = new Audio(getAssetPath("sounds/error.ogg"));
            _errorFX.load();
        }
        return _errorFX;
    },
    play(): Promise<void> {
        return this.element.play();
    },
    pause(): void {
        this.element.pause();
    },
    get duration(): number {
        return this.element.duration;
    },
    get paused(): boolean {
        return this.element.paused;
    },
    get currentTime(): number {
        return this.element.currentTime;
    },
    set currentTime(value: number) {
        this.element.currentTime = value;
    },
};
