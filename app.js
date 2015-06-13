var express = require('express')
  , passport = require('passport')
  , util = require('util')
  , InstagramStrategy = require('passport-instagram').Strategy;

var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var logger  = require('express-log');
var session = require('express-session')

var routes = require('./routes');

var INSTAGRAM_CLIENT_ID = "a6d4b6e4bc9f41fab9db493abc8bb356"
var INSTAGRAM_CLIENT_SECRET = "c00efe7a5f314e66855cebba0b000d97";


passport.serializeUser(function(user, done) {
    console.log('serializeUser',user);
  done(null, user);
});

passport.deserializeUser(function(obj, done) {
    console.log('deserializeUser');
  done(null, obj);
});


// Use the InstagramStrategy within Passport.
//   Strategies in Passport require a `verify` function, which accept
//   credentials (in this case, an accessToken, refreshToken, and Instagram
//   profile), and invoke a callback with a user object.
passport.use(new InstagramStrategy({
    clientID: INSTAGRAM_CLIENT_ID,
    clientSecret: INSTAGRAM_CLIENT_SECRET,
    callbackURL: "http://localhost:3333/auth/instagram/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    // asynchronous verification, for effect...
    process.nextTick(function () {
      // To keep the example simple, the user's Instagram profile is returned to
      // represent the logged-in user.  In a typical application, you would want
      // to associate the Instagram account with a user record in your database,
      // and return that user instead.
      return done(null, {profile:profile,accessToken:accessToken});
    });
  }
));

var app = express();

app.use(logger());

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

app.use(methodOverride());

// Initialize Passport!  Also use passport.session() middleware, to support
// persistent login sessions (recommended).
app.use(passport.initialize());


app.use(express.static(__dirname + '/public'));

app.use(session({
    secret: '9f41fab9db493',
    resave: false,
    saveUninitialized: true
}));

app.use('/', routes);
app.use('/insta', require('./insta-routes'));



app.listen(3333,function(){
    console.log('started');
});

