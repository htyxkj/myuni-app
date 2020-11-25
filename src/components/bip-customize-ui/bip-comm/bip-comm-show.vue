<template>
	<view>
		<template v-if="cell.refValue ||cell.editName">
			<bip-show-ref :cell="cell" :obj_id="obj_id" :record="record" :rowId="rowId"></bip-show-ref>
		</template>
		<template v-else>
			{{record.data[cell.id]}}
		</template>
	</view>
</template>

<script lang="ts">
import { Vue, Provide, Prop, Component ,Inject,Watch} from 'vue-property-decorator';
import { Tools } from '@/classes/tools/Tools';
import Cell from '@/classes/pub/coob/Cell';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import BipInsAidNew from '@/classes/BipInsAidNew';
import bipShowRef from '../bip-show/bip-show-ref.vue';
@Component({
	components: {bipShowRef}
})
export default class bipCommShow extends Vue{
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
