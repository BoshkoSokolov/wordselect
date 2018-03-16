var mongoose = require('mongoose');

var rewardSchema = mongoose.Schema({
	rewardType: Number,
	tournamentType: String,
	tournamentName: String,
	tournamentId: String,
	userScore: Number,
	userId: String,
	createdAt: Date
}, {
	collection: '_Rewards',
	versionKey: false
});

var Reward = module.exports = mongoose.model('Reward', rewardSchema);


module.exports = Reward;

module.exports.getUserRewards = function(userId, callback) {
	var query = {
		userId: userId
	}
	Reward.find(query).exec(callback);
};

module.exports.addTournament = function(callback, reward) {
	reward.save(function(err) {
		if (err) throw err;
	});
};

module.exports.checkForReward = function(tournamentId, callback) {
	var query = {
		tournamentId: tournamentId
	}
	Reward.find(query).exec(callback);
}