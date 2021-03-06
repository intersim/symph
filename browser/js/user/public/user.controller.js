'use strict';

app.controller('UserPubCtrl', function($scope, $state, theUser, allFollowers, allMixes, loopBucket, UserFactory){
	
	$scope.followers = allFollowers;
	$scope.user = theUser;
	$scope.mixes = allMixes;
	$scope.loops = loopBucket;
    
    UserFactory.following($scope.user._id)
    .then(function(value){
    	$scope.follow=value;
    	if(value) $scope.status="Unfollow"
    	else $scope.status="Follow"
    })

    $scope.loopFilter = function(loop){
    	return loop.creator==$scope.user._id
    }

    $scope.change = function(userId){

        if($scope.follow){
            unfollow(userId)
        } else {
            follow(userId)
        }
        $scope.follow=!$scope.follow;
        $scope.status="Unfollow"
    }

    function follow(userId){
    	UserFactory.followUser(userId)
	}

	function unfollow(userId){
    	UserFactory.unfollowUser(userId)
	}
})

app.config(function($stateProvider){
	$stateProvider.state('profile', {
		url:'/user/:userId',
		templateUrl: '/js/user/public/user.html',
		controller: 'UserPubCtrl',
		resolve: {
			theUser: function(UserFactory, $stateParams){
				return UserFactory.fetchById($stateParams.userId);
			},
			allMixes: function(UserFactory, $stateParams){
				return UserFactory.getMixes($stateParams.userId);
			},
			allFollowers: function(UserFactory, $stateParams){
				return UserFactory.getFollowers($stateParams.userId);
			},
			loopBucket: function(UserFactory, $stateParams){
				return UserFactory.getLoopBucket($stateParams.userId);
			}
		}
	})


	//GET PROPER LOOPS THROUGH USER ROUTES TO RESOLVE


	//implement this state if we want separate mixes page view for specific users 

	// $stateProvider.state('userMixes',{
	 //    url: '/user/:userid/mixes',
	 //    templateUrl: '/js/mixes/mixes.view.html'
  	// })
})