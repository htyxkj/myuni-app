<template>
	<view  class="cu-bar tabbar bg-white shadow foot" style="z-index: 99999;">
		<view class="action" :class="tabcur==0?tabcurColor:''" @tap="tabSelect" data-id="0">
			<view :class="tabcur==0?'cuIcon-homefill':'cuIcon-home'" style="font-size: 50upx;"></view> 首页
		</view>
		<view class="action" :class="tabcur==1?tabcurColor:''" @tap="tabSelect" data-id="1">
			<view :class="tabcur==1?'cuIcon-formfill':'cuIcon-form'" style="font-size: 50upx;"></view> 菜单
		</view>
		
<!-- 		<view v-if="bAdd" class="action" :class="tabcur==4?tabcurColor:''" @tap="tabSelect" data-id="4">
			<view :class="tabcur==4?'cuIcon-roundadd':'cuIcon-add'" style="font-size: 50upx;"></view>
		</view> -->
<!-- 		<view v-if="bAdd" class="action add-action" @tap="tabSelect" data-id="4">
			<view class="cu-btn cuIcon-add bg-black shadow" style="font-size: 50upx;" ></view>	添加
		</view> -->
		
		<view class="action" :class="tabcur==2?tabcurColor:''" @tap="tabSelect" data-id="2">
			<view :class="tabcur==2?'cuIcon-messagefill':'cuIcon-message'" style="font-size: 50upx;"></view> 消息
		</view>
		<view class="action" :class="tabcur==3?tabcurColor:''" @tap="tabSelect" data-id="3">
			<view :class="tabcur==3?'cuIcon-profilefill':'cuIcon-profile'" style="font-size: 50upx;"></view> 我
		</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 移动端下方按钮区域
	 */
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	@Component({})
	export default class mIndexBar extends Vue {
		tabcur:number = 0
		tabcurColor:string = 'text-green'
		@Prop({
			default:0,
			type:Number
		}) tbI!:number
		
		mounted(){
			this.tabcur = this.tbI;
		}
		tabSelect(e:any){
			this.tabcur = parseInt(e.currentTarget.dataset.id)
			this.$emit('tabSelect',this.tabcur)
		}
		
		
	}
</script>
