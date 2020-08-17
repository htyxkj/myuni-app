<template>
	<view>
		<!-- <template v-if="bok"> -->
		<view class="bg-white nav text-center flex">
				<view class="cu-item flex-sub" :class="index==TabCur?'text-blue cur':''" v-for="(item,index) in shTabs" :key="index"
					 @tap="tabSelect" :data-id="index">
					 	<text :class="index==0?['text-red','text-blod','cuIcon-infofill']:['text-green','cuIcon-roundcheckfill']"></text>{{item.name}}
					 	<template v-if="item.total>0">
					 		(<text class="text-bold" :class="index==0?'text-red':'text-green'">{{item.total}}</text>)
					 	</template>
					</view>
				</view>
				<view class="content">
					<template v-if="0==TabCur">
						<un-task-list @totalM="totalChange"></un-task-list>
					</template>
					<template v-else>
						<task-list @totalM="totalChange"></task-list>
					</template>
				</view>
			<!-- </template> -->
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

	
	import bipUnit from '@/components/bip-ui/bip-unit/bip-unit.vue';
	import UnTaskList from '@/components/bip-ui/bip-task/UnTaskList.vue';
	import TaskList from '@/components/bip-ui/bip-task/TaskList.vue';
	@Component({
		components: {
			TaskList,UnTaskList
		}
	})
	export default class BipTask extends Vue {
		TabCur: number = 0;
		shTabs: Array < any > = [];
		bok = false;
		
		created(){
			this.shTabs.push({name:"待审核",total:0});
			this.shTabs.push({name:"已审核",total:0});
		}
		mounted() {
			this.bok = true
		}
		tabSelect(e: any) {
			this.TabCur = e.currentTarget.dataset.id;
			// this.queryTaskInfo();
		}
		
		totalChange(total:number){
			let cur = this.shTabs[this.TabCur];
			// if(cur){
				cur.total = total
			// }
		}

	}
</script>

<style>
.content{
    width: 100%;
    height: 100%;
  }
</style>
