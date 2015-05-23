/**
 * mongoose Schema 会员集合；评论；文章；栏目（菜单）；权限KEY
 * github: https://github.com/highsea/hi-cms
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */
var mongoose = require('mongoose'),
    config = require('./../db/config');

db = mongoose.createConnection();

//设置用户名密码端口数据库
db.openSet(config.dbLogin);
// 链接错误
db.on('error', function(error) {
    console.log(error);
});
var Schema = mongoose.Schema;

//用户信息表
var usersSchema =new Schema({
    //_id     : Schema.Types.ObjectId,  //主键
    nickname    : {type:String,required:true},//用户昵称=
    user_id     : {type:Number,default:0},//用户id系统生成=
    passwd      : {type:String,required:true},//密码=
    content     : {type:String,default:config.dbtext['dd']}, //个人简介－－－－－－
    sign        : {type : String,default:config.dbtext['whsh']},//签名=
    age         : {type:Number,min:0,max:110},//年龄=
    mobile      : String,//手机号登录app标识＝
    province    : {type : String,default:config.dbtext['whsh']},//省份=
    city        : {type:String,default:config.dbtext['whsh']},//城市=
    mtime       : {type : Date, default: Date.now},//修改会员时间＝
    ctime       : {type : Date, default: Date.now},//写入会员时间＝
    email       : {type:String,default:config.dbtext['wz']},//邮箱
    sex         : {type:Number,default:1}, //男1 女2 未知0=
    status      : {type:Number,default:2}, //注销 0 正常普通用户 1 删除 2 管理员 3 游客（禁言禁文） 4 被禁评论的用户 5 被禁发表文章的用户 6＝
    //comment : {type:Boolean,default:1}, //启用评论 1 禁止灌水 0
    //article : {type:Boolean,default:1}, // 启用文章 1 禁言 0
    //enable  : {type : Boolean, default: 1}, // 用户启用 1 注销 0
    living      : {type:Number,default:0}, //在线 1 离线 0 隐身 2－－－－－－－
    score       : {type:Number,default:0}, //积分=
    grade       : {type:Number,default:0},//等级分值＝
    follow      : {type:Number,default:0}, // 关注－－－－
    fans        : [String], //粉丝 array
    ubanner     : {type:String,default:config.dbtext['error-banner']},//用户信息背景－－－－－－－－
    avatar      : {type:String,default:config.dbtext['error-logo']},//头像地址=
    ucompany    : {type:String,default:config.dbtext['error-com']},//用户公司－－－－－－－
    reg_ip      : {type:String,default:config.dbtext['wz']},//注册ip＝
    ip          : [String],
    flag        : {type:Number,default:0},//注册方式，0:第三方微信 1:手机号注册 2:第三方微博 3:第三方qq＝
    platform    : {type:Number,default:0},//注册平台，0:微信 1:H5页面 2:android 3:ios＝
    last_ip     : {type:String,default:config.dbtext['wz']},//最后一次登录ip＝
    last_time   : {type:Date},//最后一次登录时间＝
    token       : {type:String,default:config.dbtext['token']},//认证字符串/票据=
    //addby   : {type:Number,default:0} //通过谁添加 0：自己注册 ， userid ：添加者
});


//宝贝孩子信息
var babySchema = new Schema({
    baby_id     : {type:Number,default:0},// id 系统生成
    sex         : {type:Number,default:0},//同上
    nickname    : {type:String,default:config.dbtext['wz']},//昵称
    birthday    : {type:Date,default:Date.now},//生日
})

//用户宝贝
var user_babySchema = new Schema({
    id          : {type:Number,default:0}, // id
    user_id     : {type : Number, default: 0},//用户id
    baby_id     : {type:Number,default:0},// baby id
})

//粉丝
var user_followsSchema = new Schema({
    id          : {type:Number,default:0}, // 编号
    follow_id   : {type:Number,default:0}, // 关注者（粉丝）id
    user_id     : {type : Number, default: 0},//用户id
    ctime       : {type : Date, default: Date.now},//关注时间
})

//举报的垃圾回收站
var feedbackSchema = new Schema({
    //_id     : Schema.Types.ObjectId,  //主键
    id          : {type:Number,default:0}, // 举报编号
    content     : {type:String,default:config.dbtext['wz']}, // 举报内容
    ctime       : {type : Date, default: Date.now},
});

//消息订阅 ［空］
var feedsSchema = new Schema({
    //_id     : Schema.Types.ObjectId,  //主键
    id          : {type:Number,default:0}, // feeds编号
    msg_id      : {type:Number,default:0}, // 消息编号
    user_id     : {type : Number, default: 0},//发消息的用户编号
    ctime       : {tpe : Number, default: 0},//feeds 时间戳
});

