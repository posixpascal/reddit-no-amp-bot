const request = require("request");
const cheerio = require("cheerio");
const fs = require("fs");

const isAMPmetadata = (metadata) => {
    return typeof metadata["@type"] !== "undefined" && metadata["@type"] === "NewsArticle";
}

const extractUrl = ($) => {
    return new Promise((resolve, reject) => {
        // by metadata
        const ldMetadata = $("script[type='application/ld+json']");
        ldMetadata.each((index, element) => {
            try {
                const contents = JSON.parse($(element).html());
                if (isAMPmetadata(contents) && contents.url) {
                    return resolve(contents.url);
                }
            } catch (e) {
                return reject("Could not parse metadata");
            }
        });

        // by og:metatag:
        const ogMetaTag = $("meta[property='og:url']");
        if (ogMetatag) {
            return resolve(ogMetatag.attr("content"));
        }

        // by canonical url:
        const canonicalLinkTag = $("link[rel='canonical']")
        if (canonicalLinkTag) {
            return resolve(canonicalLinkTag.attr("href"));
        }

        reject("No option to resolve amp");
    });
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

            if (typeof $("html").attr("amp") !== "undefined" || typeof $("html").attr("⚡") !== "undefined") {
                extractUrl(body).then((url) => {
                    resolve(url);
                    isAMP = true;
                }, (err) => {
                    reject(err);
                    console.log("Take a look at this: ", url);
                });
            }

            if (!isAMP) {
                reject("No amp url");
            }
        });
    });
}