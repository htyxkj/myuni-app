<template>
	<view class="qiun-columns">
		<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
			<view class="qiun-title-dot-light">{{title}}</view>
		</view>
		<view class="qiun-charts" >
			<canvas v-if="chartId" :id="chartId" :canvasId="chartId" 
			class="charts"
			:style="{'width':cWidth*pixelRatio+'px','height':cHeight*pixelRatio+'px', 
			'transform': 'scale('+(1/pixelRatio)+')','margin-left':-cWidth*(pixelRatio-1)/2+'px',
			'margin-top':-cHeight*(pixelRatio-1)/2+'px'}"
				@touchstart="touchLineA" @touchmove="moveLineA" @touchend="touchEndLineA">
			</canvas> 
		</view>
	</view>
</template>
<script lang="ts">
	// 组件地址  https://www.ucharts.cn/
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import {icl} from '@/classes/tools/CommICL';
	const ICL = icl; 
	import { baseUtils } from '@/classes/api/baseutils'; 
	let paramTools = baseUtils.tools;
	import {
		Tools
	} from '../../classes/tools/Tools';
	import Menu from '@/classes/Menu';
	import QueryEntity from '@/classes/search/QueryEntity';
	import URIParams from '@/classes/URIParams'
	import uCharts from '@/lib/u-chars/u-charts.js';
	import Cells from '@/classes/pub/coob/Cells';
	import CDataSet from '@/classes/pub/CDataSet';

	var canvases:any = {};
	@Component({
		components:{}
	})
	export default class CustomChart extends Vue {
		@Prop({default:null}) layoutdata?:any;
		color:any = ["#3AA1FF","#975FE5","#F2637B","#FBD437","#4ECB73","#5AD4D4"];
		restoreICON:any =null;//刷新图标
		stat:any = null;//图表信息
		selValue:any = null;//统计值
		selGroup:any = null;//统计项
		title:any = null;//表题
		tableData:any =[];//数据集合
		cWidth:any = uni.upx2px(750);//宽度
		cHeight:any = uni.upx2px(500);//高度
		chartId: string = Tools.guid()
		uriParams: URIParams = new URIParams();//菜单参数
		dsm_cont:CDataSet = new CDataSet(null);//条件对象
		dsm:CDataSet = new CDataSet(null);//数据对象
		tjcell:any = null;//tjcell
		pixelRatio:any =1;
		async mounted() {
			this.$nextTick(()=>{ 
				this.restoreICON ="path://M49.07,31.35l-3.36-5.82a.31.31,0,0,0-.21-.16.33.33,0,0,0-.4.09L40.78,30.6a.35.35,0,0,0,0,.49.36.36,0,0,0,.49,0L45,26.64A20,20,0,0,1,8.67,37.57a.35.35,0,0,0-.49-.08A.34.34,0,0,0,8.1,38,20.73,20.73,0,0,0,45.7,26.89l2.77,4.8a.35.35,0,0,0,.48.13A.34.34,0,0,0,49.07,31.35ZM.67,19.36,4,25.18a.34.34,0,0,0,.21.16.34.34,0,0,0,.41-.09L9,20.11a.34.34,0,0,0,0-.49.36.36,0,0,0-.49,0l-3.7,4.41A20,20,0,0,1,41.08,13.14a.34.34,0,0,0,.56-.4A20.73,20.73,0,0,0,4,23.82L1.27,19a.34.34,0,0,0-.47-.13A.34.34,0,0,0,.67,19.36Z";
				let d1 = JSON.parse(this.layoutdata.content)
				let url = d1.url
				this.initDesk(url);
			});
		}
		//获取图表初始化信息
		async initDesk(sid:any){
			let qe:QueryEntity = new QueryEntity("INSDESK","INSDESK");//查询实体
			qe.cont = JSON.stringify( {sid:sid});
			qe.oprid = 13;
			qe.type = 0;
			await tools.query(qe).then((res:any)=>{
				if(res.data.id ==0){ 
					let data = res.data.data.data.data;
					let chartData = data[0].data;
					let cont = JSON.parse(chartData.cont) 
					let rech = JSON.parse(chartData.rech)
					this.stat = {selGroup:"",selValue:"",chartTypeValue:'',showChart:false,width:24,title:'',rech:rech};
					this.stat.selGroup = cont.spbds.split(",");
					this.stat.selValue = cont.spflds.split(",");
					this.stat.title = chartData.sname;
					this.stat.chartTypeValue = cont.charttype;
					this.title = this.stat.title
					this.initBasisData(cont.menuid)
				}
			});
		}

		async searchData() {
			this.tjcell = null;
			this.selValue = this.stat.selValue;
			this.selGroup = this.stat.selGroup;
			this.title = this.stat.title;

			let param:any=null;
			let  groupdatafilds,groupfilds ; 
			groupfilds = JSON.stringify(this.selGroup);
			groupdatafilds = JSON.stringify(this.selValue); 
			let qe: QueryEntity = new QueryEntity("","");
			qe.pcell = this.dsm.ccells.obj_id
			qe.tcell = this.dsm_cont.ccells.obj_id
			qe.cont = JSON.stringify(this.stat.rech);
			param = paramTools.getBipStatisticsParams(JSON.stringify(qe),groupfilds,groupdatafilds);
			let chartData:any = await tools.getFromServer(param); 
			if(chartData.data.id == 0){
				this.tableData = chartData.data.data.tjpages.celData
				this.tjcell = chartData.data.data.tjlayCels
				await this.initChartData(chartData);
			}else{
				
			}
		}

		async initChartData(chartData:any){
			let _self = this;
			let option = {
				$this:_self,
				canvasId: this.chartId,
				type: 'line',
				fontSize:11,
				legend:{show:true},
				dataLabel:true,
				background:'#FFFFFF',
				categories:  [],
				series: [],
				rotate:false,
				animation: true,
				enableScroll: true,//开启图表拖拽功能
				xAxis: {
					disableGrid:true,
					type:'grid',
					gridType:'dash',
					itemCount:5,
					scrollShow:true,
					scrollAlign:'left',
					scrollBackgroundColor:'#F7F7FF',
					scrollColor:'#DEE7F7',
					boundaryGap:'justify'
				},
				yAxis: {
					gridType:'dash',
					splitNumber:10,
					format:(val:any)=>{
						// return val.toFixed(0)
						return val;
					}
				},
				width: this.cWidth ,
				height: this.cHeight ,
				extra: {
					line:{
						type:'straight',//可选值：curve曲线，straight直线
					},
					area:{
						type:'straight',//可选值：curve曲线，straight直线
					},
					column:{
						type:'group',//group分组柱状图，stack为堆叠柱状图，meter为温度计式图
					},
					pie: {
						labelWidth:15
					},
					rose: {
						type:'area',
						minRadius:50,
						activeOpacity:0.5,
						offsetAngle:0,
						labelWidth:15
					},
					funnel: {
						border:true,
						borderWidth:2,
						borderColor:'#FFFFFF'
					},
					tooltip:{
						showBox:true,//是否显示半透明黑色的提示区域
						bgColor:'#000000',//主体背景颜色
						bgOpacity:0.7,//背景颜色透明度
						gridType:'dash',//辅助线类型（虚线）
						dashLength:5,//虚线单段长度
						gridColor:'#1890ff',//辅助线颜色
						fontColor:'#FFFFFF',//主体文字颜色
						horizentalLine:false,//是否显示横向辅助线
						xAxisLabel:true,//是否显示X轴辅助标签
						yAxisLabel:true,//是否显示Y轴辅助标签
						labelBgColor:'#DFE8FF',//标签背景颜色
						labelBgOpacity:0.95,//背景颜色透明度
						labelFontColor:'#666666'//标签文字颜色
					}
				}
			};
			let type = this.stat.chartTypeValue.split("-");
			if(type.length ==1){
				type.push[0]
			}
			if(type[0] == 'line'){//折线类
				option = await this.makeLine(chartData,type[1],option);
			}else if(type[0] == 'bar'){//柱状类
				option = await this.makeBar(chartData,type[1],option);
			}else if(type[0] == 'pie'){//饼状类
				option = await this.makePie(chartData,type[1],option);
			}else if(type[0] == 'funnel'){//漏斗图
				option = await this.makeFunnel(chartData,type[1],option);
			}
			canvases[this.chartId] = new uCharts(option)
		}
		/**
		 * 折线图  ==》折线图、折线面积图、平滑折线图、平滑折线面积图、堆叠折线图、堆叠面积折线图
		 * 数据，图表类型
		 */
		async makeLine(chartData:any,type:any,option:any){
			if(type ==1 || type ==3 || type ==5 || type ==7){//面积
				option.type ='area'
			}
			if(type ==2 || type ==3 || type ==6 || type==7){//平滑
				option.extra.line.type = 'curve'
				option.extra.area.type = 'curve'
			}
			let chartD = chartData.data.data.tjpages.celData; 
		 	var categories:any = [];
			var series0:any = []; 
			if(type<4){//普通
				for(let i=0;i<chartD.length;i++){
					var item = chartD[i];
					var name = await this.getGroupFldName(item,0);
					categories.push(name);
					this.selValue.forEach((fld:any, key1:any) => {
						let colname = this.getFldName(fld);
						var _idx = series0.findIndex(function(im:any) {
							return im.name == colname;
						});
						if (_idx >= 0) {
							var bb = series0[_idx];
							bb.data[i] = item[fld];
							series0[_idx] = bb;
						} else {
							var bb:any ={}
							bb = { name: colname, data: [] };
							bb.data[i] = item[fld];
							series0.push(bb);
						}
					});
				}
			}else{//堆叠
				let legendD = [];//第一个X轴
				let xAxisD = [];//第二个X轴
				let xD = this.selGroup[0];
				let lD = this.selGroup[1]
				let allData = chartData.data.data.tjpages.celData; 
				for(var i=0;i<allData.length;i++){
					let data = allData[i]
					var name = await this.getGroupFldName(data,0);
					categories.push(name)
					legendD.push(data[lD]);
					xAxisD.push(data[xD]);
				}
				categories = Array.from(new Set(categories));
				legendD = Array.from(new Set(legendD));
        		xAxisD = Array.from(new Set(xAxisD));
				for(var k=0;k<legendD.length;k++){
					let dd:any  = {
						name: '',
						data: [],
					}
					for(var j=0;j<xAxisD.length;j++){
						let ispush = false;
						for(var i=0;i<this.tableData.length;i++){
							let data = this.tableData[i]
							if(data[lD] == legendD[k]&&xAxisD[j] == data[xD]){
								dd.data.push(data[this.selValue[0]])
								dd.name= await this.getGroupFldName(data,1);
								ispush = true;
							}
						}
						if(!ispush){
							dd.data.push(0);
						}
					}
					series0.push(dd);
				}
			}
			option.categories = categories;
			option.series = series0;
			return option;
		}
		/**
		 * 柱状图  ==》柱状图、条形图、堆叠柱状图、堆叠条形图
		 * 数据，图表类型
		 */
		async makeBar(chartData:any,type:any,option:any){
			option.type = 'column'
			if(type ==1 || type ==3 || type ==5){//条形
				option.rotate = true;
			} 
			if(type == 4 || type ==5){
				option.extra.column.type='stack'
			}
			option.extra.column.width = 35 //柱状图 每柱 宽度 px
			let chartD = chartData.data.data.tjpages.celData; 
		 	var categories:any = [];
			var series0:any = []; 
			if(type<2){//普通
				for(let i=0;i<chartD.length;i++){
					var item = chartD[i];
					var name = await this.getGroupFldName(item,0);
					categories.push(name);
					this.selValue.forEach((fld:any, key1:any) => {
						let colname = this.getFldName(fld);
						var _idx = series0.findIndex(function(im:any) {
							return im.name == colname;
						});
						if (_idx >= 0) {
							var bb = series0[_idx];
							bb.data[i] = item[fld];
							series0[_idx] = bb;
						} else {
							var bb:any ={}
							bb = { name: colname, data: [] };
							bb.data[i] = item[fld];
							series0.push(bb);
						}
					});
				}
			}else{//堆叠
				let legendD = [];//第一个X轴
				let xAxisD = [];//第二个X轴
				let xD = this.selGroup[0];
				let lD = this.selGroup[1]
				let allData = chartData.data.data.tjpages.celData; 
				for(var i=0;i<allData.length;i++){
					let data = allData[i]
					var name = await this.getGroupFldName(data,0);
					categories.push(name)
					legendD.push(data[lD]);
					xAxisD.push(data[xD]);
				}
				categories = Array.from(new Set(categories));
				legendD = Array.from(new Set(legendD));
        		xAxisD = Array.from(new Set(xAxisD));
				for(var k=0;k<legendD.length;k++){
					let dd:any  = {
						name: '',
						data: [],
					}
					for(var j=0;j<xAxisD.length;j++){
						let ispush = false;
						for(var i=0;i<this.tableData.length;i++){
							let data = this.tableData[i]
							if(data[lD] == legendD[k]&&xAxisD[j] == data[xD]){
								dd.data.push(data[this.selValue[0]])
								dd.name= await this.getGroupFldName(data,1);
								ispush = true;
							}
						}
						if(!ispush){
							dd.data.push(0);
						}
					}
					series0.push(dd);
				}
			}
			option.categories = categories;
			option.series = series0;
			return option;
		}

		/**
		 * 饼状图  ==》饼状图、环形图、玫瑰图
		 * 数据，图表类型
		 */
		async makePie(chartData:any,type:any,option:any){
			if(type ==0)
				option.type = 'pie'
			if(type ==1)
				option.type = 'ring'
			if(type ==2)
				option.type = 'rose'
			option.enableScroll = false;
			var data:any = [];
			let chartD = chartData.data.data.tjpages.celData; 
			for(let i=0;i<chartD.length;i++){
				var item = chartD[i];
				var name = await this.getGroupFldName(item,0);
				let d1 = { name: name, data: item[this.selValue[0]] ,
							format:(item:any)=>{
								if(item == 0){
									return "";
								}
								let vl = (item*100).toFixed(2)+'%'
								// vl = item.name +"："+ vl;
								return vl
							}
						}
				data.push(d1);
			}
			delete option.yAxis
			delete option.xAxis
			delete option.categories
			option.series = data; 
			return option
		}
		/**
		 * 漏斗图  ==》漏斗图
		 * 数据，图表类型
		 */
	 	async makeFunnel(chartData:any,type:any,option:any){
			if(type ==0)
				option.type = 'funnel'
			option.enableScroll = false;
			var data:any = [];
			let chartD = chartData.data.data.tjpages.celData; 
			for(let i=0;i<chartD.length;i++){
				var item = chartD[i];
				var name = await this.getGroupFldName(item,0);
				let d1 = { name: name, data: item[this.selValue[0]] }
				data.push(d1);
			}
			delete option.yAxis
			delete option.xAxis
			// delete option.categories
			option.categories = ['','']
			option.series = data;
			return option
		}
		
		getFldName(id:any) {
			if(this.tjcell){
				var _idx = this.tjcell.cels.findIndex(function(cell:any) {
					return cell.id == id;
				});
				if (_idx == -1) {
					return id;
				} else {
					return this.tjcell.cels[_idx].labelString;
				}
			}
		} 
		//初始化菜单等基础数据，并查询数据
		async initBasisData(menuid:any){
			let menu:any = paramTools.findMenu(menuid)
			if(menu){
				await this.initUriParams(menu);
				if(this.uriParams){
					let pcell = this.uriParams.pcell
					let res:any = await tools.getCCellsParams(pcell)
					let rtn: any = res.data;
					if (rtn.id == 0) {
						let kn: Array<Cells> = rtn.data.layCels;
						this.dsm_cont = new CDataSet(kn[0]);
						this.dsm = new CDataSet(kn[1]);
						this.searchData();//查询数据
					}
				}
			}
		}
		
		//获取菜单参数
		async initUriParams(item:Menu){
			let param:any = Object.assign(item);
			let cc = param.command;
			let dd = cc.split("&");
			let pbuid = ''
			dd.forEach((aa:any)=>{
				let pbuids = aa.split('=')
				if(pbuids[0] == 'pbuid'){
					pbuid = pbuids[1]
				}
			})
			let mid = param.menuId;
			if(pbuid&&mid){
				await tools.getMenuParams(pbuid,mid).then((res:any)=>{
					let data = res.data
					if(data.id>=0){
						this.uriParams = data.data.mparams
						uni.setStorageSync(pbuid,JSON.stringify(this.uriParams))
					}else{
						uni.showToast({
							title:'没有权限!',
							icon:"none"
						})
					}
				}).catch((err:any)=>{
					uni.showToast({
						title:'没有权限!',
						icon:"none"							
					})
				})
			}
		}
		//获取参照
    	async getGroupFldName(item:any,index:any){
			let name = "";
			let code ='';
			let keyName ="";
			var id = this.selGroup[index];
			code = item[id];
			var cell:any = this.getCellById(id);
			name = code;
			let type = false;//是否是常量
			let editName = cell.editName;
			let ref = cell.refValue
			if(ref && ref.indexOf('{')>-1){
				ref = ref.substring(ref.indexOf('{')+1,ref.indexOf('}'));
				if(ref.startsWith('$')){
					type = true;
					ref = ref.substring(1);
				}else{
					if(ref.startsWith('&')){
						ref = ref.substring(1);
					}
				}
				editName = ref;
			}else{
				return code;
			}
			if(!type && cell.editName && cell.editName.length>0){//辅助
				editName = cell.editName;
				let aidKey= ICL.AID_KEY+editName;
				let key = aidKey+"_"+code;
				let rr = this.aidValues.get(key);
				let cells = [];
				if(this.inProcess.get(aidKey)){
					let rnt:any = this.aidmaps.get(aidKey);
					if(rnt){
						cells = rnt.cells
					}else{
						await InsAidModule.fetchInsAid({ id: 200, aid: editName });
						rnt = this.aidmaps.get(aidKey);
						cells = rnt.cells
					}
				}else{
					await InsAidModule.fetchInsAid({ id: 200, aid: editName });
					let rnt:any = this.aidmaps.get(aidKey);
					cells = rnt.cells
				}
				if(rr){
					if(rr){
						name = rr[cells.cels[1].id]||code;
					}
				}else{
					if(!this.inProcess.get(key)){
						name = await this.makeRefshow(key,code,editName,cells);
					}
				}
			}
			if(type){//常量 
				let aidKey= ICL.AID_KEYCL+editName;
				let rnt = this.aidmaps.get(aidKey);
				if(rnt){
					let key = rnt.cells.cels[0].id;
					let value = rnt.cells.cels[1].id;
					rnt.values.forEach((item:any)=> { 
						if (item[key] == code) {
							name = item[value];
						}
					});
				}else{
					await InsAidModule.fetchInsAid({ id: 300, aid: editName });
					rnt = this.aidmaps.get(aidKey);
					if(rnt){
						let key = rnt.cells.cels[0].id;
						let value = rnt.cells.cels[1].id;
						rnt.values.forEach((item:any)=> { 
							if (item[key] == code) {
								name = item[value];
							}
						});
					}
				}
			} 
			return name;
		}
		async makeRefshow(key:any,mode:any,editName:any,cells:any){
			let cel = cells.cels[0];
			if(!this.inProcess.get(key)){
				let rtn = this.aidValues.get(key);
				if(!rtn){
					if(cel){
						let cont = "";
						if(cel.type<12){
							cont = cel.id+"="+mode+""
						}else{
							cont = cel.id+"='"+mode+"'"
						}
						let vvs = {id:editName,key:key,cont:cont}
						await InsAidModule.fetchInsDataByCont(vvs);
						let rtn:any = this.aidValues.get(key);
						if(rtn){
							return rtn[cells.cels[1].id]||mode;
						}
					}
				}
			}else{
				let rtn = this.aidValues.get(key);
				if(rtn){
					return rtn[cells.cels[1].id]||mode;
				}
			}
		}
		get aidmaps(){
			return InsAidModule.aidInfos;
		}
		get aidValues(){
			return InsAidModule.aidValues;
		}
		get inProcess(){
			return InsAidModule.inProcess;
		}
		getCellById(id:any) {
			var cc = null;
			this.tjcell.cels.forEach((item:any) => {
				if (item.id == id) {
					cc = item;
				}
			});
		return cc;
		}
		//图表拖动
		touchLineA(e:any){
			canvases[this.chartId].scrollStart(e);
		}
		moveLineA(e:any) {
			canvases[this.chartId].scroll(e);
		}
		touchEndLineA(e:any) {
			canvases[this.chartId].scrollEnd(e);
			//下面是toolTip事件，如果滚动后不需要显示，可不填写
			canvases[this.chartId].showToolTip(e, {
				format: function (item:any, category:any) {
					if(category)
					return category + ' ' + item.name + ':' + item.data 
					else
					return item.name + ':' + item.data 
				}
			});
		}
	}
</script> 
<style scoped>
	.page {
		height: 100Vh;
		width: 100vw;
	}
	page{background:#F2F2F2;width: 750upx;overflow-x: hidden;}
	.qiun-padding{padding:2%; width:96%;}
	.qiun-wrap{display:flex; flex-wrap:wrap;}
	.qiun-rows{display:flex; flex-direction:row !important;}
	.qiun-columns{display:flex; flex-direction:column !important;}
	.qiun-common-mt{margin-top:10upx;}
	.qiun-bg-white{background:#FFFFFF;}
	.qiun-title-bar{padding:10upx 2%; flex-wrap:nowrap;}
	.qiun-title-dot-light{border-left: 10upx solid #0ea391; padding-left: 10upx; font-size: 32upx;color: #000000}
	.qiun-charts{width: 750upx; height:500upx;background-color: #FFFFFF;}
	.charts{width: 750upx; height:500upx;background-color: #FFFFFF;}
</style>
