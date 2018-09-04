const express = require('express');
const passport = require('passport');
const GitHubStrategy = require('passport-github').Strategy;
// const GoogleStrategy = require('passport-google-oauth20').Strategy;
const session = require('express-session');
const bodyParser = require('body-parser');
var db = require('./db');
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(session({
	secret: 'thisissosecretyup',
	resave: false,
	saveUninitialized: false,
	secure: false
}));

passport.use(
	new GitHubStrategy({
		clientID: process.env.GITCLIENTID,
		clientSecret: process.env.GITSECRET,
		callbackURL: "http://localhost:3000/auth/github/callback"
	}, function(accessToken, refreshToken, profile, done) {
		console.log("passport use callback");
		console.log("accesstoken", accessToken);
		console.log("refresh token", refreshToken);
		done (null, profile);
	}));

passport.serializeUser(function(user, done) {
	console.log('serializeUser');

	db.findUser(user.username, 'github', (err, user) => {
		console.log('serializing as' + user.id);
		done(null, user.id);
	});
});

passport.deserializeUser(function(id, done) {
	console.log("deserializeUser", id);
	db.findUserById(id, (err, user) => {
		done(null, user);
	});
});


app.use(passport.initialize());
app.use(passport.session());


function ensureAuthenticated(req, res, next) {
	if (req.isAuthenticated()) {
		console.log('is authed');
		// req.user is available for use here
		return next();
	}
	console.log('was not authed');
	// denied. redirect to login
	res.redirect('/?nope=nope_not_logged_in');
}

app.get('/auth/git',
	passport.authenticate('github', { scope: [ 'user:email' ] }));

app.get(
	'/auth/github/callback',
	passport.authenticate('github', { failureRedirect: '/login' }),
	function(req, res) {
		console.log('auth callback finding user');
		db.findOrCreateUser(req.user.username, req.user.email, 'github', (user) => {
			// Successful authentication, redirect home.
			res.redirect('/?auth=goodasauth&userid=' + user.id);
		});
	}
);

app.get(
	'/needs-login',
	ensureAuthenticated,
	(req, res) => {
		res.send('you is loggeeded in as: ' + req.user.username);
	}
);

app.get(
	'/',
	(req, res) => {
		res.send(`you is home in
			 <ul>
				 <li><a href="/auth/git">do git auth</a></li>
				 <li><a href="/needs-login">check login</a></li>
			 </ul>
		 `);
	}
);

app.listen(process.env.PORT, () => console.log('Example app listening on port ' + process.env.PORT));
