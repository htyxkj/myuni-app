<template>
    <view class="bg-white">
        <cu-custom :bgColor="'bg-' + color" :isBack="true">
            <block slot="backText">返回</block>
            <block slot="content"><view class="header-title">{{ title }}</view></block>
        </cu-custom>
        <u-button size="medium bip-margin-10" @click="getJcList">查询</u-button>	
        <template v-if="sortiesCell.ccells.cels">
            <u-collapse>
                <u-collapse-item title="　条件">
                    <template  v-for="(item,index) in sortiesCell.ccells.cels">
                        <bip-comm v-if="(item.attr & 0x400) <=0" :obj_id="'FW0320TJ'" :cell="item" :key="index"></bip-comm>
                    </template>
                </u-collapse-item>
            </u-collapse>
        </template>
        <bip-table v-if="jcCell.ccells" :ccells="jcCell.ccells"  :tableData="tableData" ></bip-table>
        <!-- @rowClick="rowClick" @onSort="onSort" -->
        <mLoad :png="null" :msg="'加载中...'" v-if="loadModal"></mLoad>
    </view>    
</template>

<script lang="ts">
    import {Vue,Provide,Prop,Component} from 'vue-property-decorator';	
    import URIParams from '@/classes/URIParams';
    import bipTable from "@/components/bip-ui/bip-table/bip-table.vue";
    import CDataSet from '@/classes/pub/CDataSet';
    import CCliEnv from '@/classes/cenv/CCliEnv';
    import bipComm from '@/components/bip-ui/bip-comm/bip-comm.vue';
    import mLoad from '@/components/mLoad.vue';
    import { Tools } from '@/classes/tools/Tools';
    import { BIPUtil } from '@/classes/api/request';
    let tools = BIPUtil.ServApi;
    import QueryEntity from '@/classes/search/QueryEntity';
    import { dataTool } from '@/classes/tools/DataTools';
    const DataUtil = dataTool.utils;
    import BipMenuBar from '@/classes/pub/BipMenuBar';
	@Component({
		components: {bipComm,mLoad,bipTable}
	})
	export default class airSortiesQuery extends Vue {
        src:any = null;
        color:any = "blue";//头部颜色
        title:any = "";//头部标题
        sortiesCell: CDataSet = new CDataSet(""); //飞防任务对象(查询条件)
        jcCell:CDataSet = new CDataSet("");//架次对象
        @Provide('env') env: CCliEnv = new CCliEnv();
        @Provide('noLable') noLable: boolean = false;
        loadModal:boolean = false;
        tableData:any = [];
        checkAll:boolean = false;
        async onLoad(options:any) {
            this.color = options.color;
            this.title = options.title;
            this.sortiesCell = await Tools.getCell("FW0320TJ");
            this.env.initInfo(new URIParams(), [this.sortiesCell.ccells], new BipMenuBar(), this.sortiesCell, [this.sortiesCell]);
            this.jcCell = await Tools.getCell("FW0320");
            let cr = DataUtil.createRecord(this.sortiesCell,this.env);
            DataUtil.checkGS(this.sortiesCell,this.env)
		    this.sortiesCell.addRecord(cr);
        }
        //  1.获取任务对应架次信息
        async getJcList() {
            try{
                this.loadModal = true; 
                let tkid = this.sortiesCell.currRecord.data.sid; 
                let sumarea = this.sortiesCell.currRecord.data.sumarea
                let isvalid = this.sortiesCell.currRecord.data.isvalid
                if(sumarea == null || sumarea =='' || sumarea =='null'){
                    sumarea = "";
                }
                if(isvalid == null || isvalid =='' || isvalid =='null'){
                    isvalid = "";
                }
	            let qe: QueryEntity = new QueryEntity("FW0320", "FW0320");
                qe.page.pageSize=5000;
                qe.cont = "{'tkid':'"+tkid+"','sumarea':'"+sumarea+"','isvalid':'"+isvalid+"'}";
                qe.oprid = 13;
		        let res = await tools.query(qe); 
                this.tableData = []
                if(res.data.id ==0){
                    this.tableData = res.data.data.data.data;
                }
                this.loadModal = false;
            }catch(err){
                this.loadModal = false;
            }
        }
	}
</script>
<style scoped>
.bip-margin-10{
    margin: 10upx;
}
</style>