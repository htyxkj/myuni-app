<template>
	<view>
		<cu-custom :bgColor="'bg-' + cr" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">{{ title }}</view></block>
		</cu-custom>		
		<view class="margin-lr-sm margin-tb-sm">
			<bip-lay v-if="lay.binit" :layout="lay" :key="'-1'"></bip-lay>
			<bip-work-approver-set v-if="bcust" :dsm="dsm" class="margin-tb-sm" @custSelUserOk="custSelUserOk"></bip-work-approver-set>
			<view class="padding-xl margin-xl"></view>
			<view class="padding-xs margin-xs"></view>
			<bip-work ref="work" @checkOK="checkOK"></bip-work>
		</view>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
		<template v-if="mbs.initOK">
			<!-- <bip-menu-bar @tabSelect="execCmd"></bip-menu-bar> -->
			<bip-bill-bar @tabSelect="execCmd" :attr="3" :bmore="true"></bip-bill-bar>
		</template>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Component } from 'vue-property-decorator';
import mLoad from '@/components/mLoad.vue';
import bipLay from '@/components/bip-ui/bip-lay/bip-lay.vue'
import uniCard from '@/components/uni-ui/uni-card/uni-card.vue'
import bipMenuBar from '@/components/bip-ui/bip-menu-bar/bip-menu-bar.vue'
import bipBillBar from '@/components/bip-ui/bip-menu-bar/bip-bill-bar.vue'
import BipWork from  '@/components/cwork/BipWork.vue';
import BipWorkApproverSet from  '@/components/cwork/BipWorkApproverSet.vue';

import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;

import URIParams from '@/classes/URIParams';
import Cells from '@/classes/pub/coob/Cells';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv';
import BipMenuBar from '@/classes/pub/BipMenuBar';
import BipLayout from '@/classes/ui/BipLayout';
import { Tools } from '../../classes/tools/Tools';
import { icl } from '../../classes/tools/CommICL';

import {dataTool} from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils
import CeaPars from "@/classes/cenv/CeaPars";
@Component({
	components: { mLoad,bipLay,bipMenuBar,bipBillBar,uniCard,BipWork,BipWorkApproverSet}
})
export default class appInfo extends Vue {
	vueId: string = Tools.guid();
	cr: string = 'blue';
	title: string = '单据页面';
	pbuid:string = '';
	loading: boolean = false;
	uriParam: URIParams = new URIParams();
	@Provide('env') env: CCliEnv = new CCliEnv();
	@Provide('mbs') mbs: BipMenuBar = new BipMenuBar();
	//主对象数据集
	dsm: CDataSet = new CDataSet(null);
	//条件对象数据集
	dsm_cont: CDataSet = new CDataSet(null);
	//其他对象数据集
	ds_ext: Array<CDataSet> = Array<CDataSet>();
	//界面组成对象信息
	cells: Array<Cells> = new Array<Cells>();
	lay: BipLayout = new BipLayout('');

	cea:CeaPars = new CeaPars({});
	
	bcust:boolean = false;//自定义审批流
	bcustSPUser:any =[];//自定义审批流审批人员
	bcustCSUser:any = [];//自定义审批流审批结束抄送人员

	execCmd(btn: any) {
		let cmd = btn.cmd;
		if(cmd == icl.B_CMD_ADD){
			this.addNewCRecord();
		}
		if(cmd == icl.B_CMD_SAVE){
			this.saveData();
		}
		if(cmd == icl.B_CMD_COPY){
			this.copyCRecord()
		}
		if (cmd == icl.B_CMD_DEL) {
			let candel = this.dsm.canDel()
			if(candel){
				this.deleteRecord();
			}
		}
		if(cmd == icl.B_CMD_SUBMIT){
			this.submint();
		}
	}

