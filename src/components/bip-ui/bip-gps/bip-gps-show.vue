<template>
	<view class="myBody">
		<div :id="tMapDiv" class="TMap"></div>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'定位中...'"></mLoad>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Component, Prop, Watch } from 'vue-property-decorator';
import mLoad from '@/components/mLoad.vue';//加载页面
import {T} from "@/pages/gps/js/TMap"
@Component({components:{mLoad}})
export default class MAP extends Vue {
	loading:any = false;
	tMap:any= null;
	tMapDiv:any = "MAP"+new Date().getTime();
	tZoom:number=12;
	@Prop({type:String}) title!:string
	@Prop() cels:any;
	@Prop() pdList:any;
	map_name_cell:any=null;
	map_root_cell:any=null;
	CloudMarkerCollection:any = null; //天地图海量点对象
	pointMsg:any={};//每个点的提示信息
	mounted(){
		for(var i=0;i<this.cels.length;i++){
			if(this.cels[i].editType==12){//地图
				this.map_name_cell = this.cels[i];
				if(this.cels[i+1]){
					this.map_root_cell = this.cels[i+1];
				}
				break;
			}
		}
		this.createdMap();
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
	}
	initMapData(){
		this.tMap.clearOverLays();
		if(this.pdList){
			let points:any=[];
			for(var i=0;i<this.pdList.length;i++){
				let data = this.pdList[i].data;
				if(data[this.map_root_cell.id]){
					let lng = "";
					let lat = "";
					let root = data[this.map_root_cell.id];
					lng = root.split(";")[0]
					lat = root.split(";")[1]
					let lgt = new T.LngLat(lng, lat)
					let key = lng+"_"+lat
					lgt.kid = key
					points.push(lgt);
					let msg = "<div>";
					for(var j=0;j<this.cels.length;j++){
						if((this.cels[j].attr & 0x400 ) == 0){
							msg+= (this.cels[j].labelString + "："+data[this.cels[j].id]+"<br/>");
						}
					}
					this.pointMsg[key]= msg;
				}
			}
			if(points.length>0){
				this.CloudMarkerCollection = new T.CloudMarkerCollection(points,{
					color:'blue',
					SizeType:'TDT_POINT_SIZE_HUGE',
					ShapeType:'TDT_POINT_SHAPE_WATERDROP'
					// 海量点的预设形状。
					// TDT_POINT_SHAPE_CIRCLE 圆形，为默认形状。
					// TDT_POINT_SHAPE_STAR星形。
					// TDT_POINT_SHAPE_SQUARE方形。
					// TDT_POINT_SHAPE_RHOMBUS菱形。
					// TDT_POINT_SHAPE_WATERDROP滴状。
				})
				let _this = this;
				this.CloudMarkerCollection.addEventListener("click", function (e:any) {
					var lnglat = e.lnglat;
					//创建信息窗口对象
					var infoWin = new T.InfoWindow();
					infoWin.setLngLat(lnglat);
					//设置信息窗口要显示的内容
					infoWin.setContent(_this.pointMsg[lnglat.kid]);
					_this.tMap.addOverLay(infoWin);
				});// 将标注添加到地图中 
				this.tMap.addOverLay(this.CloudMarkerCollection);
			}
		}
	}

	@Watch("pdList")
	pdListChange(){
		if(this.tMap){
			this.initMapData();
		}
	}

}
</script>

<style lang="scss" scoped>
.myBody{
	height: 100vh;
	background-color: white;
}
.TMap{
    height: calc(100% - 100upx - 90upx );
    width: 100%;
}
</style>
