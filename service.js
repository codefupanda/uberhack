var db = require('./db');
var uberBook = require('./uber_book');

module.exports.getTrackInfo = function(callback) {

    uberBook.requestCurrent(function(error, currentResponse){
        console.log("current response " + currentResponse);
        var lat = "";
        var long = "";
        if(!error) {
            console.log("inside");
            if(currentResponse.status == 'in_progress') {
                lat = currentResponse.destination.latitude;
                long = currentResponse.destination.longitude;
            }
            var api_response = {};
            db.get_active_location(function(err, latLongInfo) {
                if (!err && (latLongInfo && latLongInfo.length)) {
                    var id = "";
                    for (var i in latLongInfo) {
                        id = latLongInfo[i].id;
                        lat = latLongInfo[i].loc.split(",")[0].trim();
                        long = latLongInfo[i].loc.split(",")[1].trim();
                    }
                    db.expire_location(id, function (err, response) {
                        if(!err) {
                            api_response.lat = lat;
                            api_response.long = long;
                        }
                        callback(null, api_response);
                    });
                } else {
                    api_response.lat = lat;
                    api_response.long = long;
                    callback(null, api_response);
                }
            });

        } else {
            callback(true);
        }
    });




}
