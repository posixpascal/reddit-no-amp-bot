require('dotenv').config()

const VERSION = require("./package.json").version;
const { isBlacklisted, hasImageExtension, template } = require("./utils.js");
const { removeAMP } = require("./amp.js");

const RedditStream = require("reddit-stream");
const snoowrap = require("snoowrap");
const urlParser = require("url").parse;


const streamConf = {
    userAgent: `snoowrap/${VERSION}`,
    app: {
        id: process.env.REDDIT_CLIENT_ID,
        secret: process.env.REDDIT_CLIENT_SECRET
    },
    username: process.env.REDDIT_USERNAME,
    password: process.env.REDDIT_PASSWORD
};

const clientConf = {
    userAgent: streamConf.userAgent,
    username: streamConf.username,
    password: streamConf.password,
    client_id: streamConf.app.id,
    client_secret: streamConf.app.secret
};

const reddit = new snoowrap(clientConf);
const postStream = new RedditStream('posts', 'all', streamConf.userAgent);

postStream.login(streamConf).then(() => {
    console.log("Logged in");
    postStream.start();
}, () => {
    console.error("Failed ot login");
});


postStream.on('new', (posts) => {
    posts
        .filter(post => !post.data.over_18)
        .filter(post => !hasImageExtension(post.data.url))
        .filter(post => !isBlacklisted(urlParser(post.data.url).hostname))
        .forEach((post) => {
            removeAMP(post.data.url).then((url) => {
                const comment = template("./comment_template.md", {
                    url
                });
                console.log(comment);
                reddit.getSubmission(post.data.id).reply(comment);
            }).catch((e) => {
                // no amp url detected,
                // maybe we can use this for kind of like
                // statistics? 98% of urls are not using AMP on reddit? idk.
            });
        });
});