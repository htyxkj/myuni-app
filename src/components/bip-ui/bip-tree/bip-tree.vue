<template>
	<view class="uni-tree">
		<template v-for="(item, index) in getChildren(parent || root)">
			<view class="uni-tree-item" :key="getId(item)">
				<view class="uni-tree-item-self">
					<view class="uni-tree-item-checkbox-wrapper" v-if="canShowCheckbox(item)" @click="handleToggleCheck(currentLevelData[index])">
						<image class="uni-tree-item-checkbox-icon" :src="`/static/lis-tree/checked.png`" v-if="item._checked"></image>
						<image class="uni-tree-item-checkbox-icon" :src="`/static/lis-tree/indeterminate.png`" v-else-if="item._indeterminate"></image>
						<image class="uni-tree-item-checkbox-icon" :src="`/static/lis-tree/unchecked.png`" v-else></image>
					</view>
					<view v-if="canShowRadio(item)" class="uni-tree-item-radio-wrapper" @click="handleToggleSelect(currentLevelData[index])">
						<image class="uni-tree-item-radio-icon" :src="`/static/lis-tree/selected.png`" v-if="item._selected"></image>
						<image class="uni-tree-item-radio-icon" :src="`/static/lis-tree/unselected.png`" v-else></image>
					</view>

					<view class="uni-tree-item-name-wrapper" @click="handleToggleExpand(currentLevelData[index])">
						<span class="uni-tree-item-name">{{ item.label }}</span>
						<image class="uni-tree-item-expand-icon" :src="`/static/lis-tree/expand_${item._expand ? 1 : 0}.png`" v-if="item._hasChildren"></image>
					</view>
				</view>
				<view class="uni-tree-item-children" v-if="hasChildren(item)">
					<bip-tree
						:root="root"
						:parent="item"
						:level="level + 1"
						:has-children="hasChildren"
						:get-children="getChildren"
						:get-id="getId"
						:get-name="getName"
						:show-radio="showRadio"
						:leaf-only="leafOnly"
						:show-checkbox="showCheckbox"
						@on-change="onChange"
						@on-toggle-expand="onToggleExpand"
						v-if="item._expand"
					></bip-tree>
				</view>
			</view>
		</template>
	</view>
</template>
<script lang="ts">
import { Vue, Provide, Prop, Component, Inject, Watch } from 'vue-property-decorator';
@Component({
	components: {}
})
export default class bipTree extends Vue {
	@Prop({ type: Object }) root!: any;
	@Prop({ type: Object }) parent!: any;
	@Prop({ type: Boolean, default: false }) showCheckbox!: boolean;
	@Prop({ type: Boolean, default: false }) showRadio!: boolean;
	@Prop({ type: Boolean, default: false }) leafOnly!: boolean;

	@Prop({ type: Object }) selected!: Object;
	@Prop({ type: Array, default: [] }) checked!: Array<any>;
	@Prop({ type: Array, default: [] }) expand!: Array<any>;
	@Prop({ type: Boolean, default: false }) autoExpand!: boolean;
	@Prop({ type: Number, default: 0 }) level!: number;
	@Prop({ type: Object }) getRoot!: Function;

	@Prop({ type: Function, default: () => (data: any) => (data.children.length>0) }) hasChildren!: Function;
	@Prop({ type: Function, default: () => (data: any) => (data ? (data.children ? data.children : []) : []) }) getChildren!: Function;
	@Prop({ type: Function, default: () => (data: any) => data.id }) getId!: Function;
	@Prop({ type: Function, default: () => (data: any) => data.label }) getName!: Function;
	@Prop({ type: Function, default: () => () => {} }) changeHandler!: Function;
	@Prop({ type: Function, default: () => () => {} }) clickHandler!: Function;
	currentLevelData: Array<any> = [];
	innerExpand: Array<any> = [];
	mounted() {
		if (this.level === 0) {
			this.$on('on-change', ({ item, handler }: any) => {
				handler.call(this, item);
				this.$nextTick(() => {
					this.setCurrentLevelData();
					this.changeHandler(this.getChecked());
				});
			});
			this.$on('on-toggle-expand', ({ item, handler }: any) => {
				handler.call(this, item);
				this.$nextTick(() => {
					this.setCurrentLevelData();
					this.clickHandler(item);
				});
			});
		}
	}

