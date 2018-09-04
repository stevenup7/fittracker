const sqlite3 = require('sqlite3');
const DBFILE = process.env.DBFILE;

class DBConn {
	constructor (cb) {
		this.db = new sqlite3.Database(DBFILE, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
			if (err) {
				console.log('error opening db', err);
			}
		});

		process.on('SIGINT', () => {
			console.log('closing db connection');
			this.db.close();
		});

	}

	findUser (userName, source, cb) {
		this.db.get("SELECT rowid as id, username, source, email FROM user WHERE username = ?1 AND source = ?2", {
			1: userName,
			2: source
		}, (err, row) => {
			cb(err, row);
		});
	}

	findUserById (id, cb) {
		this.db.get("SELECT rowid as id, username, source, email FROM user WHERE rowid = ?1", {
			1: id,
		}, (err, row) => {
			cb(err, row);
		});
	}


	findOrCreateUser (userName, email, source, cb) {
		this.findUser(userName, source, (err, row) => {
			if (err) {
				console.log('create error', err, row);
				throw(err);
			} else {
				if (row === undefined) {
					this.db.run(`INSERT INTO user (username, source, email)
							 VALUES ($1, $2, $3)`, {
								 1: userName,
								 2: source,
								 3: email
							 }, (err, res) => {
								 this.findUser(userName, source, cb);
							 });
				} else {
					cb(row);
				}
			}
		});
	}
}

module.exports = new DBConn();


/*
	DROP TABLE user;

	CREATE TABLE IF NOT EXISTS user (
		username varchar(100) NOT NULL,
		email varchar(255),
		source varchar(100) NOT NULL,
		created TIMESTAMP DEFAULT CURRENT_TIMESTAMP
	);



*/
