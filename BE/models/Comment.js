const commentsCollection = require('../db').db().collection('comments');
const ObjectID = require('mongodb').ObjectID;

let Comment = function (data, userid) {
	this.data = data;
	this.userid = userid;
	this.errors = [];
};

Comment.prototype.cleanUp = function () {
	if (typeof this.data.comment != 'string') {
		this.data.comment = '';
	}
	if (typeof this.data.postId != 'string') {
		this.data.postId = '';
	}

	// get rid of any bogus properties
	this.data = {
		comment: sanitizeHTML(this.data.title.trim(), {
			allowedTags: [],
			allowedAttributes: {},
		}),
		postId: ObjectID(this.data.postId),
		createdDate: new Date(),
		author: ObjectID(this.userid),
	};
};

Comment.prototype.validate = function () {
	if (this.data.message == '') {
		this.errors.push('You must provide a message.');
	}
	if (this.data.postId == '') {
		this.errors.push('You must provide post id.');
	}
};

Comment.prototype.create = function (req) {
	return new Promise((resolve, reject) => {
		this.cleanUp();
		this.validate();
		if (!this.errors.length) {
			// save post into database
			commentsCollection
				.insertOne(this.data)
				.then((info) => {
					resolve(info.insertedId);
				})
				.catch((e) => {
					this.errors.push('Please try again later.');
					reject(this.errors);
				});
		} else {
			reject(this.errors);
		}
	});
};
