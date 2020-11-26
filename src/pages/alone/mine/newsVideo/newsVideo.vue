<template>
	<view>
		<cu-custom bgColor="bg-zk-top" :isBack="false" :iaAllCus="true">
			<block slot="iaAllCus">
				<image class ="myimg" mode="aspectFill" src="../../../../static/mine/newsVideo/logo.png" ></image>
				<view class="search-form round my-search-form">
					<text class="cuIcon-search"></text>
					<input @blur="InputBlur" v-model="tjInput" :adjust-position="false" type="text" confirm-type="search"></input>
				</view>
				<view class="action text-white" @tap="gotomypage">
					<text>我的</text>
				</view>
			</block>
		</cu-custom>
		<view v-if="type == 0">
			<scroll-view scroll-x class="mytypeTbs nav text-center">
				<view class="cu-item" :class="-1==newsTabCur?'selTbs':''" @tap="newsTabSelect" :data-id="-1">
					推荐
				</view>
				<view class="cu-item" :class="index==newsTabCur?'selTbs':''" v-for="(item,index) in newsTypeArr" :key="index" @tap="newsTabSelect" :data-id="index" :data-sid="item.sid">
					{{item.name}}
				</view>
			</scroll-view> 
			<view class="cu-bar btn-group bg-white" v-if="newsChileTypeArr.length>0" :class="newsChileTypeArr.length<=3?'padding-left-xl padding-right-xl':''">
				<button class="cu-btn bg-blue shadow-blur" :class="type_sid==item.sid?'selbtn':'noSelbtn'" v-for="(item,index) in newsChileTypeArr" :key="index" @tap="type_sid = item.sid">
					{{item.name}}
				</button>
			</view>
		</view>
		<view v-if="type == 1">
			<scroll-view scroll-x class="mytypeTbs nav text-center">
				<view class="cu-item" :class="index==videoTabCur?'selTbs':''" v-for="(item,index) in videoTypeArr" :key="index" @tap="videoTabSelect" :data-id="index" :data-sid="item.sid">
					{{item.name}}
				</view>
			</scroll-view>
		</view>
		<data-list class="bg-white" :type_sid="type_sid" :type="type" :isrecommend="isrecommend" :input_condition="input_condition"></data-list>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端新闻视频
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import PageInfo from '@/classes/search/PageInfo';
	import {Vue,Provide,Prop,Component,Watch} from 'vue-property-decorator';
	import moment from 'moment'
	import { GlobalVariable } from '@/classes/tools/ICL';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import {BipMenuBtn} from '@/classes/BipMenuBtn'
	import loadRefresh from '@/components/load-refresh/load-refresh.vue';
	import dataList from '../components/dataList.vue';
	@Component({
		components:{loadRefresh,dataList}
	})
	export default class NewsVideo extends Vue {
		@Prop({ default:0, type:Number }) type!:number;//类型 0：新闻；1：视频
		newsTabCur:any = -1;//新闻选择类别
		videoTabCur:any = 0;//视频类别
		newsTypeArr:Array<any>=[];//新闻类别
		newsChileTypeArr:Array<any>=[];//新闻子类别
		videoTypeArr:Array<any>=[];//视频类别
		videoChileTypeArr:Array<any>=[];//视频子类别
		key:any = "NVKEY_";
		type_sid:any ="";//当前选中类型
		tjInput:any = "";//条件
		tjoldVl:any = "";//条件
		isrecommend:any = 0;//是否是推荐
		swiperList:Array<any> = [];//推荐轮播图
		input_condition:any = null;
		mounted(){
			this.initType();
		}
		//新闻类别切换
		async newsTabSelect(e:any){
			this.newsTabCur = e.currentTarget.dataset.id;
			let sid = e.currentTarget.dataset.sid;
			if(this.newsTabCur == -1){
				this.newsChileTypeArr = [];
				this.isrecommend = 1;
				this.type_sid = null;
				return;
			}else{
				this.isrecommend = 0;
			}
			let dd = await this.getTypeByFather(sid);
			this.newsChileTypeArr = dd;
			let _sid = null;
			if(dd.length == 0){
				_sid = sid;
			}else{
				if(sid == 'LX20080014'){
					_sid = dd[dd.length-1].sid;
				}else{
					_sid = dd[0].sid;
				}
			}
			this.type_sid = _sid;
		}
		//视频类别切换
		async videoTabSelect(e:any){
			this.isrecommend = 0;
			this.videoTabCur = e.currentTarget.dataset.id;
			let sid = e.currentTarget.dataset.sid;
			let dd = await this.getTypeByFather(sid);
			this.videoChileTypeArr = dd;
			let _sid = null;
			if(dd.length == 0){
				_sid = sid;
			}else{
				_sid = dd[0].sid;
			}
			this.type_sid = _sid;
		}
		//查询类别
		async initType(){
			if(this.type == 0){ //0：新闻
				let type= await this.getTypeByFather('LX20080013');
				this.newsTypeArr = type;
				if(this.newsTypeArr.length>0){
					let e = {currentTarget:{dataset:{sid:this.newsTypeArr[0].sid,id:-1}}}
					this.newsTabSelect(e)
				}
			}else if(this.type == 1){//1：视频
				let type= await this.getTypeByFather('LX20080003');
				this.videoTypeArr = type;
				if(this.videoTypeArr.length>0){
					let e = {currentTarget:{dataset:{sid:this.videoTypeArr[0].sid,id:0}}}
					this.videoTabSelect(e)
				}
			}
		}
		/**
		 * 打开我的页面
		 */
		gotomypage(){
			let url = "/pages/alone/mine/my/my";
			let userType = uni.getStorageSync('userType');
			if(userType == 'Tourist'){//游客身份
				url = "/pages/login/login"
				uni.reLaunch({
					'url':url,
				})
				return;
			}
			uni.navigateTo({
				'url':url,
			})
		}
		
		InputBlur(e:any) {
			if(this.tjoldVl != this.tjInput){
				this.tjoldVl = this.tjInput
				this.input_condition = this.tjoldVl;
			}
		}
		/**
		 * 根据父级分类编码 查询分类
		 */
		async getTypeByFather(father:any){
			var _key:any = this.key+''+father;
			let data = uni.getStorageSync(_key);
			if(data){
				let dd = JSON.parse(data);
				return dd;
			}else{
				let qe:QueryEntity = new QueryEntity('','');
				qe.page.currPage = 1;
				qe.page.pageSize = 100; 
				let oneCont = []; 
				let qCont = new QueryCont('father',father,12);
				qCont.setContrast(0);
				oneCont.push(qCont);
				qe.cont = "~["+JSON.stringify(oneCont)+"]"
				let vv:any = await tools.getBipInsAidInfo('ARTICLETYPE',210,qe);
				if(vv.data.id ==0){
					let cc = vv.data.data.data.values;
					uni.setStorageSync(_key, JSON.stringify(cc));
					return cc;
				}else{
					console.log(vv)
				}
			}
			return [];
		}
		
		@Watch("type")
		typeChange(){
			this.initType();
		}
	}
