<template>
	<view>
		<template v-if="cell.type==91||cell.type==93">
			<bip-date :label="cell.labelString" :cell="cell" :obj_id="obj_id"></bip-date>
		</template>
		<template v-else-if="cell.assist">
			<template v-if="cell.editType==6">
				<bip-image :label="cell.labelString" :cell="cell" :obj_id="obj_id"></bip-image>
			</template>
			<template v-else-if="bipInsAid.bType === 'CSelectEditor'">
				<bip-select :label="cell.labelString" :cell="cell" :bipInsAid="bipInsAid" :obj_id="obj_id"></bip-select>
			</template>
			<template v-else-if="bipInsAid.bType === 'CDateEditor'">
				<bip-date :label="cell.labelString" :cell="cell" :obj_id="obj_id"></bip-date>
			</template>
			<template v-else-if="bipInsAid.bType === 'CUpDownEditor'">
				<bip-file :label="cell.labelString" :cell="cell" :obj_id="obj_id"></bip-file>
			</template>
			<template v-else-if="bipInsAid.bType === 'CTreePopEditor'">
				<bip-tree-editor :label="cell.labelString" :cell="cell" :bipInsAid="bipInsAid" :obj_id="obj_id"></bip-tree-editor>
			</template>
			<template v-else>
				<view>{{cell.labelString}}</view>
			</template>
		</template>
		<template v-else>
			<template v-if="cell.type==3">
				<bip-number :label="cell.labelString" :cell="cell" :obj_id="obj_id"></bip-number>
			</template>
			<template v-else-if="cell.editType==1">
				<bip-list :label="cell.labelString" :cell="cell" :obj_id="obj_id" ></bip-list>
			</template>
			<template v-else-if="cell.refValue">
				<bip-ref :label="cell.labelString" :cell="cell" :obj_id="obj_id"></bip-ref>
			</template>
			<template v-else>
				<bip-input :label="cell.labelString" :cell="cell" :obj_id="obj_id"></bip-input>
			</template>
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

import bipInput from '../bip-input/bip-input.vue';
import bipNumber from '../bip-input/bip-number.vue';
import bipDate from '../bip-date/bip-date.vue';
import bipSelect from '../bip-ass/bip-select.vue';
import bipRef from '../bip-ass/bip-ref.vue';
import bipList from '../bip-list/bip-list.vue';
import bipFile from '../bip-file/bip-file.vue';
import bipImage from '../bip-file/bip-image.vue';
import bipTreeEditor from '../bip-tree/bip-tree-editor.vue';
@Component({
	components: {bipInput,bipNumber,bipDate,bipSelect,bipRef,bipList,bipFile,bipImage,bipTreeEditor}
})
export default class bipComm extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({type:String}) obj_id!:string;
	@Prop() cell!:Cell
	id:string = Tools.guid()
	bipInsAid:BipInsAidNew = new BipInsAidNew('')
	aidKey = '';
	editName='';
	bassist:boolean = false;
	mode:any = ''
	created(){
		if(this.cell.assist){
			this.bassist = true;
			this.editName = this.cell.editName;
			this.aidKey= ICL.AID_KEY+this.editName;
			this.$nextTick(()=>{
				if(this.inProcess.get(this.aidKey)){
					let rnt = this.aidmaps.get(this.aidKey);
					if(rnt){
						this.bipInsAid = rnt;
					}else{
						InsAidModule.fetchInsAid({ id: 200, aid: this.editName });
					}
				}else{
					InsAidModule.fetchInsAid({ id: 200, aid: this.editName });
				}
			})			
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
		this.$nextTick(()=>{
			if(this.bassist&&!this.bipInsAid.id){
				let rr = this.aidmaps.get(this.aidKey);
				if(rr){
					this.bipInsAid = this.bipInsAid.clone(rr);
				}
				
			}
		})
		
	}	
}
</script>

<style>
</style>
