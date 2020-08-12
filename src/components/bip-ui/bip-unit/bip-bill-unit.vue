<template>
	<view>
		<template v-if="pkList.length>0">
			<view class="cu-bar bg-white solid-bottom">
				<view class="action">
					<text class="cuIcon-title text-red"></text>
					<text>{{pkList[0].labelString}}：{{record.data[pkList[0].id]||''}}</text>
				</view>
				<view class="action">
					<text class="text-blue cuIcon-edit" @tap.stop="editRow">详情</text>
					<text class="text-red cuIcon-deletefill" @tap.stop="delRow">删除</text>
				</view>
			</view>
		</template>
		<view class="flex p-xs bg-white mb-sm" v-for="(item,index) in celsRowList" :key="index">
			<view v-for="(cel,idx) in item" :key="idx" :style="'width:'+(100/item.length)+'%'">
				<!-- <text >{{ cel.labelString }}：{{record.data[cel.id] ||''}}</text> -->
				<bip-comm-show :obj_id="obj_id" :cell="cel" :rowId="rowId" :record="record"></bip-comm-show>
			</view>
			
		</view>
		<view class="margin-bottom-sm bg-blue solid-top">
		</view>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Inject,Watch } from 'vue-property-decorator';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import bipCommShow from '../bip-comm/bip-comm-show.vue';
import CRecord from '@/classes/pub/CRecord';
@Component({
	components: {bipCommShow}
})
export default class bipBillUnit extends Vue {
	@Prop({type:String}) obj_id!:string;
	@Prop({type:Array,default:[]}) cels!:Array<any>;
	@Prop({type:Number,default:0}) rowId!:number;
	@Prop() record!:any;
	
	
	delRow() {
		console.log('delRow')
		this.$emit('delRow',this.rowId,this.obj_id)
		
	}
	
	editRow(){
		console.log('editRow')
		this.$emit('editRow',this.rowId,this.obj_id)
	}


	get svList(){
		return this.cels.filter((item:any)=>{
			return item.isShow == true;
		})
	}
	
	//过滤显示列表
	get sList(){
		return this.cels.filter((item:any)=>{
			return item.isShow == true&&((item.attr&1)==0);
		})
	}
	get pkList(){
		return this.cels.filter((item:any)=>{
			return item.isShow&&(item.attr&1)>0;
		})
	}

	get celsRowList(){
		let celsRowList:Array<any> = [];
		let k = this.sList.length,row = 0;
		let w = 0;
		for(let i=0;i<k;i++){
			let cel = this.sList[i];//取其中一个cell 判断占用宽度
			let kk =  cel.ccHorCell||3;
			if(kk>=3){
				if(w==0){
					celsRowList[row] = [cel]
				}
				else{
					let nr = row+1;
					celsRowList[nr] = [cel]
					row++;
				}
			}else{
				let cels:Array<any> = celsRowList[row]||[];
				let fk = w+kk;
				if(fk<3){
					cels.push(cel);
					celsRowList[row] = cels;
					w = fk;
				}else if(fk == 3){
					cels.push(cel);
					celsRowList[row] = cels;
					row++;
					w = 0;
				}else{
					let nr = row+1;
					w = kk;
					celsRowList[nr] = [cel]
					row++;
				}
			}
		}
		return celsRowList;
	}
}
</script>