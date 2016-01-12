var db = require('./db');

module.exports.getTrackInfo = function(callback) {
    db.get_active_location(function(err, latLongInfo) {
        if (err || (latLongInfo && latLongInfo.length)) {
            var id = "";
            var lat = "";
            var long = "";

            for (var i in latLongInfo) {
                id = latLongInfo[i].id;
                lat = latLongInfo[i].loc.split(",")[0];
                long = latLongInfo[i].loc.split(",")[1];
            }
            db.expire_location(id, function (err, response) {
                var response = {};
                if(!err) {
                    response.lat = lat;
                    response.long = long;

                }
                callback(null, response);
            });
        } else {
            callback(true);
        }
    });
}
