<template>
	<view v-if="d1" style="background-color: #ffffff;">
		<u-card class="bipListsMyList" padding="0">
			<view slot="head">
				<view class="title">{{d1.title}}</view>
			</view>
			<view slot="body">
				<view class="body">
					<u-cell-group v-for="(item,index) in listData" :key="index">
						<u-cell-item border-bottom :title="item.menuName" :label="item.message" @click="openMenu(item)" class="listItem" :title-style="{'font-size': '16px','color': '#000'}">
							<view slot="icon">
								<image :src="BaseUri+item.menuIcon" class="menuImg" mode="aspectFit"></image>
							</view>
						</u-cell-item>
					</u-cell-group>
				</view>
			</view>
		</u-card>
	</view>
</template>
<script lang="ts">
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import QueryEntity from '@/classes/search/QueryEntity';
	import {BIPUtil} from '@/classes/api/request';
	import CDataSet from '@/classes/pub/CDataSet';
	let tools = BIPUtil.ServApi;
	import URIParams from '@/classes/URIParams'
	import { Tools } from '@/classes/tools/Tools';
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import { dataTool } from '@/classes/tools/DataTools';
	const DataUtil = dataTool.utils;
	import CCliEnv from '@/classes/cenv/CCliEnv';
	@Component({
		components:{}
	})
	export default class BipCard extends Vue {
		@Prop({default:null}) layoutdata?:any;
		uriParams: URIParams = new URIParams();
		d1:any = null;
		listData:any=[];
		BaseUri:any ="";
		mounted() {
			this.BaseUri = commURL.BaseUri;
			let cc =this.BaseUri.charAt(this.BaseUri.length-1)
			if(cc != "/"){
				this.BaseUri +="/"
			}
			this.d1 = JSON.parse(this.layoutdata.content)
			let content = this.d1.content;
			this.initData(content);
		}
		async initData(menus:any){
			for(var i=0;i<menus.length;i++){
				let m1 = menus[i];
				let item = Tools.findMenu(m1.menuid);
				if(item){
					let num = await this.getMenuDataNum(item)
					let msg =  m1.message;
					msg= msg.replace(new RegExp("【num】",'gm'),num)
					item.message = msg
					this.listData.push(item);
				}
			}
		}
		/**
		 * 查询菜单数据条数
		 */
		async getMenuDataNum(item:any){
			let num = 0;
			let cc = item.command;
			let dd = cc.split("&");
			let pbuid = ''
			dd.forEach((aa:any)=>{
				let pbuids = aa.split('=')
				if(pbuids[0] == 'pbuid'){
					pbuid = pbuids[1]
				}
			})
			let mid = item.menuId;
			if(pbuid&&mid){
				let res = await tools.getMenuParams(pbuid,mid);
				let data = res.data
				if(data.id>=0){
					let uriParam:any = data.data.mparams
					res = await tools.getCCellsParams(uriParam.pcell);
					if(res.data.id >=0){
						let rtn = res.data;
						if (rtn.id == 0) {
							let qe = new QueryEntity('','');
							let cells = rtn.data.layCels;
							let dsm_cont = new CDataSet(cells[0]);
							let dsm = new CDataSet(cells[1]);
							qe.pcell = dsm.ccells.obj_id;
							qe.tcell = dsm_cont.ccells.obj_id;
							qe.oprid = 13;
							qe.type = 1
							let cr = DataUtil.createRecord(dsm_cont,new CCliEnv());
							let vl:any = cr.data;
							if(uriParam.pbds.ptran){
								let ptran = uriParam.pbds.ptran;
								ptran = ptran.split("&")
								for(var i=0 ; i< ptran.length;i++){
									let cc = ptran[i].split("=");
									vl[cc[0]] = cc[1];
								}
							}
							if(Object.keys(vl).length>0){
								qe.cont = vl;
							}else {
								qe.cont = '';
							}
							if(uriParam.pbds.polnk){
								qe.polnk = uriParam.pbds.polnk;
							}
							qe.page.currPage = 1
							qe.page.pageSize = 1
							res = await tools.query(qe);
							if(res.data.id >=0){
								let page = res.data.data.data.page;
								num = page.total;
							}
						}
					}
				}
			}
			return num;
		}

		/**
		 * 打开菜单
		 */
		openMenu(item:any){
			let index = parseFloat((Math.random()*10).toFixed(0));
			let cuIconList = [{
					cuIcon: 'cardboardfill',
					color: 'blue',
				}, {
					cuIcon: 'recordfill',
					color: 'orange',
				}, {
					cuIcon: 'picfill',
					color: 'yellow',
				}, {
					cuIcon: 'noticefill',
					color: 'olive',
				}, {
					cuIcon: 'upstagefill',
					color: 'cyan',
				}, {
					cuIcon: 'clothesfill',
					color: 'blue',
				}, {
					cuIcon: 'discoverfill',
					color: 'purple',
				}, {
					cuIcon: 'questionfill',
					color: 'mauve',
				}, {
					cuIcon: 'commandfill',
					color: 'purple',
				}, {
					cuIcon: 'brandfill',
					color: 'mauve',
				}]
			let cr = cuIconList[index%10].color;
			let vm:any = Object.assign(item);
			vm.color = cr;
			Tools.openMenu(vm)
		}
	}
</script> 
<style lang="scss" scoped>
.menuImg{
	width: 48px;
	height: 48px;
    margin-top: 10px;
}
.bipListsMyList{
	margin: 10px !important;
}
.listItem{
	padding: 6px 0px !important;
}
.title{
	font-size: 30rpx;
	color:rgb(114, 114, 114);
	padding:15px;
	border-bottom: 1px solid #a2a2a254;
}
.body{
	padding: 4px 8px;
}
</style>