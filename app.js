var express = require("express");
var cookieParser = require("cookie-parser");
var bodyParser = require("body-parser");
var session = require("express-session");
var KnexSessionStore = require("connect-session-knex")(session);
var requireTree = require("require-tree");
var controllers = requireTree("./controllers");
var passport = require("passport");
var LocalStrategy = require("passport-local").Strategy;
var config = require(__dirname + "/config");
var exSkills = require(__dirname + "/lib/ex-skills");
var cryptoWrap = require(__dirname + "/lib/crypto-wrap")(
	config.get("crypto-wrap")
);
var randomstring = require("randomstring");
var knex = require("knex")(config.get("knex"));
var types = require("pg").types;
//Преобразование bigInt(которые возращает knex в результате некоторых функций в виде строк) в Int
types.setTypeParser(20, "text", parseInt);
var bcrypt = require("bcryptjs");

knex.idsToRecord = function (ids) {
	var res = "(";
	for (var i in ids) res += " '" + ids[i] + "',";
	return res.substring(0, res.length - 1) + ")";
};

var cors = require("cors");
var util = require("util");
var nodemailer = require("nodemailer");
var transporter = nodemailer.createTransport(config.get("nodemailer"));
var updateArray = require(__dirname + "/lib/update-array")(knex);
var updateApprovement = require(__dirname + "/lib/update-approvement")(knex);
var userHasSkills = require(__dirname + "/lib/user-has-skills");

var app = express();
app.use(cors());

var FacebookStrategy = require("passport-facebook").Strategy;

GLOBAL.avatarsDir = __dirname + "/resources/avatars/";
var multer = require("multer");
var upload = multer({
	storage: multer.diskStorage({
		destination: function (req, file, cb) {
			cb(null, GLOBAL.avatarsDir);
		},
		filename: function (req, file, cb) {
			cb(null, randomstring.generate() + ".jpg");
		},
	}),
	limits: { fileSize: 5242880 },
	fileFilter: function (req, file, cb) {
		if (
			file.mimetype !== "image/png" &&
			file.mimetype !== "image/jpg" &&
			file.mimetype !== "image/jpeg"
		)
			cb(null, false);
		else cb(null, true);
	},
});

GLOBAL.COUNT_TO_APPROVE = 3;
GLOBAL.COUNT_TO_CHECK = 3;
GLOBAL.CORRECT_CONSTANT = 2 / 3;
GLOBAL.CORRECT_TASK_EXP_MULTIPLIER = 3;
GLOBAL.INCORRECT_TASK_EXP_MULTIPLIER = 0.5;
GLOBAL.APPROVE_SKILLS_MULTIPLIER = 0.25;
GLOBAL.CHECK_SKILLS_MULTIPLIER = 0.25;

(GLOBAL.updateExp = function (knex) {
	knex("skills")
		.select(knex.raw("skills.*, array_agg(sm.parent_id) as parents"))
		.leftJoin("skills_meta as sm", "skills.id", "sm.skill_id")
		.groupBy("skills.id")
		.then(function (rows) {
			GLOBAL.exs = new exSkills(rows);
			var skillsKeys = Object.keys(exs.skills);
			var skillsCount = skillsKeys.length,
				updatedSkillsCount = 0;

			(function updateSkill(skill) {
				knex("skills")
					.where("id", "=", skill.id)
					.update({ exp: skill.exp })
					.then(function () {
						if (++updatedSkillsCount < skillsCount) {
							console.log(
								"Updating skills exp: " +
									Math.floor((updatedSkillsCount / skillsCount) * 100) +
									"%"
							);
							console.log("\033[2A"); //Сдвигает курсор на две строки вверх
							updateSkill(exs.skills[skillsKeys[updatedSkillsCount]]);
						} else console.log("Exp for all skills updated!");
					})
					.catch(function (err) {
						console.log(err);
					});
			})(exs.skills[skillsKeys[updatedSkillsCount]]);
		});
})(knex);

app.use(cookieParser());
app.use(bodyParser.json({ limit: "50mb" }));
app.use(
	bodyParser.urlencoded({
		limit: "50mb",
		extended: true,
	})
);

var store = new KnexSessionStore({
	knex: knex,
});

app.use(
	session({
		secret: process.env.SESSION_SECRET,
		resave: false,
		saveUninitialized: true,
		store: store,
	})
);

//Подключим и настроим стратегию авторизации
passport.use(
	new LocalStrategy(
		{
			usernameField: "email",
			passwordField: "password",
		},
		function (email, password, done) {
			knex("users")
				.where("email", "=", email.toLowerCase())
				.then(function (users) {
					if (users.length) {
						return bcrypt.compareSync(password, users[0].pswhash)
							? done(null, users[0])
							: done(null, false, { message: "Incorrect password." });
					} else done(null, false, { message: "User not found." });
				})
				.catch(function (err) {
					done(null, false, { message: "Incorrect email." });
				});
		}
	)
);

passport.use(
	new FacebookStrategy(
		{
			clientID: process.env.FACEBOOK_APP_ID,
			clientSecret: process.env.FACEBOOK_APP_SECRET,
			callbackURL: "http://localhost/auth/facebook/callback",
			profileFields: ["id", "displayName", "email"],
		},
		controllers.social.facebook.strategy
	)
);

//Для того, чтобы сохранять или доставать пользовательские данные из сессии, паспорт использует функции
passport.serializeUser(function (user, done) {
	done(null, user.id);
});

passport.deserializeUser(function (id, done) {
	knex("users")
		.where("id", id)
		.then(function (users) {
			done(null, users[0]);
		})
		.catch(function (err) {
			done(err);
		});
});

