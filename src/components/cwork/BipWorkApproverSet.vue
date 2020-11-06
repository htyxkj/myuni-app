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
                                    <view class="cu-tag round bg-orange light">音乐</view>
                                    <view class="cu-tag round bg-olive light">电影</view>
                                    <view class="cu-tag round bg-blue light">旅行</view>
                                </view>
                            </view>
                        </view>
                    </load-refresh>
                    <button class="cu-btn block bg-blue margin-lr-xl " @click="openUserSelPage"><text class="cuIcon-add"></text> 添加</button>
				</view>
				<view class="cu-bar bg-white justify-end">
					<view class="action">
						<button class="cu-btn bg-green margin-left" @tap="selOk">确定</button>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"
import BipInsAidNew from '@/classes/BipInsAidNew';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import loadRefresh from '@/components/load-refresh/load-refresh.vue';
@Component({
    components:{loadRefresh}
})
export default class BipWorkApproverSet extends Vue{
	@Provide('bipInsAid') bipInsAid: BipInsAidNew = new BipInsAidNew('');//辅助对象
    showDl:boolean = false;
    selType:number =0; /// 0:审批人员；1：抄送人员
    userEditAid:any = "SOPR";
    userList:any=[];
    spMsg:any = "";
    csMsg:any = "";
    async mounted(){
        await this.initInsAid();
    }
    //选择审批人员
    selSpUser(){
        this.selType = 0;
        this.showDl = true;
    }
    //选择抄送人员
    selCsUser(){
        this.selType = 1;
        this.showDl = true;
    }
    //打开用户选择页面
    openUserSelPage(){
        let groupV = ""; 
        let methordName = "MYSORG_PERFINFO"
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
        if(this.userList .length !=0){
            cid = this.userList[this.userList.length-1].cid+1
        }
        user.cid = cid
        this.userList.push(user)
    }
    //确定
    selOk(){
        this.showDl = false;
        if(this.selType == 0){
            let msg = "";
            let len = 3;
            if(len > this.userList.length){
                len = this.userList.length;
            }
            for(var i =0;i<len;i++){
                msg +=this.userList[i].userName
                if(i == len -1 && this.userList.length>3){
                    msg +="…"
                }else{
                    msg +="、"
                }
            }
            this.spMsg = msg+this.userList.length + "人依次审批"
        }else{
            this.csMsg = "抄送"+this.userList.length + "人"
        }
        this.userList = [];
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