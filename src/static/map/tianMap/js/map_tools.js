/**
 * 绘制覆盖点
 * @param {Object} tMap		 地图对象
 * @param {Object} key		 标注点唯一标识
 * @param {Object} LngLat	 经纬度点
 * @param {Object} icon		 图标
 * @param {Object} callback  点击回调事件
 * @param {Object} msg		 文字提示
 * @param {Object} zIndexOffset		 标注图层
 */
function tmap_marker(tMap,key,lnglat,icon,callback,msg,zIndexOffset){
	var marker = new T.Marker(lnglat, {icon: icon,zIndexOffset:zIndexOffset});
	marker.key = key;
	if(callback){
		marker.addEventListener("click",callback)
	}
	if(msg && msg.length>0){
		var markerInfoWin = new T.InfoWindow(msg);
		marker.addEventListener("mouseover", function () {
			marker.openInfoWindow(markerInfoWin);
		});//将标注添加到地图中
	}
	//向地图上添加标注
	tMap.addOverLay(marker);
	return marker;
}

/**
 * 绘制覆盖面
 * @param {Object} tMap      地图对象
 * @param {Object} color	 颜色
 * @param {Object} lngLatArr 点集合
 */
function tmap_markSurface(tMap,color,lngLatArr){
	//创建面对象
	var polygon = new T.Polygon(lngLatArr, {
		color: "blue",
		weight: 1,
		opacity: 0.5,
		fillColor: color,
		fillOpacity: 0.5
	});
	tMap.addOverLay(polygon);
	return polygon;
}

/**
 * 覆盖圆
 * @param lngLat 经纬度
 * @param color 颜色
 * @param radius 半径
 * @param tMap 地图
 */
function tmap_markCircle(lngLat,color,radius,tMap,fillOpacity){
	radius = parseFloat(radius+'')
	fillOpacity = !fillOpacity?0.5:fillOpacity;
	var circle = new T.Circle(lngLat, radius,{color:"blue",weight:1,opacity:0.7,fillColor:color,fillOpacity:fillOpacity,lineStyle:"solid"});
	//向地图上添加圆
	tMap.addOverLay(circle); 
	return circle;
}
/**
 * 画覆盖点
 * @param lngLat 经纬度 信息   经度,纬度
 * @param tMap  当前地图对象
 */
function tmap_markpoint(lngLat,tMap){
	var marker = new T.Marker(lngLat);
	//向地图上添加标注
	tMap.addOverLay(marker);
	return marker;
}
/**
 * @param {Object} lngLat 经纬度点集合
 * @param {Object} color 颜色
 * @param {Object} tMap 当前地图对象
 */
function tmap_makeRoute(lngLat,color,tMap){
	let editLine = null;
	let options ={color:color, opacity: 1, weight: 4,};
	//创建线对象
	editLine = new T.Polyline(lngLat,options);
	//向地图上添加线
	tMap.addOverLay(editLine); 
	return editLine;
}

/**
 * 求两点间的角度
 * @param {*} curPos 第一点
 * @param {*} targetPos 第二点
 * @param {*} TMap 地图对象
 */
function getRotation(curPos, targetPos,TMap) {
	var deg = 0;
	//start!
	curPos = TMap.lngLatToContainerPoint(curPos);//起点经纬度
	targetPos = TMap.lngLatToContainerPoint(targetPos);//终点经纬度
	if(curPos == null)
		return 360;
	if(targetPos == null)
		return 360;
	if (targetPos.x != curPos.x) {
		var tan = (targetPos.y - curPos.y) / (targetPos.x - curPos.x),
				atan = Math.atan(tan);
		deg = atan * 360 / (2 * Math.PI);
		//degree  correction;
		if (targetPos.x < curPos.x) {
			deg = -deg + 90 + 90;
		} else {
			deg = -deg;
		}
		return (-deg);
	} else {
		var disy = targetPos.y - curPos.y;
		var bias = 0;
		if (disy > 0)
			bias = -1
		else
			bias = 1
		return (-bias * 90);
	}
	return 0;
}
