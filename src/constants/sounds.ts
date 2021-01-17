import { getAssetPath } from "../utils/getAssetPath";

export const unlockFX = new Audio(getAssetPath("sounds/unlock.ogg"));
unlockFX.load();

export const lockFX = new Audio(getAssetPath("sounds/lock.ogg"));
lockFX.load();

export const notifyFX = new Audio(getAssetPath("sounds/notification.ogg"));
notifyFX.load();

export const errorFX = new Audio(getAssetPath("sounds/error.ogg"));
errorFX.load();
