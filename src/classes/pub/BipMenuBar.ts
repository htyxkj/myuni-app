import CDataSet from './CDataSet';
import { BipMenuBtn } from '../BipMenuBtn';
import { icl } from "../tools/CommICL";
import CData from './CData';
let CommICL = icl
export default class BipMenuBar{
    dsm:CDataSet = new CDataSet(null);
    menuList:Array<any> = []
    search:boolean = false
    initOK:boolean = false
    bcheck:boolean = false
    constructor(){            
    }

    private initMenuButton(menuAttr:number){
        if(menuAttr>0){
            this.menuList.splice(0);
            if((menuAttr&CommICL.B_IADD)>0){
                let btn = new BipMenuBtn(CommICL.B_CMD_ADD,"添加")
                btn.setIconFontIcon('add');
                this.menuList.push(btn)
                this.bcheck = true
            }
            if((menuAttr&CommICL.B_ISAVE)>0){
                let btn = new BipMenuBtn(CommICL.B_CMD_SAVE,"保存")
                btn.setIconFontIcon('safe');
                this.menuList.push(btn)
            }
            if((menuAttr&CommICL.B_IWORKEA)>0){
                let btn = new BipMenuBtn(CommICL.B_CMD_SUBMIT,"提交/审核")
                btn.setIconFontIcon('pullup');
                this.menuList.push(btn)
                btn = new BipMenuBtn(CommICL.B_CMD_CHECK_PROCESS,"流程查看")
                btn.setIconFontIcon('sort');
                this.menuList.push(btn)
                // btn = new BipMenuBtn(CommICL.B_CMD_CHECK,"审核")
                // btn.setIconFontIcon('appreciate');
                // this.menuList.push(btn)
            }
            // if((menuAttr&CommICL.B_IFIND)>0){
            //     this.setNavButton(menuAttr)
            // }
            
            if(!this.search){
                let btn = new BipMenuBtn(CommICL.B_CMD_COPY,"复制")
                btn.setIconFontIcon('copy');
                this.menuList.push(btn)
            }
            if((menuAttr&CommICL.B_IDEL)>0){
                let btn = new BipMenuBtn(CommICL.B_CMD_DEL,"删除")
                btn.setIconFontIcon('delete');
                this.menuList.push(btn)
            }
        }
    }

    setNavButton(menuAttr:number){
        if(this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_CLEAR,"清空")
            btn.setIconFontIcon('zk');
            this.menuList.push(btn)
        }
        let btn = new BipMenuBtn(CommICL.B_CMD_FIND,"查找")
        btn.setIconFontIcon('search');
        this.menuList.push(btn)

        if(((menuAttr&CommICL.B_ISTAT)<=0)&&this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_ISTAT,"统计")
            btn.setIconFontIcon('tongji');
            this.menuList.push(btn)
        }
        if(((menuAttr&CommICL.B_IFILE)>0)&&this.search){
            let btn = new BipMenuBtn(CommICL.B_CMD_IFILE,"导出文件")
            btn.setIconFontIcon('xiazai1');
            this.menuList.push(btn)
        }
        if(!this.search){
            btn = new BipMenuBtn(CommICL.B_CMD_FIRST,"第一个")
            btn.setIconFontIcon('first-page');
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_PRIOR,"上一条")
            btn.setIconFontIcon('up');
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_LIST,"1/1")
            btn.setHasIcon(false);
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_NEXT,"下一条")
            btn.setIconFontIcon('next');
            btn.setRight();
            this.menuList.push(btn)
            btn = new BipMenuBtn(CommICL.B_CMD_LAST,"最后一个")
            btn.setIconFontIcon('last');
            btn.setRight();
            this.menuList.push(btn)
        }
    }
	init(attr:number,cds?:any,_repot:boolean = false){
		this.dsm = cds
		this.search = _repot
		this.initMenuButton(attr)
		let da = new CData("")
		if(this.dsm){
		    this.initOK = true;
		}
	}
}