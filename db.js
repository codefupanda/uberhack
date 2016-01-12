var mysql = require("mysql");
var util = require("util");

// First you need to create a connection to the db
var pool = mysql.createPool({
    connectionLimit : 10,
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'uber_hack'
});

var select_query = 'SELECT id, loc FROM location where status <> 0 order by id limit 1';
//var insert_query = 'INSERT INTO booking_requests (user_id, status, company_id, created_at) VALUES (%d, 1, %d, now())';
var update_query = 'UPDATE location set status = 0 where id = %d';

module.exports.get_active_location = function(callback) {
    console.log("In get_active_location");

    pool.getConnection(function (err, connection) {
        var selectQuery = select_query;
        connection.query(selectQuery, function(err, rows) {
            connection.release();
            if(!err) {
                console.log('Data received from Db:');
                console.log(rows);
                callback(null, rows);
            } else {
                console.log('Something went wrong while updating data, error ' + err);
                callback(true, err);
            }
        });
    });
};

module.exports.expire_location = function(id, callback) {
    console.log("In expire_location for id : ", id);

    pool.getConnection(function (err, connection) {
        var updateQuery = util.format(update_query, id);
        connection.query(updateQuery, function(err,rows){
            connection.release();
            if(!err) {
                console.log('Data received from Db:\n');
                console.log(rows);
                callback(null, rows);
            } else {
                console.log('Something went wrong while updating data, error ' + err);
                callback(true, err)
            }
        });
    });
};

/**
 * Listen to SIGINT and close the connection poll.
 * Exit the process once poll end returns
 */
process.on('SIGINT', function () {
    console.log('Process is exiting, clearing pool');
    pool.end(function(err) {
        if(!err) {
            console.log('Successfully closed the connection poll.');
        } else {
            console.log('!!!!!!!! Error trying to close connection poll !!!!!!!!');
        }
        process.exit();
    });
});
