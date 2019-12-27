<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="label">
			<view class="title">{{ cell.labelString }}</view>
		</template>
		<input type="text" v-model="sModes" disabled="true"/>
		<text class="text-progress text-bold cuIcon-list" @tap.stop="open()"></text>
		<!-- <bip-tree :show="showFda" :hide="hide" :title="title"></bip-tree> -->
		<view class="cu-modal" :class="showFda ? 'show' : ''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end text-left solids-bottom">
					<view class="content">{{title}}</view>
					<view class="action" @tap.stop="hide">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
					<scroll-view class="bg-white bip-tree-content" scroll-y>
						<bip-tree ref="tree"
							:root="root" 
							:show-radio="!mutiple"
							:show-checkbox="mutiple"
							@on-change1="onChange" leaf-only
							:selected="selected"
							:checked="checked"	></bip-tree>
					</scroll-view>
			</view>
		</view>
	</view>	
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import Cell from '@/classes/pub/coob/Cell';
import CRecord from '@/classes/pub/CRecord';
import BipInsAidNew from '@/classes/BipInsAidNew';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
// import bipTree from './bip-tree.vue';
import QueryEntity from '@/classes/search/QueryEntity';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
@Component({
	components: {}
})
export default class bipTreeEditor extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	@Prop({type:Boolean,default:false}) label!:boolean;
	@Prop({type:Number,default:-1}) rowId!:number;
	@Prop({ type: Object }) bipInsAid!:BipInsAidNew;
	mode:string = '';
	showV:string = '';
	imgList = [];
	showFda:boolean = false;
	cds:CDataSet = new CDataSet(null)
	title:string = '';
	root:any = {children:[],id:'',label:''};
	selected:any = {id:'',label:''};
	checked:Array<any> = []
	mutiple:boolean = false;
	qe:QueryEntity = new QueryEntity("","");//查询实体
	created(){
		this.root.children = []
		this.cds = this.env.getDataSet(this.obj_id);
		this.mode = this.record.data[this.cell.id];
		let mkey = this.obj_id+"_"+this.cell.id
		uni.$on(mkey,this.cellDataChange);
		this.mutiple = this.bipInsAid.mutiple;
		this.title = this.bipInsAid.title;
		let sref = this.bipInsAid.sflag
		let vvs = sref.split(',');
		if(vvs.length>3){
			this.title = vvs[vvs.length-1]
		}
		this.findData();
		if(this.mode){
			if(!this.mutiple){
				this.selected.id = this.mode
			}else{
				let rr = this.mode.split(';');
				this.checked = [];
				rr.forEach((id:any)=>{
					let it:any;
					it.id = id;
					this.checked.push(it);
				});
			}
		}
	}
	
	findData(item:any=null){
		if(item){
			this.qe.cont = item.id;
		}else{
			this.qe.cont = ''
		}
		this.qe.oprid = 16;
		tools.getBipInsAidInfo(this.bipInsAid.id,210,this.qe).then((res:any)=>{
			let rr = res.data
			if(rr.id == 0){
				let datas = rr.data.data;
				if(!item){
					datas.forEach((c:any)=>{
						this.root.children.push(c)
					})
				}else{
					this.root.children.forEach((p:any,index:number)=>{
						if(p.id == item.id){
							this.$set(p, 'children', datas);
							this.$set(p, 'haveChildren', true);
						}
					})
				}
				if(this.mode){
					this.initShow();
				}
			}else{
				uni.showToast({
					title:rr.message
				})
			}
		});
	}
	
	open(){
		this.showFda = true;
	}
	
	get sModes(){
		return this.showV||this.mode;
	}
	
	hide(){
		this.showFda = false;
	}
	
	cellDataChange(){
		// console.log('监听值变化');
		this.recordChange();
	}
	
	findItemById(id:string,cld:Array<any>){
		let checked:any = null ;
		cld.forEach((it:any)=>{
			if(it.id===id){
				checked =  it;
				return checked;
			}
			if(this.hasChildren(it)){
				let rr = this.findItemById(id,it.children);
				if(rr){
					checked =  rr;
					return checked;
				}
			}
		});
		return checked;
	}
	
	initShow(){
		if(!this.mutiple){
			let rr:any = this.findItemById(this.mode,this.root.children);
			console.log(rr,'');
			if(rr){
				this.showV = rr.label;
			}
		}else{
			let rs = this.mode.split(';');
			let rv = ''
			rs.forEach((id:string)=>{
				let rr:any = this.findItemById(id,this.root.children);
				if(rr){
					rv+=rr.label+";";
				}else{
					rv+=rr.id+";";
				}
			});
			this.showV = rv.substr(0,rv.length-1);
		}
	}
	
	hasChildren(item:any){
		return item.children?item.children.length>0:false;
	}
		
	@Watch('record')
	recordChange(){
		// console.log('监听值变化recordChange');
		let rr = this.record.data[this.cell.id];
		if(rr !== this.mode){
			this.mode = rr||''
		}
	}
	
	get record():CRecord{
		return this.cds.getRecord(this.rowId)
	}

	onChange(inf:any){
		const checked = inf;
		let vv = '';
		let vvN = '';
		console.log(inf)
		if(!this.mutiple){
			let rr = checked[0]
			vv = rr.id;
			vvN = rr.label;
		}else{
			// this.checked = checked;
			checked.forEach((it:any)=>{
				vv+=it.id+";";
				vvN+=it.label+";";
			})
			vv = vv.substr(0,vv.length-1);
			vvN = vvN.substr(0,vvN.length-1);
		}
		this.showV = vvN;
		this.record.data[this.cell.id] = vv;
		this.mode = vv;
	}
}
</script>
<style>
.bip-tree-content{
	min-height: 400upx;
	max-height: 600upx;
}
</style>