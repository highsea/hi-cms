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


var session = require('express-session');
var redisStore = require('connect-redis')(session);

var app = express();


app.use(session({
  // 假如你不想使用 redis 而想要使用 memcached 的话，代码改动也不会超过 5 行。
  // 这些 store 都遵循着统一的接口，凡是实现了那些接口的库，都可以作为 session 的 store 使用，比如都需要实现 .get(keyString) 和 .set(keyString, value) 方法。
  // 编写自己的 store 也很简单
  store: new redisStore(),
  secret: 'xiaojiaoyartoken'
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


app.use(express.cookieParser());
app.use(express.cookieSession({secret : 'oa.xiaojiaoyar.com'}));
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
//会员
app.get('/login', routes.login);//
app.get('/logout', routes.logout);//
app.post('/home', routes.homepost);//post
app.get('/home', routes.homeget);//
app.get('/message', routes.message);
app.get('/mcomment', routes.mcomment);
app.get('/mup', routes.mup);
app.get('/recycleMessage', routes.recycleMessage);
app.get('/goodMessage', routes.goodMessage);
app.get('/setComment', routes.setComment);






app.post('/adduser',routes.adduser);
app.get('/adduserget',routes.adduserget);
app.get('/register', routes.register);//
app.get('/forget', routes.forget);//
app.get('/email', routes.email);//

app.get('/admin', routes.admin);

//登录查找单用户全字段
app.get('/getuser', routes.getuser);//by id 二次登陆
app.get('/userbyname', routes.userbyname);// name 二次登陆
app.get('/sessionuser', routes.sessionuser);// 当前登录用户

app.get('/up1user', routes.up1user);
app.get('/userCount', routes.userCount);
app.get('/remove1user', routes.remove1user);
app.get('/oneuser', routes.oneuser);


//其他
app.get('/friendly-error', routes.friendlyError);
app.post('/upload', routes.upload);
app.get ('/upload', routes.upload);

app.get('/getpic', routes.getpic);




http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
