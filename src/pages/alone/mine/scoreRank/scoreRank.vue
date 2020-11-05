<template>
	<view class="">
		<!-- 顶部标题栏及返回 -->
		<cu-custom  bgColor="bg-white":isBack="true">
			<block slot="content">
				<view class="header-title">{{title}}</view>
			</block>
			<block slot="right">
				<view class="header-title" @tap="jumpScoreDetail()">积分明细</view>
			</block>
		</cu-custom>
		<view class="main">
			<!-- 标题切换 -->
			<view class="nav">
				<view class="nav-bar " :class="{ 'left-nav': isActive }" @tap="yearScoreClick()">年度积分</view>
				<view class="nav-bar " :class="{'right-nav': !isActive}" @tap="sumScoreClick()">总积分</view>
			</view>
			<!-- 积分排名 -->
			<view class="container">
				<view class="cont-info">
					<view class="score">{{score}}</view>
					<view class="score-title">{{scoretitle}}</view>
				</view>
				<view class="cont-info">
					<view class="score score-color score-size">{{rank1}}</view>
					<view class="score-title">集团内排名</view>
				</view>
				<view class="cont-info">
					<view class="score score-color">{{rank}}</view>
					<view class="score-title ">公司内排名</view>
				</view>
			</view>
			<!-- top10排名列表 -->
			<view class="item-list">
				<view class="item-list-tile">学习标兵</view>
				<view class="item-con">
					<view class="item" v-for="(item,index) in item":key="index" >
						<view class="user-rank">{{index+1}}</view>
						<view class="user-name">{{item.usrname}}</view>
						<view class="user-score">{{item.integral}} 分</view>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import {icl} from '@/classes/tools/CommICL';
	const ICL = icl; 
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {BipMenuBtn} from '@/classes/BipMenuBtn'
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	@Component({
		// components:{dataList}
	})
	export default class punchClock extends Vue {
		title: string = "积分排名";
		usrcode:string = "";
		usrname:string = "";
		scm:string = "";
		score:number = 0;
		rank:number = 0;
		rank1:number = 0;
		isActive:boolean = true;
		item:any = [];
		retData:any = null;
		scoretitle:string = "";
		curryear:string = "";
		onLoad(e: any) {
			this.usrcode = e.usrcode;
			this.usrname = e.usrname;
			this.scm=e.scm;
			this.getYearScoreData();
			this.reqYear()
		}
		/* 获取当前年份 */
		reqYear(){
			let date = new Date();
			this.curryear = date.getFullYear().toString();
		}
		/* 年度积分点击事件 */
		yearScoreClick(){
			this.isActive = true;
			this.scoretitle = this.curryear+"年度积分";
			this.score = this.retData.sum_year_integral;
			this.rank1 = this.retData.jt_year_renk;
			this.rank = this.retData.scm_year_renk;
			this.item = this.retData.jt_year_ten_list;
		}
		/* 总积分点击 */
		sumScoreClick(){
			this.isActive = false;
			this.scoretitle = "总积分";
			this.score = this.retData.sum_integral;
			this.rank1 = this.retData.jt_renk;
			this.rank = this.retData.scm_renk;
			this.item = this.retData.jt_ten_list;
		}
		/* 数据获取 */
		async getYearScoreData(){
			let btn1 = new BipMenuBtn("DLG","排名")
			btn1.setDlgType("D")
			btn1.setDlgCont("mine.serv.RankServlet*201;0;0");//获取排名信息
			let b = JSON.stringify(btn1)
			let prarm = {userId:this.usrcode,scm:this.scm}
			let v = JSON.stringify(prarm);
			let vv:any =await tools.getDlgRunClass(v,b);
			this.retData = vv.data.data.data;
			this.yearScoreClick();
		}
		
		/* 跳转至积分明细页面 */
		jumpScoreDetail(){
			let url="/pages/alone/mine/scoreRank/scoreDetail?usrcode="+this.usrcode;
			uni.navigateTo({
				url:url
			})
		}
	}
</script>

<style scoped>
	/* uni-page-body{
		background-color: rgb(233,99,72)
	} */
	.page {
		height: 93vh;
	}
	.main {
		width: 94%;
		margin: auto;
	}
	.nav {
		margin-top: 40upx;
		height: 90upx;
		line-height: 90upx;
		display: flex;
		font-size: 36upx;
		border-radius: 10upx;
		background-color: #FFFFFF;
	}
	.nav-bar {
		text-align: center;
		flex: 1;
	}
	.left-nav {
		background-color: rgb(231,102,71);
		border-top-left-radius: 10upx;
		border-bottom-left-radius: 10upx;
		color: #FFFFFF;
	}
	.right-nav {
		background-color: rgb(231,102,71);
		border-top-right-radius: 10upx;
		border-bottom-right-radius: 10upx;
		color: #FFFFFF;
	}
	.container {
		margin-top: 40upx;
		height: 200upx;
		display: flex;
		border-radius: 10upx;
		background-color: #FFFFFF;
	}
	.cont-info {
		flex: 1;
		text-align: center;
	}
	.score {
		height: 120upx;
		line-height: 150upx;
		color: #F40;
		font-weight: 800;
		font-size: 50upx;
	}
	.score-size {
		font-size: 40upx;
	}
	.score-title {
		color: rgba(174,174,174);
	}
	.score-color {
		color: #000000;
	}
	.item-list {
		margin-top: 40upx;
		height: 800upx;
		border-radius: 10upx;
		background-color: #FFFFFF;
	}
	.item-list-tile {
		padding-left: 20upx;
		height: 100upx;
		line-height: 100upx;
		font-size: 36upx;
		font-weight: 800;
	}
	.item-con {
		/* margin-top: 10upx; */
	}
	.item {
		display: flex;
		text-align: center;
		font-size: 40upx;
		height: 70upx;
		line-height: 70upx;
		font-family: Helvetica ;
		font-style: oblique;
		
	}
	.user-rank {
		width: 25%;
		
	}
	.user-name {
		width: 45%;
		font-style: normal;
	}
	.user-score {
		width: 30%;
		color: #f40;
	}	
</style>