	deleteRecord(){
		let c0 = this.dsm.currRecord;
		if((c0.c_state&1)>0){
			return ;
		}
		//如果当前选中的可以删除
		uni.showModal({
			title: '删除提示',
			content: '确定删除当前行数据吗?',
			cancelText: '取消',
			confirmText: '确定',
			success: res => {
				if (res.confirm) {
					//删除当前行数据
					console.log('delete curr row', this.dsm.currRecord);
					this.dsm.currRecord.c_state = 4;
					let cr = this.dsm.currRecord;
					tools.saveData(cr,this.uriParam.pcell, this.uriParam.pbuid).then((res:any)=>{
						let rtn = res.data;
						if(rtn.id==0){
							let idx = this.dsm.cdata.data.findIndex((item:any)=>{
								return item == cr;
							});
							this.dsm.removeRecord(cr);
							uni.showToast({title:'删除成功！'});
							this.addNewCRecord();
						}else{
							uni.showToast({title:rtn.message});
						}
					})
				}
			}
		});
	}

	addNewCRecord(){
		let c0 = this.dsm.currRecord;
		if((c0.c_state&1)>0||(c0.c_state&2)>0){
			uni.showToast({icon:"none",title:'请保存当前数据，然后在添加'});
			return ;
		}
		let cr = DataUtil.createRecord(this.dsm,this.env);
		this.dsm.addRecord(cr);
		DataUtil.checkGS(this.dsm,this.env)
		this.initCea();
	}

	copyCRecord(){
		let c0 = this.dsm.currRecord;
		if((c0.c_state&1)>0||(c0.c_state&2)>0){
			uni.showToast({icon:"none",title:'请保存当前数据，然后在拷贝'});
			return ;
		}
		let cr = DataUtil.copyRecord(this.dsm,this.env);
		this.dsm.addRecord(cr);
	}

	saveData() {
		let bk:any = this.dsm.checkNotNull();
		if(!bk[0]){
			uni.showToast({title:bk[1],icon:"none"});
			return ;
		}
		if(this.bcust){//自定义审批流 判断是否添加审批人员
			if(this.bcustSPUser.length == 0){
				uni.showToast({title:"审批人未定义",icon:"none"});
				return;
			}
		}
		let cr = this.dsm.currRecord;
		if((cr.c_state & icl.R_EDITED) > 0){
			tools
				.saveData(cr, this.uriParam.pcell, this.uriParam.pflow)
				.then((res: any) => {
					console.log(res);
					let rtn = res.data;
					if (rtn.id == 0) {
						let vv = rtn.data;
						let ks = Object.keys(vv);
						for(var i=0;i<ks.length;i++){
							this.dsm.cellChange(vv[ks[i]],ks[i]);
							let methordKey =this.dsm.ccells.obj_id+"_"+ks[i]
							uni.$emit(methordKey)
						}
						this.dsm.setState(icl.R_POSTED);
						uni.showToast({title:'保存成功！'});
						this.saveBCustUsers();
					}
				})
				.catch((e: any) => {
					console.log(e);
				});
		}
	}
	/**
     * 审批流提交
     */
    submint(){
        if(this.dsm.opera){
            if(this.dsm.isPosted()){
                //可以提交
                let crd = this.dsm.currRecord
                let params = {
                    sid: crd.data[this.dsm.opera.pkfld],
                    sbuid: crd.data[this.dsm.opera.buidfld],
                    statefr: crd.data[this.dsm.opera.statefld],
                    stateto: crd.data[this.dsm.opera.statefld],
                    sorg:crd.data[this.dsm.opera.sorgfld],
                    spuserId: ""
                }  
                this.cea = new CeaPars(params)
                tools.getCheckInfo(this.cea,33).then((res:any)=>{
                    if(res.data.id==0){
                        let data = res.data.data.info
                        let work:any = this.$refs.work;
                        let smakefld:string='';
                        if(this.dsm.opera){
                            if(this.dsm.opera.smakefld){
                                smakefld = crd.data[this.dsm.opera.smakefld];
                            }
                        }
                        this.dsm.ceaPars = this.cea
                        work.open(data,this.cea,smakefld);
                    }
                }).catch((err:any)=>{
					uni.showToast({
						title: err+";BaseApplet submint",
						icon:"none"
					})
                }).finally(()=>{

                });
			}
        }
        if(!this.dsm.isPosted()){
			uni.showToast({
				title: '请先保存数据！',
				icon:"none"
			})
        }
	}
	checkOK(state:number|string){
        let i = this.dsm.i_state;
        if(i>-1){
			this.dsm.currRecord.data[this.dsm.ccells.cels[i].id] = state
			uni.$emit(this.dsm.ccells.obj_id+"_"+this.dsm.ccells.cels[i].id)
		}
	}
	
