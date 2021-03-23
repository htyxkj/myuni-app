<template>
	<view style="background-color: #ffffff;" class="bipCardMyCard">
		<u-card padding="5">
			<view slot="body" v-if="countData">
				<u-row justify="flex-end" class="top1">
					<u-col span="3">
						<u-row justify="flex-end" @click="gotoMenu(0)">
							<u-col span="12" class="title">{{countData.title}}</u-col>
							<u-col span="12" class="value">{{countData.value}}</u-col>
						</u-row>
					</u-col>
					<u-col span="9" v-if="d1.proportion ==1">
						<template v-for="(it,index) in circleData" :span="12/(circleData.length)">
							<u-circle-progress :active-color="circleColor[index]" :border-width="8" :key="index"  bg-color='rgb(255 255 255 / 0%)' :width="130" :percent="circleData[circleData.length-1-index].value" style="float: right;    margin: 6px;">
								<view class="u-progress-content">
									<view class="u-progress-dot"></view>
									<text class='u-progress-info' :style="{'color':circleColor[index]}">{{circleData[circleData.length-1-index].title}}</text>
								</view>
							</u-circle-progress>
						</template>
					</u-col>
				</u-row>
				<u-row class="top1 top2">
					<u-col v-for="(item,index) in cardData" :key="index" :span="12/(cardData.length)">
						<u-row justify="flex-end" @click="gotoMenu(index+1)">
							<u-col span="12" class="title">{{item.title}}</u-col>
							<u-col span="12" class="value">{{item.value}}</u-col>
						</u-row>
					</u-col>
				</u-row>
			</view>
		</u-card>
	</view>
</template>
<script lang="ts">
	import {Vue,Prop,Component} from 'vue-property-decorator';
	import QueryEntity from '@/classes/search/QueryEntity';
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import URIParams from '@/classes/URIParams'
	import { Tools } from '@/classes/tools/Tools';
	@Component({
		components:{}
	})
	export default class BipCard extends Vue {
		@Prop({default:null}) layoutdata?:any;
		uriParams: URIParams = new URIParams();
		d1:any = null;
		cardData:any= null;
		countData:any = null;
		circleData:any=[];
		circleColor:any=["#35EB4B","#FF5087","#FF2B5D"];
		mounted() {
			this.d1 = JSON.parse(this.layoutdata.content)
			this.getValue();
		}
		async getValue(){
			this.cardData =[];
			this.countData = null;
			this.circleData=[];
			if(this.d1 && this.d1.refname){
				let qe:QueryEntity = new QueryEntity('','');
				qe.page.currPage = 1;
				qe.page.pageSize = 1;
				let vv:any = await tools.getBipInsAidInfo(this.d1.refname,200,qe);
				let insaid = vv.data.data.data;
				vv = await tools.getBipInsAidInfo(this.d1.refname,210,qe);
				if(vv.data.id ==0){
					let vl = vv.data.data.data.values[0]
					if(vl){
						let title1 =this.d1.title;
						let title2 = this.d1.title2;
						let num =1;
						for(var i=0;i<title1.length;i++){
							let id = insaid.cells.cels[insaid.showColsIndex[i]].id;
							let t = title1[i];
							let dd = {title:t,value:vl[id]};
							if(i==0){
								num = vl[id];
								this.countData = dd;
							}else{
								this.cardData.push(dd);
							}
							if(i>0){
								t=title2[i-1]
								let val = vl[id]/num*100;
								if(isNaN(val)){
									val = 0;
								}
								let cirdd = {title:t,value:val};
								this.circleData.push(cirdd);
							}
						}
					}
				}
			}
		}
		//打开菜单
		gotoMenu(index:any){
			if(this.d1.url){
				let url = this.d1.url;
				let item = Tools.findMenu(url[index]);
				if(item){
					let cuIconList = [{
						cuIcon: 'cardboardfill',
						color: 'blue',
					}, {
						cuIcon: 'recordfill',
						color: 'orange',
					}, {
						cuIcon: 'picfill',
						color: 'yellow',
					}, {
						cuIcon: 'noticefill',
						color: 'olive',
					}, {
						cuIcon: 'upstagefill',
						color: 'cyan',
					}, {
						cuIcon: 'clothesfill',
						color: 'blue',
					}, {
						cuIcon: 'discoverfill',
						color: 'purple',
					}, {
						cuIcon: 'questionfill',
						color: 'mauve',
					}, {
						cuIcon: 'commandfill',
						color: 'purple',
					}, {
						cuIcon: 'brandfill',
						color: 'mauve',
					}]
					index = parseFloat((Math.random()*10).toFixed(0));
					let cr = cuIconList[index%10].color;
					let vm:any = Object.assign(item);
					vm.color = cr;
					Tools.openMenu(vm)
				}
			}
		}
	}
</script> 
<style lang="scss">
.bipCardMyCard{
	background-image:url('../../../static/BIP/card_back.png');
	border-radius: 10px !important;
	background-repeat: no-repeat;
	background-size: 100% 100%;
    margin: 0px 10px !important;
	height: 376rpx;
	.u-card{
		background-color: initial !important;
	}
	view{
		background-color: initial !important;
	}
}
</style>
<style scoped>
.top1{
	margin: 14px;
}
.top1{
	margin: 14px;
	margin-bottom: 20px;
}
.title{
	color: white;
	font-size: 12px;
}
.value{
	color: white;
	font-size: 24px;
}
</style>