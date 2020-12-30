<template>
	<view>
		<view  v-if="showTY >= 0" class="flex justify-center privacy_protocol" >
			<template v-if="showTY==1">
				<checkbox-group class="block" style="line-height: 38px;" @change="CheckboxChange">
					<checkbox class="round blue protocol_check" :class="agree_protocol[0].checked?'checked':''" :checked="agree_protocol[0].checked?true:false" value="T"></checkbox>
				</checkbox-group>
				<view class="padding-sm text-black" style="padding-right:0px;padding-left:0px">同意</view>
			</template>
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
					<scroll-view style="max-height: 850rpx;" scroll-y="true" class="scroll-Y" >
						<view v-html="modal.content"></view>
	                </scroll-view>
				</view>
			</view>
		</view>

		<view class="cu-modal" :class="showpp?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">服务协议和隐私政策</view>
				</view>
				<view class="padding-xl">
					请你务必审慎阅读、充分理解
					<view class="padding-sm" v-for="(item,index) in protocol" :key="index" @click="showPl(item)">{{item.name}}</view>
					各条款，包括但不限于：为了向你提供服务，我们需要收集你的设备信息、
					操作日志等个人信息。
					你可以阅读
					<view class="padding-sm" v-for="(item,index) in protocol" :key="item.sid" @click="showPl(item)">{{item.name}}</view>
					了解详细信息。
					如你同意，请点击“同意”开始接受我们的服务。
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn line-blue text-blue" @tap="closeApp">暂不使用</button>
						<button class="cu-btn bg-blue margin-left" @tap="AgreeToTerms">同意</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script lang="ts">
import { Vue, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import {BIPUtil} from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import QueryEntity from '@/classes/search/QueryEntity';
@Component({})
export default class bipProtocol extends Vue{


	@Prop({ type: Boolean,default:false }) showpp!: any;
	@Prop({ type: Number,default:0 }) showTY!: any;
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

	//同意隐私条款
	AgreeToTerms(){
		uni.setStorageSync('AgreeToTerms',true);
		this.$emit("AgreeToTerms")
	}
	//不同意
	closeApp(){
		// #ifdef APP-PLUS  
		plus.runtime.quit();  
		// #endif
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