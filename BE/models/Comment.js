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

Comment.reusableCommentQuery = function (
	uniqueOperations,
	visitorId,
	finalOperations = []
) {
	return new Promise(async function (resolve, reject) {
		let aggOperations = uniqueOperations
			.concat([
				{
					$lookup: {
						from: 'users',
						localField: 'author',
						foreignField: '_id',
						as: 'authorDocument',
					},
				},
				{
					$project: {
						title: 1,
						body: 1,
						createdDate: 1,
						authorId: '$author',
						author: { $arrayElemAt: ['$authorDocument', 0] },
					},
				},
			])
			.concat(finalOperations);

		let comments = await commentsCollection.aggregate(aggOperations).toArray();

		// clean up author property in each post object
		comments = comments.map(function (post) {
			comment.isVisitorOwner = post.authorId.equals(visitorId);
			comment.authorId = undefined;

			comment.author = {
				username: comment.author.username,
			};

			return comment;
		});

		resolve(comments);
	});
};

Comment.findSingleById = function (id, visitorId) {
	return new Promise(async function (resolve, reject) {
		if (typeof id != 'string' || !ObjectID.isValid(id)) {
			reject();
			return;
		}

		let comments = await Comment.reusableCommentQuery(
			[{ $match: { _id: new ObjectID(id) } }],
			visitorId
		);

		if (comments.length) {
			resolve(comments[0]);
		} else {
			reject();
		}
	});
};

Comment.delete = function (commentIdToDelete, currentUserId) {
	return new Promise(async (resolve, reject) => {
		try {
			let comment = await Comment.findSingleById(
				commentIdToDelete,
				currentUserId
			);
			if (comment.isVisitorOwner) {
				await commentsCollection.deleteOne({
					_id: new ObjectID(commentIdToDelete),
				});
				resolve();
			} else {
				reject();
			}
		} catch (e) {
			reject();
		}
	});
};
