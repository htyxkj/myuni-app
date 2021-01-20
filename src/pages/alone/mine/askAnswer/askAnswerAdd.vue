<template>
	<view>
		<cu-custom bgColor="bg-zk-top" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">提问</view></block>
		</cu-custom>
		<view class="margin">
			<textarea class="title-textarea" maxlength="80" @input="title_value_change" placeholder="请输入问题 (5~80字)"></textarea>
			<view class="text-right">{{titleValue.length}}/80</view>

			<textarea class="textarea" maxlength="1000" @input="content_value_change" placeholder="对问题补充说明,更快获得优质回答"></textarea>
			<view class="text-right">{{contentValue.length}}/1000</view>
		</view>
		<view class="cu-bar btn-group">
			<button class="cu-btn bg-blue shadow-blur round lg my-btn" @click="release" :disabled="!canPublish">提问</button>
		</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端 问答提问页面
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {Vue,Provide,Prop,Component,Watch} from 'vue-property-decorator';
	import moment from 'moment'
	import comm from '@/static/js/comm.js';
	let commURL: any = comm;
	import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
	import CDataSet from '@/classes/pub/CDataSet';
	import { dataTool } from '@/classes/tools/DataTools';
	const DataUtil = dataTool.utils;
	import CCliEnv from '@/classes/cenv/CCliEnv';
	@Component({
		components:{}
	})
	export default class AskAnswerAdd extends Vue {
		titleValue:any="";
		contentValue:any="";
		type_sid:any = "";
		cellID:string = "A0001501";//
		learningCell: CDataSet = new CDataSet(null);
		canPublish:boolean = false;
		async onLoad(e:any) {
			this.type_sid = e.type_sid
			this.learningCell = await this.initCell(this.cellID);
		}
		/**
		 * 问题标题发生变化
		 */
		title_value_change(e:any){
			this.titleValue = e.detail.value
			if(this.titleValue.length>5){
				this.canPublish = true;
			}
		}
		/**
		 * 问题描述发生变化
		 */
		content_value_change(e:any) {
			this.contentValue = e.detail.value
		}
		get user(){
			return LoginModule.user
		}
		/**
		 * 发表评论
		 */
		async release(){
			let user = this.user;
			if(user){
				this.canPublish =false;
				let cr = DataUtil.createRecord(this.learningCell,new CCliEnv());
				cr.data.type = this.type_sid;
				cr.data.smakename = user.userName;//当前评论人ID
				cr.data.content = this.contentValue;
				cr.data.title = this.titleValue;
				let res:any = await tools.saveData(cr,this.cellID, "");
				if(res.data.id ==0){
					uni.showToast({title:'提问成功',icon:'none'})
					setTimeout(() => {
						uni.navigateBack({
							delta: 1
						});
					}, 200);
				}else{
					uni.showToast({title:res.data.message,icon:'none'})
				}
				this.canPublish = true;
			}else{
				uni.reLaunch({
					'url': '/pages/login/login'
				})
			}
		}

		//获取对象定义
		async initCell(cell:any){
			let res:any = await tools.getCCellsParams(cell);
			if (res.data.id == 0) {
				return new CDataSet(res.data.data.layCels[0]); 
			}else{
				uni.showToast({title:'没有获取到对象定义'+cell,icon:'none'})
				return new CDataSet(null);
			}
		}
	}
</script>
<style scoped>
	uni-page-body{
		background-color: #FFFFFF;
		height: 100%;
	}
	.title-textarea{
		width: 100%;
		height: 100upx;
		border: 1px solid #e8e8e8;
		padding: 10upx;
	}
	.textarea{
		width: 100%;
		border: 1px solid #e8e8e8;
		padding: 10upx;
	}
	.my-btn{
		max-width: 80% !important;
	}
</style>