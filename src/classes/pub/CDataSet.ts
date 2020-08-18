import Cells from './coob/Cells';
import CData from './CData';
import CRecord from './CRecord';
import Operation from '../operation/Operation';
import PageInfo from '../search/PageInfo';

import Cell from './coob/Cell';
import CeaPars from '../cenv/CeaPars';
import { baseUtils } from '@/classes/api/baseutils'
let tools = baseUtils.tools;
export default class CDataSet {
	ccells: Cells;
	cdata: CData;
	cont: any = null;
	index: number = -1;
	ds_sub: Array<CDataSet> = new Array<CDataSet>();
	ds_par: any = null;
	p_cell: any = null;
	x_pk: number;
	initOK: boolean = false;
	canEdit: boolean = false;
	currRecord: CRecord = new CRecord();
	// scriptProc: BipScriptProc;
	opera: Operation | null = null;
	page: PageInfo;

	//制单相关的下标
	i_smake: number = -1; //制单人下标
	i_makedate: number = -1; //制单日期下标
	i_hpdate: number = -1; //日期下标
	i_state: number = -1; //状态下标
	i_refs: number = -1; //引用下标

	_total: number = 0; //总数

	hjList: Array<string> = [];
	ceaPars?:CeaPars;//审批流信息
	// baseI?: BaseI;

	constructor(_cells: any) {
		this.ccells = _cells;
		this.cdata = new CData('');
		this.page = new PageInfo(1, 10);
		this.index = -1;
		// this.scriptProc = new BipScriptProc(this.currRecord, this.ccells);
		this.x_pk = this.indexPKID(this.ccells, true, true);
		if (_cells) {
			let pcell = this.ccells.obj_id;
			this.cdata = new CData(_cells.obj_id);
			this.ds_sub = new Array<CDataSet>();
			this.initHJList();
			let n1 = '';
			if (_cells.subLayCells) {
				for (let i = 0; i < _cells.subLayCells.length; i++) {
					let _ds: CDataSet = new CDataSet(_cells.subLayCells[i]);
					this.ds_sub[i] = _ds;
					this.ds_sub[i].ds_par = pcell;
					n1 += _ds.p_cell + ';';
				}
			}

			if (n1.length > 0) {
				n1 = n1.substring(0, n1.length - 1);
				this.p_cell = pcell + '(' + n1 + ')';
			} else {
				this.p_cell = pcell;
			}

			this.initOK = true;
		}
	}

	indexPKID(cell: Cells, bfull: boolean, bcid: boolean): number {
		if (!cell) return 0;
		let cel: Cell;
		let cels: Cell[] = cell.cels;
		let rx: number = -1,
			x0: number = 0,
			cp: number = cell.pkcc,
			xco: number = cell.x_co,
			t0: number = 0,
			t1: number;
		let cc: number = cels.length;
		let atr: number = 0;
		for (let i = 0, cx = 0; cx < cp && i < cc; i++) {
			cel = cels[i];
			atr = cel.attr;
			if ((atr & 1) != 0) {
				if (cel.index != xco) {
					t1 = cel.type;
					if (bcid && t1 === 5 && ((cel.attr & 0x800000) != 0 || cel.id === 'cid')) {
						return x0; //直接用cid时
					}
					t1 = t1 == 12 ? cel.ccLeng : t1 == 4 ? 4 : 2;
					if (t1 > t0) {
						t0 = t1;
						rx = x0;
					}
				}
				x0++;
				cx++;
			} else if (bfull || (atr & 512) != 0) x0++;
		}
		return rx;
	}

	initHJList(): void {
		if (this.ccells) {
			this.ccells.cels.forEach(item => {
				if ((item.attr & 0x2000) > 0) {
					this.hjList.push(item.id);
				}
			});
		}
	}

	/**
	 * 初始化控制参数
	 */
	initContrlIndex() {
		if (this.opera) {
			let opr: Operation = this.opera;
			this.i_hpdate = this.ccells.cels.findIndex(item => {
				return item.id === opr.hpdatefld;
			});
			this.i_smake = this.ccells.cels.findIndex(item => {
				return item.id === opr.smakefld;
			});
			this.i_refs = this.ccells.cels.findIndex(item => {
				return item.id === opr.reffld;
			});
			this.i_state = this.ccells.cels.findIndex(item => {
				return item.id === opr.statefld;
			});
		}
	}

	sayHello(){
		// console.log(123)
	}
	addRecord(cr:CRecord){
		if(this.index<0){
			this.index = 0
		}
		this.cdata.data.push(cr);
		this.currRecord = cr;
		this.index = this.cdata.size()-1;
		if(cr.subs){
			cr.subs.forEach((cdata:CData)=>{
				let id = cdata.obj_id;
				let index = this.ds_sub.findIndex((dsub:CDataSet)=>{
					return dsub.ccells.obj_id === id;
				})
				if(index>-1){
					let cds_s = this.ds_sub[index];
					cdata.data.forEach((c0:CRecord)=>{
						cds_s.addRecord(c0)
					})
				}
			})
		}
	}
	
	getRecord(index:number){
		if(index<0){
			return this.currRecord;
		}
		return this.cdata.data[index];
	}
	
	
	cellChange(mode:any,id:string){
		this.currRecord.data[id] = mode
		this.currRecord.c_state |= 2;
	}
	setState(state:number){
		this.currRecord.c_state = state;
	}
	
