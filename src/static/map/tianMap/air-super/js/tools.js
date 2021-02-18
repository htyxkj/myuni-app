document.write("<script language=javascript src='../js/map_tools.js'><\/script>");//地图工具类
document.write("<script language=javascript src='../../js/GPSUtil.js'><\/script>");//地图工具类
var servUrl = "";//服务端接口
var userCode = "";//当前用户
var snKey = "";//用户snkey
var dbid = "";//数据库连接标识
var map = null;//地图对象
var pageType = null;//页面类型
var insaidParmas = {apiId: 'bipinsaid',dbid: this.dbid,usercode: this.userCode,id:210,aid : '',qe:"{pcell:''}"};
var queryEntity = { cont: "", groupV: "", mcont: "", oprid: 13, orderBy: "",page: {total: 0, index: 0, currPage: 1, pageSize: 20},pcell: "",polnk: "",tcell: "",type: 3};

// key//字段名称 value//值 type//字段类型  平台对象定义上的SQL类型 contrast//对比操作  0：= 1：>= 2:<= 3:like 4: <>  5:in 6:>  7: <
// link//与下一个连接  0：or 或 1：and  refer//当contrast 是like 时   0：%值，1：值%，2：%值%;
var queryCont = {key:"",value:"",type:"",contrast:0,link:1,refer:2}

var taskRefName = "TKMSG";	//任务辅助
var taskaRefName = "CORRD"; //作业记录辅助
var sbidRefName = "TLIDALL"; //作业记录辅助
var task = null;//任务信息

var taskData =[];//任务作业数据集合
var takeoff = null;//起降点信息
var warn=null;//飞行预警参数
var warnInterval = 0;

var weatheJson = {};//设备气象数据
var weather_round = null;//天气圆圈地图对象
var isWatherRound = false;//是否显示天气圆圈


var nowspeed = 0;//当前速度
var nowheight = 0;//海拔高度
var nowpressure = 0;//当前压力
var nowflow = 0;//当前流量
var sumflow = 0;//累计流量
var windSpeed = 0;//当前风速
var nowtemperature = 0;//当前温度
var humidity = 0;//当前湿度
var sumtime = 0;//已飞行时长 s
var sumtimeflow = 0;//已喷洒时长 s
var nowtime = "";//时间
var sumarea = 0;//喷洒面积 亩


var maxTime = null;//实时轨迹最新时间点
var sleepTime = 5*60*1000;//捷思锐延迟时间
var taskPointJSON = [];//任务点
var clickAirKey = "";//实时点击飞机的点
var rotate = null;//旋转角度
var plane = null;//飞机对象
var _timer2 = null;//计时器 无数据时查询数据
/******************************************************** 实时页面 ************************************************************/
//初始化实时页面
function initRealTime(map){
	$("#my-modal-loading").modal("open");
	var real_time_track = document.getElementById("real_time_track");
	real_time_track.style.display= '';
    this.map= map;
    this.map.addEventListener("zoomend", zoomend);//地图缩放结束
    //查询全部设备
    let data = {
        dbid: this.dbid,
        usercode: this.userCode,
        condition:JSON.stringify({userCode:this.userCode}),
        oprid:220,
    }
    let option = {
        url : this.servUrl+"/realTimeServlet",
        method : "post",
        data : data
    }
    this.http.post(option,initAllDev,true);
	this.initWarn();
	// this.weather_round = tmap_markCircle(opt.Datas[0],"#E7E7E7",5000,map,0.2)
	// if(!this.isWatherRound){
	// 	this.map.removeOverLay(this.weather_round);
	// }
}
/**
 * 根据用户查询 可见设备
 */
function initAllDev(data,res){
    if(res == null && data){
        alert(data)
		return;
    }
    if(res.id ==0){
        let data = res.data.data;
		let point =[];
        for(var i=0;i<data.length;i++){
            let one = data[i];
			if(one.sbtype ==0){
				let lnglat = bd09_To_gps84(one.latitude,one.longitude);
				one.latitude = lnglat[0];
				one.longitude = lnglat[1]
			}
			let longitude = one.longitude;//经度
			let latitude = one.latitude;//纬度
			if(longitude == 0 || latitude ==0){
				break;
			}
			let offline = one.offline;//是否离线 0：否；1：是
			let time = one.time;//时间
			let sbid = one.sbid;//设备编码
			// let speed = one.speed;//速度
			// let height = one.height;//高度
			// let direction = one.direction;//方向
			// let flow = one.flow;//瞬时流量
			// let sumfolw = one.sumfolw;//总流量
			// let pressure = one.pressure;//压力
			// let temperature = one.temperature;//温度
			// let humidity = one.humidity;//湿度
			// let windspeed = one.windspeed;//风速
			// let pressure2 = one.pressure2;//压力2
			let lngLat = new T.LngLat(longitude,latitude);//点
			let imgUrl = './img/plane.png';
			if(offline == 1){
				imgUrl = './img/offlinePlane.png';
			}
			var icon = new T.Icon({
				iconUrl: imgUrl,
				iconSize: new T.Point(40, 40),
				iconAnchor: new T.Point(20, 20)
			});
			let msg = "<div>任务编码："+one.taskid+"<br/>任务名称："+one.taskname+"<br/>定位信息:"+longitude+","+ latitude+"<br/>时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间："+time;
			msg += "<br/>设备编码："+sbid;
			// msg += "<br/>速&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;度："+speed;
			// msg += "<br/>高&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;度："+height;
			// msg += "<br/>瞬时流量："+flow;
			// msg += "<br/>总流量：&nbsp;&nbsp;"+sumfolw;
			if(offline == 1){//离线
				msg += "<br/>状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态：<span style='color:red;'>离线</span>";
			}else{//在线
				msg += "<br/>状&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;态：<span style='color:green;'>在线</span>";
			}
			msg +="</div>";
			let key = one.taskid+"_"+sbid+"_"+one.sbtype//任务编码_设备编码_设备类型
			tmap_marker(this.map,key,lngLat,icon,airPointClick,msg);
			point.push(lngLat);
        }
		this.map.setViewport(point);
    }
	$("#my-modal-loading").modal("close");
}
/**
 * 飞机点击回调事件
 */
function airPointClick(data){
	let key = data.target.key;
	clickAirKey = key;
	let keyArr = key.split("_");
	let taskId = keyArr[0];
	let sbid = keyArr[1];
	let sbType = keyArr[2];
	if(taskId && taskId.length>1){
		initTaskById(taskId);
		let takeoffID = task.takeoff;//起降点
		initLandingPoint(takeoffID)
		initOpera(task.oaid);//架区
		initOperaBr(task.oaid);//避让区
		initOpera(task.hoaid);//作业区
		initOperaRoute(task.oaid);
	}
	if(sbType=='0'){
		maxTime = parseInt(((maxTime - sleepTime)/1000)+"");
		this.maxTime = 1566599591;
	}else{
		maxTime = maxTime -5000;
	}
	getPointList(sbid,true,sbType)
	map.setZoom(17)//设置地图放大级次
}
/***
 * 获取实时数据
 * 设备号
 * 是否第一次
 * 设备类型
 */
