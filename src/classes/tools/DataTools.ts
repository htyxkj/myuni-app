import CCliEnv from '@/classes/cenv/CCliEnv';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
import Cells from '@/classes/pub/coob/Cells';
import Cell from '@/classes/pub/coob/Cell';
import User from '@/classes/User';
import Dept from '@/classes/Dept';

import { GlobalVariable } from './ICL'; //常量类
import { DateUtils } from './DateUtils';
import CData from '../pub/CData';
import BipScriptProc from "../pub/BipScriptProc";
let DateTool = DateUtils.DateTool;
let _ = require('lodash');
export namespace dataTool {
	/**
	 * 数据状态类
	 */
	class CRecordState {
		readonly INSERT: number = 1; //--新增
		readonly EDITED: number = 2; //值改变
		readonly DELETE: number = 4; //加删除标志
		readonly EDITSUB: number = 8; //字表改变
		readonly EDITEDPK: number = 0x10; //主键改变
		readonly IMPORT: number = 0x20; //这主要用于导入记录(结合INSERT使用保存时先做更新不存在时再做插入)
		readonly REPLACESUB: number = 0x40; //(替换子表)修改前先删除子表
		readonly HISTORY: number = 0x80; //历史数据(仅做为显示用)
		readonly COPY: number = 0x100; //从其它记录拷贝过来
		readonly DICT: number = 0x200; //记录经过动态字典处理后置上该标记。
		readonly POSTED: number = 0x400; //记录已提交过
	}

	export const billState = new CRecordState();
	/**
	 * 数据工具类
	 */
	class DSTool {
		private _cds: CDataSet = new CDataSet(null);
		private _env: CCliEnv = new CCliEnv();
		
		createRecord(cds: CDataSet, env: CCliEnv): CRecord {
			this._cds = cds;
			this._env = env;
			let modal = this.initModal(this._cds);
			return modal;
		}

		copyRecord(cds: CDataSet, env: CCliEnv){
			let crd0 = cds.currRecord;
			let crd = this.createRecord(cds,env);
			cds.ccells.cels.forEach((cell:any)=>{
				if(!cell.initValue){
					crd.data[cell.id] = crd0.data[cell.id];
				}
			})
			cds.ds_sub.forEach((cd:CDataSet)=>{
				let dt:CData = cd.copy();
				crd.subs.push(dt);
			})
			return crd;
		}

		//初始化M数据
		initModal(cds: CDataSet, isNew: boolean = true): CRecord {
			let ccells: Cells = cds.ccells;
			let mode: CRecord = new CRecord();
			if (ccells == null) {
				return mode;
			}
			let xinc = ccells.autoInc;
			if (xinc > 0) xinc = xinc - 1;
			let cel = ccells.cels[xinc];
			if ((xinc >= 0 && mode.data[cel.id]) || isNew) {
				mode.c_state = mode.c_state | billState.INSERT;
			} else {
				mode.c_state = billState.DICT;
			}
			mode = this.createDataModal(ccells, mode);
			if ((mode.c_state & billState.INSERT) > 0) {
				mode = this.incCalc(ccells, mode);
			}
			return mode;
		}

