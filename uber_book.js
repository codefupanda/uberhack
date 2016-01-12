/*
 * Required imports
 */
var request = require('request');


var userToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJzY29wZXMiOlsicmVxdWVzdCIsImFsbF90cmlwcyJdLCJzdWIiOiJjZDdkYzViNi1hNjU1LTQ5OTktOGMyZS1mZDkwNGViZTMxZDEiLCJpc3MiOiJ1YmVyLXVzMSIsImp0aSI6IjYyYWNiM2M5LTk5MDYtNGM5Yi04N2E0LTNmMmZiNDk5NGNlOCIsImV4cCI6MTQ1NTE3MzExNSwiaWF0IjoxNDUyNTgxMTE0LCJ1YWN0IjoiVEVUWTZ4Q09pamdwallrVWNxYjZDS09jNWVrZUFkIiwibmJmIjoxNDUyNTgxMDI0LCJhdWQiOiJ0U0doTFJ6cnlHN2FTMjJjZFZ6aEdkV3gzMTUyT1c0diJ9.hV-G7lzut6kSqvWrPBFZ96wbiiv-VJ8BXCZebNsa7FrAqdhiGkyKyJRVXmuEgJj7Oh74YamP-sRbWkbFTOdQm4AR1JFBjmtCixFTK1O3eIyJU8QZMVtUFz_Tz5ZGnTQ8SeK4ICi_DAWEvqifitjnZi2lpMXS3OID_q1s0eXTLkkcCX0MF39w-oLTwNcCxnm9Dwl96z4zEFLTePQuASfDQLIg5MBqKmn2WiAfb1ppzcflL3Wd3IKb-FqZdVj6sVC6HjIMMMsT9gdTrTiSCFR2T7KqCLPFtN6DcMXV7wdRkAOKi3_T3LyBLp1KaxN-mUV4MRL8i1dmNdvLMtuDfq5LhA';
var appToken = 'AKivGuBPgG-yYEetDKOauaOfHSYCgNjz';
var requests_api = 'https://sandbox-api.uber.com/v1/requests';

var query = {
    "pick" : {
        "lat" : 12.937306,
        "lon" : 77.695434,
        "address" : "Marthahalli"
    },
    "drop" : {
        "lat" : 12.978361,
        "lon" : 77.608015,
        "address" : "MG Road"
    },
    "cab_id" : "db6779d6-d8da-479f-8ac7-8068f4dade6f"
}



var bookCab = function(query, callback){
    var bookingResponse;

    var uberCabsBookingRequest = {
        url: requests_api,
        method: 'POST',
        json: true,
        headers: {
            'Authorization': 'Bearer ' + userToken,
            'Content-Type': 'application/json'
        },
        body: {
            "product_id" : "db6779d6-d8da-479f-8ac7-8068f4dade6f",
            "start_latitude" : query.pick.lat,
            "start_longitude" : query.pick.lon,
            "end_latitude" : query.drop.lat,
            "end_longitude" : query.drop.lon
        }
    };

    console.log('Uber booking request:\n' + JSON.stringify(uberCabsBookingRequest, null, 2));

    var start = new Date();

    var uberCabsBookingCallback = function (error, response, body) {
        if (!error) {
            console.log('Uber cab booking response code: ' + response.statusCode);
            var uberBookingResponse = body;
            console.log('Uber cab booking response body:' + '\n' +
                JSON.stringify(uberBookingResponse, null, 2));
            if (response.statusCode == 202) {
                callback(null, uberBookingResponse);
            } else {
                callback(true, uberBookingResponse);
            }
        } else {
            console.log('Error while booking Uber cab: ' + error.message);
            bookingResponse = {
                status: 'error',
                message: 'unable to book cab||'
            };
            callback(true, bookingResponse)
        }
    };

    request(uberCabsBookingRequest, uberCabsBookingCallback);
}

var changeStatus = function(query, callback){

    var updateRequest = {
        url :'https://sandbox-api.uber.com/v1/sandbox/requests/'+ query.request_id,
        method : 'PUT',
        json : true,
        headers :{
        'Authorization' : 'Bearer ' + userToken,
            'Content-Type' : 'application/json'
        },
        body:{
            'status' : query.status
        }
    }
   console.log("update request details ", updateRequest);
   var  updateResponse = function(error, response , body){
       if(!error){
           console.log("successfully updated request id ")
           callback(null, null);
       }else{
           console.log("unable to update request id");
           callback(true, null);
       }
   }

    request(updateRequest, updateResponse);
}


var changeStatus = function(query, callback){

    var updateRequest = {
        url :'https://sandbox-api.uber.com/v1/sandbox/requests/'+ query.request_id,
        method : 'PUT',
        json : true,
        headers :{
        'Authorization' : 'Bearer ' + userToken,
            'Content-Type' : 'application/json'
        },
        body:{
            'status' : query.status
        }
    }
   console.log("update request details ", updateRequest);
   var  updateResponse = function(error, response , body){
       if(!error){
           console.log("successfully updated request id ")
           callback(null, null);
       }else{
           console.log("unable to update request id");
           callback(true, null);
       }
   }

    request(updateRequest, updateResponse);
}


var requestCurrent = function (callback) {
    var requestCurrentReq = {
        url :'https://sandbox-api.uber.com/v1/requests/current',
        method : 'GET',
        headers : {
        'Authorization' : 'Bearer ' + userToken,
            'Content-Type' : 'application/json'
        }
    }

    var requestCurrentHandle = function(error, response, body) {
        if(!error && body.request_id) {
            callback(null, body)
        } else {
            callback(true, body)
        }
    }

    request(requestCurrentReq, requestCurrentHandle);
}






var sendNotification = function() {
    console.log('Send notification')
}


/*
 * Book the app
 */
bookCab(query, function(error, response) {
    if(!error) {
        console.log('Booked a cab');
        var queryForStatusChange = {
            request_id : response.request_id,
            status : 'accepted'
        }
        changeStatus(queryForStatusChange, function(error, acceptedResponse) {
            console.log('Change status done');
            queryForStatusChange.status = 'in_progress';
            changeStatus(queryForStatusChange, function(error, in_progressResponse) {
                console.log('Changed status to in_progress');
                sendNotification();
            })
        })
    } else {
        console.log('Fat gaee!!')
    }
});