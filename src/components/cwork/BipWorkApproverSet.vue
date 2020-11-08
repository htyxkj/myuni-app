<template>
	<view class="margin-top shadow">
		<view class="cu-bar bg-white solid-bottom ">
			<view class="action">
				<text class="cuIcon-titles text-green "></text>
				审批流程
			</view>
		</view>
		<view class="bg-white box">
            <view class="cu-timeline">
                <view class="cu-item text-blue" style="padding-top:0px">
                    <view  class="cu-list menu"> 
                        <view class="cu-item" style="padding:0px">
                            <view class="content padding-tb-sm">
                                <view class="text-black"> 审批人</view>
                                <view class="text-red text-sm">
                                    <template v-if="spMsg">
                                        {{spMsg}}
                                    </template>
                                    <template v-else>
                                        <text class="cuIcon-infofill margin-right-xs"></text> 
                                        请选择审批人
                                    </template>
                                </view>
                            </view>
                            <view class="action">
                                <view class="cuIcon-friendadd add-user" @click="selSpUser"></view>
                            </view>
                        </view>
                    </view>
                </view>
                <view class="cu-item text-blue" style="padding-top:0px">
                    <view  class="cu-list menu"> 
                        <view class="cu-item" style="padding:0px">
                            <view class="content padding-tb-sm">
                                <view class="text-black"> 抄送人</view>
                                <view class="text-gray text-sm">
                                    <template v-if="csMsg">
                                        {{csMsg}}
                                    </template>
                                    <template v-else>
                                        <text class="cuIcon-infofill margin-right-xs"></text> 请选择抄送人
                                    </template>
                                </view>
                            </view>
                            <view class="action">
                                <view class="cuIcon-friendadd add-user" @click="selCsUser"></view>
                            </view>
                        </view>
                    </view>
                </view>
            </view>
		</view>

        <view class="cu-modal" :class="showDl?'show':''">
			<view class="cu-dialog">
				<view class="cu-bar bg-white justify-end">
					<view class="content">
                        <template v-if="selType ==0">
                            审批人员
                        </template>
                        <template v-else>
                            抄送人员
                        </template>
                    </view>
					<view class="action" @tap="showDl = false">
						<text class="cuIcon-close text-red"></text>
					</view>
				</view>
				<view class="padding-xl user-list">
                    <load-refresh ref="loadRefresh" :isRefresh="true" :backgroundCover="'#F3F5F5'" :heightReduce="700">
                        <view class="cu-list menu card-menu margin-top"  slot="content-list">
                            <view class="cu-item" v-for="(item,index) in userList" :key="index">
                                <view class="content align-start">
                                    <text class="text-black">{{item.userName}}</text>
                                </view>
                                <view class="action">
                                    <button v-if="selType == 0" :disabled="disabled || index == 0" class="cu-tag round bg-blue light" @click="updown(0,index)">上移</button>
                                    <button v-if="selType == 0" :disabled="disabled || index == userList.length-1" class="cu-tag round bg-olive light" @click="updown(1,index)">下移</button>
                                    <button :disabled="disabled" class="cu-tag round bg-red light" @click="delRowUser(index)">删除</button>
                                </view>
                            </view>
                        </view>
                    </load-refresh>
                    <button :disabled="disabled" class="cu-btn block bg-blue margin-lr-xl " @click="openUserSelPage"><text class="cuIcon-add"></text> 添加</button>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn bg-green margin-left" @tap="selOk">确定</button>
					</view>
				</view>
			</view>
		</view>
        <message ref="msg"></message>
	</view>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch, Emit ,Inject} from "vue-property-decorator"
import BipInsAidNew from '@/classes/BipInsAidNew';
import CCliEnv from '@/classes/cenv/CCliEnv';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import CDataSet from '@/classes/pub/CDataSet';
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import loadRefresh from '@/components/load-refresh/load-refresh.vue';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
@Component({
    components:{loadRefresh}
})
export default class BipWorkApproverSet extends Vue{
	@Provide('bipInsAid') bipInsAid: BipInsAidNew = new BipInsAidNew('');//辅助对象
	@Inject('env') env!:CCliEnv;
    showDl:boolean = false;
    selType:number =0; /// 0:审批人员；1：抄送人员
    userEditAid:any = "SOPR";
    userList:any=[];
    spMsg:any = "";
    csMsg:any = "";

    bcustSpUser:any = [];//自定义审批人
    bcustCsUser:any = [];//自定义抄送人
    
