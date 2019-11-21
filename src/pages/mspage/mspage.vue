<template>
	<view>
		<cu-custom bgColor="bg-gradual-blue" :isBack="true"><block slot="backText">返回</block><block slot="content">布局</block></cu-custom>
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Component} from 'vue-property-decorator';
	@Component({
		components:{}
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
