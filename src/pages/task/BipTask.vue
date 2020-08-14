<template>
	<view>
		<view class="bg-white nav text-center flex">
			<view class="cu-item flex-sub" :class="index==TabCur?'text-blue cur':''" v-for="(item,index) in shTabs" :key="index"
			 @tap="tabSelect" :data-id="index">
				<text class="margin-sm" :class="index==0?['text-red','text-blod','cuIcon-infofill']:['text-green','cuIcon-roundcheckfill']"></text>{{item}}
			</view>
		</view>
		<view class="content">
			<template v-if="0==TabCur">
				<un-task-list></un-task-list>
			</template>
			<template v-else>
				<task-list></task-list>
			</template>
		</view>

	</view>
</template>

<script lang="ts">
	import {
		Vue,
		Provide,
		Prop,
		Component,
		Watch
	} from 'vue-property-decorator';
	import {
		BIPUtil
	} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import loadRefresh from '@/components/load-refresh/load-refresh.vue';
	import bipUnit from '@/components/bip-ui/bip-unit/bip-unit.vue';
	import UnTaskList from '@/components/bip-ui/bip-task/UnTaskList.vue';
	import TaskList from '@/components/bip-ui/bip-task/TaskList.vue';
	@Component({
		components: {
			loadRefresh,TaskList,UnTaskList
		}
	})
	export default class BipTask extends Vue {
		TabCur: number = 0;
		shTabs: Array < any > = [];
		currPage: number = 0;
		totalPage: number = 0;
		k:number = 10;
		list:Array<any> = [];
		mounted() {
			this.shTabs.push("待审核");
			this.shTabs.push("已审核");
			this.queryTaskInfo();
			this.currPage = 1;
			this.totalPage = 2;
		}
		tabSelect(e: any) {
			this.TabCur = e.currentTarget.dataset.id;
			// this.queryTaskInfo();
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
			
			for(let i=0;i<10;i++){
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
.content{
    width: 100%;
    height: 100%;
  }
</style>
