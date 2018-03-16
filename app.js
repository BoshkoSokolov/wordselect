var express = require('express');
var app = express();
var bodyParses = require('body-parser');
var mongoose = require('mongoose');
User = require('./models/User');
UserScore = require('./models/UserScore');
Words = require('./models/Words');
Tournament = require('./models/Tournament');
Reward = require('./models/Reward');
TournamentScore = require('./models/TournamentScore');

// //Connect to Mongoose
// mongoose.connect('mongodb://localhost/wordselect');
var db = mongoose.connect('mongodb://admin:23$68dba@ds115166.mlab.com:15166/wordselect', {
  useMongoClient: true,
});

app.get('/', function(req, res) {
  res.send('Sup');
});

app.use(bodyParses.json());
app.use(express.json());

var schedule = require('node-schedule');

rewardsCheck();
//setTournamentScoresForTesting();

app.get('/api/setForTesting', function(req, res) {
  rewardsCheck();
  res.json("Checking Rewards");
});

//GET REWARDS
//GET
//Param: userId
app.get('/api/getRewards', function(req, res) {
  var userId = req.query.userId;
  Reward.getUserRewards(userId, function(err, users) {
    if (err) {
      throw err;
    }
    res.json(users);
  });
});


//LOGIN
//GET
//Param: userId
app.get('/api/login', function(req, res) {
  var userId = req.query.userId;
  User.findUserByName(userId, function(err, users) {
    if (err) {
      throw err;
    }
    res.json(users);
  });
});

//REGISTER
//POST
//Param: userId
app.post('/api/register', function(req, res) {
  var newUser = User({
    userId: req.body.userId,
    username: req.body.username,
    createdAt: Date.now()
  });

  User.register(function(err, newUser) {
    if (err) throw err;
  }, newUser);
  res.json(newUser);
});

//SAVE SCORE
//POST
//Param: userId, scoreType, score
app.post('/api/saveScore', function(req, res) {
  var newUserScore = UserScore({
    scoreType: req.body.scoreType,
    userId: req.body.userId,
    username: req.body.username,
    createdAt: Date.now(),
    score: req.body.score
  });

  UserScore.saveScore(function(err, newUser) {
    if (err) throw err;
  }, newUserScore);
  res.json(newUserScore);
});

//SAVE TOURNAMENT SCORE
//POST
//Param: userId, scoreType, score, tournamentId
app.post('/api/saveTournamentScore', function(req, res) {
  var tournamentId = req.body.tournamentId;
  var userId = req.body.userId;
  TournamentScore.getUserTournamentScore(tournamentId, userId, function(err, score) {
    if (err) {
      throw err;
    }
    if (score == null) {
      console.log("inserting new score");
      var newUserScore = TournamentScore({
        tournamentType: req.body.tournamentType,
        userId: req.body.userId,
        username: req.body.username,
        tournamentId: req.body.tournamentId,
        createdAt: Date.now(),
        score: req.body.score,
        finished: false,
        gamesPlayed: 1
      });
      TournamentScore.saveScore(function(err, newUser) {
        if (err) throw err;
      }, newUserScore);
      var tempUser = TournamentScore({
        tournamentType: req.body.tournamentType,
        userId: req.body.userId,
        username: req.body.username,
        tournamentId: req.body.tournamentId,
        createdAt: Date.now(),
        score: req.body.score,
        finished: false,
        gamesPlayed: 0
      });
      console.log(newUserScore);
      console.log(tempUser);
      res.json(tempUser);
    } else {
      console.log("updating score");
      TournamentScore.updateScore(score.tournamentId, score.userId, req.body.score, score.gamesPlayed, score.tournamentType, function(err, data) {
        if (err) throw err;
      });
      res.json(score);
    }

  });

});

