/**
 * Routes for 会员增删改查登录注册
 * github: https://github.com/highsea/hi-blog
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */
var db = require('./../db/mysql_db.js'),
    //database = require('./../db/userlist_comment_article')
    fun = require('./function'),
    nodemailer = require('nodemailer'),
    formidable = require('formidable'),
    fs = require('fs'),
    config = require('./../db/config'),
    utility = require('utility');

var appsetFile = ['./db/appset-', '.json'].join('');// new Date()-0,
//var JsonObj = JSON.parse(fs.readFileSync(appsetFile));


var transporter = nodemailer.createTransport({
    service: '163',
    auth: {
        user: config.emailArr.user,
        pass: config.emailArr.pass,
    }
});

var picPATH = config.productInfo.picupload;

// string.trim() 前台处理

/*
@ 首页 登录页
@ 相关接口： homepost （以页面跳转方式）
*/

//增加管理员
//INSERT INTO `xiaojiaoyar`.`lf_users` (`user_id`, `level`, `mobile`, `passwd`, `sex`, `nickname`, `sign`, `province`, `city`, `avatar`, `single`, `status`, `last_time`, `last_ip`, `grade`, `score`, `reg_ip`, `flag`, `platform`, `ctime`, `mtime`, `token`) VALUES ('1515810', '8', '', '123456', '0', 'highsea', '', '', '', '', '', '1', '0', '', '0', '0', '', '0', '0', '0', '0', '')
//INSERT INTO `xiaojiaoyar`.`lf_users` (`user_id`, `level`, `passwd`, `nickname`) VALUES ('1515810', '8', '123456', 'highsea')
//INSERT INTO `xiaojiaoyar`.`lf_users` (`user_id`, `level`, `passwd`, `nickname`) VALUES ('201505', '8', '123456', 'xiaojiaoyar')


exports.index = function(req, res){
    //分页
    /*var search  ={};
    var page    ={limit:5,num:1,size:20};

    //查看哪页
    if(fun.isDigit(req.query.p)){
        page['num']= req.query.p < 1 ? 1 : req.query.p;
    }
    //每页多少条
    if (req.query.size) {
        page['size']= req.query.size<1 ? 1 : req.query.size;
    };

    if (req.session.userCount) {
        var userNum = req.session.userCount;
        console.log('session用户数：'+userNum);
    }else{
        db.query(config.mysqlText['users'], function (rows) {
            
            rows = rows[0]['count(*)'];
            req.session.userCount = rows;
            var userNum = rows;
            console.log('用户数：'+userNum);

        })
    }

    db.query(config.mysqlText['message'], function (rows) {
        rows = rows[0]['count(*)'];
        console.log('消息总条数：'+rows);
        page['allnews'] = rows;
        page['pageCount'] = Math.ceil(rows/page['size']);//ceil向上取整 round四舍五入  floor向下取整
        page['numberOf']    = page['pageCount']>5?5:page['pageCount'];
    })*/

    //var sql = 'select * from lf_message where status=1 and msg_id>=(select msg_id from lf_message limit 1000000, 1) order by ctime desc limit '+page['size'];
    //var sql = 'select * from lf_message where status="1" order by ctime desc limit '+(page['num']-1)*page['size']+', '+page['size'];//20,20//40
    //console.log(sql);

    //db.query(sql, function(rows) {

        if(req.session.isVisit) {
            req.session.isVisit++;
            
        } else {
            req.session.isVisit = 1;
            
        }

        res.render('index', {
            title   : config.productInfo.name ,
            result  : 0,//未登录
            //living  : config.dbtext['wz'],//在线人数
            visit   : req.session.isVisit,// 你访问了多少次
            //rows    : rows,// message
            //usernum : userNum,//注册总人数
            //page    : page,
        });
    //})

};


/*
@ 登录页 
@ 
*/
exports.login = function(req, res){
    if (req.session.username) {
        res.redirect('/home');
        console.log(req.session.username);
        
    }else{
        res.render('login', {
            title: config.productInfo.login,
            result:0,
        })
    }

};

/*
@  passwordMD5 加密测试
@  http://localhost:3000/passwordMD5?pass=123456
*/
exports.passwordMD5 = function(req, res){
    if (req.query.pass) {
        var key = config.productInfo.key;
        var result = fun.passwordMD5(req.query.pass, key);

        fun.jsonTips(req, res, 2000, config.Code2X[2000], result);

    }else{

        fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
    }
}


/*
@ 直接输入 主页
@ 从 session 判断是否登录
@ 以页面跳转方式，无 jsonp 接口
*/
exports.homeget = function(req, res) {
    //判断是否登录
    var name = req.session.username;
    var sql = {
        thisUser_id    : 'select * from lf_users where user_id="'+name+'"',
        thisUser_nickname    : 'select * from lf_users where nickname="'+name+'"',

    };

    if (name) {
        // 用昵称登录 new
        db.query(sql['thisUser_nickname'], function(userList){

            if (userList.length) {

                //console.log(userList);
                req.session.userinfo = userList[0];  

                res.render('home', {
                    title       : name+config.productInfo.home,
                    username    : name,
                    result      : req.session.result,
                    info        : req.session.userinfo,
                }); 

            }else{
                //用 id登录 older
                db.query(sql['thisUser_id'], function(uList){
                    req.session.userinfo = uList[0];  

                    res.render('home', {
                        title       : name+config.productInfo.home,
                        username    : name,
                        result      : req.session.result,
                        info        : req.session.userinfo,
                    }); 

                })
            }

        })


        
        
    }else{
        res.redirect('/');
    }
}

/*
@ message jsonp 接口[赞、评论 数据封装见相应接口 mup  mcomment]
@ 请求参数 time mark order | p(分页，当前页) size(默认20) 值见 sql 对象
@ jsonp  code message data
@ 权限： 必须登录后的用户才接受请求 http://localhost:3000/message?callback=dataList&time=m1&sta=show&order=read&mark=tp&p=1&size=10&feed=type&value=5
*/
exports.message = function (req, res) {
    var doc = {
        time: 'w1', 
        mark: 'tp', 
        order: 'time', 
        sta: 'showall',
        feed : 'all',
        value : '0',
    };
    var page = {currentp:1,size:20};

    //查看哪页
    if(fun.isDigit(req.query.p)){
        page['currentp']= req.query.p < 1 ? 1 : req.query.p;
    }
    //每页多少条
    if (fun.isDigit(req.query.size)) {
        page['size']= req.query.size<1 ? 1 : req.query.size;
    };

    var name = req.session.username;

    if (name) {

        if (req.query.value) {
            doc['value'] = req.query.value;
        };

        var sql = {
            thisUser    : 'select * from lf_users where user_id="'+name+'"',
            //时间 time
            d3          : fun.dayAgo(3),//3天前
            w1          : fun.dayAgo(7),//一周前
            w2          : fun.dayAgo(14),//2周前
            m1          : fun.dayAgo(30),//
            m2          : fun.dayAgo(60),//
            m6          : fun.dayAgo(180),// 6个月
            //'select * from lf_message where ctime>="'+day14agoUnix+'" order by ctime desc limit 100000',
            //标签 mark
            p1          : " and lf_message.message='' ",// 单图
            mp          : '',//多图
            tp          : " and lf_message.message!='' ",//图文
            all         : '',// all
            //排序 order
            time        : 'lf_message.ctime', // 默认时间排序
            up          : 'lf_message.up_count', // 赞
            comment     : 'lf_message.comment_count', // 回复
            read        : 'lf_message.read_count',// 阅读
            //显示（垃圾） sta
            del         : ' and lf_message.status = 2',//不显示的
            show        : ' and lf_message.status = 1',//显示的
            showall     : '',//都要
            good        : ' and lf_message.order_count!=0',//推荐的 
            // 显示 分类 feed 
            all         : ' and lf_message.feedtype!="" ',
            type        : ' and lf_message.feedtype="'+doc['value']+'" ',

        };

        //防止 query的参数不在 sql 对象中（ undefined ）, 如果 undefined 则为默认值
        if (sql[req.query.time]) {
            doc['time'] = req.query.time;//3d 1w 2w
        }
        if(sql[req.query.mark]){
            doc['mark'] = req.query.mark;//1p(one picture) mp(many picture) tp(text picture)
        }
        if(sql[req.query.order]){
            doc['order'] = req.query.order;//t(time) h(hot) {up, comment , read }
        }
        // else if() 不能超过3个？？？？ 大坑！！！！
        if (sql[req.query.sta]) {
            doc['sta'] = req.query.sta;//0 1 a
        };
        if (sql[req.query.feed]) {
            doc['feed'] = req.query.feed;
        };

        //console.log('req.query.order'+req.query.order+"---doc['order'] :"+doc['order'] );

        // var day3fomat = new Date(sql['d3']*1000).toLocaleString();
        // console.log('day3fomat:'+day3fomat+';day3agoUnix:'+sql['d3']);
        var totalSQL   = 'select count(*) from lf_message where lf_message.ctime>='+sql[doc['time']]+sql[doc['sta']]+sql[doc['mark']]+sql[doc['feed']];

        var messageSQL = 'select lf_users.user_id,lf_users.sex,lf_users.nickname,lf_users.avatar,lf_message.msg_id,lf_message.user_id,lf_message.message,lf_message.photo,lf_message.location,lf_message.up_count,lf_message.comment_count,lf_message.read_count,lf_message.order_count,lf_message.status,lf_message.feedtype,lf_message.ctime,lf_message.examine_admin,lf_message.examine_time,lf_feed_type.name from lf_users,lf_message,lf_feed_type where lf_users.user_id=lf_message.user_id and lf_message.feedtype=lf_feed_type.type and lf_message.ctime>='+sql[doc['time']]+sql[doc['sta']]+sql[doc['feed']]+sql[doc['mark']]+' order by '+sql[doc['order']]+' desc limit '+(page['currentp']-1)*page['size']+', '+page['size'];
        //select * from lf_message where ctime>=1431739693 and message=''  order by ctime desc limit 100000

        //分页－－查询总条数
        db.query(totalSQL, function(rowsCount){

            rowsCount = rowsCount[0]['count(*)'];
            console.log('消息总条数：'+rowsCount);
            page['allnews'] = rowsCount;
            page['pageCount'] = Math.ceil(rowsCount/page['size']);//ceil向上取整 round四舍五入  floor向下取整
            //page['numberOf']    = page['pageCount']>5?5:page['pageCount'];
            
            // 输出 message 查询结果
            db.query(messageSQL, function (messageList) {


                var data = {
                    length : messageList.length,
                    page : page,
                    list : messageList,
                };
                fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
            })


        })

        

    }else{
        fun.friendlyError(req, res, config.Code2X[2003]);
    }
        
}


