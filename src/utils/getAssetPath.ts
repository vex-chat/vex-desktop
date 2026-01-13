// Asset path is initialized once at startup
let RESOURCES_PATH: string | null = null;

/**
 * Initialize the asset path. Must be called before getAssetPath.
 */
export const initAssetPath = async (): Promise<void> => {
    if (RESOURCES_PATH !== null) {
        return;
    }

    const isPackaged = await window.electron.app.isPackaged();
    if (isPackaged) {
        // In production, assets are in the resources folder
        // process.resourcesPath is available in packaged apps
        RESOURCES_PATH = await window.electron.path.join(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (process as any).resourcesPath || "",
            "assets"
        );
    } else {
        // In development, assets are relative to the compiled code
        RESOURCES_PATH = await window.electron.path.join(__dirname, "../assets");
    }
};

export const getAssetPath = (...paths: string[]): string => {
    if (RESOURCES_PATH === null) {
        // Fallback for synchronous calls before init - use dev path
        console.warn("getAssetPath called before initAssetPath");
        return [...paths].join("/");
    }
    // Synchronous path join for compatibility - paths is just string concat
    return [RESOURCES_PATH, ...paths].join("/");
};
