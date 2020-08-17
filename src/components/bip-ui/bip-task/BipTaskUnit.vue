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
	import { baseUtils } from '@/classes/api/baseutils';
	let paramTools = baseUtils.tools;
	@Component({components:{bipCommShowTask}})
	export default class BipTaskUnit extends Vue{
		@Prop() record!:any;
		@Prop() cells!:any;
		openDetile(){
			console.log(this.record)
			let sbuid = this.record.data.buid;
			let sid = this.record.data.buno;
			tools.getBULinks(sbuid+"_YD").then((res:any)=>{
				console.log(res);
				if(res.data.id==0){
					let opt:any = res.data.data.opt;
					let mid = opt.pmenuid;
					let m0 = paramTools.findMenu(mid);
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
		
		jumpBill(cmd:string){
			uni.showLoading({
				title: '跳转中...'
			});
			uni.navigateTo({
				url: '/pages/appinfo/appdetail?'+cmd,
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
