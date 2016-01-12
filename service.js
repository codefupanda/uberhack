var db = require('./db');
var uberBook = require('./uber_book');

module.exports.getTrackInfo = function(callback) {

    uberBook.requestCurrent(function(error, currentResponse){
        console.log("current response " + currentResponse);
        var lat = "";
        var long = "";
        if(!error) {
            if(currentResponse.status == 'in_progress') {
                lat = currentResponse.destination.latitude;
                long = currentResponse.destination.longitude;
            }
            var response = {};
            db.get_active_location(function(err, latLongInfo) {
                if (!err && (latLongInfo && latLongInfo.length)) {
                    var id = "";
                    for (var i in latLongInfo) {
                        id = latLongInfo[i].id;
                        lat = latLongInfo[i].loc.split(",")[0];
                        long = latLongInfo[i].loc.split(",")[1];
                    }
                    db.expire_location(id, function (err, response) {
                        if(!err) {
                            response.lat = lat;
                            response.long = long;
                        }
                        callback(null, response);
                    });
                } else {
                    response.lat = lat;
                    response.long = long;
                    callback(null, response);
                }
            });

        }
    });




}