/*
@  单条评论查询
@
@  http://localhost:3000/onecomment?callback=dataList&msgid=673
*/

exports.onecomment = function(req, res){

    fun.verifyAdmin(req, res, function(){
        if (req.query.msgid) {
            var sql = 'select lf_message_comment.id,lf_message_comment.status,lf_message_comment.msg_id,lf_message_comment.user_id,lf_message_comment.user_id_b,lf_message_comment.message,lf_message_comment.ctime,lf_message_comment.is_read,lf_users.user_id,lf_users.level,lf_users.mobile,lf_users.sex,lf_users.nickname,lf_users.avatar from lf_users,lf_message_comment where lf_users.user_id=lf_message_comment.user_id and lf_message_comment.msg_id = "'+req.query.msgid+'" order by lf_message_comment.ctime desc';

            db.query(sql, function(dataList){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);
            })

        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }
    })
}

/*
@  单条评论查询
@
@
*/

exports.oneup = function(req, res){

    fun.verifyAdmin(req, res, function(){
        if (req.query.msgid) {
            var sql = 'select lf_message_up.id,lf_message_up.msg_id,lf_message_up.user_id,lf_message_up.ctime,lf_users.user_id,lf_users.level,lf_users.mobile,lf_users.sex,lf_users.nickname,lf_users.avatar from lf_users,lf_message_up where lf_users.user_id=lf_message_up.user_id and lf_message_up.msg_id = "'+req.query.msgid+'" order by lf_message_up.ctime desc';

            db.query(sql, function(dataList){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);
            })

        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }
    })
}



/*
@ mcomment jsonp  评论接口
@ 相关参数  msg（all filter）id（Num） time ，主要用于前端对 message 的补充
@ jsonp  code message data
@ 权限：登录用户 http://localhost:3000/mcomment?msg=filter&id=668&time=w1
@              http://localhost:3000/mcomment?msg=del&time=m1
*/


// 增加2 新建一个字段 status 区别评论回收站
//alter table lf_message_comment add status int(11) NOT NULL DEFAULT '1' after id;
//alter table `lf_message_comment` drop column status; 

exports.mcomment = function (req, res) {

    var name = req.session.username;
    var doc ={
        msg     : 'all',
        //id      : '',
        time: 'w1', 

    };

    if (name) {

        var sql={
            //评论过滤 针对id筛选
            all         : '',
            filter      : 'filter',
            del         : 'lf_message_comment.status="0" and',
            //过滤没有被放回收站的
            ready       : 'lf_message_comment.status="1" and',
            //时间筛选
            d3          : fun.dayAgo(3),//3天前
            w1          : fun.dayAgo(7),//一周前
            w2          : fun.dayAgo(14),//2周前
            m1          : fun.dayAgo(30),//
            m2          : fun.dayAgo(60),//
            m6          : fun.dayAgo(180),// 6个月

        }

        //console.log('req.query.msg:'+req.query.msg);
        //filter
        //防止 query的参数不在 sql 对象中（ undefined ）, 如果 undefined 则为默认值
        if (sql[req.query.time]) {
            doc['time'] = req.query.time;//3d 1w 2w
        }

        if (sql[req.query.msg]) {
            doc['msg'] = req.query.msg;

            console.log("doc['msg']:"+doc['msg']);

            if (req.query.id&&doc['msg']=='filter') {
                sql['filter'] = 'lf_message_comment.msg_id="'+req.query.id + '" and ';
            };
        };

        //console.log("sql[doc['msg']]: "+sql[doc['msg']]);
        //若是 被删除的评论 则再选出 删除时间和删除人
        var commentSQL = 'select lf_message_comment.id,lf_message_comment.msg_id,lf_message_comment.user_id,lf_message_comment.status,lf_message_comment.user_id_b,lf_message_comment.message,lf_message_comment.ctime,lf_message_comment.is_read,lf_users.user_id,lf_users.nickname,lf_users.sex,lf_users.avatar from lf_users,lf_message_comment where '+sql[doc['msg']]+' lf_users.user_id=lf_message_comment.user_id and lf_message_comment.ctime>='+sql[doc['time']]+' order by lf_message_comment.ctime desc limit 10000';
        //每次查询1w条，前期不做分页 
        db.query(commentSQL, function (commentList) {

            var data = {
                length : commentList.length,
                list : commentList,
            };

            fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
            
        })

    }else{

        fun.friendlyError(req, res, config.Code2X[2003]);

    }
    
}



/*
@ mup jsonp  点赞查询接口
@ 相关参数  msg（all filter）id（Num） time ，主要用于前端对 message 的补充
@ jsonp  code message data
@ 权限：登录用户 http://localhost:3000/mup?msg=filter&id=668&time=w1
*/

exports.mup = function (req, res) {

    var name = req.session.username;
    var doc ={
        msg     : 'all',
        //id      : '',
        time: 'w1', 

    };

    if (name) {

        var sql={
            //赞过滤
            all     : '',
            filter  : 'filter',
            //时间
            d3          : fun.dayAgo(3),//3天前
            w1          : fun.dayAgo(7),//一周前
            w2          : fun.dayAgo(14),//2周前
            m1          : fun.dayAgo(30),//
            m2          : fun.dayAgo(60),//
            m6          : fun.dayAgo(180),// 6个月
        }
        //防止 query的参数不在 sql 对象中（ undefined ）, 如果 undefined 则为默认值
        if (sql[req.query.time]) {
            doc['time'] = req.query.time;//3d 1w 2w
        }

        if (sql[req.query.msg]) {
            doc['msg'] = req.query.msg;

            if (req.query.id&&doc['msg']=='filter') {
                sql['filter'] = 'lf_message_up.msg_id="'+req.query.id + '" and ';
            };
        };

        var mupSQL = 'select lf_message_up.msg_id,lf_message_up.user_id,lf_message_up.ctime,lf_users.user_id,lf_users.nickname,lf_users.sex,lf_users.avatar from lf_users,lf_message_up where '+sql[doc['msg']]+' lf_users.user_id=lf_message_up.user_id and lf_message_up.ctime>='+sql[doc['time']]+' order by lf_message_up.ctime desc limit 10000';
        //每次查询1w条，前期不做分页 
        db.query(mupSQL, function (mupList) {

            var data = {
                length  : mupList.length,
                list    : mupList,
            };
            fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
        })

    }else{
        fun.friendlyError(req, res, config.Code2X[2003]);
    }
}


/*
@ 动态回收站 Recycle Message API
@ 相关参数 id（msg_id） value （1 显示 2 回收站）| 自动记录 放回收站的管理员id以及放入时间
@ jsonp
@ 需要验证 1.登录 2.管理员  http://localhost:3000/recycleMessage?id=193&value=1
*/
/*
// 增加3 新建一个字段 examine_time (最后审核时间) examine_admin (最后审核的管理员id)
//alter table lf_message add examine_time int(13) NOT NULL DEFAULT '0' after ctime;
//alter table `lf_message` drop column examine_time; 

//alter table lf_message add examine_admin varchar(15) NOT NULL DEFAULT 'unknow' after ctime;
//alter table `lf_message` drop column examine_admin; 
*/