function getPointList(key,frist,trtype){
	try{
		if(frist){
			this.map_clear();
			$("#my-modal-loading").modal("open");
		}
		let condition ={key:key,time:this.maxTime,trtype:trtype};
		let data = {
			dbid: this.dbid,
			usercode: this.userCode,
			condition:JSON.stringify(condition),
			oprid:210,
		}
		let option = {
			url : this.servUrl+"/realTimeServlet",
			method : "post",
			data : data
		}
		if(frist){
			this.taskPointJSON = [];
			this.taskData=[];
		}
		this.http.post(option,setRealData,!frist);
		
		if(frist){
			$("#my-modal-loading").modal("close");
			drawPointLine(key,frist,trtype)
		}
	}catch(err){
		console.log(err)
		$("#my-modal-loading").modal("close");
	}
}
function setRealData(msg,res){
	if(res.id ==0 ){
		let values = res.data.data;
		if(!values){
			return;
		}
		for(var i =0;i<values.length;i++){
			let v = values[i];
			this.maxTime = v.speedtime;
			let lnglat = [v.latitude,v.longitude];
			if(v.sbtype == 0){
				lnglat = bd09_To_gps84(v.latitude,v.longitude);
				v.speedtime = v.speedtime * 1000
			}
			v.latitude = lnglat[0];
			v.longitude = lnglat[1];
			v.speedtime = new Date(v.speedtime)
			v.speedtime = dateFormat("YYYY-mm-dd HH:MM:SS",v.speedtime);
			if(this.taskPointJSON.indexOf(this.maxTime) ==-1){
				this.taskPointJSON.push(this.maxTime);
				this.taskData.push(v);
			} 
		}
	}
}
/**
* 开始画作业记录
*/
function drawPointLine(key,frist,trtype){
	let t1 = new Date().getTime();
	if(this.taskData.length==0){
		this._timer2 = window.setTimeout(() => {
			this.getPointList(key,false,trtype);
			this.drawPointLine(key,false,trtype)
		}, 1000);
		return;
	}
	if(this.taskData.length<=2){
		this.getPointList(key,false,trtype);
	} 
	let LngLat = new T.LngLat(this.taskData[0].longitude,this.taskData[0].latitude);
	if(this.sprayLine2.length>0){
		let line2 = this.sprayLine2[this.sprayLine2.length-1];
		let points2 = line2.getLngLats();
		points2.push(LngLat);
		line2.setLngLats(points2)
	}else{
		let opts2 = {color:this.noFlowColor,weight:3,opacity:1};
		let points = [];
		if(this.PreviousFlowPoint)
			points.push(this.PreviousFlowPoint);
		points.push(LngLat);
		var newLine2 = new T.Polyline(points,opts2);
		this.sprayLine2.push(newLine2)
		this.map.addOverLay(newLine2);
	}
	this.passOneNode(LngLat,1,1);
	if(this.taskData.length>0){
		if(this.taskData.length>1){
			this.loadPlane(this.taskData[0],this.taskData[1]);
		} 
		else{
			this.loadPlane(this.taskData[0],this.taskData[0]);
		}
	}
	if(this.taskPointJSON.length>30){
		this.taskPointJSON = this.taskPointJSON.splice(1,1)
	}
	this.taskData = this.taskData.slice(1);
	let t2 = new Date().getTime();
	let t=1000;
	if(t2-t1<this.interval){ 
		t=t-(t2-t1);
	}else{
		t=0;
	} 
	window.setTimeout(() => {
		this.drawPointLine(key,false,trtype);
	}, t);
}
/**
 * 设置飞机
 */
function loadPlane(lnglat1,lnglat2) {
	if(lnglat1.longitude == 0 || lnglat1.latitude == 0)
		return;
	if(!this.plane){
		var icon = new T.Icon({
			iconUrl: './img/plane.png',
			iconSize: new T.Point(40, 40),
			iconAnchor: new T.Point(20, 20)
		}); 
		let lngLat = new T.LngLat(lnglat1.longitude, lnglat1.latitude);
		this.plane = tmap_marker(this.map,null,lngLat,icon,null,null);
	}else{
		this.plane.setLngLat(new T.LngLat(lnglat1.longitude, lnglat1.latitude))
	}

	let jl = this.map.getDistance(new T.LngLat(lnglat1.longitude, lnglat1.latitude),new T.LngLat(lnglat2.longitude, lnglat2.latitude));
	if(jl>0.5){
		let curPos = new T.LngLat(lnglat1.longitude, lnglat1.latitude)
		let targetPos = new T.LngLat(lnglat2.longitude, lnglat2.latitude)
		this.rotate =  getRotation(curPos,targetPos,this.map);
		this.rotate = parseFloat( this.rotate+'')  
		// if(lnglat1.sbid)
		//     this.rotate = lnglat1.direction || "0";  
	} 
	if(this.rotate){
		let style = this.plane.Fr.style[CSS_TRANSFORM()];
		this.plane.Fr.style[CSS_TRANSFORM()]= style+" rotate(" +this.rotate + "deg)";
		this.plane.Fr.style["transform-origin"] = "50% 50%";
	}
}
/**
 * 打开设置弹框
 */
function real_time_setting(){
	$('#real_time_set_confirm').modal({
		relatedTarget: this,
		closeOnConfirm: false,
		closeOnCancel: false,
		onConfirm: function(options) {
			var watherRound = $("input[name='realTimeIsWatherRound']:checked").val();//是否显示天气范围
			if(watherRound == 1 && weather_round){
				isWatherRound = true;
				map.addOverLay(weather_round)
			}else{
				if(weather_round){
					isWatherRound = false;
					map.removeOverLay(weather_round);
				}
			}
			var isWather = $("input[name='realTimeIsWather']:checked").val();//是否显示天气模块
			var weather = document.getElementById("weather_module");
			if(isWather == 1){
				weather.style.display= '';
			}else{
				weather.style.display= 'none';
			}
			var isCockpit = $("input[name='realTimeIsCockpit']:checked").val();//是否显示天气模块
			var cockpit = document.getElementById("f_cockpit");
			if(isCockpit == 1){
				cockpit.style.display= '';
			}else{
				cockpit.style.display= 'none';
			}
			this.close();
		}
	});
}
/******************************************************** 实时页面 ************************************************************/


/******************************************************** 回放页面 ************************************************************/
var taskTrack = null;//轨迹对象
var interval = 1000;//数据上报间隔 ms
var forward = 1;//快进倍数
var mileage = 0;//喷洒里程 暂时没用到
var isFollow = true;//画面跟随
var haveFlow = [];//有流量点的集合 断开后的第一点
var dragPoints = 0;//进度条起始点
var percent = 0;//进度百分比
//初始化回放页面
function initPlayBack(_map){
    this.map = _map;
    this.map.addEventListener("zoomend", zoomend);//地图缩放结束
    var cc = document.getElementById("track_show_play_back");
	cc.style.display= '';
	cc = document.getElementById("play_back_setting");//设置按钮
	cc.style.display= '';
	this.initWarn();
}
/**
 * 选完条件后执行数据查询
 */
