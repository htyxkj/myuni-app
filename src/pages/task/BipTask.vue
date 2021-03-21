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
				<template v-show="0==TabCur">
					<un-task-list @totalM="totalChange" @toDetails="toDetails" ref="untasklist" :style="{'display':0==TabCur?'':'none'}"></un-task-list>
				</template>
				<template v-show="1==TabCur">
					<task-list @totalM="totalChange" @toDetails="toDetails" ref="tasklist" :style="{'display':1==TabCur?'':'none'}"></task-list>
				</template>
				<template v-show="2==TabCur">
					<msg-list @totalM="totalChange" :style="{'display':2==TabCur?'':'none'}"></msg-list>
				</template>
			</view>
		</template>
		<template >
			<view v-if="!spList">
				<scroll-view style="height:100vh;"  scroll-y="true" >
					<appdetailsp ref="appdetailsp" class="padding-top-xl margin-top-xl" @back="back"  @gorow="goRow"></appdetailsp>
				</scroll-view>
			</view>
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
	import UnTaskList from '@/components/bip-ui/bip-task/UnTaskList.vue';
	import TaskList from '@/components/bip-ui/bip-task/TaskList.vue';
	import MsgList from '@/components/bip-ui/bip-task/MsgList.vue';
	@Component({
		components: {
			TaskList,UnTaskList,appdetailsp,MsgList
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
			this.shTabs.push({name:"系统消息",total:0});
			this.spList = true;
		}
		mounted() {
			this.bok = true
		}
		tabSelect(e: any) {
			this.TabCur = e.currentTarget.dataset.id;
			// this.queryTaskInfo();
		}
		
		totalChange(total:number,type:any){
			let cur = this.shTabs[type];
			cur.total = total
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
			this.$emit("setShowBtn",true)
		}
		/**
		 * 关闭审批详情打开审批列表页
		 */
		back(){
			this.spList = true;
			this.$emit("setShowBtn",false)
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
