/**
 * 各种小方法，尽管我写的傻
 * github: https://github.com/highsea/ScrApiCompanyNew
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */

//var database = require('./../db/userlist_comment_article.js'),
var database = require('./../db/mysql_db.js'),
    config = require('./../db/config');

var jsSHA = require('jssha');
var utility = require('utility');

/*
@  总用户数量
@  
@
*/
/*function userCount (){
    database
}
*/

function verifyAdmin(req, res, callback){
    var session = {
        name : req.session.username,
        level : req.session.type,
    }

    if (session.name&&session.level=="8") {
        
        callback();
        
    }else{
        //前端ajax设置 当 code＝2004 则跳转到登录页
        jsonTips(req, res, 2004, config.Code2X[2004], null)
    }
}


//方法 用户名 密码 type 验证--用于 更新用户 新建用户
/*function add_update_verify(req, res, callback){
    var r = req.query;
    if (!r.user||r.user==''||!r.password||r.password==''||!r.type||r.type=='') {
        //||!r.id||r.id==''
        jsonTips(req, res, 2010, config.Code2X[2010], '');

    }else{
        callback();
    }
}
*/
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

function toUnix(t){
    return Math.round(new Date(t).getTime()/1000);
}

function dayAgo(n){
    //var nowUnix = ;
    return nowUnix()-3600*24*n
}

/*
@ 验证 数字 
@
*/

function isDigit (s){
    var patrn=/^[0-9]{1,20}$/;
    if (!patrn.exec(s)) return false
    return true
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


/*
@  微信 加密 sha1
@
@
*/

var createNonceStr = function () {
  return Math.random().toString(36).substr(2, 15);
};

var createTimestamp = function () {
  return parseInt(new Date().getTime() / 1000) + '';
};

var raw = function (args) {
  var keys = Object.keys(args);
  keys = keys.sort()
  var newArgs = {};
  keys.forEach(function (key) {
    newArgs[key.toLowerCase()] = args[key];
  });

  var string = '';
  for (var k in newArgs) {
    string += '&' + k + '=' + newArgs[k];
  }
  string = string.substr(1);
  return string;
};

/**
* @synopsis 签名算法 
*
* @param jsapi_ticket 用于签名的 jsapi_ticket
* @param url 用于签名的 url ，注意必须动态获取，不能 hardcode
*
* @returns
*/
var sign = function (jsapi_ticket, url) {
  var ret = {
    jsapi_ticket: jsapi_ticket,
    nonceStr: createNonceStr(),
    timestamp: createTimestamp(),
    url: url
  };
  var string = raw(ret);
      
  var shaObj = new jsSHA(string, 'TEXT');
  ret.signature = shaObj.getHash('SHA-1', 'HEX');

  return ret;
};




/**
 * 系统非常规MD5加密方法
 * @param  string $str 要加密的字符串
 * @return string 
 */


function passwordMD5(str, key){
    // shaObj 对象存有多种SHA加密值： SHA-512  SHA-1  SHA-224, SHA-256, SHA-384 
    var strMd5 = utility.md5(str);
    //console.log('strMd5:'+strMd5);
    var shaObj = new jsSHA(strMd5, 'TEXT');
    //console.log("SHA-1 : "+shaObj.getHash('SHA-1', 'HEX'));

    return '' === str ? '' : utility.md5(shaObj.getHash('SHA-1', 'HEX') + key);
}

/**
 * 系统非常规MD5加密方法
 * @param  string $str 要加密的字符串
 * @return string php源码
 */
/*if ( ! function_exists('think_ucenter_md5')){
    function think_ucenter_md5($str, $key = 'yA0WangO(∩_∩)O~'){
        return '' === $str ? '' : md5(sha1($str) . $key);
    }
}*/

/*
@  文件上传
@
*/
function uploadHtml(req, res, resultPic, username){
    res.render('upload', {
        title : config.productInfo.up,
        resultpic: resultPic,
        username : username,
    })
}



exports.toUnix              = toUnix;
exports.sign                = sign;
exports.passwordMD5         = passwordMD5;
//exports.add_update_verify 	= add_update_verify;
//exports.login_verify  		= login_verify;
exports.jsonTips 			= jsonTips;
//exports.json_api 			= json_api;
//exports.add_update_menu 	= add_update_menu;
exports.userinfo            = userinfo;
exports.friendlyError       = friendlyError;
exports.dayAgo              = dayAgo;
exports.nowUnix             = nowUnix;
exports.isDigit             = isDigit;
exports.verifyAdmin         = verifyAdmin;
exports.uploadHtml          = uploadHtml;