	setCurrentLevelData() {
		this.currentLevelData = this.getChildren(this.parent || this.root);
	}

	getChecked(all: boolean = false) {
		const checked: Array<any> = [];
		if (this.showCheckbox) {
			this.forEachTree(this.root, (item: any) => {
				if (this.leafOnly) {
					if (item._checked && !item._hasChildren) {
						checked.push(item);
					}
				} else {
					if (item._checked) {
						checked.push(item);
					}
				}
			});
		}
		if (this.showRadio) {
			this.forEachTree(this.root, (item: any) => {
				if (item._selected) {
					checked.push(item);
				}
			});
		}
		return checked;
	}

	getAllChecked() {
		return this.getChecked(true);
	}

	forEachTree(tree: any, handler: any) {
		if (!tree) {
			return;
		}
		if (this.hasChildren(tree)) {
			const children = this.getChildren(tree);
			for (let item of children) {
				const stopForEach = handler(item, tree);
				if (!stopForEach) {
					this.forEachTree(item, handler);
				}
			}
		}
	}

	canShowCheckbox(item: any) {
		if (this.showCheckbox) {
			if (this.leafOnly) {
				return !this.hasChildren(item);
			}
			return true;
		}
	}
	canShowRadio(item: any) {
		if (this.showRadio) {
			if (this.leafOnly) {
				return !this.hasChildren(item);
			}
			return true;
		}
	}

	handleToggleCheck(item: any) {
		const self = this;
		this.$emit('on-change', {
			item,
			handler: function(item: any) {
				this.$set(item, '_checked', !item._checked);
				this.$set(item, '_indeterminate', false);
				this.upStreamCheck(item);
				this.downStreamCheck(item);
				this.$nextTick(() => {
					this.setCurrentLevelData.call(self);
				});
			}
		});
	}

	downStreamCheck(node: any) {
		if (this.hasChildren(node)) {
			for (let item of this.getChildren(node)) {
				this.$set(item, '_checked', node._checked);
				this.$set(item, '_indeterminate', false);
				this.downStreamCheck(item);
			}
		}
	}

	handleToggleSelect(item: any) {
		const self = this;
		this.$emit('on-change', {
			item,
			handler: function(item: any) {
				this.clearSelect();
				this.$set(item, '_selected', true);
				this.upStreamSelect(item);
				this.$nextTick(() => {
					this.setCurrentLevelData.call(self);
				});
			}
		});
	}

	upStreamSelect(node: any) {
		if (node) {
			const parent = this.getItemById(node._parent);
			if (!parent) {
				return;
			}
			this.$set(parent, '_indeterminate', true);
			this.upStreamCheck(parent);
		}
	}

	upStreamCheck(node: any) {
		if (node) {
			const parent: any = this.getItemById(node._parent);
			if (!parent) {
				return;
			}
			const children = this.getChildren(parent);
			const checked = children.filter((it: any) => it._checked);
			const indeterminated = children.filter((it: any) => it._indeterminate);
			this.$set(parent, '_checked', checked.length === children.length);
			this.$set(parent, '_indeterminate', !parent._checked && (indeterminated.length > 0 || checked.length > 0));
			this.upStreamCheck(parent);
		}
	}

	getItemById(id: any) {
		let target = null;
		this.forEachTree(this.root, (item: any) => {
			if (this.getId(item) === id) {
				target = item;
				return true;
			}
		});
		return target;
	}

	handleToggleExpand(item: any) {
		const self = this;
		this.$emit('on-toggle-expand', {
			item,
			handler: function(item: any) {
				this.$set(item, '_expand', !item._expand);
				this.$nextTick(() => {
					this.setCurrentLevelData.call(self);
				});
			}
		});
	}

	init({ expand, checked, selected }: any) {
		if (this.level === 0) {
			this.syncState({
				checked,
				expand,
				selected
			});
		}
		this.setCurrentLevelData();
	}

