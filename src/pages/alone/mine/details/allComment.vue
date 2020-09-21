<template>
	<view>
		<cu-custom bgColor="bg-gradual-pink" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">评论</view></block>
		</cu-custom>
		<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" 
			:heightReduce="185" :pageNo="page_num" :totalPageNo="total_page" @loadMore="loadMore" @refresh="refresh">
			<view class="padding bg-white" slot="content-list">
				<view class="title">全部评论（{{comment_num}}）</view>
				<view class="flex padding-top" v-for="(item,index) in comment_list" :key="index">
					<view class="radius" style="flex-basis:10%">
						<image class="cu-avatar xxl round bg-white"  src="../../../../static/gs.png" mode="aspectFit"></image>
					</view>
					<view class="radius" style="flex-basis:90%">
						<view class="flex justify-between">
							<view class="radius comm-user-name">{{item.user_name}}</view>
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
						<view>
							<view v-for="(child_item,index) in item.childComment" :key="index" class="childComment">
								<view class="childUName">{{child_item.user_name}}</view>
								<view>{{child_item.content}}</view>
							</view>
							<view v-if="item.childComment.length<item.childCount" @click="reply(item)" class="countReply childComment">
								共{{item.childCount}}条回复>
							</view>
						</view>
						<view>
							<view class="comm-data">{{item.create_time}}
								<view class="reply" @click="reply(item)">回复</view>
							</view>
						</view>
					</view>
				</view>
			</view>
		</load-refresh>
		<view class="cu-bar bg-white tabbar border btm-comment">
			<view class="btn-group">
				<input class="bg-gray comm-input" placeholder="发表你的评论..." type="text" @focus="gotocomment"></input>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端 文章全部评论页
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
	import loadRefresh from '@/components/load-refresh/load-refresh.vue';
	import {BipMenuBtn} from '@/classes/BipMenuBtn'
	@Component({
		components:{loadRefresh}
	})
	export default class AllComment extends Vue {
		sid:any = "";
		page_num:number = 1;//当前页数
		total_page:number = 0;//总页数
		comment_num:number =0;//评论总数
		like_num:number =0;//点赞总数
		my_like:number = 0;//当前人是否点过赞  0：否；1：是
		comment_list:Array<any> = [];//评论列表
		onLoad(e:any) {
			this.sid = e.sid
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
			this.initCommentData();
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
			}
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
			this.like_num = data.like_num;
			this.my_like = data.my_like;
			this.total_page = data.total_page;
			if(this.page_num == 1) 
				this.comment_list = [];
			this.comment_list = this.comment_list.concat(data.data); //追加新数据
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
	}
</script>
<style scoped>
	uni-page-body{
		background-color: #FFFFFF
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
	.title{
		font-size: 16px;
		font-weight: 700;
		position: relative;
		padding: 11px 0;
		color: black;
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