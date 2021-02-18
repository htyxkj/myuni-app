<template>
    <view class="bg-white">
        <cu-custom :bgColor="'bg-' + color" :isBack="true">
            <block slot="backText">返回</block>
            <block slot="content"><view class="header-title">{{ title }}</view></block>
        </cu-custom>
        <u-button size="medium bip-margin-10" @click="getCoList">查询</u-button>
        <u-button size="medium bip-margin-10" @click="saveSorties">保存</u-button>
        <u-button size="medium bip-margin-10" @click="mergeSorties">合并</u-button>	
        <template v-if="sortiesCell.ccells.cels">
            <u-collapse>
                <u-collapse-item title="　条件">
                    <template  v-for="(item,index) in sortiesCell.ccells.cels">
                        <bip-comm v-if="(item.attr & 0x400) <=0" :obj_id="'WF0317TJ'" :cell="item" :key="index"></bip-comm>
                    </template>
                </u-collapse-item>
            </u-collapse>
        </template>
            <uni-table  stripe emptyText="暂无更多数据">
                <!-- <u-checkbox-group> -->
                    <uni-tr>
                        <uni-th><u-checkbox v-model="checkAll" @change="checkedAll" ></u-checkbox></uni-th>
                        <uni-th>序号</uni-th>
                        <uni-th>开始时间</uni-th>
                        <uni-th>结束时间</uni-th>
                        <uni-th>平均海拔(m)</uni-th>
                        <uni-th>喷洒时长</uni-th>
                        <uni-th>平均航速(km、h)</uni-th>
                        <uni-th>喷洒里程(km)</uni-th>
                        <uni-th>喷洒面积(亩)</uni-th>
                        <uni-th>平均流量(m3/h)</uni-th>
                        <uni-th>总流量(m3)</uni-th>
                    </uni-tr>
                    <uni-tr v-for="(item,index) in tableData " :key="index">
                        <uni-td>
                            <u-checkbox v-model="item.checked" ></u-checkbox>
                        </uni-td>
                        <uni-td>{{item.jcCid}}</uni-td>
                        <uni-td>{{item.statTime}}</uni-td>
                        <uni-td>{{item.endTime}}</uni-td>
                        <uni-td>{{item.avgHigh}}</uni-td>
                        <uni-td>{{item.sumTimeStr}}</uni-td>
                        <uni-td>{{item.avgSpeed}}</uni-td>
                        <uni-td>{{item.sumDis}}</uni-td>
                        <uni-td>{{item.sumArea}}</uni-td>
                        <uni-td>{{item.avgFlow}}</uni-td>
                        <uni-td>{{item.sumFlow}}</uni-td>
                    </uni-tr>
                <!-- </u-checkbox-group> -->
            </uni-table>
        <mLoad :png="null" :msg="'加载中...'" v-if="loadModal"></mLoad>
    </view>    
</template>

