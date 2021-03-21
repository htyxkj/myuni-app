<template>
	<view class="margin-sm">
		<template v-if="cells">
			<view v-for="(cel,idx) in cells.cels" :key="idx">
				<template v-if="cel.isShow">
					<bip-comm-show-task :obj_id="cells.obj_id" :cell="cel" :rowId="-1" :record="record"></bip-comm-show-task>
				</template>
			</view>
			<view class="padding flex flex-direction bg-white">
				<button class="cu-btn bg-blue" @tap="openDetile">详情</button>
			</view>
		</template>
		<message ref="msg"></message>
	</view>
</template>

<script lang="ts">
    import { Vue, Provide, Prop, Component,Watch } from 'vue-property-decorator';
	import bipCommShowTask from '../bip-comm/bip-comm-show-task.vue';
	import {
		BIPUtil
	} from '@/classes/api/request';
	let tools = BIPUtil.ServApi;
	import {
		LoginModule
	} from '@/store/module/login'; //导入vuex模块，自动注入
	import { Tools } from '@/classes/tools/Tools';
	export default class BipTaskUnit extends Vue{
		@Prop() record!:any;
		@Prop() cells!:any;
		@Prop() rowId!:any;
		openDetileBK(){
			console.log(this.record)
			let sbuid = this.record.data.buid;
			let sid = this.record.data.buno;
			tools.getBULinks(sbuid+"_YD").then((res:any)=>{
				console.log(res);
				if(res.data.id==0){
					let opt:any = res.data.data.opt;
					let mid = opt.pmenuid;
					let m0 = Tools.findMenu(mid);
					console.log(mid,m0);
					if(m0){
						let cmd = m0.command;
						let dd = cmd.split("&");
						let pbuid = ''
						dd.forEach((aa:any)=>{
							// console.log(aa)
							let pbuids = aa.split('=')
							if(pbuids[0] == 'pbuid'){
								pbuid = pbuids[1]
							}
						});
						if(pbuid){
							tools.getMenuParams(pbuid,mid).then((res:any)=>{
								let data = res.data;
								if(data.id==0){
									let uriParams = data.data.mparams;
									uni.setStorageSync(pbuid,JSON.stringify(uriParams));
									let qcont = opt.pkfld+"='"+sid+"'";
									cmd +="&title="+m0.menuName+"&qcont="+encodeURIComponent(qcont);
									this.jumpBill(cmd);
								}
							}).catch((err:any)=>{
								console.log(err);
							});
						}
					}else{
						this.showErr('没有菜单权限！')
					}
				}else{
					let msg = res.data.message;
					//弹出提醒
					this.showErr(msg)
				}
			})
			.catch((res:any)=>{
				console.log(res);
			});
		}


		async openDetile(haveYD:boolean =true){
			let sbuid = this.record.data.buid;
			let sid = this.record.data.buno;
			//查询是否有 _YD 业务定义
			let res:any = await tools.getBULinks(sbuid+"_YD");
			if(res.data.id ==-1){
				res = await tools.getBULinks(sbuid);
			}
			if(res.data.id==0){
				let opt:any = res.data.data.opt;
				let mid = opt.pmenuid;
				let m0 = Tools.findMenu(mid);
				if(m0){
					let cmd = m0.command;
					let dd = cmd.split("&");
					let pbuid = ''
					let pmenuid =''
					dd.forEach((aa:any)=>{
						let pbuids = aa.split('=')
						if(pbuids[0] == 'pbuid'){
							pbuid = pbuids[1]
						}
						if(pbuids[0] == 'pmenuid'){
							pmenuid = pbuids[1];
						}
					});
					if(pbuid){
						tools.getMenuParams(pbuid,mid).then((res:any)=>{
							let data = res.data;
							if(data.id==0){
								let uriParams = data.data.mparams;
								uni.setStorageSync(pbuid,JSON.stringify(uriParams));
								let qcont = opt.pkfld+"='"+sid+"'";
								let con = {rowId:this.rowId,pbuid:pbuid,pmenuid:pmenuid,title:m0.menuName,qcont:encodeURIComponent(qcont)}
								this.jumpBill(con);
							}
						}).catch((err:any)=>{
							console.log(err);
						});
					}
				}else{
					this.showErr('没有菜单权限！')
				}
			}else{
				if(haveYD){
					this.openDetile(false)
				}else{
					let msg = res.data.message;
					//弹出提醒
					this.showErr(msg)
				}
			}
		}

		jumpBill(cmd:any){
			this.$emit("toDetails",cmd)
		}

		jumpBillBK(cmd:string){
			uni.showLoading({
				title: '跳转中...'
			});
			uni.navigateTo({
				url: '/pages/appinfo/appdetailsp?'+cmd,
				complete: () => {
					uni.hideLoading();
				}
			});
		}
		
		showErr(err:string){
			let msg:any = this.$refs['msg'];
			msg.error({background: true,content:err})
		}
		
		get menus(){
			return LoginModule.menus;
		}
	}
</script>

<style>

</style>
