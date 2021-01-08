<template>
	<view>
		<cu-custom :bgColor="'bg-' + cr" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content">
				<view class="header-title">{{ title }}->详情</view>
			</block>
		</cu-custom>
		<template v-if="initUIOK">
			<view class="margin-lr-sm margin-tb-sm">
				<bip-lay v-if="lay.binit" :layout="lay"></bip-lay>
				<bip-work-approver-set v-if="bcust" :dsm="dsm" class="margin-tb-sm"  @custSelUserOk="custSelUserOk"></bip-work-approver-set>
				<view class="padding-xl margin-xl"></view>
				<view class="padding-xs margin-xs"></view>
			</view>
			<bip-work ref="work" @checkOK="checkOK"></bip-work>
			<bip-work-process ref="workProcess"></bip-work-process>
		</template>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
		<template v-if="mbs.initOK">
			<!-- <bip-menu-bar @tabSelect="execCmd"></bip-menu-bar> -->
			<bip-bill-bar @tabSelect="execCmd" :attr="3" :bmore="true"></bip-bill-bar>
		</template>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
// import { UriPModule } from '@/store/module/uripm'; //导入vuex模块，自动注入
import mLoad from '@/components/mLoad.vue';
// import bipInput from '@/components/bip-ui/bip-input/bip-input.vue'
import bipLay from '@/components/bip-ui/bip-lay/bip-lay.vue';
// import uniCard from '@/components/uni-ui/uni-card/uni-card.vue'
import bipMenuBar from '@/components/bip-ui/bip-menu-bar/bip-menu-bar.vue';
import bipBillBar from '@/components/bip-ui/bip-menu-bar/bip-bill-bar.vue';
import BipWork from  '@/components/cwork/BipWork.vue';
import BipWorkProcess from  '@/components/cwork/BipWorkProcess.vue';
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
import QueryEntity from '@/classes/search/QueryEntity';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;

import CData from '@/classes/pub/CData';
import CeaPars from "@/classes/cenv/CeaPars";
@Component({
	components: { mLoad, bipLay, bipMenuBar, bipBillBar , BipWork, BipWorkProcess,BipWorkApproverSet}
})
export default class appDetail extends Vue {
	vueId: string = Tools.guid();
	cr: string = 'blue';
	title: string = '详情页面';
	pbuid:string = '';
	loading: boolean = true;
	qcont:string = '';
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
	qe: QueryEntity = new QueryEntity('', '');
	initUIOK:boolean = false;
	
	cea:CeaPars = new CeaPars({});
	bcust:boolean = false;//自定义审批流
	bcustSPUser:any =[];//自定义审批流审批人员
	bcustCSUser:any = [];//自定义审批流审批结束抄送人员
	
