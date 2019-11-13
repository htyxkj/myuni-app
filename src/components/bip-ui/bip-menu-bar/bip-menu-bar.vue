<template>
	<view class="cu-bar tabbar bg-white shadow foot" style="z-index: 99999;">
		<view class="action" :class="tabcur == 'ADD' ? tabcurColor : ''" @tap="tabSelect" data-id="ADD">
			<view class="cuIcon-add"></view>
			新建
		</view>
		<view class="action" :class="tabcur == 'DEL' ? 'text-red' : ''" @tap="tabSelect" data-id="DEL">
			<view class="cuIcon-delete"></view>
			删除
		</view>
		<view class="action" :class="tabcur == 'SAVE' ? 'text-blue' : ''" @tap="tabSelect" data-id="SAVE">
			<view class="cuIcon-safe"></view>
			保存
		</view>
		<view class="action" v-for="(item,index) in mbs.menuList" :key="index" :class="tabcur == item.cmd ? 'text-blue' : ''" @tap="tabSelect" :data-id="item.cmd">
			<view class="cuIcon-safe"></view>
			item.name
		</view>
	</view>
</template>

<script lang="ts">
/**
 * 移动端下方按钮区域
 */
import { Vue, Provide, Prop, Component, Inject } from 'vue-property-decorator';
import BipMenuBar from '@/classes/pub/BipMenuBar';
@Component({})
export default class bipMenuBar extends Vue {
	tabcur: string = '';
	tabcurColor: string = 'text-green';
	@Prop({ default: '', type: String }) tbI!: string;
	@Inject('mbs') mbs!: BipMenuBar;

	mounted() {
		this.tabcur = this.tbI;
		console.log(this.mbs);
	}
	tabSelect(e: any) {
		this.tabcur = e.currentTarget.dataset.id;
		this.$emit('tabSelect', this.tabcur);
	}
}
</script>

<style lang="scss">
// .iconfont {
// 	font-family: 'iconfont' !important;
// 	font-size: 16px;
// 	font-style: normal;
// 	-webkit-font-smoothing: antialiased;
// 	-moz-osx-font-smoothing: grayscale;
// 	&.icon-bip-xinjian2{
// 		width: 100rpx;
// 		position: relative;
// 		display: block;
// 		height: auto;
// 		margin: 0 auto 10rpx;
// 		text-align: center;
// 		font-size: 40rpx;
// 	}
// }

// [class*='icon-bip-'] {
// 	font-family: 'iconfont';
// 	font-size: inherit;
// 	font-style: normal;
// }
</style>