//GET SCORES
//GET
//Param: userId
app.get('/api/getUserScores',
  function(req, res) {
    var userId = req.query.userId;
    var json = [];
    UserScore.getUserScores(userId, 0, function(err, score) {
      if (err) {
        throw err;
      }
      json.push(score);
      UserScore.getUserScores(userId, 1, function(err, score) {
        if (err) {
          throw err;
        }
        json.push(score);
        UserScore.getUserScores(userId, 2, function(err, score) {
          if (err) {
            throw err;
          }
          json.push(score);
          res.json(json);
        });
      });
    });
  });

//GET SCORES
//GET
//Param: tournamentId
app.get('/api/getTournamentScores', function(req, res) {
  var tournamentId = req.query.tournamentId;
  TournamentScore.getTournamentScores(tournamentId, function(err, scores) {
    if (err) {
      throw err;
    }
    res.json(scores);
  });
});


//GET SCORES
//GET
//Param: tournamentId
app.get('/api/getTournamentUserScore', function(req, res) {
  var tournamentId = req.query.tournamentId;
  var userId = req.query.userId;
  TournamentScore.getUserTournamentScore(tournamentId, userId, function(err, scores) {
    if (err) {
      throw err;
    }
    res.json(scores);
  });
});

//LEADERBOARD
//GET
//Param: scoreType
app.get('/api/getLeaderBoard', function(req, res) {
  //var scoreType = req.query.scoreType;
  var json = [];
  UserScore.leaderBoard(0, function(err, score) {
    if (err) {
      throw err;
    }
    json.push(score);
    UserScore.leaderBoard(1, function(err, score) {
      if (err) {
        throw err;
      }
      json.push(score);
      UserScore.leaderBoard(2, function(err, score) {
        if (err) {
          throw err;
        }
        json.push(score);
        res.json(json);
      });
    });
  });
});


//ADD WORDS
//POST
//Param: words, gameType
app.post('/api/addWords', function(req, res) {
  generateWords(req.body.numberOfWords, req.body.wordString, req.body.numberOfSubmits, req.body.gameType);
  res.json("Generating word strings");
});

//GET WORDS
//GET
//Param: gameType
app.get('/api/getWords', function(req, res) {
  Words.getWords(req.query.gameType, function(err, words) {
    if (err) {
      throw err;
    }
    res.json(words);
  });
});

//GET TOURNAMENTS
//GET
//Param: userId
app.get('/api/getTournaments', function(req, res) {
  var userId = req.query.userId;
  Tournament.getTournaments(function(err, tournaments) {
    if (err) {
      throw err;
    }
    var allTournaments = tournaments;
    var availableTournaments = [];
    TournamentScore.getFinishedTournaments(userId, function(err, finishedTournaments) {
      if (err) {
        throw err;
      }
      for (var i in allTournaments) {
        for (var j in finishedTournaments) {
          if (allTournaments[i]['tournamentId'] == finishedTournaments[j]['tournamentId']) {
            console.log(allTournaments[i]['name']);
            delete allTournaments[i];
            break;
          }
        }
        if (allTournaments[i] != null) {
          availableTournaments.push(allTournaments[i]);
        }
      }
      res.json(availableTournaments);
    });
  });
});

//GET WORDS
//GET
app.get('/api/getFinished', function(req, res) {
  Tournament.getFinished(function(err, tournaments) {
    if (err) {
      throw err;
    }
    res.json(tournaments);
  });
});

//ADD TOURNAMENT
//POST
//Param: tournamentType, numDay, name
// app.post('/api/addTournament', function(req, res) {
//   var now = new Date();
//   var end = new Date(now.getTime() + (req.body.numDay * 60 * 1000));

//   var id = makeid();
//   var newTournament = Tournament({
//     name: req.body.name,
//     tournamentType: req.body.tournamentType,
//     tournamentId: id,
//     createdAt: Date.now(),
//     endDate: end
//   })

//   console.log(newTournament.name + " ends on: " + end);

