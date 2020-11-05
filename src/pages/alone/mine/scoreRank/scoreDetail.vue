
<template>
	<view class="">
		<!-- 顶部标题栏及返回 -->
		<cu-custom  bgColor="bg-white":isBack="true">
			<block slot="content">
				<view class="header-title">{{title}}</view>
			</block>
		</cu-custom>
		<view class="main">
			<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'rgb(225, 225, 225)'" 
				:heightReduce="100" :pageNo="page_num" :totalPageNo="total_page" @loadMore="getNextPage" @refresh="refresh">
				<view slot="content-list">
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
				</view>
			</load-refresh>
			<!-- </scroll-view> -->
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
import loadRefresh from '@/components/load-refresh/load-refresh.vue';
@Component({
	components:{loadRefresh}
})
export default class scoreDetail extends Vue {
	title:string = "积分明细";
	usrcode:string = "";
	item:any = [];
	page:PageInfo = new PageInfo();
	
	page_num:number = 1;//当前页数
	total_page:number = 0;//总页数
	onLoad(e:any){
		this.usrcode = e.usrcode;
		this.page_num = 1;
		this.reqScoreDeatil()
	}
	// 获取积分数据
	async reqScoreDeatil(){
		console.log("获取积分数据");
		let qe:QueryEntity = new QueryEntity('','','','createtime desc');
		qe.page.currPage = this.page_num;
		qe.page.pageSize = 10;
		let qCont = new QueryCont('usrcode',this.usrcode,12,);
		qCont.setContrast(0);
		let oneCont = [];
		oneCont.push(qCont);
		qe.cont = "~["+JSON.stringify(oneCont)+"]";
		let vv:any = await tools.getBipInsAidInfo('SCOREDETAIL',210,qe);
		if(vv.data.id == 0){
			let req = vv.data.data.data;
			this.page = req.page;
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
			this.item = this.item.concat(req.values);
		}
		setTimeout(() => {
			let lrf: any = this.$refs.loadRefresh;
			if(lrf)
				lrf.loadOver();
		}, 500);
	}
	
	// 滑动到底部  上拉加载 获取下一页数据
	getNextPage(){ 
		this.page_num ++ ;
		this.reqScoreDeatil();  
	}
	/* 下拉刷新 */
	refresh(){
		this.page_num = 1;
		this.item = [];
		this.page.currPage = 1;
	  	this.reqScoreDeatil();
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
