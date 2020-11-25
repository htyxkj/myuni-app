<template>
	<view>
		<view class="padding bg-white padding-left-xl" @tap.stop="openlist">
			<view class="flex">
				<view class="basis-lg name">{{record.data[myStyle.ref.name]}}</view>
				<view class="basis-sm nup" style="text-align: end;">
					<!-- {{record.data[myStyle.ref.nup]}} -->
					<bip-comm-show :obj_id="obj_id" :cell="getCel(myStyle.ref.nup)" :rowId="rowId" :record="record"></bip-comm-show>
				</view>
			</view>
			<view class="flex">
				<view class="basis-xl">
					<view v-for="(item,index) in type" :key="index" class='cu-tag sm'>{{item}}</view>
				</view>
			</view> 
			<view class="flex logo">
				<view v-if="record.data[myStyle.ref.comimg]" class="cu-avatar sm round" :style="[{backgroundImage:'url('+initImgUrl(record.data[myStyle.ref.comimg])+')'}]"></view>
				<view class="margin-xs sorg">
					{{record.data[myStyle.ref.company]}}
				</view>
			</view>
		</view>
		<view class="border"></view>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component, Inject,Watch } from 'vue-property-decorator';
import CCliEnv from '@/classes/cenv/CCliEnv'
import CDataSet from '@/classes/pub/CDataSet';
import { GlobalVariable } from '@/classes/tools/ICL';
import CRecord from '@/classes/pub/CRecord';
import comm from '@/static/js/comm.js';
let commURL: any = comm;
import bipCommShow from '@/components/bip-customize-ui/bip-comm/bip-comm-show.vue';
@Component({
	components: {bipCommShow}
})
export default class bipListUnitType1 extends Vue {
	@Prop({type:String}) obj_id!:string;
	@Prop({type:Array,default:[]}) cels!:Array<any>;
	@Prop({type:Number,default:0}) rowId!:number;
	@Prop() record!:any;
	@Prop() myStyle!:any;
	type:Array<any> = [];
	openlist(){
		this.$emit('openitem',this.rowId);
	}

	async mounted() {
		let t = this.record.data[this.myStyle.ref.type]
		if(t){
			this.type = t.split(";")
		}
	}

	//获取图片地址
	initImgUrl(fj:any){
		if(fj){
			let fjroot = fj.substring(0,fj.lastIndexOf("/"))
			let name  =  fj.substring(fj.lastIndexOf("/")+1,fj.length)
			let snkey = uni.getStorageSync('snkey');
			snkey = encodeURIComponent(snkey);
			let uri = commURL.BaseUri+GlobalVariable.API_UPD
			let imgUrl = uri+'?snkey='+snkey+'&fjroot='+fjroot+'&updid=36&fjname='+name;
			return imgUrl;
		}else{
			return "";
		}
	}

	getCel(celId:any){
		let cel = null
		if(this.cels){
			for(var i=0;i<this.cels.length;i++){
				if(this.cels[i].id == celId){
					cel = this.cels[i];
				}
			}
		}
		return cel;
	}
}
</script>
<style scoped>
.sorg{
	color: black;
	font-size: 20upx;
}
.name{
    font-size: 32upx;
	font-weight: 500;
	color: black;
	padding-bottom: 25upx;
}
.nup{
    font-size: 32upx;
	font-weight: 500;
	color: red;
	padding-bottom: 25upx;
}
.logo{
	padding-top: 25upx;
}
.border{
	padding: 8upx;
    background-color: #F2F2F2;
}
</style>