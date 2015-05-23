/*var mysql = require('mysql');
var conn = mysql.createConnection({
    host: 'hdm-144.hichina.com',
    user: 'hdm1440387',
    password: 'Highsea301',
    database:'hdm1440387_db',
    port: 3306
});*/

    
var fun = require('./../routes/function');


/*
@ mdb 数据库链接
@ callback 回调
*/
function mdb(callback){

	var mysql = require('mysql');
	var connection = mysql.createConnection({
	    host: '127.0.0.1',
	    user: 'root',
	    password: '',
	    database:'xiaojiaoyar',
	    port: 3306,
	});

	if (typeof(callback)=='function') {
		connection.connect();

		callback(connection);

		connection.end();

	};
}


/*
@ 封装 查询
@ 查询语句 sql 
@ 错误 friendlyError
@ error ： will be an Error if one occurred during the query 
@ results ： will contain the results of the query 
@ fields ： will contain information about the returned results fields (if any) 
*/
function query (sql, callback) {
	console.log(sql);
	mdb(function (con) {
        
        con.query(sql, function(err, rows, fields) {
            if (err) {
            	throw err;
            	fun.friendlyError(req, res, err);
            }else{
            	callback(rows);
            }
            
        });

    })
}


exports.mdb = mdb;
exports.query = query;