    @Prop({type:Object}) dsm!:CDataSet
    async mounted(){
        await this.initInsAid();
        this.initBCust()
    }
    //选择审批人员
    selSpUser(){
        this.selType = 0;
        this.userList = this.bcustSpUser;
        if(!this.userList){
            this.userList = [];
        }
        this.showDl = true;
    }
    //选择抄送人员
    selCsUser(){
        this.selType = 1;
        this.userList = this.bcustCsUser;
        if(!this.userList){
            this.userList = [];
        }
        this.showDl = true;
    }
    //打开用户选择页面
    openUserSelPage(){
        let groupV = ""; 
        let methordName = "BCUST_USERINFO"
        uni.$off(methordName,this.userSelectBack)
        uni.$on(methordName,this.userSelectBack);
        uni.showLoading({
            title:'跳转中...'
        })
        uni.navigateTo({url:'/pages/selecteditor/selecteditor?groupV='+groupV+'&editName='+this.userEditAid+"&methordname="+methordName,complete: () => {
            uni.hideLoading();
        }});
    }
    userSelectBack(res:any){
        let showIndex = this.bipInsAid.showColsIndex;
        let cels = this.bipInsAid.cells.cels;
        let user ={cid:0,userId:"",userName:""};
        user.userId = res[cels[showIndex[0]].id]
        user.userName = res[cels[showIndex[1]].id]
        let cid = 0;
        if(!this.userList)
            this.userList =[];
        if(this.userList.length !=0){
            cid = this.userList[this.userList.length-1].cid+1
        }
        user.cid = cid
        this.userList.push(user)
        this.dsm.currRecord.c_state |= 2;
    }
    //上移下移某行
    updown(type:any,index:any){
        let arr1:any = this.userList;
        if(type ==0)
            [arr1[index-1],arr1[index]] = [arr1[index],arr1[index-1]]
        if(type ==1)
            [arr1[index],arr1[index+1]] = [arr1[index+1],arr1[index]]
        this.userList = arr1;
        this.userList.forEach((element:any,index:any) => {
            element.cid = index;
        });
        this.$forceUpdate(); 
        this.dsm.currRecord.c_state |= 2;
    }
    //删除一行
    delRowUser(index:any){
        this.userList.splice(index,1)
        this.dsm.currRecord.c_state |= 2;
    }

    //确定
    selOk(){
        this.showDl = false;
        if(this.selType == 0){
           this.bcustSpUser = this.userList;
        }else{
           this.bcustCsUser = this.userList;
        }
        let res = {type:this.selType,users:this.userList,state:1};
        this.$emit("custSelUserOk",res)
        this.userList = [];
        this.creatMsg();
    }
    async initInsAid(){
        //获取用户辅助对象
        let aidKey = "KEY_"+this.userEditAid
        if(!uni.getStorageSync(aidKey)){
           let res = await InsAidModule.fetchInsAid({ id: 200, aid: this.userEditAid });
           if(res.data.id ==0){
               this.bipInsAid = res.data.data.data
           }
        }else{
            this.bipInsAid = JSON.parse(uni.getStorageSync(aidKey))
        }
    }
    //初始化已选择的审批人抄送人
    initBCust(){
        let crd = this.dsm.currRecord
        tools.saveBCustUser(this.dsm.ceaPars,51).then((res:any)=>{
            if(res.data.id==0){
                this.bcustCsUser = res.data.data.bcustCsUser;
                this.bcustSpUser = res.data.data.bcustSPUser;
                let cc = {type:0,users:this.bcustSpUser,state:0};
                this.$emit("custSelUserOk",cc)
                cc = {type:1,users:this.bcustCsUser,state:0};
                this.$emit("custSelUserOk",cc)
                this.creatMsg();
            }else{
                let msg:any = this.$refs['msg'];
                msg.error({background: true,content:"查询审批人，抄送人出错！"})
            }
        }).catch((err:any)=>{
            uni.showToast({
                title: err+";BaseApplet initBCust",
                icon:"none"
            })
        }).finally(()=>{

        });
    }
    //生成文字信息
    creatMsg(){
        if(this.bcustSpUser){
            let msg = "";
            let len = 3;
            if(len > this.bcustSpUser.length){
                len = this.bcustSpUser.length;
            }
            for(var i =0;i<len;i++){
                msg +=this.bcustSpUser[i].userName
                if(i == len -1 && this.bcustSpUser.length>3){
                    msg +="…"
                }else{
                    msg +="、"
                }
            }
            this.spMsg = msg+this.bcustSpUser.length + "人依次审批"
        }
        if(this.bcustCsUser){
            this.csMsg = "抄送"+this.bcustCsUser.length + "人"
        }
    }
	get disabled(){
        console.log(!DataUtil.currCanEdit(this.dsm,this.env))
		return !DataUtil.currCanEdit(this.dsm,this.env);
	}
}
</script>
<style lang="scss" scoped>
    .add-user{
        font-size: 60upx;
    }
    .user-list{
        text-align: start;
        padding:0px;
    }
</style>