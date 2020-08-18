<template>
	<view class="flex shadow bg-white cu-form-group solids-bottom">
		<view v-for="itm in sindex" :key="itm" :class="itm==0?['flex-twice']:['flex-treble','text-cut']">
			<template v-if="itm<2">
				<text class="text-blue">{{labers[itm]}}：</text>{{item[cells[itm].id]}}
			</template>
		</view>
		<button class="cu-btn bg-gray text-blue" @click="selectOK">选中</button>
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
	@Inject('bipInsAid') bipInsAid!:BipInsAidNew;
	cells:Array<any> = []
	sindex:Array<number> = []
	labers:Array<any> = []
	mounted(){
		// console.log(this.bipInsAid)
		this.cells = this.bipInsAid.cells.cels;
		this.sindex = this.bipInsAid.showColsIndex;
		this.labers = this.bipInsAid.labers
	}
	selectOK(){
		this.$emit('select',this.item,this.index);
	}
	
}
</script>
