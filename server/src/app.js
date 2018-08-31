const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;

var session = require('express-session');
var bodyParser = require('body-parser');

const GITClientID = process.env.GITCLIENTID;
const GITClientSecret = process.env.GITSECRET;

passport.use(
	new GitHubStrategy({
		clientID: GITClientID,
		clientSecret: GITClientSecret,
		callbackURL: "http://localhost:3000/auth/github/callback"
	}, function(accessToken, refreshToken, profile, done) {
		console.log(accessToken);
		console.log(refreshToken);
		done (null, profile);
	}));


// Passport session setup.
//	 To support persistent login sessions, Passport needs to be able to
//	 serialize users into and deserialize users out of the session.	 Typically,
//	 this will be as simple as storing the user ID when serializing, and finding
//	 the user by ID when deserializing.	 However, since this example does not
//	 have a database of user records, the complete GitHub profile is serialized
//	 and deserialized.
passport.serializeUser(function(user, done) {
	done(null, user);
});

passport.deserializeUser(function(obj, done) {
	done(null, obj);
});


const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));

app.use(passport.initialize());
app.use(passport.session());


app.get('/auth/git',
	passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get('/auth/github/callback',
	passport.authenticate('github', { failureRedirect: '/login' }),
	function(req, res) {
		// Successful authentication, redirect home.
		res.redirect('/?auth=goodasauth');
	});



app.get('/', (req, res) => {
	res.send('<a href="/auth/git">git auth</a>');
});

app.listen(3000, () => console.log('Example app listening on port 3000!'));
