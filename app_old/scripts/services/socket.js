'use strict';

/**
 * @ngdoc service
 * @name spectaApp.socket
 * @description
 * # socket
 * Service in the spectaApp.
 */
angular.module('specta')
  .service('socket', function (globalConfig) {

     var options = { port: globalConfig.eventServerPort, hostname: globalConfig.eventServerHost };
     var socket = socketCluster.connect(options);


    socket.on('error', function (err) {
        //console.log('Socket error - ',err);
        throw 'Socket error - ' + err;
    });

    socket.on('connect', function () {
        console.log('CONNECTED');
    });

    this.on = function (eventName, eventCallback) {
        // console.log("event", eventName, eventCallback);
        socket.on(eventName, eventCallback);
    }

    this.subscribe = function (channelName, watchCallback, failCallback) {
        // console.log("subscribed", channelName)
        var channel = socket.subscribe(channelName);
        channel.on('subscribeFail', failCallback);
        channel.watch(watchCallback);
    }

    this.unsubscribe = function (channelName) {
        // console.log('unsubscribe socket' , channelName);
        socket.unsubscribe(channelName);
    }

    this.send = function (data) {
        console.log("sent", data);
        socket.send(data);
    }
    
    this.onMessage = function (eventCallback) {
        socket.on('message', eventCallback);
    }

    this.sendAdminRequest = function (data, callback) {
        // socket.off('adminresponse', callback);
        socket.once('adminresponse', callback);
        socket.emit('adminrequest', data);
    }
});