<template>
	<view>
		<view class="qiun-columns" style="background-color: white;">
			<u-grid :col="3">
				<u-grid-item>
					<view class="top-number">{{ skfcy }}</view>
					<view class="grid-text">本年总架次</view>
				</u-grid-item>
				<u-grid-item>
					<view class="top-number">{{ fkfcy }}</view>
					<view class="grid-text">本年总用药量</view>
				</u-grid-item>
				<u-grid-item>
					<view class="top-number">{{ yefcy }}</view>
					<view class="grid-text">本年总喷洒面积</view>
				</u-grid-item>
			</u-grid>
			<view class="seg-line"></view>
			<view>
				<u-row gutter="6">
					<u-col span="12">
						<u-field v-model="year.label" label="年份" disabled placeholder="年份" icon='calendar' @click="showYear = true"></u-field>
					</u-col>
					<u-col span="12">
						<u-field v-model="season.label" label="季节" disabled placeholder="季节" icon='calendar' @click="showSeason = true">
							<view slot="right">
								<u-button @click="selData" type="primary" size="mini" :ripple="true" ripple-bg-color="#909399">查询</u-button>
							</view>
						</u-field>
					</u-col>
				</u-row>
				<u-select v-model="showSeason" :list="seasonArray" @confirm="seasonConfirm"></u-select>
				<u-select v-model="showYear" :list="yearArray" @confirm="yearConfirm"></u-select>
			</view>
			<view class="seg-line"></view>
			<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
				<view class="qiun-title-dot-light">计划防治完成比例</view>
			</view>
			<canvas v-if="chartId1" :id="chartId1" :canvasId="chartId1" 
				class="charts" :style="{'width':cWidth*pixelRatio+'px','height':cHeight*pixelRatio+'px', 
				'transform': 'scale('+(1/pixelRatio)+')','margin-left':-cWidth*(pixelRatio-1)/2+'px',
				'margin-top':-cHeight*(pixelRatio-1)/2+'px'}"
				@touchstart="touchLine1" @touchmove="moveLine1" @touchend="touchEndLine1">
			</canvas>
			<view class="seg-line"></view>

			
			<view class="qiun-columns" style="background-color: white;">
				<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
					<view class="qiun-title-dot-light">实际完成架次对比</view>
				</view>
				<canvas v-if="chartId2" :id="chartId2" :canvasId="chartId2" 
					class="charts" :style="{'width':cWidth*pixelRatio+'px','height':cHeight*pixelRatio+'px', 
					'transform': 'scale('+(1/pixelRatio)+')','margin-left':-cWidth*(pixelRatio-1)/2+'px',
					'margin-top':-cHeight*(pixelRatio-1)/2+'px'}"
					@touchstart="touchLine2" @touchmove="moveLine2" @touchend="touchEndLine2">
				</canvas>
			</view>
			<view class="seg-line"></view>
			<view class="qiun-columns" style="background-color: white;">
				<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
					<view class="qiun-title-dot-light">年平均用药量对比</view>
				</view>
				<canvas v-if="chartId3" :id="chartId3" :canvasId="chartId3" 
					class="charts" :style="{'width':cWidth*pixelRatio+'px','height':cHeight*pixelRatio+'px', 
					'transform': 'scale('+(1/pixelRatio)+')','margin-left':-cWidth*(pixelRatio-1)/2+'px',
					'margin-top':-cHeight*(pixelRatio-1)/2+'px'}"
					@touchstart="touchLine3" @touchmove="moveLine3" @touchend="touchEndLine3">
				</canvas>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
    import {Vue,Provide,Prop,Component} from 'vue-property-decorator';	
    import { Tools } from '@/classes/tools/Tools';
    import uCharts from '@/lib/u-chars/u-charts.js';
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {BIPUtil} from '@/classes/api/request';
	import { LoginModule } from '@/store/module/login'; //导入vuex模块，自动注入
	import mLoad from '@/components/mLoad.vue';
	let tools = BIPUtil.ServApi;
    var canvases:any = {};
    @Component({components:{mLoad}})
	export default class airHomeChartAnalysis extends Vue {
        @Prop({default:null}) data?:any;
        cWidth:any = uni.upx2px(750);//宽度
		cHeight:any = uni.upx2px(500);//高度
		page: any = { pageSize: 2000, currPage: 1, total: 0 };
		pixelRatio:any =1;
		seasonArray: Array<any> = [
			{ value: "0", label: "春季" },
			{ value: "1", label: "夏季" },
			{ value: "2", label: "秋季" },
		];
		yearArray:Array<any> = [];
		showSeason:any = false;
		year:any = {};
		showYear:boolean = false;
		season:any = { value: "0", label: "春季" };
		chartId1: string = Tools.guid();
		chartId2: string = Tools.guid();
		chartId3: string = Tools.guid();
		loadModal:boolean = false;
		qe: QueryEntity = new QueryEntity("", "");
		chartOption:any={};

		skfcy:any = 0;
		fkfcy:any = 0;
		yefcy:any = 0;
        async mounted() {
			this.loadModal = true;
			let year = new Date().getFullYear();
			this.yearArray = [];
			for(var i=0;i<5;i++){
				let yy = {value:year-i,label:year-i}
				this.yearArray.push(yy);
			}
			this.year = this.yearArray[0]
			this.selData();
			this.loadModal = false;
		}
		async selData(){
			this.qe.page.currPage = this.page.currPage;
			this.qe.page.pageSize = this.page.pageSize;
			let oneCont = [];
			let qCont = new QueryCont('iym',this.year.value,12);
			qCont.setLink(1)
			oneCont.push(qCont);
			if (this.season.value !== "-1") {
				qCont = new QueryCont('season',this.season.value,12);
				qCont.setLink(1)
				oneCont.push(qCont);
			}
			this.qe.cont = "~["+JSON.stringify(oneCont)+"]"
			this.initCharOption();
			await this.initData()
		}
		initData(){
			this.reqRatio();
			this.reqOutputMonth();
			this.reqBilltYear();
			this.reqCaptYear();
		}
		// 1.计划架次完成比例
		async reqRatio() {
			let cc = await tools.getBipInsAidInfo("RATIO", 210, this.qe);
			if (cc.data.id === 0) {
				let res = cc.data.data.data.values;
				let labeldata = new Array();
				let plandata = new Array();
				let jcqtydata = new Array();
				for (let item = 0; item < res.length; item++) {
					labeldata.push(res[item].orgname);
					plandata.push(res[item].planqty);
					jcqtydata.push(res[item].jcqty);
				}
				let option = Object.assign({},this.chartOption);
				option.canvasId = this.chartId1;
				option.type='column';
				option.categories = labeldata
				option.series =  [{
					"name": "目标值",
					"data": plandata,
					"color": "#2fc25b"
				}, {
					"name": "完成量",
					"data": jcqtydata,
					"color": "#1890ff"
				}]
				option.extra = {
					column: {
						//meter参数为“温度计式图表”
						type: 'meter',
						//width为每个柱子的宽度
						width: 20,
						meter: {
							//这个是外层边框（即目标值）的宽度
							border: 4,
							//这个是内部填充颜色
							fillColor: '#E5FDC3'
						}
					}
				}
				canvases[option.canvasId] = new uCharts(option)
			}
		}
		// 2.年度架次对比
		async reqOutputMonth() {
			let cc = await tools.getBipInsAidInfo("OUTPUTMONTH", 210, this.qe);
			if (cc.data.id === 0) {
				let res = cc.data.data.data.values;
				let categories = new Array();
				let dd:any = {name:"实际完成架次",data:[]}
				for (let item = 0; item < res.length; item++) {
					categories.push(res[item].orgname)
					dd.data.push(res[item].jcqty)
				}
				let option = Object.assign({},this.chartOption);
				option.canvasId = this.chartId2;
				option.type='column';
				option.extra = {
					column: {
						type:'group',
						width: 20
					}
				}
				option.categories = categories;
				option.series = [dd]
				canvases[option.canvasId] = new uCharts(option)
			}
		}
		// 3.平均用药量
		async reqBilltYear() {
			let cc = await tools.getBipInsAidInfo("BILLYEAR", 210, this.qe);
			if (cc.data.id === 0) {
				let res = cc.data.data.data.values;
				let categories = new Array();
				let dd:any = {name:"年平均用药量",data:[]}
				for (let index = 0; index < res.length; index++) {
					dd.data.push(res[index].avgyl)
					categories.push(res[index].orgname);
				}
				let option = Object.assign({},this.chartOption);
				option.canvasId = this.chartId3;
				option.type='column';
				option.extra = {
					column: {
						type:'group',
						width: 20
					}
				}
				option.categories =categories,
				option.series = [dd]
				canvases[option.canvasId] = new uCharts(option)
			}
		}
		// 4.本年度总架次、总面积、总药量
		async reqCaptYear() {
			let qe: QueryEntity = new QueryEntity("", "");
			qe.page.currPage = 1;
			qe.page.pageSize = 1;
			let cc = await tools.getBipInsAidInfo("BIYEARSUM", 210, qe);
			if (cc.data.id === 0 ) {
				let res = cc.data.data.data.values;
				if(res.length>0){
					this.skfcy = res[0].jcqty;
					this.fkfcy = res[0].sumflow;
					this.yefcy = res[0].sumarea;
				}else{
					this.skfcy = 0;
					this.fkfcy = 0;
					this.yefcy = 0;
				}
			}
		}
		initCharOption(){
            let _self = this;
			this.chartOption={
				$this:_self,
				canvasId: "",
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
				},
				yAxis: {
					gridType:'dash',
					splitNumber:10,
					format:(val:any)=>{
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
			}
		}

		seasonConfirm(res:any){
			this.season = res[0]
		}
		yearConfirm(res:any){
			this.year = res[0]
		}


		//图表拖动
		touchLine1(e:any){
			canvases[this.chartId1].scrollStart(e);
		}
		moveLine1(e:any) {
			canvases[this.chartId1].scroll(e);
		}
		touchEndLine1(e:any) {
			canvases[this.chartId1].scrollEnd(e);
			//下面是toolTip事件，如果滚动后不需要显示，可不填写
			canvases[this.chartId1].showToolTip(e, {
				format: function (item:any, category:any) {
					if(category)
					return category + ' ' + item.name + ':' + item.data 
					else
					return item.name + ':' + item.data 
				}
			});
		}

		//图表拖动
		touchLine2(e:any){
			canvases[this.chartId2].scrollStart(e);
		}
		moveLine2(e:any) {
			canvases[this.chartId2].scroll(e);
		}
		touchEndLine2(e:any) {
			canvases[this.chartId2].scrollEnd(e);
			//下面是toolTip事件，如果滚动后不需要显示，可不填写
			canvases[this.chartId2].showToolTip(e, {
				format: function (item:any, category:any) {
					if(category)
					return category + ' ' + item.name + ':' + item.data 
					else
					return item.name + ':' + item.data 
				}
			});
		}

				//图表拖动
		touchLine3(e:any){
			canvases[this.chartId3].scrollStart(e);
		}
		moveLine3(e:any) {
			canvases[this.chartId3].scroll(e);
		}
		touchEndLine3(e:any) {
			canvases[this.chartId3].scrollEnd(e);
			//下面是toolTip事件，如果滚动后不需要显示，可不填写
			canvases[this.chartId3].showToolTip(e, {
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
	.top-number{
		font-size: 42px;
	}
	.seg-line{
		height: 3px;
    	background-color: #f2f2f2;
	}
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