exports.recycleMessage = function(req, res){
    var name = req.session.username,
        type = req.session.type;
    var doc = {
        id          : '0',
        value       : '0'
        //id      : '',
        //time: 'w1', 
    };
    if (name&&type==8) {

        if (fun.isDigit(req.query.id)) {
            doc['id'] = req.query.id;
            if (req.query.value) {
                doc['value'] = req.query.value;
                var updateSQL = "update lf_message set status = '"+doc['value']+"',examine_admin='"+name+"',examine_time='"+ fun.nowUnix() +"' WHERE lf_message.msg_id = '"+doc['id']+"'";
                db.query(updateSQL, function (result) {
                    //console.log(fun.nowUnix());
                    fun.jsonTips(req, res, 2000, 'msg_id:'+doc['id']+',value:'+doc['value'], result);
                })
            }else{
                fun.jsonTips(req, res, 1023, config.Code1X[1023], null);
            }
        }else{
            fun.jsonTips(req, res, 1021, config.Code1X[1021], null);
        }


    }else{
        var text = config.Code4X[2004];
        fun.friendlyError(req, res, text); 
    }
}



/*
@  取消推荐，但是分类不改变
@
@  http://localhost:3000/ordernull?msgid=672
*/

exports.ordernull = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        if (req.query.msgid) {
            var sql = 'update lf_message set order_count = "0" where msg_id = "'+req.query.msgid+'"';
            db.query(sql, function(result){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], result);
            })

        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })
}


/*
@ 消息设置分类并推荐 order_count feedtype Message API
@ 相关参数 id（msg_id） value （int 越大越靠前）| 自动记录推荐的管理员id以及推荐时间
@ jsonp
@ 需要验证 1.登录 2.管理员  http://localhost:3000/goodMessage?id=193&value=1
*/
exports.goodMessage = function(req, res){
    var name = req.session.username,
        type = req.session.type;
    var doc ={
        id          : '0',
        value       : '0'
        //id      : '',
        //time: 'w1', 
    };
    if (name&&type==8) {

        if (fun.isDigit(req.query.id)) {
            doc['id'] = req.query.id;
            if (req.query.value) {
                doc['value'] = req.query.value;
                var checkOther = "select order_count from lf_message order by order_count desc";

                db.query(checkOther, function(order){

                    var thisNumOrder = order[0].order_count+1;

                    var updateSQL = "update lf_message set order_count='"+thisNumOrder+"',feedtype='"+doc['value']+"',examine_admin='"+name+"',examine_time='"+ fun.nowUnix() +"' WHERE lf_message.msg_id = '"+doc['id']+"'";
                    //fun.jsonTips(req, res, 2000, config.Code2X[2000], order[0]);
                    db.query(updateSQL, function (result) {
                        //console.log(fun.nowUnix());
                        fun.jsonTips(req, res, 2000, 'msg_id:'+doc['id']+',value:'+doc['value'], result);
                    })

                })

                
            }else{
                fun.jsonTips(req, res, 1023, config.Code1X[1023], null);
            }
        }else{
            fun.jsonTips(req, res, 1021, config.Code1X[1021], null);
        }


    }else{
        var text = config.Code4X[2004];
        fun.friendlyError(req, res, text); 
    }
}


/*
@ 设置评论状态 lf_message_comment type API
@ 相关参数 id（msg_id） value （int 0:回收站 1:正常）| 自动记录推荐的管理员id以及推荐时间
@ jsonp
@ 需要验证 1.登录 2.管理员  http://localhost:3000/setComment?id=1470&value=0
*/


// 增加4 新建一个字段 examine_time (最后审核时间) examine_admin (最后审核的管理员id)
//alter table lf_message_comment add examine_time int(13) NOT NULL DEFAULT '0' after ctime;
//alter table `lf_message_comment` drop column examine_time; 

//alter table lf_message_comment add examine_admin varchar(15) NOT NULL DEFAULT 'unknow' after ctime;
//alter table `lf_message_comment` drop column examine_admin; 

exports.setComment = function(req, res){
    var name = req.session.username,
        type = req.session.type;
    var doc ={
        id          : '0',
        value       : '0'
        //id      : '',
        //time: 'w1', 
    };
    if (name&&type==8) {

        if (fun.isDigit(req.query.id)) {
            doc['id'] = req.query.id;
            if (req.query.value) {
                doc['value'] = req.query.value;
                var updateSQL = "update lf_message_comment set status = '"+doc['value']+"',examine_admin='"+name+"',examine_time='"+ fun.nowUnix() +"' WHERE lf_message_comment.id = '"+doc['id']+"'";
                db.query(updateSQL, function (result) {
                    //console.log(fun.nowUnix());
                    fun.jsonTips(req, res, 2000, 'msg_id:'+doc['id']+',value:'+doc['value'], result);
                })
            }else{
                fun.jsonTips(req, res, 1023, config.Code1X[1023], null);
            }
        }else{
            fun.jsonTips(req, res, 1021, config.Code1X[1021], null);
        }

    }else{
        var text = config.Code4X[2004];
        fun.friendlyError(req, res, text); 
    }
}




/*
@ 判断登录是否成功 首页登录页（合并） 
@ POST 即 首页（登录页）填写用户名密码后 表单 submit 后
@ 以页面跳转方式，无 jsonp 接口
*/
exports.homepost = function(req, res){
    var query = {name: req.body.user, password: req.body.password};

    if(query.name==''||query.password==''){
        var text = config.Code4X[1002];
        fun.friendlyError(req, res, text);
    }else{
        //先查询 是否有此 用户名
        //扩展： 手机号、邮箱、用户名 任意登录
        // 增加1 新建一个字段 type 区别管理员
        //alter table lf_users add type int(11) NOT NULL DEFAULT '1' after user_id;
        //alter table `lf_users` drop column type;  
        //修改 type 为 level
        //alter table lf_users CHANGE type level int;
        var sql  = 'select * from lf_users where user_id="'+query.name+'" and passwd="'+query.password+'"';

        db.query(sql, function(rows){   
            if (rows.length=='1') {
                console.log(rows);
                req.session.username = query.name;
                req.session.result = 1;
                req.session.type = rows[0].level;
                //可以避免 刷新页面时提示 是否重复提交（登录数据）
                res.redirect('/home');
            }else{
                console.log(rows);
                var text = config.Code4X[4002];
                fun.friendlyError(req, res, text);
            }
        });
    }
}


/*
@ 用户登出 离线
@ 清除 session 无对应接口
*/
exports.logout = function(req, res){

    //更新离线
    // database.userlist.update({name:req.session.username}, {living:0}, function(err, result){
    //     console.log('离线：'+result);
    // });

    req.session.username = null;
    req.session.result = null;
    req.session.type = null;
    res.redirect('/');

};

/*
@ 模糊查询
@
@
*/
exports.lookmsg = function(req, res){

    var name = req.session.username,
        type = req.session.type;
    var doc ={
        value       : '',
        stype        : 'msgid',
    };
    if (name&&type==8) {

        var sql = {
            //stype
            'msgid' : '123',
            'text'  : 'nothing',
        }

        console.log(req.query.stype);

        if (sql[req.query.stype]) {
            doc['stype']=req.query.stype;
            // msgid 对 id的 精确查询 
            if (doc['stype']=='msgid') {
                //如果查询是 msgid 那么必须是 int
                if (fun.isDigit(req.query.value)) {
                    sql['msgid'] = ' and msg_id='+req.query.value;
                }

            }
            // text 对 message 的模糊查询
            if (doc['stype']=='text') {
                if (req.query.value) {
                    sql['text'] = ' and message LIKE "%'+req.query.value+'%"';
                }else{
                    sql['text'] = '';
                }
            };

            var searchSQL = 'select lf_users.user_id,lf_users.sex,lf_users.nickname,lf_users.avatar,lf_message.msg_id,lf_message.user_id,lf_message.message,lf_message.photo,lf_message.location,lf_message.up_count,lf_message.comment_count,lf_message.read_count,lf_message.order_count,lf_message.status,lf_message.feedtype,lf_message.ctime,lf_message.examine_admin,lf_message.examine_time from lf_users,lf_message where lf_users.user_id=lf_message.user_id '+sql[doc['stype']]+' order by lf_message.order_count desc,lf_message.ctime desc limit 100000';

            db.query(searchSQL, function (result) {
                //console.log(fun.nowUnix());
                var data = {
                    len : result.length,
                    list: result,
                    /*query : {
                        stype : doc['stype'],
                        value: 
                    }*/
                }
                fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
            })


        }else{
            fun.jsonTips(req, res, 1024, config.Code1X[1024], null);
        }

        


    }else{
        var text = config.Code4X[2004];
        fun.friendlyError(req, res, text); 
    }

}



