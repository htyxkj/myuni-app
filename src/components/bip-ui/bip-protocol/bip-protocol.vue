<template>
	<view>
		<view class="flex justify-center privacy_protocol" >
			<checkbox-group class="block" style="line-height: 38px;" @change="CheckboxChange">
				<checkbox class="round blue protocol_check" :class="agree_protocol[0].checked?'checked':''" :checked="agree_protocol[0].checked?true:false" value="T"></checkbox>
			</checkbox-group>
			<view class="padding-sm text-black" style="padding-right:0px;padding-left:0px">同意</view>
			<view class="padding-sm" v-for="(item,index) in protocol" :key="index" @click="showPl(item)">{{item.name}}</view>

		</view>
		<view class="cu-modal" :class="modal.show?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">{{modal.name}}</view>
					<view class="action" @tap="modal.show = false">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-xl">
					<scroll-view style="max-height: 900rpx;" scroll-y="true" class="scroll-Y" >
						<view v-html="modal.content"></view>
	                </scroll-view>
				</view>
			</view>
		</view>
	</view>
</template>
<script lang="ts">
let dd = require( 'dingtalk-jsapi');
import { Vue, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import { GlobalVariable } from '@/classes/tools/ICL';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;

import {BIPUtil} from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import QueryEntity from '@/classes/search/QueryEntity';
@Component({
	components: {}
})
export default class bipProtocol extends Vue{

	agree_protocol:any =[{ value: 'T', checked: false }];
	plName:any = "";
	protocol:any = [];
	modal:any = {show:false,name:"",content:""};

	async created(){
		let qe:QueryEntity = new QueryEntity('','');
		let vv:any = await tools.getBipInsAidInfo('PROTOCOL',210,qe);
		if(vv.data.id ==0){
			let vls = vv.data.data.data.values;
			for(var i=0;i<vls.length;i++){
				let vl = vls[i];
				this.plName += vl.name
				this.protocol.push(vl);
				if(i != vls.length-1){
					this.plName += "、";
				}
			}
		}
		let vl =[this.agree_protocol[0].checked,this.plName]
		this.$emit("plChange",vl)
	}

	CheckboxChange(e:any) {
		var items = this.agree_protocol,values = e.detail.value;
		for (var i = 0, lenI = items.length; i < lenI; ++i) {
			items[i].checked = false;
			for (var j = 0, lenJ = values.length; j < lenJ; ++j) {
				if (items[i].value == values[j]) {
					items[i].checked = true;
					break
				}
			}
		}
		let vl =[this.agree_protocol[0].checked,this.plName]
		this.$emit("plChange",vl)
	}
	showPl(item:any){
		this.modal.name = item.name;
		this.modal.content = item.content;
		this.modal.show = true;
	}
}
</script>
<style scoped>
	.privacy_protocol{
		position: absolute;
		left: 50%;
		transform: translate(-50%, 0%);
		color: #2079fff2;
	}
	.protocol_check{
		transform:scale(0.7)
	}
</style>