app.use(passport.initialize());
app.use(passport.session());

app.use("/bower_components", express.static(__dirname + "/bower_components"));
app.use("/dist", express.static(__dirname + "/dist"));

app.use("/db", function (req, res, next) {
	if (req.isAuthenticated()) {
		if (req.path === "/skills") {
			knex("skills")
				.select(knex.raw("skills.*, array_agg(sm.parent_id) as parents"))
				.leftJoin("skills_meta as sm", "skills.id", "sm.skill_id")
				.groupBy("skills.id")
				.then(function (rows) {
					res.end(JSON.stringify(rows));
				});
		} else if (req.path === "/tasks") {
			controllers.db.tasks(knex, req, res, next);
		} else if (req.path === "/users") {
			controllers.db.users(knex, req, res, next);
		} else if (req.path === "/solutions") {
			controllers.db.solutions(knex, req, res, next);
		} else if (req.path === "/comments") {
			controllers.db.comments(knex, req, res, next);
		} else next();
	} else next();
});

//Получение информации о колонках в таблице (значение по умолчанию, тип, макс. длину, нулл?)
app.use("/db/:table/columns", controllers.db.columns(knex));
//Получение количества строк в таблице
app.use("/db/:table/rows_count", controllers.db.rows_count(knex));

app.use("/logged_user", function (req, res, next) {
	if (req.isAuthenticated()) {
		req.body.id = req.user.id;
		controllers.db.users(knex, req, res, next);
	} else res.end();
});
app.use("/check_nick", function (req, res) {
	knex("users")
		.where("nick", req.body.nick)
		.then(function (users) {
			if (users.length) {
				console.log("User with nick '" + req.body.nick + "' already exists!");
				res.end();
			} else {
				res.end("ok");
			}
		})
		.catch(function (err) {
			console.log(err);
			res.end();
		});
});
app.use("/check_email", function (req, res) {
	knex("users")
		.where("email", req.body.email.toLowerCase())
		.then(function (users) {
			if (users.length) {
				console.log("User with email '" + req.body.email + "' already exists!");
				res.end();
			} else {
				res.end("ok");
			}
		})
		.catch(function (err) {
			console.log(err);
			res.end();
		});
});

app.post("/restore", function (req, res) {
	var secretCode = Math.round(Math.random() * 10000);
	transporter.sendMail(
		{
			from: "SkillUP <vintorezvs@gmail.com>",
			to: req.body.email,
			subject: "Восстановление пароля",
			text: "Код для смены пароля: " + secretCode,
		},
		function (err) {
			if (err) {
				console.log(err);
				res.end("error");
			} else res.end("" + secretCode);
		}
	);
});

app.post("/change_password", function (req, res) {
	knex("users")
		.where("email", "=", req.body.email.toLowerCase())
		.update("pswhash", bcrypt.hashSync(req.body.password))
		.then(function () {
			controllers.users.login(req, res);
		})
		.catch(function (err) {
			console.log(err);
			res.end();
		});
});

app.post("/create_task", controllers.tasks.create(knex, userHasSkills));
app.post("/solve_task", controllers.tasks.solve(knex));
app.post("/like_task", controllers.tasks.like(knex));
app.post("/receive_task", controllers.tasks.receive(knex));
app.post("/approve_task", controllers.tasks.approve(knex, userHasSkills));

app.post("/like_solution", controllers.solutions.like(knex));
app.post("/check_solution", controllers.solutions.check(knex, userHasSkills));

app.post("/add_comment", controllers.comments.add(knex));
app.post("/update_comment", controllers.comments.update(knex));
app.post("/like_comment", controllers.comments.like(knex));

app.post("/add_skill", controllers.skills.add(knex));
app.post("/update_skill", controllers.skills.update(knex));
app.post("/delete_skill", controllers.skills.delete(knex));

app.post("/notifications", controllers.notifications.all(knex));
app.get("/notifications/count", controllers.notifications.count(knex));
app.post("/notifications/read", controllers.notifications.read(knex));

app.get(
	"/auth/facebook",
	function (req, res, next) {
		passport.authenticate("facebook", {
			scope: [
				"email",
				"user_birthday",
				"user_education_history",
				"user_location",
				"user_photos",
				"user_work_history",
				"user_about_me",
			],
		})(req, res, next);
	},
	function (req, res) {
		/* Never called */
	}
);

app.get("/auth/facebook/callback", function (req, res, next) {
	passport.authenticate("facebook", function (err, user, info) {
		if (err) return next(err);
		if (!user) return res.redirect("/main");
		req.logIn(user, function (err) {
			if (err) {
				return next(err);
			}
			if (info) {
				return res.redirect("/registration/step2");
			}
			return res.redirect("/users/" + user.id);
		});
	})(req, res, next);
});

//Привяжем запросы к соответствующим контроллерам
app.post("/login", controllers.users.login);
app.post(
	"/register",
	controllers.users.register(cryptoWrap, transporter, randomstring)
);
app.get("/confirm", controllers.users.confirm(cryptoWrap, knex));
app.get("/logout", controllers.users.logout);
app.post(
	"/update_profile",
	upload.single("avatar"),
	controllers.users.update(knex)
);
app.post("/needs", controllers.users.needs(knex));
app.use("/avatars", controllers.users.avatars);

app.use("/", function (req, res) {
	return res.sendFile(__dirname + "/dist/index.html");
});

var server = app.listen(config.get("port"), function () {
	var host = server.address().address;
	var port = server.address().port;

	console.log("app listening at http://%s:%s", host, port);
});
