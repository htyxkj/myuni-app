<template>
	<view>
		<scroll-view scroll-y class="page">
			<cu-custom bgColor="bg-white" :isBack="false">
				<block slot="content"><view class="header-title text-black">学习园地</view></block>
			</cu-custom>
			<view class="nav-list">
				<view class="nav-li bg-white" v-for="(item,index) in typeArr" :key="index" @tap="gotoList(item)">
					<image class ="myimg" mode="aspectFill" :src="imgArr[index]" ></image>
					<view class="name">{{item.name}}</view>
					<view class="remark">{{item.remark}}</view>
				</view>
			</view>
			<view class="cu-tabbar-height"></view>
		</scroll-view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端学习园地
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	@Component({
		
	})
	export default class Learning extends Vue {
		key:any = "NVKEY_";
		typeArr:Array<any> = [];
		imgArr:Array<any> = [];
		mounted(){
			let _key = this.key+"LX20080001"
			let data = uni.getStorageSync(_key)
			if(!data){
				this.initData()
			}else{
				this.typeArr = JSON.parse(data);
			}
			for(var i=0;i<10;i++){
				let src = '../../../../static/mine/learning/'+(i+1)+'.png'
				this.imgArr.push(src)
			}
		}
		async initData(){
			let _key = this.key+"LX20080001"
			let qe:QueryEntity = new QueryEntity('','');
			qe.page.currPage = 1;
			qe.page.pageSize = 100;
			qe.cont = "";
			let oneCont = [];
			let qCont = new QueryCont('father','LX20080001',12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('ARTICLETYPE',210,qe);
			if(vv.data.id ==0){
				this.typeArr = vv.data.data.data.values;
				uni.setStorageSync(_key, JSON.stringify(this.typeArr));
			}
		}

		gotoList(item:any){
			let url = "/pages/alone/mine/learning/learningList?sid="+item.sid+"&name="+item.name;
			uni.navigateTo({
				'url':url,
			})
		}
	}
</script>
<style scoped>
	.page {
		height: 100vh;
		background-color: rgb(247, 247, 247)
	}
	.nav-list {
		display: flex;
		flex-wrap: wrap;
		padding: 20upx 40upx 0px;
		justify-content: space-between;
	}
	
	.nav-li {
		padding: 30upx;
		border-radius: 12upx;
		width: 45%;
		margin: 0 2.5% 40upx;
		background-size: cover;
		background-position: center;
		position: relative;
		z-index: 1;
		text-align: center;
	}
	
	.nav-li::after {
		content: "";
		position: absolute;
		z-index: -1;
		background-color: inherit;
		width: 100%;
		height: 100%;
		left: 0;
		bottom: -10%;
		border-radius: 10upx;
		opacity: 0.2;
		transform: scale(0.9, 0.9);
	}
	
	.nav-li.cur {
		color: #fff;
		background: rgb(94, 185, 94);
		box-shadow: 4upx 4upx 6upx rgba(94, 185, 94, 0.4);
	}
	.remark{
		color: #D3D3D3;
		font-size: 10upx;
	}
	.name{
		color: #1C1C1C;
		font-size: 32upx;
	}
	.myimg{
		width: 110upx; 
		height: 110upx;
		background-color: #FFFFFF;
	}
</style>