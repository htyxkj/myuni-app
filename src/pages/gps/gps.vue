<template>
	<view class="myBody">
		<cu-custom bgColor="bg-blue" :isBack="true">
			<block slot="content">
				<view class="header-title">{{ title }}</view>
			</block>
		</cu-custom>
		<div :id="tMapDiv" class="TMap"></div>
		<view>
			<!-- <view class="padding-lr">
				<view class="cu-form-group" style="border: 1px solid #c7c7c7">
					<input placeholder="查询位置" name="input"></input>
					<text class='cuIcon-search text-orange'></text>
				</view>
			</view> -->
			<view class="padding-lr">
				<view class="solid-bottom padding">
					<text >当前位置</text>
				</view>
				<view class="padding">{{address}}</view>
			</view>
		</view>
		<view class="padding-xl">
			<button class="cu-btn block line-green lg" :disabled="disabled" @tap="refreshH5Gps"> <text class="cuIcon-locationfill"></text> 重新定位</button>
			<button class="cu-btn block bg-blue margin-tb-sm lg" :disabled="disabled" @tap="select"> <text class="cuIcon-roundcheck"></text> 确定</button>
		</view>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'定位中...'"></mLoad>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
let dd = require( 'dingtalk-jsapi');
import { Vue, Provide, Component, Prop, Watch } from 'vue-property-decorator';
import mLoad from '@/components/mLoad.vue';//加载页面
import {T} from "./js/TMap"
import { GlobalVariable } from '@/classes/tools/ICL';
import { GPSUtil } from "./js/GPSUtil";
let Gps = GPSUtil.GPS;
import {singIn} from '@/pages/index/singIn/singIn'
@Component({components:{mLoad}})
export default class MAP extends Vue {
	loading:any = false;
	methordName:any = "";
	title:any="位置选择";
	tMap:any= null;
	tMapDiv:any = "MAP"+new Date().getTime();
	tZoom:number=12;
	address:any = "";
	lnglat:any ="";
	disabled:boolean = false // 非编辑
	gps:any="";
	markerPoint:any = null;
	isZoom:boolean =false;
	async onLoad(option: any) {
		await singIn.ServApi.initDDJSTicket();
		this.methordName = option.methordName;
		let ds = option.ds;
		if(ds == "true")
			this.disabled = true; 
		if(option.gps && option.gps != "undefined")
			this.gps = option.gps;
		this.$nextTick(function(){
			this.createdMap();
			// this.checkOpenGps();
		})
	} 
	// 创建地图
  	createdMap(){
		//初始化地图对象
        this.tMap = new T.Map(this.tMapDiv,{projection:"EPSG:4326"});
        // this.tMap = new T.Map(this.tMapDiv);
        //设置显示地图的中心点和级别
        this.tMap.centerAndZoom(new T.LngLat(116.40969, 39.89945), this.tZoom);
        //创建缩放平移控件对象
        let control = new T.Control.Zoom();
        //添加缩放平移控件
		this.tMap.addControl(control);
		this.tMapGetH5GPS();
		this.addMapZoomstart();
		this.addMapZoomend();
		if(!this.disabled)
			this.addMapMousemove();
	}
	//重新定位
	refreshH5Gps(){
		this.gps = null;
		this.tMapGetH5GPS();
	}
	//获取H5定位信息
	tMapGetH5GPS(){
		let loginType = uni.getStorageSync("loginType");			
		this.tMap.clearOverLays();
		let _this = this;
		if(this.gps){
			let ccc = _this.gps.split(";");
			let res =  {longitude:ccc[0],latitude:ccc[0]};
			this.receiveGPS(res);
		}else{
			this.loading = true;
			var lo = new T.Geolocation();
			let fn = function (e:any) {
				if(!e.lnglat){//H5 定位没有获取到位置信息  判断是否是钉钉  用钉钉的API 再获取一次
					if(loginType == GlobalVariable.LOGIN_TYPE_DING){
						dd.ready(function() {
							dd.device.geolocation.get({
								onSuccess: function (result:any) {   
									if(result.errorCode ==0 || result.resultCode == 0){
										let res:any = null;
										if(dd.env.platform == 'android'){
											let resGPS:any = Gps.gcj02_To_Gps84(result.latitude,result.longitude)
											res = {longitude:resGPS[1],latitude:resGPS[0]}; 
										}else if(dd.env.platform =='ios'){
											res = {longitude:result.longitude,latitude:result.latitude}; 
										}
										_this.receiveGPS(res);
									}else{
										let message = result.errorMessage;
										let cc = message.split("详细信息:");
										if(cc.length>=1){
											message = cc[1];
										}
										let msg:any = _this.$refs['msg'];
										msg.error({background: true,content:message})
									}
									_this.loading = false;
								},
								onFail: function (err:any) {
									alert('dd error: ' +JSON.stringify(err)); 
									_this.loading = false;
								}
							})
						});
					}else{
						let msg:any = _this.$refs['msg'];
						msg.error({background: true,content:"请检查定位服务是否开启！"})
						_this.loading = false;
					}
				}else{
					let res = {longitude:e.lnglat.lng,latitude:e.lnglat.lat}; 
					_this.receiveGPS(res);
					_this.loading = false;
				}
			}
			let  options ={maximumAge:600,timeout:5000} 
			lo.getCurrentPosition(fn,options);
		}
	}
	//地图标点  或GPS 位置信息
	receiveGPS(e:any){
		this.lnglat = e.longitude+";"+e.latitude
		let lnglat = new T.LngLat(e.longitude, e.latitude)
		this.tMap.centerAndZoom(lnglat, 18)
		this.markerPoint = null;
		this.markerPoint = new T.Marker(lnglat);
		this.tMap.addOverLay(this.markerPoint);
		//根据GPS 检索 位置信息
		let geocode = new T.Geocoder();
		geocode.getLocation(lnglat,this.searchResult);
	}
	//接收位置信息
	searchResult(res:any){
		this.address = res.resultObj.formatted_address
	}
	//确定
	select(){
		let param ={address:this.address,lgt:this.lnglat};
		if(this.methordName){
			uni.$emit(this.methordName,param)
		}
		uni.navigateBack({delta:1});
	}