//   Tournament.addTournament(function(err, newTournament) {
//     if (err) throw err;
//   }, newTournament);
//   var tempDate = new Date(end.getTime() + (1 * 60 * 1000));
//   var j = schedule.scheduleJob(tempDate, function() {
//     TournamentScore.getTournamentScores(id, function(err, tournamentScores) {
//       var counter = 0;
//       for (var item in tournamentScores) {
//         var newReward = Reward({
//           rewardType: counter,
//           tournamentType: newTournament.tournamentType,
//           tournamentName: newTournament.name,
//           userScore: tournamentScores[counter]['score'],
//           tournamentId: id,
//           userId: tournamentScores[counter]['userId'],
//           createdAt: Date.now()
//         });
//         console.log("Adding: " + newReward + " " + counter)
//         counter++;
//         Reward.addTournament(function(err, newUser) {
//           if (err) throw err;
//         }, newReward);
//       }
//     });
//   });
//   res.json(newTournament);
// });

//ADD TOURNAMENT
//POST
//Param: tournamentType, numDay, name
app.post('/api/addTournament', function(req, res) {
  var end = new Date();
  var now = new Date();
  end.setDate(end.getDate() + req.body.numDay);
  var id = makeid();
  var newTournament = Tournament({
    name: req.body.name,
    tournamentType: req.body.tournamentType,
    tournamentId: id,
    createdAt: Date.now(),
    endDate: end
  })

  Tournament.addTournament(function(err, newTournament) {
    if (err) throw err;
  }, newTournament);
  var tempDate = new Date(end.getTime() + (30 * 60 * 1000));
  var j = schedule.scheduleJob(tempDate, function() {
    TournamentScore.getTournamentScores(id, function(err, tournamentScores) {
      for (var item in tournamentScores) {
        var newReward = Reward({
          rewardType: item,
          tournamentType: newTournament.tournamentType,
          tournamentName: newTournament.name,
          userScore: tournamentScores[item]['score'],
          tournamentId: id,
          userId: tournamentScores[item]['userId'],
          createdAt: Date.now()
        });
        Reward.addTournament(function(err, newUser) {
          if (err) throw err;
        }, newReward);
      }
    });
  });
  res.json(newTournament);
});

//ADD TOURNAMENT
//POST
//Param: tournamentType, numDay, name
app.post('/api/addTestTournament', function(req, res) {
  var end = new Date(Date.now() + (req.body.numDay * 60 * 1000));
  var now = new Date();
  var id = makeid();
  var newTournament = Tournament({
    name: req.body.name,
    tournamentType: req.body.tournamentType,
    tournamentId: id,
    createdAt: Date.now(),
    endDate: end
  })

  console.log(req.body.name + " ends on: " + end);
  Tournament.addTournament(function(err, newTournament) {
    if (err) throw err;
  }, newTournament);
  var tempDate = new Date(end.getTime() + (1 * 60 * 1000));
  var j = schedule.scheduleJob(tempDate, function() {
    TournamentScore.getTournamentScores(id, function(err, tournamentScores) {
      for (var item in tournamentScores) {
        var newReward = Reward({
          rewardType: item,
          tournamentType: newTournament.tournamentType,
          tournamentName: newTournament.name,
          userScore: tournamentScores[item]['score'],
          tournamentId: id,
          userId: tournamentScores[item]['userId'],
          createdAt: Date.now()
        });
        Reward.addTournament(function(err, newUser) {
          if (err) throw err;
        }, newReward);
      }
    });
  });
  res.json(newTournament);
});

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 10; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}



//When starting the script check if rewards have been sent for the finished tournaments
//If rewards weren't sent it sends them
//Schedules rewards for the active tournaments
function rewardsCheck() {
  console.log("rewardsCheck is called");
  Tournament.getFinished(function(err, tournaments) {
    if (err) {
      throw err;
    }
    if (tournaments.length != 0)
      checkForRewardsFinished(tournaments, tournaments.length, 0);
  });
  Tournament.getTournaments(function(err, tournaments) {
    for (var i in tournaments) {
      var tempDate = new Date(tournaments[i]['endDate'] + (15 * 60 * 1000));
      console.log(tournaments[i]['name'] + " scheduled for " + tempDate);
      scheduleRewards(tournaments[i], tempDate);
    }
  });
}

