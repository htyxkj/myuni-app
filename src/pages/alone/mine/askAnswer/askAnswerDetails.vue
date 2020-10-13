<template>
	<view>
		<cu-custom bgColor="bg-zk-top" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">详情</view></block>
		</cu-custom>
		<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" 
			:heightReduce="185" :pageNo="page_num" :totalPageNo="total_page" @loadMore="loadMore" @refresh="refresh">
			<view class="padding " style="background-color: #ffffff" v-if="articleData"  slot="content-list">
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
				<!-- <view class="padding text-center">
					<button class="cu-btn round lines-blue" :class="[my_like ==0?'lines-gray':'lines-blue']" @click="doLike">
						<text class="cuIcon-appreciate"></text>{{like_num}}&nbsp;&nbsp;&nbsp;赞
					</button>
				</view> -->
				<view>
					<view class="flex padding-top" v-for="(item,index) in comment_list" :key="index">
						<view class="radius" style="flex-basis:10%">
							<image class="cu-avatar xxl round bg-white"   :src="!item.user_iocq?'../../../../static/gs.png':imgUrl+item.user_iocq"  mode="aspectFit"></image>                      
						</view>
						<view class="radius" style="flex-basis:90%">
							<view class="flex justify-between">
								<view class="radius comm-user-name">{{item.user_name}}
									<template v-if="item.top_status == 1">
										<view class='cu-tag margin-left'>置顶</view>
									</template>
								</view>
								<view class="radius" :class="[item.my_like ==0?'lines-gray':'lines-blue']" @click="doLikeComm(item)">
									<template v-if="item.praise_num ==0">
										赞
									</template>
									<template v-else>
										{{item.praise_num}}
									</template>
									<text class="cuIcon-appreciate"></text>
								</view>
							</view>
							<view class="comm-content">
								{{item.content}}
							</view>
							<view >
								<view v-for="(child_item,index) in item.childComment" :key="index" class="childComment" >
									<view class="childUName">{{child_item.user_name}}</view>
									<view>{{child_item.content}}</view>
								</view>
								<view v-if="item.childComment && item.childComment.length<item.childCount" @click="reply(item)" class="countReply childComment">
									共{{item.childCount}}条回复>
								</view>
							</view>
							<view>
								<view class="comm-data">{{item.create_time}}
									<view class="reply" v-if="item.user_id != user.userCode" @click="reply(item)">回复</view>
									<view class="reply" v-if="item.status ==0">(审核中)</view>
									<view class="reply" v-if="item.user_id == user.userCode" @click="deleteComm(item)">删除</view>
								</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</load-refresh>
		<view class="cu-bar bg-white tabbar shadow foot" v-if="articleData && user.userCode == articleData.smake">
			<view class="bg-red submit" @tap="deleteAsk"><text class="cuIcon-delete"></text> 删除</view>
		</view>
		<view v-else>
			<view class="cu-bar bg-white tabbar border shop btm-comment">
				<view class="btn-group">
					<input class="bg-gray comm-input" placeholder="发表你的解答..." type="text" @focus="gotocomment"></input>
				</view>
				<button class="action" open-type="contact" @click="gotoAllComment">
					<view class="cuIcon-comment text-green bottom-icon">
						<view class="cu-tag badge">{{comment_num}}</view>
					</view>
				</button>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端 我的提问详情页面
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
	import {BipMenuBtn} from '@/classes/BipMenuBtn'
	import loadRefresh from '@/components/load-refresh/load-refresh.vue';
	@Component({
		components:{loadRefresh}
	})
	export default class askAnswerDetails extends Vue {
		sid:any = "";
		articleData:any = null;
		uri:any ="";//
		snkey:any = "";// 
		page_num:number = 1;//当前页数
		total_page:number = 0;//总页数
		comment_num:number =0;//评论总数
		like_num:number =0;//点赞总数
		my_like:number = 0;//当前人是否点过赞  0：否；1：是
		comment_list:Array<any> = [];//评论列表
		my_favorites:number =0;//当前人是否收藏 0：否；1：是
		canDel:boolean = false;//当前人是否可以删除该问题

		imgUrl:any = "";
		onLoad(e:any) {
			this.imgUrl = commURL.BaseUri+"/db_"+commURL.BaseDBID+"/"
			this.uri = commURL.BaseUri+''+GlobalVariable.API_UPD
			this.snkey = LoginModule.snkey
			this.sid = e.sid
			this.initData();
			this.initCommentData();
		}
		onShow(){
			this.page_num = 1;
			this.initCommentData();
		}
		/**
		 * 刷新
		 */
		refresh(){
			this.page_num = 1;
			this.initData();
			this.initCommentData();
		}
		/**
		 * 查询文章内容
		 */
		async initData(){
			let qe:QueryEntity = new QueryEntity('','');
			let oneCont = []; 
			let qCont = new QueryCont('sid',this.sid,12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('ONEARTICLEL',210,qe);
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
					let j1:any = {sid:"",title:"",description:"",content:"",smake:"",smakename:"",mkdate:"",img:[],video:[]};
					let d1 = cc[i];
					j1.title = d1.title;
					j1.description = d1.description;
					j1.smake = d1.smake;
					j1.smakename = d1.smakename;
					j1.sid = d1.sid;
					j1.content = d1.content.replace(/snkey={BIPSNKEY}/g,'snkey='+this.snkey);
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
					this.articleData.content +="<style scoped>img{width: 100% !important;}</style>";
					this.like_num = d1.likenum
					if(!this.like_num)
						this.like_num=0;
				}
		}
 
		/**
		 * 某条评论点赞
		 */
		async doLikeComm(item:any){
			if(item.my_like ==0){
				item.my_like = 1;
				item.praise_num++;
			}else{
				item.my_like = 0;
				item.praise_num--;
			}
			let btn1 = new BipMenuBtn("DLG","评论点赞")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ArticleServlet*203;0;0");//评论点赞
			let b = JSON.stringify(btn1)
            let prarm = {
				"article_id":item.sid,//文章ID
            }
            let v = JSON.stringify(prarm);
			let res:any = await tools.getDlgRunClass(v,b);
			if(res.data.id !=0){
				if(item.my_like ==0){
					item.my_like = 1;
					item.praise_num++;
				}else{
					item.my_like = 0;
					item.praise_num--;
				}
			}
		}
		/***
		 * 去评论
		 */
		gotocomment(){
			let url = "/pages/alone/mine/details/comment?sid="+this.sid;
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
		/**
		 * 查看全部评论
		 */
		gotoAllComment(){
			let url = "/pages/alone/mine/details/allComment?sid="+this.sid;
			uni.navigateTo({
				'url':url,
			})
		}
		//加载下一页
		loadMore() {
			if(this.total_page>=this.page_num){
				this.page_num++;
				this.initCommentData();
			}
		}
		/**
		 * 查询评论数据
		 */
		async initCommentData(){
			let btn1 = new BipMenuBtn("DLG","查询评论")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ArticleServlet*201;0;0");//评论
			let b = JSON.stringify(btn1)
            let prarm = {
				"article_id":this.sid,//文章ID
				"page_num":this.page_num,//页数
            }
            let v = JSON.stringify(prarm);
			let res:any = await tools.getDlgRunClass(v,b);
			let data = res.data.data;
			this.comment_num = data.comment_num;
			this.my_like = data.my_like;
			this.total_page = data.total_page;
			this.my_favorites = data.my_favorites;
			if(this.page_num == 1) 
				this.comment_list = [];
			this.comment_list = this.comment_list.concat(data.data); //追加新数据
		}

		/**
		 * 收藏
		 */
		async favorites(){
			if(this.my_favorites ==0){
				this.my_favorites = 1;
			}else{
				this.my_favorites = 0;
			}
			let btn1 = new BipMenuBtn("DLG","文章收藏")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ArticleServlet*204;0;0");//评论
			let b = JSON.stringify(btn1)
            let prarm = {
				"article_id":this.sid,//文章ID
            }
            let v = JSON.stringify(prarm);
			let res:any = await tools.getDlgRunClass(v,b);
			if(res.data.id !=0){
				if(this.my_favorites ==0){
					this.my_favorites = 1;
				}else{
					this.my_favorites = 0;
				}
			}
		}
		/**
		 * 打开回复页面
		 */
		reply(itme:any){
			let url = "/pages/alone/mine/details/reply?sid="+itme.sid;
			uni.navigateTo({
				'url':url,
			})
		}
		/**
		 * 删除评论
		 */
		async deleteComm(item:any){
			let sid = item.sid;
			let btn1 = new BipMenuBtn("DLG","删除评论")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ArticleServlet*207;0;0");//删除评论
			let b = JSON.stringify(btn1)
            let prarm = {
				"comm_id" : sid,//文章ID
			}
			let v = JSON.stringify(prarm);
			let ret:any = await tools.getDlgRunClass(v,b);
			if(ret.data.id ==0){
				this.initCommentData();
			}
		}
		/**
		 * 删除当前提问
		 */
		async deleteAsk(){
			let btn1 = new BipMenuBtn("DLG","删除当前提问")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ArticleServlet*208;0;0");//评论
			let b = JSON.stringify(btn1)
            let prarm = {
				"article_id":this.sid,//文章ID
            }
            let v = JSON.stringify(prarm);
			let res:any = await tools.getDlgRunClass(v,b);
			if(res.data.id ==0 ){
				uni.showToast({
					title: '删除成功！',
					icon:"none"
				})
				setTimeout(() => {
					uni.navigateBack({
						delta: 1
					});
				}, 200);
			}
		}
		
		get user(){
			return LoginModule.user
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
	img{
    	width: 100% !important;
	}
	.btm-comment{
		position: sticky;
		bottom: -1px;
	}
	.comm-input{
		height:65upx;
		padding-left: 20upx;
		width: 100%;
		margin-left: 20upx;
	}
	.bottom-icon{
		font-size: 56upx !important;
	}
	.comm-user-name{
		color: #5677fc;
		font-size: 16px;
	}
	.comm-content{
		font-size: 17px;
		color: #333;
		text-align: justify;
		padding-top: 4px;
		word-break: break-all;
		word-wrap: break-word;
	}
	.comm-data{
		display: flex;
		-webkit-box-align: center;
		align-items: center;
		font-size: 13px;
		margin-top: 8px;
		color: #9a9a9a;
	}
	.reply{
		color: #5677fc!important;
		margin-left: 8px;
	}
	.childUName{
		font-size: 13px;
		color: #7a7a7a;
		padding-bottom: 4px;
	}
	.childComment{
		background-color: rgb(242, 242, 242);
		font-size: 15px;
		color: rgb(51, 51, 51);
		padding: 14px 16px;
	}
	.countReply{
		color: #5677fc;
	}
</style>