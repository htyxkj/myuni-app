<template>
	<view>
		<uni-collapse accordion="true">
			<uni-collapse-item :customize="true">
				<view slot="title"  style="width:100%">
					<view class="cu-bar search bg-white flex" v-if="tjAll.length>0">
						<view class="action" @tap="openList(0)">
							<text>{{tjAll[0].name}}</text>
							<text class="cuIcon-triangledownfill"></text>
						</view>
						<view class="search-form radius">
							<bip-comm :obj_id="dsm_cont.ccells.obj_id" :cell="tjAll[0].cels"></bip-comm>
						</view>
					</view>
					<bip-select :arr="cels" :show="isShow[0]" @cancel="cancel" @selectChange="selectChange" @select="selectOK" :showKey="'labelString'" :isStr="false"></bip-select>
				</view>
				<view slot="content">
					<view style="min-height:500rpx">
						<view v-for="(item,index) in tjAll" :key="index" style="width:100%">
							<template v-if="index>0 && item">
								<view class="cu-bar search bg-white flex">
									<view class="action" @tap="openList(index)">
										<text>{{item.name}}</text>
										<text class="cuIcon-triangledownfill"></text>
									</view>
									<view class="search-form radius">
										<bip-comm :obj_id="dsm_cont.ccells.obj_id" :cell="item.cels"></bip-comm>
									</view>
									<uni-icons style="margin-right: 5px;" color="#bbb" size="20" type="close" @click="delTj(index)"/>
								</view>
								<bip-select :style="index>=(tjAll.length-3)?'bottom:0':''" :arr="cels" :show="isShow[index]" @cancel="cancel" @selectChange="selectChange" @select="selectOK" :showKey="'labelString'" :isStr="false"></bip-select>
							</template>
						</view>
						<view class="margin-xs padding-xs"></view>
						<view class="flex justify-center padding-bottom">
							<button class="cu-btn lines-blue round sm shadow margin padding" @click="addTj">
								添加一个
							</button>
							<button class="cu-btn lines-blue round sm shadow margin padding " @click="query">
								查询
							</button>
						</view>
						<view class="margin-xs padding-xs"></view>
					</view>
				</view>
			</uni-collapse-item>
		</uni-collapse>
		
	</view>
</template>
<script lang="ts">
import { Vue,Provide,Prop, Component,Watch} from 'vue-property-decorator';
import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
import uniCollapse from "@/components/uni-ui/uni-collapse/uni-collapse.vue";
import uniCollapseItem from "@/components/uni-ui/uni-collapse-item/uni-collapse-item.vue";
import uniIcons from '@/components/uni-ui/uni-icons/uni-icons.vue';
import bipComm from '../bip-comm/bip-comm.vue';
import CDataSet from '@/classes/pub/CDataSet';
import View from '../../../../../hello-uniapp-master/pages/component/view/view.vue';
@Component({
	components: {bipSelect,uniCollapse,uniCollapseItem,uniIcons,bipComm, View}
})
export default class bipSearchCon extends Vue{
	@Provide('noLable') noLable: boolean = true;

	@Prop({type:Array,default:[]}) cels!:Array<any>;
	@Prop({type:CDataSet}) dsm_cont!:CDataSet;
	isShow:any = [false,false,false];

	tjIndex:any=0;
	tjAll:Array<any>=new Array<any>();//全部条件
	oneTj:any = {name:"",cellId:"",value:"",cels:null};

	mounted(){
		this.initOneTj();
	}
	initOneTj(){
		this.tjAll=new Array<any>();
		if(this.cels && this.cels.length>0){
			this.oneTj.name = this.cels[0].labelString;
			this.oneTj.cellId = this.cels[0].id;
			this.oneTj.cels = this.cels[0];
			this.tjAll.push(this.oneTj);
		}
	}
	openList(tjIndex:any){
		this.tjIndex = tjIndex;
		if(this.isShow.length<tjIndex){
			this.isShow.push(false)
		}
		this.$set( this.isShow, tjIndex, !this.isShow[tjIndex])
	}
	selectChange(e:any){
		if(e !== undefined){
			this.tjAll[this.tjIndex].cellId = e.id;
			this.tjAll[this.tjIndex].name = e.labelString;
			this.tjAll[this.tjIndex].cels = e;
		}
		this.hideModal();
	}
	hideModal(){
		this.$set( this.isShow, this.tjIndex, false)
	}
	cancel(){
		this.hideModal();
	}
	selectOK(e:any){
		this.selectChange(e)
	}
	addTj(){
		let tj = Object.assign({},this.oneTj)
		let tj_len = 0;
		for(var i=0;i<this.tjAll.length;i++){
			if(this.tjAll[i] !=null)
				tj_len ++;
		}
		if(tj_len==this.cels.length)
			return;
		tj.name = this.cels[tj_len].labelString
		tj.cellId = this.cels[tj_len].id
		tj.cels = this.cels[tj_len];
		this.tjAll.push(tj);
	}
	delTj(index:any){
		if(this.tjAll[index]){
			this.dsm_cont.currRecord.data[this.tjAll[index].cellId] = null;
			if(this.tjAll[index].value){
				this.$set( this.tjAll, index, null)
				this.query();
			}else{
				this.$set( this.tjAll, index, null)
			}
		}
	}

	@Watch('cels')
	celsChange(){
		this.initOneTj();
	}
	query(){
		uni.hideKeyboard();
		let vl:any = {};
		for(var i=0;i<this.tjAll.length;i++){
			let tj = this.tjAll[i];
			if(tj){
				let value = this.dsm_cont.currRecord.data[tj.cellId]
				value = !value?"":value
				vl[tj.cellId] = value;
			}
		}
		this.$emit('query',vl);
	}
}
</script>

<style>
	.bip-modal{
		max-height:800upx;
	}
</style>