/*
@   搜索页面 
@
@
*/
exports.soso = function(req, res){
    var name = req.session.username;


    if (name) {

        var sql = {
            thisUser    : 'select * from lf_users where user_id="'+name+'"',
            thismsg     : '',
        };

        db.query(sql.thisUser, function(userList){

            //console.log(userList[0]);

            if (fun.isDigit(req.query.msgid)) {

                sql['thismsg']='select lf_users.user_id,lf_users.sex,lf_users.nickname,lf_users.avatar,lf_message.msg_id,lf_message.user_id,lf_message.message,lf_message.photo,lf_message.location,lf_message.up_count,lf_message.comment_count,lf_message.read_count,lf_message.order_count,lf_message.status,lf_message.feedtype,lf_message.ctime from lf_users,lf_message where lf_users.user_id=lf_message.user_id and msg_id="'+req.query.msgid+'"';


                var timestamp = fun.nowUnix(),
                    baseURL = 'http://api.xiaojiaoyar.com/index.php?s=/Api/ShareLink/shareLinkEx/msg_id/'+req.query.msgid+'/timestamp/'+timestamp+'/randomKey/20150305',
                    token = utility.md5(baseURL),
                    
                    outURL = 'http://api.xiaojiaoyar.com/index.php?s=/Api/ShareLink/shareLinkEx/msg_id/'+req.query.msgid+'/timestamp/'+timestamp+'/token/'+token;


                db.query(sql['thismsg'], function(msgData){

                    res.render('soso', {
                        title       : name+config.productInfo.soso,
                        username    : name,
                        result      : req.session.result,
                        info        : req.session.userinfo,
                        msgData     : msgData,
                        outURL      : outURL,
                    });

                })

            }else{

                res.render('soso', {
                    title       : name+config.productInfo.soso,
                    username    : name,
                    result      : req.session.result,
                    info        : req.session.userinfo,
                    msgData     : '',
                });

            }
            
        })
        
    }else{
        res.redirect('/');
    }

}



/*
@  用户信息获取 lf_user
@  相关参数 排序：order（时间／积分／最后登录时间） 状态：sta（所有／过滤带id／正常／删除／禁用／管理员）
@  jsonp
@  http://localhost:3000/userinfo?order=time&sta=filter&id=520520&p=1&size=10
*/

//增加6:  账号管理的 操作人（examine_admin） 操作时间 （examine_time）
//alter table lf_users add examine_time int(13) NOT NULL DEFAULT '0' after ctime;
//alter table lf_users add examine_admin varchar(15) NOT NULL DEFAULT 'unknow' after ctime;
//

exports.userinfo = function(req, res){
    var name = req.session.username;

    if (name) {
        var doc = {
            order: 'time', 
            sta: 'all'
        };
        var page = {currentp:1,size:20};
        //查看哪页
        if(fun.isDigit(req.query.p)){
            page['currentp']= req.query.p < 1 ? 1 : req.query.p;
        }
        //每页多少条
        if (fun.isDigit(req.query.size)) {
            page['size']= req.query.size<1 ? 1 : req.query.size;
        };
        var sql = {
            //status show
            all         : ' status!="" ',
            filter      : ' filter',
            ready       : ' lf_users.status="1" ',
            del         : ' lf_users.status="2" ',
            forbid      : ' lf_users.status="0" ', 
            admin       : ' lf_users.level="8" ',
            //order 
            time        : 'lf_users.ctime',
            score       : 'lf_users.score',
            last_time   : 'lf_users.last_time',

        }
        if (sql[req.query.sta]) {
            doc['sta'] = req.query.sta;
        };
        if (sql[req.query.order]) {
            doc['order'] = req.query.order;
        };
        if (sql[req.query.sta]&&req.query.sta=='filter') {
            if (req.query.id) {
                doc['sta'] = 'filter';
                sql['filter'] = ' lf_users.user_id="'+req.query.id+'" ';
            }else{
                sql['filter']='';
            }
        };
        var querySQL = {
            totalSQL : 'select count(*) from lf_users where'+ sql[doc['sta']],
            userSQL : 'select * from lf_users where '+ sql[doc['sta']]+' order by '+ sql[doc['order']] +' limit '+(page['currentp']-1)*page['size']+', '+page['size'],
        }
        
        //分页－－查询总条数
        db.query(querySQL['totalSQL'], function(rowsCount){
            rowsCount = rowsCount[0]['count(*)'];
            console.log('会员条数：'+rowsCount);
            page['allnews'] = rowsCount;
            page['pageCount'] = Math.ceil(rowsCount/page['size']);//ceil向上取整 round四舍五入  floor向下取整
            //page['numberOf']    = page['pageCount']>5?5:page['pageCount'];
            
            // 输出 user 查询结果
            db.query(querySQL['userSQL'], function(userData){
                var data = {
                        len : userData.length,
                        page : page,
                        list : userData,
                    };
                fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
            })
        })
    }else{
        res.redirect('/');
    }
} 

/*
@ 用户信息模糊查询
@
@ http://localhost:3000/lookuser?value=hi
*/

//找出u_name中既有“三”又有“猫”的记录，请使用and条件 
//SELECT * FROM [user] WHERE u_name LIKE '%三%' AND u_name LIKE '%猫%' 

exports.lookuser = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        var page = {currentp:1,size:20};
        var doc = {
            type : 'userid',
        }
        //查看哪页
        if(fun.isDigit(req.query.p)){
            page['currentp']= req.query.p < 1 ? 1 : req.query.p;
        }
        //每页多少条
        if (fun.isDigit(req.query.size)) {
            page['size']= req.query.size<1 ? 1 : req.query.size;
        };


        var querySQL = {
            userid   : 'select * from lf_users',
            nickname : 'select * from lf_users',
            totalSQL : 'select count(*) from lf_users',
        }



        if (fun.isDigit(req.query.value)) {
            doc['type'] = 'userid';
            querySQL['userid'] =  'select * from lf_users where user_id='+req.query.value; 
            // 单条信息
            querySQL['totalSQL'] = 'select count(*) from lf_users where user_id='+req.query.value; 
            

        }
        if (!fun.isDigit(req.query.value)) {
            doc['type'] = 'nickname';

            querySQL['nickname'] = 'select * from lf_users where nickname like "%'+req.query.value+'%" ';
            querySQL['totalSQL'] = 'select count(*) from lf_users where nickname like "%'+req.query.value+'%" ';
        }
        // 如果 包含 空格／＋／等组合查询 ［待优化］



        
        //分页－－查询总条数
        db.query(querySQL['totalSQL'], function(rowsCount){
            rowsCount = rowsCount[0]['count(*)'];
            console.log('会员条数：'+rowsCount);
            page['allnews'] = rowsCount;
            page['pageCount'] = Math.ceil(rowsCount/page['size']);//ceil向上取整 round四舍五入  floor向下取整
            //page['numberOf']    = page['pageCount']>5?5:page['pageCount'];
            
            // 输出 user 查询结果
            db.query(querySQL[doc['type']], function(userData){
                var data = {
                        len : userData.length,
                        page : page,
                        list : userData,
                    };
                fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
            })
        })


    })
} 


/*
@  创建马甲账号(坑爹：马甲手机号设置自减，userid设置自增) 密码 加密存储
@
@  http://localhost:3000/createmini?nickname=gaohai&password=123456
*/


exports.createmini = function(req, res){

    fun.verifyAdmin(req, res, function(){

        if (req.query.nickname&&req.query.password) {

            var key = config.productInfo.key;
            var resultMD5 = fun.passwordMD5(req.query.password, key);

            var sql = {
                
                findMobile : 'select mobile from lf_users order by mobile asc',
                findUserid : 'select user_id from lf_users order by user_id desc',
                findNick : 'select * from lf_users where nickname="'+req.query.nickname+'"',
            };

            db.query(sql['findNick'], function(nickData){
                if (nickData.length) {

                    console.log(nickData);
                    fun.jsonTips(req, res, 2012, config.Code2X[2012], nickData);


                }else{

                    db.query(sql['findMobile'], function(result){
                        //找到 马甲帐号 的最小手机号 减去 1 
                        //console.log(result[0].mobile);
                        var mobileNum = result[0].mobile-1;
                        // 居然没有递增！！！！ 找到 user_id 最大的 加1
                        db.query(sql['findUserid'], function(userResult){
                            var userNum = userResult[0].user_id+1;

                            sql['insert']="insert into lf_users (user_id, nickname, passwd, mobile, ctime, level, examine_time, examine_admin) values ('"+userNum+"', '"+req.query.nickname+"', '"+resultMD5+"', '0"+mobileNum+"', '"+fun.nowUnix()+"', '1', '"+fun.nowUnix()+"', '"+req.session.username+"')",

                            db.query(sql['insert'], function(dataList){
                                fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);
                            })
                        })
                    })
                }
            })

            

        }else{

            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })
}

/*
@  另一种登录方式，首页（加密算法） post
@
@
*/

exports.postmd5 = function(req, res){
    var query = {name: req.body.nickname.trim(), password: req.body.password.trim()};
    if(query.name==''||query.password==''){
        var text = config.Code4X[1002];
        fun.friendlyError(req, res, text);
    }else{
        //先查询 是否有此 用户名
        //扩展： 手机号、邮箱、用户名 任意登录 多次回调
        var key = config.productInfo.key;
        var resultMD5 = fun.passwordMD5(query.password, key);
        var sql  = 'select * from lf_users where nickname="'+query.name+'" and passwd="'+resultMD5+'"';

        db.query(sql, function(rows){ 

            if (rows.length) {
                //console.log(rows.length);
                req.session.username = query.name;
                req.session.result = 1;
                req.session.type = rows[0].level;
                //可以避免 刷新页面时提示 是否重复提交（登录数据）
                res.redirect('/home');
            }else{
                console.log(rows);
                var text = config.Code4X[4002];
                fun.friendlyError(req, res, text);
            } 

        })
    }
}


