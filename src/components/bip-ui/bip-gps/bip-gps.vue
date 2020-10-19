<template>
	<view class="cu-form-group solid-bottom">
		<template v-if="cell">
			<view class="title" :class="[cell.isReq?'text-red':'']">{{ cell.labelString || title }}</view>
			<input :placeholder="cell.labelString" type="text" v-model="mode1" @tap.stop="open()" disabled="true"/>
			<text :class="['cuIcon-locationfill', 'text-grey']" @tap.stop="open()"></text>
		</template>
	</view>
</template>
<script lang="ts">
let dd = require( 'dingtalk-jsapi');
import Cell from '@/classes/pub/coob/Cell';
import CCliEnv from '@/classes/cenv/CCliEnv';
import CDataSet from '@/classes/pub/CDataSet';
import CRecord from '@/classes/pub/CRecord';
import { Vue, Prop, Component,Inject,Watch } from 'vue-property-decorator';
import { InsAidModule } from '@/store/module/insaid'; //导入vuex模块，自动注入
import { GlobalVariable } from '@/classes/tools/ICL';
import { BIPUtil } from '@/classes/api/request';
import { dataTool } from '@/classes/tools/DataTools';
const DataUtil = dataTool.utils;
@Component({
	components: {}
})
export default class bipGps extends Vue{
	@Inject('env') env!:CCliEnv;
	@Prop({ type: Object }) cell!: Cell;
	@Prop({type:String}) obj_id!:string;
	mode1: string = '';
	cds:CDataSet = new CDataSet(null)
	loginType:any = ""

	longitude:any = null;//经度
	latitude:any = null;//维度
	mapRootCel:any =null;//存放经纬度字段Cel
	root_mode:any = "";

	//钉钉配置信息
	ddCorpId:any = "";
	ddAgentId:any = "";
	ddCfg:any = "";

	async created(){
		//钉钉内登录
		if(uni.getStorageSync('loginType')){
			this.loginType = uni.getStorageSync('loginType')
		}
		if(this.loginType == GlobalVariable.LOGIN_TYPE_DING){//钉钉	
    		await this.getDDJSTicket();
		}
		this.cds = this.env.getDataSet(this.obj_id);
		this.mode1 = this.record.data[this.cell.id]
		for(var i=0;i<this.cds.ccells.cels.length;i++){
			if(this.cds.ccells.cels[i].id == this.cell.id){
				this.mapRootCel = this.cds.ccells.cels[(i+1)];
			}
		}
		this.root_mode = this.record.data[this.mapRootCel.id]
	}
	//打开位置选择	
	open(){
		if(this.loginType == GlobalVariable.LOGIN_TYPE_DING){
			this.openDDMap()
		}
	}
	//打开钉钉地图
    openDDMap(){  
      let _this = this;
      if(this.root_mode&&this.root_mode!=''){
        let  gps = this.root_mode.split(";");
        if(gps.length==2){
          this.longitude = gps[0];
          this.latitude = gps[1];
        }
      } 
      if(this.latitude !=null && this.longitude !=null){
          dd.biz.map.locate({ 
            latitude: _this.latitude, // 纬度，非必须
            longitude: _this.longitude, // 经度，非必须
            onSuccess: function (result:any) {   
              let address = result.province+result.city+result.adName+result.snippet
              let lgt = result.longitude+";"+result.latitude
              _this.GpsSelOk(address,lgt);
            },
            onFail: function (err:any) {
              alert(JSON.stringify(err)); 
            }
          });
      }else{
          dd.biz.map.locate({  
            scope: 5000,
            onSuccess: function (result:any) {   
              let address = result.province+result.city+result.adName+result.snippet
              let lgt = result.longitude+";"+result.latitude
              _this.GpsSelOk(address,lgt); 
            },
            onFail: function (err:any) {
              alert(JSON.stringify(err)); 
            }
          });

      }
	}
	//GPS选择完成 
	//参数  地址名称,经纬度信息
	GpsSelOk(address:any,lgt:any){
		if(!this.disabled){
			this.mode1 = address;
			this.cds.cellChange(address,this.cell.id);
			this.cds.cellChange(lgt,this.mapRootCel.id);
			uni.$emit(this.obj_id+"_"+this.mapRootCel.id)
		}
	}

	async getDDJSTicket(){ 
		let ddConfig = uni.getStorageSync('ddConfig')
		if(!ddConfig)
			return;
		ddConfig = JSON.parse(ddConfig);
		let url =decodeURIComponent(uni.getStorageSync("location.href")); 
		url =encodeURIComponent(url); 
		this.ddCorpId = ddConfig["corpId"];
		this.ddAgentId = ddConfig["agentId"]; 
		let bipAppid = ddConfig["bipAppid"]; 
		var data:any = { 
			url:url, 
			agentId:this.ddAgentId, 
			corpId:this.ddCorpId,
			bipAppid:bipAppid,
		}  
		var res:any = await  BIPUtil.ServApi.getDDJSAPI_TICKET(data); 
		if(res.data.id != undefined){ 
			if(res.data.id == 0){
			this.ddCfg = JSON.parse(res.data.message); 
			let _this= this;  
			dd.ready(function() { 
				dd.runtime.permission.requestAuthCode({
					corpId: _this.ddCorpId,
					onSuccess: function(info:any) {
						dd.config({
							agentId: _this.ddAgentId, // 必填，微应用ID
							corpId: _this.ddCorpId,//必填，企业ID
							timeStamp:_this.ddCfg.timeStamp, // 必填，生成签名的时间戳
							nonceStr: _this.ddCfg.nonceStr, // 必填，生成签名的随机串
							signature: _this.ddCfg.DDJSTICKET, // 必填，签名
							type:0,   //选填。0表示微应用的jsapi,1表示服务窗的jsapi；不填默认为0。该参数从dingtalk.js的0.8.3版本开始支持
							jsApiList : [
								'biz.map.locate',
								'biz.map.view',
								'device.geolocation.get',
								'device.geolocation.start',
								'device.geolocation.stop',
								'biz.map.search',
							] // 必填，需要使用的jsapi列表，注意：不要带dd。
						}); 
					},
					onFail : function(err:any) {
						alert('dd error: ' +JSON.stringify(err));
					}
				});
			}); 
			dd.error(function(error:any){ 
				alert('dd error: ' +JSON.stringify(error));
			});
			} 
		} 
	}

	get record():CRecord{
		return this.cds.getRecord(this.cds.index)
	}
	get disabled(){
		if(this.cds.ccells!=null){
			let attr = this.cell.attr&0x40;
			if(attr>0){
				return true;
			}else{
				return !DataUtil.currCanEdit(this.cds,this.env);
			}
		}
		else{
			if(this.cell){
				let attr = this.cell.attr&0x40;
				return attr>0 ;
			}
			return false;
		}
	}
	@Watch('record')
	recordChange(){
		let rr = this.record.data[this.cell.id];
		if(rr !== this.mode1){
			this.mode1 = rr||''
		}
	}	
}
</script>
