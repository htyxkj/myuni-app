import { GlobalVariable } from '@/classes/tools/ICL';
import comm from '@/static/js/comm.js';
let commURL: any = comm;

import moment from 'moment';
import BipInsAidNew from '@/classes/BipInsAidNew';
import Cells from '@/classes/pub/coob/Cells';
import Cell from '@/classes/pub/coob/Cell';
import Menu from '@/classes/Menu';
import User from '@/classes/User';
/**
 * @description 基础工具类，用于包装访问API参数
 */
export namespace baseUtils {
	class Utils {
		/**
		 * @description 获取登录参数 只提供apiId和dbid，
		 * @returns 返回是一个object{apiId:'login',dbid:'xx'}
		 */
		getLoginParmasUri(): any {
			return Object.assign({ apiId: GlobalVariable.API_ID_LOGIN, dbid: commURL.BaseDBID });
		}
		/**
		 * @description 获取免密登录系统参数
		 * @returns 返回是一个object{apiId:'xxx',dbid:'xx'}
		 */
		getLoginWithOutPwdParmasUri() {
		  return Object.assign({
			apiId: GlobalVariable.APIID_OUTLOGIN,
			dbid: commURL.BaseDBID
		  });
		}
		/**
		 * @description 切换公司
		 * @returns 返回是一个object{apiId:'xxx',dbid:'xx'}
		 */
		switchCMC(cmcCode:any) {
			return Object.assign({
				apiId: GlobalVariable.APIID_SWITCHCMC,
				dbid: commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user')).userCode,
				cmcCode:cmcCode
			});
		}
		/**
		 * @description 获取注册系统参数
		 * @returns 返回是一个object{typeid:2,dbid:'xx'}
		 */
		getRegisteredParam(){
		  return Object.assign({
			typeid: 2,
			dbid: commURL.BaseDBID
		  });
		}
		/**
		 * @description 根据菜单号和菜单参数好获取菜单参数信息
		 * @param sbuid  菜单参数标志
		 * @param menuId  菜单号
		 * @returns 返回是一个object{apiId:'xxx',dbid:'xx',usercode:'xxx',pbuid:'xxx',pmenuid:'xxx'}
		 */
		getMenuParmasURI(sbuid: string, menuId: string) {
			return Object.assign({
				apiId: GlobalVariable.APIID_MPARAMS,
				dbid: commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user')).userCode,
				pbuid: sbuid,
				pmenuid: menuId
			});
		}

		/**
		 * @description 获取查询参数信息
		 * @param qe 查询对象字符串（经过JSON.stringfy()）
		 * @returns 返回的是一个Object{xxx:xxx}
		 */
		getQueryParams(qe: string) {
			return Object.assign({
				apiId: GlobalVariable.APIID_QUERY,
				dbid: commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user')).userCode,
				qe: qe
			});
		}
		/**
		 * @description 根据主对象查询子对象
		 * @param qe 查询对象字符串（经过JSON.stringfy()）
		 * @returns 返回的是一个Object{xxx:xxx}
		 */
		getQueryChildParams(qe: string) {
			return Object.assign({
				apiId: GlobalVariable.APIID_FINDCHILDDATA,
				dbid: commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user')).userCode,
				qe: qe
			});
		}
		
		/**
		 * @description 获取辅助/常量元素对象
		 * @param aId 辅助后者常量ID
		 * @param id 200 辅助,300常量
		 */
		getBipInsAidParams(aId: string,id:number=200,qe?:string) {
			return Object.assign({
			  apiId: GlobalVariable.APIID_BIPINSAID,
			  dbid: commURL.BaseDBID,
			  usercode: JSON.parse(uni.getStorageSync('user')).userCode,
			  aid: aId,
			  id:id,
			  qe:qe
			});
		}

		/**
		 * @description 获取RPT查询参数
		 * @param qe 查询条件
		 * @returns 返回的是一个Object{xxx:xxx}
		 */
		getQueryRPTParams(qe: string) {
			return Object.assign({
				apiId: GlobalVariable.APIID_QUERYRPT,
				dbid: commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user')).userCode,
				qe: qe
			});
		}

