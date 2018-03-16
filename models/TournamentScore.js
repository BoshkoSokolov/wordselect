var mongoose = require('mongoose');

var tournamentScoreSchema = mongoose.Schema({
	tournamentType: Number,
	userId: String,
	username: String,
	createdAt: Date,
	tournamentId: String,
	gamesPlayed: Number,
	finished: Boolean,
	score: Number
}, {
	collection: '_TournamentScores',
	versionKey: false
});

var TournamentScore = module.exports = mongoose.model('TournamentScore', tournamentScoreSchema);


module.exports = TournamentScore;

module.exports.getTournamentScores = function(tournamentId, callback) {
	var sort = {
		score: -1,
		createdAt: 1
	};
	var query = {
		tournamentId: tournamentId,
		finished: true
	};
	TournamentScore.find(query).sort(sort).limit(7).exec(callback);
}

module.exports.getUserTournamentScore = function(tournamentId, userId, callback) {
	var query = {
		tournamentId: tournamentId,
		userId: userId
	};
	TournamentScore.findOne(query).exec(callback);
}
//****************************************************************************************************************
//USED FOR TESTING
module.exports.getAllTournamentScores = function(callback) {
	TournamentScore.find().exec(callback);
}

module.exports.setScore = function(oldTournamentId, newTournamentId, userId, score, tournamentType, callback) {
	var query = {
		tournamentId: oldTournamentId,
		userId: userId
	};
	var newValues = {
		$set: {
			finished: true,
			gamesPlayed : 5,
			score: score,
			tournamentId: newTournamentId
		}
	};
	TournamentScore.update(query, newValues).exec(callback);
}

//USED FOR TESTING
//****************************************************************************************************************

module.exports.saveScore = function(callback, userScore) {
	userScore.save(function(err) {
		if (err) throw err;
	});
};

module.exports.updateScore = function(tournamentId, userId, score, gamesPlayed, tournamentType, callback) {
	var query = {
		tournamentId: tournamentId,
		userId: userId
	};
	var newValues = {
		$inc: {
			score: score,
			gamesPlayed: 1
		},
		$set: {
			finished: checkIfFinished(tournamentType, gamesPlayed + 1)
		}
	};
	TournamentScore.update(query, newValues).exec(callback);
};

module.exports.getFinishedTournaments = function(userId, callback) {
	var tempDate = new Date();
	tempDate.setDate(tempDate.getDate() - 35)
	var query = {
		userId: userId,
		finished: true,
		createdAt: {
			$gte: tempDate
		}
	};
	TournamentScore.find(query).exec(callback);
}

function checkIfFinished(tournamentType, currentCount) {
	if (tournamentType == 0 && currentCount >= 5)
		return true;
	else if (tournamentType == 1 && currentCount >= 5)
		return true;
	else if (tournamentType == 2 && currentCount >= 5)
		return true;
	else if (tournamentType == 3 && currentCount >= 6)
		return true;
	else return false;
}