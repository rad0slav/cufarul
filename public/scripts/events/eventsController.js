module.controller('EventsController', function($scope, $http){
    var update = function(){
        $http.get("/events")
            .success(function(events){
                $scope.events = events;
            })
    };
    update();
});