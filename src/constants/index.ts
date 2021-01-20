import packageJSON from "../package.json";

import { allowedHighlighterTypes } from "./allowedHighlighterTypes";
import { dbFolder, keyFolder, progFolder } from "./folders";
import { mimeIcons } from "./mimeIcons";
import { routes } from "./routes";
import { errorFX, lockFX, notifyFX, unlockFX } from "./sounds";

const currentVersion = packageJSON.version;

export {
    allowedHighlighterTypes,
    currentVersion,
    dbFolder,
    errorFX,
    keyFolder,
    lockFX,
    mimeIcons,
    notifyFX,
    progFolder,
    routes,
    unlockFX,
};
