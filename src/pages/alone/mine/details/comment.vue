<template>
	<view>
		<cu-custom bgColor="bg-gradual-pink" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">发表评论</view></block>
		</cu-custom>
		<view class="margin">
			<textarea class="textarea" maxlength="500" @input="valueChange" placeholder="发表你的评论"></textarea>
			<view class="text-right">{{textareaValue.length}}/500</view>
		</view>
		<view class="cu-bar btn-group">
			<button class="cu-btn bg-blue shadow-blur round lg my-btn" @click="release" :disabled="!canPublish">发表</button>
		</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端 发表评论页面
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {Vue,Provide,Prop,Component,Watch} from 'vue-property-decorator';
	import moment from 'moment'
	import { GlobalVariable } from '@/classes/tools/ICL';
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
	export default class Comment extends Vue {
		sid:any = "";
		textareaValue:any = "";
		cellID:string = "B0000001";//
		commentCell: CDataSet = new CDataSet(null);
		parent_comment_id = null;
		parent_comment_user = null;
		canPublish:boolean = true;
		async onLoad(e:any) {
			this.sid = e.sid
			if(e.comment_id){
				this.parent_comment_id = e.comment_id;
			}
			if(e.comment_user)
				this.parent_comment_user = e.comment_user
			this.commentCell = await this.initCell(this.cellID);
			this.canPublish = true;
		}
		valueChange(e:any) {
			this.textareaValue = e.detail.value
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
				let cr = DataUtil.createRecord(this.commentCell,new CCliEnv());
				cr.data.article_id = this.sid;//文章ID
				cr.data.user_id = user.userCode;//当前评论人ID
				cr.data.content = this.textareaValue;
				if(this.parent_comment_id){
					cr.data.parent_comment_id = this.parent_comment_id;
					cr.data.reply_comment_id = this.parent_comment_id;
				}
				if(this.parent_comment_user){
					cr.data.parent_comment_user_id = this.parent_comment_user;
					cr.data.reply_comment_user_id = this.parent_comment_user;
				}
				let res:any = await tools.saveData(cr,this.cellID, "");
				if(res.data.id ==0){
					uni.showToast({title:'评论成功',icon:'none'})
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
				uni.redirectTo({
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
	.textarea{
		width: 100%;
		border: 1px solid #e8e8e8;
		padding: 10upx;
	}
	.my-btn{
		max-width: 80% !important;
	}
</style>