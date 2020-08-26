<template>
    <view class="cu-modal" :class="showDlg?'show':''">
        <view class="cu-dialog">
            <view class="cu-bar bg-white justify-end">
                <view class="content">流程查看</view>
                <view class="action" @tap="showDlg = false">
                    <text class="cuIcon-close text-red"></text>
                </view>
            </view>
            <view class="padding-left-xl padding-right-xl padding-top-sm mycontent">
                <view v-for="(item,index) in info" :key="index">
                    <view style="position: relative;">
                        <img class="image2" src="@/static/check/process/process_ty.png">
                        <view class="grid col-2 oneList" v-if=" (item.stfr == '驳回' || item.stfr == '新建')">
                            <view class="text-left">&nbsp;&nbsp;{{item.namefr}}<br/>&nbsp;&nbsp;<span style="color:#8FB95C;font-size: 10px">发起申请</span></view>
                            <view class="text-right">
                                <span style="font-size:11px">
                                    {{item.datefr}}
                                </span>
                            </view>
                        </view>
                    </view>
                    <view style="position: relative;">
                        <img class="image2" v-if="item.cid < 0 && item.cid != -20000" src="@/static/check/process/process_bh.png">
                        <img class="image2" v-else-if="item.cid == -20000" src="@/static/check/process/process_ds.png">
                        <img class="image2" v-else src="@/static/check/process/process_ty.png">
                        <view class="grid col-2 oneList">
                            <view class="text-left">&nbsp;&nbsp;{{item.nameto}}</view>
                            <view class="text-right">
                                <span style="font-size:11px">
                                    {{item.datefr}}
                                </span>
                            </view> 
                            <view class="text-left">&nbsp;&nbsp;<span style="color:#8FB95C;font-size: 10px">{{item.stto}}</span></view>
                            <view class="text-right">
                                <span style="font-size:11px">
                                    {{item.dscto}}
                                </span>
                            </view>
                        </view>
                        <div>
                            <img class="image3" v-if="item.cid <0 && item.cid != -20000" src="@/static/check/process/process_bh1.png">
                            <img class="image3" v-else-if="item.cid == -20000" src="@/static/check/process/process_ds1.png">
                            <img class="image3" v-else src="@/static/check/process/process_ty1.png">
                        </div>
                    </view> 
                </view> 
            </view>
            <view class="cu-bar bg-white justify-end">
                <view class="action">
                    <button class="cu-btn bg-green margin-left" @tap="showDlg = false">确定</button>
                </view>
            </view>
        </view>
    </view>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
@Component({})
export default class BipWorkProcess extends Vue{
    chkinfo:any;
    info:Array<any> = [];
    showDlg:boolean = false;
    async open(ceaParams:any){ 
        let res:any = await tools.getCheckInfo(ceaParams,35);
            if(res.data.id == 0){
            this.info = res.data.data.info;
        } 
        let res1:any = await tools.getCheckInfo(ceaParams,35);
        if(res1.data.id == 0){
            this.chkinfo = res1.data.data.info;
        }
        if(this.chkinfo && this.chkinfo.chkInfos && this.chkinfo.chkInfos.length>0){
            let data = this.info[this.info.length-1];
            if(data && !data.nameto){
                let name ="";
                this.chkinfo.chkInfos .forEach((item:any)=> {
                    name += item.userName+" , "
                });
                name = name.substring(0,name.length-1)
                this.info[this.info.length-1].nameto=name; 
                this.info[this.info.length-1].cid=-20000; 
            }
        }
        this.showDlg = true;    
    }
}
</script>
<style lang="scss" scoped>
.oneList{
    padding: 30upx;
    background-color: white;
    margin-bottom: 5px;
}
.image2{
    height: 50upx;
    position: absolute;
    left: -26upx;
    top: 40upx;
}
.image3{
    height: 50upx;
    position: absolute;
    top: 64upx;
}
.mycontent{
    height: 500upx;
    overflow-y: auto;
}
</style>