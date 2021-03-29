<template>
	<view>
		<template v-if="bipInsAid.id&&bipInsAid.cl">
			<bip-refs-cl :cell="cell" :obj_id="obj_id" :rowId ="rowId" :label="true" ></bip-refs-cl>
		</template>
		<template v-else>
			<bip-refs-fz :cell="cell" :obj_id="obj_id" :rowId ="rowId" :label="true" ></bip-refs-fz>	
		</template>
	</view>
</template>
<script lang="ts">
import { Vue, Component, Prop, Watch,Inject, Provide } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import BipInsAidNew from '@/classes/BipInsAidNew';

import bipRefsCl from '@/components/bip-ui/bip-refs/bip-refs-cl.vue'
import bipRefsFz from '@/components/bip-ui/bip-refs/bip-refs-fz.vue'
@Component({
	components: {bipRefsCl,bipRefsFz}
})
export default class bipShowRef extends Vue{
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop() record!:any;
	@Prop({type:Number,default:-1}) rowId!:number;
	@Provide('bipInsAid') bipInsAid:BipInsAidNew = new BipInsAidNew("");
	editName = '';
	aidKey = '';
	created(){
		let ref = this.cell.refValue
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
			console.log(ref)
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
