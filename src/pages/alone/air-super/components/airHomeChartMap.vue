<template>
	<view class="qiun-columns" style="background-color: white;">
		<view class="qiun-bg-white qiun-title-bar qiun-common-mt" >
			<view class="qiun-title-dot-light">{{data.name}}</view>
		</view>
		<u-field v-model="year" label="年份" placeholder="年份" icon='calendar'>
			<view slot="right">
				<u-button @click="btnClick" type="primary" size="mini" :ripple="true" ripple-bg-color="#909399">查询</u-button>
			</view>
		</u-field>
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
	export default class airHomeChartMap extends Vue {
        @Prop({default:null}) data?:any;
        cWidth:any = uni.upx2px(750);//宽度
		cHeight:any = uni.upx2px(500);//高度
		chartId: string = Tools.guid();
		pixelRatio:any =1;
		mapData:any = {};
		year:any = new Date().getFullYear();
		loadModal:boolean = false;
        async mounted() {
			this.loadModal = true;
			await this.initData()
            await this.initGeoJson();
			this.loadModal = false;
		}
		async btnClick(){
			this.loadModal = true;
			await this.initData()
            await this.initGeoJson();
			this.loadModal = false;
		}
		//初始化地图数据
        async initGeoJson(){
			let user = LoginModule.user
			let cmcCode = user.deptInfo.cmcCode
			cmcCode = cmcCode.substring(0,6)
			let qe:QueryEntity = new QueryEntity('','');
			qe.page.currPage = 1;
			qe.page.pageSize = 1;
			qe.cont = "";
			let oneCont = [];
			let qCont = new QueryCont('orgcode',cmcCode,12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('GETADCODE',210,qe);
			if(vv.data.id ==0){
				let vl = vv.data.data.data.values[0]
				if(vl){
					let features = JSON.parse(vl.features);
					for(var i=0;i<features.features.length;i++){
						features.features[i].name = features.features[i].properties.name
						let data = this.mapData[features.features[i].properties.adcode];
						let _v =['架次数:0','面积:0','总用药量:0','亩用药量:0']
						if(data){
							_v =['架次数:'+data.jcqty,'面积:'+data.sumarea,'总用药量:'+data.sumflow,'亩用药量:'+data.avgyl]
						}
						features.features[i].data = _v
					}
					this.initMap(features.features)
				}
			}
        }
        initMap(chartData:any){
            let _self = this;
			let option = {
				$this:_self,
				canvasId: this.chartId,
				type: 'map',
				fontSize:11,
				legend:{show:true},
				dataLabel:true,
				background:'#FFFFFF',
				series: chartData, 
				rotate:false,
				animation: true,
				enableScroll: true,//开启图表拖拽功能
				width: this.cWidth ,
				height: this.cHeight,      
                extra: {
                    map: {
                        border:true,
                        borderWidth:1,
                        borderColor:'#666666',
                        fillOpacity:0.6
                    }
                }
			};
            canvases[this.chartId] = new uCharts(option)
        }
		//初始化统计数据
		async initData(){
			this.mapData = {};
			let qe:QueryEntity = new QueryEntity('','');
			qe.page.currPage = 1;
			qe.page.pageSize = 500;
			qe.cont = "";
			let oneCont = [];
			let qCont = new QueryCont('iym',this.year,12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('BSORGYEARSUM',210,qe);
			if(vv.data.id ==0){
				let data = vv.data.data.data.values;
				for(var i=0;i<data.length;i++){
					this.mapData[data[i].area] = data[i]
				}
			}
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