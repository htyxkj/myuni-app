<template>
	<view>
		<cu-custom bgColor="bg-zk-top" :isBack="true" :cusBack="true" @back="back">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">答题</view></block>
		</cu-custom>
		<template v-if="isShowType && topicType.length>0">
			<view class="cu-list menu-avatar padding">				
				<view class="cu-item bg-white margin-top-xs" v-for="(item,index) in topicType" :key="index">
					<image class ="cu-avatar bg-white myimg" mode="aspectFill" :src="'../../../../static/mine/askAnswer/'+(index+1)+'.png'" ></image>
					<view class="content"  @tap="initData(item)" >
						<view class="name">{{item.name}}</view>
					</view>
				</view> 
			</view>
		</template>
		<template v-else>
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
									<template v-if="oneTopic.tit_type == '2'">
										<view class="text-cut padding-sm radius margin-xs" :class="item.check ==1 ?'ans-bg-sel':'ans-bg'"  @tap="selAns(item)">
											{{item.solution}}
										</view>
									</template>
									<template v-else>
										<view class="text-cut padding-sm radius margin-xs" :class="item.check ==1 ?'ans-bg-sel':'ans-bg'"  @tap="selAns(item)">
											{{letter[index]}}.{{item.solution}}
										</view>
									</template>
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
					<view class="content" v-if="isok && !istrue">
						<view class="desc">
							<view class="title">
								<view class="text-cut">
									正确答案：
								</view>
							</view>
							<view v-for="(item,index) in oneTopic.child" :key="index">
								<template v-if="item.isno == '1'">
									<view class="text-cut padding-sm radius margin-xs" :class="item.check ==1 ?'ans-bg-sel':'ans-bg'"  @tap="selAns(item)">
										{{letter[index]}}.{{item.solution}}
									</view>
								</template> 
							</view>
						</view>
					</view>
				</view>
			</view>
			<view v-if="isEnd">
				<view class="cu-card article">
					<view class="cu-item shadow"> 
						<view class="title">本次答对题目数</view>
						<view class="succ-num padding-left  text-bold">{{record.successNum}}</view>
						<view style="width:100%">
							<view class="grid text-start col-2">
								<view class="padding">正确率：{{record.Accuracy}}%</view>
								<view class="padding">用时：{{record.time}}</view>
							</view>
							<view class="grid margin-bottom text-start col-2">
								<view class="padding">错题数：{{record.errorNum}}</view>
								<view class="padding">积分：{{record.integral}}</view>
							</view>
						</view>
						<view>
							<view class="cu-bar btn-group">
								<button class="cu-btn block line-grey" @tap="back">返回</button>
								<button class="cu-btn block line-orange" @tap="refresh">再来一组</button>
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
		</template>
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
		animation:any = "";
		topicData:Array<any> = [];
		tit_type:any={};
		oneTopic:any =null;
		topicIndex:number = 1;
		letter:any =['A','B','C','D','E','F','G','H','I']
		ansSelIndex:any=[];
		shPrompt:boolean = false;
		isok:boolean = false;//当前题是否已答题
		istrue:boolean = true;//当前题是否回答正确
		record:any={
			Accuracy:100,//准确率
			errorNum:0,//错题数
			successNum:0,//对题数
			time:'00:00:00',//用时
			integral:0,//积分
			record:[]//答题记录
		};//答题记录
		isEnd:boolean = false;//答题结束
		
		selTopicType:any = null;
		topicType:any=[];
		isShowType:boolean = true;
		startTime:any=null;

		Toggle(){
			this.animation = 'shake'
			setTimeout(()=>{
				this.animation= '';
			}, 1000)
		}

		async mounted(){
			//初始化题目类别，通用题目，专业题目
			await this.initTopicType();
			this.initTitType();
			this.topicData = [];
			this.startTime = new Date();
		}
		async initTopicType(){
			this.topicType = [];
			let qe:QueryEntity = new QueryEntity('','');
			let vv:any = await tools.getBipInsAidInfo('PROBLEM_TYPE',210,qe);
			if(vv.data.id ==0){
				let vl = vv.data.data.data.values;
				// if(vl.length ==1){
				// 	this.initData(vl[0]);
				// }else{
					this.topicType = vl;
				// }
			}
		}
		/**
		 * 查询随机题目
		 */
		async initData(item:any){
			this.selTopicType = item;
			let btn1 = new BipMenuBtn("DLG","每日答题")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ExamServlet*201;0;0");//查询随机题目
			let b = JSON.stringify(btn1)
            let prarm = {type:item.sid}
            let v = JSON.stringify(prarm);
			let res:any = await tools.getDlgRunClass(v,b);
			if(res.data.id ==0){
				this.topicData = res.data.data.data;
				this.oneTopic = this.topicData[0]
				this.isShowType = false;
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
		async ok(){
			this.isok = true;
			let success = 1;//回答正确
			let checkItem=[];
			for(var i=0;i<this.oneTopic.child.length;i++){
				let item = this.oneTopic.child[i];
				if((item.check ==1 && item.isno ==0) || (item.check == 0 && item.isno == 1)){
					success = 0;
				}
				if(item.check){
					checkItem.push(item.item)
				}
			}
			let jl = {sid:this.oneTopic.sid,state:success,checkItem:checkItem};
			if(success ==0 ){
				this.record.errorNum++; 
				this.istrue = false;
			}else{
				this.record.successNum++;
			}
			this.record.Accuracy = parseInt((this.record.successNum/this.topicData.length*100)+"")
			this.record.record.push(jl);
			if(this.topicIndex == this.topicData.length){
				this.isEnd = true;
				await this.statisticsIntegral()
			}
			this.record.time = this.formatDuring(new Date().getTime() - this.startTime.getTime())
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
		 * 统计积分
		 */
		async statisticsIntegral(){
			let btn1 = new BipMenuBtn("DLG","每日答题")
            btn1.setDlgType("D")
            btn1.setDlgCont("mine.serv.ExamServlet*202;0;0");//查询随机题目
			let b = JSON.stringify(btn1)
            let v = JSON.stringify(this.record);
			let res:any = await tools.getDlgRunClass(v,b);
			if(res.data.id ==0){
				let vv = res.data.data;
				this.record.integral = vv.integral;
			}
		}
		/**
		 * 返回
		 */
		back(){
			if(this.isEnd || this.isShowType){
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
		
		/**
		 * 再来一组
		 */
		refresh(){
			this.topicData = [];
			this.oneTopic =null;
			this.topicIndex = 1;
			this.ansSelIndex=[];
			this.shPrompt = false;
			this.isok = false;//当前题是否已答题
			this.record={
				Accuracy:100,//准确率
				errorNum:0,//错题数
				successNum:0,//对题数
				time:'00:00:00',//用时
				integral:0,//积分
				record:[]//答题记录
			};//答题记录 
			this.isEnd = false; 
			this.initData(this.selTopicType);
		}
		/**
		 * 时间格式化  mss  毫秒值
		 */
		formatDuring(mss:any) {
			let hours = parseInt(((mss % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))+'')+'';
			if(hours.length == 1){
				hours = '0'+hours;
			}
			let minutes = parseInt(((mss % (1000 * 60 * 60)) / (1000 * 60))+'')+'';
			if(minutes.length == 1){
				minutes = '0'+minutes;
			}
			let seconds = parseInt(((mss % (1000 * 60)) / 1000)+'')+'';
			if(seconds.length == 1){
				seconds = '0'+seconds;
			}
			return  hours + ":" + minutes + ":" + seconds;
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
.succ-num{
	font-size: 56upx;
}

</style>
