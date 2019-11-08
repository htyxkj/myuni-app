import Dept from './Dept'
/***
 * 用户实体类
 */
export default class User{

    userCode:string
    userName:string
    password:string
    attr:number = 5
	deptInfo:Dept = new Dept()
    constructor(userId:string,userName:string,pwd:string){
        this.userCode = userId;
        this.userName = userName;
        this.password = pwd;
    }
}