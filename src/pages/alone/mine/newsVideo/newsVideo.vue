<template>
	<view>
		<cu-custom class="my-top" :isBack="false" :iaAllCus="true">
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
			<view class="cu-bar btn-group" v-if="newsChileTypeArr.length>0" :class="newsChileTypeArr.length<=3?'padding-left-xl padding-right-xl':''">
				<button class="cu-btn bg-blue shadow-blur" :class="type_sid==item.sid?'selbtn':'noSelbtn'" v-for="(item,index) in newsChileTypeArr" :key="index" @tap="initData(item.sid)">
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
		<scroll-view scroll-y class="page" refresher-enabled @refresherrefresh="refresherTriggered" :refresher-triggered="refresher_triggered" @scrolltolower="getNextPage">
			<swiper v-if="type == 0 && -1==newsTabCur" class="screen-swiper square-dot "  :indicator-dots="true" :circular="true"
				:autoplay="true" interval="5000" duration="500">
				<swiper-item v-for="(item,index) in swiperList" :key="index" @tap.stop="gotoarticle(item)">
					<image :src="item.url" mode="scaleToFill" class="screen-swiper-img"></image>
					<view class="sw-title padding">
						<h3>{{item.title}}</h3>
					</view>
				</swiper-item>
			</swiper>
			<view v-for="(item) in articleData" :key="item.sid" class="solid-bottom bg-white">
				<template v-if="item.img.length>0 || (item.img.length == 0 && item.video.length == 0 )">
					<template v-if="item.img.length>=3">
						<view @tap="gotoarticle(item)">
							<view class="grid text-center col-3 padding-left padding-right">
								<view  v-for="(img,index) in item.img " :key="index" >
									<image mode="aspectFit" class="listImg1" :src="img"></image>
								</view>
							</view>
							<view class="flex justify-start">
								<view class="padding-top-sm padding-bottom-sm padding-left">
									<view>
										<view><h4>{{item.title}}</h4></view>
										<view class="text-gray text-sm">
											<view class="flex justify-start">
												<view>{{item.smakename}}</view>
												<view class="padding-left-xl">{{item.mkdate}}</view>
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</template>
					<template v-if="item.img.length<3">
						<view class="flex justify-start" @tap="gotoarticle(item)">
							<view class="padding-sm margin-xs">
								<view>
									<view><h4>{{item.title}}</h4></view>
									<view style="height: 40upx;"></view>
									<view class="text-gray text-sm">
										<view class="flex justify-start">
											<view>{{item.smakename}}</view>
											<view class="padding-left-xl">{{item.mkdate}}</view>
											<view class="padding-left-xl">
												<text class="cuIcon-record"></text>
												{{item.pageviews}}
											</view>
										</view>
									</view>
								</view>
							</view>
							<view class="padding-sm margin-xs" v-if="item.img.length>0">
								<image mode="aspectFit" class="listImg1" :src="item.img[0]"></image>
							</view>
						</view>
					</template>
				</template>
				<template v-else-if="item.video.length>0">
					<video :ref="'video'+item.sid" :id="'video'+item.sid" @play="videoPay(item)" style="width:100%" :src="item.video[0]"></video>
					<view class="flex justify-start" @tap="gotoarticle(item)">
						<view class="padding-left-sm padding-right-sm margin-xs">
							<view>
								<view><h4>{{item.title}}</h4></view>
								<view style="height: 10upx;"></view>
								<view class="text-gray text-sm">
									<view class="flex justify-start">
										<view>{{item.smakename}}</view>
										<view class="padding-left-xl">{{item.mkdate}}</view>
										<view class="padding-left-xl">
											<text class="cuIcon-record"></text>
											{{item.pageviews}}
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</template>
			</view>
			<view class="text-sm padding text-center" v-if="noNextPage">
				<text class="text-grey">-----我是有底线的-----</text>
			</view>
			<view style="height: 8vh;"></view>
		</scroll-view>
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
	@Component({
		
	})
	export default class NewsVideo extends Vue {
		@Prop({ default:0, type:Number }) type!:number;//类型 0：新闻；1：视频
		newsTabCur:any = -1;
		newsTypeArr:Array<any>=[];//新闻类别
		newsChileTypeArr:Array<any>=[];//新闻子类别

		videoTabCur:any = 0;
		videoTypeArr:Array<any>=[];//视频类别
		videoChileTypeArr:Array<any>=[];//视频子类别
		key:any = "NVKEY_";
		type_sid:any ="";//当前选中类型
		qe:QueryEntity = new QueryEntity('','');
		page:PageInfo = new PageInfo();	
		articleData:Array<any> = [];

		refresher_triggered:boolean = false;//下拉刷新状态
		noNextPage:boolean = false;//没有下一页了

		payVideo:any = null;//当前正在播放的视频
		tjInput:any = "";//条件
		tjoldVl:any = "";//条件

		uri:any ="";//
		swiperList:Array<any> = [];//推荐轮播图
		mounted(){
			this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
			this.initType();
		}
		get snkey(){
			return LoginModule.snkey
		}
		//新闻类别切换
		async newsTabSelect(e:any){
			this.newsTabCur = e.currentTarget.dataset.id;
			if(this.newsTabCur == -1){
				this.newsChileTypeArr = [];
				this.initSwiperData();
				this.initData(null,true)
				return;
			}
			let sid = e.currentTarget.dataset.sid;
			let dd = await this.getTypeByFather(sid);
			this.newsChileTypeArr = dd;
			let _sid = null;
			if(dd.length == 0){
				_sid = sid;
			}else{
				_sid = dd[0].sid;
			}
			this.initData(_sid);
		}
		//视频类别切换
		async videoTabSelect(e:any){
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
			this.initData(_sid);
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
		 * 下拉刷新
		 */
		async refresherTriggered(){
			this.refresher_triggered = true;
			await this.initData(null);
			setTimeout(() => {
				this.refresher_triggered = false;	
			}, 100);
		}

		/**
		 * 根据分类编码查询数据
		 * type 类别
		 * rec 是否推荐
		 */
		async initData(type:any,rec:boolean =false){
			this.noNextPage = false;
			if(this.type_sid == type)
				return;
			if(type)
				this.type_sid = type;
			this.qe.page = new PageInfo();
			let oneCont = []; 
			let qCont = null;
			if(rec){//推荐 不安类别查询
				qCont = new QueryCont('isrec','1',12);
				qCont.setContrast(0);
				qCont.setLink(1);
				oneCont.push(qCont);
			}else{
				qCont = new QueryCont('type',this.type_sid,12);
				qCont.setContrast(0);
				qCont.setLink(1);
				oneCont.push(qCont);
			}
			if(this.tjInput!=null && this.tjInput.length>0){
				qCont = new QueryCont('title',this.tjInput,12);
				qCont.setContrast(3);
				qCont.setLink(1);
				oneCont.push(qCont);
			}

			let userType = uni.getStorageSync('userType');
			if(userType == 'Tourist'){//游客身份
				qCont = new QueryCont('ispublic','1',5);
				qCont.setContrast(0);
				qCont.setLink(1);
				oneCont.push(qCont);
			}
			this.qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('ALLARTICLEL',210,this.qe);
			this.articleData = [];
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				this.page = vv.data.data.data.page;
				this.compositionData(cc);
			}
		}
		
		/**
		 * 查询轮播图数据
		 */
		async initSwiperData(){
			let qe:QueryEntity = new QueryEntity('','');
			this.swiperList = [];
			qe.page = new PageInfo(1,100);
			let oneCont = []; 
			let userType = uni.getStorageSync('userType');
			if(userType == 'Tourist'){//游客身份
				let qCont = new QueryCont('ispublic','1',5);
				qCont.setContrast(0);
				qCont.setLink(1);
				oneCont.push(qCont);
			}
			qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('ALLCAROUSEL',210,qe);
			this.articleData = [];
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				for(var i=0;i<cc.length;i++){
					let sw = cc[i];
					let nameArr = sw.fj_name.split(";");
					for(var j=0;j<nameArr.length;j++){
						let vl:any = {url:'',sid:sw.article_id,title:sw.title};
						let url = this.uri+'?snkey='+this.snkey+'&fjroot='+sw.fj_root+'&updid=36&fjname='+nameArr[j];
						vl.url = url;
						this.swiperList.push(vl);
					}
				}
			}
		}

		/**
		 * 滑动到底部 查询下一页
		 */
		async getNextPage(){
			this.page.currPage++;
			this.qe.page = this.page;
			let oneCont = []; 
			let qCont = new QueryCont('type',this.type_sid,12);
			qCont.setContrast(0);
			qCont.setLink(1);
			oneCont.push(qCont);
			if(this.tjInput!=null && this.tjInput.length>0){
				qCont = new QueryCont('title',this.tjInput,12);
				qCont.setContrast(3);
				qCont.setLink(1);
				oneCont.push(qCont);
			}
			this.qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('ALLARTICLEL',210,this.qe);
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				if(cc.length == 0){
					this.page.currPage --;
					this.noNextPage = true;
				}else{
					this.compositionData(cc);
				}
			}
		}
		/**
		 * 组成列表数据
		 */
		compositionData(cc:any){
			for(let i=0;i<cc.length;i++){
					let j1:any = {sid:"",title:"",description:"",smakename:"",mkdate:"",img:[],video:[],pageviews:0};
					let d1 = cc[i];
					j1.title = d1.title;
					j1.description = d1.description;
					j1.smakename = d1.smakename;
					j1.sid = d1.sid;
					j1.pageviews = d1.pageviews;
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
								let _url = commURL.BaseUri+'/mydoc/db_01/'+fjroot+"/"+name
								j1.video.push(_url);
							}
							
						}
					}
					if(d1.extconnection){
						var videoReg = /\.(mp4|flv|m3u8|rtmp|hls|rtsp)$/;
						let isVideo:boolean = videoReg.test(d1.extconnection);
						if(isVideo){
							j1.video.push(d1.extconnection);
						}
					}
					this.articleData.push(j1)
				}
		}

		/**
		 * 去详情页面
		 */
		gotoarticle(item:any){
			let url = "/pages/alone/mine/details/details?sid="+item.sid;
			uni.navigateTo({
				'url':url,
			})
		}
		/**
		 * 打开我的页面
		 */
		gotomypage(){
			let url = "/pages/alone/mine/my/my";
			let userType = uni.getStorageSync('userType');
			if(userType == 'Tourist'){//游客身份
				url = "/pages/login/login"
			}
			uni.navigateTo({
				'url':url,
			})
		}
		InputBlur(e:any) {
			if(this.tjoldVl != this.tjInput){
				this.initData(null);
				this.tjoldVl = this.tjInput
			}
		}
		/**
		 * 视频播放
		 */
		videoPay(item:any){
			if(this.payVideo == null){
				this.payVideo = item;
			}else if(item.sid != this.payVideo.sid){
				let v:any = uni.createVideoContext('video'+this.payVideo.sid)
				if(v)
					v.pause();
				this.payVideo = item;
			}
			this.upBrowse(item.sid)
		}
		/**
		 * 修改视频播放量
		 */
		upBrowse(sid:any){
			let btn1 = new BipMenuBtn("DLG","修改文章浏览量")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ArticleServlet*206;0;0");//修改文章浏览量
			let b = JSON.stringify(btn1)
            let prarm = {
				"article_id":sid,//文章ID
            }
            let v = JSON.stringify(prarm);
			tools.getDlgRunClass(v,b);
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
	.screen-swiper-img{
		max-height: 400upx;
	}
</style>