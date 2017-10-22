const fs = require("fs");
const blacklist = fs.readFileSync("blacklist.txt", "utf8").toLowerCase().split("\n");

/**
 * Checks if a hostname is blacklisted
 */
module.exports.isBlacklisted = (hostname) => {
    hostname = hostname.toLowerCase()
    for (let i = 0; i < blacklist.length; i++) {
        const domain = blacklist[i].toLowerCase();
        if (domain === hostname) {
            return true;
        }
    }
    return false;
}

/**
 * Quick and dirty check to ensure the URl does not point to an image
 */
module.exports.hasImageExtension = (url) => {
    const ext = url.substring(url.length - 4).toLowerCase();
    return ext === ".png" || ext === "jpeg" || ext === ".jpg" || ext === "gif";
}

/**
 * Load markdown file and substitute a few variables
 */
module.exports.template = (file, opts) => {
    let src = fs.readFileSync(file, "utf8");
    for (let key in opts) {
        src = src.replace(`%${key}`, opts[key]);
    }

    return src;
}