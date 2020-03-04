'use strict';

/**
 * @ngdoc service
 * @name spectaApp.dbService
 * @description
 * # dbService
 * Service in the spectaApp.
 */

 function httpService($http, $q, $state) {
    /*var deferred = $q.defer();
    return $http.get(url)
        .then(function (response) {
            console.log('response', response );
            deferred.resolve(response);
            return deferred.promise;

        }, function (response) {
            $state.go('login');
            deferred.reject(response);
            return deferred.promise;
        });*/

    this.get = function(url){
        return $http.get(url)
            .success(function (data, status, headers, config){
                return data;
            })
            .error(function (error, status, header, config){
                if(status == 401) $state.go('logout');
                return error;
          });
    }

    this.post = function(url, data){
        for(var i in data){
            if(angular.isString(data[i]))
                data[i] = data[i].trim()
        }
        return $http.post(url, data)
            .success(function (response, status, headers, config){
                return response;
            })
            .error(function (error, status, headers, config){
                if(status == 401) $state.go('logout');
                return error;
            });
    }

    this.put = function(url, data){
        for(var i in data){
            if(angular.isString(data[i]))
                data[i] = data[i].trim()
        }
        return $http.put(url, data)
            .success(function (response, status, headers, config){
                return response;
            })
            .error(function (error, status, headers, config){
                if(status == 401) $state.go('logout');
                return error;
            });   
    }

    this.delete = function(url){
        return $http.delete(url)
            .success(function (response, status, headers, config){
                return response;
            })
            .error(function (error, status, headers, config){
                if(status == 401) $state.go('logout');
                return error;
            });
    }
}

function dbService(globalConfig, httpService){
    this.makeUrl = function(obj){
        var tmp = globalConfig.dataapiurl;
        var tmpArr = [];
        for(var item in obj){
            tmpArr.push(item);
        }
        
        for(var item in tmpArr){
            if(obj[ tmpArr[item] ] != '' && obj[ tmpArr[item] ] != undefined){
                if(item != 0) tmp += '&';
                if(tmpArr[item] == 'params') tmp += obj[ tmpArr[item] ];    
                else tmp += tmpArr[item]+'='+ obj[ tmpArr[item] ];
            }
        }

        return tmp;
    }

    this.snapshotUrl = function(obj){
        var tmp = globalConfig.snapshoturlNew;
        var tmpArr = [];
        for(var item in obj){
            tmpArr.push(item);
        }

        for(var item in tmpArr){
            if(item != 0)
                tmp += '&';
            tmp += tmpArr[item]+'='+ obj[ tmpArr[item] ];    
        }
        return tmp;   
    }

    this.unique = function(list, filterParam, value){
        console.log("LIST ", list)
        console.log("filetrparam ", filterParam)
        console.log("value ", value)
        var test = [];
        if(filterParam && value){
            if(typeof value == 'string'){
                test = _.filter(list, function(obj){
                    if(obj[filterParam]){
                        return obj[filterParam].toLowerCase() == value.toLowerCase();
                    }
                })
            }
            else{
                test = _.filter(list, function(obj){
                    if(obj[filterParam]){
                        return obj[filterParam] == value;
                    }
                })
            }
        }
        console.log("dbservice",test);
        return test;
    }

    this.lkuConfig = function(collection, cb){
        var query = JSON.stringify({'collection': collection});
        var params = 'query=' + encodeURIComponent(query);
        var url = this.makeUrl({collection: 'systemconfigtabs', op:'select', params: params});
        httpService.get(url).success(function (res){
            cb(res[0])
        })
    }
}

angular.module('specta')
    .service("httpService", httpService)
    .service('dbService', dbService);