function checkForRewardsFinished(tournaments, totalTournaments, currentTournamentNum) {
  if (currentTournamentNum != totalTournaments) {
    var currentTournament = tournaments[currentTournamentNum];
    console.log(currentTournament['name'] + "_" + currentTournamentNum);
    Reward.checkForReward(currentTournament['tournamentId'], function(err, reward) {
      if (err)
        throw err;
      if (reward.length == 0) {
        TournamentScore.getTournamentScores(currentTournament['tournamentId'], function(err, tournamentScores) {
          for (var item in tournamentScores) {
            var newReward = Reward({
              rewardType: item,
              tournamentType: currentTournament['tournamentType'],
              tournamentName: currentTournament['name'],
              userScore: tournamentScores[item]['score'],
              tournamentId: currentTournament['tournamentId'],
              userId: tournamentScores[item]['userId'],
              createdAt: Date.now()
            });
            Reward.addTournament(function(err, newUser) {
              if (err) throw err;
            }, newReward);
          }
          checkForRewardsFinished(tournaments, totalTournaments, (currentTournamentNum + 1))
        });
      } else {
        checkForRewardsFinished(tournaments, totalTournaments, (currentTournamentNum + 1))
      }
    });
  }
}

function scheduleRewards(tournament, tempDate) {
  var j = schedule.scheduleJob(tempDate, function() {
    console.log(tournament['name']);
    TournamentScore.getTournamentScores(tournament['tournamentId'], function(err, tournamentScores) {
      for (var item in tournamentScores) {
        var newReward = Reward({
          rewardType: item,
          tournamentType: tournament['tournamentType'],
          tournamentName: tournament['name'],
          userScore: tournamentScores[item]['score'],
          tournamentId: tournament['tournamentId'],
          userId: tournamentScores[item]['userId'],
          createdAt: Date.now()
        });
        Reward.addTournament(function(err, newUser) {
          if (err) throw err;
        }, newReward);
      }
    });
  });
}

function setTournamentScoresForTesting() {
  Tournament.getAllTournaments(function(err, tournaments) {
    if (err)
      throw err;
    TournamentScore.getAllTournamentScores(function(err, scores) {
      for (var i in scores) {
        var randomTournament = randomIntFromInterval(0, tournaments.length - 1);
        var newTournamentId = tournaments[randomTournament]['tournamentId'];
        var oldTournamentId = scores[i]['tournamentId'];
        var userId = scores[i]['userId'];
        var score = randomIntFromInterval(100, 1000);
        var tournamentType = tournaments[randomTournament]['tournamentType'];
        console.log(oldTournamentId + "_" + newTournamentId + "_" + tournamentType + "_" + score + "_" + userId);
        TournamentScore.setScore(oldTournamentId, newTournamentId, userId, score, tournamentType, function(err, changedScore) {
          if (err)
            throw err;
        });
      }
    });
  });
}

function generateWords(numberOfWords, wordString, numberOfSubmits, gameType) {
  var words = wordString;
  var wordsArray = words.split(" ");
  for (var j = 0; j < numberOfSubmits; j++) {
    var tempArray = wordsArray;
    var dbWords = "";
    for (var i = 0; i < numberOfWords; i++) {
      var randomIndex = randomIntFromInterval(0, tempArray.length);
      if (i > 0)
        dbWords += " " + tempArray[randomIndex];
      else
        dbWords += tempArray[randomIndex];
      tempArray.splice(randomIndex, 1);
    }
    var wordsObj = Words({
      gameType: gameType,
      words: dbWords,
      createdAt: Date.now()
    });

    Words.addWords(function(err, wordsObj) {
      if (err) throw err;
    }, wordsObj);
  }
}

function randomIntFromInterval(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min);
}

app.listen(80);