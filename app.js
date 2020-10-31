const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
var unirest = require("unirest");

const app = express();
app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public")); // this is to use the static local files that we have like css
const port  = 663;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); //send html file
})

app.post("/", function(req, res){
  var request = unirest("GET", "https://shazam.p.rapidapi.com/search");
  const songName = req.body.songName;
  request.query({
  	"locale": "en-US",
  	"offset": "0",
  	"limit": "5",
  	"term": songName
  });

  request.headers({
  	"x-rapidapi-host": "shazam.p.rapidapi.com",
  	"x-rapidapi-key": /*api key*/,
  	"useQueryString": true
  });


  request.end(function (response) {
  	if (response.error) throw new Error(response.error);

    if(response.statusCode === 200)
    {
       console.log("success");
       console.log(JSON.stringify(response.body));
       const musicInfo = response.body;
       // console.log(musicInfo);
       res.write("<h1>Song: "+ musicInfo.tracks.hits[0].track.title + "</h1>");
       res.write("<h2>By: " + musicInfo.tracks.hits[0].track.subtitle + "</h2>")
       res.write("<img src =" + musicInfo.tracks.hits[0].track.share.image + ">")
       res.write("<br><br><a href=\""+ musicInfo.tracks.hits[0].track.hub.actions[1].uri +"\"> Click here to listen!</a>");
    }

  	//console.log(res.body);

  });

});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
  });
