<template>
	<view :class="['uni-collapse-cell', { 'uni-collapse-cell--disabled': disabled, 'uni-collapse-cell--open': isOpen,'background-color':bgColor }]" :hover-class="disabled ? '' : 'uni-collapse-cell--hover'">
		<template v-if="!customize">
			<view class="uni-collapse-cell__title header" @click="onClick">
				<view v-if="thumb" class="uni-collapse-cell__title-extra"><image :src="thumb" class="uni-collapse-cell__title-img" /></view>		
				<view class="uni-collapse-cell__title-inner">
					<view class="uni-collapse-cell__title-text">{{ title }}</view>
				</view>
				<view :class="{ 'uni-active': isOpen, 'uni-collapse-cell--animation': showAnimation === true }" class="uni-collapse-cell__title-arrow">
					<uni-icons color="#bbb" size="20" type="arrowdown" />
				</view>
			</view>
		</template>
		<template v-else>
			<view class="uni-collapse-cell__customize-title">
				<slot name="title"></slot>
				<view :class="{ 'uni-active': isOpen, 'uni-collapse-cell--animation': showAnimation === true }" class="uni-collapse-cell__customize-title-arrow" @click="onClick">
					<uni-icons color="#bbb" size="20" type="arrowdown" />
				</view>
			</view>
		</template>
		<view :style="{ height: isOpen ? 'auto' : '0px' }" class="uni-collapse-cell__content">
			<view
				:class="{ 'uni-collapse-cell--animation': showAnimation === true }"
				:style="{ transform: isOpen ? 'translateY(0px)' : 'translateY(-50%)', '-webkit-transform': isOpen ? 'translateY(0px)' : 'translateY(-50%)' }">
				<slot name="content"></slot>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
import { Vue, Watch, Prop, Component, Inject } from 'vue-property-decorator';
import uniIcons from '../uni-icons/uni-icons.vue';
@Component({
	components: {
		uniIcons
	}
})
export default class UniCollapseItem extends Vue {
	@Prop({ type:Boolean,default:false}) customize!:boolean;
	@Prop({ type: String, default: '' }) title!: string;
	@Prop({ type: String, default: 'bg-white' }) bgColor!: string;
	@Prop({ type: [Number, String], default: 0 }) name!: number;
	@Prop({ type: [Boolean, String], default: false }) disabled!: boolean;
	@Prop({ type: Boolean, default: false }) showAnimation!: boolean;
	@Prop({ type: [Boolean, String], default: false }) open!: boolean;
	@Prop({ type: String, default: '' }) thumb!: string;
	isOpen: boolean = false;
	nameSync:string = ''
	@Inject('collapse') collapse!:any;

	@Watch('open')
	openchange(val: boolean) {
		this.isOpen = val;
	}
	created() {
		this.isOpen = this.open;
		this.nameSync = this.name ? this.name : this.collapse.childrens.length;
		this.collapse.childrens.push(this);
		if (String(this.collapse.accordion) === 'true') {
			if (this.isOpen) {
				let lastEl = this.collapse.childrens[this.collapse.childrens.length - 2];
				if (lastEl) {
					this.collapse.childrens[this.collapse.childrens.length - 2].isOpen = false;
				}
			}
		}
	}
	onClick() {
		if (this.disabled) {
			return;
		}
		if (String(this.collapse.accordion) === 'true') {
			this.collapse.childrens.forEach((vm:any) => {
				if (vm === this) {
					return;
				}
				vm.isOpen = false;
			});
		}
		this.isOpen = !this.isOpen;
		this.collapse.onChange && this.collapse.onChange();
		this.$forceUpdate();
	}
}
</script>

<style lang="scss">
$collapse-title-pd: $uni-spacing-col-lg $uni-spacing-row-lg;

.uni-collapse-cell {
	position: relative;
	&--hover {
		// @include collapse-hover;
		background-color: #ffffff;
	}

	&--open {
		// @include collapse-hover;
		background-color: #ffffff;
	}

	&--disabled {
		// @include collapse-disabled;
		opacity: 0.3;
	}

	&--animation {
		transition: all 0.3s;
	}

	&:after {
		position: absolute;
		z-index: 3;
		right: 0;
		bottom: 0;
		left: 0px;
		height: 1px;
		content: '';
		-webkit-transform: scaleY(0.5);
		transform: scaleY(0.5);
		background-color: $uni-border-color;
	}

	&__title {
		padding: $collapse-title-pd;
		width: 100%;
		box-sizing: border-box;
		flex: 1;
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		&-extra {
			margin-right: 18upx;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
		}

		&-img {
			height: $uni-img-size-base;
			width: $uni-img-size-base;
		}

		&-arrow {
			width: 20px;
			height: 20px;
			transform: rotate(0deg);
			transform-origin: center center;

			&.uni-active {
				transform: rotate(180deg);
			}
		}

		&-inner {
			flex: 1;
			overflow: hidden;
			display: flex;
			flex-direction: column;
		}

		&-text {
			font-size: $uni-font-size-lg;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: inherit;
			line-height: 1.5;
			overflow: hidden;
		}
	}

	&__content {
		position: relative;
		width: 100%;
		overflow: hidden;

		.view {
			font-size: $uni-font-size-base;
		}
	}

	&__customize-title {
		width: 100%;
		box-sizing: border-box;
		flex: 1;
		position: relative;
		display: flex;
		flex-direction: row;
		justify-content: space-between;
		align-items: center;

		&-extra {
			margin-right: 18upx;
			display: flex;
			flex-direction: row;
			justify-content: center;
			align-items: center;
		}

		&-img {
			height: $uni-img-size-base;
			width: $uni-img-size-base;
		}

		&-arrow {
			width: 20px;
			height: 20px;
			margin-right: 5px;
			transform: rotate(0deg);
			transform-origin: center center;

			&.uni-active {
				transform: rotate(180deg);
			}
		}

		&-inner {
			flex: 1;
			overflow: hidden;
			display: flex;
			flex-direction: column;
		}

		&-text {
			font-size: $uni-font-size-lg;
			text-overflow: ellipsis;
			white-space: nowrap;
			color: inherit;
			line-height: 1.5;
			overflow: hidden;
		}
	}
}
</style>
