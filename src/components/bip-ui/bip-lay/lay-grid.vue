<template>
	<view class="margin-top shadow">
		<view class="cu-bar bg-white solid-bottom ">
			<view class="action">
				<text class="cuIcon-titles text-orange "></text>
				{{ cds.ccells.desc }}
			</view>
			<view class="action"><switch :class="isCard ? 'checked' : ''" :checked="isCard ? true : false" @change="IsCard"></switch></view>
		</view>
		<view class="bg-white box" v-if="isCard && laycell && cds">
			<view v-for="(item,index) in cds.cdata.data" :key="index">
				<bip-bill-unit :record="item" :cels="cds.ccells.cels" :rowId="index" :obj_id="cds.ccells.obj_id" @editRow="editRow" @delRow="delRow"></bip-bill-unit>
			</view>
		</view>
		<view class="bg-white solid padding text-center">
			<view class="flex">
				<view class="flex-sub bg-gray padding-sm margin-xs radius">
					<button class="cu-btn cuIcon bg-green text-xxl" @click="addLine"><text class="cuIcon-add"></text></button>
				</view>
				<!-- <view class="flex-sub bg-gray padding-sm margin-xs radius">
					<button class="cu-btn cuIcon bg-green text-xxl" @click="checkEdit"><text class="cuIcon-qrcode"></text></button>
				</view> -->
			</view>
		</view>
	</view>
</template>

<script lang="ts">
/**
 * 页面布局单元
 */
import { Vue, Provide, Prop, Component, Inject } from 'vue-property-decorator';
import { Tools } from '@/classes/tools/Tools';
import BipLayCells from '@/classes/ui/BipLayCells';
import Cell from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv';
import CDataSet from '@/classes/pub/CDataSet';
// import bipInput from '../bip-input/bip-input.vue';
import bipBillUnit from '../bip-unit/bip-bill-unit.vue';
import { EnvModule } from '@/store/module/envmode'; //导入vuex模块，自动注入

import {dataTool} from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils
@Component({
	components: { bipBillUnit }
})
export default class layGrid extends Vue {
	@Inject('env') env!: CCliEnv;
	@Prop({ type: Object }) laycell!: BipLayCells;
	id: string = Tools.guid();
	isCard: boolean = true;
	cds: CDataSet = new CDataSet(null);
	created() {
		this.cds = this.env.getDataSet(this.laycell.obj_id);
	}
	mounted() {
		this.cds.sayHello();
	}
	
	addLine(){
		if(this.disabled){
			return ;
		}
		if(!this.isCard){
			this.isCard = true;
		}
		if(this.env.dsm.i_state>-1){
			console.log(this.env.dsm,this.env.dsm.currRecord)
		}
		let cr = DataUtil.createRecord(this.cds,this.env);
		DataUtil.addRecord(cr,this.cds,this.env);
	}
	
	editRow(rid:number,obj_id:string){
		if(this.disabled){
			return ;
		}
		this.cds.index = rid;
		this.cds.currRecord = this.cds.getRecord(rid);
		EnvModule.setEnvInf(this.env);
		EnvModule.setLay(this.laycell);
		uni.navigateTo({url:'/pages/editunit/editunit?id='+obj_id+'&rid='+rid});
	}
	
	delRow(rid:number,obj_id:string){
		if(this.disabled){
			return ;
		}
		this.cds.removeIndex(rid);
	}

	IsCard(e: any) {
		this.isCard = e.detail.value;
	}
	
	checkEdit(){
		let editable = DataUtil.currCanEdit(this.cds,this.env);
		console.log(editable,'laygrid')
	}
	
	get disabled(){
		return !DataUtil.currCanEdit(this.cds,this.env);
	}
}
</script>

<style></style>
