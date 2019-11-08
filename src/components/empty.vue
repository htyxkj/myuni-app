<template>
	<view class="margin-top">
		<view class="bip-empty shadow">
			<image src="../static/nodatas.png" mode="widthFix"></image>
			<text class="text-red text-shadow" style="font-size: 32upx;">没有获取到数据！</text>
		</view>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
@Component({})
export default class empty extends Vue {
	@Prop({
		type: Object,
		default: {
			fixed: true,
			tip: '没有获取到数据',
			btnText: '重新加载',
			zIndex: 666,
			top: 0
		}
	})
	optEmpty!: Object;

	emptyClick() {
		this.$emit('emptyclick');
	}
}
</script>

<style>
.bip-empty {
	text-align: center;
	max-width: 70%;
	margin: auto;
	height: 100%;
}
</style>
