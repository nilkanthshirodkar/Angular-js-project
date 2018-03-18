var app = angular.module('main', ['ngRoute']);

app.config(function($routeProvider, $locationProvider) {
	$routeProvider.when('/', {
		templateUrl: './components/home.html',
		controller: 'homeCtrl'
	}).when('/logout', {
		resolve: {
			deadResolve: function($location, user) {
				user.clearData();
				$location.path('/');
			}
		}
	}).when('/login', {
		templateUrl: './components/login.html',
		controller: 'loginCtrl'
	}).when('/dashboard', {
		resolve: {
			check: function($location, user) {
				if(!user.isUserLoggedIn()) {
					$location.path('/login');
				}
			},
		},
		templateUrl: './components/dashboard.html',
		controller: 'dashboardCtrl'
	}).when('/register', {
		templateUrl: './components/register.html',
		controller: 'registerCtrl'
	}).otherwise({
		template: '404'
	});

	$locationProvider.html5Mode(true);
});

app.service('user', function() {
	var username;
	var loggedin = false;
	var id;

	this.getName = function() {
		return username;
	};

	this.setID = function(userID) {
		id = userID;
	};
	this.getID = function() {
		return id;
	};

	this.isUserLoggedIn = function() {
		if(!!localStorage.getItem('login')) {
			loggedin = true;
			var data = JSON.parse(localStorage.getItem('login'));
			username = data.username;
			id = data.id;
		}
		return loggedin;
	};

	this.saveData = function(data) {
		username = data.name;
		id = data.id;
		loggedin = true;
		localStorage.setItem('login', JSON.stringify({
			username: username,
			id: id
		}));
	};

	this.clearData = function() {
		localStorage.removeItem('login');
		username = "";
		id = "";
		loggedin = false;
	}
})

app.controller('homeCtrl', function($scope, $location, $http) {
	$scope.goToLogin = function() {
		$location.path('/login');
	};
	$scope.register = function() {
		$location.path('/register');
	}

	$http({
			url: 'http://localhost:8080/user/allrecipe',
			method: 'GET',	

	}).then(function(data){
		console.log(data);
		$scope.allRecipe = data.data;
	})





});

app.controller('loginCtrl', function($scope, $http, $location, user) {
	$scope.login = function() {
		var email = $scope.username;
		var password = $scope.password;
		$http({
			url: 'http://localhost:8080/user/login',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			params:{email: email, password: password}
		
		}).then(function(response) { console.log(response);

			if(response.data.id != null) {
				user.saveData(response.data);
				$location.path('/dashboard');
			} else {
				alert('invalid login');
			}
		})
	}
});

app.controller('registerCtrl', function($scope, $http, $location, user){
	$scope.register = function(){
		$http({
			url: 'http://localhost:8080/user/register',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			params:{fname: $scope.first_name, lname: $scope.last_name, password: $scope.password, email: $scope.email, phone: $scope.contact_no }
		
		}).then(function(response) { console.log(response);
			if(response.data.id != null) {
				user.saveData(response.data);
				$location.path('/dashboard');
			} else {
				alert('invalid login');
			}
		})

	}
});

app.controller('dashboardCtrl', function($scope, user, $http) {
	 var data = JSON.parse(localStorage.getItem('login'));
	 var	id = data.id;
	
	$http({
		url: 'http://localhost:8080/user/recipe',
		method: 'GET',
		params: {userId: id}
		

		}).then(function(data){
		
		$scope.recipes = data.data;
		
	})


	//$http.get('http://localhost:8080/user/recipe')

	
	$scope.AddRecipe = function() {
		
		//var data = JSON.parse(localStorage.getItem('login'));
		//var	id = data.id;

		$http({
			url: 'http://localhost:8080/user/recipe',
			method: 'POST',
			headers: {
				'Content-Type': 'application/x-www-form-urlencoded'
			},
			params:{name: $scope.recipeName, image: $scope.recipeimage, ingredient: $scope.recipeingredient, description: $scope.recipedescription, userId: id}
		
		})

	}







});