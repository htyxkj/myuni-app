<template>
	<view class="flex-sub bg-white margin-sm padding-left-sm padding-right-sm padding-bottom-sm radius text-cut solid-bottom">
		<template v-if="cell.type==3">
			<bip-show-number :cell="cell" :record="record" :rowId="rowId" :obj_id="obj_id"></bip-show-number>
		</template>
		<template v-else-if="cell.type==91||cell.type==93">
			<bip-show-date :cell="cell" :record="record" :rowId="rowId" :obj_id="obj_id"></bip-show-date>
		</template>
		<template v-else-if="cell.editName && cell.editName=='UPDOWN'">
			<bip-show-file :cell="cell" :record="record" :rowId="rowId" :obj_id="obj_id"></bip-show-file>
		</template>
		<template v-else-if="cell.refValue ||cell.editName">
			<bip-show-ref :cell="cell" :obj_id="obj_id" :record="record" :rowId="rowId"></bip-show-ref>
		</template>
		<template v-else>
			<bip-show-comm :cell="cell" :record="record" :rowId="rowId" :obj_id="obj_id"></bip-show-comm>
		</template>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component } from 'vue-property-decorator';
import { Tools } from '@/classes/tools/Tools';
import Cell from '@/classes/pub/coob/Cell';
import bipShowComm from '../bip-show/bip-show-comm.vue';
import bipShowNumber from '../bip-show/bip-show-number.vue';
import bipShowDate from '../bip-show/bip-show-date.vue';
import bipShowRef from '../bip-show/bip-show-ref.vue';
import bipShowFile from '../bip-show/bip-show-file.vue';
@Component({
	components: {bipShowComm,bipShowNumber,bipShowDate,bipShowRef,bipShowFile}
})
export default class bipCommShow extends Vue{
	// @Inject('env') env!:CCliEnv;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:Number,default:0}) rowId!:number;
	@Prop() cell!:Cell;
	@Prop() record!:any;
	id:string = Tools.guid()
	// bipInsAid:BipInsAidNew = new BipInsAidNew('')
	// aidKey = '';
	// editName='';
	// bassist:boolean = false;
	// mode:any = ''
	created(){	
		// console.log(this.cell,this.record)
	}	
}
</script>

<style>
</style>
