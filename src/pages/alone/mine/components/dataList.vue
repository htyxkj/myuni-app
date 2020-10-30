<template>
	<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" 
			:heightReduce="275" :pageNo="page_num" :totalPageNo="total_page" @loadMore="getNextPage" @refresh="refresh">
		<view class="bg-white my-data-list" v-if="articleData" slot="content-list">
			<swiper v-if="type == 0 && 1==isrecommend" class="screen-swiper square-dot "  :indicator-dots="true" :circular="true"
				:autoplay="true" interval="5000" duration="500">
				<swiper-item v-for="(item,index) in swiperList" :key="index" @tap.stop="gotoarticle(item)">
					<!-- <image :src="item.url" mode="aspectFit" class="screen-swiper-img"></image>
					<view class="sw-title padding">
						<h3>{{item.title}}</h3>
					</view> -->
					<view class="cu-card case">
						<view class="shadow">
							<view class="image" style="background-color: #E7271A;">
								<image :src="item.url" class="my-image"  mode="aspectFit"></image> 
								<view class="cu-bar bg-shadeBottom"> 
									<text class="text-cut">{{item.title}}</text>
								</view>
							</view> 
						</view>
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
										<view class="my-text-black">{{item.title}}</view>
										<view class="text-gray text-sm">
											<view class="flex justify-start">
												<view>{{item.smakename}}</view>
												<view class="padding-left-xl">{{item.mkdate}}</view>
												<view class="padding-left-xl">
													<text class="cuIcon-attentionfill"></text>
													{{item.pageviews}}
												</view>
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
									<view class="my-text-black">{{item.title}}</view>
									<view style="height: 40upx;"></view>
									<view class="text-gray text-sm">
										<view class="flex justify-start">
											<view>{{item.smakename}}</view>
											<view class="padding-left-xl">{{item.mkdate}}</view>
											<view class="padding-left-xl">
												<text class="cuIcon-attentionfill"></text>
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
					<!-- <view>
						<video :ref="'video'+item.sid" :id="'video'+item.sid" @play="videoPay(item)" style="width:100%" :src="item.video[0]"></video>
					</view> -->
					<view class="cu-card case" @tap="gotoarticle(item)">
						<view class="cu-item shadow" style="margin:0px">
							<view class="image">
								<image :src="item.video[0]" class="my-image"  mode="widthFix"></image>
								<view class="cu-tag bg-blue">
									<text class="cuIcon-playfill"></text>
								</view>
								<view class="cu-bar bg-shadeBottom"> 
									<text class="text-cut">{{item.title}}</text>
								</view>
							</view>
							<view class="flex justify-start" >
								<view class="margin">
									<view class="text-gray text-sm">
										<view class="flex justify-start">
											<view>{{item.smakename}}</view>
											<view class="padding-left-xl">{{item.mkdate}}</view>
											<view class="padding-left-xl">
												<text class="cuIcon-attentionfill"></text>
												{{item.pageviews}}
											</view>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</template>
			</view>
			<view style="height: 8vh;"></view>
		</view>
	</load-refresh>
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
	@Component({
		components:{loadRefresh}
	})
	export default class DataList extends Vue {
		@Prop({ default:0, type:Number }) type!:Number;//类型 0：新闻；1：视频
		@Prop() type_sid!:string;//当前选中类型
		@Prop() isrecommend!:any; //是否是推荐
		@Prop() input_condition!:any;//文本框条件
		page_num:number = 1;//当前页数
		total_page:number = 0;//总页数
		tjInput:any = "";//条件
		swiperList:Array<any> = [];//推荐轮播图
		uri:any ="";//服务器附件地址
		payVideo:any = null;//当前正在播放的视频
		articleData:Array<any> = [];//数据集
		qe:QueryEntity = new QueryEntity('','');//查询对象
		mounted(){
			this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
			if(this.type_sid){
				this.page_num = 1;
				this.initData(this.type_sid);
			}
		}
		get snkey(){
			return LoginModule.snkey
		}
		/**
		 * 下拉刷新
		 */
		async refresh(){
			this.page_num = 1;
			if(this.type == 0 && 1==this.isrecommend){
				await this.initData(null,true);
			}else{
				await this.initData(null);
			}
		}

		/**
		 * 根据分类编码查询数据
		 * type 类别
		 * rec 是否推荐
		 */
		async initData(type:any,rec:boolean =false){
			if(type)
				this.type_sid = type;
			this.qe.page = new PageInfo();
			let oneCont = []; 
			let qCont = null;
			let vv:any = null;
			if(rec){//推荐 单独查询
				let btn1 = new BipMenuBtn("DLG","查询推荐数据")
				btn1.setDlgType("D")
				btn1.setDlgCont("mine.serv.ArticleServlet*211;0;0");//修改文章浏览量
				let b = JSON.stringify(btn1)
				let prarm:any={
					currPage:this.page_num,
					title:this.tjInput
				}
				let v = JSON.stringify(prarm);
				vv = await tools.getDlgRunClass(v,b);
			}else{
				qCont = new QueryCont('type',this.type_sid,12);
				qCont.setContrast(0);
				qCont.setLink(1);
				oneCont.push(qCont);
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
				this.qe.page.currPage = this.page_num;
				vv = await tools.getBipInsAidInfo('ALLARTICLEL',210,this.qe);
			}
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				let page = vv.data.data.data.page;
				let total = page.total;
				let pageSize =  page.pageSize;
				if(total < pageSize){
					this.total_page = 1;
				}else{
					this.total_page = total/pageSize
					if(total%pageSize >0){
						this.total_page++;
					}
				}
				this.compositionData(cc);
			}
		}
		
		/**
		 * 滑动到底部 查询下一页
		 */
		async getNextPage(){
			if(this.total_page>=this.page_num){
				this.page_num++;
				if(this.type == 0 && 1==this.isrecommend){
					await this.initData(null,true);
				}else{
					await this.initData(null);
				}
			}
		}
		/**
		 * 组成列表数据
		 */
		compositionData(cc:any){
			let _articleData = [];
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
							// let url = this.uri+'?snkey='+this.snkey+'&fjroot='+fjroot+'&updid=36&fjname='+nameArr[j];
							let url = commURL.BaseUri+'/mydoc/db_'+commURL.BaseDBID+'/'+fjroot+"/"+nameArr[j];
							var imgReg = /\.(png|jpg|gif|jpeg|webp|tiff|psd)$/; //图片名为汉字的也可以匹配到
							let isImg:boolean = imgReg.test(name); //返回true ,false
							if(isImg){
								j1.img.push(url);
							}
							var videoReg = /\.(mp4|flv|m3u8|rtmp|hls|rtsp)$/;
							let isVideo:boolean = videoReg.test(name);
							if(isVideo){
								let _url = commURL.BaseUri+'/mydoc/db_'+commURL.BaseDBID+'/'+fjroot+"/"+name+'_tb.png'
								_url = this.imageLoad(_url)
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
					_articleData.push(j1)
				}
			if(this.page_num == 1) 
				this.articleData = [];
			this.articleData = this.articleData.concat(_articleData); //追加新数据
			let lrf: any = this.$refs.loadRefresh;
			if(lrf)
			lrf.loadOver();
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
				qe.cont = "~["+JSON.stringify(oneCont)+"]"
			}
			let vv:any = await tools.getBipInsAidInfo('ALLCAROUSEL',210,qe);
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				for(var i=0;i<cc.length;i++){
					let sw = cc[i];
					let nameArr = sw.fj_name.split(";");
					for(var j=0;j<nameArr.length;j++){
						let vl:any = {url:'',sid:sw.article_id,title:sw.title};
						// let url = this.uri+'?snkey='+this.snkey+'&fjroot='+sw.fj_root+'&updid=36&fjname='+nameArr[j];
						let url = commURL.BaseUri+'/mydoc/db_'+commURL.BaseDBID+'/'+sw.fj_root+"/"+nameArr[j];
						vl.url = url;
						this.swiperList.push(vl);
					}
				}
			}
		}

		imageLoad(src:any) {
			return src;
			// var ImgObj:any = new Image();
			// ImgObj.src = src;
			// if (ImgObj && (ImgObj.fileSize > 0 || (ImgObj.width > 0 && ImgObj.height > 0))) {
			// 	return	src;
			// } else {
			// 	return "../../../../static/gs.png"; //暂时默认头像
			// }
		}

		@Watch("type")
		typeChange(){
			this.page_num = 1;
		}
		@Watch("type_sid")
		typeSidChange(){
			this.page_num = 1;
			this.initData(this.type_sid);
		}
		@Watch("isrecommend")
		isrecommendChange(){
			if(this.isrecommend == 1){
				this.initSwiperData();
				this.initData(null,true);
			}
		}
		@Watch("input_condition")
		input_conditionChange(){
			this.tjInput = this.input_condition;
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
		background-color: #f5f5f557;
		padding-top: 5px;
		padding-bottom: 5px;
		color: #121516;
	}
	.screen-swiper{
		min-height: 500upx;
	}
	.screen-swiper-img{
		max-height: 400upx;
	}
	.cu-bar.btn-group uni-button {
		padding: 11px 1px;
	}
	.my-data-list{
		height:300px;
	}
	.my-image{
		height: 450upx !important;
	}
	.my-text-black{
		color: #1A1A22;
		font-weight: 500;
		font-size: 16px;
	}
</style>