//压缩;浏览;查询;缓存;5:增加;删除;保存;非定位;审核;
//10:审批;关联;文件;图形;引用;15:功能文字;统计;外部SQL;展开;批量打印;
//20:全部打印;邮件;无表格线;行单元底线;行单元边框;25:普通表头;关闭速查;执行可改
class CommICL{
	B_IPACK :number =  1 //采用压缩
	B_INAV :number = 2 //带滚动功能
	B_IFIND :number = 4 //带查询功能
	B_ICACHE :number = 8 //采用缓存
	B_IADD :number = 0x10 //增加
	B_IDEL :number = 0x20 //删除
	B_ISAVE :number = 0x40 //保存
	B_INOLOCATE :number = 0x80 //不带定位功能
	B_IWORKEA :number = 0x100 //带审批流定义
	B_ICHKINFO :number = 0x200 //列表显示审批表
	B_IRELATE :number = 0x400 //显示相关联的定义，如单据
	B_IFILE :number = 0x800 //文件
	B_IOUTTX :number = 0x1000 //图形
	B_IREFER :number = 0x2000//引用
	B_ITXT :number = 0x4000//工具条文本
	B_ISTAT :number = 0x8000//统计功能(输入起用，输出关闭)
	B_IOUTSQL :number = 0x10000//起用外部SQL
	B_IHEXP :number = 0x20000//起用展开功能
	B_IPRNBATCH :number = 0x40000//批量打印(提示指定范围)
	B_IPRNALL :number = 0x80000//打印当前所有数据
	B_IMAIL :number = 0x100000//发邮件
	B_UNLINE :number = 0x200000//表格不画线
	B_IGRL :number = 0x400000//行单元底线
	B_IGRUNL :number = 0x800000//行单元边框
	B_IUNGGT :number = 0x1000000//多行表格不画图
	B_IUNQF :number = 0x2000000//关闭速查功能
	B_IOKED :number = 0x4000000//执行可修改
	B_CMD_ADD :string = 'ADD'//增加
	B_CMD_DEL :string = 'DEL'//删除
	B_CMD_FIND :string = 'FIND'//查找
	B_CMD_CLEAR :string = 'CLEAR'//清空
	B_CMD_SAVE :string = 'SAVE'//保存
	B_CMD_COPY :string = 'COPY'//保存
	B_CMD_FIRST :string = 'FIRST'//第一个
	B_CMD_PRIOR :string = 'PRIOR'//上一个
	B_CMD_NEXT :string = 'NEXT'//下一个
	B_CMD_LAST :string = 'LAST'//最后一个
	B_CMD_FILE :string = 'FILE'//最后一个
	B_CMD_SUBMIT :string = 'SUBMIT'//提交
	B_CMD_CHKINFO :string = 'CHKINFO'//审批信息
	B_CMD_CHECK :string = 'CHECK'//审核
    B_CMD_CHECK_PROCESS:string = 'CHECKPROCESS'//流程查看
	B_CMD_PRINT :string = 'PRINT'//打印
	B_CMD_LINK :string = 'LINK'//连接
	B_CMD_LIST :string = 'LIST'//连接
	B_CMD_ISTAT :string = 'ISTAT'//统计
	B_CMD_IFILE :string = 'DOWNLOADFILE'//文件
	//#region 输入框常量
	I_EDITOR_COMM :number = 0//普通输入框
	I_EDITOR_LIST :number = 1//下拉框
	I_EDITOR_DATE :number = 2//日期输入框
	I_EDITOR_SELECT :number = 3//普通辅助输入框
	I_EDITOR_UPDOWN :number = 4//上传下载输入框
	I_EDITOR_GDIC :number = 5//商品辅助输入
	I_EDITOR_NUM :number = 6//商品辅助输入
	I_EDITOR_COPY :number = 9//拷贝定义
	I_EDITOR_TREE :number = 10//树
	I_EDITOR_RTEXT :number = 11//富文本编辑器
//#endregion
	//#region 数据记录状态值
	R_EDITCTRL :number = 0x1F//-编辑控制属性和。
	R_INSERT :number = 1//--新增
	R_EDITED :number = 2//--值改变
	R_DELETE :number = 4//--加删除标志
	R_EDITSUB :number = 8//--字表改变
	R_EDITEDPK :number = 0x10//--主键改变
	R_IMPORT :number = 0x20//--这主要用于导入记录(结合INSERT使用保存时先做更新不存在时再做插入)
	R_REPLACESUB :number = 0x40//(替换子表)修改前先删除子表
	R_HISTORY :number = 0x80//历史数据(仅做为显示用)
	R_COPY :number = 0x100//从其它记录拷贝过来
	R_DICT :number = 0x200//记录经过动态字典处理后置上该标记。
	R_POSTED :number =  0x400//记录已提交过
	//#endregion
	EV_CELL_CHANGE :string = 'cellDataChange'//

	//#region 辅助输入类别
	CELL_CGroupEditor :string = 'CGroupEditor'
	CELL_CSelectEditor :string = 'CSelectEditor'
	CELL_CFlagEditor :string = 'CFlagEditor'
	CELL_CFlowEditor :string = 'CFlowEditor'
	CELL_CQueryEditor :string = 'CQueryEditor'
	CELL_CDynaEditorr :string = 'CDynaEditor'
	CELL_CUpDownEditor :string = 'CUpDownEditor'
	CELL_CGDicEditor :string = 'CGDicEditor'
	CELL_CDateEditor :string = 'CDateEditor'
	CELL_CYMEditor :string = 'CYMEditor'
	CELL_CHSMEditor :string = 'CHSMEditor'
	//#endregion
	AID_KEY :string = 'KEY_'
	AID_KEYCL :string = '$KEY_'
	AID_TREE :string = 'TREE_KEY_'
}

export const icl  = new CommICL()