function drawPlayBackLine(msg,res){
	this.taskData = res.data.data.values;//数据集合
	if(!taskData){
		return;
	}
	this.sumtimeflow = 0;
	this.sumtime = 0;
	this.sumarea = 0
	this.sumflow ='0';
	this.forward=1;
	this.mileage =0;
	let opt = {interval: this.interval,
					dynamicLine: true,
					polylinestyle: {color:this.noFlowColor, weight: 4, opacity: 0.9},Datas: [],
					carstyle:{display:true, iconUrl:'./img/plane.png', width:42, height:30},
					passOneNode:this.passOneNode,
				}
	let noFlow = true;
	for(var i=0;i<this.taskData.length;i++){
		let v = this.taskData[i];
		let lnglat = [v.latitude,v.longitude]
		if(!v.sbid)
			lnglat = bd09_To_gps84(v.latitude,v.longitude);
		let poin = new T.LngLat(lnglat[1],lnglat[0]);
		this.taskData[i].latitude = lnglat[0];
		this.taskData[i].longitude = lnglat[1];
		opt.Datas.push(poin);
		if(v.flow>0){
			if(noFlow){
				v.cid = i;
				this.haveFlow.push(v);
			}
			noFlow = false;
		}else{
			noFlow = true;
		}
	}
	if(opt.Datas.length>0){
		this.taskTrack = new T.CarTrack(this.map,opt);
		this.taskTrack.start();
		this.weather_round = tmap_markCircle(opt.Datas[0],"#E7E7E7",5000,map,0.2)
		if(!this.isWatherRound){
			this.map.removeOverLay(this.weather_round);
		}
	}
}
/**
 * 
 * lnglat:LngLat, index:Number, length:Number
 */
/**
 * 路线节点变化
 * @param {Object} LngLat	当前点经纬度
 * @param {Object} index	第几个点
 * @param {Object} length	集合长度
 */
function passOneNode(LngLat,index,length){
	if(isFollow){//画面跟随
		map.panTo(LngLat);
	}
	if(isWatherRound && weather_round){
		weather_round.setCenter(LngLat);
	}
	let data = taskData[dragPoints+index-1];
	percent = (index+dragPoints)/taskData.length *100;
	if(data){
		nowtime = data.speedtime;
		nowspeed = (data.speed).toFixed(3);
		if(data.windspeed)
			windSpeed = data.windspeed;//风速
		if(data.humidity)
			humidity = data.humidity;//湿度
		if(data.pressure)
			nowpressure = (data.pressure).toFixed(1); //压力
		if(data.temperature)
			nowtemperature = (data.temperature).toFixed(1);//温度
		nowflow = ( data.flow).toFixed(2);;
		nowheight = data.height;
		sumtime = sumtime + 1;
		let flow = data.flow
		if(takeoff){
			let boundary = takeoff.north.split(",");
			//向地图上添加自定义标注
			let p = new T.LngLat(boundary[0], boundary[1]);
			let jl = map.getDistance(p,LngLat);
			if(jl<=takeoff.range){
				sumflow='0';
				sumarea = 0;
			}
		}
		sumflow = ((parseFloat(sumflow+'') + parseFloat((parseFloat(nowflow+'')/60/60)+'')).toFixed(3))+'';
		if(flow>0.6){//有流量去划线
			// 有流量的点喷洒时长+1s
			sumtimeflow = sumtimeflow + 1;
			mileage = mileage+data.speed /3600
			mileage = parseFloat(mileage.toFixed(4))
			let nowArea = flightBeltWidth  * data.speed *1000/3600 /666.67;
			sumarea = (sumarea + nowArea);
			let lgt = new T.LngLat(data.longitude, data.latitude)
			if(sprayBreak){//中断过需要从起一条线
				let points = [];
				let zoom = map.getZoom();
				let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
				let opts0 = {color:flightBeltColor,weight:cc*flightBeltWidth,opacity:flightBeltOpacity};
				points.push(lgt);
				var newLine0 = new T.Polyline(points,opts0);
				map.addOverLay(newLine0);
				sprayLine0.push(newLine0)

				let opts1 = {color:trackColor,weight:4,opacity:1};
				var newLine1 = new T.Polyline(points,opts1);
				map.addOverLay(newLine1);     
				sprayLine1.push(newLine1)
			}else{//没有中断需要在最后一条线追加点 或重画最后一条线
				let line0 = sprayLine0[sprayLine0.length-1];
				let points0 = line0.getLngLats();
				points0.push(lgt);
				line0.setLngLats(points0)

				let line1 = sprayLine1[sprayLine1.length-1];
				let points1 = line1.getLngLats();
				points1.push(lgt);
				line1.setLngLats(points1)
			}
			sprayBreak = false;

			let msg = "";
			//预警信息
			//this.flightBeltWidth  幅宽
			//Flow = （Loading÷1000）÷（ （（ Area÷1500）÷（Swath÷1000）） ÷ Speed）  
			let standard=[];
			warnInterval++;
			let flow0 = (warn.drugload/1000)/(((warn.area/warn.area)/(flightBeltWidth/1000))/data.speed);
			if(!isNaN(flow0) && warnInterval >= warn.interval){
				standard[0] = (flow0*(1-(warn.drugfloat/100))).toFixed(2);
				standard[1] = (flow0*(1+(warn.drugfloat/100))).toFixed(2);
				if(flow>standard[1] || flow<standard[0]){
					msg = "当前速度："+data.speed+"km/h<br/>瞬时流量异常("+flow+"),超出当前速度标准范围("+standard[0]+"~"+standard[1]+")"
				}
				warnInterval = 0;
			}
			if(msg != ""){
				//创建图片对象
				var icon = new T.Icon({
					iconUrl: './img/avoid.png',
					iconSize: new T.Point(20, 20),
					iconAnchor:new T.Point(10, 20),
				});
				//向地图上添加自定义标注
				var marker = new T.Marker(LngLat, {icon: icon});
				var markerInfoWin = new T.InfoWindow(msg);
				marker.addEventListener("click", function () {
					marker.openInfoWindow(markerInfoWin);
				});// 将标注添加到地图中
				map.addOverLay(marker)
			}
		}else{
			sprayBreak = true;
		}
	}
	if(taskTrack && index >= length){//最后一点
		taskTrack.pause()
	}
	let lnglat_str = data.longitude+";"+data.latitude;
	let wh = weatheJson[lnglat_str];
	if(wh){
		document.getElementById("weather_temperature").innerHTML=wh.temperature;//温度
		document.getElementById("weather_humidity").innerHTML=wh.humidity;//湿度
		document.getElementById("weather_precipitation").innerHTML=wh.precipitation;//降水
		document.getElementById("weather_windspeed").innerHTML=wh.windspeed;//风速
	}
	setJobRecord();
}
/**
 * 打开回放页面设置弹出框
 */
