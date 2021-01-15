import { getAssetPath } from "./getAssetPath";

export function strToIcon(s: string): string {
    const str = s
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "")
        .replace(/\s/g, "");

    return getAssetPath(
        `/defaultAvatars/${str.substring(0, 2).toLowerCase()}.png`
    );
}
