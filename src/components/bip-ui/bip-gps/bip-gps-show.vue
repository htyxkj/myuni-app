<template>
	<view class="myBody">
		<div :id="tMapDiv" class="TMap"></div>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'定位中...'"></mLoad>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Component, Prop, Watch } from 'vue-property-decorator';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import mLoad from '@/components/mLoad.vue';//加载页面
import Cell from '@/classes/pub/coob/Cell';
import BipInsAidNew from '@/classes/BipInsAidNew';
import {T} from "@/pages/gps/js/TMap"
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import comm from '@/static/js/comm.js';
let commURL: any = comm;
import { GlobalVariable } from '@/classes/tools/ICL';
import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
@Component({components:{mLoad}})
export default class MAP extends Vue {
	uri:any ="";//
	snkey:any = "";// 
	loading:any = false;
	tMap:any= null;
	tMapDiv:any = "MAP"+new Date().getTime();
	tZoom:number=12;
	@Prop({type:String}) title!:string
	@Prop() cels:any;
	@Prop() pdList:any;
	map_name_cell:any = null;
	map_root_cell:any = null;
	map_icon_cell:any = null;
	fj_root_cell:any = null;
	fj_name_cell:any = null;

	CloudMarkerCollection:any = null; //天地图海量点对象
	pointMsg:any={};//每个点的提示信息
	mounted(){
		this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
		this.snkey = LoginModule.snkey
		this.snkey = encodeURIComponent(this.snkey);
		for(var i=0;i<this.cels.length;i++){
			if(this.cels[i].editType==12){//地图
				this.map_name_cell = this.cels[i];
				if(this.cels[i+1]){
					this.map_root_cell = this.cels[i+1];
					this.map_icon_cell = this.cels[i+2];
				}
			}else if(this.cels[i].editName == "UPDOWN"){
				this.fj_root_cell = this.cels[i-1];
				this.fj_name_cell = this.cels[i];
			}
		}
		// #ifdef  H5
			this.$nextTick(function(){
				this.createdMap();
			})
			let wd:any = window;
			wd.showOrHeiding = this.showOrHeiding;    // 方法赋值给window
		// #endif
	}
	
