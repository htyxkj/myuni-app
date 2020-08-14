<template>
	<view class="flex-sub bg-white text-cut padding-sm  solid-bottom">
		<template v-if="cell.type==3">
			<bip-show-number :cell="cell" :record="record"></bip-show-number>
		</template>
		<template v-else-if="cell.type==91||cell.type==93">
			<bip-show-date :cell="cell" :record="record"></bip-show-date>
		</template>
		<template v-else-if="cell.refValue ||cell.editName">
			<bip-show-ref :cell="cell" :obj_id="obj_id" :record="record" ></bip-show-ref>
		</template>
		<template v-else>
			<bip-show-comm :cell="cell" :record="record"></bip-show-comm>
		</template>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component ,Inject,Watch} from 'vue-property-decorator';
import { Tools } from '@/classes/tools/Tools';
import BipLayCells from '@/classes/ui/BipLayCells';
import Cell from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv'
// import { BIPUtil } from '@/classes/api/request';
// let tools = BIPUtil.ServApi;
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import BipInsAidNew from '@/classes/BipInsAidNew';

import bipShowComm from '../bip-show/bip-show-comm.vue';
import bipShowNumber from '../bip-show/bip-show-number.vue';
import bipShowDate from '../bip-show/bip-show-date.vue';
import bipShowRef from '../bip-show/bip-show-ref.vue';
@Component({
	components: {bipShowComm,bipShowNumber,bipShowDate,bipShowRef}
})
export default class bipCommShowTask extends Vue{
	// @Inject('env') env!:CCliEnv;
	@Prop({type:String}) obj_id!:string;
	@Prop() cell!:Cell;
	@Prop({type:Number,default:0}) rowId!:number;
	@Prop() record!:any;
	id:string = Tools.guid()
	// bipInsAid:BipInsAidNew = new BipInsAidNew('')
	// aidKey = '';
	// editName='';
	// bassist:boolean = false;
	// mode:any = ''
	// created(){	
	// }	
}
</script>

<style>
</style>
