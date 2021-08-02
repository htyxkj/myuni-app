<template>
	<view>
		<cu-custom :bgColor="'bg-' + cr" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">{{ title }}</view></block>
		</cu-custom>
		<bip-list-unit2 v-if="dataInitOk" :record="cell.currRecord" :cels="cell.ccells.cels"  :obj_id="cell.ccells.obj_id" :showList="false"></bip-list-unit2>
		<template v-else>
			<u-card :title="title">
				<view class="" slot="body">
					<view class="u-body-item u-flex u-border-bottom u-col-between u-p-t-0">
						<view class="u-body-item-title u-line-4">
							点击屏幕按钮或手柄按键对标签数据进行读取
						</view>
						<u-button style="width:70%;margin-top: 80px;" type="primary" shape="square" ripple @click="initRFIDData">读取信息</u-button>
					</view>
				</view>
			</u-card>
		</template>
		<mLoad :png="null" :msg="'加载中...'" v-if="loadModal"></mLoad>
		<u-modal v-model="showMessage" :content="message"></u-modal>
	</view>
</template>

<script lang="ts">
	/**
	 * 育种平台 档案查询 RFID 
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
    import { Tools } from '@/classes/tools/Tools';
	import QueryEntity from '@/classes/search/QueryEntity';
    import CCliEnv from '@/classes/cenv/CCliEnv';
    import CDataSet from '@/classes/pub/CDataSet';
    import mLoad from '@/components/mLoad.vue';
	import bipListUnit2 from '@/components/bip-ui/bip-unit/bip-list-unit2.vue';
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	import URIParams from '@/classes/URIParams';
    import BipMenuBar from '@/classes/pub/BipMenuBar';
	@Component({
		components: {mLoad,bipListUnit2}
	})
	export default class BreedingFileRead extends Vue {
		title: string = '';
		cr: string = '';
		cellId:string = "720310WEBRFID";
		cell:CDataSet = new CDataSet("");//对象
		loadModal:boolean = false;
		dataInitOk:boolean = false;
		showMessage:boolean = false;
		message = "";
        @Provide('env') env: CCliEnv = new CCliEnv();
		async onLoad(option: any) {
			//#ifdef APP-PLUS
				Tools.removeKeydown(null);
				Tools.oPowerUpOrDown(true);
				Tools.initKeydown(139,this.initRFIDData);
			//#endif
			this.cr = option.color ? option.color : 'blue';
			this.title = option.title ? option.title : 'billPage';
			this.cell = await Tools.getCell(this.cellId);
			this.env.initInfo(new URIParams(), [this.cell.ccells], new BipMenuBar(), this.cell, [this.cell]);
		}
		async initRFIDData(){
			this.loadModal = true;
			setTimeout(()=>{
				Tools.rfidReadCard({},(e:any)=>{
					if(e.id ==0){
						this.getData(e.value)
					}else{
						this.loadModal = false;
					}
				})
			},300)
		}
		async getData(ids:any){
			this.dataInitOk = false;
			let earnumb = "";
			if(ids.length>0){
				earnumb = ids[0];
			}else{
				this.message = "未读到标签！";
				this.showMessage = true;
				return;
			}
			let qe: QueryEntity = new QueryEntity(this.cellId, this.cellId);
			qe.page.pageSize=1;
			qe.cont = "{'earnumb':'"+earnumb+"'}";
			qe.oprid = 13;
			let res = await tools.query(qe); 
			if(res.data.id ==0){
				let data =  res.data.data.data.data;
				if(!data || data.length ==0){
					this.message = "未查询到档案信息！"
					this.showMessage = true;
				}else{
					this.cell.currRecord = data[0]
					this.dataInitOk = true;
				}
			}else{
				this.message = res.data.message;
				this.showMessage = true;
			}
			this.loadModal = false;
		}
		onUnload(){
			//#ifdef APP-PLUS
				Tools.oPowerUpOrDown(false);
				Tools.removeKeydown(null);
			//#endif
		}
	}
</script>
<style scoped>
	.page {
		height: 100vh;
		background-color: rgb(247, 247, 247)
	}
	.remark{
		color: #D3D3D3;
		font-size: 20upx;
	}
	.name{
		color: #1C1C1C;
		font-size: 32upx;
	}
	.myimg{
		width: 90upx; 
		height: 90upx;
		background-color: #FFFFFF;
	}
</style>