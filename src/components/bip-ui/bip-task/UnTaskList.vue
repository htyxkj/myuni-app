<template>
	<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" :heightReduce="360" :pageNo="currPage" :totalPageNo="totalPage"
	 @loadMore="loadMore" @refresh="refresh">
	 <view slot="content-list">
	 	<bip-task-unit v-for="(item,index) in list" :key="index" :rowId="index" :record="item" :cells="cell"></bip-task-unit>
	 </view>
	 <mLoad :png="'/static/gs.png'" :msg="'加载中...'" v-if="loadModal"></mLoad>
	</load-refresh>
</template>

<script lang="ts">
    import { Vue, Provide, Prop, Component,Watch,Emit } from 'vue-property-decorator';
	// import bipUnit from '@/components/bip-ui/bip-unit/bip-unit.vue';
	import BipTaskUnit from './BipTaskUnit.vue'
	import {
		BIPUtil
	} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import mLoad from '@/components/mLoad.vue';
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	@Component({components:{BipTaskUnit,mLoad}})
	export default class UnTaskList extends Vue{
		currPage: number = 1;
		loadModal:boolean = false;
		totalPage: number = 0;
		total:number = 0;
		list:Array<any> = [];
		obj_id:string = 'SYRW';
		cell:any = null;
		async mounted(){
			this.loadModal = true;
			let res = await tools.getCCellsParams(this.obj_id);
			let rtn: any = res.data;
			if(rtn.id ==0){
				this.cell = rtn.data.layCels[0];
				if(this.cell != null){
					//执行查询
					this.queryTaskInfo();
				}
			}else{
				this.loadModal = false;
			}
			console.log(res);
		}
		
		//查询服务端任务数据
		queryTaskInfo() {
			let dataStr = JSON.stringify({
				tousr: 'admin'
			});
			let qe: QueryEntity = new QueryEntity("SYRW", "SYRW", dataStr);
			qe.page.currPage = this.currPage;
			tools.query(qe).then((res: any) => {
				// console.log(res)
				let rtn = res.data;
				// console.log(rtn);
				if(rtn.id == 0){
					let page = rtn.data.data.page;
					// console.log(page,2222)
					this.currPage = page.currPage;
					this.total = page.total;
					if(this.total>0)
						this.totalPage = Math.ceil(this.total/page.pageSize)
					if(this.currPage==1){
						this.list = [];
					}
					this.list = this.list.concat(rtn.data.data.data); //追加新数据
					// let lrf: any = this.$refs.loadRefresh;
					// lrf.loadOver();
				}
				this.loadModal = false;
			}).catch((err: any) => {
				console.log(err)
				this.loadModal = false;
			})
			
			// for(let i=0;i<10;i++){
			// 	this.list.push(i);
			// }
		}
		// 上划加载更多
		loadMore() {
			// console.log('loadMore')
			// 请求新数据完成后调用 组件内loadOver()方法
			// 注意更新当前页码 currPage
			if(this.totalPage>this.currPage){
				this.currPage++;
				// console.log('查询第2也数据')
				this.queryTaskInfo();
				// console.log(this.list.length)
			}
			let lrf: any = this.$refs.loadRefresh;
			lrf.loadOver();
		}
		// 下拉刷新数据列表
		refresh() {
			// this.list = []
			this.currPage = 1;
			this.queryTaskInfo();
		}
	
		@Watch('total', {immediate: true, deep: true})
		totalChange(newVal: number, oldVal: number){
			this.emitTotal(newVal);
		}
		
		@Emit('totalM')
		emitTotal(n: number){
		}
	}
</script>

<style>

</style>
