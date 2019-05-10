var express = require('express');
var bodyParser = require('body-parser');
var logger = require('morgan');
var exphbs = require('express-handlebars');
var fs = require('fs');
var mongoose = require('mongoose');
var dotenv = require('dotenv');
var TVShow = require('./models/TV-shows');
var _ = require("underscore");
var ld = require("lodash");

// Load environment variables
dotenv.config();

// Connect to MongoDB
console.log(process.env.MONGODB)
mongoose.connect(process.env.MONGODB);
mongoose.connection.on('error', function () {
  console.log('MongoDB Connection Error. Please make sure that MongoDB is running.');
  process.exit(1);
});

// Set up Express App
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  helpers: require('./handlebars-helpers.js')
}));
app.set('view engine', 'handlebars');
app.use('/public', express.static('public'));


app.get("/", function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    if (err) throw err;
    res.render('home', {
      data: tvshows
    });
  });
});


app.get('/byrating', function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    if (err) throw err;
    var byrating = ld.orderBy(tvshows, ['rating', 'title'], ['desc', 'asc']);
    /*var byrating = _.sortBy(tvshows, function (show) {
      return -parseInt(show.rating);
    })*/
    res.render('byrating', {
      data: byrating
    });
  });
})

app.get("/api/byrating", function(req,res) { 
  TVShow.find({}, function (err, tvshows) {
    if (err) throw err;
    var byrating = ld.orderBy(tvshows, ['rating', 'title'], ['desc', 'asc']);
    /*var byrating = _.sortBy(tvshows, function (show) {
      return -parseInt(show.rating);
    })*/
    res.send(byrating);
  });
});


app.get('/bygenre', function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    if (err) throw err;
    TVShow.find({}, 'genres', function (err, genres) {
      var g = _.uniq(_.flatten(_.pluck(genres, 'genres')), function (ele) {
        return ele.toLowerCase();
      });
      var alpha = ld.orderBy(tvshows, ['title'], ['asc']);
      res.render('bygenre', {
        genres: g,
        data: alpha
      });
    });
  });
});


app.get('/about', function (req, res) {
  res.render('about');
})


app.get('/alphabetical', function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    if (err) throw err;
    var alphabetical = _.sortBy(tvshows, function (show) {
      return show.title;
    })
    res.render('alphabetically', {
      data: alphabetical
    });
  });
});

app.get('/api/alphabetical', function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    if (err) throw err;
    var alphabetical = _.sortBy(tvshows, function (show) {
      return show.title;
    })
    res.send(alphabetical);
  });
})


app.get('/randomshow', function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    var rando = _.first(_.shuffle(tvshows))
    res.render('randomshow', {
      data: [rando]
    });
  });
});

app.get('/api/randomshow', function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    var rando = _.first(_.shuffle(tvshows))
    res.send(rando);
  });
});


app.get('/mostreviews', function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    var sorted = _.sortBy(tvshows, function(show) {
      return -parseInt(show.reviews.length);
    });
    res.render('mostreviews', {
      data: sorted
    });
  });
})

app.get('/api/mostreviews', function (req, res) {
  TVShow.find({}, function (err, tvshows) {
    var sorted = _.sortBy(tvshows, function(show) {
      return -parseInt(show.reviews.length);
    });
    res.send(sorted);
  });
})


// API call that displays all the shows we have
app.get("/api/shows", function (req, res) {
  TVShow.find({}, function (err, shows) {
    if (err) throw err;

    res.send(shows);
  });
});


app.get("/show/:title", function (req, res) {
  TVShow.findOne({ title: req.params.title }, function (err, show) {
    if (err) throw err;

    if(!show){
      res.send("Show is not in our database. :(");
      return;
    }

    res.render("tvshow", {
      _title: show.title,
      _network: show.network,
      _actors: show.actors,
      _genres: show.genres,
      _language: show.language,
      _rating: show.rating,
      _reviews: show.reviews,
      _comments: show.comments
    });
  });
});

app.get("/api/show/:title", function (req, res) {
  TVShow.findOne({ title: req.params.title }, function (err, show) {
    if (err) throw err;

    if(!show){
      res.send({});
      return;
    }

    res.send(show);
  });
});


// GET request for the create a show page
app.get("/addshow", function (req, res) {
  res.render("addshow", {});
})

app.post("/addshow", function (req, res) {
  var body = req.body;

  // Transform tags and content
  body.title = body.title;
  body.actors = body.actors.split(",");
  body.actors = body.actors.map(s => s.trim());

  body.genres = body.genres.split(",");
  body.genres = body.genres.map(s => s.trim());

  // Create new TV show
  var show = new TVShow({
    title: body.title,
    network: body.network,
    actors: body.actors,
    genres: body.genres,
    language: body.language,
    rating: parseInt(body.rating),
    reviews: [],
    comments: []
  });

  // if show does not exist, create it. else, don't make it
  TVShow.findOne({ title: body.title }, function (err, tvshow) {
    if (err) throw err;
    if (!tvshow) {
      // Save show to database
      show.save(function (err) {
        if (err) throw err;
        return res.redirect('/show/' + title);
      })
    }
  });
});

