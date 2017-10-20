require('dotenv').config()

const VERSION = require("./package.json").version;
const { template, isAMPlified, deAMPlify } = require("./utils.js");
const RedditStream = require("reddit-stream");
const snoowrap = require("snoowrap");

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
    posts.forEach((post) => {
        deAMPlify(post.data.url).then((realUrl) => {
            // post as comment here.
            const comment = template("./comment_template.md", {
                url: realUrl
            });
            console.log(post.data.url);
            console.log(comment);
            //reddit.getSubmission(post.data.id).reply(comment);
        }, () => {
            // console.log("Submission is not a real amp url");
        });
    });
});