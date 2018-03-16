var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

var userSchema = mongoose.Schema({
	userId: {
		type: String,
		require: true,
		unique: true
	},
	username: {
		type: String,
		require: true,
	},
	createdAt: Date
}, {
	collection: '_Users',
	versionKey: false
});

var User = module.exports = mongoose.model('User', userSchema);


module.exports = User;
module.exports.getAllUsers = function(callback, limit) {
	User.find(callback).limit(limit);
};

module.exports.register = function(callback, user) {
	user.save(function(err) {
		if (err) throw err;
	});
};

module.exports.findUserByName = function(userId, callback, users) {
	User.findOne({
		userId: userId
	}).exec(callback);
};

module.exports.findUserById = function(id, callback, users) {
	User.find({
		_id: new ObjectId(id)
	}).exec(callback);
};