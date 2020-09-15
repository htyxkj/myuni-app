<template>
	<view>
		<cu-custom bgColor="bg-gradual-pink" :isBack="true" :cusBack="true" @back="back">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">答题</view></block>
		</cu-custom>
		<view class="cu-card article" v-if="oneTopic && !isEnd">
			<view class="cu-item shadow">
				<view class="title">
					<view class="text-cut">
						{{tit_type[oneTopic.tit_type]}}
						{{topicIndex}}/{{topicData.length}}
					</view>
				</view>
				<view class="content">
					<view class="desc">
						<view class="text-content"> 
							{{oneTopic.tit_content}}
						</view>
						<view v-for="(item,index) in oneTopic.child" :key="index">
							<template v-if="isok">
								<view class="text-cut padding-sm radius margin-xs" 
								:class="[
									(item.check ==1 && item.isno ==1) ?'ans-bg-ok':'',
									(item.check ==1 && item.isno == 0) ?'ans-bg-no':'',
									(item.check ==0 && item.isno ==1) ?'ans-bg-no':''
									]"
								>
									{{letter[index]}}.{{item.solution}}
								</view>
							</template>
							<template v-else>
								<view class="text-cut padding-sm radius margin-xs" 
								:class="item.check ==1 ?'ans-bg-sel':'ans-bg'"  @tap="selAns(item)">
									{{letter[index]}}.{{item.solution}}
								</view>
							</template>
						</view>
						<view v-if="oneTopic.answer" class="text-right padding-sm" @tap="shPrompt = true">
							查看提示
						</view>
					</view>
				</view>
				<view v-if="ansSelIndex.length>0">
					<view class="cu-bar btn-group">
						<button class="cu-btn block line-orange lg" style="width:60%" @tap="ok" v-if="!isok" >确定</button>
						<button class="cu-btn block line-orange lg" style="width:60%" @tap="next" v-if="isok" >下一题</button>
					</view>
				</view>
			</view>
		</view>
		<view v-if="isEnd">
			<view class="cu-card article">
				<view class="cu-item shadow">
					<!-- <view class="title">
						<view class="text-cut">
							本次答对题目数
						</view>
					</view> -->
					<view class="title">本次答对题目数</view>
					<view>{{record.successNum}}</view>
					<view class="content">
						<view class="desc">
							<view class="text-content"> 
								{{oneTopic.tit_content}}
							</view>
						</view>
					</view> 
				</view>
			</view>
		</view>
		<view v-if="oneTopic" class="cu-modal bottom-modal" :class="shPrompt?'show':''" @tap="shPrompt = false">
			<view class="cu-dialog">
				<view class="cu-bar bg-white text-right">
					<view class="action text-green" @tap="shPrompt = false"></view>
					<view class="action text-green" @tap="shPrompt = false">确定</view>
				</view>
				<view class="grid col-3 padding margin-bottom">
					{{oneTopic.answer}}
				</view>
			</view>
		</view>
	</view>
</template>

<script lang="ts">
	/**
	 * 张矿微平台移动端 每日答题
	 */
	import {BIPUtil} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import QueryEntity from '@/classes/search/QueryEntity';
	import QueryCont from '@/classes/search/QueryCont';
	import {Vue,Provide,Prop,Component} from 'vue-property-decorator';
	import {BipMenuBtn} from '@/classes/BipMenuBtn'
