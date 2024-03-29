
import User from '../User';
import { GlobalVariable } from '@/classes/tools/ICL';
import { baseUtils } from './baseutils';
import QueryEntity from '@/classes/search/QueryEntity';
let Base64 = require('js-base64').Base64;
let tools = baseUtils.tools;
import Request from '@/lib/http/request.js';
const http = new Request();
import comm from '@/static/js/comm.js';
let commURL: any = comm;
http.config.baseUrl = commURL.BaseUri;

export namespace BIPUtil {
	class ServerUtils {
		/**
		 * @description 调用系统登录接口，传入用户信息
		 * @param user 用户信息
		 */
		login(user: User) {
			let param = tools.getLoginParmasUri();
			param.usercode = user.userCode;
			param.pwd = Base64.encode(user.password);
			return this.getFromServer(param);
		}
		/**
		 * @description 登录方法 根据账户登录不需要密码
		 * @param user 用户信息
		 */
		loginWithOutPwd(userCode:string,params:any={}){
			let param = tools.getLoginWithOutPwdParmasUri();
			param.usercode = userCode;
			param = Object.assign(param,params)
			return this.getFromServer(param);
		}
		/**
		 * @description 切换公司
		 */
		switchCMC(cmcCode:any){
			let param = tools.switchCMC(cmcCode);
			param.snkey =  uni.getStorageSync('snkey');
			return this.getFromServer(param);
		}
		/**
		 * 注册方法
		 * @param param 注册信息
		 */
		registered(param:any){
			let pm = tools.getRegisteredParam();
			param = Object.assign(param,pm);
			return this.getFromRegistered(param);
		}
		/**
		 * @description 调用系统API接口，获取菜单参数信息
		 * @param pbuid菜单参数标志
		 * @param pmenuid 菜单标志
		 */
		getMenuParams(pbuid: string, pmenuid: string) {
			let param = tools.getMenuParmasURI(pbuid, pmenuid);
			return this.getFromServer(param);
		}

		/**
		 * @description 获取菜单参数对象信息
		 * @param cellId 对象编码
		 */
		getCCellsParams(pcell: string) {
			let param = tools.getCCellsURI(pcell);
			return this.getFromServer(param);
		}
		
		/**
		 * @description 获取服务器辅助、常量、产品核算单位
		 * @param aid 辅助或者常量ID，或者产品编码
		 * @param id 辅助200，常量，300，辅助取值210，产品核算单位查询400
		 * @param qe 查询条件，有可能有
		 */
		getBipInsAidInfo(aid:string,id:number=200,qe?:QueryEntity){
			if(qe){
				qe.type =3 
			}else{
				qe = new QueryEntity("","")
			}
				
			let param = tools.getBipInsAidParams(aid,id,qe?JSON.stringify(qe):'');
			return this.getFromServer(param);
		}

		/**
		 * @description 修改密码
		 * @param user      User对象
		 * @param newPwd    新密码
		 * @param oldPwd    旧密码
		 */
		upPwd(user: User, newPwd: string, oldPwd: string) {
			let param = tools.getUpPwdParmasUri();
			param.usercode = user.userCode;
			param.newPwd = Base64.encode(newPwd);
			param.oldPwd = Base64.encode(oldPwd);
			return this.getFromServer(param);
		}

		/**
		 * @description 保存数据
		 * @param record   需要保存的数据：currRecord
		 * @param pcellId
		 * @param buid 业务号
		 */
		saveData(record: any, pcellId: string, buid: string) {
			let param = tools.getSaveParams();
			param = Object.assign(param, { pcell: pcellId, buid: buid, jsonstr: JSON.stringify(record) });
			return this.getFromServer(param);
		}
		/**
		 * @description 保存自定义审批人抄送人数据
		 * @param key 单据主键
		 * @param sbuid 业务号
		 * @param bcustspuser 自定义审批人
		 * @param bcustcsuser 自定义抄送人
		 */
		saveBCustUser(ceaParam:any,id:any){ 
			return this.getFromServer(tools.getSaveBCustUserParam(ceaParam,id));
		}