		createDataModal(cell: Cells, modal: CRecord) {
			let user: User = JSON.parse(uni.getStorageSync('user'));
			let deptInfo: Dept = user.deptInfo;
			cell.cels.forEach((item: Cell) => {
				let iniVl = item.initValue;
				if (!iniVl) {
					if (item.type == 12) modal.data[item.id] = '';
					else {
						if (item.id == 'state' && item.refValue == '{$D.STATE}') {
							modal.data[item.id] = '0';
						} else {
							modal.data[item.id] = '';
						}
					}
				} else {
					if (iniVl == '[!]') {
						iniVl = deptInfo.deptCode;
					}
					if (iniVl == '[$]') {
						iniVl = user.userCode;
					}
					if (iniVl == '[#]') {
						iniVl = deptInfo.cmcCode;
					}
					if ((iniVl == '[Y-M-D]' || iniVl === '0') && item.type === 91) {
						iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YMD);
					}
					if ((iniVl == '[Y-M-D]' || iniVl === '0') && item.type === 93) {
						iniVl = DateUtils.DateTool.now();
					}
					if(iniVl.indexOf('[Y-M-D]') !=-1  && (item.type === 93 || item.type ===91) ){
						iniVl = iniVl.replace('[Y-M-D]',DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YMD));
					}
					if (iniVl == '[Y-M-D]') {
						iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YMD);
					}
					if (iniVl == '[YMD]') {
						iniVl = DateUtils.DateTool.now('YYYYMMDD');
					}
					if (iniVl == '[YM]') {
						iniVl = DateUtils.DateTool.now('YYYYMM');
					}
					if (iniVl == '[Y2M]') {
						iniVl = DateUtils.DateTool.now('YYMM');
					}
					if (iniVl == '[Y-M]') {
						iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_YM);
					}
					if (iniVl == '[Y2-M]') {
						iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_Y2M);
					}
					if (iniVl == '[Y]') {
						iniVl = DateUtils.DateTool.now(GlobalVariable.DATE_FMT_Y);
					}
					if (item.type <= 5 && item.type != 1) {
						if (!iniVl) iniVl = '';
						else {
							if (item.type == 3) iniVl = parseFloat(iniVl) + '';
							else iniVl = parseInt(iniVl) + '';
						}
					}
					modal.data[item.id] = iniVl ? iniVl : '';
				}
				//获取父级字段内容
				if (item.pRefIds.length > 0) {
					if (this._cds.ds_par) {
						let cdPar: CDataSet = this._env.getDataSet(this._cds.ds_par);
						if (cdPar) modal.data[item.id] = cdPar.currRecord.data[item.pRefIds[0]];
					}
				}
			});
			return modal;
		}

		incCalc(cell: Cells, modal: CRecord): CRecord {
			if (cell) {
				let xinc = -1;
				if (cell.pkindex) xinc = cell.pkindex[0];
				if (xinc >= 0) {
					let cel: Cell = cell.cels[xinc];
					let s0 = cel.psAutoInc;
					if (s0 == null || s0 == undefined || s0.length < 1 || cel.type !== 12) {
						let cc = this._cds.cdata.data[this._cds.cdata.data.length - 1];
						if (cc) {
							let vl = cc.data[cel.id];
							if (isNaN(vl)) {
								modal.data[cel.id] = this._cds.cdata.data.length + 1;
							} else {
								modal.data[cel.id] = parseInt(vl) + 1;
							}
						} else {
							modal.data[cel.id] = this._cds.cdata.data.length + 1;
						}
						return modal;
					}
					let ilnk = cel.lnk_inn;
					s0 = this.incCalc2(cell.cels, s0, ilnk, modal);
					if ((cel.attr & 0x10000) == 0) {
						let x0 = s0.lastIndexOf('%');
						s0 = x0 < 1 ? s0 : s0.substring(0, x0 + 1);
					}
					modal.data[cel.id] = s0;
				} else {
					let cell: Cell = this.getPKInt();
					if (cell && cell.id !== 'c_corp') modal.data[cell.id] = this._cds.cdata.data.length + 1 + '';
				}
			}
			return modal;
		}

		incCalc2(cells: Cell[], sinc: string, ilnk: number, modalV: CRecord) {
			let x0 = sinc.indexOf('\r'),
				x1;
			if (x0 > 0) sinc = sinc.substring(0, x0);
			var cc = sinc.charAt(0);
			if (cc == '[') {
				sinc = sinc.substring(1, sinc.length - 1);
			}
			sinc = this.formatVars(sinc);
			// 处理其他关联
			x0 = sinc.indexOf('%');
			if (x0 >= 0) {
				while (x0 >= 0 && ilnk != 0) {
					x1 = (ilnk & 0xff) - 1;
					if (x1 < 0) {
						console.log(sinc + ' autoinc innlink(-1)');
					}
					var refCel = cells[x1];
					var vv = modalV.data[refCel.id];
					sinc = sinc.substring(0, x0) + this.incCalca(refCel, (ilnk >>> 8) & 0xff, vv, x1) + sinc.substring(x0 + 1);
					x0 = sinc.indexOf('%', x0);
					ilnk >>>= 16;
				}
			}
			return sinc;
		}

		incCalca(cel: Cell, iinc: number, orf: string, xdep: any) {
			var t0 = iinc & 0xf0;
			var s0 = '';
			if (t0 == 16) {
				var bbc = orf.match(GlobalVariable.FULLDATE);
				if (bbc == null) orf = DateUtils.DateTool.now();
				if ((iinc & 2) !== 0) {
					s0 += DateUtils.DateTool.getDate(orf, 'YY');
				} else if ((iinc & 1) !== 0) {
					s0 += DateUtils.DateTool.getDate(orf, 'YYYY');
				}
				if ((iinc & 4) !== 0) {
					s0 += DateUtils.DateTool.getDate(orf, 'MM');
				}
				if ((iinc & 8) !== 0) {
					s0 += DateUtils.DateTool.getDate(orf, 'DD');
				}
				return s0;
			}
			if (orf == null) return '0';
			s0 = orf + '';
			return s0;
		}

		getPKInt(): any {
			var cell = this._cds.ccells.cels.find(item => {
				return (item.attr & 1) > 0 && item.type < 12;
			});
			return cell;
		}

		/**
		 * @description 格式化字符串变量
		 * @param sinc
		 * @returns 返回格式化以后的字符串
		 */
		formatVars(sinc: string): string {
			let user: User = JSON.parse(uni.getStorageSync('user'));
			let deptInfo: Dept = user.deptInfo;
			sinc = sinc.replace(/\[!\]/g, deptInfo.deptCode);
			sinc = sinc.replace(/\[#\]/g, deptInfo.cmcCode);
			sinc = sinc.replace(/\[$\]/g, user.userCode);
			sinc = sinc.replace(/\[Y2M\]/g, DateUtils.DateTool.now('YYMM'));
			sinc = sinc.replace(/\[YM\]/g, DateUtils.DateTool.now('YYYYMM'));
			sinc = sinc.replace(/\[YMD\]/g, DateUtils.DateTool.now('YYYYMMDD'));
			return sinc;
		}
		
		/**
		 *  @description 添加一条记录到数据集中
		 *  @param cr 一条数据
		 *  @param cds 数据集
		 *  @param env 数据集环境，包含主子，公式...
		 *  @
		 */
		addRecord(cr:CRecord,cds:CDataSet,env:CCliEnv){
			cds.addRecord(cr);
			if(cds.ds_par){
				let cd0 = env.getDataSet(cds.ds_par);
				if(cd0.size()==0){
					let cr0 = this.createRecord(cd0,env);
					cd0.addRecord(cr0);
				}
				let subs = cd0.currRecord.subs||[];
				if(subs.length>0){
					let _i = _.findIndex(subs,(item:any)=>{
						return item.obj_id = cds.p_cell;
					})
					if(_i>-1){
						cd0.currRecord.subs[_i] = cds.cdata;
					}else{
						cd0.currRecord.subs.push(cds.cdata);
					}
				}else{
					cd0.currRecord.subs.push(cds.cdata);
				}
				let st = cd0.currRecord.c_state;
				cd0.currRecord.c_state = st|billState.EDITSUB;
			}
			this.checkGS(cds,env);
		}
		/**
		 *  @description 删除数据集中的某一条记录
		 */
		deleteRow(rowId:number,cds:CDataSet,env:CCliEnv){
			let size = cds.size();
			if(rowId>=0&&rowId<size){
				cds.cdata.data = cds.cdata.data.filter((item:CRecord,index:number)=>{
					return index !== rowId;
				})
				if(cds.ds_par){
					let cd0 = env.getDataSet(cds.ds_par);
					cd0.currRecord.subs = cd0.currRecord.subs.filter((item:CRecord,index:number)=>{
						return index !== rowId;
					})
				}
				
			}
		}
		
		async checkAllGS(cds:CDataSet,env:CCliEnv) {
		    if(!cds.currRecord){
				return
		    }
		    if (Object.keys(cds.currRecord.data).length === 0) {
				return;
		    }
		    for(let i=0;i<cds.ccells.cels.length;i++){
				let col = cds.ccells.cels[i];
				let scstr = col.script;
				if (scstr && scstr.indexOf("=:") === 0) {
					scstr = scstr.replace("=:", "");
					// 公式计算 
					let vl;
					// console.log(cds.ds_par,cds.ds_par.currRecord)
					//获取父级字段内容
					if(col.pRefIds.length >0){
						if(cds.ds_par){
							let cdm = env.getDataSet(cds.ds_par);
							vl= cdm.currRecord.data[col.pRefIds[0]]
						}
					} else{
						if(cds.scriptProc.data.id != cds.currRecord.id){
							cds.scriptProc = new BipScriptProc(cds.currRecord, cds.ccells);
						}
						vl = await cds.scriptProc.execute(scstr, "", col);
						if(vl && (vl.isNaN || vl == 'NaN'))
							vl = 0;
					}
					if (vl instanceof Array) {
						
					} else {
						if (vl == "Invalid date") {
							let dd = DateUtils.DateTool.now();
							if (col.type == 91) {
								cds.currRecord.data[col.id] = DateUtils.DateTool.getDate(dd,GlobalVariable.DATE_FMT_YMD);
							} else {
								cds.currRecord.data[col.id] = dd;
							}
						} else {
							cds.currRecord.data[col.id] = vl;
						}
					}
				}
				if (scstr) {
					if (col.initValue && (col.attr & 0x80) > 0) {
						if (col.initValue.indexOf("%") > 0) {
							let scval = "%";
							if (cds.currRecord.data[scstr]) {
								scval = cds.currRecord.data[scstr];
							}
							let vl = col.initValue.replace("%", scval);
							cds.currRecord.data[col.id] = vl;
						}
					}
				}
		    }
		}
	
	
		async checkGS(cds:CDataSet,env:CCliEnv,cell:any = null) {
		    if(cell){
		        let id = cell.id
		        for(var i=0;i<cds.ccells.cels.length;i++){
		            let col = cds.ccells.cels[i];
		            let scstr = col.script;
		            if(scstr){
		                let _i = col.refCellIds.findIndex(item=>{
		                    return item == id
		                });
		                let vl;
		                if(_i>-1){
		                    if(scstr && scstr.indexOf("=:") === 0) {
		                        scstr = scstr.replace("=:", "");
		                        //获取父级字段内容
								if(scstr.indexOf("##")>-1){
									scstr = scstr.substr(0,scstr.indexOf("##"));
								}
		                        if(col.pRefIds.length >0){
									if(cds.ds_par){
										let dsm = env.getDataSet(cds.ds_par);
										vl= dsm.currRecord.data[col.pRefIds[0]]
									}
		                        } else{
									if(cds.scriptProc.data.id != cds.currRecord.id){
										cds.scriptProc = new BipScriptProc(cds.currRecord, cds.ccells);
									}
									vl = await cds.scriptProc.execute(scstr, "", col);
									console.log(scstr,vl,'utils');
									if(vl && (vl.isNaN || vl == 'NaN')){
										vl = 0;
									}
								}
								if (vl instanceof Array) {
									console.log('公式计算返回数组',vl)
								} else {
									if (vl == "Invalid date") {
										let dd = DateUtils.DateTool.now();
										if (col.type == 91) {
											cds.currRecord.data[col.id] = DateUtils.DateTool.getDate(dd, GlobalVariable.DATE_FMT_YMD);
										} else {
											cds.currRecord.data[col.id] = dd;
										}
									} else {
										cds.currRecord.data[col.id] = vl;
									}
								}
							}
							if ((col.initValue && (col.attr & 0x80) > 0) &&  (cds.currRecord.c_state & 1)>0) {
								this.incCalc(cds.ccells,cds.currRecord);
							}
							if((col.attr & 0x2000) >0){
								cds.cellChange(vl,col.id);
								//
							}
							this.checkGS(cds,env,col)
		                }
		            }
		        }
		        for(var i=0;i<cds.ds_sub.length;i++){
					let cd = cds.ds_sub[i];
					this.checkGSByRefId(id,cd,env);
		        }
				if(cds.hjList.length>0&&cds.ds_par){
					let vvs: Array<number> = new Array<number>();
					cds.cdata.data.forEach(row => {
						let crd: CRecord = row;
						cds.hjList.forEach((fld: string, index) => {
							let v = crd.data[fld];
							v = v ? parseFloat(v) : 0;
							let v1 = vvs[index];
							v1 = v1 ? parseFloat(v1 + "") : 0;
							vvs[index] = v + v1;
						});
					});
					let dsm = env.getDataSet(cds.ds_par);
					if(dsm){
						cds.hjList.forEach((fld: string, index) => {
							let v = vvs[index];
							// let cel;
							let _i = cds.ccells.cels.findIndex(cell => {
								// if(cell.id == fld ){
								// 	cel =cell;
								// }
								return cell.id == fld;
							});
							if (_i > -1) {
								// dsm.currRecord.data[fld] = v;
								dsm.cellChange(v,fld);
								// this.checkGS(dsm,env);
							}
						});
					}
				}
		    }else{
		        this.checkAllGS(cds,env)
		    }
		}
		
		checkGSByRefId(id:string,cds:CDataSet,env:CCliEnv){
		    if(cds.cdata && cds.cdata.data && cds.cdata.data.length>0){
				cds.ccells.cels.forEach((col:any) => {
					let scstr = col.script;
					if (scstr && scstr.indexOf("=:") === 0) {
						scstr = scstr.replace("=:", "");
						// 公式计算 
						let vl;
						//获取父级字段内容
						if(col.pRefIds.length >0){
							if(cds.ds_par){
								if(col.pRefIds[0] == id){
									let dsm = env.getDataSet(cds.ds_par);
									vl= dsm.currRecord.data[col.pRefIds[0]]
									let currRecord = cds.currRecord;
									for(let j=0;j<cds.cdata.data.length;j++){
										cds.currRecord = cds.cdata.data[j];
										cds.currRecord.data[col.id] = vl;
										this.checkGS(cds,env,col);
										if(cds.currRecord.id == currRecord.id){
											currRecord = cds.currRecord;
										}
										cds.currRecord.c_state |=2;
									}
									cds.currRecord = currRecord;
								}
							}
						}
					}  
				});
		    }
		}
	
		/**
		   * 查询单据是否可修改
		   * @param _i 数据下标
		   */
		currCanEdit(cds:CDataSet,env:CCliEnv,_i:number = -1):boolean {
		    //判断是否是临时改
		    if(cds.ceaPars){
				if((cds.ccells.attr & 0x4000) > 0 && parseInt(cds.ceaPars.statefr) !== 6){
					return true;
				}
		    }
			if(cds.ccells.attr != null){
				if((cds.ccells.attr & 0x8 )>0){
				  return false;
				}
			}
		    if (cds.ds_par) {
				let dsm = env.getDataSet(cds.ds_par)
				return this.currCanEdit(dsm,env);
		    }
		    let crd = cds.currRecord;
		    if (_i !== -1) {
				crd = cds.cdata.getDataAtIndex(_i);
		    }
		    if (crd) {
				if (cds.haveAuth()) {
					if (cds.i_state > -1) {
						let cell = cds.ccells.cels[cds.i_state];
						let statestr = crd.data[cell.id];
						if(statestr==undefined){
							statestr="0";
						}
						let state: number = parseInt(statestr);
						return state == 0 || state == 1;
					} else {
						return true;
					}
				}else{
					uni.showToast({
						icon:"none",
						mask: true,
						title: '当前单据只有制单人可编辑，当前用户非制单人！',  
						duration: 2500,  
					}); 
				}
		    }
		    return false;
		}
	}

	export const utils = new DSTool();
}
