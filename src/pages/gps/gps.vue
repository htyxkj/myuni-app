<template>
	<view class="myBody">
		<cu-custom bgColor="bg-blue" :isBack="true">
			<block slot="content">
				<view class="header-title">{{ title }}</view>
			</block>
		</cu-custom>
		<div :id="tMapDiv" class="TMap"></div>
		<view>
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
import { Vue, Provide, Component, Prop, Watch } from 'vue-property-decorator';
import mLoad from '@/components/mLoad.vue';//加载页面
import {T} from "./js/TMap"
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
	async onLoad(option: any) {
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
				if(!e.lnglat){
					let msg:any = _this.$refs['msg'];
					msg.error({background: true,content:"请检查定位服务是否开启！"})
				}else{
					let res = {longitude:e.lnglat.lng,latitude:e.lnglat.lat}; 
					_this.receiveGPS(res);
				}
				_this.loading = false;
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

	//在地图注册的鼠标滑动事件
	addMapMousemove() {
		//移除在地图注册的鼠标滑动事件
		this.removeMapMousemove();
		this.tMap.addEventListener("mousemove", this.MapMousemove);
	}
	removeMapMousemove() {
		//移除在地图注册的鼠标滑动事件
		this.tMap.removeEventListener("mousemove", this.MapMousemove);
	}
	MapMousemove(e:any) {
		if(this.markerPoint){
			this.markerPoint.setLngLat(this.tMap.getCenter())
			let geocode = new T.Geocoder();
			geocode.getLocation(this.tMap.getCenter(),this.searchResult);
		}
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
