const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const isAMPmetadata = (metadata) => {
    return typeof metadata["@type"] !== "undefined" && metadata["@type"] === "NewsArticle";
}

module.exports.isAMPlified = (post) => {
    return post.data.url.indexOf("/amp/") !== -1;
}

module.exports.template = (file, opts) => {
    let src = fs.readFileSync(file, "utf8");
    for (let key in opts) {
        src = src.replace(`%${key}`, opts[key]);
    }

    return src;
}

module.exports.deAMPlify = (url, cb) => {
    let isAMP = false;
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            const $ = cheerio.load(body);
            const ldMetadata = $("script[type='application/ld+json']");
            ldMetadata.each((index, element) => {
                const contents = JSON.parse($(element).html());
                if (isAMPmetadata(contents)) {
                    resolve(contents.url);
                    isAMP = true;
                }
            });

            if (!isAMP) {
                reject("No amp url");
            }
        });
    });
}