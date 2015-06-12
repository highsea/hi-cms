/**
 * 依赖、路由、app
 * github: https://github.com/highsea/hi-cms
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */

var express = require('express')
  , routes = require('./routes')
  , user = require('./routes/user')
  //, routes_classify = require('./routes/routes_classify.js')
  , http = require('http')
  , path = require('path')
  , ejs = require('ejs');
  //, SessionStore = require("session-mongoose")(express);

// var store = new SessionStore({
// 	url: "mongodb://localhost/session",
// 	interval: 120000
// });


/*var session = require('express-session');
var redisStore = require('connect-redis')(session);

var app = express();


app.use(session({
  // 假如你不想使用 redis 而想要使用 memcached 的话，代码改动也不会超过 5 行。
  // 这些 store 都遵循着统一的接口，凡是实现了那些接口的库，都可以作为 session 的 store 使用，比如都需要实现 .get(keyString) 和 .set(keyString, value) 方法。
  // 编写自己的 store 也很简单
  store: new redisStore(),
  secret: 'xiaojiaoyartoken'
}));*/

//

var session = require('express-session');
var cookieParser = require('cookie-parser');

var app = express();

app.use(cookieParser());
app.use(session({
    secret: 'xiaojiaoyar',
    name: 'testapp',   //这里的name值得是cookie的name，默认cookie的name是：connect.sid
    cookie: {maxAge: 18000000 },  //设置maxAge是80000ms，即80s后session和相应的cookie失效过期
    resave: false,
    saveUninitialized: true,
}));






// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', __dirname + '/views');
app.engine('.html', ejs.__express);
app.set('view engine', 'html');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.urlencoded());
app.use(express.methodOverride());


//app.use(express.cookieParser());
//app.use(express.cookieSession({secret : 'www.xiaojiaoyar.com'}));
// app.use(express.session({
// 	secret : 'oa.xiaojiaoyar.com',
// 	store: store,
// 	cookie: { maxAge: 900000 }
// }));
app.use(function(req, res, next){
	res.locals.user = req.session.user;
	next();
});


app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));


// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.render('error', {
        message: err.message,
        result: err.resultlogin,
	    title: err.message,
        error: {},
        //textStatus : err.navText
    });
});
/// catch 404 and forwarding to error handler
app.use(function(req, res, next) {
    var err = new Error('找不到这个页面');
    err.status = 404;
    err.resultlogin = 0;//未登录
    next(err);
});
// development only
if ('development' == app.get('env')) {
  	//app.use(express.errorHandler());
	app.use(function(err, req, res, next) {
	    res.render('error', {
	        message: err.message,
	        title: err.message,
	        result: err.resultlogin,
	        error: err
	    });
	});
}

app.get('/', routes.index);
app.get('/index', routes.index);

app.get('/users', user.list);
// 项目路由
//
app.get('/login', routes.login);//
app.get('/logout', routes.logout);//
app.post('/home', routes.homepost);//post
app.post('/postmd5', routes.postmd5);//post

app.get('/home', routes.homeget);//

app.get('/message', routes.message);
app.get('/onecomment', routes.onecomment);
app.get('/oneup', routes.oneup);
app.get('/mcomment', routes.mcomment);
app.get('/mup', routes.mup);
app.get('/recycleMessage', routes.recycleMessage);
app.get('/goodMessage', routes.goodMessage);
app.get('/ordernull', routes.ordernull);

app.get('/setComment', routes.setComment);
app.get('/lookmsg', routes.lookmsg);
app.get('/soso', routes.soso);
app.get('/userinfo', routes.userinfo);
app.get('/up1user', routes.up1user);
app.get('/lookuser', routes.lookuser);
app.get('/userzone', routes.userzone);
//贴纸页面
app.get('/paster', routes.paster);
//更新 单个贴纸所有信息
app.get('/uppaster', routes.uppaster);
//贴纸 放回收站 恢复
app.get('/delpaster', routes.delpaster);
// 创建贴纸
app.get('/createpaster', routes.createpaster);
//获取贴纸
app.get('/pasterinfo', routes.pasterinfo);
// 获取贴纸分类
app.get('/pastertype', routes.pastertype);
// 贴纸排序 上下移动 
app.get('/orderpaster', routes.orderpaster);
// 置顶 贴纸
app.get('/dingpaster', routes.dingpaster);

app.get('/randommj', routes.randommj);
app.get('/createcomment', routes.createcomment);
app.get('/createup', routes.createup);

app.get('/weixin', routes.weixin);
app.get('/wxinit', routes.wxinit);
app.get('/sha1', routes.sha1);
app.get('/wxactive', routes.wxactive);

app.get('/showfeedtype', routes.showfeedtype);
app.get('/upfeedtype', routes.upfeedtype);
app.get('/createfeedtype', routes.createfeedtype);
app.get('/deletefeedtype', routes.deletefeedtype);
app.get('/createmini', routes.createmini);




app.post('/adduser',routes.adduser);
app.get('/register', routes.register);//
app.get('/forget', routes.forget);//
app.get('/email', routes.email);//

app.get('/admin', routes.admin);

//登录查找单用户全字段
app.get('/getuser', routes.getuser);//by id 二次登陆
app.get('/userbyname', routes.userbyname);// name 二次登陆
app.get('/sessionuser', routes.sessionuser);// 当前登录用户

app.get('/userCount', routes.userCount);
app.get('/remove1user', routes.remove1user);
app.get('/oneuser', routes.oneuser);


//其他
app.get('/friendly-error', routes.friendlyError);
app.post('/upload', routes.upload);
app.get ('/upload', routes.upload);

app.get('/getpic', routes.getpic);

app.get('/passwordMD5', routes.passwordMD5);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
