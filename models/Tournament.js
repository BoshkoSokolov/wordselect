var mongoose = require('mongoose');
var ObjectId = require('mongodb').ObjectID;

var wordsSchema = mongoose.Schema({
	name: String,
	tournamentType: Number,
	tournamentId: String,
	createdAt: Date,
	endDate: Date
}, {
	collection: '_Tournaments',
	versionKey: false
});

var Tournament = module.exports = mongoose.model('Tournament', wordsSchema);

module.exports.addTournament = function(callback, tournament) {
	tournament.save(function(err) {
		if (err) throw err;
	});
};

module.exports.getTournaments = function(callback) {
	var tempDate = Date.now();
	var query = {
		endDate: {
			$gte: tempDate
		}
	};
	var sort = {
		tournamentType: 1
	};
	Tournament.find(query).sort(sort).exec(callback);
}

module.exports.getAllTournaments = function(callback) {
	var sort = {
		endDate: 1
	};
	Tournament.find().sort(sort).exec(callback);
}

module.exports.getFinished = function(callback) {
	var tempDate = new Date();
	var now = Date.now();
	tempDate.setDate(tempDate.getDate() - 35);
	var query = {
		createdAt: {
			$gte: tempDate
		},
		endDate: {
			$lt: now
		}
	};
	var sort = {
		tournamentType: 1
	};
	Tournament.find(query).sort(sort).exec(callback);
}