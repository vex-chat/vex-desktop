import { getAssetPath } from "../utils/getAssetPath";

export const unlockFX = new Audio(getAssetPath("sounds/switch_006.ogg"));
unlockFX.load();

export const lockFX = new Audio(getAssetPath("sounds/switch_007.wav"));
lockFX.load();

export const notifyFX = new Audio(getAssetPath("sounds/confirmation_001.ogg"));
notifyFX.load();

export const errorFX = new Audio(getAssetPath("sounds/error_005.ogg"));
errorFX.load();
