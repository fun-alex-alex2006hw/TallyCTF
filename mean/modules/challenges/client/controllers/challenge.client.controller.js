'use strict';

// Challenges controller
angular.module('challenges').controller('ChallengesController', ['$scope', '$stateParams', '$location', 'Authentication', 'Challenges',
  function ($scope, $stateParams, $location, Authentication, Challenges) {
    $scope.authentication = Authentication;

    // Create new Challenge
    $scope.create = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'challengeForm');

        return false;
      }

      // Create new Challenge object
      var challenge = new Challenges({
        name: this.name,
        description: this.description,
        solves: this.solves,
        category: this.category,
        points: this.points
      });

      // Redirect after save
      challenge.$save(function (response) {
        $location.path('challenges');
        //$location.path('challenges/' + response._id);

        // Clear form fields
        $scope.name= '';
        $scope.description= '';
        $scope.solves= '';
        $scope.category= '';
        $scope.points= '';
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Remove existing Challenge
    $scope.remove = function (challenge) {
      if (challenge) {
        challenge.$remove();

        for (var i in $scope.challenges) {
          if ($scope.challenges[i] === challenge) {
            $scope.challenges.splice(i, 1);
          }
        }
      } else {
        $scope.challenge.$remove(function () {
          $location.path('challenges');
        });
      }
    };

    // Update existing Challenge
    $scope.update = function (isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'challengeForm');

        return false;
      }

      var challenge = $scope.challenge;

      challenge.$update(function () {
        $location.path('challenges/' + challenge._id);
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message;
      });
    };

    // Find a list of Challenges
    $scope.find = function () {
      //Challenges will not be visible to participants unless event has started AND not ended.
      //if event has started AND not ended:
      $scope.challenges = Challenges.query();
      //$scope.challenges =[];
    };

    // Find existing Challenge
    $scope.findOne = function () {
      $scope.challenge = Challenges.get({
        challengeId: $stateParams.challengeId
      });
    };
  }
]);
