<template>
	<view class="myBody">
		<div :id="tMapDiv" class="TMap"></div>
		<mLoad v-if="loading" :msg="'定位中...'"></mLoad>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Component, Prop, Watch } from 'vue-property-decorator';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import mLoad from '@/components/mLoad.vue';//加载页面
import Cell from '@/classes/pub/coob/Cell';
import BipInsAidNew from '@/classes/BipInsAidNew';
import {T} from "@/pages/public/gps/js/TMap"
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import comm from '@/static/js/comm.js';
let commURL: any = comm;
import { GlobalVariable } from '@/classes/tools/ICL';
import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import { Tools } from '@/classes/tools/Tools';
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
			wd.showImgById = this.showImgById;
			wd.associateClick = this.associateClick;
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
		this.snkey = LoginModule.snkey
		this.snkey = encodeURIComponent(this.snkey);
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
					let msg = "<div style='touch-action:none'>";
					for(var j=0;j<this.cels.length;j++){
						if((this.cels[j].attr & 0x400 ) == 0 && (this.cels[j].attr & 0x200 )>0){
							let val = data[this.cels[j].id];
							val = val ==null?"":val;
							if(val != "" && this.cels[j].refValue){
								val = await this.makeRef(val,this.cels[j]);
							}
							let slkbuid ='';
							if((this.cels[j].attr & (0x80000) )>0){
								slkbuid = data[this.cels[j+1].id];
								val = '<a onClick="associateClick('+"'"+val+"'"+','+"'"+slkbuid+"'"+')">'+val+'</a>';
							}
							msg+= (this.cels[j].labelString + "："+val+"<br/>");
						}
					}
					if(this.fj_root_cell && this.fj_name_cell &&((this.fj_root_cell.attr &  0x200) >0 || (this.fj_name_cell.attr &  0x200)>0) ){
						let fj_root = data[this.fj_root_cell.id];
						let fj_name = data[this.fj_name_cell.id];
						if(fj_root && fj_name){
							let nameArr = fj_name.split(";");
							if(nameArr.length>0){
								let text = '<a onClick="showOrHeiding('+"'"+fj_name+"'"+')">显示/隐藏图片('+nameArr.length+')</a>';
								msg+= (text+"<br/>");
							}
							msg +="<div style='width:200px;overflow:auto;touch-action:none;display:none' id='"+fj_name+"' >"
							for(var j=0;j<nameArr.length;j++){
								let name = nameArr[j];
								name = encodeURI(name)
								let url = this.uri+'?snkey='+this.snkey+'&fjroot='+fj_root+'&updid=36&fjname='+name;
								var imgReg = /\.(png|jpg|gif|jpeg|webp|tiff|psd)$/; //图片名为汉字的也可以匹配到
								let isImg:boolean = imgReg.test(name); //返回true ,false
								if(isImg){
									let img = "";
									if(j==0){
										img = "<img id='mapImg"+j+"' style='width: 200px;' src='"+url+"'>";
									}else{
										img = "<img id='mapImg"+j+"' style='width: 200px;display:none' src='"+url+"'>";
									}
									msg += img;
								}
							}
							if(nameArr.length>1){
								let btn = "<input style='width: 80px;height: 24px; text-align: center; background: #5596de;color: #FFF;border: none;' type='button' value='上一张'  onClick=\"showImgById('"+fj_name+"',0)\">";
								btn += "<input style='margin-left: 35px;width: 80px;height: 24px; text-align: center; background: #5596de;color: #FFF;border: none;' type='button' value='下一张'  onClick=\"showImgById('"+fj_name+"',1)\">";
								msg += btn;
							}
							msg+="</div>"
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
						let opts ={closeOnClick:true,minWidth:200,autoPan:true,maxHeight:500}
						var infoWin = new T.InfoWindow('',opts);
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
	//地图弹出显示隐藏图片
	showOrHeiding(id:any){
		var elem:any=document.getElementById(id);
		if(elem.style.display!='none'){
			elem.style.display='none'
		}else{
			elem.style.display='-webkit-box'
		}
	}
	/**
	 * 关联属性  单号点击
	 */
	async associateClick(sid:any,slkbuid:any){
		let slkid = sid;
		if (slkid && slkbuid) { 
			//获取业务定义
			let param = await tools.getBULinks(slkbuid);
			// console.log(param);
			if(param.data.id ==0){
				let opera = param.data.data.opt;
				if (opera&&!opera.pmenuid) {
					uni.showToast({title:"业务" + slkbuid + "没有绑定菜单!"}); 
					return false;
				}
				let me = Tools.findMenu(opera.pmenuid);
				if (!me) {
					uni.showToast({title: "没有" + opera.pmenuid + "菜单权限!" });
					return false;
				}else{

					let command = me.command.split("&");
					let pbuid = command[0].split("=");
					let pmenuid = command[1].split("="); 
					if(pbuid[0] == 'pmenu'){
						let pmenu = pbuid[1];
						let type = commURL.ItemType;
						let url = "";
						if(type =='credit'){
							if(pmenu =='checkRecord'){//架次查询
								pmenu = "checkRecord?1=1";
							}
							url = '/pages/alone/credit/'+pmenu;
						}
						let rr = ""+opera['pkfld']+"='"+slkid+"'"
						let qcont:any =rr;
						let uri = url+'&title='+opera.pname+'&qcont='+encodeURIComponent(qcont);
						uni.navigateTo({
							url: uri,
							complete: () => {
								uni.hideLoading();
							}
						});
					}else{
						await tools.getMenuParams(pbuid[1],pmenuid[1]).then((res:any)=>{
							let data = res.data
							if(data.id>=0){
								let _uriParams = data.data.mparams
								uni.setStorageSync(pbuid[1],JSON.stringify(_uriParams));
								let rr = ""+opera['pkfld']+"='"+slkid+"'"
								let qcont:any =rr;
								if(_uriParams.beBill){
									let uri = '/pages/appinfo/appdetail?color=blue&title='+opera.pname+"&pbuid="+pbuid[1]+'&qcont='+encodeURIComponent(qcont);
									uni.navigateTo({
										url: uri,
										complete: () => {
											uni.hideLoading();
											// this.isjump = false;
										}
									});
								}else{
									// this.openList(rowId);
								}
							}else{
								uni.showToast({
									title:'没有权限!'
								})
							}
						}).catch((err:any)=>{
							uni.showToast({
								title:'没有权限!'
							})
						})
					}
				}
			}  
		}
	}
	//图片切换
	showImgById(id:any,state:any){;//state 0:上一张 1：下一张
		var elem:any=document.getElementById(id);
		var childImg:any = elem.getElementsByTagName("img");
		for(var i=0;i<childImg.length;i++){
			var img = childImg[i]
			if(img.style.display!='none'){
				img.style.display='none'
				if(state == 0){
					if(i==0){
						i=childImg.length-1;
					}else{
						i--;
					}
					childImg[i].style.display='inline'
				}else if(state ==1){
					if(i==childImg.length-1){
						i=0;
					}else{
						i++;
					}
					childImg[i].style.display='inline'
				}
				break;
			}
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
									await InsAidModule.fetchInsDataByCont(vvs);
									let rtn:any = this.aidValues.get(key);
									if(rtn){
										val = rtn[bipInsAid.cells.cels[1].id];
									}
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
	height: calc(100vh - 100upx - 90upx );
	background-color: white;
	touch-action:none
}
.TMap{
    height: calc(100%);
    width: 100% !important;
	touch-action:none;
}
</style>
