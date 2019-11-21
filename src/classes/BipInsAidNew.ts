import Cells from './pub/coob/Cells';

export default class BipInsAidNew{
    id:string
    title:string = ''
    labers:Array<string> = []
    showColsIndex:Array<number> = []
    values:Array<any>=[]
    showValues:string = ''
    cells:Cells = new Cells()
    contCells:Cells = new Cells()
    addCells:Cells = new Cells()
    addCellId:string=''
    slink:string=''
    sflag:string = ''
    sref:string=''
    total:number = 0
    groupFld:string=''
    bType:string=''
    mutiple:boolean = false
    cl:boolean = false
    showV:string = ''
    realV:string = ''
    constructor(_id:string){
        this.id = _id
    }
	
	clone(ref:any){
		this.id = ref.id;
		this.title = ref.title;
		this.labers = ref.labers;
		this.showColsIndex = ref.showColsIndex;
		this.cells = ref.cells;
		this.bType = ref.bType;
		this.mutiple = ref.mutiple;
		this.groupFld = ref.groupFld||'';
		this.cl = ref.cl;
		this.slink = ref.slink||'';
		this.sflag = ref.sflag||'';
		this.sref = ref.sref||'';
		if(ref.values){
			this.values = ref.values;
		}
		return this;
	}
	
	makeShow(){
		this.showV = this.realV;
		if(this.cells&&this.cells.cels.length>1){
			let rr = this.values[0];
			if(rr){
				this.showV = rr[this.cells.cels[1].id]||this.realV;
			}
		}
	}
}