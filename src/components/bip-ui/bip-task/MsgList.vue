<template>
<view>
	<load-refresh v-if="check" ref="loadRefresh" :isRefresh="true" style="width：100%" :backgroundCover="'#F3F5F5'" :heightReduce="330" :pageNo="currPage" :totalPageNo="totalPage"
	@loadMore="loadMore" @refresh="refresh">
		<view slot="content-list">
			<u-swipe-action v-for="(item,index) in list" class="my-msg-swipe" :key="item.iid" :index="index" :options="options" @click="btnClick" @content-click="itemClick">
				<view class="item u-border-bottom message" style="width:100%">
					<view class="title-wrap">
						<u-row gutter="16">
							<u-col span="12">
								<text class="title u-line-1">{{ item.title }}</text>
							</u-col>
							<u-col span="12">
								<text class="content u-line-1">{{ item.content }}</text>
							</u-col>
						</u-row>
					</view>
				</view>
			</u-swipe-action>
		</view>
		<mLoad :msg="'加载中...'" v-if="loadModal"></mLoad>
		<message ref="msg"></message>
	</load-refresh>
	<u-popup mode="center" v-model="showDlg" closeable>
		<view class="content" v-if="showRow">
			<view class="dlgTitle">{{showRow.title}}</view>
			<scroll-view scroll-y="true" style="height: 300rpx;">
				<view class="dlgContent">
					{{showRow.content}}
				</view>
			</scroll-view>
			<view class="confrim-btn">
				<u-button @click="showRead">已读</u-button>
			</view>
		</view>
	</u-popup>
</view>
</template>

<script lang="ts">
    import { Vue, Provide, Prop, Component,Watch,Emit } from 'vue-property-decorator';
	import loadRefresh from '@/components/load-refresh/load-refresh.vue';
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import mLoad from '@/components/mLoad.vue';
	@Component({components:{mLoad,loadRefresh}})
	export default class MsgList extends Vue{
		currPage: number = 1;
		pageSize:number = 10;
		loadModal:boolean = false;
		totalPage: number = 0;
		total:number = 0;
		list:Array<any> = [];
		keyword:any = "";//关键字
		showDlg:boolean = false;
		showRow:any = null;
		showIndex:any = -1;
		@Prop() check!:boolean
		options:any = [
			{
				text: '已读',
				style: {
					backgroundColor: '#007aff'
				}
			}
		]
		async mounted(){
			this.loadModal = true;
			await this.queryTaskInfo(); 			 
			this.loadModal = false;
		}
		//查询服务端任务数据
		async queryTaskInfo() {
			let cc = await tools.getTaskMsgData(212,null,null,null,null,null,this.currPage,this.pageSize,this.keyword);
			console.log(cc);
			if(cc.data.id ==0){
				let page = cc.data.data.page;
				if(this.currPage==1){
					this.list = [];
				}
				if(page.celData){
					this.list = this.list.concat(page.celData); //追加新数据
				}
				this.total = page.totalItem 
			}
		}
		// 上划加载更多
		loadMore() {
			if(this.totalPage>this.currPage){
				this.currPage++;
				this.queryTaskInfo();
			}
			let lrf: any = this.$refs.loadRefresh;
			lrf.loadOver();
		}
		// 下拉刷新数据列表
		refresh() {
			this.currPage = 1;
			this.queryTaskInfo();
		}
		/**
		 * 已读 按钮点击
		 */
		async btnClick(index1:any, index:any){
			let row = this.list[index1]
			let cc = await tools.getTaskMsgData(213,row.iid,2,null,null,null,null,null,null);
			if(cc.data.id >=0){
				this.total = this.total -1;
				this.list.splice(index1,1)
			}
		}
		async showRead(){
			let cc = await tools.getTaskMsgData(213,this.showRow.iid,2,null,null,null,null,null,null);
			if(cc.data.id >=0){
				this.total = this.total -1;
				this.list.splice(this.showIndex,1)
			}
			this.showDlg = false;
		}
		//点击单条
		itemClick(index1:any){
			this.showRow = this.list[index1];
			this.showIndex = index1;
			this.showDlg = true;
		}
	
		@Watch('total', {immediate: true, deep: true})
		totalChange(newVal: number, oldVal: number){
			this.emitTotal(newVal,2);
		}
		/**
		 * 打开详情
		 */
		toDetails(cmd:any){
			cmd.total = this.total;
			cmd.canUp = true;
			cmd.canNext =true;
			if(cmd.rowId == 0 || this.total ==1){
				cmd.canUp = false;
			}
			if(cmd.rowId == this.total-1 || this.total ==1){
				cmd.canNext =false;
			}
			this.$emit("toDetails",cmd);
		}
		@Emit('totalM')
		emitTotal(n: number,t:number){
		}
	}
</script>
<style scoped>
.message{
	padding: 10px;
}
.title{
    font-size: 16px;
}
.dlgTitle{
	text-align: center;
    font-size: 20px;
    padding: 4px;
}
.dlgContent{
	padding: 8px;
}
</style>