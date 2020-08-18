<template>
	<view class="cu-form-group flex align-center margin-bottom-sm" @click="selectOK">
		<view>
			<view v-for="itm in sindex" :key="itm">
				<template v-if="itm<2">
					<view class="">
						<text>{{labers[itm]}}：</text>{{item[cells[itm].id]}}
					</view>
				</template>
			</view>
		</view>
	<!-- 	<view class="flex-sub" style="margin-right: -84upx;">
			<button class="cu-btn bg-gray text-blue" @click="selectOK">选中</button>
		</view> -->
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
