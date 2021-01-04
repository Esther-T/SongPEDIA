//Server for SongPEDIA

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

app.get("/gotologin", (req, res)
{
	res.render('login');
});

app.get("/gotosignup", (req, res)
{
	res.render('signup');
});

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

  const musicName = req.query.musicName;
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
  res.render('songs',{musicName: musicName, musicTitle: musicTitle, musicSinger: musicSinger, musicImage: musicImage, musicUri: musicUri});
});

app.post("/close", function(req, res)
{
    res.redirect("/");
});

app.post("/learn-more", function(req, res)
{
    const info = req.body.musicName + ',' + req.body.musicTitle + ',' + req.body.musicSinger + ',' + req.body.musicImage + ',' + req.body.musicUri;
    res.redirect("/info?information=" + info);
});

app.post("/log-in", function(req, res){
  const username = req.body.username;
  const password = req.body.password;
  console.log(username);
  console.log(password);
});

app.post("/", function(req, res){
  var request = unirest("GET", "https://shazam.p.rapidapi.com/search");
  const songName = req.body.songName;

  request.query({
  	"locale": 'en-US',
  	"offset": "0",
  	"limit": "5",
  	"term": songName
  });

  request.headers({
  	"x-rapidapi-host": "shazam.p.rapidapi.com",
  	"x-rapidapi-key": '4e9781a532msh0865f249a6e9001p15211ajsn05fea621862b'/*insert api key*/,
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

       var musicTitles;
       var musicSingers;
       var musicImages;
       var musicUris;
       var musicTitle;
       var musicSinger;
       var musicImage;
       var musicUri;

       for(var i = 0; i < musicInfo.tracks.hits.length; i++)
       {
         try{
            musicTitle = musicInfo.tracks.hits[i].track.title;
         }
        catch(err){
          musicTtitle = songName;
        }

        try{
           musicSinger = musicInfo.tracks.hits[i].track.subtitle;
        }
        catch(err){
          musicSinger = "No results"
        }

        try{
          musicImage = musicInfo.tracks.hits[i].track.share.image;
        }
        catch(err){
          musicImage = 'images/no_images.png'
        }

        try{
          musicUri = musicInfo.tracks.hits[i].track.hub.actions[1].uri;
        }
        catch(err){
          musicUri = 'none';
        }

        if(i === 0)
        {
          musicTitles = musicTitle;
          musicSingers = musicSinger;
          musicImages = musicImage;
          musicUris = musicUri;
        }
        else
        {
          musicTitles = musicTitles + ',,' + musicTitle;
          musicSingers = musicSingers +  ',,' + musicSinger;
          musicImages = musicImages + ',,' + musicImage;
          musicUris = musicUris + ',,' + musicUri;
        }
      }

       res.redirect("/songs?musicName=" + songName + "&musicTitle=" + musicTitles + "&musicSinger=" + musicSingers + "&musicImage=" + musicImages + "&musicUri=" + musicUris);
    }
    else
    {
      res.redirect('/error?song=' + songName);
    }

  });

});

app.listen(process.env.PORT || 663, () => {
  console.log(`App listening at port:${port}`)
  });
