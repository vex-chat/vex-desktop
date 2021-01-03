const path = require("path");
const rimraf = require("rimraf");

module.exports = function deleteSourceMaps() {
    rimraf.sync(path.join(__dirname, "../../src/dist/*.js.map"));
    rimraf.sync(path.join(__dirname, "../../src/*.js.map"));
};
