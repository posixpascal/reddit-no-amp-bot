const request = require("request");
const cheerio = require("cheerio");

/**
 * Try to resolve the page's non-amp url
 * @param {cheerio.$} $ 
 */
const extractArticleUrl = ($) => {
    return new Promise((resolve, reject) => {
        // by og:metatag:
        const ogMetaTag = $("meta[property='og:url']");
        if (ogMetaTag.length) {
            return resolve(ogMetaTag.attr("content"));
        }

        // by canonical url:
        const canonicalLinkTag = $("link[rel='canonical']")
        if (canonicalLinkTag.length) {
            return resolve(canonicalLinkTag.attr("href"));
        }

        // by metadata
        const ldMetadata = $("script[type='application/ld+json']");
        ldMetadata.each((index, element) => {
            const contents = JSON.parse($(element).html());
            if (isAMPmetadata(contents)) {
                if (contents.url) {
                    return resolve(contents.url);
                }

                if (contents.mainEntityOfPage) {
                    return resolve(contents.mainEntityOfPage);
                }
            }
        });

        reject("No option to resolve amp");
        // TODO: save the URL to take a look at later
    });
}

/**
 * Try to resolve the real url behind an amplified link
 */
module.exports.removeAMP = (url) => {
    return new Promise((resolve, reject) => {
        request(url, (error, response, body) => {
            if (error) { return reject(error); }

            // Sometimes cheerio can't parse the DOM
            let $;
            try {
                $ = cheerio.load(body);
            } catch (err) {
                return reject("Could not parse dom");
            }

            const isAMPurl = typeof $("html").attr("amp") !== "undefined" || typeof $("html").attr("⚡") !== "undefined";

            if (isAMPurl) {
                extractArticleUrl($).then((url) => {
                    resolve(url);
                }, (err) => {
                    reject(err);
                });
            } else {
                reject("No amp url detected in " + url);
            }
        });
    });
}