/*              
@  用户信息更新 update
@  参数 userid／column／value （都必须） 
@  jsonp
@  http://localhost:3000/up1user?userid=123&column=status   更改用户状态
@  http://localhost:3000/up1user?userid=1047&column=level&value=1  更改用户权限
*/
//API  接口实现方法：
//请求 ?user_id=123&status=1
//判断 req.query.(some) 参数的值知否符合表设置的数据类型 
//执行 sql   [每请求一个参数（可以组合） 执行一遍对应的sql，需要 n 个函数]

//请求 ?user_id=123&column=status&value=1
//查找 column 并判断 value
//执行sql 一个函数即可


exports.up1user = function(req, res){
    var session = {
        name : req.session.username,
        level : req.session.type,
    }

    if (session.name&&session.level=="8") {
        //必须 有 userid 参数
        if (fun.isDigit(req.query.userid)&&req.query.column) {

            var doc = {
                column : 'status',
                value : '1',                
            };

            var sql = {
                //user_id     : req.query.userid, 
                status      : ' status="'+req.query.value+'" ',
                level       : ' level="" ',

                //mobile      : ''

            }

            if (req.query.column=='level'&&fun.isDigit(req.query.value)) {
                doc['column'] = 'level';
                sql['level'] = ' level ="'+req.query.value+'" ';
            };
            
            
            var updateUser = 'update lf_users set '+ sql[doc['column']] + 'where lf_users.user_id="'+req.query.userid+'"'
            db.query(updateUser, function(data){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
            })



        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

        
        
        
    }else{
        res.redirect('/');
    }
} 

//var updateSQL = "update lf_message_comment set status = '"+doc['value']+"',examine_admin='"+name+"',examine_time='"+ fun.nowUnix() +"' WHERE lf_message_comment.id = '"+doc['id']+"'";


/*
@  个人主页
@  参数 type（message）value（int）
@  http://localhost:3000/userzone?type=message&column=userid&value=1120
*/

exports.userzone = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        var page = {currentp:1,size:20};
        var doc = {
            column : 'userid',
            type : 'message',
        }
        //查看哪页
        if(fun.isDigit(req.query.p)){
            page['currentp']= req.query.p < 1 ? 1 : req.query.p;
        }
        //每页多少条
        if (fun.isDigit(req.query.size)) {
            page['size']= req.query.size<1 ? 1 : req.query.size;
        };


        var querySQL = {

            message   : 'select * from lf_message where lf_message.user_id='+req.query.value+' order by lf_message.ctime desc'+' limit '+(page['currentp']-1)*page['size']+', '+page['size'],
            messageCount : 'select count(*) from lf_message where user_id='+req.query.value,
            //nickname : 'select * from lf_users',
            comment : 'select * from lf_message_comment where lf_message_comment.user_id='+req.query.value+' order by lf_message_comment.ctime desc'+' limit '+(page['currentp']-1)*page['size']+', '+page['size'],
            commentCount : 'select count(*) from lf_message_comment where user_id='+req.query.value,
            userinfo : 'select * from lf_users where lf_users.user_id='+req.query.value+' ',
        }

        if (querySQL[req.query.type]) {
            doc['type']=req.query.type;
            console.log('userzone----req.query.type :'+req.query.type);
            console.log("querySQL[doc['type']] :"+querySQL[doc['type']]);
        };

        
        //以ID查询 （目前此接口不支持 模糊查询）
        if (fun.isDigit(req.query.value)) {

            /*if (querySQL[req.query.type]&&req.query.type=='message') {
                doc['type']='message';
                //querySQL['message'] =  'select * from lf_message where lf_message.user_id='+req.query.value+' order by lf_message.ctime desc'+' limit '+(page['currentp']-1)*page['size']+', '+page['size']; 
            };

            if (querySQL[req.query.type]&&req.query.type=='comment') {
                doc['type'] = 'comment';
                //querySQL['comment'] = 'select * from lf_message_comment where lf_message_comment.user_id='+req.query.value+' order by lf_message_comment.ctime desc'+' limit '+(page['currentp']-1)*page['size']+', '+page['size']; 
            };

            querySQL['userinfo'] = 'select * from lf_users where lf_users.user_id='+req.query.value+' ';*/

            //分页－－查询总条数
            db.query(querySQL[doc['type']+'Count'], function(rowsCount){

                rowsCount = rowsCount[0]['count(*)'];
                console.log('用户动态总条数：'+rowsCount);
                page['allnews'] = rowsCount;
                page['pageCount'] = Math.ceil(rowsCount/page['size']);

                //用户信息
                db.query(querySQL['userinfo'], function(userInfo){

                    if (userInfo.length) {

                        //console.log('用户信息 :'+userInfo[0]);
                        //console.log('page: '+ page);

                        // 输出 动态 查询结果
                        db.query(querySQL[doc['type']], function (messageList) {

                            var data = {
                                length : messageList.length,
                                page : page,
                                list : messageList,
                                user : userInfo[0],
                            };

                            fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
                        })

                    }else{

                        fun.jsonTips(req, res, 4031, config.Code4X[4031], null);

                    }

                    

                })
                
            })

        }else{

            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }
        
    })
} 


//新增 表

/*CREATE TABLE `lf_feed_type` (
`id` INT(8) NOT NULL AUTO_INCREMENT COMMENT 'id',
`name` varchar(30) DEFAULT 'nothing' COMMENT '类别名称',
`type` tinyint(4) DEFAULT '0' COMMENT '分类值',
PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8;*/
/*
*  获取推荐 分类
*  http://localhost:3000/showfeedtype
*/
exports.showfeedtype = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        db.query(config.mysqlText['showfeedtype'], function(dataList){

            fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);

        })

    })
    
}
/* 更新 推荐分类
* localhost:3000/upfeedtype?value=2&name=美食&id=2
*
*/
exports.upfeedtype = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        if (fun.isDigit(req.query.value)&&fun.isDigit(req.query.id)&&req.query.name) {

            var sql = "update lf_feed_type set name = '"+req.query.name+"', type = '"+req.query.value+"' where id = '"+req.query.id+"'";

            db.query(sql, function(dataList){

                fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);

            })

        }else{

            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })
    
}


/* 新建推荐分类
*
*
*/
exports.createfeedtype = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){


        if (fun.isDigit(req.query.value)&&req.query.name) {

            var sql = "insert into lf_feed_type (name, type) values ('"+req.query.name+"', '"+req.query.value+"')";

            db.query(sql, function(dataList){

                fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);

            })

        }else{

            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })
    
}

/* 删除推荐分类
*
* localhost:3000/deletefeedtype?id=5
*/
exports.deletefeedtype = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){


        if (fun.isDigit(req.query.id)) {

            var sql = "DELETE FROM lf_feed_type WHERE id = '"+req.query.id+"' ";

            db.query(sql, function(dataList){

                fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);

            })

        }else{

            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })
    
}



/*
@  贴纸 页面
@
*/
exports.paster = function(req, res){

    var name = req.session.username;

    if (name) {

        res.render('paster', {
            title: config.productInfo.paster,
            username    : name,
            result      : req.session.result,
            info        : req.session.userinfo,
        });
        
    }else{
        res.redirect('/');
    }

}


/*
@  获取贴纸
@
@  http://localhost:3000/pasterinfo?sta=ready&order=time&p=1&size=10000
@  http://localhost:3000/pasterinfo?sta=type&order=time&p=1&size=10000&value=1
*/

//增加5:  
//alter table lf_paster_info add examine_time int(13) NOT NULL DEFAULT '0' after ctime;
//alter table lf_paster_info add examine_admin varchar(15) NOT NULL DEFAULT 'unknow' after ctime;
//
//alter table lf_paster_info add status int(11) NOT NULL DEFAULT '1' after id;


exports.pasterinfo = function(req, res){
    var name = req.session.username;

    if (name) {

        var doc = {
            //time: 'w1', 
            //typeid: '1', 
            order: 'time', 
            sta: 'all',
            value :'1',//默认的分类 type值
        };
        var page = {currentp:1,size:20};

        //查看哪页
        if(fun.isDigit(req.query.p)){
            page['currentp']= req.query.p < 1 ? 1 : req.query.p;
        }
        //每页多少条
        if (fun.isDigit(req.query.size)) {
            page['size']= req.query.size<1 ? 1 : req.query.size;
        };
        if (fun.isDigit(req.query.value)) {
            doc['value'] = req.query.value;
        };
        var sql = {
            //status show
            all         : '',
            type        : ' where lf_paster_info.type_id="'+doc['value']+'" ',
            ready       : ' where lf_paster_info.status="1" ',
            del         : ' where lf_paster_info.status="0" ',

            //order 
            time        : ' order by lf_paster_info.ctime ',
            sort        : ' order by lf_paster_info.order_sort ',
            //
            totalSQL    : ' '

        }

        if (sql[req.query.sta]) {
            doc['sta'] = req.query.sta;
        };
        if (sql[req.query.order]) {
            doc['order'] = req.query.order;
        };  
        
        var pasterSQL = 'select * from lf_paster_info '+sql[doc['sta']]+sql[doc['order']]+' desc limit '+(page['currentp']-1)*page['size']+', '+page['size'];

        sql['totalSQL'] = 'select count(*) from lf_paster_info '+sql[doc['sta']];

        //分页－－查询总条数
        db.query(sql['totalSQL'], function(rowsCount){

            rowsCount = rowsCount[0]['count(*)'];
            console.log('消息总条数：'+rowsCount);
            page['allnews'] = rowsCount;
            page['pageCount'] = Math.ceil(rowsCount/page['size']);//ceil向上取整 round四舍五入  floor向下取整
            //page['numberOf']    = page['pageCount']>5?5:page['pageCount'];
            
            // 输出 查询结果
            db.query(pasterSQL, function (pasterList) {

                var data = {
                    len : pasterList.length,
                    page : page,
                    list : pasterList,
                };
                fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
            })

        })

    }else{
        res.redirect('/');
    }

} 


