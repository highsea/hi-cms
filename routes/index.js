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
    moment = require('moment');

var appsetFile = ['./db/appset-', '.json'].join('');// new Date()-0,
var JsonObj = JSON.parse(fs.readFileSync(appsetFile));

var transporter = nodemailer.createTransport({
    service: '163',
    auth: {
        user: config.emailArr.user,
        pass: config.emailArr.pass,
    }
});

var picPATH = config.productInfo.picupload;


// var mysql = require('mysql');
// var conn = mysql.createConnection({
//     host: 'hdm-144.hichina.com',
//     user: 'hdm1440387',
//     password: 'Highsea301',
//     database:'hdm1440387_db',
//     port: 3306,
// });


// string.trim() 前台处理

/*
@ 首页 登录页
@ 相关接口： homepost （以页面跳转方式）
*/
exports.index = function(req, res){
    //分页
    var search  ={};
    var page    ={limit:5,num:1,size:20};

    //查看哪页
    if(req.query.p){
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
    })

    //var sql = 'select * from lf_message where status=1 and msg_id>=(select msg_id from lf_message limit 1000000, 1) order by ctime desc limit '+page['size'];
    var sql = 'select * from lf_message where status="1" order by ctime desc limit '+(page['num']-1)*page['size']+', '+page['size'];//20,20//40
    //console.log(sql);

    db.query(sql, function(rows) {

        if(req.session.isVisit) {
            req.session.isVisit++;
            
        } else {
            req.session.isVisit = 1;
            
        }
        
        res.render('index', {
            title   : config.productInfo.name ,
            result  : 0,//未登录
            living  : config.dbtext['wz'],//在线人数
            visit   : req.session.isVisit,// 你访问了多少次
            rows    : rows,// message
            usernum : userNum,//注册总人数
            page    : page,
        });
    })

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
@ 直接输入 主页
@ 从 session 判断是否登录
@ 以页面跳转方式，无 jsonp 接口
*/
exports.homeget = function(req, res) {
    //判断是否登录
    var name = req.session.username;
    var sql = {
        thisUser    : 'select * from lf_users where user_id="'+name+'"',
    };

    if (name) {

        db.query(sql.thisUser, function(userList){

            console.log(userList[0]);

            res.render('home', {
                title       : name+config.productInfo.home,
                username    : name,
                result      : req.session.result,
                info        : userList[0],
            });
            /*console.log(moment().format());
            var nowTime = moment().format('L');
            var threedayago = moment().subtract(3, 'days').calendar();
            var weekago = moment().subtract(7, 'days').calendar();
            var twoweekago = moment().subtract(14, 'days').calendar();

            console.log('现在：'+nowTime+';3天前：'+threedayago+';7天前：'+weekago+';14天前：'+twoweekago);*/
            
            
        })
        
    }else{
        res.redirect('/');
    }
}

/*
@ message jsonp 接口[赞、评论 数据封装见相应接口 mup  mcomment]
@ 请求参数 time mark order 值见 sql 对象
@ jsonp  code message data
@ 权限： 必须登录后的用户才接受请求  http://localhost:3000/message?callback=dataList&time=w1&sta=show&order=read&mark=tp
*/
exports.message = function (req, res) {
    var doc = {
        time: 'w1', 
        mark: 'tp', 
        order: 'time', 
        sta: 'showall'
    };
    var name = req.session.username;

    if (name) {

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

        };

        //防止 query的参数不在 sql 对象中（ undefined ）, 如果 undefind 则为默认值
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

        //console.log('req.query.order'+req.query.order+"---doc['order'] :"+doc['order'] );

        // var day3fomat = new Date(sql['d3']*1000).toLocaleString();
        // console.log('day3fomat:'+day3fomat+';day3agoUnix:'+sql['d3']);
        var messageSQL = 'select lf_users.user_id,lf_users.sex,lf_users.nickname,lf_users.avatar,lf_message.msg_id,lf_message.user_id,lf_message.message,lf_message.photo,lf_message.location,lf_message.up_count,lf_message.comment_count,lf_message.read_count,lf_message.order_count,lf_message.status,lf_message.feedtype,lf_message.ctime from lf_users,lf_message where lf_users.user_id=lf_message.user_id and lf_message.ctime>='+sql[doc['time']]+sql[doc['sta']]+sql[doc['mark']]+' order by lf_message.order_count desc,'+sql[doc['order']]+' desc limit 10000';
        //select * from lf_message where ctime>=1431739693 and message=''  order by ctime desc limit 100000

        //每次查询1w条，前期不做分页 

        db.query(messageSQL, function (messageList) {

            var data = {
                length : messageList.length,
                list : messageList,
            };
            fun.jsonTips(req, res, 2000, config.Code2X[2000], data);
        })

    }else{
        fun.friendlyError(req, res, config.Code2X[2003]);
    }
        
}


/*
@ mcomment jsonp  评论接口
@ 相关参数  msg（all filter）id（Num） time ，主要用于前端对 message 的补充
@ jsonp  code message data
@ 权限：登录用户 http://localhost:3000/mcomment?msg=filter&id=668&time=w1
@              http://localhost:3000/mcomment?msg=del&time=m1
*/


