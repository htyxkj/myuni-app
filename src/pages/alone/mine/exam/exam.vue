<template>
	<view>
		<scroll-view scroll-y class="page">
			<cu-custom bgColor="bg-white" :isBack="false">
				<block slot="content"><view class="header-title">考试中心</view></block>
			</cu-custom>
            <view class="cu-list menu-avatar padding">				
				<view class="cu-item bg-white margin-top-xs">
                    <image class ="cu-avatar bg-white myimg" mode="aspectFill" :src="'../../../../static/mine/exam/day.png'" ></image>
					<view class="content" @tap="datAnswer()">
                        <view class="name">每日练习</view>
						<view class="remark">书读百遍，其义自见。</view>
					</view>
				</view> 
			</view>
			<view class="cu-tabbar-height"></view>
		</scroll-view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端 考试
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	@Component({
		
	})
	export default class Exam extends Vue {
		key:any = "NVKEY_LX20080002";
		typeArr:Array<any> = [];
		imgArr:Array<any> = [];
		mounted(){
			let data = uni.getStorageSync(this.key)
			if(!data){
				this.initData()
			}else{
				this.typeArr = JSON.parse(data);
			}
			for(var i=0;i<10;i++){
				let src = '../../../../static/mine/askAnswer/'+(i+1)+'.png'
				this.imgArr.push(src)
			}
		}
		async initData(){
			let qe:QueryEntity = new QueryEntity('','');
			qe.page.currPage = 1;
			qe.page.pageSize = 100;
			qe.cont = "";
			let oneCont = [];
			let qCont = new QueryCont('father','LX20080002',12);
			qCont.setContrast(0);
			oneCont.push(qCont);
			qe.cont = "~["+JSON.stringify(oneCont)+"]"
			let vv:any = await tools.getBipInsAidInfo('ARTICLETYPE',210,qe);
			if(vv.data.id ==0){
				this.typeArr = vv.data.data.data.values;
				uni.setStorageSync(this.key, JSON.stringify(this.typeArr));
			}
		}
		/**
		 * 每日答题
		 */
		datAnswer(){
			let url = "/pages/alone/mine/exam/dayAnswer";
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
	}
</script>
<style scoped>
	.page {
		height: 100vh;
		background-color: rgb(247, 247, 247)
	}
	.remark{
		color: #D3D3D3;
		font-size: 20upx;
	}
	.name{
		color: #1C1C1C;
		font-size: 32upx;
	}
	.myimg{
		width: 90upx; 
		height: 90upx;
		background-color: #FFFFFF;
	}
</style>