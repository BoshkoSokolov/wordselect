var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

var wordsSchema = mongoose.Schema({
	gameType: Number,
	words: String,
	createdAt: Date
}, {
	collection: '_Words',
	versionKey: false
});

var Words = module.exports = mongoose.model('Words', wordsSchema);

module.exports.getWords = function(gameType, callback) {
	var query = {
		gameType: gameType
	};
	Words.count(query).exec(function(err, c) {
		if (err) {
			throw err;
		}
		var r = Math.floor(Math.random() * c);
		Words.findOne(query).skip(r).exec(callback);
	});
}

module.exports.addWords = function(callback, words) {
	words.save(function(err) {
		if (err) throw err;
	});
};