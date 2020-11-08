<template>
	<view>
		<view style="float: left;">
			<cu-custom :bgColor="'bg-' + cr" :isBack="true" :cusBack="true" @back="back">
				<block slot="backText">返回</block>
				<block slot="content">
					<view class="header-title">{{ title }}->审批</view>
				</block>
			</cu-custom>
		</view>
		<template v-if="initUIOK && dsm.currRecord.data">
			<view class="margin-lr-sm margin-tb-sm">
				<bip-lay v-if="lay.binit" :layout="lay"></bip-lay>
				<view class="padding-bottom-xl margin-bottom-xl"></view>
			</view>
			<bip-work ref="work" @checkOK="checkOK"></bip-work>
			<bip-work-process ref="workProcess"></bip-work-process>
		</template>
		<mLoad v-if="loading" :png="'/static/gs.png'" :msg="'加载中...'"></mLoad>
		<template v-if="mbs.initOK">
			<!-- <bip-menu-bar @tabSelect="execCmd"></bip-menu-bar> -->
			<bip-bill-bar @tabSelect="execCmd" :attr="2" :bmore="true"></bip-bill-bar>
		</template>
		<template v-if="canUp ==true || canNext == true">
			<div class="hover-left-css">
				<button class="cu-btn cuIcon bg-blue" :disabled="!canUp"  @click="gotPrevious">
					<text class="cuIcon-back"></text>
				</button>
			</div>
			<div class="hover-right-css">
				<button class="cu-btn cuIcon bg-blue" :disabled="!canNext"  @click="goNext">
					<text class="cuIcon-right"></text>
				</button>
			</div>
		</template>
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

import CeaPars from "@/classes/cenv/CeaPars";
@Component({
	components: { mLoad, bipLay, bipMenuBar, bipBillBar , BipWork ,BipWorkProcess}
})
export default class appDetailSp extends Vue {
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

	canNext:boolean = false;
	canUp:boolean = false;
	rowIndex:any = 0;
	
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
		let cr = this.dsm.currRecord;
		tools
			.saveData(cr, this.uriParam.pcell, this.uriParam.pbuid)
			.then((res: any) => {
				console.log(res);
				let rtn = res.data;
				if (rtn.id == 0) {
					let vv = rtn.data;
					Object.keys(vv).forEach((key:string)=>{
						console.log(vv[key],key)
						this.dsm.cellChange(vv[key],key);
						let methordKey =this.dsm.ccells.obj_id+"_"+key
						uni.$emit(methordKey)
					})
					this.dsm.setState(icl.R_POSTED);
					uni.showToast({title:'保存成功！'});
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
						this.cea.bcust = data.bcust
						this.dsm.ceaPars = this.cea
                        work.open(data,this.cea,smakefld);
                    }
                }).catch((err:any)=>{
					uni.showToast({
						title: err+";appDetailSp submint",
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
	/**
	 * 更新审批图片信息
	 */
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
				console.log(infos)
				let cds = this.env.getDataSet(objid);
				infos.data.forEach((cr:any)=>{
					cds.addRecord(cr);
				})
				let crd = cds.currRecord;
				if(crd != null && cds.opera){
					let params = {
						sid: crd.data[cds.opera.pkfld],
						sbuid: crd.data[cds.opera.buidfld],
						statefr: crd.data[cds.opera.statefld],
						stateto: crd.data[cds.opera.statefld],
						sorg:crd.data[cds.opera.sorgfld],
						spuserId: ""
					}  
					this.cea = new CeaPars(params);
					this.dsm.ceaPars = this.cea; 
					this.changeStateImg();
				}
			}else{
				console.log(rr)
			}
			this.loading = false;
		});
		console.log('findData');

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

	show(option:any){
		if (option.pbuid) {
			this.initUIOK = false;
			this.cr = option.color ? option.color : 'blue';
			this.title = option.title ? option.title : 'billPage';
			this.pbuid = option.pbuid;
			this.uriParam = JSON.parse(uni.getStorageSync(this.pbuid));
			if(option.qcont){
				this.qcont = decodeURIComponent(option.qcont);
			}
			this.loading = true;
			if (this.uriParam) {
				tools
					.getCCellsParams(this.uriParam.pcell)
					.then((res: any) => {
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
			this.canNext = option.canNext;
			this.canUp = option.canUp;
			this.rowIndex = option.rowId
		}
	}

	back(){
		this.$emit("back")
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
		this.uriParam.pattr = 836;//查询，保存，审批，审核
		this.mbs.init(this.uriParam.pattr, this.dsm);
		this.env.initInfo(this.uriParam, this.cells, this.mbs, this.dsm, this.ds_ext);
		this.lay = new BipLayout(this.uriParam.playout, this.cells);
		this.initUIOK = true;
		// this.qe.mcont = ''+this.qcont;
		// await this.findData()
	}
	//下一条
    goNext(){
		let rowId = this.rowIndex+ 1
      	this.$emit('gorow',rowId);
    }
    //上一条
    gotPrevious(){
		let rowId = this.rowIndex - 1
      	this.$emit('gorow',rowId);
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
.hover-right-css{
  width:100upx;
  height:100upx;
  position:fixed;/*fixed总是以body为定位时的对象，总是根据浏览器的窗口来进行元素的定位，通过"left"、 "top"、 "right"、 "bottom" 属性进行定位。*/
  right:0px;/*设置与右侧的距离*/
  bottom:50%;/*设置与底部的距离*/
  z-index:100;/*设置显示次序，数字越大显示越靠前*/
}
.hover-left-css{
  width:100upx;
  height:100upx;
  position:fixed;/*fixed总是以body为定位时的对象，总是根据浏览器的窗口来进行元素的定位，通过"left"、 "top"、 "right"、 "bottom" 属性进行定位。*/
  left:32upx;/*设置与右侧的距离*/
  bottom:50%;/*设置与底部的距离*/
  z-index:100;/*设置显示次序，数字越大显示越靠前*/
}

</style>
<style lang="scss" >
.my-cu-custom-height{
	height: 0px !important;
	.cu-custom{
		height: 0px !important;
	}
}
</style>
