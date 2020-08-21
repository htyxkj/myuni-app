<template>
    <div>
        <view class="cu-modal" style="z-index:999999" :class="centerDialogVisible?'show':''">
			<view class="cu-dialog">
                <template v-if="!bchked && isReview">
                    <view class="cu-bar bg-white justify-end">
                        <view class="content">审批意见</view>
                        <view class="action" @tap="centerDialogVisible = false">
                            <text class="cuIcon-close text-red"></text>
                        </view>
                    </view>
                    <view>
                        <view class="cu-form-group margin-top">
                            <textarea maxlength="-1" @input="textareaAInput" placeholder="请输入内容"></textarea>
                        </view>
                    </view>
                </template>
                <template v-else>
                    <view class="cu-bar bg-blue justify-end">
                        <view class="content">{{title}}</view>
                        <view class="action" @tap="centerDialogVisible = false">
                            <text class="cuIcon-close"></text>
                        </view>
                    </view>
                    <view class="bip-work">
                        <template v-if="!isReview">
                            <template v-if="this.cea && this.cea.statefr =='6'  && this.cea.stateto =='6' ">
                                <view class="bip-work-title"><h4>当前节点：<text class="text-blue text-bold">执行</text></h4></view>
                            </template>
                            <template v-else>
                                <view class="bip-work-title"><h3>审批人员</h3></view>
                                <template v-if="chkInfos">
                                    <view v-if="chkInfos.currState.hq" class="bip-select-list" >
                                        <view>
                                            <template v-for="cnodes in chkInfos.currState.cnodes">
                                                <view v-for="user in cnodes.users" :key="user.userName">{{user.userName}}</view>
                                            </template>
                                            <template v-for="cnodes in chkInfos.currState.cnodes">
                                                <view v-for="user in cnodes.userssh" :key="user.userName">{{user.userName}}  √</view>
                                            </template>
                                        </view>
                                    </view>
                                    <view v-if="!chkInfos.currState.hq" class="bip-select-list" >
                                        <view  v-for="user in chkInfos.currState.users" :key="user.userName">{{user.userName}}</view>
                                    </view>
                                </template>
                            </template>
                        </template>
                        <template v-else>
                            <view class="bip-work-title"><h3>审批节点</h3></view>
                            <view class="bip-select-list">
                                <view class="cu-form-group solid-bottom">
                                    <input type="text" v-model="jdShowMode" @tap.stop="jdShow = true" disabled="true"/>
                                    <text :class="['cuIcon-triangledownfill', 'text-grey']" @tap.stop="jdShow = true"></text>
                                    <bip-select :arr="nodeList" :show="jdShow" @cancel="jdShow = false" @selectChange="selectChange" @select="selectChange" :showKey="'stateName'" :isStr="false" :index="1"></bip-select>
                                </view>
                                <!-- <select v-model="stateId" placeholder="请选择" size="small" @change="selectChange">
                                    <option
                                    v-for="item in nodeList"
                                    :key="item.stateId"
                                    :label="item.stateName"
                                    :value="item.stateId">
                                    </option>
                                </select> -->
                            </view>
                            <view class="bip-work-title"><h3>审批人员</h3></view>
                            <view class="bip-select-list">
                                <checkbox-group  @change="checkboxChange">
                                    <label v-for="(item,index) in userList" :key="index">
                                        <label v-for="spuser in item.users" :key="spuser.userCode" >
                                            <checkbox :disabled="item.hq" :checked="userListSelect.indexOf(spuser.userCode)>-1?true:false" :class="userListSelect.indexOf(spuser.userCode)>-1?'checked':''" :value="spuser.userCode" color="#FFCC33" style="transform:scale(0.7)"/>
                                            {{spuser.userName}}
                                        </label>
                                    </label>
                                </checkbox-group>
                            </view>
                            <view v-if="signature" class="view-sm-24"> 
                                <!-- <el-form @submit.native.prevent label-position="right" label-width="60px">
                                    <bip-input-autograph :cell="cell" :cds="cds" :model="signatureValue" :bgrid="false" :row="0" @dataChange="dataChange"></bip-input-autograph>
                                </el-form> -->
                            </view>
                        </template>
                    </view>
                </template>
                <view class="cu-bar bg-white justify-end">
                    <template v-if="!bchked && isReview">
                        <view class="cu-list grid col-3"  style="padding-right:16upx">
                            <view>
                                <button class="cu-btn margin-right bg-white margin-tb-sm" @tap="centerDialogVisible = false">取消</button>
                            </view>
                            <view>
                                <button class="cu-btn margin-right bg-red margin-tb-sm" @tap="overrule" v-if="currState !='0'&& currState!='1'">驳回</button>
                            </view>
                            <view>
                                <button class="cu-btn margin-right bg-blue margin-tb-sm" @tap="bchked = true">确定</button>
                            </view>
                        </view>
                    </template>
                    <template v-else>
                         <view class="cu-list grid col-4" style="padding-right:16upx">
                            <view>
			                    <button class="cu-btn margin-right bg-white margin-tb-sm" @tap="bchked = false" :disabled="!canRetrial">重审</button>
                            </view>
                            <view>
                                <button class="cu-btn margin-right bg-white margin-tb-sm" @tap="centerDialogVisible = false">取消</button>
                            </view>
                            <view>
                                <button class="cu-btn margin-right bg-red margin-tb-sm" @tap="returnBack" :disabled="!canBack">退回</button>
                            </view>
                            <view>
                                <button class="cu-btn margin-right bg-blue margin-tb-sm" @tap="checkUp" :disabled="!isReview">确定</button>
                            </view>
                        </view>
                    </template>
                </view>
            </view>
            <message ref="msg"></message>
		</view>
    </div>
