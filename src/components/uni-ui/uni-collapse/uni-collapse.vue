<template>
	<view class="uni-collapse"><slot/></view>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
@Component({})
export default class UniCollapse extends Vue {
	name: string = 'UniCollapse';
	@Prop({ type: [Boolean, String], default: false }) accordion!: boolean;
	childrens: Array<any> = [];
	@Provide('collapse') collapse: any = this;
	onChange() {
		let activeItem:Array<any> = [];
		this.childrens.forEach((vm:any, index:number) => {
			if (vm.isOpen) {
				activeItem.push(vm.nameSync);
			}
		});
		this.$emit('change', activeItem);
	}
}
</script>
<style lang="scss">
.uni-collapse {
	background-color: $uni-bg-color;
	position: relative;
	width: 100%;
	display: flex;
	flex-direction: column;

	&:after {
		position: absolute;
		z-index: 10;
		right: 0;
		bottom: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(0.5);
		transform: scaleY(0.5);
		background-color: $uni-border-color;
	}

	&:before {
		position: absolute;
		z-index: 10;
		right: 0;
		top: 0;
		left: 0;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(0.5);
		transform: scaleY(0.5);
		background-color: $uni-border-color;
	}
}
</style>
