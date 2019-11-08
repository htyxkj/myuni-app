<template>
	<view class="cu-load load-modal">
		<image v-if="png" :src="png" mode="aspectFit"></image>
		<view class="gray-text">{{msg?msg:'加载中...'}}</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 加载页面通用类
	 */
	import {Vue,Prop,Component} from 'vue-property-decorator';
	@Component({})
	export default class mLoad extends Vue {
		@Prop({default:'',type:String}) msg?:string;
		@Prop({default:'',type:String}) png?:string;
	}
</script>

<style>

</style>
