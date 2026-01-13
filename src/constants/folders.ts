// Async getters for folder paths using contextBridge API
export const getHomeDir = async (): Promise<string> => {
    return await window.electron.app.getPath("home");
};

export const getProgFolder = async (): Promise<string> => {
    const home = await getHomeDir();
    return `${home}/.vex-desktop`;
};

export const getDbFolder = async (): Promise<string> => {
    const prog = await getProgFolder();
    return `${prog}/databases`;
};

export const getKeyFolder = async (): Promise<string> => {
    const prog = await getProgFolder();
    return `${prog}/keys`;
};
