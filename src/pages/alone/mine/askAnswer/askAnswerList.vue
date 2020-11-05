<template>
	<view>
		<cu-custom bgColor="bg-zk-top" :isBack="true">
			<block slot="content"><view class="header-title">{{title}}</view></block>
		</cu-custom>
		<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#ffffff'" 
			:heightReduce="100" :pageNo="page_num" :totalPageNo="total_page" @loadMore="getNextPage" @refresh="refresh">
			<view slot="content-list">
				<view class="padding-top-sm"></view>
				<view v-for="(item) in articleData" :key="item.sid" class="solid-bottom">
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
										</view>
									</view>
								</view>
							</view>
						</view>
					</template>
				</view>
				<template v-if="userType == 'Official'">
					<view class="cu-bar bg-white tabbar shadow foot">
						<view class="bg-blue submit" @tap="ask"><text class="cuIcon-upload"></text> 提问</view>
					</view>
				</template>
			</view>
		</load-refresh>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端 你问我答
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import PageInfo from '@/classes/search/PageInfo';
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	import moment from 'moment'
	import { GlobalVariable } from '@/classes/tools/ICL';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import loadRefresh from '@/components/load-refresh/load-refresh.vue';
	@Component({
		components:{loadRefresh}
	})
	export default class AskAnswerList extends Vue {
		userType:any = "";//用户类型
		type_sid:any ="";//当前选中类型
		qe:QueryEntity = new QueryEntity('','');
		page:PageInfo = new PageInfo();	
		articleData:Array<any> = [];
		payVideo:any = null;//当前正在播放的视频
		uri:any ="";//
		title:any = "";
		page_num:number = 1;//当前页数
		total_page:number = 0;//总页数

		onLoad(e:any) {
			this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
			this.type_sid = e.sid
			this.title = e.name
			this.initData(e.sid);
		}
		get snkey(){
			return LoginModule.snkey
		}
		/**
		 * 下拉刷新
		 */
		async refresh(){
			this.page_num = 1;
			await this.initData(null);
		}

		/**
		 * 根据分类编码查询数据
		 */
		async initData(type:any){
			if(type)
				this.type_sid = type;
			this.qe.page = new PageInfo();
			this.qe.page.currPage = this.page_num;
			let oneCont = []; 
			let qCont = new QueryCont('type',this.type_sid,12);
			qCont.setContrast(0);
			qCont.setLink(1);
			oneCont.push(qCont);
			this.userType = uni.getStorageSync('userType');
			if(this.userType == 'Tourist'){//游客身份
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
				let total = this.page.total;
				let pageSize =  this.page.pageSize;
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
			this.page_num++;
			this.qe.page = this.page;
			this.qe.page.currPage = this.page_num
			let oneCont = []; 
			let qCont = new QueryCont('type',this.type_sid,12);
			qCont.setContrast(0);
			qCont.setLink(1);
			oneCont.push(qCont);
			this.userType = uni.getStorageSync('userType');
			if(this.userType == 'Tourist'){//游客身份
				qCont = new QueryCont('ispublic','1',5);
				qCont.setContrast(0);
				qCont.setLink(1);
				oneCont.push(qCont);
			}
			this.qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('ALLARTICLEL',210,this.qe);
			if(vv.data.id ==0){
				let cc = vv.data.data.data.values;
				if(cc.length == 0){
					this.page_num --;
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
				let j1:any = {sid:"",title:"",description:"",smakename:"",mkdate:"",img:[],video:[]};
				let d1 = cc[i];
				j1.title = d1.title;
				j1.description = d1.description;
				j1.smakename = d1.smakename;
				j1.sid = d1.sid;
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
				this.articleData.push(j1)
			}
			let lrf: any = this.$refs.loadRefresh;
			if(lrf)
			lrf.loadOver();
		}

		/**
		 * 去详情页面
		 */
		gotoarticle(item:any){
			let url = "/pages/alone/mine/askAnswer/askAnswerDetails?sid="+item.sid;
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
		}
		/**
		 * 提问 打开提问页面
		 */
		ask(){
			let url = "/pages/alone/mine/askAnswer/askAnswerAdd?type_sid="+this.type_sid;
			uni.navigateTo({
				'url':url,
			})
		}
	}
</script>
<style scoped>
	uni-page-body{
		background-color: #FFFFFF
	}
	.page {
		height: 93vh;
	}
	.listImg1{
		width: 220upx;
		height: 164upx;
	}
</style>