</template>
<script lang="ts">
import { Component, Vue, Provide, Prop, Watch, Emit } from "vue-property-decorator"
// import BipInputAutograph from '../editorn/BipInputAutograph.vue'
import CeaPars from "@/classes/cenv/CeaPars";
import { BIPUtil } from '@/classes/api/request';
let tools = BIPUtil.ServApi;
import User from '@/classes/User';
import {LoginModule} from '@/store/module/login'; //导入vuex模块，自动注入
import CDataSet from '../../classes/pub/CDataSet';
import { values } from 'xe-utils/methods';
import bipSelect from '@/components/bip-ui/bip-select/bip-select.vue'
@Component({
    components:{bipSelect}
})
export default class BipWork extends Vue{
    centerDialogVisible:boolean = false
    loading:boolean = false
    remark:string = '审批通过'
    stateId:string = ''//下一状态
    bchked:boolean = true
    userList:any = []//审批人列表
    userListSelect:any = []//审批人选中列表
    nodeList :Array<any> = []
    currState:string = ""
    cea:CeaPars = new CeaPars({});
    chkInfos:any = null;
    isReview:boolean = false;//是否是当前节点审批人
    canBack:boolean = false;//是否可以退回
    canRetrial:boolean = false;//是否可以重新审核
    smakefld:String = "";//制单人

    signature:boolean = false;//是否需要审批人签名
    signatureValue:any= null;//签名信息
    cell:any={id:"signature",labelString:"签名",}
    cds:CDataSet = new CDataSet("");
    user:any = null;

