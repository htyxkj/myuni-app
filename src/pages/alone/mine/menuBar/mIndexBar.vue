<template>
	<view  class="cu-bar tabbar bg-white shadow foot" style="z-index: 99999;">
		<template>
			<view class="action" :class="tabcur==0?tabcurColor:''" @tap="tabSelect" data-id="0">
				<view :class="tabcur==0?'cuIcon-form':'cuIcon-form'" style="font-size: 50upx;"></view> 新闻
			</view>
			<view class="action" :class="tabcur==1?tabcurColor:''" @tap="tabSelect" data-id="1">
				<view :class="tabcur==1?'cuIcon-videofill':'cuIcon-video'" style="font-size: 50upx;"></view> 视频
			</view>
			<view class="action" :class="tabcur==2?tabcurColor:''" @tap="tabSelect" data-id="2">
				<view :class="tabcur==2?'cuIcon-messagefill':'cuIcon-message'" style="font-size: 50upx;"></view> 学习
			</view>
			<view class="action" :class="tabcur==3?tabcurColor:''" @tap="tabSelect" data-id="3">
				<view :class="tabcur==3?'cuIcon-read':'cuIcon-read'" style="font-size: 50upx;"></view> 问答
			</view>
			<view class="action" :class="tabcur==4?tabcurColor:''" @tap="tabSelect" data-id="4">
				<view :class="tabcur==4?'cuIcon-edit':'cuIcon-edit'" style="font-size: 50upx;"></view> 考试
			</view>
		</template> 
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端下方按钮区域
	 */
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	@Component({})
	export default class mIndexBar extends Vue {
		tabcur:number = 0
		tabcurColor:string = 'mySelBar'
		@Prop({ default:0, type:Number }) tbI!:number
		
		mounted(){
			this.tabcur = this.tbI;
		}
		tabSelect(e:any){
			this.tabcur = parseInt(e.currentTarget.dataset.id)
			this.$emit('tabSelect',[this.tabcur,null])
		}
	}
</script>
<style scoped>
	.mySelBar{
		color: #EB0B16;
	}
</style>