function play_back_setting(){
	$('#play_back_set_confirm').modal({
		relatedTarget: this,
		closeOnConfirm: false,
		closeOnCancel: false,
		onConfirm: function(options) {
			let fastForward = document.getElementById("fastForward").value;
			if(!isNaN(fastForward)){
				play_back_fastForward(fastForward)
			}
			var follow = $("input[name='isFollow']:checked").val();//是否是画面跟随
			if(follow == 1){
				isFollow = true;
			}else{
				isFollow = false;
			}
			var watherRound = $("input[name='isWatherRound']:checked").val();//是否显示天气范围
			if(watherRound == 1 && weather_round){
				isWatherRound = true;
				map.addOverLay(weather_round)
			}else{
				if(weather_round){
					isWatherRound = false;
					map.removeOverLay(weather_round);
				}
			}
			var isWather = $("input[name='isWather']:checked").val();//是否显示天气模块
			var weather = document.getElementById("weather_module");
			if(isWather == 1){
				weather.style.display= '';
			}else{
				weather.style.display= 'none';
			}
			var isCockpit = $("input[name='isCockpit']:checked").val();//是否显示天气模块
			var cockpit = document.getElementById("f_cockpit");
			if(isCockpit == 1){
				cockpit.style.display= '';
			}else{
				cockpit.style.display= 'none';
			}
			this.close();
		}
	});
}
//开始
function play_back_start(){
	if( this.taskTrack)
		this.taskTrack.start()
}
//暂停
function play_back_stop(){
	if( this.taskTrack)
		this.taskTrack.pause()
}
//快进
function play_back_fastForward(forward){
	if(this.taskTrack){
		if(forward >=5){
			this.forward =1;
			forward =1
		}
		let interval = this.interval/forward;
		this.taskTrack.options.interval= interval
		this.play_back_stop();
		this.play_back_start();
	}
}
/******************************************************** 回放页面 ************************************************************/



/******************************************************** 航带查询 ************************************************************/
var sprayLine0=[];//喷洒轨迹（农药范围）
var sprayLine1=[];//喷洒轨迹（一像素的线）
var sprayLine2=[];//飞行轨迹（没有喷洒农药的轨迹线）
var sprayBreak = true;//喷洒是否中断
var flightBeltColor = "#ADFF2F"//行带颜色
var flightBeltOpacity = 0.3;//航道透明度
var flightBeltWidth = 45;//航带宽度 米
var trackColor = "#FFFF00";//航迹颜色
var noFlowColor = "#F40";//未喷洒农药时的轨迹颜色
var PreviousFlowPoint = null;//上一个流量点
var trackType =2;//绘图类型线路类型  航迹：0  航带：1    混合：2
var pointMsg = {}; //点信息集合
var isShowPoint = false;//是否显示点
var CloudMarkerCollection = null;//海量点对象
var msg_point=[];

//初始化航带查询页面
function initTrackShow(_map){
    this.map = _map;
    this.map.addEventListener("zoomend", zoomend);//地图缩放结束
	var cc = document.getElementById("track_show_play_back");
	cc.style.display= '';
	cc = document.getElementById("track_show");
	cc.style.display= '';
	cc = document.getElementById("show_track_punctuation");
	cc.style.display= '';
}
//显示查询条件框

function track_show_play_back(){
	$('#startTime').datetimepicker({language:  'zh-CN'});
	$('#endTime').datetimepicker({language:  'zh-CN'});
	$('#my-confirm').modal({
		relatedTarget: this,
		closeOnConfirm: false,
		closeOnCancel: false,
		onConfirm: function(options) {
			map_clear();
			// 判断条件是否填写全
			let alert_msg = null;
			var showJQ=document.getElementById("showJQ");//显示架区
			var showZYQ=document.getElementById("showZYQ");//显示作业区
			var showHX=document.getElementById("showHX");//显示航线
			var trT= document.getElementById("trackType");//绘制类型
			var taskid = document.getElementById("taskid").value;//任务
			var sbid = document.getElementById("sbid").value//设备编码
			var startTime = $("#startTime").data("datetimepicker").getDate();//开始时间
			if(!startTime){
				alert_msg="开始时间不能为空";
			}
			startTime = dateFormat("YYYY-mm-dd HH:MM:SS",startTime);
			var endTime = $("#endTime").data("datetimepicker").getDate();//结束时间
			if(!endTime){
				alert_msg="结束时间不能为空";
			}
			endTime = dateFormat("YYYY-mm-dd HH:MM:SS",endTime);
			if(!taskid && !sbid){
				alert_msg="任务和设备不能同时为空";
			}
			if(alert_msg !=null){
				document.getElementById("alert_msg").innerHTML = alert_msg;
				$('#my-alert').modal({})
				return;
			}

			trackType = trT.selectedIndex;
			var jq = showJQ.selectedIndex;
			var zyq = showZYQ.selectedIndex;
			var hx = showHX.selectedIndex;
			 $("#my-modal-loading").modal("open");
			this.close();
			setTimeout(() => {
				// initTaskById(taskid)
				let takeoffID = task.takeoff;//起降点
				initLandingPoint(takeoffID)
				if(jq == 1){
					//oaid 作业区编码
					initOpera(task.oaid);//架区
					initOperaBr(task.oaid);//避让区
				}
				if(zyq == 1){
					initOpera(task.hoaid);//作业区
				}
				if(hx == 1){//航线
					initOperaRoute(task.oaid);
				}
				setTimeout(() => {
					getAllTaska(task.sid,sbid,startTime,endTime);	
					$("#my-modal-loading").modal("close");
				}, 3000);
			}, 500);
		},
		onCancel: function() {
			this.close();
		}
	});
}
/**
 * 根据条件查询作业记录
 * @param {Object} tkId		任务编码
 * @param {Object} sbId		设备id
 * @param {Object} stTiem	开始时间
 * @param {Object} edTiem	结束时间
 */