/* 获取贴纸分类
*
* localhost:3000/deletefeedtype?id=5
*/
exports.pastertype = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        var sql = 'select * from lf_paster_type';
        db.query(sql, function(data){
            fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
        })

    })
    
}

/*
@  获取随机马甲号 user_id
@
@
*/
exports.randommj = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        var sql = {
            count : 'SELECT count(*) FROM `lf_users` WHERE mobile BETWEEN 0 AND 11000 ORDER BY `user_id` ASC',
            user_id : 'SELECT user_id,nickname FROM `lf_users` WHERE mobile BETWEEN 0 AND 11000 ORDER BY `user_id` ASC',
        };
        db.query(sql['count'], function(counts){

            var number = counts[0]['count(*)']+1;
            console.log('mini user:'+number);

            db.query(sql['user_id'], function(userList){
                var index = Math.floor(Math.random()*number),
                    randomID = userList[index];
                //console.log(randomID);
                fun.jsonTips(req, res, 2000, config.Code2X[2000], randomID);

            })
        })
    })
}

/*
@  管理员 登录后修改 贴纸
@
@   http://localhost:3000/uppaster?typeid=4&url=http://highsea90.com/me.jpg&id=87
*/
exports.uppaster = function(req, res){

    fun.verifyAdmin(req, res, function(){

        if (req.query.id&&req.query.typeid&&req.query.url) {

            var doc ={
                desc : '未知',
                order: '0',
                sta: '1',
            }
            if (req.query.desc) {
                doc['desc'] = req.query.desc;
            };
            if (req.query.order) {
                doc['order'] = req.query.order;
            };
            if (req.query.sta) {
                doc['sta'] = req.query.sta;
            };

            var sql = 'update lf_paster_info set status="'+doc['sta']+'", type_id="'+req.query.typeid+'", description="'+doc['desc']+'", url="'+req.query.url+'", order_sort="'+doc['order']+'", examine_admin="'+req.session.username+'", examine_time="'+fun.nowUnix()+'" where lf_paster_info.id="'+req.query.id+'"';

            db.query(sql, function(result){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], result);

            })

        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })

}
/*
@  管理员 登录后 贴纸 放回收站 或 恢复
@
@   http://localhost:3000/uppaster?typeid=4&url=http://highsea90.com/me.jpg&id=87
*/
exports.delpaster = function(req, res){

    fun.verifyAdmin(req, res, function(){

        if (req.query.id&&req.query.value) {

            var sql = 'update lf_paster_info set status="'+req.query.value+'" where lf_paster_info.id="'+req.query.id+'"';

            db.query(sql, function(result){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], result);
            })

        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })

}


/*
@  管理员 登录后新增 贴纸
@
@   http://localhost:3000/createpaster?typeid=5&url=http://highsea90.com/me.jpg
*/
exports.createpaster = function(req, res){

    fun.verifyAdmin(req, res, function(){

        if (req.query.typeid&&req.query.url) {

            var doc ={
                desc : '未知',
                order: '0',
                sta: '1',
            }
            if (req.query.desc) {
                doc['desc'] = req.query.desc;
            };
            if (req.query.order) {
                doc['order'] = req.query.order;
            };
            if (req.query.sta) {
                doc['sta'] = req.query.sta;
            };

            var sql = 'insert into lf_paster_info (status, type_id, description, url, order_sort, ctime, examine_admin, examine_time) VALUES ("'+doc['sta']+'", "'+req.query.typeid+'", "'+doc['desc']+'", "'+req.query.url+'", "'+doc['order']+'", "'+fun.yymmdd()+'", "'+req.session.username+'", "'+fun.nowUnix()+'")';

            db.query(sql, function(result){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], result);

            })

        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })

}


/*
@  管理员 用马甲号随意 评论 指定 id
@
@  http://localhost:3000/createcomment?uid=1120&uidb=1225&message=test&msgid=673
@  登录 php API http://xiaojiaoyar.com/Api/User/loginEx/account/201505/passwd/e10adc3949ba59abbe56e057f20f883e/platform/17/%20/version/1.0.3/
*/
exports.createcomment = function(req, res){

    fun.verifyAdmin(req, res, function(){

        if (req.query.uid&&req.query.uidb&&req.query.message&&req.query.msgid) {
            var doc = {
                message     : req.query.message,
                status      : 1,
                user_id     : req.query.uid,
                user_id_b   : req.query.uidb,
                msg_id      : req.query.msgid,
                admin       : req.session.username,
                etime       : fun.nowUnix(),
                ctime       : fun.nowUnix(),
            };

            var sql = "insert into lf_message_comment (status, msg_id, user_id, user_id_b, message, ctime, examine_admin, examine_time) values ('"+doc['status']+"', '"+doc['msg_id']+"', '"+doc['user_id']+"', '"+doc['user_id_b']+"', '"+doc['message']+"', '"+doc['ctime']+"', '"+doc['admin']+"', '"+doc['etime']+"')";
            db.query(sql, function(dataList){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);
            })

        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })

}

/*
@  管理员 用马甲号随意 赞 指定 id
@
@  http://localhost:3000/createup?uid=1151&msgid=673  
*/
exports.createup = function(req, res){

    fun.verifyAdmin(req, res, function(){

        if (req.query.uid&&req.query.msgid) {
            var doc = {
                user_id     : req.query.uid,
                msg_id      : req.query.msgid,
                ctime       : fun.nowUnix(),
            };

            var sql = "insert into lf_message_up (msg_id, user_id, ctime) values ('"+doc['msg_id']+"', '"+doc['user_id']+"', '"+doc['ctime']+"')";
            db.query(sql, function(dataList){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], dataList);
            })

        }else{
            fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
        }

    })

}


/*"CREATE TABLE `user_telphone` (  
  `keyid` int(11) NOT NULL AUTO_INCREMENT COMMENT '主键',  
  `user_recordid` int(11) NOT NULL,  
  `telphone_num` varchar(20) DEFAULT NULL,  
  `create_by` varchar(32) DEFAULT NULL,  
  `create_date` datetime DEFAULT NULL,  
  `lastupdate_by` varchar(32) DEFAULT NULL,  
  `lastupdate_date` datetime DEFAULT NULL,  
  `memo` varchar(200) DEFAULT NULL,  
  `enable_flag` char(1) DEFAULT 'T',  
  PRIMARY KEY (`keyid`),  
  KEY `user_recordid` (`user_recordid`),  
  CONSTRAINT `user_telphone_fk1` FOREIGN KEY (`user_recordid`) REFERENCES `user_info` (`recordid`) ON DELETE NO ACTION ON UPDATE NO ACTION  
) ENGINE=InnoDB DEFAULT CHARSET=utf8;  "*/
//------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




