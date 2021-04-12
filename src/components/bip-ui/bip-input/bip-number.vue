<template>
	<view class="cu-form-group solid-bottom text-green">
		<template v-if="cell">
			<view class="title" v-if="!noLable" :class="[cell.isReq?'text-red':'']">{{cell.labelString}}</view>
			<input class="text-right" :placeholder="cell.labelString" type="digit" v-model="mode" @blur="dataChange" :disabled="disabled" />
		</template>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import CDataSet from '@/classes/pub/CDataSet';
	import CRecord from '@/classes/pub/CRecord';
	import CCliEnv from '@/classes/cenv/CCliEnv'
	import { dataTool } from '@/classes/tools/DataTools';
	const DataUtil = dataTool.utils;
	@Component({})
	export default class bipNumberInput extends Vue{
		@Inject('env') env!:CCliEnv;
		@Prop({ type: Boolean }) noLable!: boolean;
		@Prop({default:'digit',type:String}) type!:string
		@Prop({default:false,type:Boolean}) clearable!:boolean
		@Prop({type:Object}) cell!:Cell;
		@Prop({type:String}) obj_id!:string;
		cds:CDataSet = new CDataSet(null)
		at0:boolean = true
		mode:string = ''
		mode1:string = ''
		open(){
			this.at0 = !this.at0
		}
		clear(){
			this.mode = ''
			this.mode1 = ''
		}
		
		mounted(){
			this.$nextTick(()=>{
				this.cds = this.env.getDataSet(this.obj_id);
				this.mode = this.record.data[this.cell.id];
				this.mode = this.formatNumber(this.mode)
				let mkey = this.obj_id+"_"+this.cell.id
				uni.$on(mkey,this.cellDataChange)
			})
			
			// console.log(this.record)
		}
		
		dataChange(e:any){
			this.$nextTick(()=>{
				if(this.mode != this.record.data[this.cell.id]){
					this.mode = this.formatNumber(this.mode);
					let val = parseFloat(this.mode);
					if (isNaN(val)) {
						val = 0;
					}
					if (this.cell.chkRule) {
						let rr = this.cell.chkRule;
						let rules = rr.split(";");
						for (let k = 0; k < rules.length; k++) {
							if (rr.indexOf("~") > 0) {
								let vr: Array<any> = rr.split("~");
								if (vr[0] != "") {
									let min:number = parseFloat(vr[0]);
									if (isNaN(min)) {
										min = 0;
									}
									if (val < min) {
										let errInfo: string = "不可以小于最小值【" + min + "】";
										let msg:any = this.$refs['msg'];
            							msg.error({background: true,content:errInfo})
										this.mode = this.mode1;
										return;
									}
								}
								if (vr[1] != "") {
									let max = parseFloat(vr[1]);
									if (isNaN(max)) {
										max = 0;
									}
									if (val > max) {
										let errInfo: string = "不可以超过最大值【" + max + "】";
										let msg:any = this.$refs['msg'];
            							msg.error({background: true,content:errInfo})
										this.mode = this.mode1;
										return;
									}
								}
							} else {
								if ("D" == rr && this.mode) {
									if (!this.isNumber(this.mode)) {
										let errInfo: string = "请输入数字...";
										let msg:any = this.$refs['msg'];
            							msg.error({background: true,content:errInfo})
										this.mode = this.mode1;
										return;
									}
								}
							}
						}
					}
					this.mode1 = this.mode;
					this.cds.cellChange(this.mode,this.cell.id);
					DataUtil.checkGS(this.cds,this.env,this.cell);
				}
			})
			
				
		}
		
		formatNumber(mm:string){
			let num = mm
			if(this.cell.ccPoint){
				let nr = parseFloat(mm);
				if(isNaN(nr)){
					return '';
				}
				num = nr.toFixed(this.cell.ccPoint)
			}
			return num
		}
		
		get record():CRecord{
			return this.cds.getRecord(this.cds.index)
		}
		
		cellDataChange(){
			console.log('监听值变化');
			this.recordChange();
			// DataUtil.checkGS(this.cds,this.env,this.cell)
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
		
		
		
		@Watch('record',{deep:true})
		recordChange(){
			// console.log('recordchang')
			this.$nextTick(()=>{
				let rr = this.record.data[this.cell.id];
				rr = this.formatNumber(rr)
				if(rr !== this.mode){
					this.mode = rr||''
				}
			})
			
		}
		/**
		 * 判断值是否是 数字
		*/
		isNumber(value: any): boolean {
			let reg = new RegExp("^-?[0-9]+.?[0-9]*$");
			let rr = reg.test(value);
			return rr;
		}
		
	}
</script>

<style scoped>
	@charset "utf-8";
	.cu-form-group{
		text-align: right;
		/* min-height: 90upx; */
	}
	.cu-form-group .title {
		min-width: calc(4em + 15px);
		/* font-size: 24upx !important; */
		/* font-weight: 400; */
	}
	/* .cu-form-group input{ */
		/* font-size: 24upx !important; */
	/* } */
</style>