function getAllTaska(tkId,sbId,stTiem,edTiem){
	let data = Object.assign({},this.insaidParmas);
	data.aid = this.taskaRefName;
	var qe = Object.assign({},this.queryEntity);
	let oneCont =[];
	let qCont = this.queryCont;
	if(tkId && tkId.length>0){
		qCont = Object.assign({},this.queryCont);
		qCont.key = "tkid";
		qCont.value = tkId;
		qCont.type = 12;
		oneCont.push(qCont);
	}
	if(sbId && sbId.length>0){
		qCont = Object.assign({},this.queryCont);
		qCont.key = "bsid";
		qCont.value = sbId;
		qCont.type = 12;
		oneCont.push(qCont);
	}
	if(stTiem && stTiem.length>0){
		qCont = Object.assign({},this.queryCont);
		qCont.key = "speedtime";
		qCont.value = stTiem;
		qCont.type = 12;
		qCont.contrast =1;
		oneCont.push(qCont);
	}
	if(edTiem && edTiem.length>0){
		qCont = Object.assign({},this.queryCont);
		qCont.key = "speedtime";
		qCont.value = edTiem;
		qCont.type = 12;
		qCont.contrast =2;
		oneCont.push(qCont);
	}
	qe.cont = cont = "~[" + JSON.stringify(oneCont)+"]";
	qe.page.pageSize = 90000;
	data.qe = JSON.stringify(qe);
	let option = {
	    url : this.servUrl+"/sysapi",
	    method : "post",
	    data : data
	}
	if(pageType == 'trackShow'){//航带航迹
		this.http.post(option,drawTrackLine,false);
	}else if(pageType == 'playBack'){//轨迹回放
		this.http.post(option,drawPlayBackLine,false);
		sbId = !sbId?task.sbid:sbId;
		this.initWeather(sbId,stTiem,edTiem);//查询当前设备的气象信息
	}
}
function drawTrackLine(msg,res){
	this.sprayLine0=[];
	this.sprayLine1=[];
	this.sprayLine2=[];
	this.sprayBreak = true;//喷洒是否中断
	this.PreviousFlowPoint = null;//上一个流量点
	if(res == null && msg){
	    alert(msg)
	}
	if(res.id !=0){
		alert(res.message);
		return;
	}
	this.taskData = res.data.data.values;
	let points = [];
	let zoom = this.map.getZoom();
	for(var i=0;i<this.taskData.length;i++){
	    let data = this.taskData[i];
		if(data){
			let lnglat = [data.latitude, data.longitude]
			if(!data.sbid){
				lnglat = bd09_To_gps84(data.latitude,data.longitude);
				data.longitude = lnglat[1];
				data.latitude = lnglat[0]
			}
			let flow = data.flow;
			let lgt = new T.LngLat(data.longitude, data.latitude)
			points.push(lgt);
			this.msg_point.push(lgt);
			let key = data.longitude+"_"+data.latitude;
			lgt.kid = key;

			let taskId,taskName;
			if(this.task){
				taskId = this.task.sid;
				taskName = this.task.taskname
			}
			let msg = "<div>任务编码："+taskId+"<br/>任务名称："+taskName+"<br/>定位信息:"+
			lnglat[1]+","+ lnglat[0]+"<br/>时&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;间："+data.speedtime+"<br/>"+
			"瞬时流量："+flow+"m³/h<br />"+`累计流量：${data.sumfolw}m³ <br />速度：${data.speed}km/h <br />高度：${data.height}/m`
			this.pointMsg[key]= msg;

			if(flow>0){//有流量去划线
				if(this.sprayBreak){//中断过需要从起一条线
					let points = [];
					if(this.sprayLine2.length>0){
						let line2 = this.sprayLine2[this.sprayLine2.length-1];
						let points2 = line2.getLngLats();
						points2.push(lgt);
						line2.setLngLats(points2)
					}
					if(this.trackType == 1 || this.trackType == 2){
						let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
						let opts0 = {color:this.flightBeltColor,weight:cc*this.flightBeltWidth,opacity:this.flightBeltOpacity};
						points.push(lgt);
						var newLine0 = new T.Polyline(points,opts0);
						this.sprayLine0.push(newLine0)
					}

					let opts1 = {color:this.trackColor,weight:3,opacity:1};
					var newLine1 = new T.Polyline(points,opts1);
					this.sprayLine1.push(newLine1)
				}else{//没有中断需要在最后一条线追加点 或重画最后一条线
					if(this.trackType == 1 || this.trackType == 2){
						let line0 = this.sprayLine0[this.sprayLine0.length-1];
						let points0 = line0.getLngLats();
						points0.push(lgt);
						line0.setLngLats(points0)
					}
					let line1 = this.sprayLine1[this.sprayLine1.length-1];
					let points1 = line1.getLngLats();
					points1.push(lgt);
					line1.setLngLats(points1)
				}
				this.sprayBreak = false;
			}else{
				if(this.trackType ==0 || this.trackType ==2){
					if(this.sprayBreak && this.sprayLine2.length>0){
						let line2 = this.sprayLine2[this.sprayLine2.length-1];
						let points2 = line2.getLngLats();
						points2.push(lgt);
						line2.setLngLats(points2)
					}else{
						let opts2 = {color:this.noFlowColor,weight:3,opacity:1};
						let points = [];
						if(this.PreviousFlowPoint)
							points.push(this.PreviousFlowPoint);
						points.push(lgt);
						var newLine2 = new T.Polyline(points,opts2);
						this.sprayLine2.push(newLine2)
					}
				}
				this.sprayBreak = true;
			}
			this.PreviousFlowPoint = lgt;
		}
	}
	let t1 = this.map.getViewport(points);
	this.map.panTo(t1.center, t1.zoom);
	this.zoomend();
	for(var i=0;i<this.sprayLine0.length;i++){
		this.map.addOverLay(this.sprayLine0[i]);
	}
	for(var i=0;i<this.sprayLine1.length;i++){
		this.map.addOverLay(this.sprayLine1[i]);
	}
	for(var i=0;i<this.sprayLine2.length;i++){
		this.map.addOverLay(this.sprayLine2[i]);
	}
}
/**
 * 航迹标点
 */
function show_track_punctuation(){
	try{
		if(!this.isShowPoint){
			this.CloudMarkerCollection = new T.CloudMarkerCollection(this.msg_point,{
				color:'blue',
				SizeType:'TDT_POINT_SIZE_SMALL'
			})
			let _this = this;
			this.CloudMarkerCollection.addEventListener("click", function (e) {
				var lnglat = e.lnglat;
				//创建信息窗口对象
				var infoWin = new T.InfoWindow();
				infoWin.setLngLat(lnglat);
				//设置信息窗口要显示的内容
				infoWin.setContent(_this.pointMsg[lnglat.kid]);
				_this.map.addOverLay(infoWin);
			});// 将标注添加到地图中 
			this.map.addOverLay(this.CloudMarkerCollection);
		}else{
			this.CloudMarkerCollection.clear()	
		}
		this.isShowPoint = !this.isShowPoint;
	}catch(e){
		this.isShowPoint = !this.isShowPoint;
	}
}

/******************************************************** 航带查询 ************************************************************/


/******************************************************** 通用方法 ************************************************************/
/**
* 地图缩放结束 航带航迹 回放 实时   缩放结束后重新绘制喷洒农药宽度
*/
function zoomend(){
	if(map){
		let zoom = map.getZoom();
		let cc = 256 * Math.pow(2, zoom) / 40075017 //换算一米转多少像素
		let opts0 = {color:flightBeltColor,weight:cc*flightBeltWidth,opacity:flightBeltOpacity};
		//重新画 农药喷洒范围
		for(var i=0;i<sprayLine0.length;i++){
			let line = sprayLine0[i];
			let points = line.getLngLats();
			var newLine = new T.Polyline(points,opts0);
			map.addOverLay(newLine);
			sprayLine0[i] = newLine;
			map.removeOverLay(line);
		}
	}
}
/**
 * 绘制起降点
 * @param {Object} sid 起降点编码
 */
