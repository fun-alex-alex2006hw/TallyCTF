'use strict'

angular.module('challenges').controller('ChallengeUpdateController', ['$scope', '$stateParams', '$location', 'Authentication', '$http', 'Challenges', 'ChallengeForm', 'SweetAlert',
  function ($scope, $stateParams, $location, Authentication, $http, Challenges, ChallengeForm, SweetAlert) {

    $scope.authentication = Authentication
    $scope.id = $stateParams.challengeId || 'new'
    $scope.model = { answers: [] };
    $scope.challenge = Challenges.get({ challengeId: $scope.id })
    $http.get('/modules/challenges/client/config/ChallengeTypes.json').then(
      function (res) {
        $scope.challengeTypes = res.data
      }
    )
    $http.get('/modules/challenges/client/config/NiceFramework.json').then(
      function (res) {
        $scope.niceFramework= res.data
      }
    )
    $http.get('/modules/challenges/client/config/Machines.json').then(
      function (res) {
        $scope.machines = res.data
      }
    )

    /**
     * Defines the challenge model based on data returned from the previous service call.
     * If $scope.id was 'new' most of these are filled with default values.
     * Then gathers and builds the Formly form from the ChallengeForm service.
     */
    $scope.challenge.$promise.then(function () {
      $scope.model.type = $scope.challenge.challengeType
      $scope.model.submissions = $scope.challenge.numberOfSubmissions || $scope.challengeTypes.filter(function (type) {
        return $scope.model.type === type.value
      })[0].submissions
      $scope.model.category = $scope.challenge.category
      $scope.model.description = $scope.challenge.description
      $scope.model.name = $scope.challenge.name
      $scope.model.points = $scope.challenge.points
      $scope.model.machine = $scope.challenge.affectedMachine
      $scope.model.answers = $scope.challenge.answers

      var formats = $scope.challengeTypes.filter(function (type) {
        return type.value === $scope.model.type;
      })[0].formats

      console.log($scope.machines)
      $scope.model.formats = formats
      $scope.model.format = $scope.challenge.challengeFormat
      $scope.fields = ChallengeForm.createForm($scope, $scope.challenge, $scope.challengeTypes, $scope.machines, $scope.niceFramework)
    })

    /**
     * Gathers all of the data in the challenge model and creates a new challenge
     * or modifies the existing one depending on $scope.id
     */
    $scope.updateOrCreate = function () {
      $scope.challenge.name = $scope.model.name
      $scope.challenge.description = $scope.model.description
      $scope.challenge.challengeType = $scope.model.type
      $scope.challenge.points = $scope.model.points
      $scope.challenge.challengeFormat = $scope.model.format
      $scope.challenge.category = $scope.model.category
      $scope.challenge.affectedMachine = $scope.model.machine
      $scope.challenge.numberOfSubmissions = $scope.model.submissions
      $scope.challenge.answers = $scope.model.answers
      $scope.challenge._id = $scope.id
      Challenges.update($scope.challenge, function (res) {
        $location.path('challenges')
      }, function (errorResponse) {
        $scope.error = errorResponse.data.message
      })
    }

    /**
     * Triggers a modal used to confirm the challenges's deletion.
     */
    $scope.confirmDelete = function () {
      SweetAlert.swal({
        title: 'Are you sure?',
        text: 'You will not be able to recover this challenge!',
        type: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#DD6B55',
        confirmButtonText: 'Yes, delete it!',
        closeOnConfirm: true
      }, function (isConfirm) {
        if (isConfirm) {
          $scope.remove();
        }
      });
    };

    $scope.remove = function () {
        $scope.challenge.$remove(function () {
          $location.path('challenges')
        })
    }
  }])
