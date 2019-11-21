<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title">{{ cell.labelString }}</view>
		</template>
		<input :placeholder="cell.labelString" :type="'text'" v-model="showMode" @tap.stop="open()" disabled="true"/>
		<text :class="['cuIcon-triangledownfill', 'text-grey']" @tap.stop="open()"></text>
		<bip-select :arr="bipInsAid.values" :show="isShow" @cancel="cancel" @selectChange="selectChange" @select="selectOK" :showKey="showk" :isStr="false"></bip-select>
	</view>
</template>
<script lang="ts">
import Cell from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
import BipInsAidNew from '@/classes/BipInsAidNew';
import { Vue, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
import {icl} from '@/classes/tools/CommICL';
const ICL = icl; 
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
@Component({
	components: {bipSelect}
})
export default class bipList extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	bipInsAid:BipInsAidNew = new BipInsAidNew("");
	@Prop({type:String}) obj_id!:string;
	index: number = 0;
	mode: string = '';
	mode1: string = '';
	isShow:boolean = false;
	editName = '';
	aidKey = '';
	showk = '';//下拉显示的值
	showv = '';//下拉选中的key值
	selectItem:any = {}
	cds:CDataSet = new CDataSet(null)
	mounted(){
		this.cds = this.env.getDataSet(this.obj_id);
		this.index = this.cds.index;
		this.mode1 = this.record.data[this.cell.id]
		let ref = this.cell.refValue
		if(ref){
			if(ref.indexOf('{')>-1){
				ref = ref.substring(ref.indexOf('{')+1,ref.indexOf('}'));
				if(ref.startsWith('$')){
					this.bipInsAid.cl = true;
				}
				ref = ref.substring(1);
				this.editName = ref;
				this.aidKey = this.bipInsAid.cl?(ICL.AID_KEYCL+ref):(ICL.AID_KEY+ref);
				let rr = this.aidmaps.get(this.aidKey);
				if(rr){
					this.bipInsAid = this.bipInsAid.clone(rr);
					this.bipInsAid.id = this.editName;
					this.showk = this.bipInsAid.cells.cels[1].id||this.bipInsAid.cells.cels[0].id
					this.showv = this.bipInsAid.cells.cels[0].id
					this.makeShowValue()
				}else{
					if(!this.inProcess.get(this.aidKey))
						InsAidModule.fetchInsAid({ id: 300, aid: this.editName });
				}
				
			}
		}
	}

	makeShowValue(){
		if(this.bipInsAid&&this.bipInsAid.values){
			let _idx = this.bipInsAid.values.findIndex((item:any)=>{
				return item[this.showv] == this.mode1;
			})
			if(_idx>-1){
				let item = this.bipInsAid.values[_idx];
				this.mode = item[this.showk]
			}
		}
	}

	get record():CRecord{
		return this.cds.getRecord(this.cds.index)
	}

	get showMode(){
		return this.mode || this.mode1;
	}


	open(){
		console.log('open')
		console.log(this.cell)
		this.isShow = true;
	}

	cancel(){
		this.isShow = false;
	}

	selectChange(e:any){
		console.log(e);
		this.selectItem = e;
		this.cancel();
		this.$nextTick(()=>{
			this.mode = this.selectItem[this.showk]
			this.mode1 = this.selectItem[this.showv]
			this.cds.cellChange(this.mode1,this.cell.id);
		})
	}
	selectOK(e:any){
		console.log(e);
		if(e){
			this.selectItem = e;
			this.$nextTick(()=>{
				this.mode = this.selectItem[this.showk]
				this.mode1 = this.selectItem[this.showv]
				this.cds.cellChange(this.mode1,this.cell.id);
			})
		}
		this.cancel();
	}

	get aidmaps(){
		return InsAidModule.aidInfos;
	}

	get inProcess(){
		return InsAidModule.inProcess;
	}

	@Watch('aidmaps')
	aidMapChange(old:any,newVal:any) {
		if(!this.bipInsAid.id){
			let rr = this.aidmaps.get(this.aidKey);
			if(rr){
				console.log(rr)
				this.bipInsAid = this.bipInsAid.clone(rr);
				this.bipInsAid.id = this.editName;
				this.showk = this.bipInsAid.cells.cels[1].id
				this.showv = this.bipInsAid.cells.cels[0].id
				this.makeShowValue()
				console.log(this.bipInsAid)
			}
			
		}
	}	
}
</script>
