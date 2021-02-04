<template>
	<view class="cu-load load-modal">
		<image v-if="my_png" :src="my_png" mode="aspectFit"></image>
		<view class="gray-text">{{msg?msg:'加载中...'}}</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 加载页面通用类
	 */
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import comm from '@/static/js/comm.js';
	@Component({})
	export default class mLoad extends Vue {
		@Prop({default:'',type:String}) msg?:string;
		@Prop({default:'',type:String}) png?:string;
		my_png:any = null;
		onLoad(options:any) {
			if(this.png){
				this.my_png = this.png;
			}else{
				this.my_png = '/static/'+comm.ItemType+'.png';
			}
		}
	}
</script>

<style>

</style>
