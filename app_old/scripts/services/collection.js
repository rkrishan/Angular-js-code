'use strict';

/**
 * @ngdoc service
 * @name spectaApp.dbService
 * @description
 * # dbService
 * Service in the spectaApp.
 */

 angular.module('specta')
    .service("collection", collection)

 function collection(UserProfile, dbService, httpService) {

    var user, params, query, sort, url;

    this.users = function(cb){
        user = UserProfile.profileData;
        console.log(user);
        var fields = JSON.stringify(["firstName", "lastName", 'circle', 'userType', 'username']);
        if( user.userType == 'corporate admin' ){
            var tmp = user.circle.slice(1, -1);
            tmp = tmp.split(',');
            var temp = [];
            for(var key in tmp){
                tmp[key] = tmp[key].trim();
                temp.push({circle : tmp[key]});
            }
            temp.push({ circle : {"$in": tmp } });
            //Fine keyword from array in momgo field
            //{ circle : {"$in": ['Chitgaon', 'Dhaka'] }}
            var query = JSON.stringify({
                $and : [
                    { $or : temp },
                    { 'userType' : {$ne : 'system administrator'}}
                ]
            });
        }
        else if( user.userType == 'circle admin' ){
            // var query = JSON.stringify({'circle': $scope.userProfile.circle, 'userType': {$ne : 'system administrator'} });
            var query = JSON.stringify({
                $and : [
                    { circle : user.circle},
                    { 'userType': {$ne : 'corporate admin'}}, 
                    {'userType' : {$ne : 'system administrator'} }
                ]
            });
        }

        if( user.userType == 'system administrator' )
            var url = dbService.makeUrl({collection: 'users', op:'select'});
        else{
            sort = JSON.stringify({"userType": 1,"firstName": 1});
            params = 'query=' + encodeURIComponent(query)+'&fields='+encodeURIComponent(fields)+ '&sort='+ encodeURIComponent(sort);
            url = dbService.makeUrl({collection: 'users', op:'select', params: params});
        }

        httpService.get(url).then(function(response){
            cb(response.data);
        });
    }

    this.createdUser = function(id, cb){
        var fields = JSON.stringify(["firstName", "lastName"]);
        var query = '{_id: ObjectId("'+ id +'")}';
        var params = 'query=' + encodeURIComponent(query)+'&fields='+ encodeURIComponent(fields);
        var url = dbService.makeUrl({collection: 'users', op:'select', params: params});
        httpService.get(url).then(function(res){
            var createdBy = {name: res.data[0].firstName+' '+res.data[0].lastName};
            cb(createdBy);
        });
    }
}