	async onLoad(option: any) {
		if (option.pbuid) {
			this.cr = option.color ? option.color : 'blue';
			this.title = option.title ? option.title : 'billPage';
			this.pbuid = option.pbuid;
			this.uriParam = JSON.parse(uni.getStorageSync(this.pbuid));
			if(this.uriParam){
				this.loading = true;
				await tools
					.getCCellsParams(this.uriParam.pcell)
					.then((res: any) => {
						// console.log(res);
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
	//初始化审批流信息 查询是否是自定义审批流
	initCea(){
		if(this.dsm && this.dsm.opera){
			let crd = this.dsm.currRecord
			let params = {
				sid: crd.data[this.dsm.opera.pkfld],
				sbuid: crd.data[this.dsm.opera.buidfld],
				statefr: crd.data[this.dsm.opera.statefld],
				stateto: crd.data[this.dsm.opera.statefld],
				sorg:crd.data[this.dsm.opera.sorgfld],
				spuserId: ""
			}  
			this.cea = new CeaPars(params)
			tools.getCheckInfo(this.cea,33).then((res:any)=>{
				if(res.data.id == 0){
					this.bcust = res.data.data.info.bcust;
				}
			}).catch((err:any)=>{
				uni.showToast({
					title: err+";BaseApplet submint",
					icon:"none"
				})
			}).finally(()=>{

			});
		}
	}
	//自定义审批流勾选完人
	custSelUserOk(res:any){
		if(res){
			if(res.type == 0){
				this.bcustSPUser =  res.users
			}else {
				this.bcustCSUser =  res.users
			}
		}
	}
	//保存自定义审批人抄送人
	async saveBCustUsers(){
		if(this.dsm && this.dsm.opera ){ 
			let crd = this.dsm.currRecord
			let params = {
				sid: crd.data[this.dsm.opera.pkfld],
				sbuid: crd.data[this.dsm.opera.buidfld],
				bcustCSUser:this.bcustCSUser,
				bcustSPUser:this.bcustSPUser,
			}  
			tools.saveBCustUser(params,50).then((res:any)=>{
				if(res.data.id==0){
					
				}
				console.log(res)
			}).catch((err:any)=>{
				uni.showToast({
					title: err+";BaseApplet saveBCustUsers",
					icon:"none"
				})
			}).finally(()=>{

			});
		}else{
			console.log("DSM 数据缺失")
		}
	}
	async initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm = new CDataSet(this.cells[0]);
		this.dsm_cont = new CDataSet(this.cells[0]);
		for (let i = 1; i < this.cells.length; i++) {
			this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
		}
		let buid = this.uriParam.pflow
		await tools.getBULinks(buid).then((res:any)=>{
			let rtn1 = res.data;
			if(rtn1.id==0){
				let ope = rtn1.data.opt;
				this.dsm.opera = ope;
				this.dsm.initContrlIndex();
			}
		});
		
		
		
		this.mbs.init(this.uriParam.pattr, this.dsm);
		this.env.initInfo(this.uriParam, this.cells, this.mbs, this.dsm, this.ds_ext);
		this.lay = new BipLayout(this.uriParam.playout, this.cells);
		setTimeout(()=>{
			this.addNewCRecord();
		}, 100);
	}
}
</script>

<style lang="scss" scoped>
page{
	margin-bottom: 120upx;
}
</style>
