/**
 * 各种小方法，尽管我写的傻
 * github: https://github.com/highsea/ScrApiCompanyNew
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */

//var database = require('./../db/userlist_comment_article.js'),
var database = require('./../db/mysql_db.js'),
    config = require('./../db/config');



/*
@  总用户数量
@  
@
*/
function userCount (){
    database
}



//方法 用户名 密码 type 验证--用于 更新用户 新建用户
function add_update_verify(req, res, callback){
    var r = req.query;
    if (!r.user||r.user==''||!r.password||r.password==''||!r.type||r.type=='') {
        //||!r.id||r.id==''
        jsonTips(req, res, 2010, config.Code2X[2010], '');

    }else{
        callback();
    }
}

//方法 jsonp 提示 接口生成

function jsonTips(req, res, code, message, data){

    var str = {
        code : code,
        message : message,
        data : data
    }
    if (req.query.callback) {  
        str =  req.query.callback + '(' + JSON.stringify(str) + ')';
        res.end(str);  
    } else {  
        res.end(JSON.stringify(str));
    } 

}

/*
@ 通过 name 查询 该用户的所有信息
@ callback(result)
@ [{length:1}] 包含所有字段
*/
function userinfo (req, res, name, cb){


    database.userlist.find({name:name}, function(error, result){
        if (error) {
            console.log(error);
            friendlyError(req, res, error);
        }else if(result==''){
            // friendlyError(req, res, config.Code4X[4015]);
            jsonTips(req, res, 4015, config.Code4X[4015], '');
        }else{
            cb(result);
        }

    })



}

/*
@ 时间
@
*/

function nowUnix(){
    return Math.round(new Date().getTime()/1000);
}

function dayAgo(n){
    //var nowUnix = ;
    return nowUnix()-3600*24*n
}


/*
@ 自定义的友好错误提示页面 渲染
@ text (String)
*/
function friendlyError(req, res, text){
    res.render('friendly-error', {
        title: config.productInfo.friendlyError.title,
        text: text
    })
}


exports.add_update_verify 	= add_update_verify;
//exports.login_verify  		= login_verify;
exports.jsonTips 			= jsonTips;
//exports.json_api 			= json_api;
//exports.add_update_menu 	= add_update_menu;
exports.userinfo            = userinfo;
exports.friendlyError       = friendlyError;
exports.dayAgo              = dayAgo;
exports.nowUnix             = nowUnix;


