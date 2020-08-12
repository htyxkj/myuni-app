<template>
	<view>
		<cu-custom bgColor="bg-gradual-pink" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">详情</view></block>
		</cu-custom>
		<view   class="padding" v-if="articleData">
			<template v-if="articleData.video.length>0">
				<video :ref="'video'+articleData.sid" :id="'video'+articleData.sid" @play="videoPay(articleData)" style="width:100%" :src="articleData.video[0]"></video>
			</template>
			<view class="title">{{articleData.title}}</view>
			<view class="text-gray text-xl">
				<view class="flex justify-start">
					<view>{{articleData.smakename}}</view>
					<view class="padding-left-xl">{{articleData.mkdate}}</view>
				</view>
			</view>
			<view v-html="articleData.content"></view>

		</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端 新闻详情页面
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {Vue,Provide,Prop,Component,Watch} from 'vue-property-decorator';
	import moment from 'moment'
	import { GlobalVariable } from '@/classes/tools/ICL';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	@Component({
		
	})
	export default class Details extends Vue {
		sid:any = "";
		articleData:any = null;
		uri:any ="";//
		snkey:any = "";// 
		onLoad(e:any) {
			this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
			this.snkey = LoginModule.snkey
			this.sid = e.sid
			this.initData();
		}
		async initData(){
			let qe:QueryEntity = new QueryEntity('','');
			let oneCont = []; 
			let qCont = new QueryCont('sid',this.sid,12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv = await tools.getBipInsAidInfo('ONEARTICLEL',210,qe);
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				this.compositionData(cc)
			}
		}
		/**
		 * 组成列表数据
		 */
		compositionData(cc:any){
			for(let i=0;i<1;i++){
					let j1:any = {sid:"",title:"",description:"",content:"",smakename:"",mkdate:"",img:[],video:[]};
					let d1 = cc[i];
					j1.title = d1.title;
					j1.description = d1.description;
					j1.smakename = d1.smakename;
					j1.sid = d1.sid;
					j1.content = d1.content
					j1.mkdate = moment(d1.mkdate).format('YYYY-MM-DD')
					let fjn = d1.fj_name;
					let fjroot = d1.fj_root;
					if(fjn){
						let nameArr = fjn.split(";");
						for(var j=0;j<nameArr.length;j++){
							let name =nameArr[j].toLowerCase();
							let url = this.uri+'?snkey='+this.snkey+'&fjroot='+fjroot+'&updid=36&fjname='+nameArr[j];
							var imgReg = /\.(png|jpg|gif|jpeg|webp|tiff|psd)$/; //图片名为汉字的也可以匹配到
							let isImg:boolean = imgReg.test(name); //返回true ,false
							if(isImg){
								j1.img.push(url);
							}
							var videoReg = /\.(mp4|flv|m3u8|rtmp|hls|rtsp)$/;
							let isVideo:boolean = videoReg.test(name);
							if(isVideo){
								j1.video.push(url);
							}
						}
					}
					this.articleData = j1
				}
		}
	}
</script>
<style scoped>
	uni-page-body{
		background-color: #FFFFFF
	}
	.title{
		font-size: 48upx;
		font-weight: 500;
		text-align: justify;
	}
</style>