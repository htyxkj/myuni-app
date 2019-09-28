import {http} from '@/lib/http/index.js'
import {User} from '../User'
import {baseUtils} from './baseutils'
import comm from '@/static/js/comm.js';
let commURL:any = comm;
let Base64 = require('js-base64').Base64;
let tools = baseUtils.tools
http.config.baseUrl = commURL.BaseUri
export const login = (user:User) => {
	let param = tools.getLoginParmasUri();
	param.usercode = user.userCode;
	param.pwd = Base64.encode(user.password)
	return http.post('/sysapi',{},{params:param});
}