    jdShow:boolean = false;
    jdShowMode:any = "";
    open(info:any,cea:CeaPars,smakefld:String){ 
        this.jdShow = false;
        if(!this.loginState){
            uni.reLaunch({'url':'/pages/login/login'})
            return;
        }
        this.smakefld = smakefld;
        this.canRetrial = false; 
        this.isReview = false;
        this.canBack = false;
        this.centerDialogVisible = true
        this.bchked = info.currState.checked
        this.currState = info.currState.state
        this.nodeList = info.list
        this.cea = cea
        this.chkInfos = info 
        this.user = LoginModule.user;
        if(!this.user){
            return;
        }
        if (this.cea.statefr == "0" || this.cea.statefr == "1" || this.cea.statefr == "5") {
            if (this.smakefld !== this.user.userCode && this.smakefld != undefined) {
                this.showMsg("只有制单人可以提交!");
                this.centerDialogVisible = false
                return;
            }
        } else {
            if(this.chkInfos.currState.hq){//会签
                if(this.chkInfos.currState.cnodes.length <= 0){//没有人
                    if (this.cea.statefr+'' !== "6") {
                        this.showMsg("没有审批人!"); 
                        return;
                    }
                }
            }else{
                if(!this.chkInfos.currState.users && !this.chkInfos.currState.userssh){
                    if (this.cea.statefr+'' !== "6") {
                        this.showMsg("没有审批人!"); 
                        return;
                    }
                }
                if(!this.chkInfos.list || this.chkInfos.list.length<=0){
                    if(this.cea.statefr+'' !== "6"){
                        this.showMsg("未找到下一审批节点!"); 
                        return;
                    }
                }else{
                    this.chkInfos.list.forEach((item:any) => {
                        if(!item.users && item.stateId !='6'){
                            this.showMsg("节点："+item.stateName+" 未定义审批人！"); 
                        }
                    });
                }
            }
        }
        if(cea.statefr == "0" || cea.statefr == "1" || cea.statefr == "5"){
            this.isReview = true;
        }
        let noCheck = false;
        if(!this.chkInfos.currState.checked)
            noCheck = true;
        let noUser = false;
        if(this.chkInfos.currState.cnodes){
            this.chkInfos.currState.cnodes.forEach((node:any) => {
                if(node.users)
                node.users.forEach((user:any) =>{
                    if(this.user){
                        if(user.userCode == this.user.userCode){
                            noUser = true;
                        }
                    }
                })
            });
        }
        if(this.chkInfos.currState.users){
            this.chkInfos.currState.users.forEach((user:any) =>{
                if(this.user){
                    if(user.userCode == this.user.userCode){
                        noUser = true;
                    }
                }
            })
        }
        if(noUser && noCheck)
            this.isReview = true;
        if(this.user && info.upUser)
        if((info.upUser.userCode == this.user.userCode && !this.bchked )|| cea.statefr =="6"){
            this.canBack = true;
        }
        if(this.chkInfos.currState.checked){
            let sshu = this.chkInfos.currState.userssh
            if(sshu){
                for(var z=0;z<sshu.length;z++){
                    if(this.user){
                        if(sshu[z].userCode == this.user.userCode){
                            this.canBack = true;
                        }
                    }
                }
            }
        }
        if(this.nodeList&&this.nodeList.length>0){ 
            this.stateId = this.nodeList[0].stateId
            this.jdShowMode = this.nodeList[0].stateName
            this.initSelectUser()
        }
    }

    get title(){
        return this.bchked?"提交":"审核"
    }

    initSelectUser(){
        if (this.chkInfos) {
            this.chkInfos.list.forEach((item:any) => {
                if(item.stateId =='6'){
                    if(item.attr && (item.attr&16)>0){//签名
                        this.signature = true;
                    }
                    return;
                }
                if(item.stateId == this.stateId){
                    if(item.hq){//会审 
                        this.userList = [];
                        this.userListSelect = [];
                        if(item.cnodes){
                            for(var j=0;j<item.cnodes.length;j++){
                                let users = item.cnodes[j].users;
                                for(var k=0;k<users.length;k++){
                                    this.userListSelect.push(users[k].userCode)
                                }
                                let u = {node:null,users:[],hq:true}
                                u.node = item.cnodes[j].stateName;
                                u.users = item.cnodes[j].users;
                                this.userList.push(u);
                            }
                        }
                    }else{
                        this.userList = [];
                        this.userListSelect = []; 
                        this.chkInfos.list.forEach((item:any) => {
                            let u = {node:null,users:[],hq:false}
                            let usrCode:any =[];
                            let users:any =[];
                            item.users.forEach((u:any)=>{
                                if(usrCode.indexOf(u.userCode) == -1 ){
                                    usrCode.push(u.userCode);
                                    users.push(u);
                                }
                            })
                            u.node = item.stateName;
                            u.users = users;
                            this.userList.push(u); 
                            if(this.userList.length>0){
                                let user = this.userList[0].users;
                                if(user && user.length>0){
                                    if(item.attr && (item.attr*16)>0){//签名
                                        this.signature = true;
                                    }
                                    if(item.attr && (item.attr&8)>0){//审批人全选
                                        for(var j=0;j<user.length;j++){
                                        this.userListSelect.push(user[j].userCode)
                                        }
                                    }else{
                                        this.userListSelect.push(user[0].userCode)
                                    }
                                }
                            }
                        });
                    }
                }
            });
        }
    }