		/**
		 * @description 获取业务信息参数
		 * @param buid 业务号
		 * @returns 返回的是一个Object{xxx:xxx}
		 */
		getBuidParams(buid: string) {
			return Object.assign({
				apiId: GlobalVariable.APIID_BUID,
				dbid: commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user')).userCode,
				buid: buid
			});
		}

		/**
		 * @description 获取保存数据的参数
		 * @returns 返回的是一个Object{xxx:xxx}
		 */
		getSaveParams() {
			return Object.assign({
				dbid: commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user') + '').userCode,
				apiId: GlobalVariable.APIID_SAVEDATA,
				pcell: '',
				jsonstr: '',
				datatype: 1
			});
		}
		/**
		 * @description 获取执行审核信息参数
		 * @param ceaParam 审核信息
		 * @param id 参数ID 33:获取下一个审批节点，34：审核通过
		 */
		getCheckInfoParam(ceaParam:any,id:number){
			let checkParasm = {
				dbid:commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user') + '').userCode,
				apiId: GlobalVariable.APIID_CHK,
				chkid:id,
				cea:JSON.stringify(ceaParam)
			}
			return checkParasm
		}
		/**
		 * @description 保存自定义审批人，抄送人
		 * @param ceaParam 审核信息
		 * @param id 参数ID 50保存，51查询
		 */
		getSaveBCustUserParam(ceaParam:any,id:number){
			let checkParasm = {
				dbid:commURL.BaseDBID,
				usercode: JSON.parse(uni.getStorageSync('user') + '').userCode,
				apiId: GlobalVariable.APIID_SAVEBCUSTDATA,
				chkid:id,
				data:JSON.stringify(ceaParam)
			}
			return checkParasm
		}
		/**
		 * @description 获取对象统计参数
		 * @param qe 查询条件
		 * @param groupfilds 分组字段
		 * @param groupdatafilds 数据字段
		 */
		getBipStatisticsParams(qe:string,groupfilds:string,groupdatafilds:string){
			return Object.assign({
			apiId: GlobalVariable.APIID_FINDSTATDATA,
			dbid: commURL.BaseDBID,
			usercode:  JSON.parse(uni.getStorageSync('user') + '').userCode,
			groupfilds:groupfilds,
			groupdatafilds:groupdatafilds, 
			qe: qe
			});
		}

		/**
		 * @description dlg执行SQL
		 * @param value 当前选中行
		 * @param btn 当前点击按钮
		 */
		getDlgRunSqlParams(value: string,btn:string) {
			return Object.assign({
			apiId: GlobalVariable.APIID_DLGSQLRUN,
			dbid: commURL.BaseDBID,
			usercode:  JSON.parse(uni.getStorageSync('user') + '').userCode,
			value: value,
			btn:btn, 
			});
		}
		/**
		 * @description dlg执行 java
		 * @param env 数据集
		 * @param btn 当前点击按钮
		 */
		getDlgRunClassParams(env: string,btn:string) {
			return Object.assign({
			apiId: GlobalVariable.APIID_DLGCLASSRUN,
			dbid: commURL.BaseDBID,
			usercode: JSON.parse(uni.getStorageSync('user') + '').userCode,
			env: env,
			btn:btn, 
			});
		}
		/**
		 * @description 获取访问后台获取对象定义的参数
		 * @param cellId 对象定义标志 cellId(cellId1;cellId2)
		 * @returns 返回是一个object{}
		 */
		getCCellsURI(cellId: string) {
			return Object.assign({ apiId: GlobalVariable.APIID_CELLPARAMS, dbid: commURL.BaseDBID, usercode: JSON.parse(uni.getStorageSync('user')).userCode, pcell: cellId });
		}
		/**
		 * @description 获取更新密码参数
		 * @returns 返回是一个object{apiId:'xxx',dbid:'xx'}
		 */
		getUpPwdParmasUri() {
			return Object.assign({ apiId: GlobalVariable.APIID_UPPWD, dbid: commURL.BaseDBID });
		}
		/**
		 * 获取钉钉 jsapi 权鉴
		 */
		getDDJSAPI_TICKET(){
			return Object.assign({
				apiId: GlobalVariable.APIID_DDJSAPI_TICKET,
				dbid: commURL.BaseDBID,
			});
		}
		/**
		 * 
		 * @param tskim 
		 * @param iid 编码
		 * @param state 状态
		 * @param buno 单号
		 * @param buid 业务号
		 * @param tousr 接收人
		 * @param page 页数
		 * @param size 条数
		 * @param keyword 关键字
		 * @returns 查询未读消息
		 */
		getTaskMsgParams(tskim:number,iid:number,state:number,buno:string,buid:string,tousr:string,page:number,size:number,keyword:string) {
			return Object.assign({
				apiId: GlobalVariable.APIID_TA_MSG,
				dbid: commURL.BaseDBID,
				usercode:  JSON.parse(uni.getStorageSync('user') + '').userCode,
				tskim:tskim,
				iid:iid,
				state:state,
				buno:buno,
				buid:buid,
				tousr:tousr,
				page:page,
				size:size,
				keyword:keyword,
			});
		  }

