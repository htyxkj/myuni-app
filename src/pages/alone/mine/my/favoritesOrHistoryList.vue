<template>
	<view>
		<cu-custom bgColor="bg-gradual-pink" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">{{title}}</view></block>
		</cu-custom>
		<scroll-view scroll-y class="page" refresher-enabled @refresherrefresh="refresherTriggered" :refresher-triggered="refresher_triggered" @scrolltolower="getNextPage">
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
	export default class FavoritesList extends Vue {
		newsTabCur:any = 0;
		videoTabCur:any = 0;
		key:any = "NVKEY_"; 
		qe:QueryEntity = new QueryEntity('','');
		page:PageInfo = new PageInfo();	
		articleData:Array<any> = [];

		refresher_triggered:boolean = false;//下拉刷新状态
		noNextPage:boolean = false;//没有下一页了

		payVideo:any = null;//当前正在播放的视频
		uri:any ="";//
		title:any ="";
		type:any = 0
		onLoad(e:any) {
			this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
			this.title = e.title
			this.type = e.type
		}
		mounted(){
			this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
		}
		get snkey(){
			return LoginModule.snkey
		}
		/**
		 * 下拉刷新
		 */
		async refresherTriggered(){
			this.refresher_triggered = true;
			await this.initData();
			setTimeout(() => {
				this.refresher_triggered = false;	
			}, 100);
		}

		/**
		 * 根据分类编码查询数据
		 */
		async initData(){
			this.noNextPage = false;
			let btn1 = new BipMenuBtn("DLG","收藏或历史记录")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ArticleServlet*208;0;0");//收藏或历史记录
			let b = JSON.stringify(btn1)
            let prarm = {
				type:this.type,
				currPage:this.page.currPage
			}
            let v = JSON.stringify(prarm);
			let res:any = await tools.getDlgRunClass(v,b);
			console.log(res)
			this.articleData = [];
			// if(vv.data.id ==0){
			// 	let cc = vv.data.data.data.values;
			// 	this.page = vv.data.data.data.page;
			// 	this.compositionData(cc);
			// }
		}
		/**
		 * 滑动到底部 查询下一页
		 */
		async getNextPage(){
			this.page.currPage++;
			let btn1 = new BipMenuBtn("DLG","收藏或历史记录")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ArticleServlet*208;0;0");//收藏或历史记录
			let b = JSON.stringify(btn1)
            let prarm = {
				type:this.type,
				currPage:this.page.currPage
			}
            let v = JSON.stringify(prarm);
			let res:any = await tools.getDlgRunClass(v,b);
			console.log(res)

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
								let _url = commURL.FielPath+'/mydoc/db_01/'+fjroot+"/"+name
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
		font-size: 12px;
		height: 28px;
		transform: none;
	}
	.noSelbtn{
		background-color: #F9F9F9;
		color: #858585;
		font-size: 12px;
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
</style>