	execCmd(btn: any) {
		let cmd = btn.cmd;
		console.log(cmd);
		if (cmd == icl.B_CMD_DEL) {
			let candel = this.dsm.canDel()
			if(candel){
				this.deleteRecord();
			}
		}
		if (cmd == icl.B_CMD_SAVE) {
			this.saveData();
		}

		if(cmd == icl.B_CMD_ADD){
			this.addNewCRecord();
		}

		if(cmd == icl.B_CMD_COPY){
			this.copyCRecord()
		}

		if(cmd == icl.B_CMD_SUBMIT){
			this.submint();
		}
		
		if(cmd === icl.B_CMD_CHECK_PROCESS){
			this.checkProcess();
		}
	}
	/**
	 * 删除
	 */
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
						}else{
							uni.showToast({title:rtn.message});
						}
					})
				}
			}
		});
	}
	/**
	 * 新建
	 */
	addNewCRecord(){
		let c0 = this.dsm.currRecord;
		if((c0.c_state&1)>0||(c0.c_state&2)>0){
			uni.showToast({title:'请保存当前数据，然后在添加'});
			return ;
		}
		let cr = DataUtil.createRecord(this.dsm,this.env);
		this.dsm.addRecord(cr);
	}
	/**
	 * 复制
	 */
	copyCRecord(){
		let c0 = this.dsm.currRecord;
		if((c0.c_state&1)>0||(c0.c_state&2)>0){
			uni.showToast({title:'请保存当前数据，然后在拷贝'});
			return ;
		}
		let cr = DataUtil.copyRecord(this.dsm,this.env);
		this.dsm.addRecord(cr);
	}
	/**
	 * 保存
	 */
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
		tools.saveData(cr, this.uriParam.pcell, this.uriParam.pbuid)
			.then((res: any) => {
				console.log(res);
				let rtn = res.data;
				if (rtn.id == 0) {
					let vv = rtn.data;
					Object.keys(vv).forEach((key:string)=>{
						this.dsm.cellChange(vv[key],key);
						let methordKey =this.dsm.ccells.obj_id+"_"+key
						uni.$emit(methordKey)
					})
					this.dsm.setState(icl.R_POSTED);
					uni.showToast({title:'保存成功！'});
					if(this.bcust){
						this.saveBCustUsers()
					}
				}
			})
			.catch((e: any) => {
				console.log(e);
			});
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

	/**
	 * 审批流程查看
	 */
	async checkProcess(){
		if(this.dsm.opera){
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
 			let workProcess:any = this.$refs.workProcess;
			this.dsm.ceaPars = this.cea
			workProcess.open(this.cea);
        }
	}
	changeStateImg(){
		let crd = this.dsm.currRecord;
		if(crd != null && this.dsm.opera){
			let params = {
				sid: crd.data[this.dsm.opera.pkfld],
				sbuid: crd.data[this.dsm.opera.buidfld],
				statefr: crd.data[this.dsm.opera.statefld],
				stateto: crd.data[this.dsm.opera.statefld],
				sorg:crd.data[this.dsm.opera.sorgfld],
				spuserId: ""
			}  
			this.cea = new CeaPars(params);
			tools.getCheckInfo(this.cea,33).then((res:any)=>{
				if(res.data.id==0){
					let data = res.data.data.info
					let work:any = this.$refs.work;
					work.initStateImg(data);
				}
			});
		}
	}
	checkOK(state:number|string){
        let i = this.dsm.i_state;
        if(i>-1){
			this.dsm.currRecord.data[this.dsm.ccells.cels[i].id] = state
			uni.$emit(this.dsm.ccells.obj_id+"_"+this.dsm.ccells.cels[i].id)
			this.changeStateImg();
		}
    }
	//加载数据
	findData(objid:string = ''){
		this.loading = true;
		if(objid){
			this.qe.tcell = objid
			this.qe.oprid = this.qe.tcell === this.dsm.ccells.obj_id?13:16;

		}else{
			this.qe.tcell = this.dsm.ccells.obj_id;
			this.qe.oprid = 13;
		}
		tools.query(this.qe).then((res:any)=>{
			let rr = res.data;
			if(rr.id==0){
				let infos = rr.data.data;
				let cds = this.env.getDataSet(objid);
				infos.data.forEach((cr:any)=>{
					cds.addRecord(cr);
				})
				//处理二次初值
				this.secondAssignment(cds);
				let crd = cds.currRecord;
				if(crd != null && cds.opera){
					let params = {
						sid: crd.data[cds.opera.pkfld],
						sbuid: crd.data[cds.opera.buidfld],
						statefr: crd.data[cds.opera.statefld],
						stateto: crd.data[cds.opera.statefld],
						spuserId: ""
					}  
					this.cea = new CeaPars(params);
					this.dsm.ceaPars = this.cea;
					this.changeStateImg();
					this.initCea();
				}
			}
			this.getChildData();
			this.loading = false;
		});
		console.log('findData');
	}
	    /**
     * 获取当前主表对应的子表信息
     */
    async getChildData(){
        if(this.dsm.ds_sub && this.dsm.ds_sub.length>0){
			let qq =JSON.parse(JSON.stringify(Object.assign({},this.qe)));
			qq.cont = this.dsm.currRecord.data;
			let res:any = await tools.queryChild(qq);
			if(res.data.id == 0){
				let data = res.data;
				let vv:CData = data.data.data;
				let child = vv.data[0].subs;
				for(var z=0;z<child.length;z++){
					let cd :CData = this.initCData(child[z])
					cd.page.currPage =1;
					cd.page.total = cd.data.length
					for(var j=0;j<this.dsm.ds_sub.length;j++){
						if(this.dsm.ds_sub[j].cdata.obj_id == cd.obj_id){
							this.dsm.currRecord.subs[j] = cd;
						}
					}
				}
			}
			this.setSubData();
        }
	}
	setSubData(){
        let n = this.dsm.ds_sub.length
        for(let i=0;i<n;i++){
            let cds1 = this.dsm.ds_sub[i]
            for(let j=0;this.dsm.currRecord.subs&&j<this.dsm.currRecord.subs.length;j++){
                let oneSubs:any = this.dsm.currRecord.subs[j]
                if(oneSubs.obj_id == cds1.ccells.obj_id){
                    let vals = oneSubs.data;
                    if(oneSubs){
                        cds1.clear();
                        cds1.setCData(oneSubs)
                    }
                }
            }
        }
    }
	initCData(vv:CData){
        let cd :CData = new CData('');
        cd.data = vv.data
        cd.page = vv.page
        cd.obj_id = vv.obj_id
        vv.data.forEach((item,index)=>{
            if(item.subs.length>0){
                item.subs.forEach((icd,index)=>{
                    let cc:CData = this.initCData(icd)
                    item.subs[index] = cc;
                })
            }
        })
        return cd;
	}
	//处理二次初值
	secondAssignment(cds:any){
		if(cds){
			let cr = DataUtil.createRecord(this.dsm,this.env);
			let cels = cds.ccells.cels;
			for(let i=0;i<cels.length;i++){
				let cel = cels[i];
				let cc = Tools.bitOperation(cel.attr,0x100000000);
            	if(cc >0 && !cds.currRecord.data[cel.id]){//二次初值
					cds.currRecord.data[cel.id] = cr.data[cel.id];
				}
			}
		}
	}
	mounted(){
		this.loading = false;
	}
	//页面加载
	onLoad(option: any) {
		if (option.pbuid) {
			this.cr = option.color ? option.color : 'blue';
			this.title = option.title ? option.title : 'billPage';
			this.pbuid = option.pbuid;
			this.uriParam = JSON.parse(uni.getStorageSync(this.pbuid));
			// console.log(this.uriParam,'999999')
			// console.log(option.qcont)
			if(option.qcont){
				this.qcont = decodeURIComponent(option.qcont);
			}
			// console.log(this.qcont)
			this.loading = true;
			if (this.uriParam) {
				tools
					.getCCellsParams(this.uriParam.pcell)
					.then((res: any) => {
						// console.log(res);
						this.loading = false;
						let rtn = res.data;
						if (rtn.id == 0) {
							this.qe.pcell = this.uriParam.pcell;
							this.initUIData(rtn.data.layCels);							
						} else {
							uni.showToast({
								title: '没有获取到对象定义' + this.uriParam
							});
						}
					})
					.catch((err: any) => {
						this.loading = false;
						console.log(err);
					});
			}
		}
	}

	async initUIData(layCels: any) {
		this.cells = layCels;
		this.dsm = new CDataSet(this.cells[0]);
		this.dsm_cont = new CDataSet(this.cells[0]);
		for (let i = 1; i < this.cells.length; i++) {
			this.ds_ext[i - 1] = new CDataSet(this.cells[i]);
		}
		let buid = this.uriParam.pflow;
		await tools.getBULinks(buid).then((res: any) => {
			let rtn1 = res.data;
			if (rtn1.id == 0) {
				let ope = rtn1.data.opt;
				this.dsm.opera = ope;
				this.dsm.initContrlIndex();		
			}
		});

		this.mbs.init(this.uriParam.pattr, this.dsm);
		this.env.initInfo(this.uriParam, this.cells, this.mbs, this.dsm, this.ds_ext);
		this.lay = new BipLayout(this.uriParam.playout, this.cells);
		this.initUIOK = true;
		console.log(this.uriParam.playout,this.qcont,'99999999')
	}
	//初始化审批流信息 查询是否是自定义审批流
	initCea(){
		if(this.dsm){
			tools.getCheckInfo(this.dsm.ceaPars,33).then((res:any)=>{
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
				if(res.data.id ==-1){
                	let msg:any = this.$refs['msg'];
					msg.error({background: true,content:"保存审批人，抄送人出错！"})
				}
			}).catch((err:any)=>{
				console.log(err)
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


	@Watch('initUIOK')
	initUIOKChange(){
		if(this.initUIOK&&this.qcont){
			this.qe.mcont = ''+this.qcont;
			this.$nextTick(()=>{
				this.findData();
			})
		}
	}
}
</script>

<style scoped>
page {
	margin-bottom: 120upx;
}
</style>
