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
							<text class="cuIcon-search text-blue text-bold"></text>
							<input :adjust-position="false" type="text" placeholder="查询什么呢" confirm-type="search" @confirm="query" v-model="tjAll[0].value" @focus="isShow = false" />
						</view>
					</view>
				</view>
				<view slot="content">
					<view v-for="(item,index) in tjAll" :key="index" style="width:100%">
						<template v-if="index>0">
							<view class="cu-bar search bg-white flex">
								<view class="action" @tap="openList(index)">
									<text>{{item.name}}</text>
									<text class="cuIcon-triangledownfill"></text>
								</view>
								<view class="search-form radius">
									<text class="cuIcon-search text-blue text-bold"></text>
									<input :adjust-position="false" type="text" placeholder="查询什么呢" confirm-type="search"  @confirm="query" v-model="item.value" @focus="isShow = false" />
								</view>
								<uni-icons style="margin-right: 5px;" color="#bbb" size="20" type="close" @click="delTj(index)"/>
							</view>
						</template>
					</view>
					<view class="flex justify-center padding-bottom">
						<button class="cu-btn lines-blue round sm shadow" @click="addTj">
							添加一个
						</button>
					</view>
				</view>
			</uni-collapse-item>
		</uni-collapse>

		<bip-select :arr="cels" :show="isShow" @cancel="cancel" @selectChange="selectChange" @select="selectOK" :showKey="'labelString'" :isStr="false"></bip-select>
	</view>
</template>
<script lang="ts">
import { Vue,Prop, Component,Watch} from 'vue-property-decorator';
import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
import uniCollapse from "@/components/uni-ui/uni-collapse/uni-collapse.vue";
import uniCollapseItem from "@/components/uni-ui/uni-collapse-item/uni-collapse-item.vue";
import uniIcons from '@/components/uni-ui/uni-icons/uni-icons.vue';
import bipComm from '../bip-comm/bip-comm.vue';
@Component({
	components: {bipSelect,uniCollapse,uniCollapseItem,uniIcons,bipComm}
})
export default class bipSearchCon extends Vue{
	@Prop({type:Array,default:[]}) cels!:Array<any>;
	isShow:boolean = false;

	tjIndex:any=0;
	tjAll:Array<any>=new Array<any>();//全部条件
	oneTj:any = {name:"",cellId:"",value:""};

	mounted(){
		this.initOneTj();
	}
	initOneTj(){
		this.tjAll=new Array<any>();
		if(this.cels && this.cels.length>0){
			this.oneTj.name = this.cels[0].labelString
			this.oneTj.cellId = this.cels[0].id
			this.tjAll.push(this.oneTj);
		}
	}
	openList(tjIndex:any){
		this.tjIndex = tjIndex;
		this.isShow = !this.isShow;
	}
	selectChange(e:any){
		if(e !== undefined){
			this.tjAll[this.tjIndex].cellId = e.id;
			this.tjAll[this.tjIndex].name = e.labelString;
		}
		this.hideModal();
	}
	hideModal(){
		this.isShow = false;
	}
	cancel(){
		this.hideModal();
	}
	selectOK(e:any){
		this.selectChange(e)
	}
	addTj(){
		let tj = Object.assign({},this.oneTj)
		let tj_len = this.tjAll.length;
		if(tj_len==this.cels.length)
			return;
		tj.name = this.cels[tj_len].labelString
		tj.cellId = this.cels[tj_len].id
		this.tjAll.push(tj);
	}
	delTj(index:any){
		if(this.tjAll[index].value){
			this.tjAll.splice(index,1)
			this.query();
		}else{
			this.tjAll.splice(index,1)
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
			vl[tj.cellId] = tj.value
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