	syncState({ expand, checked, selected }: any) {
		if (checked) {
			this.syncStateChecked();
		}
		if (selected) {
			this.syncStateSelected();
		}
		if (expand) {
			this.syncStateExpand();
		}
	}

	syncStateChecked() {
		if (!this.checked) {
			return;
		}
		const parent: any = this.root;
		this.forEachTree(parent, (item: any, parent: any) => {
			this.$set(item, '_checked', this.isChecked(item));
			this.$set(item, '_expand', false);
			this.$set(item, '_indeterminate', false);
			this.$set(item, '_parent', this.getId(parent));
			this.$set(item, '_hasChildren', this.hasChildren(item));
		});
		this.forEachTree(parent, (item: any, parent: any) => {
			if (item._checked) {
				this.upStreamCheck(item);
				this.downStreamCheck(item);
				return true;
			}
		});
		return parent;
	}

	syncStateSelected() {
		if (!this.selected) {
			return;
		}
		const parent: any = this.root;
		this.forEachTree(parent, (item: any, parent: any) => {
			this.$set(item, '_selected', this.isSelected(item));
			this.$set(item, '_expand', false);
			this.$set(item, '_indeterminate', false);
			this.$set(item, '_parent', this.getId(parent));
			this.$set(item, '_hasChildren', this.hasChildren(item));
		});
		this.forEachTree(parent, (item: any, parent: any) => {
			if (item._selected) {
				this.upStreamSelect(item);
				return true;
			}
		});
		return parent;
	}

	syncStateExpand() {
		this.setInnerExpand();
		this.forEachTree(this.root, (item: any, parent: any) => {
			this.$set(item, '_expand', this.isExpand(item));
		});
	}

	setInnerExpand() {
		if (this.autoExpand) {
			this.forEachTree(this.root, (item: any, parent: any) => {
				if (!this.hasChildren(item)) {
					return true;
				}
				if (item._indeterminate) {
					this.innerExpand.push(item);
				}
			});
		} else {
			this.innerExpand = this.expand;
		}
	}

	isChecked(item: any) {
		return !!this.checked.find((it: any) => this.isSame(item, it));
	}
	isSelected(item: any) {
		return this.isSame(item, this.selected);
	}
	isExpand(item: any) {
		return !!this.innerExpand.find((it: any) => this.isSame(item, it));
	}

	isSame(itemA: any, itemB: any) {
		return this.getId(itemA) === this.getId(itemB);
	}

	onChange(args: any) {
		let item:any = args.item;
		let handler:any = args.handler;
		if (this.level === 0) {
			let id = this.getId(item);
			let target = this.getItemById(id);
			handler.call(this, target);
			this.changeHandler(this.getChecked());
			let items = this.getChecked();
			this.$nextTick(()=>{
				this.$emit('on-change1',items);
			})

		} else {
			this.$emit('on-change', {
				item,
				handler
			});
		}
	}

	onToggleExpand(args: any) {
		// console.log(args);
		let item:any = args.item;
		let handler:any = args.handler;
		if (this.level === 0) {
			let id = this.getId(item);
			let target = this.getItemById(id);
			handler.call(this, target);
			this.clickHandler(target);
		} else {
			this.$emit('on-toggle-expand', {
				item,
				handler
			});
		}
	}
	
	clearSelect() {
		this.forEachTree(this.root, (item:any) => {
			this.$set(item, '_indeterminate', false)
			this.$set(item, '_selected', false)
		})
	}

	@Watch('root',{ immediate: true })
	rootChanges() {
		// console.log('root change',this.root)
		this.init({ checked: true, selected: true, expand: true });
	}
	
	@Watch('checked', { immediate: true })
	checkedChanges() {
		this.init({ checked: true, selected: false, expand: true });
	}
	
	@Watch('expand', { immediate: true })
	expandChanges() {
		this.init({ expand: true });
	}
	@Watch('selected', { immediate: true })
	selecteChanges() {
		// console.log('selected change')
		this.init({ checked: false, selected: true, expand: true });
	}
}
</script>
<style>
@import url('./bip-tree.css');
</style>
