define(function(require, exports, module) {

	$ = typeof(Zepto)=='undefined'?jQuery:Zepto;

	var all = {};


	/*$.extend({
        getUrlVars: function(){
            var vars = [], 
                hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++){
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        getUrlVar: function(name){
            return $.getUrlVars()[name];
        }
    })
*/

	/*
	@  获取浏览器url 参数 （通过 hash 哈希值）
	*/
    all.getUrlVars = function(){
    	var vars = [], 
            hash;
        var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
        for(var i = 0; i < hashes.length; i++){
            hash = hashes[i].split('=');
            vars.push(hash[0]);
            vars[hash[0]] = hash[1];
        }
        return vars;

    }
    /*
    @ 获取 url 某个 参数值
    */
    all.getUrlVar = function(name){
        return all.getUrlVars()[name];
    }


/*
@ 普通时间 时间 转换为 unix
*/
	all.js_strto_time = function (str_time) {
		var new_str = str_time.replace(/:/g,'-');
	    new_str = new_str.replace(/ /g,'-');
	    var arr = new_str.split("-");
	    var datum = new Date(Date.UTC(arr[0],arr[1]-1,arr[2],arr[3]-8,arr[4],arr[5]));
	    return strtotime = datum.getTime()/1000;
	}
/*
@ unix 时间 转换为 普通时间 
*/

	all.js_date_time = function (unixtime) {
		var timestr = new Date(parseInt(unixtime) * 1000);
	    var datetime = timestr.toLocaleString().replace(/年|月/g, "-").replace(/日/g, " ");
	    return datetime;
	}

	//all.nav_click = function(dom,select){
		/*$('.nav_click').on('click', 'li', function(){
			$(this).addClass('current');
			$(this).siblings('li').removeClass('current');
		})*/
		$('.nav_click').children('li').children('[href="'+location.pathname+'"]').closest('li').addClass('current');

	//}
	/*$('body').on('click', '.hide_com_up', function(){
		$(this).find('.caption').toggleClass('none');
	})*/

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
		'nothing':'哎哟没有数据，换一个筛选条件试试看～',
		'load': '正在载入……',
		'confirm': '身份验证通过',
		'confirm_msg_re' : "身份验证通过，确定该操作吗？",
		'confirm_msg_good':"推荐数值越大越考前，确定该操作吗？",
		'host' : 'http://m.xiaojiaoyar.com/Uploads/Picture/',
		'webhost': 'http://m.xiaojiaoyar.com/',
		'picTemp': '/upload/temp/'
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
		2 : '女',
		1 : '男',
		0 : '未知',
	}

	all.alertFun = function(dom,text,pic){
		var resultHTML = text;
		all.inputBg(dom, pic);
		all.alertHtml('.form', 'info', resultHTML, '');
	}

/*
@ 一个 tips 
*/
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
	/*
	@ 获取当前 host
	@*/
	all.domain = window.location.protocol+'//'+window.location.host;

	all.elm = function (dom){
		return $('.'+dom);
	}

/*
@ 展示评论 
*/

    all.showComment = function(dataList, callback){

    	var m = dataList.data.list,
			mLength = dataList.data.length;

    		
		var messageList = $('.messageList');
		messageList.find('.comment').children('p').html(all.innerHtml['comment']);

		for (var i = 0; i < mLength; i++) {
			var msg_id = m[i].msg_id,
				commentid = m[i].id,
				user_id = m[i].user_id,
				user_id_b = m[i].user_id_b,
				message = m[i].message,
				ctime = m[i].ctime,
				is_read = m[i].is_read,
				nickname = m[i].nickname,
				sex = m[i].sex,
				avatar = m[i].avatar;

			var currentDOM_msg = $('li[data-msgid="'+msg_id+'"]');

			/*if (user_id!=currentDOM_msg.data('user_id')) {

				var commentStr = '<p data-userid="'+user_id+'" data-useridb="'+user_id_b+'" class="commentUser sex_'+sex+' read_'+is_read+'"><a title="发表于'+A.js_date_time(ctime)+'">'+nickname+'<img class="avatar" src="/Uploads/Picture/'+avatar+'" ></a>: '+message+'</p>';

				currentDOM_msg.find('.comment').children('p').append(commentStr);
				
			}else if(user_id_b==currentDOM_msg.find('.comment').children('p').find('p').data('user_id')){
				var userID_BY_Str = '回复'+user_id_b+'：<p data-userid="'+user_id+'" data-useridb="'+user_id_b+'" class="commentUser sex_'+sex+' read_'+is_read+'"><a title="发表于'+A.js_date_time(ctime)+'">'+nickname+'<img class="avatar" src="/Uploads/Picture/'+avatar+'" ></a>: '+message+'</p>';
				currentDOM_msg.find('.comment').children('p').find('[data-userid="'+user_id_b+'"]').append(userID_BY_Str);

			}*/

			var commentStr = '<p class="commentHTML" data-commentid="'+commentid+'" data-userid="'+user_id+'" data-useridb="'+user_id_b+'" class="commentUser sex_'+sex+' read_'+is_read+'"><a title="发表于'+all.js_date_time(ctime)+'">'+nickname+'<img class="avatar" src="'+all.textTips['host']+avatar+'" ></a>: '+message+'  <i class="btn reComment"> 放回收站</i></p>';

			currentDOM_msg.find('.comment').children('p').append(commentStr);

			
		};

		callback();


    }


    all.paginator = function (cpage, nbtn, allp){

    	var options = {  
            bootstrapMajorVersion:3,  
            currentPage 	: cpage,//当前页面
            numberOfPages 	: nbtn,//一页显示几个按钮（在ul里面生成5个li）  
            totalPages		: allp //总页数  
        }  
    	return options;
    }



/*
@ 展示 message
@
*/
	all.showMessage = function (dataList, dom, callback) {
		

		var m = dataList.data.list;
		var page = {
			currentp : dataList.data.page.currentp,
			size : dataList.data.page.size,
			allnews : dataList.data.page.allnews,
			pageCount : dataList.data.page.pageCount,
		}
		//console.log(m)
		var dlength = dataList.data.length;
		var str = '';
			
		for (var i = 0; i < dlength; i++) {
			var user_id 	= m[i].user_id,
				sex 		= m[i].sex,
				avatar 		= m[i].avatar,
				nickname 	= m[i].nickname,
				msg_id 		= m[i].msg_id,
				message 	= m[i].message,
				photo 		= JSON.parse(m[i].photo),
				location 	= m[i].location,
				up_count 	= m[i].up_count,
				comment_count=m[i].comment_count,
				read_count 	= m[i].read_count,
				order_count = m[i].order_count,
				status 		= m[i].status,
				feedtype 	= m[i].feedtype,
				name 		= m[i].name,
				eadmin 		= m[i].examine_admin,
				etime 		= m[i].examine_time,
				ctime 		= m[i].ctime;

			var photoStr = '',
				cancelGood = '';

			//console.log(photo);

			if (photo.length>1) {
				for (var k = 0; k < photo.length; k++) {
					photoStr += '<li style="float:left"><img src="'+all.textTips['host']+photo[k]+'" alt="" /></li>';
				};

			}else{
				photoStr += '<li><img src="'+all.textTips['host']+photo[0]+'" alt="" /></li>'
			}
			//如果 推荐了 则取消推荐
			if (feedtype!='0') {
				if (order_count==0) {
					cancelGood = ' &nbsp; <a class="btn cancel_good btn-warning">已取消置顶 </a>';
				}else{
					cancelGood = ' &nbsp; <a class="btn cancel_good btn-warning">取消推荐 </a>';
				}
			};

			str += '<li class="span11 status_'+status+'" data-msgid="'+msg_id+'" data-userid="'+user_id+'" data-sex="'+sex+'" data-eadmin="'+eadmin+'" data-etime="'+etime+'">'+
			                '<div data-feedtype="'+feedtype+'" class="thumbnail">'+
			                  '<h4><small>[第<em>'+page['currentp']+'</em>页：'+(i+1)+'/'+dlength+']</small>'+
			                  '<img class="avatar" src="'+all.textTips['host']+avatar+'" alt="" /><a href="/soso?userid='+user_id+'&tab=userzone">'+nickname+'</a><br><small class="goods_info"><i class="none">推荐设置者:'+eadmin+'，设置时间:'+all.js_date_time(etime)+'</i></small> </h4>'+
			                  '<small>发表于：'+all.js_date_time(ctime)+' </small> '+
			                  ' | <small> 用户id：<a href="/soso?userid='+user_id+'&tab=userzone">'+user_id+' </a></small> | <small> 消息id：<a href="/soso?msgid='+msg_id+'">'+msg_id+'</a></small>'+
			                  '<p>浏览数：<span>'+read_count+'</span> 评论数：<span>'+comment_count+'</span> 赞：<span>'+up_count+'</span></p>'+
			                  '<p>'+message+'</p>'+
			                  '<ul class="message_img">'+photoStr+'</ul>'+
			                  	  
			                  '<div class="caption up">'+
			                  	'<p> <a class="btn upMessage">赞：</a> 正在载入……</p>'+
			                    '<ul></ul>'+
			                  '</div>'+
			                  '<div class="caption comment">'+
			                    '<p><a class="btn commentMessage">评论：</a> 正在载入……</p>'+
			                  '</div>'+
			                  '<div class="caption order">'+
								'<a class="btn btn-success goodmsg" data-ordercount="'+order_count+'" data-feedtype="'+feedtype+'">'+name+' ▼ </a> '+
								'&nbsp; <a class="btn btn-danger recycleMessage ">动态放回收站 </a> '+cancelGood+
			                  '</div>'+
			                  '<div class="caption feedtypeInput">'+
			                  '</div>'+
			                  
			                '</div>'+
			              '</li>';

		}
		$(dom).children('ul').html(str);
		$(dom).siblings('.setpage').show().children('.pageinfo').html('一共<i>'+page['allnews']+'</i> 条结果，当前第<em>'+page['currentp']+'</em>页 <a data-next="'+(page['currentp']-1)+'" class="btn nextPage"> < 上一页</a> | <a data-next="'+(++page['currentp'])+'" class="btn nextPage">下一页 > </a>，分<b>'+page['pageCount']+'</b>页');



		callback();
	}

	all.innerHtml = {
		'up' : '<a class="btn btn-info upMessage">赞：</a><i></i>',
		'comment' : '<a class="btn btn-info commentMessage">评论：</a><i></i>',
		'cancel_good':'<a class="btn cancel_good btn-warning">取消推荐 </a>',
	}


	all.sosoMessage = function(dataList, callback){


		var u = dataList.data.user;
	        		//载入 用户信息
		all.userinfo(u)

		var m = dataList.data.list,
			mlength = m.length,
			data_tableArr = [];
		for (var i = 0; i < mlength; i++) {

			var status = m[i].status;
			var caozuoDom = '<a data-msgid="'+m[i].msg_id+'" data-status="'+status+'" class="btn setMessage btn-danger">删除动态</a>';

			if (status==1) {
				caozuoDom = '<a data-msgid="'+m[i].msg_id+'" data-status="'+status+'" class="btn setMessage btn-danger">删除动态</a>';
			};
			if (status==0||status==2) {
				caozuoDom = '<a data-msgid="'+m[i].msg_id+'" data-status="'+status+'" class="btn setMessage btn-warning">恢复动态</a>';
			};

			var picStr = '',
				picArr = JSON.parse(m[i].photo);

			if (picArr.length) {
				for (var k = 0; k < picArr.length; k++) {
					picStr += '<a href="'+all.textTips['host']+picArr[k]+'" target="_blank"><img class="pic90h" src="'+all.textTips['host']+picArr[k]+'"></a>'
				};
			};

			var new_data = {
				xuhao 		: i+1,
				msgid 		: '<a href="/soso?msgid='+m[i].msg_id+'">'+m[i].msg_id+'</a>',
				xinxi 		: '<p>阅读：'+m[i].read_count+'</p><p>推荐：'+m[i].order_count+'</p><p>评论：'+m[i].comment_count+'</p><p>赞：'+m[i].up_count+'</p>',
				xiaoxi 		: m[i].message,
				picture 	: picStr,
				feedtype 	: m[i].feedtype,
				shijian 	: all.js_date_time(m[i].ctime),
				caozuo 		: caozuoDom,
				caozuoren   : m[i].examine_admin,
				caozuotime  : all.js_date_time(m[i].examine_time),
			}
			data_tableArr.push(new_data);


		};


		var columnArr = [
		    { data : 'xuhao'},
		    { data : 'msgid'},
		    { data : 'xinxi'},
		    { data : 'xiaoxi'},
		    { data : 'picture'},
		    { data : 'feedtype'},
		    { data : 'shijian'},
		    { data : 'caozuo'},
		    { data : 'caozuoren'},
		    { data : 'caozuotime'},
		];

		callback(data_tableArr, columnArr)
	}

	//展示 查询用户的信息

	all.userinfo = function (u){
		$('.userinfo').html('<li class="sex_'+u.sex+' status_'+u.status+'"  data-userid="'+u.user_id+'"><b>用户信息：</b><a href="/soso?userid='+u.user_id+'&tab=userzone"><img class="avatar" src="'+all.textTips['host']+u.avatar+'">'+u.nickname+'['+u.sign+'('+u.province+u.city+')]'+'</a></li><li>注册时间：'+all.js_date_time(u.ctime)+'; 最后登录：'+all.js_date_time(u.last_time)+'</li>');
	}


//生成表格
    all.install_TB = function(t, dataArr, columnArr, tableHead){

    //$('.modal-body').html('<table id="modal_table"></table>');
    $('#'+t).html('')
    .append(tableHead)
    .DataTable({
        data    : dataArr,
        columns : columnArr,
        "sDom"  : "l f t i p r",
        "oLanguage": {
        "sLengthMenu": "每页显示 _MENU_ 条",
        "sZeroRecords": "哎哟，找不到……",
        "sInfo": "从 _START_ 到 _END_ /共 _TOTAL_ 条数据",
        "sInfoEmpty": "没有数据",
        "sInfoFiltered": "(从 _MAX_ 条数据中检索)",
        "sSearch" : "任意关键字检索",
        "oPaginate": {
            "sFirst": "首页",
            "sPrevious": "前一页",
            "sNext": "后一页",
            "sLast": "尾页"
            },
        "sZeroRecords": "没有检索到数据",
        "sProcessing": "<img src='http://images.cnitblog.com/blog2015/531703/201503/241551310675303.gif' />"
        }
    });

}


/*
@ 重新封装了 AJAX （支持 callback）
*/
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
					//all.alertHtml(dom, 'success', '', dataList.message);


					callback(dataList);

					//console.log(dataList);

				}else if(dataList.code==3001){
					all.alertHtml('.form', 'danger', '该账号已经被注册了', '');
					all.inputBg(dom, 'close.gif');
				}else{
					all.alertHtml(dom, 'warning', dataList.code, dataList.message);
				}
			},
			error : function(){
					all.alertHtml(dom, 'danger', '网络错误', '请稍后重试');
			}
		})
	}



	module.exports = all;

})