app.post("/api/addshow", function (req, res) {
  var body = req.body;

  // Transform tags and content
  body.title = body.title;
  body.actors = body.actors;
  body.genres = body.genres;

  // Create new TV show
  var show = new TVShow({
    title: body.title,
    network: body.network,
    actors: body.actors,
    genres: body.genres,
    language: body.language,
    rating: body.rating,
    reviews: [],
    comments: []
  });

  // if show does not exist, create it. else, don't make it
  TVShow.findOne({ title: body.title }, function (err, tvshow) {
    if (err) throw err;
    if (!tvshow) {
      // Save show to database
      show.save(function (err) {
        if (err) throw err;
        return res.send('Succesfully inserted TV show.');
      })
    }
  });
});


app.get("/show/:title/add-review", function (req, res) {
  res.render("reviewform.handlebars", { title: req.params.title });
})

// POST for adding a review
app.post("/show/:title/add-review", function (req, res) {
  TVShow.findOne({ title: req.params.title }, function (err, show) {
    if (err) throw err;
    if (!show) return res.send("No TV show with that name found.");

    show.reviews.push({
      author: req.body.author,
      publisher: req.body.publisher,
      rating: parseInt(req.body.rating),
      text: req.body.text
    })

    show.save(function (err) {
      if (err) throw err;
      res.redirect('/show/' + req.params.title);
    });
  });
});

app.post("/api/show/:title/add-review", function (req, res) {
  TVShow.findOne({ title: req.params.title }, function (err, show) {
    if (err) throw err;
    if (!show) return res.send("No TV show with that name found.");

    show.reviews.push({
      author: req.body.author,
      publisher: req.body.publisher,
      rating: parseInt(req.body.rating),
      text: req.body.text
    })

    show.save(function (err) {
      if (err) throw err;
      res.send("Review posted.");
    });
  });
});

/*app.get("/show/:title/add-comment", function (req, res) {
  res.render("commentform.handlebars", { title: req.params.title });
});*/

app.post("/show/:title/add-comment", function (req, res) {
  TVShow.findOne({ title: req.params.title }, function (err, show) {
    if (err) throw err;
    if (!show) return res.send("No TV show with that name found.");

    show.comments.push({
      username: req.body.username,
      text: req.body.text
    })

    show.save(function (err) {
      if (err) throw err;
      io.emit('new comment', show);
      res.send("Added comment!");
    });
  });
});

app.post("/api/show/:title/add-comment", function (req, res) {
  TVShow.findOne({ title: req.params.title }, function (err, show) {
    if (err) throw err;
    if (!show) return res.send("No TV show with that name found.");

    show.comments.push({
      username: req.body.username,
      text: req.body.comment
    })

    show.save(function (err) {
      if (err) throw err;
      io.emit('new comment', show);
      res.send("Added comment!");
    });
  });
});

// Delete a TV Show :( 
app.delete("/show/:title", function(req,res) {
  TVShow.findOneAndDelete({title: req.params.title}, function(err, show) { 
    if (err) throw err;
    res.send('TV Show deleted!');
  });
});

app.delete("/api/show/:title", function(req,res) {
  TVShow.findOneAndDelete({title: req.params.title}, function(err, show) { 
    if (err) throw err;

    TVShow.find({}, function (err, shows) {
      if (err) throw err;
      res.send(shows);
    });
  });
});

// Delete the last review put in for a certain show
app.delete('/show/:title/review/last', function (req, res) {
  TVShow.findOne({ title: req.params.title }, function (err, show) {
    if (err) throw err;
    if (!show) return res.send('No show found with that title.');

    if (show.reviews.length == 0) {
      return res.send('No reviews to delete.');
    }

    show.reviews.splice(show.reviews.length - 1, 1);

    show.save(function (err) {
      if (err) throw err;
      io.emit('deleted review');
      res.send('Sucessfully deleted last review.');
    });
  });
});

app.delete('/api/show/:title/review/last', function (req, res) {
  TVShow.findOne({ title: req.params.title }, function (err, show) {
    if (err) throw err;
    if (!show) return res.send('No show found with that title.');

    if (show.reviews.length == 0) {
      return res.send('No reviews to delete.');
    }

    show.reviews.splice(show.reviews.length - 1, 1);

    show.save(function (err) {
      if (err) throw err;
    });

    TVShow.find({}, function (err, shows) {
      if (err) throw err;
      res.send(shows);
    });
  });
});

io.on('connection', function(socket) {
  console.log('NEW connection.');
});

http.listen(process.env.PORT || 3000, function () {
  console.log('Listening!');
});