// 增加2 新建一个字段 type 区别评论回收站
//alter table lf_message_comment add type int(11) NOT NULL DEFAULT '1' after id;
//alter table `lf_message_comment` drop column type; 

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
            del         : 'lf_message_comment.type="0" and',
            //过滤没有被放回收站的
            ready       : 'lf_message_comment.type="1" and',
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
        //防止 query的参数不在 sql 对象中（ undefined ）, 如果 undefind 则为默认值
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

        console.log("sql[doc['msg']]: "+sql[doc['msg']]);
        //若是 被删除的评论 则再选出 删除时间和删除人
        var commentSQL = 'select lf_message_comment.id,lf_message_comment.msg_id,lf_message_comment.user_id,lf_message_comment.type,lf_message_comment.user_id_b,lf_message_comment.message,lf_message_comment.ctime,lf_message_comment.is_read,lf_users.user_id,lf_users.nickname,lf_users.sex,lf_users.avatar from lf_users,lf_message_comment where '+sql[doc['msg']]+' lf_users.user_id=lf_message_comment.user_id and lf_message_comment.ctime>='+sql[doc['time']]+' order by lf_message_comment.ctime desc limit 10000';
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
        //防止 query的参数不在 sql 对象中（ undefined ）, 如果 undefind 则为默认值
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
    var doc ={
        id          : '0',
        value       : '0'
        //id      : '',
        //time: 'w1', 
    };
    if (name&&type==8) {

        if (req.query.id) {
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
@ 消息推荐 order_count  Message API
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

        if (req.query.id) {
            doc['id'] = req.query.id;
            if (req.query.value) {
                doc['value'] = req.query.value;
                var updateSQL = "update lf_message set order_count = '"+doc['value']+"',examine_admin='"+name+"',examine_time='"+ fun.nowUnix() +"' WHERE lf_message.msg_id = '"+doc['id']+"'";
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

        if (req.query.id) {
            doc['id'] = req.query.id;
            if (req.query.value) {
                doc['value'] = req.query.value;
                var updateSQL = "update lf_message_comment set type = '"+doc['value']+"',examine_admin='"+name+"',examine_time='"+ fun.nowUnix() +"' WHERE lf_message_comment.id = '"+doc['id']+"'";
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
    var sql  = 'select * from lf_users where user_id="'+query.name+'" and passwd="'+query.password+'"';
    if(query.name==''||query.password==''){
        var text = config.Code4X[1002];
        fun.friendlyError(req, res, text);
    }else{
        //先查询 是否有此 用户名
        //扩展： 手机号、邮箱、用户名 任意登录
        // 增加1 新建一个字段 type 区别管理员
        //alter table lf_users add type int(11) NOT NULL DEFAULT '1' after user_id;
        //alter table `lf_users` drop column type;  
        db.query(sql, function(rows){   
            if (rows.length=='1') {
                console.log(rows);
                req.session.username = query.name;
                req.session.result = 1;
                req.session.type = rows[0].type
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


//------------------------------------------------------------------------

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
    res.render('admin', {
        title: config.productInfo.admin,
        result:0,//未登录
        resultREG:0//未注册
    })
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
        

/*    console.log(q);
    console.log(picname);
    typeof(req.body);*/
    if (!username) {
        //文件上传
        console.log('文件上传');
        console.log(q);

        var form=new formidable.IncomingForm();
        form.encoding = 'utf-8';        //设置编辑
        form.uploadDir = picPATH;     //设置上传目录
        form.keepExtensions = true;     //保留后缀
        form.maxFieldsSize = 2 * 1024 * 1024;   //文件大小

        form.parse(req,function(err,fields,files){

            console.log(files);

            if (files.files.name=='') {
                //没有上传文件
                fun.friendlyError(req, res, config.Code4X[4031]);
                //fun.uploadHtml(req, res, resultPic, username);

            } else{

                var extName = 'gif';  //后缀名
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
                        extName = 'gif'        
                }

                var resultPic = req.session.username+'-'+Date.now()+'.'+extName;

                try{
                    fs.renameSync(files.files.path, picPATH+resultPic);
                    fun.uploadHtml(req, res, resultPic, username);
                    //fun.jsonTips(req, res, 2000, config.Code2X[2000], resultPic);
                }catch(e){
                    fun.jsonTips(req, res, 5021, config.Code2X[5021], e);
                }

            };

            

            
            
        });


    } else{
        //get上传页面 req.query
        console.log('上传页面');


        if (req.session.username==username) {
            fun.uploadHtml(req, res, '1', username);
        

        } else{
            res.redirect('/home');

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

exports.getpic = function(req, response){
    var q = req.query,
        picname = q.picname;
    var extName = picname.split('.')[1];
    console.log(extName);
    
    fs.readFile(picPATH+picname,'binary',function(err,file){
        if(err){
            response.writeHead(500,{'Content-Type':'text/plain'});
            response.write(err+'\n');
            response.end();
        }else{
            response.writeHead(200,{'Content-Type':'image/'+extName});
            response.write(file,'binary');
            response.end();
        }
    });
}