<script lang="ts">
    import {Vue,Provide,Prop,Component} from 'vue-property-decorator';	
    import URIParams from '@/classes/URIParams';
    import { LoginModule } from '@/store/module/login'; //导入vuex模块，自动注入
    import bipTable from "@/components/bip-ui/bip-table/bip-table.vue";
    import CDataSet from '@/classes/pub/CDataSet';
    import CCliEnv from '@/classes/cenv/CCliEnv';
    import bipComm from '@/components/bip-ui/bip-comm/bip-comm.vue';
    import mLoad from '@/components/mLoad.vue';
    import { Tools } from '@/classes/tools/Tools';
    import {BipMenuBtn} from '@/classes/BipMenuBtn'
    import { BIPUtil } from '@/classes/api/request';
    let tools = BIPUtil.ServApi;
    import uniTable from "@/components/uni-ui/uni-table/uni-table.vue";
	import uniTh from "@/components/uni-ui/uni-th/uni-th.vue";
	import uniTr from "@/components/uni-ui/uni-tr/uni-tr.vue";
	import uniTd from "@/components/uni-ui/uni-td/uni-td.vue";
    import QueryEntity from '@/classes/search/QueryEntity';
    import { dataTool } from '@/classes/tools/DataTools';
    const DataUtil = dataTool.utils;
    import BipMenuBar from '@/classes/pub/BipMenuBar';
	@Component({
		components: {bipComm,mLoad,bipTable,uniTable,uniTh,uniTr,uniTd}
	})
	export default class airSortiesInvoke extends Vue {
        src:any = null;
        color:any = "blue";//头部颜色
        title:any = "";//头部标题
        sortiesCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
        saveCell:CDataSet = new CDataSet("");//保存对象
        delCell:CDataSet = new CDataSet("");//删除对象
        @Provide('env') env: CCliEnv = new CCliEnv();
        loadModal:boolean = false;
        tableData:any = [];
        checkAll:boolean = false;
        async onLoad(options:any) {
            this.color = options.color;
            this.title = options.title;
            this.sortiesCell = await Tools.getCell("WF0317TJ");
            this.env.initInfo(new URIParams(), [this.sortiesCell.ccells], new BipMenuBar(), this.sortiesCell, [this.sortiesCell]);
            this.saveCell = await Tools.getCell("FW0320");
            this.delCell = await Tools.getCell("FW0320DEL");
        }
        //  1.获取任务对应架次信息
        async getCoList() {
            try{
                let bk:any = this.sortiesCell.checkNotNull();
                if(!bk[0]){
                    uni.showToast({title:bk[1],icon:"none"});
                    return ;
                }
                this.loadModal = true;
                let btn1 = new BipMenuBtn("DLG","架次统计")
                btn1.setDlgType("D")
                btn1.setDlgCont("airfence.upgrade.serv.sorties.SortiesInvoke*211;0;0");//职能损益表
                let b = JSON.stringify(btn1)
                let prarm = this.sortiesCell.currRecord.data;
                let v = JSON.stringify(prarm);
                let res = await tools.getDlgRunClass(v,b);
                if(res.data.id ==0 ){
                    this.tableData = [];
                    let values = res.data.data.values;
                    for(var i=0;i<values.length;i++){
                        let cc = Object.assign({},values[i]);
                        cc.checked = false;
                        this.tableData.push(cc);
                    }
                }
                this.loadModal = false;
            }catch(err){
                this.loadModal = false;
            }
        }
        //架次合并
        mergeSorties(){
            let checkData =[];
            let checkNum=0;
            for(var i=0;i<this.tableData.length;i++){
                let vl = this.tableData[i];
                if(vl.checked){
                    if(i>=1 && !this.tableData[i-1].checked && checkNum>0){
                        uni.showToast({title:"请勾选连续架次！",icon:"none"});
                        return;
                    }
                    checkNum++;
                    checkData.push(vl);
                }
            }
            if(checkNum == 0){
                uni.showToast({title:"请勾选要合并的架次！",icon:"none"});
                return;
            }
            var flow:any=0,avgFlow:any=0,high:any=0,avgHigh:any=0,speed:any=0,avgSpeed:any='',endTime:any='',syl:any=0,getSYL:any='',jcCid:any='',statTime:any='',sumArea:any=0,sumDis:any=0,sumFlow:any=0,sumPoints:any=0,sumTime:any=0,sumPoints:any=0;
            let jcList = this.tableData//全部架次
            var jc:any = checkData[0];//勾选架次
            for(var i = 0; i<checkData.length;i++){
                var _jcListOne =  checkData[i];
                jcList[_jcListOne.jcCid-1]=null;
                if(i==checkData.length-1){
                    jc.endTime = _jcListOne.endTime; 
                }
                //平均海拔(m)
                high += (parseFloat(_jcListOne.avgHigh)*parseFloat(_jcListOne.sumTime));
                //喷洒时长
                sumTime += parseFloat(_jcListOne.sumTime);
                //(总航速) 用来计算平均航速
                speed +=(parseFloat(_jcListOne.avgSpeed)*parseFloat(_jcListOne.sumTime));
                //喷洒里程(km)
                sumDis += parseFloat(_jcListOne.sumDis);
                //喷洒面积(亩)
                sumArea += parseFloat(_jcListOne.sumArea);
                //每亩药量
                syl += (parseFloat(_jcListOne.getSYL)*parseFloat(_jcListOne.sumArea));
                //平均流量
                flow +=(parseFloat(_jcListOne.avgFlow)*parseFloat(_jcListOne.sumTime));
                //总流量
                sumFlow += parseFloat(_jcListOne.sumFlow); 
                //有效喷洒点
                sumPoints += parseInt(_jcListOne.sumPoints);
            }
            avgHigh = high/sumTime;
            avgSpeed = speed/sumTime
            getSYL = syl/sumArea;
            avgFlow = flow/sumTime
            
            jc.avgHigh=avgHigh.toFixed(4);
            jc.sumTime = sumTime;
            jc.avgSpeed = avgSpeed.toFixed(4);
            jc.sumDis = sumDis.toFixed(4);
            jc.sumArea = sumArea;
            jc.getSYL = getSYL.toFixed(4);
            jc.avgFlow = avgFlow.toFixed(4);
            jc.sumFlow = sumFlow.toFixed(4);
            jc.sumPoints = sumPoints;
            var second:any =  parseInt(sumTime);
            var hours =parseInt((second/3600)+"");
            second =parseInt((second % 3600)+"");
            var minutes =parseInt((second /60)+"");
            second = parseInt((second % 60)+"");
            
            jc.sumTimeStr = hours+"时"+minutes+"分"+second+"秒";
            this.tableData=[];
            var _jcCid = 1;
            for(var j =0;j<=jcList.length;j++){
                let _jc =null;
                if(jc.jcCid==j+1){
                    _jc=jc;
                }else{
                    _jc = jcList[j];
                }
                if(_jc!=null){
                    _jc.jcCid=_jcCid
                        this.tableData.push(_jc);
                    _jcCid++;
                }        
            }
            uni.showToast({title:"合并成功！",icon:"none"});
        }
        //保存架次
        async saveSorties(){
            let bk:any = this.sortiesCell.checkNotNull();
            if(!bk[0]){
                uni.showToast({title:bk[1],icon:"none"});
                return ;
            }
            this.loadModal = true;
            let tjData = this.sortiesCell.currRecord.data;
            let taskid = tjData.sid;//任务编码
            let cr = DataUtil.createRecord(this.delCell,this.env);
		    this.delCell.addRecord(cr);
            this.delCell.currRecord.data.tkid = taskid;
            this.delCell.currRecord.c_state = 4
            await tools.saveData(this.delCell.currRecord, "FW0320DEL", "");
            let taskbt = tjData.bgtime;//任务开始时间
            let tasket = tjData.edtime;//任务结束时间
            let widcloth = tjData.width;//幅宽
            let asid = tjData.asid//飞机编号
            let asidscm = await this.getTHSCM(asid);//通航公司
            let scm = "";//公司
            let sorg = "";//部门
            let usrcode = tjData.tlid;//账户标识
            if(LoginModule.user){
                sorg = LoginModule.user.deptInfo.deptCode
                scm = LoginModule.user.deptInfo.cmcCode
            }
            this.saveCell.cdata.data = [];
            for(var i=0;i<this.tableData.length;i++){
                let oneJD = this.tableData[i];
                let curr = DataUtil.createRecord(this.saveCell,this.env);
                curr.data.tkid = taskid;
                curr.data.ssid = (i+1);
                curr.data.bgtime = taskbt;
                curr.data.edtime = tasket;
                curr.data.widcloth = widcloth;
                curr.data.asid = asid;
                curr.data.asidscm = asidscm;
                curr.data.scm = scm;
                curr.data.sorg = sorg;
                curr.data.bgtime1 = oneJD.statTime;//架次开始时间
                curr.data.edtime1 = oneJD.endTime;//架次结束时间
                curr.data.cooordpoint = oneJD.sumPoints;//有效喷洒点数
                curr.data.avgaltitude = oneJD.avgHigh;//平均海拔
                curr.data.avgspeed= oneJD.avgSpeed;//平均航速(km、h)
                curr.data.avgflow = oneJD.avgFlow;//平均流量(m3/h)
                curr.data.sumtime = oneJD.sumTimeStr;//总时长
                curr.data.sumflow = oneJD.sumFlow;//累积流量(m3)
                curr.data.summileage =  oneJD.sumDis;//总里程;
                curr.data.sumarea =  oneJD.sumArea;//总面积(亩)
                curr.data.avgyl = oneJD.getSYL;//每亩施药量
                curr.data.usrcode = usrcode;
                curr.data.id = taskid+"-"+curr.data.ssid;
                let res = await tools.saveData(curr, "FW0320", "");
                if(res.data.id == -1){
                    uni.showToast({title:"保存失败！",icon:"none"});
                    await tools.saveData(this.delCell.currRecord, "FW0320DEL", "");
                    this.loadModal = false;
                    return;
                }
            } 
            uni.showToast({title:"保存成功！",icon:"none"});
            this.loadModal = false;
        }
         /**
         * 获取通航公司名称
         */
        async getTHSCM(id:any){
            let scmName = "";
            let qe: QueryEntity = new QueryEntity("", "");
            qe.page.currPage = 1;
            qe.page.pageSize = 50000;
            let cont ="a.id = '"+id+"'";
            qe.cont = cont;
            let cc = await tools.getBipInsAidInfo("THSCM", 210, qe);
            if(cc.data.id ==0){
                scmName = cc.data.data.data.values[0].orgname
            }
            return scmName;
        }
        // 全选
		checkedAll(res:any) {
			this.tableData.map((val:any) => {
				val.checked = res.value;
			})
		}
	}
</script>
<style scoped>
.bip-margin-10{
    margin: 10upx;
}
</style>