/*
@  微信生成  access_token
@  7200s 重新获取
@  type(见type对象)
@  http://localhost:3000/weixin?type=ticket&callback=abc
*/
exports.weixin = function(req, res, next){

    //var ticketPath = './db/ticket.json';
    var cheerio = require('cheerio');
    var superagent = require('superagent');

    var ticket = fs.statSync(appsetFile);
    var ticketObj = JSON.parse(fs.readFileSync(appsetFile), 'utf8', function(err, data){});
    // file time-----
    /*{ dev: 16777218,
  mode: 33188,
  nlink: 1,
  uid: 501,
  gid: 80,
  rdev: 0,
  blksize: 4096,
  ino: 45123301,
  size: 2,
  blocks: 8,
  atime: Fri Jun 05 2015 13:26:24 GMT+0800 (CST),//visite tima
  mtime: Fri Jun 05 2015 13:26:22 GMT+0800 (CST), // modifiy time
  ctime: Fri Jun 05 2015 11:57:15 GMT+0800 (CST) }// create time  */

    var doc = {
        appid   : ticketObj.weixin.appid,
        secret  : ticketObj.weixin.secret,
        type    : 'access_token',
        mtime   : fun.toUnix(ticket.mtime) ,
        nowtime : fun.nowUnix(),
        //sha1    : 'sha1',
    }
    console.log('初始化的 doc：');

    console.log(doc);

    // 可选 appid
    if (req.query.appid) {
        doc['appid'] = req.query.appid;
    };
    /*if (req.query.ticket&&req.query.url) {
        doc['sha1'] = fun.sign(req.query.ticket, req.query.url);
    };*/
    //可选 secret
    if (req.query.secret) {
        doc['secret'] = req.query.secret;
    };
    //res.send(doc);
    // type 参数类型
    var type = {
        appid           : doc['appid'],
        access_token    : 'access',
        ticket          : 'ticket',
    }

    if (type[req.query.type]) {

        doc['type'] = req.query.type;

        var mtime = doc['nowtime'] - doc['mtime'];

        console.log('mtime:'+mtime);
        //当大于 2hour 则重新获取 
        var judgeTime = mtime>7199 ? 0 : 1;
        console.log('judgeTime:'+judgeTime);

        //console.log('读取 access_token:'+ticketObj.access_token);

        if (judgeTime&&ticketObj.access_token!=''&&ticketObj.ticket!='') {

            type['access_token'] = ticketObj.access_token;
            type['ticket'] = ticketObj.ticket;

            //console.log('缓存');

            fun.jsonTips(req, res, 2304, doc['appid'], type[doc['type']]);

        }else{

            superagent.get('https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid='+doc['appid']+'&secret='+doc['secret'])
            .end(function (err, sres) {
            // 常规的错误处理
                if (err) {
                    return next(err);
                }
                // sres.text 里面存储着网页的 html 内容，将它传给 cheerio.load 之后
                // 就可以得到一个实现了 jquery 接口的变量，我们习惯性地将它命名为 `$`
                // 剩下就都是 jquery 的内容了
                // var $ = cheerio.load(sres.text);
                // var items = [];
                // $('#topic_list .topic_title').each(function (idx, element) {
                //   var $element = $(element);
                //   items.push({
                //     title: $element.attr('title'),
                //     href: $element.attr('href')
                //   });
                // });

            //{"weixin":{"appid":"wx2512a12dde3a0ba5","secret":"681a5e7552885edc78ea096eb0541c82"},"access_token":"","ticket":""}

                // res.send(items);
                // 设置  爬取的 access_token  等待写入
                type['access_token'] = JSON.parse(sres.text).access_token;
                console.log(type['access_token']);

                superagent.get('https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+type['access_token']+'&type=jsapi')
                .end(function(error, result){
                    if (error) {
                        return next(error)
                    };
                    /*//读取文件
                    fs.readFile('message.txt', 'utf8', function (err, data) {
                        if (err) throw err;
                        console.log(data);
                    });*/
                    //写入 获取的 ticket
                    type['ticket'] = JSON.parse(result.text).ticket;
                    //console.log("type['ticket']:"+result.text);
                    //console.log('JSON.parse(result.text).ticket:'+JSON.parse(result.text).ticket);

                    //---------------------
                    var textStringify = JSON.stringify({
                            weixin:{
                                appid   : ticketObj.weixin.appid,
                                secret  : ticketObj.weixin.secret
                            },
                            access_token: type['access_token'],
                            ticket      : type['ticket']
                        });
                    //console.log(textStringify);
                    //写入文件 
                    fs.writeFile(appsetFile, textStringify, function(err){

                        if(err) {
                            console.log('写入错误:'+JSON.stringify(err));
                            fun.jsonTips(req, res, 5021, config.Code5X[5021], err);
                        }else{
                            console.log('写入成功:'+textStringify);
                            fun.jsonTips(req, res, 2000, doc['appid'], type[doc['type']]);
                        }
                    });

                })
            });

        }

    }else{
        fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
    }

}

exports.sha1 = function(req,res){

    if (req.query.ticket&&req.query.url) {

        var doc = {
            ticket : 'ticket',
            url : 'url',
        }
        var data = fun.sign(req.query.ticket, req.query.url);
        fun.jsonTips(req, res, 2000, config.Code2X[2000], data);

    }else{
        fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
    }
    
}

exports.wxinit = function(req, res){

    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        res.render('wxinit', {
            title       : config.productInfo.wxinit,
            wxinfo      : JSON.parse(fs.readFileSync(appsetFile), 'utf8', function(err, data){}),
            username    : req.session.username,
            result      : req.session.result,
            info        : req.session.userinfo,
        })
        

    })
    
}


exports.setweixin = function(req, res){
    //验证 管理员&&是否登录
    fun.verifyAdmin(req, res, function(){

        
        

    })

}

exports.wxactive = function(req, res){
    res.render('wx-active', {
        title : '微信活动',
    })
}




/*
@  用户注册页面
@  对应接口 adduser 前台新增单用户 | userCount 查重复
@
*/
exports.register = function(req, res){
    res.render('register', {
        title: config.productInfo.register,
        result:0,//未登录
        resultREG:0//未注册
    })
}

/*
@ 新增 create 前台注册用户 （单个）
@ post/query {user:string,password:string,sex:number,email:string,iphone:sting}
@ 2000 发送成功
@ 1020 5019 2030 4020 1001
*/

exports.adduser = function(req, res){
    //表纠结 前台是 radio 还是 checkbox 了（支持 radio：该方式传值为 name:on）
    //var sex = req.body.sex1==true?req.body.sex1:req.body.sex2;
    //还是靠 input.type=hidden.name=sexval 解决
    //console.log(sex);
    var query = {
            name: req.body.user, 
            password: req.body.password,
            sex : req.body.sexval,
            email : req.body.email,
            iphone : req.body.iphone,
            type: 2,//前台注册的账户为 普通用户
        };
    //判断请求的域
    //?

    if(query.name==''||query.password==''||query.email==''){
        var text = config.Code4X[1003];
        fun.friendlyError(req, res, text);
    }else{

        database.userlist.create(query, function(error){
            if (error) {
                res.end(error);
            }else{
                console.log('注册成功');
                res.render('register', {
                    title: "注册页面",
                    result:0,//未登录
                    resultREG:1//注册成功
                })
            }
        })
    }
}


/*
@ 符合某条件的数量 count 查询 分类+值 多功能接口（可用户 新建 删除相关分类数据）
@ countname /get/ query.name 数据库字段名称
@ countvalue /get/ query.value 该字段的值
@
*/
exports.userCount = function (req, res){

    var countname = req.query.name,
        countvalue = req.query.value,
        q_count = {countname:countvalue};

    //密码不允许查询 0.0
    if (!countname||!countvalue||countname=='password'||q_count.length>1) {
        fun.jsonTips(req, res, 2013, config.Code2X[2013], {name:'user|age|city|email|type|living|score|fans|follow|content|time|sex', value:'String|Number|Date|Boolean'});

    //}else if(countname=='user'){
    //关键字不允许注册
    //待完善

    }else{
        var coutListArr = {
            'userid': {_id:countvalue},
            'user'  : {name : countvalue},
            'age'   : {age : countvalue},
            'city'  : {city:countvalue},
            'email' : {email:countvalue},
            'type'  : {type:countvalue},
            'living': {living:countvalue},
            'score' : {score:countvalue},
            'fans'  : {fans:countvalue},
            'follow': {follow:countvalue},
            'content': {content:countvalue},
            'time'  : {time:countvalue},
            'sex'   : {sex:countvalue}
        }
        //console.log(coutListArr[countname]);
        database.userlist.count(coutListArr[countname], function(err, doc){

            if (err) {
                fun.jsonTips(req, res, 5019, config.Code5X[5019], err);

            }else{
                if (doc<1) {
                    //没有重复
                    fun.jsonTips(req, res, 2000, config.Code2X[2000], doc);
                }else{
                    //相关数据 已经存在
                    fun.jsonTips(req, res, 3001, config.Code3X[3001], doc);
                }
            }
        })
    }
}


/*
@ 忘记密码页面
@ 对应接口  email 发送邮件
*/
exports.forget = function(req, res){
    res.render('forget', {
        title: config.productInfo.forget,
        email:0,//未登录
        resultREG:0//未注册
    })
}



/*
@ get/query {sometext:string}
@ 2000 发送成功
@ 1020 5019 2030 4020 1001
*/
exports.email = function(req, res){
    var query = {some: req.query.sometext},
        Regex =  /^(?:\w+\.?)*\w+@(?:\w+\.)*\w+$/;
    console.log('结果：'+JSON.stringify(req.query));

    if (!query.some||query.some=='') {

        fun.jsonTips(req, res, 1020, config.Code1X[1020], '');

    }else{

        if (Regex.test(query.some)) {
            var doc = {email:query.some};
            
        }else{
            var doc = {name:query.some};
            
        }
        database.userlist.find(doc, function(error, result){
            if (error) {
                fun.jsonTips(req, res, 5019, config.Code5X[5019], error);
                
            }else{

                if (result!='') {
                    //数据库不应该有重复
                    var password = result[0].password,
                        email = result[0].email,
                        name = result[0].name;

                    if (email==undefined) {

                        fun.jsonTips(req, res, 4030, config.Code4X[4030]+email, '');

                    }else{

                        var mailOptions = {
                            from: 'idacker@163.com', 
                            to: email, 
                            subject: '您的'+config.productInfo.name+'的密码', 
                            text: '您的'+config.productInfo.name+'的密码是：'+password, // plaintext body
                            html: '<h2>Hello '+name+'</h2><p>您的'+config.productInfo.name+'的密码是：'+password+'</p><h5>'+config.productInfo.by+'</h5>' // html body
                        };

                        transporter.sendMail(mailOptions, function(err, info){
                            if(err){
                                fun.jsonTips(req, res, 4020, config.Code4X[4020]+email, err);
                            }else{
                                fun.jsonTips(req, res, 2000, config.Code2X[2000], info.response);
                            }
                        });

                    }
                    
                }else{
                    // 查不到
                    fun.jsonTips(req, res, 4001, config.Code4X[4001], '');
                }
                
            }
        })
    }
}