		/**
		 * @description 执行查询普通
		 * @param qe QueryEntity对象
		 */
		query(qe: QueryEntity) {
			let param = tools.getQueryParams(JSON.stringify(qe));
			return this.getFromServer(param);
		}
		/**
		 * @description 根据主对象查询子对象数据
		 * @param qe QueryEntity对象
		 */
		queryChild(qe:QueryEntity){
			let param = tools.getQueryChildParams(JSON.stringify(qe));
			return this.getFromServer(param);
		}

		/**
		 * @description 执行RPT查询
		 * @param qe qe QueryEntity对象
		 */
		queryRPT(qe: QueryEntity) {
			let param = tools.getQueryRPTParams(JSON.stringify(qe));
			return this.getFromServer(param);
		}
		/**
		 * @description 获取业务定义
		 * @param buid 业务号
		 */
		getBULinks(buid: string) {
			let param = tools.getBuidParams(buid);
			return this.getFromServer(param);
		}
		/**
		 * @description 执行审批流 
		 * @param ceaParam CeaPars对象
		 * @param id 33:获取下一个审批节点；34：执行审批；39：执行审批退回；40：执行放弃审核
		 */
		getCheckInfo(ceaParam:any,id:number){
			return this.getFromServer(tools.getCheckInfoParam(ceaParam,id));
		}
		/**
		 * 弹出框执行SQL语句 常量里面定义的 DLG.
		 * @param value 当前选中行内容
		 * @param btn BipMenuBtn 对象
		 */
		getDlgRunSql(value:string,btn:string){
			let param = tools.getDlgRunSqlParams(value,btn);
			return this.getFromServer(param)
		}
		/**
		 * 执行java程序
		 * @param value 当前选中行内容
		 * @param btn BipMenuBtn 对象
		 */
		getDlgRunClass(env:string,btn:string){
			let param = tools.getDlgRunClassParams(env,btn);
			return this.getFromServer(param)
		}

		/**
		 * 
		 * @param par 钉钉应用信息
		 */
		getDDJSAPI_TICKET(par:any){
			let param = tools.getDDJSAPI_TICKET();
			param = Object.assign(param,par);
			return this.getFromServer(param)
		}

		/**
		 * @description 获取任务 或 消息
		 * @param tskim 方法编码，
		 * @param iid 消息编号，
		 * @param state 消息状态，
		 * @param buno 任务编码，
		 * @param buid 任务业务，
		 * @param tousr 用户，
		 * @param page 页数，
		 * @param size 条数，
		 * @param keyword 消息关键字
		 */
		getTaskMsgData(tskim:any,iid:any,state:any,buno:any,buid:any,tousr:any,page:any,size:any,keyword:any){ 
			let param = tools.getTaskMsgParams(tskim,iid,state,buno,buid,tousr,page,size,keyword);
			return this.getFromServer(param)
		}

		/**
		 * @description 调用js http post 请求
		 */
		getFromServer(params: any) {
			params["ioutsys"] = commURL.ioutsys;
			return http.post('/sysapi', params, { header: { 'content-type': 'application/x-www-form-urlencoded' } });
		}
		getFromRegistered(param:any){
			// let data = qs.stringify(param);
			return  http.post(GlobalVariable.REGAPI, param, { header: { 'content-type': 'application/x-www-form-urlencoded' } });
		}

		async uniAppUploadFile(filePath:any,params:any,success:any,fail:any){
			var s='',name, key;
			for(var p in params) {
				if(params.hasOwnProperty(p)) { name = p };
				key = params[p];
				s += "&" + name + "=" + encodeURIComponent(key);
			};
			s = s.substring(1,s.length);
			let url = '/sysupd?'+s
			await uni.uploadFile({
				url: commURL.BaseUri+url,  
				filePath: filePath,
			 	formData: params,
			 	name: params.fileName, 
			 	success:success,
				fail:fail
			});
		}
		/**
		 *@description 获取User对象
		 */
		getUser() {
			return tools.getUser();
		}

	}

	export const ServApi = new ServerUtils();
}
