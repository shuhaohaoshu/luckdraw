document.oncontextmenu = new Function("event.returnValue=false");
document.onselectstart = new Function("event.returnValue=false");
//抽奖号码
var xinm = [];
for(var i = 1;i<=84 ;i++){
	i = i.toString();
	if(i<10){
		xinm.push("0"+i)
	}else{
		xinm.push(i)
	}
}
var nametxt = $('.name');
var pcount = xinm.length;//参加人数
var runing = true;  
var num = 0; //随机数存储
var t;//循环调用
var pdnum = pcount;//参加人数判断是否抽取完
//登录限制
$.ajax({
	url:"/api/lottery/is-login",
	success:function(e){
		if(e.state){ //验证登录
			if(e.data.is_login==0){
				layer.prompt({
					title: '请输入密码', 
					btn: ['确定'],
					closeBtn:0,
					formType: 1
				}, function(pass, index){
					$.ajax({
						url:"/api/lottery/login?password="+pass,
						success:function(e){
							if(e.state){ //登录成功
								layer.close(index);
								getList();
							}else{ //登录失败
								layer.msg(e.msg);
							}
						}
					})
				});
			}else{
				getList();
			}
		}else{ //验证登录
			layer.msg(e.msg);
		}
	}
});
//获取抽奖数据初始化
function getList(){
	$.ajax({
		url:"/api/lottery/lists",
		success:function(e){
			var list = e.data;
			if(list.length!=0){
				for(var i  = 0;i<list.length ;i++){
					$('.zjmd_bt_xy').append("<div>"+
						"<img src='./images/delete.png' class='delete'>"+
						"<span class='zjmd_num'>"+list[i]+"</span>"+
						"<span>.</span>"+
					"</div>");
					if(i<5){
						$('.conbox').append("<p>"+list[i]+"</p>");
					}
					xinm[$.inArray(list[i], xinm)] = "";
				}
				$('.lucknum').css('display','none');
				$(".conbox p:last").addClass("span");
				var zjnum = $('.zjmd_bt_xy>div');
				if(zjnum.length == pdnum){
					$("#btntxt").addClass("btn_none").html('抽奖');
				}
			}
		}
	});
}

var isClick = true;

function start(){
	$('.delete').removeClass('show');
	var zjnum = $('.zjmd_bt_xy>div');
	if(zjnum.length == pdnum){
		$("#btntxt").addClass("btn_none");
		layer.alert('所有抽奖号码已抽完，无法抽奖。',{title:'提示'});
		return false;
	}else{
		if (runing) {
			//抽奖防止连续点击
			if(isClick){
				isClick = false;
				setTimeout(function(){
					isClick = true;
				},5000);
			}else{
				layer.alert('请5秒后再点击',{
					title:'提示',
				});
				return;
			}
			runing = false;
			$('#btntxt').removeClass('start').addClass('stop');
			$('#btntxt').html('停止');
			startNum();
			$(".turntable .img").css("animation","0.6s linear 0s normal none infinite rotate");
			$(".turntable .img").css("animation-play-state","running");
			
		} else {
			runing = true;
			$('#btntxt').removeClass('stop').addClass('start');
			$('#btntxt').html('抽奖');
			stop();
	        bzd();//中奖函数
	        $('#btnqx').css('display','block');
	        $('.lucknum').css('display','none');
			$(".turntable .img").css("animation-play-state","paused");
			
		}
	}
}

//大奖开始停止
$('.start').click(function(){
	start();
});

//空格启动转盘
$(document).keyup(function(e){
	if(e.keyCode==32){
		start();
	}
});

//循环参加名单
function startNum() {
	num = Math.floor(Math.random() * pcount);
	while (xinm[num] == "") {
	    num = Math.floor(Math.random() * pcount);
	}
	nametxt.html(xinm[num]);
	t = setTimeout(startNum, 0);
}

//停止跳动
function stop() {
	clearInterval(t);
	t = 0;
	document.getElementById('success').play();
}

//打印中奖名单
function bzd() {
	//打印中奖者名单
	if($('.conbox>p').length==5){
		$('.conbox>p:last-child').remove();
	}
	$('.conbox').prepend("<p>"+xinm[num]+"</p>");
	$(".lucknum span:last,.conbox p:last").addClass("span");
	$('.confirmbox').show();
	$('.zjmd_bt_xy').prepend("<div>"+
		"<img src='./images/delete.png' class='delete'>"+
		"<span class='zjmd_num'>"+xinm[num]+"</span>"+
		"<span>.</span>"+
	"</div>");
	//添加抽中号码
	$.ajax({
		url:"/api/lottery/draw?number="+xinm[num],
	})
    //将已中奖者从数组中"删除",防止二次中奖
	xinm[$.inArray(xinm[num], xinm)] = "";
}
//编辑
$('.edit').click(function(){
	$('.delete').toggleClass('show');
});
//删除开奖号码
$('.zjmd_bt_xy').on('click','.delete',function(){
	var self = this;
	layer.confirm('确定删除当前开奖号码？', {
		title:'提示',
		btn: ['确定','取消'] //按钮
	  }, function(){
		var num = $(self).next().html();
		$.ajax({
			url:"/api/lottery/remove?number="+num,
			success:function(e){
				if(e.state){ //删除成功
					$(self).parent().remove();
					location.reload();
				}else{ //删除失败
					layer.msg(e.msg);
				}
			}
		})
	  }, function(){
		
	});
});
//重置
$('.reset').click(function(){
	layer.confirm('确定重置抽奖？', {
		title:'提示',
		btn: ['确定','取消'] //按钮
	  }, function(){
		$.ajax({
			url:"/api/lottery/reset",
			success:function(e){
				if(e.state){ //重置成功
					layer.msg('重置成功');
					location.reload();
				}else{ //重置失败
					layer.msg(e.msg);
				}
			}
		});
	  }, function(){
		
	});
});

var x = document.getElementById("media"); 
$("#audio_btn").click(function(){
	$(this).toggleClass("rotate"); //控制音乐图标 自转或暂停
   
	//控制背景音乐 播放或暂停            
	if($(this).hasClass("rotate")){
		x.play();
	}else{
		x.pause();
	}
});

