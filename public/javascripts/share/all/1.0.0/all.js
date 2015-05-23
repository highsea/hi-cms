define(function(require, exports, module) {

	$ = typeof(Zepto)=='undefined'?jQuery:Zepto;

	//var Zepto = require("zepto");

	// (function($){
	// 	$.extend($.fn, {
	// 		foo: function(str){
	// 			alert(str);
	// 		}
	// 	})
	// })(Zepto)


	var all = {};


	// hiTab | $.fn.hiTab('#id')
	//elm | div#id > nav.tab-heading > ul > li.tab-inner
	//elm | div#id > nav.tab-body > ul > li.tab-inner


	$('body').on('click', '.close', function(event) {
		event.preventDefault();
		$(this).closest('div').remove();
	});




	all.textTips = {
		'mima0':'密码由字母,数字,下划线组成,长度为6-20',
		'mima1':'密码ok~',
		'youxiang0':'邮箱的格式，如：admin@idacker.com ',
		'youxiang1':'该邮箱可以抢注~ ',
		'dianhua0':'电话号格式：手机/座机/+86/010-',
		'dianhua1':'电话格式正确',
		'yonghuming0':'请以字母开头,可包含字符为:<br>数字 _ . <br>长度为:5-20',
		'yonghuming1':'该用户名可以抢注！',
		'0':'错误！请检查填写的信息',
		'1':'格式正确~',
	}

	all.authority = {
		0 : '已被注销',
		1 : '管理员',
		2 : '普通用户',
		3 : '订阅者',
		4 : '游客（禁言禁文）',
		5 : '被禁评论的用户',
		6 : '被禁发表文章的用户',
	}

	all.sex={
		0 : '女',
		1 : '男',
		2 : '未知',
	}

	all.alertFun = function(dom,text,pic){
		var resultHTML = text;
		all.inputBg(dom, pic);
		all.alertHtml('.form', 'info', resultHTML, '');
	}

	all.alertHtml = function(dom, info, title, message){

		$('.alert').remove();
		$(dom).append('<div class="alert '+info+'"><button type="button" class="close" data-dismiss="alert">×</button><strong>'+title+'</strong>'+message+'</div>');

		}

	all.inputBg = function(dom, pic){
		dom.css({
			backgroundImage: 'url(/images/'+pic+')',
			backgroundPosition: 'right',
			backgroundRepeat:'no-repeat'
		});
	}

	all.ajax = function(url, data, dom, callback){

		$.ajax({
			url: url,
			type: 'GET',
			dataType: 'jsonp',
			data: data,
			timeout: 3000,
	        jsonp : "callback",
	        jsonpCallback : "dataList",
			success : function (dataList){
				if (dataList.code==2000) {
					all.alertHtml(dom, 'success', '', dataList.message);


					callback(dataList);
				}else if(dataList.code==3001){
					all.alertHtml('.form', 'danger', '该账号已经被注册了', '');
					all.inputBg(dom, 'close.gif');
				}else{
					all.alertHtml(dom, 'warning', dataList.code, dataList.message);
				}
			},
			error : function(){
					all.alertHtml(dom, 'danger', dataList.code, dataList.message);
			}
		})
	}




	module.exports = all;
})
