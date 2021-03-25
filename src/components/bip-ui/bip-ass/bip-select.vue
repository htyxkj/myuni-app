<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell && !noLable">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{ cell.labelString }}</view>
		</template>
		<input :placeholder="cell.labelString" type="text" v-model="mode" disabled="true" @tap.stop="open()"/>
		<text :class="['cuIcon-searchlist', 'text-progress','text-bold']" @tap.stop="open()"></text>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch,Inject } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import CRecord from '@/classes/pub/CRecord';
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import BipInsAidNew from '@/classes/BipInsAidNew';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
@Component({})
export default class bipSelect extends Vue {
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Boolean }) noLable!: boolean;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({ type: Object }) bipInsAid!:BipInsAidNew;
	@Prop({type:String}) obj_id!:string;
	index: number = 0;
	mode: string = '';
	modekey: string = '';
	editName: string = '';
	methordName:string = '';
	refKey = '';
	refInsAid:BipInsAidNew = new BipInsAidNew("")
	aidKey = ''
	cds:CDataSet = new CDataSet(null)

	mulcols: boolean = false;//是否是多列
    othCols: Array<string> = [];//字段名称
    othColsIndex: Array<number> = [];//对应数据下标
	
	async created() {
        this.mulcols = (this.cell.attr & 0x100000) > 0;//判断是否是多列
		this.cds = this.env.getDataSet(this.obj_id);
		this.index = this.cds.index;
		this.editName = this.bipInsAid.id;
		this.mode = this.record.data[this.cell.id]
		this.modekey = this.mode
		this.refKey = this.cell.refValue||this.editName
		if(this.refKey.startsWith("{")){
			let _l = this.refKey.indexOf("}");
			this.refKey = this.refKey.substring(2,_l);
		}
		if(this.refKey){
			this.aidKey= ICL.AID_KEY+this.refKey;
			if(this.editName == this.refKey){
				this.refInsAid = this.refInsAid.clone(this.bipInsAid);
			}else{
				let cc =  await InsAidModule.fetchInsAid({ id: 200, aid: this.refKey });
				this.refInsAid = this.refInsAid.clone(cc);
			}
		}
		this.getRefVal();
		if(this.mulcols){
			this.initMulColInfo();
		}
	}
	open() {
		let groupV = "";
        if(this.bipInsAid){
            if (!((this.cell.attr & 0x40) > 0)) {
                if(this.bipInsAid.bType =="CGroupEditor"){
                    let groupFld = this.bipInsAid.groupFld;
                    if(!this.cds.currRecord.data[groupFld]){
						let cel:any = this.cds.getCell(groupFld)
                        if(cel)
                        	this.showErr('请先填写：'+cel.labelString);
                        return;
                    }else{
						groupV = this.cds.currRecord.data[groupFld];
					}
				}
            }
        }else{
			this.showErr('没有辅助：'+this.cell.editName)
			return;
        }
		if(!this.disabled){
			this.methordName = this.editName+"_"+(this.index<0?0:this.index)+"_"+this.cell.id
			uni.$off(this.methordName,this.selectBack)
			uni.$on(this.methordName,this.selectBack);
			uni.showLoading({
				title:'跳转中...'
			})
			uni.navigateTo({url:'/pages/public/selecteditor/selecteditor?groupV='+groupV+'&editName='+this.editName+"&methordname="+this.methordName+"&cellAttr="+this.cell.attr,complete: () => {
				uni.hideLoading();
			}});
		}else{
			
		}
	}
	
	get disabled(){
		if(this.cds.ccells!=null){
			let attr = this.cell.attr&0x40;
			if(attr>0){
				return true;
			}else{
				return !DataUtil.currCanEdit(this.cds,this.env);
			}
		}
		else{
			if(this.cell){
				let attr = this.cell.attr&0x40;
				return attr>0 ;
			}
			return false;
		}
	}
	selectBack(param:any){
		if(param){
			// 如果可以编辑 更改值，并更新状态
			this.$nextTick(()=>{
				// if(this.refKey == this.editName){
					this.refInsAid.values = param;
					let v0 = "";
					if(param.length ==1){//单选
						v0= param[0][this.bipInsAid.cells.cels[0].id];
					}else if(param.length>1){//多选
						for(var i=0;i<param.length;i++){
							v0 += param[i][this.bipInsAid.cells.cels[0].id];
							if(i<param.length-1){
								v0+=";"
							}
						}
					}
					this.refInsAid.realV = v0;
					this.refInsAid.makeShow();
					this.othCols.forEach((fld, index) => {
						let idx = this.othColsIndex[index];
						let layC = this.bipInsAid.cells.cels[idx];
						if (layC) {
							let val = param[0][layC.id]||"";
							let cel:any = this.cds.getCell(fld)
							this.cds.cellChange(val,cel.id);
							DataUtil.checkGS(this.cds,this.env,cel)
						}
					});
				// }
				this.makeSv();
				this.cds.cellChange(this.modekey,this.cell.id);
				DataUtil.checkGS(this.cds,this.env,this.cell)
			})
		}
	}
	
	makeSv(){
		if(this.refInsAid.id){
			this.modekey = this.refInsAid.realV;
			if(this.modekey == undefined){
				this.modekey = "";
			}
			this.mode = this.refInsAid.showV;
			if(this.mode == undefined){
				this.mode = "";
			}
		}
	}


	/**初始化多列参照 */
    initMulColInfo() {
        let script = this.cell ? this.cell.script : "";
        if (script) {
            let vals = script.split("&");
            if (vals.length < 2) {
				this.showErr("多列定义错误" + script)
            } else {
                let flds = vals[0].split(",");
                let flds_index: Array<number> = vals[1]
                    .split(",")
                    .map(value => {
                        return parseInt(value);
                    });
                if (flds.length != flds_index.length) {
					this.showErr("多列参照定义的字段和下标的个数不对" + script);
                } else {
                    this.othCols = flds;
                    this.othColsIndex = flds_index;
                }
            }
        }
	}
	

	
	get aidmaps(){
		return InsAidModule.aidInfos;
	}
	
	get inProcess(){
		return InsAidModule.inProcess;
	}
	
	get aidValues(){
		return InsAidModule.aidValues;
	}
	
	async getRefVal(){
		if(this.modekey){
			let key = ICL.AID_KEY+this.refKey+"_"+this.modekey
			if(!this.inProcess.get(key)){
				let rtn = this.aidValues.get(key);
				if(!rtn){
					let cont = this.refInsAid.cells.cels[0].id+"='"+this.modekey+"'"
					let vvs = {id:this.refKey,key:key,cont:cont}
					await InsAidModule.fetchInsDataByCont(vvs);
				}
			}else{
				let rtn = this.aidValues.get(key);
				if(rtn){
					this.refInsAid.values[0] = rtn;
					this.refInsAid.makeShow();
					this.makeSv();
				}
			}
		}
		
	}

	get record():CRecord{
		return this.cds.getRecord(this.cds.index)
	}
	
	@Watch('record',{deep:true})
	recordChange(){
		// console.log('recordchang')
		this.$nextTick(()=>{
			let rr = this.record.data[this.cell.id];
				if(rr !== this.modekey){
					this.mode = rr||'';
					this.modekey = this.mode;
					this.getRefVal();
				}
		})
		
	}
	
	@Watch('aidValues',{deep:true})
	aidValuesChange(){
		// console.log('aidValues change')
		this.$nextTick(()=>{
			let key = ICL.AID_KEY+this.refKey+"_"+this.modekey;
			let rr = this.aidValues.get(key);
			if(rr){
				let r0 = this.refInsAid.values[0];
				if(rr != r0){
					this.refInsAid.values[0] = rr;
					this.refInsAid.makeShow();
					this.makeSv();
				}
			}
		})
	}
	showErr(err:string){
		let msg:any = this.$refs['msg'];
		msg.error({background: true,content:err})
	}
}
</script>

<style>
@charset "utf-8";
.cu-form-group {
	text-align: left;
	/* min-height: 90upx; */
}
.cu-form-group .title {
	min-width: calc(4em + 15px);
	/* font-size: 24upx !important; */
	/* font-weight: 400; */
}
/* .cu-form-group input { */
	/* font-size: 24upx !important; */
/* } */
</style>
