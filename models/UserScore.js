var mongoose = require('mongoose');

var userScoreSchema = mongoose.Schema({
	scoreType: Number,
	userId: String,
	username: String,
	createdAt: Date,
	score: Number
}, {
	collection: '_UserScores',
	versionKey: false
});

var UserScore = module.exports = mongoose.model('UserScore', userScoreSchema);


module.exports = UserScore;
module.exports.getAllUserScores = function(callback, limit) {
	UserScore.find(callback).limit(limit);
}
module.exports.getUserScores = function(user, scoreType, callback) {
	UserScore.findOne({
		userId: user,
		scoreType: scoreType
	}).sort({
		score: -1
	}).exec(callback);
}

module.exports.leaderBoard = function(scoreType, callback) {
	var tempDate = new Date();
	var now = Date.now();
	tempDate.setDate(tempDate.getDate() - 80);
	console.log(tempDate);
	UserScore.find({
		scoreType: scoreType,
		createdAt: {
			$gte: tempDate
		}
	}).sort({
		score: -1
	}).limit(7).exec(callback);
}

module.exports.saveScore = function(callback, userScore) {
	userScore.save(function(err) {
		if (err) throw err;
	});
};