		/**
		 * @description 根据对象字符串组成，获取对象ID
		 * @param str 含有对象标志Id的字符串
		 * @returns 返回对象标志Id
		 */
		getObjId(str: string): string {
			if (str.startsWith('@')) str = str.substring(1);
			let index = str.indexOf('#');
			if (index > 0) {
				str = str.substring(0, index);
				return str;
			}

			index = str.indexOf('[');
			if (index > 0) {
				str = str.substring(0, index);
			}
			index = str.indexOf('/');
			if (index > 0) {
				str = str.substring(0, index);
			}
			index = str.indexOf('*');
			if (index > 0) {
				str = str.substring(0, index);
				return str;
			}
			return str;
		}
		/**
		 * @description 查找下一个符号
		 * @param buf 新的字符串
		 * @param cs0 要查找的字符串数组
		 * @param x0 开始位置
		 * @param x1 结束位置
		 * @param ch 要查找的符号
		 */
		nextQuote(buf: string, cs0: string[], x0: number, x1: number, ch: string): any {
			buf += ch;
			for (x0++; x0 < x1; x0++) {
				var c0 = cs0[x0];
				if (c0 == ch) {
					buf += ch;
					return [x0, buf];
				}
				if (c0 === '\\') {
					x0++;
					if (x0 < x1) {
						c0 = cs0[x0];
						if (c0 === 'n') c0 = '\n';
						else if (c0 === 't') c0 = '\t';
						else if (c0 === 'r') c0 = '\r';
					}
				}
				buf += c0;
			}
			return [x1, buf];
		}

		/**
		 * @description 查找下一个引用的位置
		 * @param cs0 要超找的字符串数组
		 * @param x0 开始位置
		 * @param x1 结束位置
		 * @param ch 要查找的字符
		 * @returns 返回下标
		 */
		nextQuote4(cs0: string[], x0: number, x1: number, ch: string): number {
			for (x0++; x0 < x1; x0++) {
				var c0 = cs0[x0];
				if (c0 == ch) return x0;
				if (c0 == '\\') x0++;
			}
			return x1;
		}

