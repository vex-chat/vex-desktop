import os from "os";

const homedir = os.homedir();
export const progFolder = `${homedir}/.vex-desktop`;
export const dbFolder = `${progFolder}/databases`;
export const keyFolder = `${progFolder}/keys`;