	size(){
		return this.cdata.data.length;
	}

	pkCells(){
		return this.ccells.cels.filter((cel:Cell)=>{return (cel.attr&1)>0})
	}

	removeRecord(cr:CRecord){
		let idx = this.cdata.data.findIndex((item:CRecord)=>{
			return item.id == cr.id;
		})
		if(idx>-1){
			this.cdata.data.splice(idx,1);
			this.index -= 1;
			this.currRecord = this.cdata.data[this.index]||new CRecord()
		}
	}
	
	removeIndex(_i:number){
		this.cdata.data.splice(_i,1);
		this.index -= 1;
		this.currRecord = this.cdata.data[this.index]||new CRecord()
	}

	copy(){
		let cdata = new CData(this.ccells.obj_id);
		let datas = new Array<CRecord>();
        this.cdata.data.forEach((cr:CRecord)=>{
            let cr0 = new CRecord();
            cr0.copy(cr);
            cr0.c_state = 3;
            datas.push(cr0);
        });
		cdata.data = datas;
		return cdata;
	}
	
	getRecordAtIndex(_i: number = -1) {
		if (_i === -1) {
			return this.currRecord;
		}
		return this.cdata.getDataAtIndex(_i);
	}
	
	checkNotNull():Array<any>{
		console.log("检查非空！")
        let rtn =[true,""]
        let bok = true;
        this.ccells.cels.forEach(item => {
            if (item.unNull&&bok) {
                let vl = null;
                let hide:any = []; 
                if(this.currRecord.data[item.id]!=null)
                    vl = this.currRecord.data[item.id]+''; 
                if (!vl && hide.indexOf(item.id) == -1) {
					bok =  false;
					rtn[0] = false
					rtn[1] =  "【" + item.labelString + "】不能为空!"
                    return rtn;
                }
            }
        });
        if(bok){
            if (this.ds_sub.length>0) {
                return this.checkChildNotNull(this);
        }
	  }
	  return rtn;
    }

    checkChildNotNull(cds:CDataSet):Array<any>{
		let rtn =[true,""]
        let isok = true;
        cds.ds_sub.forEach(cd0=>{
            if(isok){
                if(cd0.cdata.data.length===0 && !cd0.ccells.unNull){
					rtn[0] = false
					rtn[1] =  "【" + cd0.ccells.desc  + "】不能为空!"
                    isok =  false;
                    return rtn;
                }else{
                    for(let i=0;i<cd0.cdata.data.length;i++){
                        let crd = cd0.getRecordAtIndex(i);
                        cd0.ccells.cels.forEach(item=>{
                            if(isok&&item.unNull){
                                let vl = crd.data[item.id];+'';
                                if (!vl) {
									rtn[0] = false
									rtn[1] =   "子表第"+(i+1)+"行"+item.id+"【" + item.labelString + "】不能为空!"
									isok =  false;
									return rtn;
                                }
                            }
                        });
                    }
                }
            }
            if(cd0.ds_sub.length>0){
                rtn = this.checkChildNotNull(cd0);
            }

        })
        return rtn;
    }

	haveAuth() {
	    let crd = this.currRecord;
	    if (this.i_smake > -1) {
	      let cell = this.ccells.cels[this.i_smake];
	      let smake = crd.data[cell.id];
	      let user = tools.getUser();
	      if (smake == user.userCode) {
	        return true;
	      } else {
	        return user.attr <= 1;
	      }
	    }
	    return true;
	}
	
	/**
   * 判断当前行能否删除
   */
	canDel(): boolean {
		if (this.haveAuth()) {
			let crd = this.currRecord;
			if (this.i_state > -1) {
				let cell = this.ccells.cels[this.i_state];
				let statestr = crd.data[cell.id];
				let state: number = parseInt(statestr);
				return state == 0 || state ==1;
			} else {
				return true;
			}
		}
		return false;
	}
	  /**
	   * 查询单据是否可修改
	   * @param _i 数据下标
	   */
	currCanEdit(_i: number = -1) {
	    //判断是否是临时改
	    if(this.ceaPars){
	      if(this.ccells.attr)
	      if((this.ccells.attr & 0x4000) > 0 && this.ceaPars.statefr !== "6"){
	        return true;
	      }
	    }
	    if((this.ccells.attr & 0x8 )>0){
	      return false;
	    }
	    if (this.ds_par != null) {
	      return this.ds_par.currCanEdit();
	    }
	    let crd = this.currRecord;
	    if (_i !== -1) {
	      crd = this.cdata.getDataAtIndex(_i);
	    }
	    if (crd) {
			if (this.haveAuth()) {
				if (this.i_state > -1) {
				  let cell = this.ccells.cels[this.i_state];
				  let statestr = crd.data[cell.id];
				  let state: number = parseInt(statestr);
				  // if (state == 0) crd.c_state |= 2;
				  return state == 0;
				} else {
				  // crd.c_state |= 2;
				  return true;
				}
			}
	    }
	    return false;
	}
	/**
	 * 判断单据是否可以提交
	 */
	isPosted(): boolean {
		let bpost = true;
		if ((this.currRecord.c_state & 1) > 0 || (this.currRecord.c_state & 2) > 0)
		  bpost = false;
		return bpost;
	}
}
