<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell && !noLable">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{ cell.labelString || title }}</view>
		</template>
		<input class="text-right" :placeholder="cell.labelString || title " type="text" v-model="mode" disabled="true"/>
		<text class="cuIcon-calendar" @tap.stop="open()"></text>
		<bip-picker-date :mode="pickerType" @confirm="onConfirm" ref="calendar" :limitDate="limitDate" ></bip-picker-date>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Watch,Inject } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import bipPickerDate from '../bip-picker/bip-picker-date.vue'
import CRecord from '@/classes/pub/CRecord';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
import { baseUtils } from "@/classes/api/baseutils";
let baseTool = baseUtils.tools;
import moment from "moment"
@Component({
	components: {bipPickerDate }
})
export default class bipDate extends Vue {
	@Inject('env') env!:CCliEnv;
	@Inject('noLable') noLable!:boolean;
	@Prop({ default: '', type: String }) title!: string;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:String}) bType!:string;
	cds:CDataSet = new CDataSet(null)
	selectIndex:Array<number>=[0,0,0,0,0,0]
	mode:string = ''
	pickerType:any ='date'
	limitDate:any={max:null,min:null}
	created(){
		this.cds = this.env.getDataSet(this.obj_id);
		this.mode = this.record.data[this.cell.id]
		if(this.cell.type==91){
			this.pickerType = 'date';
		}
		if(this.cell.type==92){
			this.pickerType ='time'
		}
		if(this.cell.type==93){
			this.pickerType ='datetime'
		}
		if(this.bType =='CYMEditor'){
			this.pickerType ='ym'
		}
	}
	
	change(e:any){
		// console.log(e)
	}
	
	open(){
		if(!this.disabled){
			this.initRestrict()
			let rr:any = this.$refs.calendar
			rr.show();
		}
	}
	
	onConfirm(e:any){
		console.log(e)
		this.mode = e.result
		this.selectIndex = e.defaultVal
		this.$nextTick(()=>{
			if(this.mode != this.record.data[this.cell.id]){
				this.cds.cellChange(this.mode,this.cell.id);
				DataUtil.checkGS(this.cds,this.env,this.cell)
			}
		})
	}
	
	get record():CRecord{
		return this.cds.getRecord(this.cds.index)
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
		let rr = this.record.data[this.cell.id];
		if(rr !== this.mode){
			this.mode = rr||''
		}
	}

	initRestrict(){
		let chkRule = this.cell.chkRule
		if(chkRule){
			let startTime;
            let endTime;
            let dArr = this.cell.chkRule.split("~");
			startTime = dArr[0]
            endTime = dArr[1];
			
            if(startTime && startTime!=""){
                let dateAdd="";
                if(startTime.indexOf("|") ==-1){
                    startTime = startTime.substring(startTime.indexOf("[")+1,startTime.lastIndexOf("]"));                    
                }else{
                    let stt = startTime.substring(startTime.indexOf("[")+1,startTime.lastIndexOf("|"));
                    dateAdd = startTime.substring(startTime.indexOf("|")+1,startTime.lastIndexOf("]"));
                    startTime = stt;
                }
                startTime = this.cds.currRecord.data[startTime];
                startTime = startTime.replace(new RegExp("\\-",'g'),"/"); 
                if(dateAdd !=""){
                    let add = dateAdd.split(";");
                    add.unshift(startTime);
                    startTime = baseTool.dateAdd(add);
                }
            }
            if(endTime && endTime!=""){
                let dateAdd ="";
                if(endTime.indexOf("|") == -1){
                    endTime = endTime.substring(endTime.indexOf("[")+1,endTime.lastIndexOf("]"));
                }else{
                    let stt = endTime.substring(endTime.indexOf("[")+1,endTime.lastIndexOf("|"));
                    dateAdd = endTime.substring(endTime.indexOf("|")+1,endTime.lastIndexOf("]"));
                    endTime = stt;
                }
                endTime = this.cds.currRecord.data[endTime];
                endTime = endTime.replace(new RegExp("\\-",'g'),"/"); 
                if(dateAdd !=""){
                    let add = dateAdd.split(";");
                    add.unshift(endTime);
                    endTime = baseTool.dateAdd(add);
                } 
            }
			if(startTime){
				this.limitDate.min = moment(new Date(startTime)).toArray();
				this.limitDate.min[1]++
			}
			if(endTime){
				this.limitDate.max = moment(new Date(endTime)).toArray();
				this.limitDate.max[1]++
			}
        }
	}
}
</script>
