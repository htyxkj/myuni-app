import Request from '@/lib/http/request.js';
import User from '../User';
import { baseUtils } from './baseutils';
import QueryEntity from '@/classes/search/QueryEntity';
import comm from '@/static/js/comm.js';
let commURL: any = comm;
let Base64 = require('js-base64').Base64;
let tools = baseUtils.tools;
const http = new Request();
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
		 * @description 执行查询普通
		 * @param qe QueryEntity对象
		 */
		query(qe: QueryEntity) {
			let param = tools.getQueryParams(JSON.stringify(qe));
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
		 * 弹出框执行SQL语句 常量里面定义的 DLG.
		 * @param value 当前选中行内容
		 * @param btn BipMenuBtn 对象
		 */
		getDlgRunSql(value:string,btn:string){
			let param = tools.getDlgRunSqlParams(value,btn);
			return this.getFromServer(param)
		}

		/**
		 * @description 调用js http post 请求
		 */
		getFromServer(params: any) {
			return http.post('/sysapi', params, { header: { 'content-type': 'application/x-www-form-urlencoded' } });
		}
		
		uniAppUploadFile(file:any,params:any,success:any,fail:any){
			 uni.uploadFile({
			 	url: commURL.BaseUri+'/sysupd?updid=37&snkey='+uni.getStorageSync('snkey'),  
			 	filePath: file,
			 	name: 'file', 
			 	formData: params,
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
