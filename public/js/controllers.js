var recommendareApp = angular.module('recommendareApp', []);

recommendareApp.controller('recent', function ($scope, $http) {
  $scope.recommendations = [
    {'name': 'Php',
     'cateogry': 'software'},
    {'name': 'Javascript',
      'cateogry': 'software'},
    {'name': 'doctor octopus',
     'cateogry': 'person'}
  ];

  $http.get('things/latest').
    success(function(data, status, headers, config) {
      $scope.recommendations = data;
    }).
    error(function(data, status, headers, config) {
      // log error
    });
})

.controller('search', function ($scope, $http) {
  $scope.search = { like: null, and: null };

  $scope.query = function() {
    console.log(this.search);
    return false;
  }
})

.controller('suggestions', function ($scope, $http) {
  $scope.suggestions = [
    {'name': 'Php',
     'cateogry': 'software'},
    {'name': 'Javascript',
      'cateogry': 'software'},
    {'name': 'doctor octopus',
     'cateogry': 'person'}
  ];

  $http.get('q.json', { like: 'thing_one', and: 'thing_two'}).
    success(function(data, status, headers, config) {
      $scope.suggestions = data;
    }).
    error(function(data, status, headers, config) {
      // log error
    });
})

.config(function($interpolateProvider) {
  $interpolateProvider.startSymbol('{[{');
  $interpolateProvider.endSymbol('}]}');
});