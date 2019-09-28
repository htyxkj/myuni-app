export class Menu{
    menuId:string;
    menuName:string;
    haveChild:boolean;
    command:string;
    menuAttr:number;
    top: boolean;
    menuIcon:string;
    childMenu:Array<Menu>=[];

    constructor(menuid:string,menuname:string,command:string = '',menuatr:number = 0,btop:boolean = false,bchild:boolean = true,menuIcon:string=''){
        this.menuId = menuid
        this.menuName = menuname
        this.command = command
        this.menuAttr = menuatr
        this.top = btop;
        this.haveChild = bchild;
        this.menuIcon = menuIcon;
    }

    public addChild(value:Menu):void {
        this.childMenu.push(value);
    }
}