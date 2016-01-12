var express = require('express');
var router = express.Router();

var request = require('request');
var async = require('async');
var url = require('url');
var util = require('util');
var _ = require('underscore');
var GCM = require('gcm').GCM;

var uberBook = require('../uber_book');
var service = require('../service');
var db = require('../db');

// move to JADE
var HTML = '<html><body> \
 <style type = "text/css" scoped> \
.myButton {  \
	background-color:#1FBAD6;  \
	-moz-border-radius:28px;  \
	-webkit-border-radius:28px;  \
	border-radius:28px;  \
	border:1px solid #18ab29;  \
	display:inline-block;  \
	cursor:pointer;  \
	color:#ffffff;  \
	font-family:Arial;  \
	font-size:17px;  \
	padding:16px 31px;  \
	text-decoration:none;  \
	text-shadow:0px 1px 0px #2f6627;  \
} \
.myButton:hover { \
	background-color:#00000; \
} \
.myButton:active { \
	position:relative; \
	top:1px; \
} \
</style> \
<h1>Uber Hack</h1><form action="/%s"> \
<hr /> \
<input class="myButton" type="submit" value="%s"/></form> \
</body></html> ';

var apiKey = 'AIzaSyABEIzHv9mFrTE8RSV4EOgWIFpcGqn81II';
var device_id = 'APA91bFqLp1Cbd7z_Xrl853g4jPBIrqTLsXIVQcUYwmwjgGRhVJ_89edKjbdvY6Jh5RY8cZXVpCyKsQp0O3hIhqfPnjjEbFnDLYkFMPq55JWAH_AhPvOIzGZlQR2BJGpz6iygoXl42ef';

var gcm = new GCM(apiKey);

router.get('/track', function(req, res) {
   service.getTrackInfo(function(error, response) {
       if (!error) {
           res.send(response);
       } else {
           var response = {};
           response.lat = 0.0;
		   response.long = 0.0;
           res.send(response);
       }
   });
})

router.get('/', function(req, res) {
	uberBook.requestCurrent(function(error, currentResponse){
		var htmlRes = 'Houston, we have problem!';
		if(!error) {
			console.log(currentResponse)
			htmlRes = util.format(HTML, 'finish', 'Finish the ride')
		} else {
			htmlRes = util.format(HTML, 'book', 'Book a cab')
		}
		res.send(htmlRes)
	})
}) 

router.get('/book', function(req, res) {
	uberBook.bookCab(function(error, bookResponse){
		var htmlRes = 'Houston, we have problem!';
		if(!error) {
			htmlRes = util.format(HTML, 'inprogress', 'Start the ride')
		} else {
			htmlRes = util.format(HTML, 'book', 'Book a cab')
		}
		res.send(htmlRes)
	});
}) 

router.get('/inprogress', function(req, res) {
	uberBook.requestCurrent(function(error, currentResponse){
		var htmlRes = 'Houston, we have problem!';
		if(!error) {
			var queryForStatusChange = {
	            request_id : currentResponse.request_id,
	            status : 'accepted'
        	}
	        uberBook.changeStatus(queryForStatusChange, function(error, acceptedResponse) {
	            console.log('Change status done');
	            queryForStatusChange.status = 'in_progress';
	            uberBook.changeStatus(queryForStatusChange, function(error, bookResponse){
					if(!error) {
						sendNotification('trip-started', 
							uberBook.query.pick.lat, 
							uberBook.query.pick.lon);
						htmlRes = util.format(HTML, 'finish', 'Finish the ride')
					} else {
						htmlRes = util.format(HTML, 'book', 'Book a cab')
					}
					res.send(htmlRes)
				});
	        })
		} else {
			res.send(htmlRes)
		}
	})
}) 

router.get('/finish', function(req, res) {
	uberBook.requestCurrent(function(error, currentResponse){
		var htmlRes = 'Houston, we have problem!';
		if(!error) {
			var queryForStatusChange = {
	            request_id : currentResponse.request_id,
	            status : 'completed'
        	}
	        uberBook.changeStatus(queryForStatusChange, function(error, acceptedResponse) {
	        	if(!error) {
	        		sendNotification('trip-finished')
	        		htmlRes = util.format(HTML, 'book', 'Book a cab')
					db.activate_all(function(err, response) {
					});
				} else {
					htmlRes = util.format(HTML, 'finish', 'Finish the ride')
				}
				res.send(htmlRes)
	        })
		} else {
			res.send(htmlRes)
		}
	})
})


var sendNotification = function(eventName, lat, long) {
	var message = {
	    registration_id: device_id, // required
	    collapse_key: 'Collapse key', 
	    'data.event': eventName,
	    'data.lat': lat,
	    'data.long': long
	};

	gcm.send(message, function(err, messageId) {
	    if (err) {
	        console.log("Something has gone wrong!" + err);
	    } else {
	        console.log("Sent with message ID: ", messageId);
	    }
	});
}

module.exports = router;
