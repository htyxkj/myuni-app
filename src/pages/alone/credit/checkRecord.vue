<template>
	<view class="body bg-white">
		<cu-custom bgColor="bg-gradual-pink" :isBack="true">
			<block slot="backText">返回</block>
			<block slot="content"><view class="header-title">{{title}}</view></block>
		</cu-custom>
        <template v-if="loadTrue">
            <bip-comm v-for="(item,index) in uiCels" :obj_id="cellId" :cell="item" :key="index"></bip-comm>
            <u-collapse class="padding">
                <u-collapse-item title="条件" >
                    <bip-comm v-for="(item,index) in tjCels" :obj_id="cellATjId" :cell="item" :key="index"></bip-comm>
                    <u-button type="primary" @click="findTable">查询</u-button>
                </u-collapse-item>
            </u-collapse>
            <view class="padding"></view>
            <bip-table style="padding-bottom:200rpx" :ccells="cellA.ccells"  :tableData="tableData"  @rowClick="rowClick"></bip-table>
        </template>
		<mLoad :msg="'加载中...'" v-if="loadModal"></mLoad>
	</view>
</template>

<script lang="ts">
	import {Vue,Provide,Component} from 'vue-property-decorator';
    import BipMenuBar from '@/classes/pub/BipMenuBar';
    import URIParams from '@/classes/URIParams';
	import mLoad from '@/components/mLoad.vue';
	import QueryEntity from '@/classes/search/QueryEntity';
    import CDataSet from '@/classes/pub/CDataSet';
    import { BIPUtil } from '@/classes/api/request';
    let servTools = BIPUtil.ServApi;
    import { Tools } from '@/classes/tools/Tools';
    import CCliEnv from '@/classes/cenv/CCliEnv';
    import bipComm from '@/components/bip-ui/bip-comm/bip-comm.vue';
    import bipTable from "@/components/bip-ui/bip-table/bip-table.vue";
    let _ = require('lodash');
	@Component({
		components: {
			mLoad,
            bipComm,
            bipTable
		},
	})
    /**
     * 工单信息-打卡记录
     */
	export default class checkRecord extends Vue {
        @Provide('env') env: CCliEnv = new CCliEnv();
        @Provide('noLable') noLable:boolean = false;
        @Provide('mbs') mbs: BipMenuBar = new BipMenuBar();
        uriParam: URIParams = new URIParams();
        title:any = "";
        loadModal:boolean = false;
        loadTrue:boolean = false;
        cellId:any = "J10008";//主表对象ID
        cellAId:any = "J10008A";//子表对象ID
        cellATjId:any = "J10008ATJ";//子表对象查询条件
        //主对象字段
        uiCels:any=[];
        //条件字段
        tjCels:any=[];
        cell: CDataSet = new CDataSet(null);
        cellA: CDataSet = new CDataSet(null);
        cellATJ: CDataSet = new CDataSet(null);
        tableData:any=[]
        tableJump:boolean =false;
        child_mcont:any = "";
		async onLoad(e:any){
            this.loadTrue = false;
            this.loadModal = true;
            try {
                this.title = e.title;
                this.cellA = await Tools.getCell(this.cellAId);
                this.cell = await Tools.getCell(this.cellId);
                this.uiCels = this.cell.ccells.cels.filter(item=>{
                    return item.attr?(item.attr&0x400)==0:true
                });
                this.cellATJ = await Tools.getCell(this.cellATjId);
                this.tjCels = this.cellATJ.ccells.cels.filter(item=>{
                    return item.attr?(item.attr&0x400)==0:true
                });
                this.cell.ccells.attr = this.cell.ccells.attr | 0x8
                let data = await this.findData(this.cellId,e.qcont,'');
                data.data.forEach((cr:any)=>{
                    this.cell.addRecord(cr);
                })
                this.child_mcont ='gdsid='+e.qcont.split("=")[1]
                let dataA = await this.findData(this.cellAId,this.child_mcont,'');
                dataA.data.forEach((cr:any)=>{
                    this.tableData.push(cr);
                })
                this.cell.ds_sub=[this.cellATJ]
                this.env.initInfo(this.uriParam, [this.cell.ccells,this.cellATJ.ccells], this.mbs, this.cell, []);
                this.initPbuid();
                this.loadModal = false;
                this.loadTrue =true;
            } catch (error) {
                console.log(error)
                this.loadModal = false;
                this.loadTrue =true;
            }
		}
        /**
         * 查询数据
         */
        async findData(celId:any,mcont:any,cont:any,tcell:any=null){
            if(tcell == null){
                tcell = celId;
            }
            let qe: QueryEntity = new QueryEntity(celId,tcell);
            qe.mcont = mcont;
            qe.oprid = 13;
            qe.cont = cont;
            let res = await servTools.query(qe);
            if(res.data.id ==0){
                return res.data.data.data;
            }else{
                return [];
            }
        }
        /**
         * 查询子表
         */
        async findTable(){
            let tjdata = this.cellATJ.currRecord.data;
            let tj:any ={};
            if(Object.keys(tjdata).length>0){
                let keys = Object.keys(tjdata);
                for(var i =0;i<keys.length;i++){
                    if(tjdata[keys[i]]){
                        tj[keys[i]] = tjdata[keys[i]]
                    }
                }
            }
            this.tableData = [];
            let dataA = await this.findData(this.cellAId,this.child_mcont,tj,this.cellATjId);
            dataA.data.forEach((cr:any)=>{
                this.tableData.push(cr)
            })
        }

        async initPbuid(){
            await servTools.getMenuParams('J10012','J10012').then((res:any)=>{
                let data = res.data
                if(data.id>=0){
                    let _uriParams = data.data.mparams
                    uni.setStorageSync('J10012',JSON.stringify(_uriParams));
                }
            });
        }
        //表格点击行
        async rowClick(cellId:any,rowId:number,data:any){
            this.openList(rowId);
        }
        //跳转到详情页面
        openList(rid:number){
            if (!this.tableJump) {
                this.tableJump = true;
                uni.showLoading({
                    title: '跳转中...'
                });
                let cr0 = this.tableData[rid];
                let arr:Array<any> = this.cellA.pkCells();
                let qcont = ''
                if(arr.length>0){
                    qcont = this.makeQueryCont(cr0,arr);
                }
                uni.navigateTo({
                    url: '/pages/appreport/appreportdetail?pbuid=' + 'J10012'+ '&color=' + "blue" + '&title=' + this.title +'&qcont='+encodeURIComponent(qcont),
                    complete: () => {
                        uni.hideLoading();
                        this.tableJump = false;
                    }
                });
            }
        }
        //组成条件项
        makeQueryCont(cr0:any,cels:Array<any>){
            let qs = '';
            if(cels.length>0){
                for(var i=0;i<cels.length;i++){
                    let item = cels[i];
                    let vr = cr0.data[item.id];
                    let type = item.type;
                    if(type==12){
                        if(vr){
                            qs+=item.id+"='"+vr+"'";
                        }
                    }else{
                        if(vr !== undefined &&vr != null &&vr !==''){
                            qs+=item.id+"="+vr;
                        }
                    }
                    if(i<cels.length-1){
                        qs+=" and ";
                    }
                }
            }
            return qs;
        }
	}
</script>

<style scoped> 
</style>