	//地图移动过程中触发此事件。
	addMapMousemove() {
		this.removeMapMousemove();
		this.tMap.addEventListener("move", this.MapMousemove);
	}
	//移除地图移动事件
	removeMapMousemove() {
		this.tMap.removeEventListener("move", this.MapMousemove);
	}
	MapMousemove(e:any) {
		if(this.markerPoint && this.isZoom){
			let cen = this.tMap.getCenter();
			this.lnglat = cen.lng+";"+cen.lat
			this.markerPoint.setLngLat(this.tMap.getCenter())
			let geocode = new T.Geocoder();
			geocode.getLocation(this.tMap.getCenter(),this.searchResult);
		}
	}
	//地图缩放结束事件
	addMapZoomend(){
		this.removeMapZoomend();
		this.tMap.addEventListener("zoomend", this.MapZoomend);
	}
	removeMapZoomend(){
		this.tMap.removeEventListener("zoomend", this.MapZoomend);
	}
	MapZoomend(){
		if(this.markerPoint){
			this.tMap.panTo(this.markerPoint.getLngLat())
		}
		this.isZoom = false;
		setTimeout(() => {
			this.addMapMousemove();
			this.isZoom = true;
		}, 1000);
	}
	//地图缩放开始
	addMapZoomstart(){
		this.removeMapZoomstart();
		this.tMap.addEventListener("zoomstart", this.Mapzoomstart);
	}
	removeMapZoomstart(){
		this.tMap.removeEventListener("zoomstart", this.Mapzoomstart);
	}
	Mapzoomstart(){
		this.isZoom = true;
		this.removeMapMousemove();
	}

	// checkOpenGps(){
	// 	let system = uni.getSystemInfoSync();// 获取系统信息
	// 	if (system.platform === 'android') { // 判断平台
	// 		var context:any = plus.android.importClass("android.content.Context");
	// 		var locationManager:any = plus.android.importClass("android.location.LocationManager");
	// 		var main:any = plus.android.runtimeMainActivity();
	// 		var mainSvr = main.getSystemService(context.LOCATION_SERVICE);
	// 		if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
	// 			uni.showModal({
	// 				title: '提示',
	// 				content: '请打开定位服务功能',
	// 				showCancel: false, // 不显示取消按钮
	// 				success() {
	// 					if (!mainSvr.isProviderEnabled(locationManager.GPS_PROVIDER)) {
	// 						var Intent = plus.android.importClass('android.content.Intent');
	// 						var Settings:any = plus.android.importClass('android.provider.Settings');
	// 						var intent = new Intent(Settings.ACTION_LOCATION_SOURCE_SETTINGS); 
	// 						main.startActivity(intent); // 打开系统设置GPS服务页面
	// 					} else {
	// 						console.log('GPS功能已开启');
	// 					}
	// 				}
	// 			});
	// 		}
	// 	} 
	// }
}
</script>

<style lang="scss" scoped>
.myBody{
	height: 100vh;
	background-color: white;
}
.TMap{
    height: 700upx;
    width: 100%;
}
</style>
