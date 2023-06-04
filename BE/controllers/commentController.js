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
