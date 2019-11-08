<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" :isBack="true"><block slot="backText">返回</block><block slot="content">布局</block></cu-custom>
		<tabs-sticky v-if="isShowSticky" v-model="tabIndex" :fixed="true" :tabs="tabs" @change="changeTab"></tabs-sticky>
		<mescroll-uni>
			<view class="cu-bar bg-white solid-bottom margin-top">
				<view class="action">
					<text class="cuIcon-title text-blue"></text>固定尺寸
				</view>
			</view>
			<view class="padding bg-white">
				<view class="flex flex-wrap">
					<view class="basis-xs bg-grey margin-xs padding-sm radius">xs(20%)</view>
					<view class="basis-df"></view>
					<view class="basis-sm bg-grey margin-xs padding-sm radius">sm(40%)</view>
					<view class="basis-df"></view>
					<view class="basis-df bg-grey margin-xs padding-sm radius">sub(50%)</view>
					<view class="basis-lg bg-grey margin-xs padding-sm radius">lg(60%)</view>
					<view class="basis-xl bg-grey margin-xs padding-sm radius">xl(80%)</view>
				</view>
			</view>
		</mescroll-uni>
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Component} from 'vue-property-decorator';
	import tabsSticky from '@/components/others/tabs-sticky.vue';
	import mescrollUni from '@/components/mescroll-uni/mescroll-uni.vue';
	import mockData from '@/static/js/pdlist.js'; // 模拟数据
	@Component({
		components:{tabsSticky,mescrollUni}
	})
	export default class mspage extends Vue{
		@Provide() isShowSticky:boolean = true;
		@Provide() tabIndex:number = 0;
		@Provide() tabs:Array<any> = []
		@Provide() customBar:number = this.CustomBar
		onLoad(){
			this.tabs = [{name:'name1'},{name:'name2'},{name:'name3'}]
		}
		changeTab(i:number){
			console.log(i)
		}
	}
</script>

<style>
</style>
