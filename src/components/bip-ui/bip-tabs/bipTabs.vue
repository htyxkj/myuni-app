<template>
	<view :class="{ 'bip-tabs': true, 'space-between': formatBe }" >
		<view v-for="(item, index) in getModelData" :key="index" :class="{ 'tab-item': true, active: formatIndex == index }" @tap="tap(index)">
			<template v-if="item.icon">
				<text :class="item.icon"></text>
			</template>
			{{ item.label }}
		</view>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
@Component({})
export default class bipTabs extends Vue {
	@Prop({ type: Array, default: [] }) modelData!: [];
	@Prop({
		default: 0,
		type: Number
	})
	initIndex!: number;
	@Prop({
		default: 'red',
		type: String
	})
	cr!: string;
	get getModelData() {
		return this.modelData;
	}
	get formatBe() {
		return this.modelData ? (this.modelData.length > 4 ? true : false) : false;
	}
	get formatIndex() {
		return this.initIndex;
	}
	tap(index: number) {
		// console.log('我点击了', index);
		this.$emit('change', index);
	}
}
</script>
<style lang="scss">
.bip-tabs {
	background-color: #ffffff;
	height: 88upx;
	font-size: 28upx;
	display: flex;
	justify-content: space-around;
	box-sizing: border-box;
	border-top: 2upx solid #dddddd;
	border-bottom: 2upx solid #dddddd;
	min-width: 100%;
	overflow-x: auto;

	.tab-item {
		line-height: 48upx;
		padding: 20upx;
		min-width: 100upx;
		text-align: center;
	}
	.tab-item.active {
		position: relative;
		color: #3682ff;
	}
	.tab-item.active::after {
		content: '';
		position: absolute;
		bottom: 0;
		left: 50%;
		transform: translateX(-50%);
		width: 100%;
		border-bottom: 4upx solid #3682ff;
		animation: test ease 1 1.5s;
	}
}
.bip-tabs.space-between {
	justify-content: space-between;
}
@keyframes test {
	0% {
		width: 100%;
	}
	50% {
		width: 150%;
	}
	100% {
		width: 100%;
	}
}
</style>
