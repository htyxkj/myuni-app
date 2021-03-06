import { BaseI } from './BaseI';
import CDataSet from '../CDataSet';
import {icl} from '@/classes/tools/CommICL'
import Vue from 'vue';
import XEUtils from 'xe-utils'
import CRecord from '../CRecord';

export class CCalcUI extends Vue implements BaseI{
    cds:CDataSet
    taxlb:number = 0;//0：含税，1：不含税，2：无税
    //币种--本币汇率-统计币汇率-原币值-本币值-统计币值-税-计税类别-
    private nup:string = 'nup';//单价
    private qty:string = 'qty';//数量
    private qtyrt:string = 'qtyrt';//核算基数
    private qtyhs:string = 'qtyhs';//核算数量
    private addtaxrt:string = 'addtaxrt';//增值税率
    private fcy:string = 'fcy';//金额
    private rmb:string = 'rmb';//金额
    private rmbhs:string = 'rmbhs';//无税金额
    private addtax:string = 'addtax';//增值税金
    private methordName:string = '';
    constructor(cds:CDataSet){
        super();
        this.cds = Object.assign({},cds)
        this.methordName = icl.EV_CELL_CHANGE+'_'+this.cds.ccells.obj_id+'_';
    }

    setTaxlb(_taxlb:any){
        this.taxlb = parseInt(_taxlb);
    }
    cellDataChange(cds:CDataSet,cellId:string,value:any):void{  
        let crd:CRecord = cds.currRecord;
        if(cellId==this.qty){
            crd.data[this.qty] = value
            this.caclQtyhs(crd,cds.index,cds)
            this.caclFcy(crd,cds.index,cds)
        }else if(cellId==this.nup){
            crd.data[this.nup] = value
            this.caclFcy(crd,cds.index,cds)
        }else if(cellId == 'taxlb'){
            this.taxlb = parseInt(value)        
            // cds.ds_sub.forEach((cds0:CDataSet)=>{
            //     if(cds0.baseI){
            //         cds0.baseI.taxlb = parseInt(value)
            //         cds0.cdata.data.forEach((row:CRecord,index:number) => {
            //             this.caclFcy(row,index,cds0)
            //         });
            //     }
            // });
        }
    }

    caclQtyhs(crd:CRecord,row:number,cds:CDataSet){
        let _qrt = crd.data[this.qtyrt]
        _qrt = _qrt?_qrt:1
        const _qty = crd.data[this.qty]
        crd.data[this.qtyhs] = _qrt*_qty
        cds.cdata.data[row] = crd
        uni.$emit('datachange','')
        const mm1 = this.getMethordName(cds.ccells.obj_id,this.qtyhs)
        uni.$emit(mm1,{cellId:this.qtyhs,value:crd.data[this.qtyhs],row:row})
    }



    /**
     * 根据单价和数量计算金额
     * @param crd 当前行数据
     * @param row 第几行
     */
    caclFcy(crd:CRecord,row:number,cds:CDataSet){
        let _nup = parseFloat(crd.data[this.nup])
        let _qty = parseFloat(crd.data[this.qty])
        crd.data[this.fcy] = _nup*_qty
        cds.cdata.data[row] = crd
        const mm = this.getMethordName(cds.ccells.obj_id,this.fcy)
        uni.$emit(mm,{cellId:this.fcy,value:crd.data[this.fcy],row:row})
        this.caclRmbhs(crd,row,cds)
    }

    /**
     * 计算无税金额和税额
     * @param crd 要计算的行记录
     * @param row  第几行
     */
    caclRmbhs(crd:CRecord,row:number,cds:CDataSet){
        let _taxrt = crd.data[this.addtaxrt]
        let _fcy = crd.data[this.fcy]
        let _rmbhs = 0,_tax = 0
        //0：含税，1：不含税，2：无税
        switch(this.taxlb){
            case 0:
                _rmbhs = XEUtils.toFixedNumber(_fcy/(1+_taxrt),2)
                _tax = _fcy-_rmbhs;
                break;
            case 1:
                _rmbhs = _fcy
                _tax =  XEUtils.toFixedNumber(_fcy*_taxrt,2)
                break;
            case 2:
                _rmbhs = _fcy
                _tax = 0;
                break;

        }        
        crd.data[this.rmbhs] = _rmbhs
        crd.data[this.addtax] = _tax
        cds.currRecord = crd
        cds.cdata.data[row] = crd
        uni.$emit('datachange','')
        const mm = this.getMethordName(cds.ccells.obj_id,this.rmbhs)
        uni.$emit(mm,{cellId:this.rmbhs,value:crd.data[this.rmbhs],row:row})
        const mm1 = this.getMethordName(cds.ccells.obj_id,this.addtax)
        uni.$emit(mm1,{cellId:this.addtax,value:crd.data[this.addtax],row:row})

        
    }

    getMethordName(obj_id:string,fld:string){
        return icl.EV_CELL_CHANGE+'_'+obj_id+'_'+fld;
    }


}