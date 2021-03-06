'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  ScoreBoard = mongoose.model('ScoreBoard'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller'));

/**
 * Show the current score board entry
 */
exports.read = function (req, res) {
  res.json(req.scoreBoard);
};

/*
 * Append data to a score board
 */
exports.append = function (team, user, challenge, res) {
  //retrieve scoreboard from all scoreboards using teamID
  var scoreBoard = ScoreBoard.findById(team.scoreBoard).exec(function (err, scoreBoard){
    if (err) {
      return err;
    } else if (!scoreBoard) {
      return res.status(503).send({
        message: 'No scoreboard by that id found!'
      });
    }

    //check if the team has already solved the challenge
    for (var cid = 0; cid < scoreBoard.solved.length; ++cid) {
      if (scoreBoard.solved[cid].challengeId.toString() === challenge._id.toString()){
        return res.status(200).send({
          message: 'A team may only solve a challenge once!',
          solves: challenge.solves,
          solved: challenge.solved
        });
      }
    }

    //if they haven't, increment solves
    challenge.solves += 1;
    //and save the challenge
    challenge.save(function (err) {
      if (err) {
        console.log(err);
        return res.status(400).send({
          message: errorHandler.getErrorMessage(err)
        });
      }
    });
    //append the solve to the scoreBoard object
    scoreBoard.solved.push({ challengeId: challenge._id, userId: user._id, date: Date.now(), points: challenge.points });

    //increment team's score in scoreboard
    scoreBoard.score += challenge.points;

    //and save the scoreboard
    scoreBoard.save(function (err) {
      if (err) {
        console.log(err);
        return err;
      } else {
        return res.status(200).send({
          message: 'Correct',
          solves: challenge.solves,
          solved: true
        });
      }
    });
  });
};

/**
 * Update a score board
 */
exports.update = function (req, res) {
  var scoreBoard = req.scoreBoard;

  scoreBoard.solved = req.body.solved;
  scoreBoard.score = req.body.score;

  scoreBoard.save(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(scoreBoard);
    }
  });
};

/**
 * Delete a score board
 */
exports.delete = function (req, res) {
  var scoreBoard = req.scoreBoard;

  scoreBoard.remove(function (err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(scoreBoard);
    }
  });
};

/**
 * List of ScoreBoard
 */
exports.list = function (req, res) {
  //get all scoreboards sorted descending by score value
  ScoreBoard.find().sort('-score')
  .populate('team', 'teamName')
  .populate('solved')
  .exec(function (err, scoreBoard) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(scoreBoard);
    }
  });
};

/**
 * ScoreBoard middleware
 */
exports.scoreBoardByTeamID = function (req, res, next, id) {

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'ScoreBoard is invalid'
    });
  }

  ScoreBoard.find({ team: id })
    .populate('team', 'teamName')
    .populate({
      path: 'solved',
      populate: { path: 'challengeId userId', select: 'name username' }
    })
    .exec(function (err, scoreBoard) {
      if (err) {
        return next(err);
      } else if (!scoreBoard) {
        return res.status(404).send({
          message: 'No score board with that team identifier has been found'
        });
      }
      
      req.scoreBoard = (scoreBoard.length > 1 ? scoreBoard : scoreBoard[0]);

      next();
    });
};
