module.exports = (function() {
	var router = require('express').Router();
	var mongoose = require('mongoose');

	var thingSchema = new mongoose.Schema({
	    name: {
	        type: String,
	        required: true,
	        index: {
	            unique: true
	        }
	    },
	    category: {
	    	type: String
	    },
	    rating: {
	    	type: Number
	    }
	});
	var Thing = mongoose.model('thingSchema', thingSchema);

	var linkSchema = new mongoose.Schema({
	    from: {
	        type: String,
	        required: true,
	    },
	    to: {
	    	type: String,
	        required: true,
	    }
	});
	linkSchema.index({from: 1, to: 1}, {unique: true});
	var Link = mongoose.model('linkSchema', linkSchema);


	router.get('/', function (req, res) {
	    res.render('home');
	});

	router.get('/q.json', function (req, res) {
		find_thing(req.query.like, function (err, thingone) {
			if (err || !thingone) return res.send('1: ' + err);
			find_thing(req.query.and, function (err, thingtwo) {
				if (err || !thingtwo) return res.send('2: ' + err);
				recommend(thingone, thingtwo, function (err, suggestions) {
					if (err) return res.send(err);
					if (suggestions.length == 0 && thingone.category && thingtwo.category) {
						res.redirect('c/' + thingone.category);
					}
					res.json({ suggestions: suggestions, like: req.query.like, and: req.query.and });
				});
			});
		})
	});

	router.get('/q', function (req, res) {
		find_thing(req.query.like, function (err, thingone) {
			if (err || !thingone) return res.send('1: ' + err);
			find_thing(req.query.and, function (err, thingtwo) {
				if (err || !thingtwo) return res.send('2: ' + err);
				recommend(thingone, thingtwo, function (err, suggestions) {
					if (err) return res.send(err);
					if (suggestions.length == 0 && thingone.category && thingtwo.category) {
						res.redirect('c/' + thingone.category);
					}
					res.render('suggest', { suggestions: suggestions, like: req.query.like, and: req.query.and });
				});
			});
		})
	});
	router.get('/c', function (req, res) {
		Thing.find({ category: null }).sort('-rating').limit(25).lean(true).exec(function (err, things) {
			suggestions = [];
			for (i in things) {
				suggestions.push(things[i]._id);
			}
			res.render('suggest', { suggestions: suggestions, like: '', and: ''});
		});
	});
	router.get('/c/:cat', function (req, res) {
		Thing.find({ category: req.params.cat }).sort('-rating').limit(25).lean(true).exec(function (err, things) {
			suggestions = [];
			for (i in things) {
				suggestions.push(things[i]._id);
			}
			res.render('suggest', { suggestions: suggestions, like: '', and: ''});
		});
	});
	router.post('/categorize', function (req, res) {
	   	find_thing(req.body.like, function (err, thingone) {
	   		thingone.category = req.body.like_category.toLowerCase();
	   		thingone.save(function (err, thing) {
				find_thing(req.body.and, function (err, thingtwo) {
					thingtwo.category = req.body.and_category.toLowerCase();
					thingtwo.save(function (err, thing) {
							res.redirect('c/' + req.body.like_category.toLowerCase());
					});
				});
			});
	   	});
	});

	router.get('/things', function (req, res) {
	   	Thing.find(function (err, things) {
	   		res.send(things);
	   	})
	});
	router.get('/things/latest', function (req, res) {
		Thing.find().sort('-_id').limit(25).find(function(err, things) {
			res.send(things);
		});
	});
	router.post('/thing/show', function (req, res) {
	   	Thing.findOne( { _id: req.body.id}, function (err, thing) {
	   		res.send(thing);
	   	});
	});
	router.post('/thing/categorize', function (req, res) {
		if (!req.body.category) return res.send('Please select a category');
	   	Thing.findOne( { _id: req.body.id}, function (err, thing) {
	   		if (!thing) return res.send(':( ' + err);
	   		thing.category = req.body.category.toLowerCase();
	   		thing.save(function (err, thing) {
	   			if (err) return res.send(err);
	   			res.send(thing);
	   		});
	   	});
	});
	router.post('/thing/rate', function (req, res) {
		if (!req.body.rating) return res.json({ err: 'no rating'});
	   	Thing.findOne( { _id: req.body.id}, function (err, thing) {
	   		if (!thing.rating) {
	   			thing.rating = req.body.rating;
	   		} else {
				thing.rating = (thing.rating + Number(req.body.rating)) / 2;
	   		}
	   		thing.save(function (err, thing) {
	   			if (err) return res.send(err);
	   			res.send(thing);
	   		});
	   	});
	});
	router.post('/things/suggest', function (req, res) {
		if (req.body.n.length === 0) return res.send('');
	   	Thing.find( {name: new RegExp('^'+ req.body.n, "i")}).limit(5).sort('-rating').lean(true).exec(function (err, things) {
	   		res.send(things);
	   	});
	});
	router.get('/thing/similar', function (req, res) {
		Link.find({ $or: [{from: req.query.id}, {to: req.query.id}] }, function (err, links) {
			if (links.length == 0) return res.json({ err: 'no links found' });
			var l = [];
			for (var i = 0; i < links.length; i++) {
				if (links[i].to !== req.query.id) l.push(links[i].to);
				if (links[i].from !== req.query.id)  l.push(links[i].from);
			}
		   	Thing.find({ _id: { $in: l }}).sort('ratings').limit(2).lean(true).exec(function (err, things) {
		   		if (err) return res.json({ err: err });
		   		res.send(things);
		   	});
		});
	});
	router.get('/links', function (req, res) {
	   	Link.find(function (err, links) {
	   		res.send(links);
	   	})
	});

	function find_thing(n, callback) {
		Thing.findOne({ name: n.toLowerCase()}, function (err, thing) {
			if (err) return callback(err, null);
			if (thing) {
				callback(err, thing);
			} else {
				var newthing = new Thing({
					name: n.toLowerCase()
				});
				newthing.save(function (err, thing) {
					callback(err, thing);
				});
			}
		});
	}

	function recommend(thingone, thingtwo, callback) {
		if (!thingone || !thingtwo) return callback('missing things', []);
		Link.find({ $or: [{from: thingone._id}, {from: thingtwo._id}] }, function (err, links_one) {
			Link.find({ $or: [{to: thingtwo._id}, {to: thingone._id}] }, function (err, links_two) {
				var suggestions = [];
				for (var i = 0; i < links_one.length; i++) {
					if (links_one[i].to != thingtwo._id && links_one[i].to != thingone._id ) suggestions.push(links_one[i].to);
				}
				for (var i = 0; i < links_two.length; i++) {
					if (links_two[i].from != thingtwo._id && links_two[i].from != thingone._id )  suggestions.push(links_two[i].from);
				}
				var newlink = new Link({
					from: thingone._id,
					to: thingtwo._id
				});
				newlink.save(function (err) {
				});
				callback(err, suggestions);
			});
		});
	}


	return router;
})();

