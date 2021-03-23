<template>
	<load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" :heightReduce="330" :pageNo="currPage" :totalPageNo="totalPage"
	 @loadMore="loadMore" @refresh="refresh">
	 <view slot="content-list">
	 	<bip-task-unit v-for="(item,index) in list" :key="index" :rowId="index" :record="item" :cells="cell" @toDetails="toDetails"></bip-task-unit>
	 </view>
	 <mLoad :msg="'加载中...'" v-if="loadModal"></mLoad>
	 <message ref="msg"></message>
	</load-refresh>
</template>

<script lang="ts">
    import { Vue, Provide, Prop, Component,Watch,Emit } from 'vue-property-decorator';
	// import bipUnit from '@/components/bip-ui/bip-unit/bip-unit.vue';
	import BipTaskUnit from './BipTaskUnit.vue'
	import loadRefresh from '@/components/load-refresh/load-refresh.vue';
	import {
		BIPUtil
	} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import mLoad from '@/components/mLoad.vue';
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import { Tools } from '@/classes/tools/Tools';
	@Component({components:{BipTaskUnit,mLoad,loadRefresh}})
	export default class TaskList extends Vue{
		currPage: number = 1;
		pageSize:number = 10;
		loadModal:boolean = false;
		totalPage: number = 0;
		total:number = 0;
		list:Array<any> = [];
		obj_id:string = 'INSSPLIST';
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
		async queryTaskInfo() {
			let dataStr = JSON.stringify({
				tousr: LoginModule.user.userCode
			});
			let qe: QueryEntity = new QueryEntity(this.obj_id, this.obj_id, dataStr);
			qe.page.currPage = this.currPage;
			await tools.query(qe).then((res: any) => {
				// console.log(res)
				let rtn = res.data;
				// console.log(rtn);
				if(rtn.id == 0){
					let page = rtn.data.data.page;
					// console.log(page,2222)
					this.currPage = page.currPage;
					this.total = page.total;
					this.pageSize = page.pageSize
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
			this.emitTotal(newVal,1);
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
		async goToRow(rowId:any){
			if(rowId >= this.currPage * this.pageSize){
				if(this.totalPage>this.currPage){
					this.currPage++;
					// console.log('查询第2也数据')
					await this.queryTaskInfo();
					// console.log(this.list.length)
				}
			}
			let record = this.list[rowId];
			let sbuid = record.data.buid;
			let sid = record.data.buno;

			//查询是否有 _YD 业务定义
			let res:any = await tools.getBULinks(sbuid+"_YD");
			if(res.data.id ==-1){
				res = await tools.getBULinks(sbuid);
			}
			if(res.data.id==0){
				let opt:any = res.data.data.opt;
				let mid = opt.pmenuid;
				let m0 = Tools.findMenu(mid);
				if(m0){
					let cmd = m0.command;
					let dd = cmd.split("&");
					let pbuid = ''
					let pmenuid =''
					dd.forEach((aa:any)=>{
						let pbuids = aa.split('=')
						if(pbuids[0] == 'pbuid'){
							pbuid = pbuids[1]
						}
						if(pbuids[0] == 'pmenuid'){
							pmenuid = pbuids[1];
						}
					});
					if(pbuid){
						tools.getMenuParams(pbuid,mid).then((res:any)=>{
							let data = res.data;
							if(data.id==0){
								let uriParams = data.data.mparams;
								uni.setStorageSync(pbuid,JSON.stringify(uriParams));
								let qcont = opt.pkfld+"='"+sid+"'";
								let con = {rowId:rowId,pbuid:pbuid,pmenuid:pmenuid,title:m0.menuName,qcont:encodeURIComponent(qcont)}
								this.toDetails(con);
							}
						}).catch((err:any)=>{
							console.log(err);
						});
					}
				}else{
					this.showErr('没有菜单权限！')
				}
			}else{
				let msg = res.data.message;
				//弹出提醒
				this.showErr(msg)
			}
		
		}
		showErr(err:string){
			let msg:any = this.$refs['msg'];
			msg.error({background: true,content:err})
		}
		@Emit('totalM')
		emitTotal(n: number,t:number){
		}
	}
</script>

<style>

</style>
