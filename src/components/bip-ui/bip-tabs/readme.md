### Bip平台tabs
一般用来处理Tab标签
1.引入到使用页面	
```
	import bipTabs from '@/components/bip-ui/bip-tabs/bipTabs.vue';
	@Component({
		components:{bipTabs}
	})
```
2. 定义数据
```
this.tabs = [{label:'暂存',icon:'cuIcon-circlefill'},{label:'未完成',icon:'cuIcon-usefullfill'},{label:'已完成',icon:'cuIcon-activityfill'}]
```
3. 使用tabs
```
<bip-tabs :modelData="tabs" :initIndex="initIndex" @change="tapChange"></bip-tabs>
```
4. 参数说明

modelData：tab标签数据{label:标签，icon:显示图标}
initIndex:初始化显示第几个
5.点击事件
	change返回当前点击的是第几个