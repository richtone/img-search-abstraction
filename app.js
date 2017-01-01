"use strict";
var express = require("express");
var gis = require('node-google-image-search');
var dotenv = require("dotenv");
/*
var result = {  "url" :       undefined,
                "snippet" :   42,
                "thumbnail" : null
             };
*/
var port = process.env.PORT || 8080;
var imgur = "https://api.imgur.com/3"
var authHeader = "Authorization: Client-ID 520786dbc77a534";

express()
.get("/api/imagesearch/:search_string", (req, res) => {
    let ss = req.params.search_string;
    
    gis(ss, data => {
        
        let result = data.map((item,index) => {
            return {
                        "url" : item.link,
                        "snippet" : item.snippet,
                        "thumbnail" : item.image.thumbnailLink,
                        "context" : item.image.contextLink
                    };
        });
        
        res.end(JSON.stringify(result));
    },0,10);
    
    
})
.listen(port, () => {
  console.log('ISA app listening on port ',port,'!');
});