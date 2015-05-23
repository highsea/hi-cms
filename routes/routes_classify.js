/**
 * Routes for 导航、文章分类目录
 * github: https://github.com/highsea/hi-blog
 * @author Gao Hai <admin@highsea90.com>
 * @link http://highsea90.com
 */
var database = require('./../db/userlist_comment_article.js'),
    fun = require('./function.js');

//get 新增 菜单分类/名称/介绍/父级
exports.addnav = function(req, res){
    //管理员权限验证
    fun.login_verify(req, res, function(){
        //提交参数验证
        fun.add_update_menu(req, res, function(){

            var r = req.query,
                doc = {
                    name    : r.english,
                    title   : r.title,
                    content : r.content,
                    parent  : r.parent,
                    order   : r.order
                }
            //查询去重 //name 不能重复//title可以
            database.classify.count({name:r.english}, function(err, result){
                if (err) {
                    fun.jsonTips(req, res, 5001, err, '');
                }else{
                    if (result) {
                        fun.jsonTips(req, res, '3014', 'menu exist', '菜单简写已经存在');
                    }else{
                        //插入操作
                        database.classify.create(doc, function(err){
                            fun.json_api(req, res, err, doc);
                        })
                    }
                }
            })
        })
    }) 
}

//获取菜单 //无权限
exports.getnav = function (req, res){
    //find默认查询结果 按时间顺序，id的算法中 包含时间
    //find()方法如添加第三个参数进行排序，那第二个条件也不能省无则须写成null
/*    database.classify.find(null, {sort: [['_id', -1]]}, function(err, doc){
        fun.json_api(req, res, err, doc);
    })*/

    //.limit(10) //全部显示
    database.classify.find({}).sort({'order':-1}).exec(function(err,doc){
        fun.json_api(req, res, err, doc);
    })
}

//更新菜单 管理员权限
exports.up1nav = function(req, res){
    //管理员权限验证
    fun.login_verify(req, res, function(){
        //提交参数验证
        fun.add_update_menu(req, res, function(){

            var r = req.query,
                doc = {
                    name    : r.english,
                    title   : r.title,
                    content : r.content,
                    parent  : r.parent,
                    order   : r.order
                }
            //查询去重 //name 不能重复//title可以
            database.classify.count({name:r.english}, function(err, result){
                if (err) {
                    fun.jsonTips(req, res, 5001, err, '');
                }else{
                    if (result) {
                        fun.jsonTips(req, res, '3014', 'menu exist', '菜单简写已经存在');
                    }else{
                        //插入操作
                        database.classify.create(doc, function(err){
                            fun.json_api(req, res, err, doc);
                        })
                    }
                }
            })
        })
    }) 
}

exports.category = function(req, res){

    if (req.session.username) {
        var result = 1
    }else{
        var result = 0
    }
    // req.query.classify 对该值判断以确定 是否渲染什么页面

    res.render('category', {
        title: req.query.classify,
        result: result
    })
}