		/**
		 * @description 查找另一半字符
		 * @param cs0 要查找的字符串数组
		 * @param x0 开始位置
		 * @param x1 结束2位置
		 * @param chL "(" "[" "{"
		 */
		nextBarcket4(cs0: string[], x0: number, x1: number, chL: string) {
			let chR = chL == '[' ? ']' : chL == '(' ? ')' : '}';
			let ct = 0;
			for (x0++; x0 < x1; x0++) {
				var c0 = cs0[x0];
				if (c0 == chR) {
					if (ct < 1) return x0;
					ct--;
				} else if (c0 == chL) {
					ct++;
				} else if (c0 == '\\') {
					x0++;
				} else if (c0 == "'" || c0 == '"') {
					x0 = this.nextQuote4(cs0, x0, x1, c0);
				}
			}
			return x1;
		}
		/**
		 * @description 查找另一半字符
		 * @param buf 空或者是新的字符串
		 * @param cs0 要查找的字符串数组
		 * @param x0 开始位置
		 * @param x1 结束2位置
		 * @param chL "(" "[" "{"
		 */
		nextBarcket(buf: string, cs0: string[], x0: number, x1: number, chL: string): any {
			let c0,
				chR = chL == '(' ? ')' : chL == '[' ? ']' : '}';
			buf += chL;
			x0++;
			for (let ct = 0; x0 < x1; x0++) {
				c0 = cs0[x0];
				if (c0 == chR) {
					buf += c0;
					if (ct < 1) return [x0, buf];
					ct--;
				} else if (c0 == "'" || c0 == '"') {
					let retn = this.nextQuote(buf, cs0, x0, x1, c0);
					x0 = retn[0]; //;-括号中的不算。
					buf = retn[1];
				} else {
					buf += c0;
					if (c0 == chL) ct++;
					else if (c0 == '\\') {
						x0++;
						if (x0 < x1) buf += cs0[x0];
					}
				}
			}
			return [x1, buf];
		}

		/**
		 * 两个数值做运算
		 * @param o0 要计算的字符1
		 * @param o1 字符2
		 * @param cfh 运算符
		 * @param cpnt 小数位数
		 */
		calcTwoNumber(o0: any, o1: any, cfh: string, cpnt: number) {
			if (cfh == '+' || cfh == '-' || cfh == '*' || cfh == '/') {
				let n1 = new Number(o0).valueOf();
				let n2 = new Number(o1).valueOf();
				if (cfh == '+') {
					let a = n1 + n2;
					return a;
				}
				if (cfh == '-') {
					var a = n1 - n2;
					return a;
				}
				if (cfh == '*') {
					var a = n1 * n2;
					return a;
				}
				if (cfh == '/') {
					var a = n1 / n2;
					return a;
				}
			}
		}
		calcTwoItem(o0: any, o1: any, cfh: number): any {
			var c0 = String.fromCharCode(cfh & 0xff),
				c1 = String.fromCharCode(cfh >>> 8);
			if (c1 === '=' || c1 === '<' || c1 === '>') {
				// 逻辑比较值
				if(c1 === '='){
					return o0 == o1;
				}
				if(c1 === '<'){
					return o0 < o1;
				}
				if(c1 === '>'){
					return o0 > o1;
				}
				return true;
			}
			return this.calcTwoValue(o0, o1, c0);
		}

		calcItems(ovs: Array<any>, fhs: Array<any>, idx: number) {
			var x0 = idx - 2,
				x1 = idx - 1,
				c0 = this.tolevel(fhs[x0]);
			if (c0 < 1 || c0 < this.tolevel(fhs[x1])) return idx; //注意赋值语句
			ovs[x0] = this.calcTwoItem(ovs[x0], ovs[x1], fhs[x0].charCodeAt(0));
			ovs[x1] = ovs[idx];
			fhs[x0] = fhs[x1];
			idx--;
			if (idx > 1) idx = this.calcItems(ovs, fhs, idx);
			return idx;
		}

		tolevel(c01: string): number {
			let c11 = c01.charCodeAt(0) & 0xff;
			let c0: string = String.fromCharCode(c11);
			if (c01 == '=') return 0; //不支持等号与运算符连用,如"+=","*="等，用"A=A+..."表示
			if (c0 == '&' || c0 == '|' || c0 == '^') return 1;
			if (c0 == '>' || c0 == '<') return 2;
			if (c0 == '+' || c0 == '-') return 3;
			if (c0 == '*' || c0 == '/' || c0 == '%') return 4;
			return 0;
		}

