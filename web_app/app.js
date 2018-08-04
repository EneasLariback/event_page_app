//Tutorial at : https://codeburst.io/hitchhikers-guide-to-back-end-development-with-examples-3f97c70e0073
var express = require("express");
var formidable = require('formidable');
var path=require("path");
var bodyParser = require('body-parser');
var session = require('express-session');
var fs=require('fs');
var app = express();
var port = 3000;

var mongoose = require("mongoose");
mongoose.Promise = global.Promise;
mongoose.connect("mongodb://localhost:27017/events",{ useNewUrlParser: true });

var eventSchema = new mongoose.Schema({
 nameofevent: String,
 place: String,
 date: String,
 image: String,
 comments: String,
 rules: String,
 email:String
});

var userSchema=new mongoose.Schema({
	username:String,
	email:String,
	password:String
});
 
var Event = mongoose.model("Event", eventSchema);
var User=mongoose.model("User",userSchema);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use( express.static( "public" ) );
app.use(session({secret: 'keyboard cat'}))


app.set('views',path.join(__dirname,'views'));
app.set('view engine','ejs');

//Posting form with text input and file upload
app.post("/addevent", (req, res) => {
	var form = new formidable.IncomingForm();
	form.parse(req,function(err,fields,files){
		if(err) next(err);
		var formdata={	nameofevent:fields.nameofevent,
						place:fields.place,
						date:fields.date,
						image:fields.image,
						comments:fields.comments,
						rules:fields.rules,
						email:req.session.user.email
					 };
	 	var myData = new Event(formdata);	 	
		myData.save()
			.then(item => {	
			res.redirect('/');
			})
			.catch(err => {
			res.status(400).send("unable to save to database ");
		});	
	});
    form.on('fileBegin', function (name, file){
        file.path = __dirname + '/uploads/' + file.name;
    });
    form.on('file', function (name, file){
        console.log('Uploaded ' + file.name);
    });
});

app.post("/signup", (req, res) => {
	var userData = new User(req.body);
	userData.save()
		.then(item => {	
		req.session.user = req.body;
		res.redirect('/');
		})
		.catch(err => {
		res.status(400).send("unable to save to database ");
	});	
});
app.post("/login", (req, res) => {
	// find each person with a last name matching 'Ghost', selecting the `name` and `occupation` fields
	User.findOne({ 'email': req.body.email , 'password':req.body.password}, function (err, user) {
	  if (err) throw err;
		if(user!=null){
			req.session.user=user;
			console.log("Correct! ="+req.session.user);
			res.redirect('/');
		}else{
			console.log("Wrong!!");
			res.redirect('/login');
		}
	});
});

app.get("/eventcreation", (req, res) => {
	 res.render('eventcreation',{title:"CreateEvent",headline:"Create event with your Terms"});
});

app.get("/login", (req, res) => {
	 res.render('login',{});
});
app.get("/signup", (req, res) => {
	 res.render('signup',{});
});

app.get("/", (req, res) => {
	Event.find({},function(err,doc){
		if(err){
			console.log("ERROR")
		}
		res.render('eventsView',{title:"All Events",eventview:doc});
	}).sort({date:'ascending'});
});
 
app.listen(port, () => {
 	console.log("Server listening on port " + port);
});