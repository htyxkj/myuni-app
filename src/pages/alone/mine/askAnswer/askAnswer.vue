<template>
	<view>
		<scroll-view scroll-y class="page">
			<cu-custom bgColor="bg-white" :isBack="false">
				<block slot="content"><view class="header-title text-black">你问我答</view></block>
			</cu-custom>
            <view class="cu-list menu-avatar padding">
				<view class="cu-item bg-white margin-top-xs" v-for="(item,index) in typeArr" :key="index" @tap="gotoList(item)">
                    <image class ="cu-avatar bg-white myimg round" mode="aspectFill" :src="imgArr[index]" ></image>
					<view class="content">
                        <view class="name">{{item.name}}</view>
					</view>
				</view> 
			</view>
			<view class="cu-tabbar-height"></view>
		</scroll-view>
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
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	@Component({
		
	})
	export default class askAnswer extends Vue {
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
	.remark{
		color: #D3D3D3;
		font-size: 10upx;
	}
	.name{
		color: #1C1C1C;
		font-size: 32upx;
	}
	.myimg{
		width: 60upx; 
		height: 60upx;
		background-color: #FFFFFF;
	}
</style>