function initLandingPoint(sid){
	if(sid){
		let oneCont =[];
		let qCont = this.queryCont;
		qCont.key = "sid";
		qCont.value = sid;
		qCont.type = 12;
		oneCont.push(qCont);
		let data = Object.assign({},this.insaidParmas);
		data.aid = "TAKEOFF";
		var qe = Object.assign({},this.queryEntity);
		qe.cont = cont = "~[" + JSON.stringify(oneCont)+"]";
		qe.page.pageSize = 1;
		data.qe = JSON.stringify(qe);
		let option = {
		    url : this.servUrl+"/sysapi",
		    method : "post",
		    data : data
		}
		this.http.post(option,drawLandingPoint,true);
	}
}
function drawLandingPoint(msg,res){
	if(res.id ==0){
		this.takeoff = res.data.data.values[0];
		let north = takeoff.north 
		let boundary = north.split(",");
		//创建图片对象
		var icon = new T.Icon({
			iconUrl: './img/lift.png',
			iconSize: new T.Point(70, 70),
			iconAnchor:new T.Point(35,70),
		});
		//向地图上添加自定义标注
		let p = new T.LngLat(boundary[0], boundary[1]);
		var marker = new T.Marker(p,{icon: icon});
		this.map.addOverLay(marker);
	}
}
/**
 * 绘制 作业区 架区
 * @param {Object} sid 架区编码
 */
function initOpera(sid){
	if(sid){
		let aid = sid.split(";")
		for(var i=0;i<aid.length;i++){
			let id = aid[i];
			let oneCont =[];
			let qCont = this.queryCont;
			qCont.key = "id";
			qCont.value = id;
			qCont.type = 12;
			oneCont.push(qCont);
			let data = Object.assign({},this.insaidParmas);
			data.aid = "ROUTEOPERA";
			var qe = Object.assign({},this.queryEntity);
			qe.cont = cont = "~[" + JSON.stringify(oneCont)+"]";
			qe.page.pageSize = 400;
			data.qe = JSON.stringify(qe);
			let option = {
			    url : this.servUrl+"/sysapi",
			    method : "post",
			    data : data
			}
			this.http.post(option,drawOpera,true);
		}
	}
}
function drawOpera(msg,res){
	if(res.id == 0){
	    let values = res.data.data.values;
	    for(var i =0;i<values.length;i++){
	        let vl = values[i];
	        if(vl.mergeid){
	            let oidArr = vl.mergeid.split(";");
	            for(var l =0;l<oidArr.length;l++){
	                this.initOpera(oidArr[l]);
	            }
	        }else{
				let boundary = vl.boundary1.split(";");
				var points = [];
				for (var j = 0; j < boundary.length; j++) {
					let poin = boundary[j].split(",");
					if (poin.length >= 2) {
						points.push(new T.LngLat(poin[0], poin[1]));
					}
				}
				tmap_markSurface(map,vl.color,points)
	        }
	    }
	}
}
/**
 * 绘制避让区域
 * @param {Object} sid 架区编码点编码
 */
function initOperaBr(sid){
	if(sid){
		let aid = sid.split(";")
		for(var i=0;i<aid.length;i++){
			let oid = aid[i];
			let oneCont =[];
			let qCont = this.queryCont;
			qCont.key = "oid";
			qCont.value = oid;
			qCont.type = 12;
			oneCont.push(qCont);
			let data = Object.assign({},this.insaidParmas);
			data.aid = "ROUTEOPERAA";
			var qe = Object.assign({},this.queryEntity);
			qe.cont = cont = "~[" + JSON.stringify(oneCont)+"]";
			qe.page.pageSize = 400;
			data.qe = JSON.stringify(qe);
			let option = {
			    url : this.servUrl+"/sysapi",
			    method : "post",
			    data : data
			}
			this.http.post(option,drawOperaBr,true);
		}
	}
}
function drawOperaBr(msg,res){
	if(res.id == 0){
		let values = res.data.data.values;
		for(var i =0;i<values.length;i++){
			let vl = values[i];
			if(vl.type ==1){
				let avoid = vl.avoid.split(";");
				var points = [];
				for (var j = 0; j < avoid.length; j++) {
					let poin = avoid[j].split(",");
					if (poin.length >= 2) {
						points.push(new T.LngLat(poin[0], poin[1]));
					}
				}
				tmap_markSurface(map,vl.color,points)
			}else if(vl.type ==2){
				var lgt = vl.avoid.split(",");
				if(lgt.length == 2){
					var cir = new T.LngLat(lgt[0], lgt[1])
					tmap_markCircle(cir,vl.color,vl.radius,map);
				}
			}else if(vl.type ==0){
				var lgt = vl.avoid.split(",");
				if(lgt.length == 2){
					var cir = new T.LngLat(lgt[0], lgt[1])
					tmap_markpoint(cir,map)
				}
			}
		}
	}
}
/**
 * 绘制航线
 * @param {Object} oaid 作业区编码
 */
function initOperaRoute(oaid){
	if(oaid){
		let aid = oaid.split(";")
		for(var i=0;i<aid.length;i++){
			let id = aid[i];
			let oneCont =[];
			let qCont = this.queryCont;
			qCont.key = "id";
			qCont.value = id;
			qCont.type = 12;
			oneCont.push(qCont);
			let data = Object.assign({},this.insaidParmas);
			data.aid = "ROUTEOPERA";
			var qe = Object.assign({},this.queryEntity);
			qe.cont = cont = "~[" + JSON.stringify(oneCont)+"]";
			qe.page.pageSize = 400;
			data.qe = JSON.stringify(qe);
			let option = {
			    url : this.servUrl+"/sysapi",
			    method : "post",
			    data : data
			}
			this.http.post(option,drawOperaRoute,true);
		}
	}
}
function drawOperaRoute(msg,res){
	if(res.id == 0){
		let values = res.data.data.values;
		for(var i =0;i<values.length;i++){
			let vl = values[i];
			let points = [];
			if(vl.route){
				let boundary = vl.route.split(";");
				for (var j = 0; j < boundary.length; j++) {
					let poin = boundary[j].split(",");
					if (poin.length >= 2) {
						points.push(new T.LngLat(poin[0], poin[1]));
					}
				}
				tmap_makeRoute(points,'#00FFFF',map)
			}
		}
	}
}
/**
 * 初始化飞行预警参数
 */
function initWarn(){
	let qe= Object.assign({},this.queryEntity);
	qe.page.currPage = 1;
	qe.page.pageSize = 1;
	let data = Object.assign({},this.insaidParmas);
	data.aid = "GETWARN";
	data.qe = JSON.stringify(qe);
	let option = {
		url : this.servUrl+"/sysapi",
		method : "post",
		data : data
	}
	this.http.post(option,initWarnData,true);
}
function initWarnData(msg,res){
	if(res.id ==0){
		this.warn = res.data.data.values[0]
	}
}

/**
 * 根据任务编码获取任务信息
 * @param {Object} tkid 任务编码
 */
function initTaskById(tkid){
	let data = Object.assign({},this.insaidParmas);
	data.aid = this.taskRefName
	var qe = Object.assign({},this.queryEntity);
	qe.cont = " sid = '"+tkid+"'"
	qe.page.pageSize = 1;
	data.qe = JSON.stringify(qe);
	let option = {
	    url : this.servUrl+"/sysapi",
	    method : "post",
	    data : data
	}
	this.http.post(option,setTask,false);
}
function setTask(msg,res){
	if(res.id ==0){
		this.task = res.data.data.values[0];
	}
}
/**
 * 获取设备天气信息
 * @param {*} sbid 		设备编码
 * @param {*} stTime 	开始时间
 * @param {*} edTime 	结束时间
 */