//朋友 ［空］
var friendsSchema = new Schema({
    id          : Number,
    userid      : Number,
    friend_id   : Number,
})

//发布动态
var messageSchema =new Schema({
    //_id     : Schema.Types.ObjectId,  //主键
    msg_id      : {type:Number,default:0}, //发布的消息id
    user_id     : {type:Number,default:0}, // 用户id
    message     : {type : String, default: config.dbtext['wz']}, //文本消息
    photo       : {type : String, default: config.dbtext['error-banner']}, //照片
    location    : {type : String, default: config.dbtext['wz']}, // 位置
    up_count    : {type:Number,default:0}, // 赞的个数
    comment_count:{type:Number,default:0}, // 评论个数
    read_count  : {type:Number,default:0}, // 阅读数量
    order_count : {type:Number,default:0}, //推荐排序值 越大越靠前
    status      : {type:Number,default:1}, // 审核状态 1:正常 0:不显示
    feedtype    : {type:Number,default:0}, // feed类型 0:普通 1:推荐 2:广告
    ctime       : {type:Date,default:Date.now}, // 发表时间

});

//用户评论
var message_commentSchema = new Schema({
    //_id     : Schema.Types.ObjectId,  //主键
    id          : {type:Number,default:0}, //  编号
    msg_id      : {type:Number,default:0}, //发布的消息id
    user_id     : {type:Number,default:0}, // 评论用户id
    user_id_b   : {type:Number,default:0}, // 评论用户id ?????????????????
    message     : {type : String, default: config.dbtext['wz']}, //评论内容
    ctime       : {type:Date,default:Date.now}, // 评论发表时间
    is_read     : {type:Number,default:0},
});


//评论被赞
var message_upSchema = new Schema({
    //_id     : Schema.Types.ObjectId,  //主键
    id          : {type:Number,default:0}, //  用户赞id
    msg_id      : {type:Number,default:0}, //消息id
    user_id     : {type:Number,default:0}, // 赞用户id
    ctime       : {type:Date,default:Date.now}, // 赞时间
});


//贴纸
var paster_infoSchema = new Schema({
    id          : {type:Number,default:0}, //  编号id
    type_id     : {type:Number,default:0}, //类别id
    description : {type:String, default:config.dbtext['wz']}, // 贴纸描述
    url         : {type:String,default: config.dbtext['error-logo']}, // 贴纸地址
    order_sort  : {type:Number,default:0},// 排序
    ctime       : {type:Date,default:Date.now}, // 贴纸创建时间
});

//贴纸分类菜单
var paster_typeSchema = new Schema({
    id          : {type:Number,default:0}, //  编号id
    typename    : {type:String,default: config.dbtext['wz']}, //  贴纸分类

})

//信息举报
var report_userSchema = new Schema({
    id          : {type:Number,default:0}, //  编号id
    userid      : {type:Number,default:0},//被举报的用户id
    report_user_id:{type:Number,default:0},//举报的用户
    msg_id      : {type:Number,default:0}, //被举报的消息id
    content     : {type:String, default:config.dbtext['wz']}, // 贴纸描述
    report_time : {type:Number,default:Date.now}, // 贴纸创建时间
});



// 二次登陆KEY
var apiKeySchema = new Schema({
    name    : {type:String,required:true}, // Key 的名称
    content : String, //key的具体 value
    time    : {type : Date, default: Date.now},
    type    : {type : Number, default: 1} // 默认启用 1 禁用 0 初步限制 2
})


exports.users           = db.model('If_users', usersSchema);
exports.baby            = db.model('If_baby', babySchema);
exports.user_baby       = db.model('If_user_baby', user_babySchema);
exports.user_follows    = db.model('If_user_follows', user_followsSchema);
exports.feedback        = db.model('If_feedback', feedbackSchema);
exports.feeds           = db.model('If_feeds', feedsSchema);
exports.friends         = db.model('If_friends', friendsSchema);
exports.message         = db.model('If_message', messageSchema);
exports.message_comment = db.model('If_message_comment', message_commentSchema);
exports.message_up      = db.model('If_message_up', message_upSchema);
exports.paster_info     = db.model('If_paster_info', paster_infoSchema);
exports.paster_type     = db.model('If_paster_type', paster_typeSchema);
exports.report_user     = db.model('If_report_user', report_userSchema);
exports.apiKey          = db.model('apiKeys', apiKeySchema);


