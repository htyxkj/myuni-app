<template>
	<view>
		<cu-custom id="customId" :bgColor="'bg-' + cr" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">{{ title }}</view></block>
		</cu-custom>
		<template v-if="isInitData">
			<view>
				<scroll-view :scroll-y="true" :style='"height:"+scrollHeight+"px"'>
					<bip-list-unit2 v-if="isInitData" :record="dsm.currRecord" :cels="dsm.ccells.cels"  :obj_id="dsm.ccells.obj_id" :showList="false"></bip-list-unit2>
					
					<view class="padding-bottom-xl margin-bottom"></view>
				</scroll-view>
			</view>
		</template>
		<template v-if="mbs.initOK">
			<bip-bill-bar @tabSelect="execCmd" :attr="0" :bmore="true"></bip-bill-bar>
		</template>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
		<bip-menu-btn-dlg ref="bip_dlg" @Recheck="Recheck"></bip-menu-btn-dlg>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import mLoad from '@/components/mLoad.vue';
import BipMenuBtnDlg from '@/components/bip-ui/bip-dlg/BipMenuBtnDlg.vue';
import bipListUnit2 from '@/components/bip-ui/bip-unit/bip-list-unit2.vue';
import bipBillBar from '@/components/bip-ui/bip-menu-bar/bip-bill-bar.vue';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi; 
import {BipMenuBtn} from '@/classes/BipMenuBtn'
import URIParams from '@/classes/URIParams';
import Cells from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv';
import BipMenuBar from '@/classes/pub/BipMenuBar';
import BipLayout from '@/classes/ui/BipLayout';
import QueryEntity from '@/classes/search/QueryEntity';
import { Tools } from '../../classes/tools/Tools';
import { icl } from '../../classes/tools/CommICL';

import {dataTool} from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils
@Component({
	components: { mLoad,bipListUnit2,bipBillBar,BipMenuBtnDlg}
})
export default class appReportDetail extends Vue {
	vueId: string = Tools.guid();
	cr: string = 'blue';
	title: string = '报表页面';
	pbuid:string = '';
	loading: boolean = true;
	uriParam: URIParams = new URIParams();
	@Provide('env') env: CCliEnv = new CCliEnv();
	@Provide('mbs') mbs: BipMenuBar = new BipMenuBar();
	//主对象数据集
	dsm: CDataSet = new CDataSet(null);
	//条件对象数据集
	dsm_cont: CDataSet = new CDataSet(null);
	//界面组成对象信息
	cells: Array<Cells> = new Array<Cells>();
	qe:QueryEntity = new QueryEntity('','');
	isInitData:boolean = false;//是否查询完数据
	
	scrollHeight:number = 600;
	execCmd(btn: any) {
		let cmd = btn.cmd;
		if(cmd == 'DLG'){
            if(!this.dsm.currRecord || !this.dsm.currRecord.data)
                return;
            let cc = JSON.stringify(this.dsm.currRecord.data);
            if(cc.length>2){
                setTimeout(() => {
                    let dia: any = this.$refs.bip_dlg;
                    dia.open(btn,this.cr); 
                }, 100);
            }
        }
	}

	async onLoad(option: any) {
		if (option.pbuid) {
			if(option.qcont){
				this.qe.cont = decodeURIComponent(option.qcont);
			}
			this.cr = option.color ? option.color : 'blue';
			this.title = option.title ? option.title : 'billPage';
			this.pbuid = option.pbuid;
			this.uriParam = JSON.parse(uni.getStorageSync(this.pbuid));
			if(this.uriParam){
				this.loading = true;
				await tools.getCCellsParams(this.uriParam.pcell)
					.then((res: any) => {
						this.loading = false;
						let rtn = res.data;
						if (rtn.id == 0) {
							this.initUIData(rtn.data.layCels);
						}else{
							uni.showToast({title:'没有获取到对象定义'+this.uriParam})
						}
					})
					.catch((err: any) => {
						this.loading = false;
						console.log(err);
					});
			}
		}
	}
	mounted(){
		uni.getSystemInfo({success:this.initScrollHeight})
	}
	// 初始化界面参数
	// 后台获取的cell信息
	async initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm_cont = new CDataSet(this.cells[0]);
		this.dsm = new CDataSet(this.cells[1]);
		this.qe.pcell = this.dsm.ccells.obj_id;
		this.qe.tcell = this.dsm_cont.ccells.obj_id;
		this.qe.oprid = 14;
        this.qe.type = 1 
		this.mbs.init(this.uriParam.pattr, this.dsm,true);
		this.initDlgBtn();
		this.getListDataFromNet(1,1,null,null)
	}
	//查询数据
	getListDataFromNet(pageNum: number, pageSize: number, successCallback: any, errorCallback: any) {
		this.qe.page.currPage = pageNum
		this.qe.page.pageSize = pageSize
		tools.query(this.qe).then((res:any)=>{
			let listData:Array<any> = [];
			let rtn = res.data;
			if(rtn.id==0){
				let vvr = rtn.data.data.data;
				this.qe.page = rtn.data.data.page;
				listData = vvr;
				this.dsm.currRecord = vvr[0]
				this.env.dsm = this.dsm;
			}
			this.loading = false;
			this.isInitData = true;
		}).catch((e:any)=>{
			this.loading = false;
			console.log("出错了！")
		})
	}
	//设置 高度
	initScrollHeight(item:any){
		this.scrollHeight = item.windowHeight
		const query = uni.createSelectorQuery().in(this); 
		let num =0;
		query.select('#customId').boundingClientRect(data => {
			if(num ==0){
				let height = data.height;
				if(height && height>0){
					this.scrollHeight -= height;
				}
			}
			num++
		}).exec();
	}

	/**
     * DLG 弹出框后重新查询
     */
    Recheck(){
		this.getListDataFromNet(1,1,null,null)
    }
	/**
     * 获取自定义按钮
     */
    async initDlgBtn(){
        if(this.uriParam){
            let name = "DLG."+this.uriParam.pbuid;
            let aidKey = name
			aidKey = icl.AID_KEYCL+aidKey;
			if(this.inProcess.get(aidKey)){
				let rnt:any = this.aidmaps.get(aidKey);
				if(!rnt){ 
					await InsAidModule.fetchInsAid({ id: 300, aid: name });
				}
			}else{
				await InsAidModule.fetchInsAid({ id: 300, aid: name });
			} 
			let dlg = this.aidmaps.get(aidKey);
			console.log(dlg)
            if(dlg && dlg.slink){ 
                let dlgBtn = dlg.slink.split("&")
                dlgBtn.forEach((item:any) => {
                    let cc = item.substring(0,item.indexOf(";")); 
                    let type = cc.substring(0,1);
                    let bname = cc.substring(2,item.indexOf(","));  
                    let btn1 = new BipMenuBtn("DLG",bname)
                    btn1.setDlgType(type)
                    btn1.setDlgSname(name);
                    btn1.setDlgCont(item.substring(item.indexOf(";")+1))
                    this.mbs.menuList.push(btn1)
                });
            }
        }
	} 
	get aidmaps(){
		return InsAidModule.aidInfos;
	}
	get aidValues(){
		return InsAidModule.aidValues;
	}
	get inProcess(){
		return InsAidModule.inProcess;
	}
}
</script>

<style lang="scss">
</style>
