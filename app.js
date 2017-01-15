"use strict";

var express = require("express");
var gis = require('node-google-image-search');
var mongodb = require("mongodb").MongoClient;

var port = process.env.PORT || 8080;
var appDB = undefined;
var searchTerms = undefined;
var dbURL = process.env.MONGOLAB_URI;

mongodb.connect(dbURL, (err, db) => {
    
    if (err) {
    console.log("Unable to connect to the mongoDB. Error:", err);
    } else {
    console.log("Connection established to mongoDB");
    }
    appDB = db;
    searchTerms = db.collection("searchTerms");
});


express()
.get("/", (req,res) => {
    res.end("Welcome. API runs on /api/imagesearch/[search term].\nFind latest search terms on /api/latest/imagesearch/.");
})
.get("/api/imagesearch/:search_string", (req, res) => {
    let ss = req.params.search_string;
    let offset = 10*req.query.offset || 10; // zistíme parameter "offset" z req.query objektu (zoznam parametrov)
    let response = { "term" : ss, "when" : (new Date).toISOString() };
    
    searchTerms
    .insert(response,
    (err, data) => {
        if (err) throw err;
        console.log(response," zapísané do DB");
    });
    
    gis(ss, data => {

        let results = data.map((item,index) => {
            return {
                        "url" : item.link,
                        "snippet" : item.snippet,
                        "thumbnail" : item.image.thumbnailLink,
                        "context" : item.image.contextLink
                    };
        });
        res.end(JSON.stringify(results));
        
    },offset-10,offset);
    
})
.get("/api/latest/imagesearch",(req, res) => {
    
    searchTerms
    .find({}, { "_id": 0, "term" : 1, "when" : 1})
    .sort({ $natural:-1 })
    .limit(10)
    .toArray((err,data) => {
        if (err) {
            res.end();
            throw err;
        } else {
            res.end(JSON.stringify(data));
        }
    });
})
.listen(port, () => {
  console.log('ISA app listening on port ',port,'!');
});