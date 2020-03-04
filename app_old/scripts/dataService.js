'use strict';

angular.module('specta')
    .service('dataval', function () {
    
    this.getData= function(data){
        if(data>1024){
            var datamb= (data/1024).toFixed(1);
            if(datamb>1024){
                var datagb= (datamb/1024).toFixed(1);
                if(datagb>1024){
                    var datatb= (datagb/1024).toFixed(1);
                    return datatb+" GB";
                }
                else{
                    return datagb+" MB";
                }
            }
            else{
                return datamb+" KB";
            }
        }
        else{
            return data+" Bytes";
        }
    }
    this.getDataps= function (data){
        if(data>1024){
            var datamb= (data/1024).toFixed(1);
            if(datamb>1024){
                var datagb= (datamb/1024).toFixed(1);
                if(datagb>1024){
                    var datatb= (datagb/1024).toFixed(1);
                    return datatb+" GBps";
                }
                else{
                    return datagb+" MBps";
                }
            }
            else{
                return datamb+" KBps";
            }
        }
        else{
            return data+" Bps";
        }
    }
    this.getDatapsBW= function (data){
        if(data>1024){
            var datamb= (data/1024).toFixed(1);
            if(datamb>1024){
                var datagb= (datamb/1024).toFixed(1);
                if(datagb>1024){
                    var datatb= (datagb/1024).toFixed(1);
                    return datatb+" Gbps";
                }
                else{
                    return datagb+" Mbps";
                }
            }
            else{
                return datamb+" Kbps";
            }
        }
        else{
            return data+" bps";
        }
    }
    this.getDataChrt= function (data){
        if(data>1024){
            var datamb= (data/1024).toFixed(1);
            if(datamb>1024){
                var datagb= (datamb/1024).toFixed(1);
                if(datagb>1024){
                    var datatb= (datagb/1024).toFixed(1);
                    return [datatb,"GB"];
                }
                else{
                    return [datagb,"MB"];
                }
            }
            else{
                return [datamb,"KB"];
            }
        }
        else{
            return [data,"Bytes"];
        }
    }
});