function initWeather(sbid,stTime,edTime){
	let data = Object.assign({},this.insaidParmas);
	data.aid = 'GETWEATHER';
	var qe = Object.assign({},this.queryEntity);
	let oneCont =[];
	let qCont = Object.assign({},this.queryCont);
	qCont.key = "sbid";
	qCont.value = sbid;
	qCont.type = 12;
	oneCont.push(qCont);  
	qCont = Object.assign({},this.queryCont);
	qCont.key = "hpdate";
	qCont.value = stTime;
	qCont.type = 12;
	qCont.contrast =1;
	oneCont.push(qCont); 
	qCont = Object.assign({},this.queryCont);
	qCont.key = "hpdate";
	qCont.value = edTime;
	qCont.type = 12;
	qCont.contrast =2;
	oneCont.push(qCont);
	qe.cont = cont = "~[" + JSON.stringify(oneCont)+"]";
	qe.page.pageSize = 200;
	data.qe = JSON.stringify(qe);
	let option = {
	    url : this.servUrl+"/sysapi",
	    method : "post",
	    data : data
	}
	this.http.post(option,setWeather,false);
}
function setWeather(msg,res){
	if(res.id ==0){
		let values = res.data.data.values;
		for(var i=0;i<values.length;i++){
			let ow = values[i];
			this.weatheJson[ow.coordinate] = ow;
		}
	}
}
/**
 * 地图清空
 */
function map_clear(){
	try {
		if(this.taskTrack){
			this.taskTrack.clear();
		}
	} catch (error) {}
	this.taskTrack = null;
	this.taskData = [];//数据集合设置为空
	this.sprayLine0=[];
	this.sprayLine1=[];
	this.sprayLine2=[];
	this.isShowPoint = false;
	this.map.clearOverLays()
	if(this._timer2){
		window.clearTimeout(this._timer2);
		delete this._timer2;
		this._timer2 = null;
	}
}
/**
 * 设置驾驶舱数据
 */
function setJobRecord(){
	document.getElementById("sumarea").innerHTML = this.sumarea.toFixed(3)+"/亩";//喷洒面积
	document.getElementById("nowtime").innerHTML = this.nowtime;//当前时间
	document.getElementById("nowspeed").innerHTML = this.nowspeed + "km/h";//当前速度
	document.getElementById("nowheight").innerHTML = this.nowheight  + "m";//海拔高度
	document.getElementById("nowpressure").innerHTML = this.nowpressure +"kpa" ;//当前压力
	document.getElementById("nowflow").innerHTML = this.nowflow +"m³/h";//当前流量
	document.getElementById("sumflow").innerHTML = this.sumflow +"m³";//累计流量
	document.getElementById("windSpeed").innerHTML = this.windSpeed +"m/s";//当前风速
	document.getElementById("nowtemperature").innerHTML = this.nowtemperature+"℃";//当前温度
	document.getElementById("humidity").innerHTML = this.humidity+"%rh";//当前湿度
	document.getElementById("sumtime").innerHTML = this.sumtime +"S";//已飞行时长
	document.getElementById("sumtimeflow").innerHTML = this.sumtimeflow+"S";//已喷洒时长
	if(this.task){
		document.getElementById("taskName").innerHTML = this.task.taskname;//任务名称
	}
}

var refType ='';
var refPage = 1;
var refData = null;
/**
 * 显示任务弹框列表
 */
function showTaskList(){
	document.getElementById("ref_title").innerHTML="任务列表";//任务
	this.refType = "TASK"
	this.refPage =1;
	this.showRefList();
}
/**
 * 显示设备弹出列表
 */
function showSbidList(){
	document.getElementById("ref_title").innerHTML="设备列表";//任务
	this.refType = "SBID"
	this.refPage =1;
	this.showRefList();	
}
function showRefList(){
	this.getRefDataByPage(1)
	$('#air_ref_list').modal({
		relatedTarget: this,
		closeOnConfirm: false,
		closeOnCancel: false,
		onConfirm: function(options) {
			if(refType =='TASK'){
				task = refData;
				document.getElementById("taskid").value = refData.sid;//任务
				document.getElementById("taskname").value = refData.taskname;//任务
				$('#startTime').datetimepicker('update', refData.bgtime);
				$('#endTime').datetimepicker('update', refData.edtime);
			}else if(refType =='SBID'){
				document.getElementById("sbid").value = refData.id;//任务
				document.getElementById("sbname").value = refData.name;//任务
			}
			this.close();
		},
		onCancel: function() {
			this.close();
		}
	});
}
/**
 * 获取辅助列表
 * @param {Object} currPage 当前页数
 */