	// #ifdef  H5
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
	async initMapData(){
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
						if((this.cels[j].attr & 0x400 ) == 0 && (this.cels[j].attr & 0x200 )>0){
							let val = data[this.cels[j].id];
							val = val ==null?"":val;
							if(val != "" && this.cels[j].refValue){
								val = await this.makeRef(val,this.cels[j]);
							}
							msg+= (this.cels[j].labelString + "："+val+"<br/>");
						}
					}
					if(this.fj_root_cell && this.fj_name_cell &&((this.fj_root_cell.attr &  0x200) >0 || (this.fj_name_cell.attr &  0x200)>0) ){
						let fj_root = data[this.fj_root_cell.id];
						let fj_name = data[this.fj_name_cell.id];
						if(fj_root && fj_name){
							let nameArr = fj_name.split(";");
							for(var j=0;j<nameArr.length;j++){
								let name = nameArr[j];
								name = encodeURI(name)
								let url = this.uri+'?snkey='+this.snkey+'&fjroot='+fj_root+'&updid=36&fjname='+name;
								var imgReg = /\.(png|jpg|gif|jpeg|webp|tiff|psd)$/; //图片名为汉字的也可以匹配到
								let isImg:boolean = imgReg.test(name); //返回true ,false
								if(isImg){
									let text = '<a onClick="showOrHeiding('+"'"+name+"'"+')">显示/隐藏图片</a><br/>';
									let img = "<img id='"+name+"' style='width: 200px;display:none' src='"+url+"'>";
									msg+= (text+img+"<br/>");
								}
								j = nameArr.length;
							}
						}
					}
					this.pointMsg[key]= msg;
					var marker = null;
					if(this.map_icon_cell){
						let url = data[this.map_icon_cell.id];
						if(url){
							if(!url.startsWith("http")){
								url = commURL.BaseUri+url;
							}
							var icon = new T.Icon({
								iconUrl: url,
								iconSize: new T.Point(19, 27),
								iconAnchor: new T.Point(10, 25)
							});
							marker = new T.Marker(lgt,{icon:icon});// 创建标注
						}else{
							marker = new T.Marker(lgt);// 创建标注
						}
					}else{
						marker = new T.Marker(lgt);// 创建标注
					}
					let _this = this;
					marker.addEventListener("click", function (e:any) {
						var lnglat = e.lnglat;
						//创建信息窗口对象
						var infoWin = new T.InfoWindow();
						infoWin.setLngLat(lnglat);
						//设置信息窗口要显示的内容
						infoWin.setContent(_this.pointMsg[lnglat.kid]);
						_this.tMap.addOverLay(infoWin);
					});// 将标注添加到地图中
                	this.tMap.addOverLay(marker);
				}
			}
			if(points.length>0){
				let cc = this.tMap.getViewport(points);
				this.tMap.centerAndZoom(cc.center,cc.zoom)
			}
			//海量点
			// if(points.length>0){
			// 	this.CloudMarkerCollection = new T.CloudMarkerCollection(points,{
			// 		color:'blue',
			// 		SizeType:'TDT_POINT_SIZE_HUGE',
			// 		ShapeType:'TDT_POINT_SHAPE_WATERDROP'
			// 		// 海量点的预设形状。
			// 		// TDT_POINT_SHAPE_CIRCLE 圆形，为默认形状。
			// 		// TDT_POINT_SHAPE_STAR星形。
			// 		// TDT_POINT_SHAPE_SQUARE方形。
			// 		// TDT_POINT_SHAPE_RHOMBUS菱形。
			// 		// TDT_POINT_SHAPE_WATERDROP滴状。
			// 	})
			// 	let _this = this;
			// 	this.CloudMarkerCollection.addEventListener("click", function (e:any) {
			// 		var lnglat = e.lnglat;
			// 		//创建信息窗口对象
			// 		var infoWin = new T.InfoWindow();
			// 		infoWin.setLngLat(lnglat);
			// 		//设置信息窗口要显示的内容
			// 		infoWin.setContent(_this.pointMsg[lnglat.kid]);
			// 		_this.tMap.addOverLay(infoWin);
			// 	});// 将标注添加到地图中 
			// 	this.tMap.addOverLay(this.CloudMarkerCollection);
			// }
		}
	}
	showOrHeiding(id:any){
		var elem:any=document.getElementById(id);
		if(elem.style.display!='none'){
			elem.style.display='none'
		}else{
			elem.style.display='inline'
		}
	}
	// #endif
	async makeRef(val:any,cell:Cell){
		let ref = cell.refValue ||cell.editName
		let bipInsAid:BipInsAidNew = new BipInsAidNew("");
		if(ref.indexOf('{')>-1){
			ref = ref.substring(ref.indexOf('{')+1,ref.indexOf('}'));
			if(ref.startsWith('$')){
				bipInsAid.cl = true;
				ref = ref.substring(1);
			}else{
				if(ref.startsWith('&')){
					ref = ref.substring(1);
				}
			}
			// console.log(ref)
			let editName = ref;
			let aidKey = bipInsAid.cl?(ICL.AID_KEYCL+ref):(ICL.AID_KEY+ref);
			let rr = this.aidmaps.get(aidKey);
			if(rr){
				bipInsAid = bipInsAid.clone(rr);
				bipInsAid.id = editName;
			}else{
				if(!this.inProcess.get(aidKey)){
					let res = await InsAidModule.fetchInsAid({ id: (bipInsAid.cl?300:200), aid: editName });
					if(res.data && res.data.id ==0){
						bipInsAid = res.data.data.data;
					}else if(res){
						bipInsAid = res;
					}else{
						return val;
					}
				}
			}
			if(bipInsAid.cl){//常量
				if(bipInsAid.values){
					let idx = bipInsAid.values.findIndex((item:any)=>{
						return item[bipInsAid.cells.cels[0].id]+'' === val+'';
					})
					if(idx>-1){
						let item = bipInsAid.values[idx];
						val = item[bipInsAid.cells.cels[1].id];
					}
				}
			}else{//辅助
				aidKey = ICL.AID_KEY+bipInsAid.id; 
				let key = aidKey+"_"+val;
				let rr = this.aidValues.get(key);
				if(rr){
					bipInsAid.values[0] = rr;
					bipInsAid.makeShow();
					val = bipInsAid.showV;
				}else{
					if(!this.inProcess.get(key)){
						let key = aidKey+"_"+val;
						if(!this.inProcess.get(key)){
							let rtn = this.aidValues.get(key);
							if(!rtn){
								let cel = bipInsAid.cells.cels[0];
								if(cel){
									let cont = "";
									if(cel.type<12){
										cont = cel.id+"="+val+""
									}else{
										cont = cel.id+"='"+val+"'"
									}
									let vvs = {id:bipInsAid.id,key:key,cont:cont}
									InsAidModule.fetchInsDataByCont(vvs);
								}
							}
						}else{
							let rtn = this.aidValues.get(key);
							if(rtn){
								bipInsAid.values[0] = rtn;
								bipInsAid.makeShow();
								val = bipInsAid.showV;
							}
						}
					} 
				}
			}
		}else{
		}
		return val;
	}
	get aidmaps(){
		return InsAidModule.aidInfos;
	}

	get inProcess(){
		return InsAidModule.inProcess;
	}
	get aidValues(){
		return InsAidModule.aidValues;
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
