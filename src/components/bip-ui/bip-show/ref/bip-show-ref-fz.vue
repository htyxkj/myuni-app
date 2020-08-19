<template>
	<view class="flex justify-between text-cut">
		<view class="flex-sub">
			<text>{{ cell.labelString }}：</text>
		</view>
		<view class="flex-treble text-cut text-bold">
			<text>{{modes}}</text>
		</view>
		<!-- <text class="text-progress text-bold cuIcon-fork"></text> -->
	</view>
</template>

<script lang="ts">
	import {icl} from '@/classes/tools/CommICL';
	const ICL = icl; 
	import {Vue, Component,Prop,Watch,Inject} from 'vue-property-decorator';
	import Cell from '@/classes/pub/coob/Cell';
	import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
	import BipInsAidNew from '@/classes/BipInsAidNew';
	@Component({})
	export default class bipShowRefFz extends Vue{
		@Prop({type:Object}) cell!:Cell;
		@Prop() record!:any;
		@Inject('bipInsAid') bipInsAid!:BipInsAidNew;
		@Prop({type:Number,default:0}) rowId!:number;
		@Prop({type:String}) obj_id!:string;
		mode:string = '';
		showValue:string = '';
		aidKey:string = '';
		created(){
			this.mode = this.record.data[this.cell.id]||''
			this.showValue = this.mode;
			this.aidKey = ICL.AID_KEY+this.bipInsAid.id;
			if(this.mode !=='' && this.mode !== undefined){
				let key = this.aidKey+"_"+this.mode;
				let rr = this.aidValues.get(key);
				if(rr){
					this.bipInsAid.values[0] = rr;
					this.bipInsAid.makeShow();
					this.showValue = this.bipInsAid.showV;
				}else{
					if(!this.inProcess.get(key))
						this.makeRefshow();
				}
			}
			
			// let mid = this.obj_id+"_row_"+this.rowId;
			// uni.$on(mid,()=>{this.cellRowChange()});
		}
		// beforDestory(){
		// 	let mid = this.obj_id+"_row_"+this.rowId;
		// 	uni.$off(mid,()=>{this.cellRowChange()});
		// }
		// @Watch('record',{deep:true})
		// cellRowChange(){
		// 	this.recordChange();
		// }
		
		get aidValues(){
			return InsAidModule.aidValues;
		}
		
		get modes(){
			return this.showValue || this.mode;
		}
		
		@Watch('aidValues')
		aidValuesChange(){
			if(this.mode !==''){
				let key = this.aidKey+"_"+this.mode;
				let rr = this.aidValues.get(key);
				// console.log(rr,'aidValues')
				if(rr){
					this.bipInsAid.values[0] = rr;
					this.bipInsAid.makeShow();
					this.showValue = this.bipInsAid.showV;
		
				}
			}
		}
		
		@Watch('record',{deep:true})
		recordChange(){
			let rr = this.record.data[this.cell.id];
			if(rr !== this.mode){
				this.mode = this.record.data[this.cell.id]||''
				this.showValue = this.mode;
				this.makeRefshow()
			}
		}
		
		get inProcess(){
			return InsAidModule.inProcess;
		}
		
		makeRefshow(){
			let key = this.aidKey+"_"+this.mode;
			if(!this.inProcess.get(key)){
				let rtn = this.aidValues.get(key);
				if(!rtn){
					let cel = this.bipInsAid.cells.cels[0];
					if(cel){
						let cont = "";
						if(cel.type<12){
							cont = cel.id+"="+this.mode+""
						}else{
							cont = cel.id+"='"+this.mode+"'"
						}
						let vvs = {id:this.bipInsAid.id,key:key,cont:cont}
						InsAidModule.fetchInsDataByCont(vvs);
					}
					
				}
			}else{
				let rtn = this.aidValues.get(key);
				if(rtn){
					this.bipInsAid.values[0] = rtn;
					this.bipInsAid.makeShow();
					this.showValue = this.bipInsAid.showV;
				}
			}
		}
	}
</script>