		/**
		 * 最终的两个数值运算，可以直接在接口中调用。
		 * @param o0
		 * @param o1
		 * @param ysf
		 */
		calcTwoValue(o0: any, o1: any, ysf: string) {
			if (ysf == '+' || ysf == '|') {
				if (o0 == null) {
					return o1;
				}
				if (o1 == null) {
					return o0;
				}
				
				if (ysf == '+') {
					let bs0 = typeof o0 === "string";
					let bs1 = typeof o1 === "string";
					if(bs0||bs1)
						return o0 + '' + o1;
				}
			}
			return this.calcTwoObject(o0, o1, ysf, 0);
		}
		/**
		 * 两个对象做加减乘除
		 * @param o0 对象1
		 * @param o1 对象2
		 * @param ysf 运算符
		 * @param cpnt 小数位数
		 */
		calcTwoObject(o0: any, o1: any, ysf: string, cpnt: number) {
			return this.calcTwoNumber(o0, o1, ysf, cpnt);
		}
		/**
		 * 日期加
		 * @param fps
		 */
		dateAdd(fps: Array<any>) {
			let d1 = fps[0];
			var day1 = moment(d1);
			const day = fps[1];
			const mon = fps[2];
			const year = fps[3];
			const hou = fps[4];
			const min = fps[5];
			return day1
				.add(day, 'd')
				.add(mon, 'M')
				.add(year, 'y')
				.add(hou, 'h')
				.add(min, 'm')
				.format('YYYY-MM-DD HH:mm:ss');
		}

		/**
		 * 日期相减函数，返回不同的时间间隔
		 * 0:年，1:月，2:天
		 * @param {date1,date2,type} fps
		 */
		dateSub(fps: Array<any>) {
			const size = fps.length;
			let d1 = typeof fps[0] === 'number' ? Date.now() : Date.parse(fps[0]);
			let d2 = typeof fps[1] === 'number' ? Date.now() : Date.parse(fps[1]);
			let ymd = fps[2];
			if (ymd === 2) {
				//天数
				d1 = d1 - d2;
				return parseInt(d1 / 86400000 + '');
			} else if (ymd === 1) {
				//月
				let y1 = moment(d1).year();
				let m1 = moment(d1).month();
				let y2 = moment(d2).year();
				let m2 = moment(d2).month();
				return (y1 - y2) * 12 + (m1 - m2);
			} else {
				//年
				let y1 = moment(d1).year();
				let y2 = moment(d2).year();
				return y1 - y2;
			}
		}

		/**
		 * @description 字符串日期或者日期格式化
		 * @param d1 日期或者字符串
		 * @param type 类型
		 * @param format 格式 YYYY-MM-DD ..
		 * @returns 返回格式化以后的日期
		 */
		dateFormat(d1: string | Date | number, type: number, format: any): string {
			if (type == 93) {
				let n1 = moment(d1).format(GlobalVariable.DATE_FMT_ALL);
				return n1;
			}
			if (!format) {
				format = GlobalVariable.DATE_FMT_YMD;
			}
			return moment(d1).format(format);
		}

		/**
		 * @description 根据字符串将对象上的0:xx,1:xx转换为统一的BipInaAid
		 * @param str 字符串
		 * @param id id
		 * @returns BipInsAidNew
		 */
		makeBipInsAidByStr(str: string, id: string): BipInsAidNew {
			let insAid = new BipInsAidNew(id);
			let cells = new Cells();
			let cels = new Array<Cell>();
			let c1 = new Cell();
			insAid.cl = true;
			c1.id = 'code';
			c1.labelString = 'code';
			cels.push(c1);
			let c2 = new Cell();
			c2.id = 'name';
			c2.labelString = 'name';
			cels.push(c2);
			cells.cels = cels;
			insAid.cells = cells;
			let datas: any = [];
			let vv: Array<string> = str.split(';');
			vv.forEach((item, index) => {
				if (item.length > 0) {
					let _n = item.indexOf(':');
					if (_n > 0) {
						let vs = item.split(':');
						datas.push({ code: vs[0], name: vs[1] });
					} else {
						datas.push({ code: index + '', name: item });
					}
				}
			});
			insAid.values = datas;
			return insAid;
		}

		

		/**
		 * @description 获取当前登录用户
		 * @returns 返回的User
		 */
		getUser(): User {
			let user = JSON.parse(uni.getStorageSync('user'));
			return user;
		}
	}

	export const tools = new Utils();
}
