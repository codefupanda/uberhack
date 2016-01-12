var express = require('express');
var router = express.Router();

var request = require('request');
var async = require('async');
var url = require('url');
var util = require('util');
var _ = require('underscore');

var uberBook = require('../uber_book');
var service = require('../service');
var db = require('../db');

// move to JADE
var HTML = '<html><body><h1>Uber Hack</h1><form action="/%s"><input type="submit" value="%s"/></form></body></html>';

router.get('/track', function(req, res) {
   service.getTrackInfo(function(error, response) {
       if (!error) {
           res.send(response);
       } else {
           var response = {};
           response.error = "error";
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

module.exports = router;
