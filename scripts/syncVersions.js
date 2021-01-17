/* eslint-disable eslint-comments/disable-enable-pair */
/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-var-requires */

const fs = require("fs");
const semver = require("semver");

const OUTER_FILE = "package.json";
const INNER_FILE = "./src/package.json";
const ENCODING = "utf8";

const outerPackage = JSON.parse(fs.readFileSync(OUTER_FILE, ENCODING));
const innerPackage = JSON.parse(fs.readFileSync(INNER_FILE, ENCODING));

if (semver.eq(outerPackage.version, innerPackage.version)) {
    console.log("Versions already in sync.");
    process.exit(0);
} else {
    if (semver.gt(outerPackage.version, innerPackage.version)) {
        console.log("Outer version greater than inner version, synchronizing.");
        innerPackage.version = outerPackage.version;
        fs.writeFileSync(INNER_FILE, JSON.stringify(innerPackage, null, 4));
    } else {
        console.log("Inner version greater than outer version, synchronizing.");
        outerPackage.version = innerPackage.version;
        fs.writeFileSync(OUTER_FILE, JSON.stringify(outerPackage, null, 4));
    }
}
