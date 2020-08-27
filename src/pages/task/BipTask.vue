<template>
	<view>
		<template>
			<view v-show="spList" class="bg-white nav text-center flex">
				<view class="cu-item flex-sub" :class="index==TabCur?'text-blue cur':''" v-for="(item,index) in shTabs" :key="index"
					@tap="tabSelect" :data-id="index">
					<text :class="index==0?['text-red','text-blod','cuIcon-infofill']:['text-green','cuIcon-roundcheckfill']"></text>{{item.name}}
					<template v-if="item.total>0">
						(<text class="text-bold" :class="index==0?'text-red':'text-green'">{{item.total}}</text>)
					</template>
				</view>
			</view>
			<view v-show="spList" class="content">
				<template v-if="0==TabCur">
					<un-task-list @totalM="totalChange" @toDetails="toDetails" ref="untasklist"></un-task-list>
				</template>
				<template v-else>
					<task-list @totalM="totalChange" @toDetails="toDetails" ref="tasklist"></task-list>
				</template>
			</view>
		</template>
		<template >
			<scroll-view style="height:100vh;" scroll-y="true" >
				<appdetailsp v-show="!spList" ref="appdetailsp" @back="back"  @gorow="goRow"></appdetailsp>
			</scroll-view>
		</template>
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

	
	import appdetailsp from '@/pages/appinfo/appdetailsp.vue';
	import bipUnit from '@/components/bip-ui/bip-unit/bip-unit.vue';
	import UnTaskList from '@/components/bip-ui/bip-task/UnTaskList.vue';
	import TaskList from '@/components/bip-ui/bip-task/TaskList.vue';
	@Component({
		components: {
			TaskList,UnTaskList,appdetailsp
		}
	})
	export default class BipTask extends Vue {
		TabCur: number = 0;
		shTabs: Array < any > = [];
		bok = false;
		spList:boolean = true;//显示审批列表
		created(){
			this.shTabs.push({name:"待审核",total:0});
			this.shTabs.push({name:"已审核",total:0});
			this.spList = true;
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

		/**
		 * 打开详情页
		 */
		toDetails(e:any){
			this.spList = false;
			let ref:any = this.$refs.appdetailsp
			if(ref){
				ref.show(e);
			}else{
				setTimeout(() => {
					ref = this.$refs.appdetailsp
					if(ref)
						ref.show(e);
				}, 200);
			}
		}
		/**
		 * 关闭审批详情打开审批列表页
		 */
		back(){
			this.spList = true;
		}
		/**
		 * 上一条下一条
		 */
		goRow(rowId:any){
			let ref:any = null;
			if(0==this.TabCur){
				ref = this.$refs.untasklist
			}else{
				ref = this.$refs.tasklist
			}
			if(ref)
				ref.goToRow(rowId)
		}
	}
</script>

<style>
.content{
    width: 100%;
    height: 100%;
  }
</style>
