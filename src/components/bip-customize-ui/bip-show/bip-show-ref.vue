<template>
	<view>
		<template v-if="bipInsAid.id">
			<template v-if="bipInsAid.cl">
				<bip-show-ref-cl :cell="cell" :obj_id="obj_id" :record="record" :rowId="rowId"></bip-show-ref-cl>
			</template>
			<template v-else>
				<bip-show-ref-fz :cell="cell" :obj_id="obj_id" :record="record" :rowId="rowId"></bip-show-ref-fz>	
			</template>
		</template>
		<template v-else>
			{{record.data[cell.id]}}
		</template>
	</view>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch,Inject, Provide } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import BipInsAidNew from '@/classes/BipInsAidNew';
import bipShowRefCl from './ref/bip-show-ref-cl.vue';
import bipShowRefFz from './ref/bip-show-ref-fz.vue';
@Component({
	components: {bipShowRefCl,bipShowRefFz}
})
export default class bipShowRef extends Vue{
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop() record!:any;
	@Prop({type:Number,default:0}) rowId!:number;
	@Provide('bipInsAid') bipInsAid:BipInsAidNew = new BipInsAidNew("");
	editName = '';
	aidKey = '';
	created(){
		let ref = this.cell.refValue ||this.cell.editName
		if(ref.indexOf('{')>-1){
			ref = ref.substring(ref.indexOf('{')+1,ref.indexOf('}'));
			if(ref.startsWith('$')){
				this.bipInsAid.cl = true;
				ref = ref.substring(1);
			}else{
				if(ref.startsWith('&')){
					ref = ref.substring(1);
				}
			}
			// console.log(ref)
			this.editName = ref;
			this.aidKey = this.bipInsAid.cl?(ICL.AID_KEYCL+ref):(ICL.AID_KEY+ref);
			let rr = this.aidmaps.get(this.aidKey);
			if(rr){
				this.bipInsAid = this.bipInsAid.clone(rr);
				this.bipInsAid.id = this.editName;
			}else{
				if(!this.inProcess.get(this.aidKey)){
					InsAidModule.fetchInsAid({ id: (this.bipInsAid.cl?300:200), aid: this.editName });
				}
	
			}
		}else{
			// console.log(ref) 其他
		}
	}


	get aidmaps(){
		return InsAidModule.aidInfos;
	}

	get inProcess(){
		return InsAidModule.inProcess;
	}

	@Watch('aidmaps')
	aidMapChange(old:any,newVal:any) {
		// console.log('aidMapChange')
		if(!this.bipInsAid.id){
			let rr = this.aidmaps.get(this.aidKey);
			if(rr){
				this.bipInsAid = this.bipInsAid.clone(rr);
				this.bipInsAid.id = this.editName;
			}	
		}
	}
}
</script>
