const express = require("express");
const bodyParser = require("body-parser");
const request = require("request");
const https = require("https");
var unirest = require("unirest");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended : true}));
app.use(express.static("public")); // this is to use the static local files that we have like css
const port  = 663;

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html"); //send html file
})

app.get("/info", function(req, res)
{
  info = req.query.information.split(',');
  res.render('info',{info: info});
});

app.get("/error", function(req, res)
{
  song = req.query.song;
  res.render('error', {song: song});
});

app.get("/songs", function(req,res)
{
  var musicTitle = [];
  var musicSinger = [];
  var musicImage = [];
  var musicUri = [];

  const musicTitleArray = req.query.musicTitle.split(',,');
  const musicSingerArray = req.query.musicSinger.split(',,');
  const musicImageArray = req.query.musicImage.split(',,');
  const musicUriArray = req.query.musicUri.split(',,');

  for(var i = 0; i < musicTitleArray.length; i++)
  {
    musicTitle.push(musicTitleArray[i]);
    musicSinger.push(musicSingerArray[i]);
    musicImage.push(musicImageArray[i]);
    musicUri.push(musicUriArray[i]);
  }
  res.render('songs',{musicTitle: musicTitle, musicSinger: musicSinger, musicImage: musicImage, musicUri: musicUri});
});

app.post("/close", function(req, res)
{
    res.redirect("/");
});

app.post("/learn-more", function(req, res)
{
    console.log(req.body);
    const info = req.body.musicTitle + ',' + req.body.musicSinger + ',' + req.body.musicImage + ',' + req.body.musicUri;
    res.redirect("/info?information=" + info);
});

app.post("/", function(req, res){
  var request = unirest("GET", "https://shazam.p.rapidapi.com/search");
  const songName = req.body.songName;
  /*const location = req.body.country;
  console.log(location);
  if(location == "japan")
  {
    res.write("<h1>Sorry!</h1>")
    res.write("<img class=\"mb-4\" src=\"images/under_construction.png\" alt=\"Page under construction\" width=\"1366\" height=\"859\">")
    return;
  }

  else
    locale = "en-" + location;*/
  request.query({
  	"locale": 'en-US',
  	"offset": "0",
  	"limit": "5",
  	"term": songName
  });

  request.headers({
  	"x-rapidapi-host": "shazam.p.rapidapi.com",
  	"x-rapidapi-key": /*insert api key*/,
  	"useQueryString": true
  });


  request.end(function (response) {
  	if (response.error) throw new Error(response.error);

    if(response.statusCode === 200)
    {
       //console.log("success");
       //console.log(JSON.stringify(response.body));
       const musicInfo = response.body;
       if(Object.keys(musicInfo).length === 0)
       {
         res.redirect('/error?song=' + songName);
         return;
       }

       var musicTitle;
       var musicSinger;
       var musicImage;
       var musicUri;

       musicTitle = musicInfo.tracks.hits[0].track.title;
       musicSinger = musicInfo.tracks.hits[0].track.subtitle;
       musicImage = musicInfo.tracks.hits[0].track.share.image;
       musicUri = musicInfo.tracks.hits[0].track.hub.actions[1].uri;

       for(var i = 1; i < musicInfo.tracks.hits.length; i++)
       {
          musicTitle = musicTitle + ',,' + musicInfo.tracks.hits[i].track.title;
          musicSinger = musicSinger +  ',,' + musicInfo.tracks.hits[i].track.subtitle;
          musicImage = musicImage + ',,' + musicInfo.tracks.hits[i].track.share.image;
          musicUri = musicUri + ',,' + musicInfo.tracks.hits[i].track.hub.actions[1].uri;
      }

       res.redirect("/songs?musicTitle=" + musicTitle + "&musicSinger=" + musicSinger + "&musicImage=" + musicImage + "&musicUri=" + musicUri);
    }
    else
    {
      res.redirect('/error?song=' + songName);
    }

  });



});

app.listen(port, () => {
  console.log(`App listening at http://localhost:${port}`)
  });
