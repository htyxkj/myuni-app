<template>
	<view>
		<view class="cu-custom" :style="[{height:CustomBar + 'px'}]">
			<view class="cu-bar fixed" :style="style" :class="[bgImage!=''?'none-bg text-white bg-img':'',bgColor]">
				<view class="action" @tap="BackPage" v-if="isBack">
					<text class="cuIcon-back"></text>
					<slot name="backText"></slot>
				</view>
				<view class="content" :style="[{top:StatusBar + 'px'}]">
					<slot name="content"></slot>
				</view>
				<slot name="right"></slot>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	@Component({})
	export default class cuCustom extends Vue {
		@Prop()	bgColor?:string
		@Prop()	isBack?:boolean|string
		@Prop()	bgImage?:string
		@Provide() StatusBar:number =  this.StatusBar
		@Provide() CustomBar:number =  this.CustomBar
		@Provide() name:string = 'cu-custom'
		get	style() {
			let StatusBar= this.StatusBar;
			let CustomBar= this.CustomBar;
			let bgImage:string = this.bgImage?this.bgImage:'';
			let style = `height:${CustomBar}px;padding-top:${StatusBar}px;`;
			if (this.bgImage) {
				style = `${style}background-image:url(${bgImage});`;
			}
			return style
		}

		BackPage() {
			uni.navigateBack({
				delta: 1
			});
		}
	}
</script>

<style>

</style>
