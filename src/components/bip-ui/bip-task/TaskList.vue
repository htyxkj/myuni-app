<template>
	<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" :heightReduce="360" :pageNo="currPage" :totalPageNo="totalPage"
	 @loadMore="loadMore" @refresh="refresh">
	 <view slot="content-list">
	 	<bip-unit v-for="(item,index) in list" :key="index"></bip-unit>
		<!-- <view class="margin-bottom-xl"></view> -->
	 </view>
	</load-refresh>
</template>

<script lang="ts">
    import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
	import bipUnit from '@/components/bip-ui/bip-unit/bip-unit.vue';
	@Component({components:{bipUnit}})
	export default class TaskList extends Vue{
		currPage: number = 0;
		totalPage: number = 0;
		list:Array<any> = [];
		
		mounted(){
			this.queryTaskInfo();
			this.currPage = 1;
			this.totalPage = 2;
		}
		
		queryTaskInfo() {
			// let dataStr = JSON.stringify({
			// 	tousr: 'admin'
			// });
			// let qe: QueryEntity = new QueryEntity("SYRW", "SYRW", dataStr);
			// tools.query(qe).then((res: any) => {
			// 	console.log(res)
				
			// }).catch((err: any) => {
			// 	console.log(err)
			// })
			
			for(let i=0;i<70;i++){
				this.list.push(i);
			}
		}
		// 上划加载更多
		loadMore() {
			console.log('loadMore')
			// 请求新数据完成后调用 组件内loadOver()方法
			// 注意更新当前页码 currPage
			if(this.totalPage>this.currPage){
				this.currPage++;
				console.log('查询第2也数据')
				this.queryTaskInfo();
				console.log(this.list.length)
			}
			let lrf: any = this.$refs.loadRefresh;
			lrf.loadOver();
		}
		// 下拉刷新数据列表
		refresh() {
			this.list = []
			console.log('refresh')
			this.queryTaskInfo();
			this.currPage = 1;
			this.totalPage = 2;
		}
	}
</script>

<style>

</style>