import { values } from 'xe-utils/methods';
	@Component({
	})
	export default class dayAnswer extends Vue {
		topicData:Array<any> = [];
		tit_type:any={};
		oneTopic:any =null;
		topicIndex:number = 1;
		letter:any =['A','B','C','D','E','F','G','H','I']
		ansSelIndex:any=[];
		shPrompt:boolean = false;
		isok:boolean = false;//当前题是否已答题
		record:any={
			Accuracy:100,//准确率
			errorNum:0,//错题数
			successNum:0,//对题数
			time:'00:00:00',//用时
			record:[]//答题记录
		};//答题记录
		isEnd:boolean = false;//答题结束
		mounted(){
			this.initTitType();
			this.topicData = [];
			this.initData()
		}
		/**
		 * 查询当天题目
		 */
		async initData(){
			let btn1 = new BipMenuBtn("DLG","每日答题")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ExamServlet*201;0;0");//收藏或历史记录
			let b = JSON.stringify(btn1)
            let prarm = {}
            let v = JSON.stringify(prarm);
			let res:any = await tools.getDlgRunClass(v,b);
			if(res.data.id ==0){
				this.topicData = res.data.data.data;
				this.oneTopic = this.topicData[0]
			}else if(res.data.id == -2){
				uni.clearStorage()
				uni.reLaunch({'url':'/pages/login/login'})
			}else{
				uni.showModal({
					title: '系统提示',
					content: '系统错误请联系管理员?',
					confirmText: '确定',
					showCancel:false,
					success: res => {
						uni.navigateBack({
							delta: 1
						}); 
					}
				})
			}
		}
		/**
		 * 查询类别 0单选；1多选；2判断
		 */
		async initTitType(){
			this.tit_type = {};
			// let qe:QueryEntity = new QueryEntity('','');
			// let vv:any = await tools.getBipInsAidInfo('TOPIC.TYPE',300,qe);
			// if(vv.data.id ==0){
			// 	let val = vv.data.data.data.values;
			// 	for(var i=0;i<val.length;i++){
			// 		this.tit_type[val[i].code] = val[i].name
			// 	}
			// }
			this.tit_type = {"0":"单选题","1":"多选题","2":"判断题"}
		}
		/**
		 * 选择选项
		*/
		selAns(item:any){
			this.ansSelIndex=[];
			if(this.oneTopic.tit_type != 1){//单选或判断
				this.ansSelIndex.push(item.item)
				this.oneTopic.child.forEach((it:any) => {
					if(it.item == item.item){
						it.check = 1;
					}else{
						it.check = 0;
					}
					if(it.check ==1){
						this.ansSelIndex.push(it.item)
					}
				});
			}else{//多选
				this.oneTopic.child.forEach((it:any) => {
					if(it.item == item.item){
						if(it.check == 0){
							it.check = 1;
						}else{
							it.check = 0;
						}
					}
					if(it.check ==1){
						this.ansSelIndex.push(it.item)
					}
				});
			}
		}
		/**
		 * 答题
		 */
		ok(){
			this.isok = true;
			let success = 1;//回答正确
			for(var i=0;i<this.oneTopic.child.length;i++){
				let item = this.oneTopic.child[i];
				if((item.check ==1 && item.isno ==0) || (item.check == 0 && item.isno == 1)){
					success = 0;
				}			 
			}
			let jl = {sid:this.oneTopic.sid,state:success};
			if(success ==0 ){
				this.record.errorNum++;
			}else{
				this.record.successNum++;
			}
			this.record.Accuracy = this.record.successNum/this.topicData.length*100
			this.record.record.push(jl);
			if(this.topicIndex == this.topicData.length){
				this.isEnd = true;
			}
		}
		/**
		 * 下一题
		 */
		next(){
			this.ansSelIndex=[];
			this.isok = false
			this.topicIndex++;
			this.oneTopic = this.topicData[this.topicIndex-1];
		}
		/**
		 * 返回
		 */
		back(){
			if(this.isEnd){
				uni.navigateBack({
					delta: 1
				}); 
				return;
			}
			uni.showModal({
				title: '确定要退出答题？',
				content: '退出后作答历史将不会保存',
				cancelText: '继续答题',
				confirmText: '退出',
				success: res => {
					if (res.confirm) {
						uni.navigateBack({
							delta: 1
						}); 
					}
				}
			})
		}
	}
</script>

<style>
.ans-bg{
	background-color: #efefef7d;
	color: black;
}
.ans-bg-sel{
	border: 1px solid #bb987f;
    color: #bb987f;
    background-color: #bb987f12;
}
.ans-bg-ok{
	border: 1px solid #27b345;
    color: #27b345;
    background-color: #27b3452e;
}
.ans-bg-no{
	border: 1px solid #fb0000;
    color: #fb0000;
    background-color: #fb000017;
}
</style>
