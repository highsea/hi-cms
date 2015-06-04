/**
 * 参数、提示、数据库、邮箱信息设置
 * github: https://github.com/highsea/hi-cms
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */

// 需要登录的mongodb
// mongodb://admin:123456@192.168.1.100:27018/yourdb
// xiaojiaoya@123 www.xiaojiaoyar.cn:27017/admin
var dbLogin = 'mongodb://xjy:xjy123@localhost:27017/xiaojiaoyar',
	// 自动发送邮件的 参数
	emailArr = {
        user: 'hi_blog@126.com',//admin@admin.com
        pass: 'hiblog083'//123456
	},
	productInfo = {
		name : "奔跑的小脚丫",
		index : '首页',
		login : '登陆',
		activity:'活动',
		soso : '搜索',
		paster : '贴纸管理',
		forget : '忘记密码页面',
		register : '用户注册页面',
		home : '的主页',
		admin: '管理员页面',
		subject : '的项目',
		collect : '的收藏',
		wxinit : '微信设置',
		friendlyError : {
			title:'你犯了一个错误',
			text:'你直接打开了这个页面，尽管你没犯什么错误 0.0！',
		},
		key : 'SRV_AUTH_KEY',
		by : "Powered by HighSea90 © 2015-2025 highsea90.com",
		appid : 'wxb9ed4cc31a9e0743',
		secret : 'ac5d01394bc89aa963836c2f88719eba',
	},
	//信息提示 1XXX
	Code1X = {
		1001:'没有匹配的账号或邮箱',
		1002:'不填用户名/手机号/邮箱/和密码怎么登陆',
		1003:'注册用户必须填写：用户名、密码、邮箱',
		1020:'没有填写信息',
		1021:'没有填写id，该接口通过ID查询',
		1022:'没有填写name，该接口通过name查询',
		1023:'没有填写value，该接口通过value设置值',
		1024:'没有填写stype，该接口通过type查询',
		1025:'参数不正确，请查看 API 文档',


	},
	//正常接收 2XXX
	Code2X = {
		2000:'success',
		2030:'您居然没有邮箱！email:',
		2012:'相关数据已经存在',
		2013:'需要分类名 name 和该类值 value , 禁止多条件查询',
		2010:'请检查用户名密码以及分类',
		2011:'请检查菜单字母简写和中文名',
		2003:'您需要先登录',
		2004:'您需要先登录，或者您的权限不够高！',

	},
	//重定向 3XXX
	Code3X = {
		3000:'警告：非法key，你的行为已被记录',
		3001:'重复，已经存在',
	},
	//客户端错误 4XXX
	Code4X = {
		4001:'没有匹配的账号或邮箱',
		4002:'没有匹配的用户名手机号或邮箱(目前仅支持用户名登陆)',
		4020:'发送失败：',
		4001:'您没有权限，需要密钥哦',
		4015:'数据不存在',
		4030:'您居然没有邮箱！email:',
		4031: '该用户不存在',
		
	},
	//服务器错误 5XXX
	Code5X = {
		5020:'success',
		5019:'内部错误：',
	},
	//领域左起0-1位是一级分类，左起2-3位是二级分类，4-5是三级分类
	scopeList = {
		//参考淘宝行业分类
		000000:'未知',//这些是超出认知范围的类目总和
		010000:'服饰鞋包',//包含箱包皮具、男女装、服饰配件
		020000:'3C数码',//各类电子/穿戴/家电/以及周边设备总称
		030000:'生活服务',//人们日常“衣食住行用”都属于这类服务的范畴
		040000:'游戏话费',//各类游戏装备/各类点卡话费充值
		050000:'食品保健',//蔬菜、水果、干货、粮油、滋补品
		060000:'母婴幼儿',//和孕妇相关的用品/奶粉/益智玩具/早教
		070000:'家装家饰',//五金建材/电工主材/灯具装潢/软饰工艺
		080000:'美容护理',//美容养生按摩
		090000:'家居用品',//家电、家装
		100000:'珠宝配饰',//珠宝首饰
		110000:'运动户外',//运动、户外/体育
			110100:'旅游',
		120000:'汽车配件',//汽修
		130000:'玩乐收藏',//古玩、古董
			130101:'室内外游戏',
			130102:'电玩城',
		140000:'书籍音像',//书籍
		150000:'服务市场',//第三产业（电商/金融、it……）
			150100:'电子商务',
			150200:'互联网',
				150201:'移动互联网',
				150202:'互联网金融',
				150203:'动漫',
			150300:'银行保险',
			150400:'企业服务',
		160000:'其他行业',//淘宝官方描述：乐器/吉他/钢琴/配件
		170000:'淘宝新行业',//淘宝都还没给他们分类
		180000:'近期无经营',//这些类目的运营一直在偷懒从未被超越
	},
	//发展阶段
	stage = {
		00:'未知',
		01:'创意',//
		02:'demo',
		03:'正式开发',
		04:'预发布',
		05:'上线',
		06:'运营',
		07:'数据分析',
		08:'优质会员服务',
		09:'上万会员',
		10:'百万会员',
	},
	//融资情况
	financing ={
		00:'不明确',
		01:'种子天使',
		02:'天使轮战略',
		03:'天使轮',
		04:'Pre-A轮',
		05:'A轮',
		06:'B轮战略',
		07:'B轮',
		08:'C轮',
		09:'D轮',
		10:'E轮',
		11:'F轮-PreIPO',
		12:'IPO上市及以后',
	},
	//dbtext
	dbtext = {
		'dd':'这个人比较低调~',
		'whsh':'五湖四海',
		'error-banner':'upload/error-banner.gif',
		'error-logo':'upload/error-logo.gif',
		'error-com':'未知的公司',
		'wz':'未知',
		'token':'hicms',
	};


	mysqlText = {
		message 	: 'select count(*) from lf_message',
		message_0_10: function (req, res) {
							var page = 20;
							if(typeof(req.query.p)!='undefined'){
								var page = req.query.p < 1 ? 1 : req.query.p;
							}
							return 'select msg_id from lf_message where status="1" and msg_id>=(select msg_id from lf_message limit 1000000, 1) order by ctime desc limit '+page;
						},//asc 小到大 desc 大小
						//SELECT * FROM table WHERE id >= (SELECT id FROM table LIMIT 1000000, 1) LIMIT 10; 
		users 		: 'select count(*) from lf_users',
		showfeedtype : 'select * from lf_feed_type order by type desc',

	}

//登陆失败页面|404等错误提示页面|个人中心页|项目修改页|活动增加页




exports.dbLogin 	= dbLogin;
exports.emailArr 	= emailArr;
exports.productInfo = productInfo;
exports.Code1X 		= Code1X;
exports.Code2X 		= Code2X;
exports.Code3X 		= Code3X;
exports.Code4X 		= Code4X;
exports.Code5X 		= Code5X;
exports.scopeList 	= scopeList;
exports.stage 		= stage;
exports.financing 	= financing;
exports.dbtext 		= dbtext;
exports.mysqlText 	= mysqlText




