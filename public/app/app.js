var app = angular.module('app', ['uiGmapgoogle-maps']);

app.config(['$httpProvider', function ($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
}]);

app.controller('AppController', function ($scope, $http) {
    $http.get('http://localhost:3333/me').success(function (result) {
        if (!result) return;
        $scope.profile = result.data;
        $scope.counts = result.data.counts;
        console.log($scope.counts);
        localStorage.setItem('token', result.accessToken);
        getPopularUsers();
        getLocations();
        getStat();
    })

    function getPopularUsers() {
        $http.get('http://localhost:3333/insta/popular').success(function (data) {
            if (!data) return;
            $scope.popular = data;

        })
    }

    function getStat() {
        $http.get('http://localhost:3333/insta/stat').success(function (data) {
            if (!data) return;
            $scope.stat = data;
            $scope.rating = Math.round(data.likesAvg + data.commentsAvg + $scope.counts.media * 0.01);

        })
    }

    function getLocations() {
        $scope.coords = [];
        $http.get('http://localhost:3333/insta/locations').success(function (data) {
            if (!data) return;
            var i = 0;
            $scope.coords = data.map(function (item) {
                item.id = ++i;
                return item;
            })
        })
    }

    $scope.map = {center: {latitude: 51.219053, longitude: 4.404418}, zoom: 1};
    $scope.options = {scrollwheel: true};
})