<template>
	<view>
		<view class="cu-bar search bg-white flex">
			<view class="action" @tap="openList">
				<text>{{title}}</text>
				<text class="cuIcon-triangledownfill"></text>
			</view>
			<view class="search-form radius">
				<text class="cuIcon-search"></text>
				<input :adjust-position="false" type="text" placeholder="查询什么呢" confirm-type="search" @blur="query" v-model="mode"></input>
			</view>
		</view>
		<!-- 
		<view class="cu-modal" :class="isShow?'show':''" @tap="hideModal">
			<view class="cu-dialog" @tap.stop="">
				<scroll-view scroll-y class="bip-modal">
					<radio-group class="block" @change="RadioChange">
						<view class="cu-list menu text-left">
							<view class="cu-item" v-for="(item,index) in cels" :key="index">
								<label class="flex justify-between align-center flex-sub">
									<view class="flex-sub">{{item.labelString}}</view>
									<radio class="round text-sm" :class="cellid==item.id ?'checked':''" :checked="cellid==item.id?true:false"
									 :value="item.id"></radio>
								</label>
							</view>
						</view>
					</radio-group>
				</scroll-view>
			</view>
		</view> -->
		<bip-select :arr="cels" :show="isShow" @cancel="cancel" @selectChange="selectChange" @select="selectOK" :showKey="'labelString'" :isStr="false"></bip-select>
	</view>
</template>
<script lang="ts">
import { Vue,Prop, Component,Watch} from 'vue-property-decorator';
import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
@Component({
	components: {bipSelect}
})
export default class bipSearchCon extends Vue{
	@Prop({type:Array,default:[]}) cels!:Array<any>;
	cellid:string = '';
	mode:string = '';
	isShow:boolean = false;
	mounted(){
		console.log(this.cels)
		if(this.cels&&this.cels.length>0){
			this.cellid = this.cels[0].id;
		}
	}
	
	@Watch('cels')
	celsChange(){
		if(this.cels&&this.cels.length>0){
			this.cellid = this.cels[0].id;
		}
	}
	openList(){
		this.isShow = !this.isShow;
	}
	
	hideModal(){
		this.isShow = false;
	}
	
	cancel(){
		this.hideModal();
	}
	
	selectChange(e:any){
		if(e !== undefined){
			this.cellid = e.id;
		}
		this.hideModal();
	}
	
	selectOK(e:any){
		if(e !== undefined){
			this.cellid = e.id;
		}
		this.hideModal();
		console.log(e);
	}
	
	RadioChange(e:any){
		this.cellid = e.detail.value
		this.hideModal();
	}
	
	get title(){
		if(this.cels.length>0){
			let index = this.cels.findIndex((item:any)=>{
				return item.id == this.cellid
			});
			index = index?index:0;
			if(index>-1){
				return this.cels[index].labelString
			}
		}
		
		return '点我选择';
	}
	query(){
		console.log('query')
		this.$emit('query',this.cellid,this.mode);
	}
}
</script>

<style>
	.bip-modal{
		max-height:800upx;
	}
</style>