/*
@ 自定义的 错误提示页面
@ text (String)
@ 直接请求 url
*/
exports.friendlyError = function(req, res){
    var text = config.productInfo.friendlyError.text;
    fun.friendlyError(req, res, text);
}

// 管理员页面
exports.admin = function(req, res){

    var name = req.session.username;

    if (name) {

        res.render('admin', {
            title: config.productInfo.admin,
            username    : name,
            result      : req.session.result,
            info        : req.session.userinfo,
        });
        
    }else{
        res.redirect('/');
    }

}

/*
@ get 查找单用户（by name）显示全部字段
@ 需要二次登录 返回 jsonp 或者 跳转友好错误页
*/
exports.userbyname = function(req, res){

    var username = req.query.username;
    if (!username||username=='') {
        fun.jsonTips(req, res, 1022, config.Code1X[1022], '');
    }else{

        fun.login_verify(req, res, function(){
            fun.userinfo (req, res, username, function(d){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], d[0]);
            })
        })
    }
    
}

/*
@ get查找单用户（by id） 显示全部字段
@ 需要二次登录，返回 jsonp [5001 2000]
@ 同类方法： fun.userinfo (req, res, name, cb) 和 userbyname
@ url：oneuser/?name=test&key=123&id=5534bf22810a0d3c2114f5db
*/
exports.oneuser = function (req, res){
    var userid = req.query.id;
    if (!userid||userid=='') {
        fun.jsonTips(req, res, 1021, config.Code1X[1021], '');
    }else{
        fun.login_verify(req, res, function(){

            database.userlist.findById( userid, function(err, doc){
                if (err) {
                    fun.jsonTips(req, res, 5001, err, '');
                }else{
                    fun.jsonTips(req, res, 2000, config.Code2X[2000], doc);
                }
            })
        })
    }


}

/*
@ get查找 全部用户 只显示 id name password type 字段
@ 需要二次登录，返回 jsonp
@ url：getuser/?name=admin&key=123456
*/
exports.getuser = function(req, res){
    //console.log(req.query.name);//key
    fun.login_verify(req, res, function(){
        database.userlist.find({}, {name : 1, type : 1, password : 1}, {}, function(error, doc){
            fun.json_api(req, res, error, doc);
        })
    });
}
/*
@ 查看自己的信息 显示自己的全部信息
@ 需要当前用户登录，根据 session.username 和查找的name 判断是否一致
@
*/
exports.sessionuser = function(req, res){
    var username = req.query.username;
    if (!username||username=='') {
        fun.friendlyError(req, res, config.Code1X[1020]);
    }else{
        if (req.session.username == username) {
            fun.userinfo (req, res, username, function(d){
                fun.jsonTips(req, res, 2000, config.Code2X[2000], d[0]);
            })
        }else{
            res.redirect('/home');
        }
    }
}



//get 删除 remove 用户
exports.remove1user = function(req, res){

    fun.login_verify(req, res, function (){

        database.userlist.count({_id:req.query.id}, function(err, doc){
            if (err) {
                fun.jsonTips(req, res, 5001, err, '');
            }else{
                if (doc) {
                    database.userlist.remove({_id: req.query.id}, function(error){
                        fun.jsonTips(req, res, 2000, config.Code2X[2000], '');
                    });
                }else{
                    fun.jsonTips(req, res, 4015, config.Code2X[4015], '');
                }
            }
        });
    });
}

/*
//更改 update 单个用户信息 get
exports.up1user = function(req, res){

    fun.login_verify(req, res, function (){

        fun.add_update_verify(req, res,function(){
            var r = req.query,
                doc = {name:r.user, password:r.password, type:r.type};
            database.userlist.update({_id:r.id}, doc, {}, function(error){

                fun.json_api(req, res, error, {id:r.id, now:doc});

            });
        });
    });
}
*/

//路由get 新增 后台管理员添加 create 用户
exports.adduserget = function(req, res){

    fun.login_verify(req, res, function(){

        fun.add_update_verify(req, res,function(){
            var r = req.query;
            var doc = {
                name        : r.user,
                password    : r.password,
                content     : r.content,
                age         : r.age,
                city        : r.city,
                email       : r.email,
                type        : r.type
            };
            //console.log(doc);

            database.userlist.count({name:r.user}, function(err, result){
                if (err) {
                    fun.jsonTips(req, res, 5001, err, '');
                }else{
                    
                    if (result) {
                        fun.jsonTips(req, res, '2014', 'user exist', '用户已经存在');
                    }else{
                        //插入数据库
                        database.userlist.create(doc, function(error){
                            fun.json_api(req, res, error, {id:r.id, now:doc});
                        })
                    }
                }
            })

        })
    })
}



/*
@ 上传页面 需要登录
@
*/
exports.upload = function(req, res) {

    var q = req.body?req.body:req.query,
        username = req.query.username,
        picname = q.picname;
        
    if (!username) {
        //文件上传
        console.log('文件上传');
        console.log(q);

        var form = new formidable.IncomingForm();
        form.encoding = 'utf-8';        //设置编辑
        form.uploadDir = picPATH;     //设置上传目录
        form.keepExtensions = true;     //保留后缀
        form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

        form.parse(req, function(err, fields, files){

            if (err) {
                fun.jsonTips(req, res, 1026, config.Code1X[1026], err);
            }else{

                console.log('files:');
                console.log(files);

                if(files['files']!=undefined){
                    // http://localhost:3000/upload [post]

                    var extName = '';  //后缀名
                    switch (files.files.type) {
                        case 'image/jpg':
                            extName = 'jpg';
                            break;
                        case 'image/jpeg':
                            extName = 'jpeg';
                            break;         
                        case 'image/png':
                            extName = 'png';
                            break;
                        case 'image/x-png':
                            extName = 'png';
                            break; 
                        case 'image/gif':
                            extName = 'gif';        
                    }

                    if (extName=='') {
                        //不允许的文件
                        fun.jsonTips(req, res, 1027, config.Code1X[1027], null);
                    }else{

                        var resultPic = req.session.username+'_'+fun.nowUnix()+'.'+extName;
                        try{
                            fs.renameSync(files.files.path, picPATH+resultPic);
                            fun.uploadHtml(req, res, resultPic, username);
                            //fun.jsonTips(req, res, 2000, config.Code2X[2000], resultPic);
                        }catch(e){
                            fun.jsonTips(req, res, 5021, config.Code5X[5021], e);
                        }
                        //fun.jsonTips(req, res, 2000, config.Code2X[2000], 'test');
                    }

                }else{
                    // http://localhost:3000/upload [get]
                    fun.jsonTips(req, res, 1025, config.Code1X[1025], null);
                }
            }
        });


    } else{
        // http://localhost:3000/upload?username=right
        console.log('上传页面');

        if (req.session.username==username) {
            fun.uploadHtml(req, res, '1', username);

        } else{
            //  http://localhost:3000/upload?username=nothing
            fun.jsonTips(req, res, 2005, config.Code2X[2005], null);
        };
    };
    
};     
//上传 1.jpg 等文件读取不到name导致系统崩溃    
// { files: 
//    { domain: null,
//      _events: {},
//      _maxListeners: 10,
//      size: 2825427,
//      path: 'tmp/609d14418e2c26f657f26f92531cc4f4',
//      name: '2868d770410292d70dd51634e90cc02c.jpg',
//      type: 'image/jpeg',
//      hash: false,
//      lastModifiedDate: Fri Apr 24 2015 21:03:55 GMT+0800 (CST),
//      _writeStream: 
//       { _writableState: [Object],
//         writable: true,
//         domain: null,
//         _events: {},
//         _maxListeners: 10,
//         path: 'tmp/609d14418e2c26f657f26f92531cc4f4',
//         fd: null,
//         flags: 'w',
//         mode: 438,
//         start: undefined,
//         pos: undefined,
//         bytesWritten: 2825427,
//         closed: true 
//       } 
//     } 
// }
        // 同步操作文件，需要try catch

exports.getpic = function(req, res){

    if (req.query.picname) {

        var picname = req.query.picname;
        var extName = picname.split('.')[1];
        console.log(extName);
        
        fs.readFile(picPATH+picname,'binary',function(err,file){
            if(err){
                res.writeHead(500,{'Content-Type':'text/plain'});
                res.write(err+'\n');
                res.end();
            }else{
                res.writeHead(200,{'Content-Type':'image/'+extName});
                res.write(file,'binary');
                res.end();
            }
        });

    }else{
        fun.friendlyError(req, res, config.Code1X[1020]);

    }
    
}


