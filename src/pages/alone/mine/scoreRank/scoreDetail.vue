<template>
	<view class="">
		<!-- 顶部标题栏及返回 -->
		<cu-custom  bgColor="bg-white":isBack="true">
			<block slot="content">
				<view class="header-title">{{title}}</view>
			</block>
		</cu-custom>
		<view class="main">
			<scroll-view class="page" scroll-y refresher-enabled @scrolltolower="reqNexPageScoreDeatil" @refresherrefresh="refresherTriggered" :refresher-triggered="refresher_triggered">
				<view class="main-box" v-for="(item,index) in item" :key="index">
					<view class="score-datail">
						<view class="hpdate datail">{{item.hpdate}}</view>
						<view class="type datail">{{item.name}}</view>
						<view class="score datail">+{{item.num}}分</view>
					</view>
					<view class="message">
						您本次的积分有增长哦~请保持良好的学习习惯，继续挣取积分
					</view>
				</view>
				<view class="bottom-msg" v-if="isHide">----------我是有底线的----------</view>
			</scroll-view>
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
import PageInfo from '@/classes/search/PageInfo';
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import comm from '@/static/js/comm.js';
let commURL: any = comm;
import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
@Component({
	
})
export default class scoreDetail extends Vue {
	title:string = "积分明细";
	usrcode:string = "";
	item:any = [];
	page:PageInfo = new PageInfo();
	isHide:boolean = false;
	refresher_triggered:boolean = false;//下拉刷新状态
	onLoad(e:any){
		this.usrcode = e.usrcode;
		this.reqScoreDeatil()
	}
	// 获取积分数据
	async reqScoreDeatil(){
		console.log("获取积分数据");
		let qe:QueryEntity = new QueryEntity('','','','createtime desc');
		qe.page.currPage = this.page.currPage++;
		qe.page.pageSize = 10;
		let qCont = new QueryCont('usrcode',this.usrcode,12,);
		qCont.setContrast(0);
		let oneCont = [];
		oneCont.push(qCont);
		qe.cont = "~["+JSON.stringify(oneCont)+"]";
		let vv:any = await tools.getBipInsAidInfo('SCOREDETAIL',210,qe);
		console.log(qe);
		console.log(vv)
		if(vv.data.id == 0){
			let req = vv.data.data.data;
			console.log(vv)
			this.page.total = req.page.total;
			this.item = this.item.concat(req.values);
			console.log(this.item);
		}
		this.refresher_triggered = false;	
	}
	
	// 滑动到底部  上拉加载 获取下一页数据
	reqNexPageScoreDeatil(){
		if(this.page.currPage*10 >= this.page.total){
			this.isHide = true;
		}else {
			this.reqScoreDeatil();
		}
		console.log("滑动到底部了")
	}
	/* 下拉刷新 */
	refresherTriggered(){
		console.log("下拉刷新")
		this.item = [];
		this.isHide = false;
		this.page.currPage = 1;
		this.refresher_triggered = true;
	  this.reqScoreDeatil();
		// setTimeout(()=>{
		// 	this.refresher_triggered = false;	
		// },100)
	}
}
</script>

<style scoped>
	.page {
		height: 93vh;
	}
	.main-box {
		margin: 20upx;
		background-color: #FFFFFF;
		border-radius: 10upx;
	}
	.score-datail {
		display: flex;
		border-bottom: 1px solid rgb(244,244,244);
	}
	.datail {
		height: 100upx;
		line-height: 100upx;
	}
	.hpdate {
		width: 30%;
		padding-left: 20upx;
	}
	.type{
		width: 40%;
		text-align: center;
	}
	.score {
		color: #f40;
		width: 30%;
		text-align: right;
		padding-right: 20upx;
	}
	.message {
		height: 140upx;
		vertical-align:middle;
		display:table-cell;
		padding-left: 20upx;
		color: rgb(131,131,131);
	}
	.bottom-msg {
		text-align: center;
		color: rgb(131,131,131);
	}
</style>
