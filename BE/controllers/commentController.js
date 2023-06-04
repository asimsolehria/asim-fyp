const Comment = require('../models/Comment');

exports.apiCreate = function (req, res) {
	let comment = new Comment(req.body, req.apiUser._id);
	comment
		.create()
		.then(function (newId) {
			res.json(newId);
		})
		.catch(function (errors) {
			res.json(errors);
		});
};

exports.apiDelete = function (req, res) {
	Comment.delete(req.body.id, req.apiUser._id)
		.then(() => {
			res.json('Success');
		})
		.catch((e) => {
			res.json('You do not have permission to perform that action.');
		});
};
