<template>
	<view class="cu-form-group flex align-center margin-bottom-sm" @click="selectOK">
		<u-row gutter="16">
			<u-col span="1" v-if="isMultiple">
				<u-checkbox v-model="ischeck"></u-checkbox>
			</u-col>
			<u-col span="11">
				<view v-for="(itm,index) in labers" :key="index">
					<template>
						<view class="">
							<text>{{labers[index]}}：</text>{{item[cells[sindex[index]].id]}}
						</view>
					</template>
				</view>
			</u-col>
		</u-row>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import BipInsAidNew from '@/classes/BipInsAidNew';
@Component({
	components: {}
})
export default class bipSelectorUnit extends Vue{
	@Prop({type:Number,default:0}) index!:number;
	@Prop({type:Object}) item!:any;
	@Prop({type:Boolean}) isMultiple!:any;
	@Inject('bipInsAid') bipInsAid!:BipInsAidNew;
	cells:Array<any> = []
	sindex:Array<number> = []
	labers:Array<any> = []
	ischeck:boolean = false;
	mounted(){
		// console.log(this.bipInsAid)
		this.cells = this.bipInsAid.cells.cels;
		this.sindex = this.bipInsAid.showColsIndex;
		this.labers = this.bipInsAid.labers
	}
	selectOK(){
		this.ischeck = !this.ischeck;
		this.$emit('select',this.item,this.index,this.ischeck);
	}
	
}
</script>