    selectChange(value:any){
        this.stateId = value.stateId;
        this.jdShowMode = value.stateName
        this.initSelectUser();
        this.jdShow = false;
    }

    //提交审核
    checkUp(){
        if(this.signature){
            if(!this.signatureValue || this.signatureValue ==''){
                this.showMsg("请签名");
                return;
            }
        }
        const ckuser = this.makeUU()
        if(ckuser.length<=0 && this.stateId!="6"){
            this.showMsg("没有审核人！");
            return ;
        }else{
            let check =null;//下一审批节点
            for(var i=0;i<this.chkInfos.list.length;i++){
                let item = this.chkInfos.list[i];
                if(item.stateId == this.stateId){
                check = item;
                break;
                }
            }
            this.cea.stateto = this.stateId;
            this.cea.yjcontext = this.remark;
            this.cea.ckd = this.chkInfos.checked;
            this.cea.tousr = this.makeUU();
            this.cea.signature = this.signatureValue;
            if(check.hq){ //会审
                let cnodes = check.cnodes;
                let schk_mk = "";
                for(var i=0;i<cnodes.length;i++){
                    let node = cnodes[i];
                    schk_mk+= node.stateId+","
                    node.users.forEach((item:any) =>{
                        schk_mk += item.userCode+","
                    })
                    schk_mk = schk_mk.substring(0,schk_mk.length-1);
                    schk_mk +=";"
                }
                schk_mk = schk_mk.substring(0,schk_mk.length-1);
                this.cea.schk_mk = schk_mk; 
            }

            //当前审批节点
            let cuCheck = this.chkInfos.currState;
            if(cuCheck.hq){//当前进行审批的节点是会签
                cuCheck.cnodes.forEach((item:any)=>{
                if(item.users){
                    item.users.forEach((usr:any)=>{
                        if(this.user){
                            if(usr.userCode == this.user.userCode){
                                this.cea.stateagr = item.stateId;
                            }
                        }
                    })
                }
                })
            }else{
                this.cea.stateagr = cuCheck.stateId;
            } 

            this.loading = true
            tools.getCheckInfo(this.cea,34).then((res:any)=>{
                if(res.data.id ==0){
                    let msg = this.bchked?"提交":"审核";
                    msg += '成功！';
                    this.showMsg(msg,"success");
                    this.$emit('checkOK',this.stateId)
                    setTimeout(() => {
                        this.centerDialogVisible = false    
                    }, 800);
                }else{
                    this.showMsg(res.data.message)
                }
            }).catch((err:any)=>{
                this.showMsg(err+";BipWork checkUp")
            }).finally(()=>{
                this.loading = false
            })
        }
    }

    makeUU() {
      let ids = "";
      for (let i = 0; i < this.userListSelect.length; i++) {
        ids += this.userListSelect[i] + ",";
      }
      if (ids.length > 0) {
        ids = ids.substring(0, ids.length - 1);
      }
      return ids;
    }

