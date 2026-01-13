import packageJSON from "../package.json";

import { allowedHighlighterTypes } from "./allowedHighlighterTypes";
import { getDbFolder, getKeyFolder, getProgFolder } from "./folders";
import { mimeIcons } from "./mimeIcons";
import { routes } from "./routes";
import { errorFX, lockFX, notifyFX, unlockFX } from "./sounds";

const currentVersion = packageJSON.version;

export {
    allowedHighlighterTypes,
    currentVersion,
    errorFX,
    getDbFolder,
    getKeyFolder,
    getProgFolder,
    lockFX,
    mimeIcons,
    notifyFX,
    routes,
    unlockFX,
};
