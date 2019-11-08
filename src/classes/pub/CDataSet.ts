import Cells from './coob/Cells';
import CData from './CData';
import CRecord from './CRecord';
import Operation from '../operation/Operation';
import PageInfo from '../search/PageInfo';

import Cell from './coob/Cell';

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
		console.log(123)
	}
	addRecord(cr:CRecord){
		if(this.index<0){
			this.index = 0
		}
		this.cdata.data.push(cr);
		this.currRecord = cr;
		this.index = this.cdata.size()-1;
	}
	
	getRecord(index:number){
		if(index<0){
			return this.currRecord;
		}
		return this.cdata.data[index];
	}
	
	
	cellChange(mode:any,id:string){
		this.currRecord.data[id] = mode
	}
	
	size(){
		return this.cdata.data.length;
	}
}