function getRefDataByPage(currPage){
	$("#my-modal-loading").modal("open");
	if(currPage == 1){
		var ref_data_list = document.getElementById("ref_data_list");
		ref_data_list.innerHTML="";
	}
	let data = Object.assign({},this.insaidParmas);
	var qe = Object.assign({},this.queryEntity);
	qe.page.currPage = currPage
	qe.page.pageSize = 20
	let oneCont =[];
	let qCont = this.queryCont;
	var reftj = document.getElementById("reftj").value//条件

	if(this.refType == 'TASK'){
		data.aid = this.taskRefName;
	 	if(reftj && reftj.length>0){
			qCont = this.queryCont;
			qCont.key = "sid";
			qCont.value = reftj;
			qCont.type = 12;
			qCont.contrast=3;
			qCont.link=0
			oneCont.push(qCont);
			qCont = this.queryCont;
			qCont.key = "taskname";
			qCont.value = reftj;
			qCont.type = 12;
			qCont.contrast=3;
			qCont.link=0
			oneCont.push(qCont);
		}
	}else if(this.refType =='SBID'){
		data.aid = this.sbidRefName;
		if(reftj && reftj.length>0){
			qCont = this.queryCont;
			qCont.key = "id";
			qCont.value = reftj;
			qCont.type = 12;
			qCont.contrast=3;
			qCont.link=0
			oneCont.push(qCont);
			qCont = this.queryCont;
			qCont.key = "name";
			qCont.value = reftj;
			qCont.type = 12;
			qCont.contrast=3;
			qCont.link=0
			oneCont.push(qCont);
		}
	}
	if(oneCont.length>0){
		qe.cont = cont = "~[" + JSON.stringify(oneCont)+"]";
	}
	data.qe = JSON.stringify(qe);
	let option = {
	    url : this.servUrl+"/sysapi",
	    method : "post",
	    data : data
	}
	this.http.post(option,initRefData,true);
}
function initRefData(msg,res){
	$("#my-modal-loading").modal("close");
	if(res == null && msg){
		alert(msg);
		return;
	}
	if(res.id ==0){
		let values = res.data.data.values;
		var ref_data_list = document.getElementById("ref_data_list");
		for(var i=0;i<values.length;i++){
			let vl = values[i];
			let ele = document.createElement("li");
			ele.className="am-g am-list-item-desced"
			let d1 = JSON.stringify(values[i]);
			d1 = encodeURIComponent(d1)
			if(this.refType == 'TASK'){
				ele.innerHTML='<a href="##" onclick="refClick(\''+d1+'\')" ><div class="am-list-item-hd ">'+vl.sid+'</div><div class="am-list-item-text">'+vl.taskname+'</div><div class="am-list-item-text">'+vl.tkstname+'</div></a>';
			}else if(this.refType == 'SBID'){
				ele.innerHTML='<a href="##" onclick="refClick(\''+d1+'\')" ><div class="am-list-item-hd ">'+vl.id+'</a><div class="am-list-item-text">'+vl.name+'</div></a>';
			}
			ref_data_list.appendChild(ele)
		}
		let page = res.data.data.page;
		if((page.currPage * page.pageSize) >page.total){
			var nextPage = document.getElementById("nextPage");
			nextPage.style.display = 'none';
		}
	}
}
function nextRef(){
	this.refPage++;
	this.getRefDataByPage(this.refPage);
}
function refClick(data){
	data = decodeURIComponent(data);
	this.refData = JSON.parse(data);;
}
//http 请求封装
var http = {};
http.quest = function (option, callback,nasync) {
    var url = option.url;
    var method = option.method;
    var data = option.data;
    var timeout = option.timeout || 0;
    var xhr = new XMLHttpRequest();
    (timeout > 0) && (xhr.timeout = timeout);
    xhr.onreadystatechange = function () {
        if (xhr.readyState == 4) {
            if (xhr.status >= 200 && xhr.status < 400) {
				var result = xhr.responseText;
				try {result = JSON.parse(xhr.responseText);} catch (e) {}
				callback && callback(null, result);
            } else {
                callback && callback('status: ' + xhr.status);
            }
        }
    }.bind(this);
    xhr.open(method, url, nasync);
    //发送合适的请求头信息
    xhr.setRequestHeader("Content-Type","application/x-www-form-urlencoded");
    let _data = null;
    if(data != null){
        _data = "";
        for(key in data){
            _data += key + "=" + data[key] + "&"
        }
        _data = _data.substring(0,_data.length-1)
    }
    xhr.send(_data);
    xhr.ontimeout = function () {
        callback && callback('timeout');
        console.log('%c连%c接%c超%c时', 'color:red', 'color:orange', 'color:purple', 'color:green');
    };
};
/**
 * 
 * @param {} option 		参数
 * @param {} callback 		回调函数
 * @param {} nasync 			是否异步
 */
http.get = function (url, callback,nasync) {
    var option = url.url ? url : { url: url };
    option.method = 'get';
    return this.quest(option, callback,nasync);
};
/**
 * 
 * @param {} option 		参数
 * @param {} callback 		回调函数
 * @param {} nasync			是否异步
 */
http.post = function (option, callback,nasync) {
    option.method = 'post';
    return this.quest(option, callback,nasync);
};

/**
 * 拆分URL 参数
 * @param {*} variable  参数名称
 */
function getQueryVariable(variable){
    var query = window.location.search.substring(1);
    var vars = query.split("&");
    for (var i=0;i<vars.length;i++) {
            var pair = vars[i].split("=");
            if(pair[0] == variable){return pair[1];}
    }
    return(false);
}


/**
 * 解析URL传参，设置页面
 */
function initPage(){
    let CustomBar =  getQueryVariable("CustomBar");
    CustomBar = CustomBar?CustomBar:80
    let StatusBar =  getQueryVariable("StatusBar");
    StatusBar = StatusBar?StatusBar:30
    let topColor =  getQueryVariable("topColor");//标题栏颜色
    topColor = topColor?topColor:'#0081ff'
    var top1 = document.getElementById("top1");
    top1.style.height = CustomBar+'px';
    // top1.style["background-color"] = topColor;
    var top2 = document.getElementById("top2");
    top2.style.height = CustomBar+'px';
    top2.style['padding-top'] = StatusBar+'px';
    var top3 = document.getElementById("top3");
    top3.style.top = StatusBar+'px';
    var top4 = document.getElementById("top4");
    top4.style.top = StatusBar+'px';
    let cc =  getQueryVariable("cc");//标题栏高度
    top3.style.height = cc+'px';
    top3.style["line-height"] = cc+'px';
    let title =  getQueryVariable("title");//页面标题
    title = decodeURIComponent(title);
    top4.innerHTML=title;
	var airMapDiv = document.getElementById("airMapDiv");
	airMapDiv.style.height = window.screen.availHeight-CustomBar+'px';
	pageType =  getQueryVariable("pageType");//页面类型
    servUrl =  getQueryVariable("servUrl");//服务端API接口
    userCode =  getQueryVariable("usrCode");//当前用户编码
    snKey =  getQueryVariable("snKey");//当前用户snkey
	dbid = getQueryVariable("dbid");//数据库连接标识
	var air_task_list = document.getElementById("air_ref_list");
    air_task_list.style.height = "calc(100% -"+ CustomBar+'px)';
	air_task_list.style['margin-top'] = CustomBar+'px';
	var weather_module = document.getElementById("weather_module");//设置天气模块距离顶部位置
	weather_module.style.top = (CustomBar)+'px';
	var f_cockpit = document.getElementById("f_cockpit");//设置天气模块距离顶部位置
	f_cockpit.style.top = (parseInt(CustomBar)+85)+'px';

	this.insaidParmas.dbid = dbid;
	this.insaidParmas.usercode = userCode;
	login(userCode)
}

function dateFormat(fmt, date) {
    let ret;
    const opt = {
        "Y+": date.getFullYear().toString(),        // 年
        "m+": (date.getMonth() + 1).toString(),     // 月
        "d+": date.getDate().toString(),            // 日
        "H+": date.getHours().toString(),           // 时
        "M+": date.getMinutes().toString(),         // 分
        "S+": date.getSeconds().toString()          // 秒
        // 有其他格式化字符需求可以继续添加，必须转化成字符串
    };
    for (let k in opt) {
        ret = new RegExp("(" + k + ")").exec(fmt);
        if (ret) {
            fmt = fmt.replace(ret[1], (ret[1].length == 1) ? (opt[k]) : (opt[k].padStart(ret[1].length, "0")))
        };
    };
    return fmt;
}
function login(userCode){
	let data =Object.assign({},this.insaidParmas);
	data.apiId = "outlogin";
	let option = {
		url : this.servUrl+"/sysapi",
		method : "post",
		data : data
	}
	this.http.post(option,null,false);
}
/**
 * 每个浏览器的偏转兼容
 * @returns {string}
 * @constructor
 */
function CSS_TRANSFORM() {
	var div = document.createElement('div');
	var props = [
		'transform',
		'WebkitTransform',
		'MozTransform',
		'OTransform',
		'msTransform'
	];

	for (var i = 0; i < props.length; i++) {
		var prop = props[i];
		if (div.style[prop] !== undefined) {
			return prop;
		}
	}
	return props[0];
}