    //提交退回
    async returnBack(){
      if (this.chkInfos) {
        this.loading = true;
        let check = false;
        if(this.chkInfos.currState.hq){//是回去 查询 当前人是否审批过
            if(this.chkInfos.currState.cnodes){
                this.chkInfos.currState.cnodes.forEach((nodes:any) => {
                    if(nodes.userssh){
                        nodes.userssh.forEach((user:any) => {
                            if(this.user){
                                if(user.userCode == this.user.userCode){
                                    check = true;
                                }
                            }
                        });
                    }
                });
            }
        }
        if (this.chkInfos.currState.checked || check) {
            this.cea.stateto = this.chkInfos.currState.stateId;
            this.cea.statefr = this.chkInfos.currState.stateId;
            var id = 39;
            if (this.chkInfos.currState.stateId !== "6") {
                id = 40;
            } 
            tools.getCheckInfo(this.cea,id).then((res:any)=>{
                if(res.data.id ==0){
                    this.showMsg('退回成功！','success')
                    this.$emit('checkOK',this.chkInfos.upState)
                    setTimeout(() => {
                        this.centerDialogVisible = false
                    }, 800);
                }else{
                    this.showMsg(res.data.message)
                }
            }).catch((err:any)=>{
                this.showMsg(err+";BipWork returnBack")
            }).finally(()=>{
                this.loading = false
            }) 
        } else {
            this.cea.stateto = this.chkInfos.upState;
            this.cea.statefr = this.chkInfos.currState.stateId;
            var id = 39; 
            tools.getCheckInfo(this.cea,id).then((res:any)=>{
                if(res.data.id ==0){
                    this.showMsg('退回成功！','success')
                    this.$emit('checkOK',this.chkInfos.upState)
                    setTimeout(() => {
                        this.centerDialogVisible = false
                    }, 800);
                }else{
                    this.showMsg(res.data.message)
                }
            }).catch((err:any)=>{
                this.showMsg(err+";BipWork returnBack")
            }).finally(()=>{
                this.loading = false
            })
        }
      }
    }
    //驳回
    overrule(){ 
        let cuCheck = this.chkInfos.currState;
        if(cuCheck.hq){//当前进行审批的节点是会签
            cuCheck.cnodes.forEach((item:any)=>{
            if(item.users){
                item.users.forEach((usr:any)=>{
                    if(this.user){
                        if(usr.userCode == this.user.userCode){
                            this.cea.stateto = item.stateId;
                        }
                    }
                })
            }
            })
        }else{
            this.cea.stateto = this.chkInfos.currState.stateId;
        }
        this.cea.bup = "2";
        this.cea.tousr =this.smakefld; 
        this.cea.yjcontext = this.remark;
        this.cea.signature = this.signatureValue;
        var id=34;
        this.loading = true;
        tools.getCheckInfo(this.cea,id).then((res:any)=>{
            if(res.data.id==0){
                this.showMsg('驳回成功！','success')
                this.$emit('checkOK',this.chkInfos.upState)
                setTimeout(() => {
                    this.centerDialogVisible = false
                }, 800);
            }else{
                this.showMsg('驳回失败！')
            }
        }).catch((err:any)=>{
            this.showMsg(err+";BipWork overrule")
        }).finally(()=>{
            this.loading = false
        })
    }

    //签名变化
    dataChange(value:any){
        this.signatureValue = value;
    }
    //勾选审批人
    checkboxChange(e:any){
        this.userListSelect = e.detail.value
    }

    showMsg(message:any,state:string='err'){
        let msg:any = this.$refs['msg'];
        if(state == 'err'){
            msg.error({background: true,content:message})
        }else if(state =='success'){
            msg.success({background: true,content:message})
        }
    }
    get loginState(){
        let v = LoginModule.loginState
        if(!v){
            let value = uni.getStorageSync('isLogin');
            if(value){
                LoginModule.setState(true)
                let user = JSON.parse(uni.getStorageSync('user'))
                LoginModule.setUser(user)
                let ms = JSON.parse(uni.getStorageSync('menus'))
                LoginModule.setMenus(ms)
                let snkey = uni.getStorageSync('snkey')
                LoginModule.setSnKey(snkey)
                return true;
            }
        }
        return v;
    }
    textareaAInput(e:any) {
        this.remark = e.detail.value
    }
}
</script>
<style lang="scss" scoped>
    .bip-work{
        min-height: 400upx;
		margin: 0 20upx;
    }
    .bip-work-title{
        margin-top: 20upx;
        h3{
            font-size: 18px;
        }
        text-align: start;
    }
    .bip-select-list{
        text-align: start;
        margin-top: 10upx;
        // margin-left: 30upx;
    }
    .btn{
        margin-left: 20upx;
    }
</style>