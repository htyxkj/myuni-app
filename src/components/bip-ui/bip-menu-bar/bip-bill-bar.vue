<template>
	<view class="cu-bar tabbar bg-white shadow foot" style="z-index: 99999;">
<!-- 		<view class="action" :class="tabcur == 'ADD' ? tabcurColor : ''" @tap="tabSelect" data-id="ADD">
			<view class="cuIcon-add"></view>
			新建
		</view>
		<view class="action" :class="tabcur == 'SAVE' ? 'text-blue' : ''" @tap="tabSelect" data-id="SAVE">
			<view class="cuIcon-safe"></view>
			保存
		</view> -->
		<view v-if="(attr&1)>0" class="bg-gradual-green submit" @tap="tabSelect" data-id="ADD"><text class="bip-btn text-bold">添加</text></view>
		<view v-if="(attr&2)>0" class="bg-gradual-blue submit" @tap="tabSelect" data-id="SAVE"><text class="bip-btn text-bold">保存</text></view>
	</view>
</template>

<script lang="ts">
/**
 * 移动端下方按钮区域
 */
import { Vue, Provide, Prop, Component, Inject } from 'vue-property-decorator';
import BipMenuBar from '@/classes/pub/BipMenuBar';
@Component({})
export default class bipBillBar extends Vue {
	tabcur: string = '';
	tabcurColor: string = 'text-green';
	@Prop({ default: '', type: String }) tbI!: string;
	@Prop({ default: 1, type: Number }) attr!: number;
	mounted() {
		this.tabcur = this.tbI;
	}
	tabSelect(e: any) {
		this.tabcur = e.currentTarget.dataset.id;
		this.$emit('tabSelect', this.tabcur);
	}
}
</script>

<style lang="scss">
.bip-btn{
	font-size: 36upx;
}
</style>