</script>
<style scoped>
	uni-page-body{
		background-color: #FFFFFF
	}
	.page {
		height: 79vh;
	}
	.myBtn{
		position: absolute;
		right: 0px;
		margin: auto;
		height: 30px;
		font-size: 16px;
		line-height: 30px;
	}
	.myimg{
		width: 200upx;
		height: 60upx;
	}
	.mytypeTbs{
		background-color: #FEEEEF;
		font-size: 16px;
		font-weight: 540;
	}
	.selTbs{
		color: #EF1823;
	}
	.my-top-bar{
		background-color: #ED1B24;
	}

	.selbtn{
		background-color: #ED1B24;
		color: #FFFFFF;
		font-size: 11px;
		height: 28px;
		transform: none;
	}
	.noSelbtn{
		background-color: #F9F9F9;
		color: #858585;
		font-size: 11px;
		height: 28px;
		transform: none;
	}
	.listImg1{
		width: 220upx;
		height: 164upx;
	}
	.my-search-form{
		background-color: #F4494F;
		color: white;
	}
	.my-top{
		background-color: #E7271A;
	}
	.sw-title{
		background-color: #ececec57;
		padding-top: 5px;
		padding-bottom: 5px;
	}
	.screen-swiper{
		min-height: 500upx;
	}
	.cu-bar.btn-group uni-button {
		padding: 11px 1px;
	}
</style>