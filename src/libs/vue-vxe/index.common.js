"use strict";

(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define(["exports", "xe-utils/ctor"], factory);
  } else if (typeof exports !== "undefined") {
    factory(exports, require("xe-utils/ctor"));
  } else {
    var mod = {
      exports: {}
    };
    factory(mod.exports, global.ctor);
    global.undefined = mod.exports;
  }
})(void 0, function (exports, ctor_1) {
  "use strict";

  var __spreadArray = undefined && undefined.__spreadArray || function (to, from) {
    for (var i = 0, il = from.length, j = to.length; i < il; i++, j++) {
      to[j] = from[i];
    }

    return to;
  };

  Object.defineProperty(exports, "__esModule", {
    value: true
  });
  exports.VXETablePluginVirtualTree = void 0;

  function hasChilds(_vm, row) {
    var childList = row[_vm.treeOpts.children];
    return childList && childList.length;
  }

  function renderDefaultForm(h, _vm) {
    var proxyConfig = _vm.proxyConfig,
        proxyOpts = _vm.proxyOpts,
        formData = _vm.formData,
        formConfig = _vm.formConfig,
        formOpts = _vm.formOpts;

    if (formConfig && formOpts.items && formOpts.items.length) {
      if (!formOpts.inited) {
        formOpts.inited = true;
        var beforeItem_1 = proxyOpts.beforeItem;

        if (proxyOpts && beforeItem_1) {
          formOpts.items.forEach(function (item) {
            beforeItem_1.call(_vm, {
              $grid: _vm,
              item: item
            });
          });
        }
      }

      return [h('vxe-form', {
        props: Object.assign({}, formOpts, {
          data: proxyConfig && proxyOpts.form ? formData : formOpts.data
        }),
        on: {
          submit: _vm.submitEvent,
          reset: _vm.resetEvent,
          'submit-invalid': _vm.submitInvalidEvent,
          'toggle-collapse': _vm.togglCollapseEvent
        },
        ref: 'form'
      })];
    }

    return [];
  }

  function getToolbarSlots(_vm) {
    var $scopedSlots = _vm.$scopedSlots,
        toolbarOpts = _vm.toolbarOpts;
    var toolbarOptSlots = toolbarOpts.slots;
    var $buttons;
    var $tools;
    var slots = {};

    if (toolbarOptSlots) {
      $buttons = toolbarOptSlots.buttons;
      $tools = toolbarOptSlots.tools;

      if ($buttons && $scopedSlots[$buttons]) {
        $buttons = $scopedSlots[$buttons];
      }

      if ($tools && $scopedSlots[$tools]) {
        $tools = $scopedSlots[$tools];
      }
    }

    if ($buttons) {
      slots.buttons = $buttons;
    }

    if ($tools) {
      slots.tools = $tools;
    }

    return slots;
  }

  function getPagerSlots(_vm) {
    var $scopedSlots = _vm.$scopedSlots,
        pagerOpts = _vm.pagerOpts;
    var pagerOptSlots = pagerOpts.slots;
    var slots = {};
    var $left;
    var $right;

    if (pagerOptSlots) {
      $left = pagerOptSlots.left;
      $right = pagerOptSlots.right;

      if ($left && $scopedSlots[$left]) {
        $left = $scopedSlots[$left];
      }

      if ($right && $scopedSlots[$right]) {
        $right = $scopedSlots[$right];
      }
    }

    if ($left) {
      slots.left = $left;
    }

    if ($right) {
      slots.right = $right;
    }

    return slots;
  }

  function getTableOns(_vm) {
    var $listeners = _vm.$listeners,
        proxyConfig = _vm.proxyConfig,
        proxyOpts = _vm.proxyOpts;
    var ons = {};
    ctor_1["default"].each($listeners, function (cb, type) {
      ons[type] = function () {
        var args = [];

        for (var _i = 0; _i < arguments.length; _i++) {
          args[_i] = arguments[_i];
        }

        _vm.$emit.apply(_vm, __spreadArray([type], args));
      };
    });
    ons['checkbox-all'] = _vm.checkboxAllEvent;
    ons['checkbox-change'] = _vm.checkboxChangeEvent;

    if (proxyConfig) {
      if (proxyOpts.sort) {
        ons['sort-change'] = _vm.sortChangeEvent;
      }

      if (proxyOpts.filter) {
        ons['filter-change'] = _vm.filterChangeEvent;
      }
    }

    return ons;
  }

  function registerComponent(vxetable) {
    var setup = vxetable.setup,
        t = vxetable.t;
    var GlobalConfig = setup();
    var propKeys = Object.keys(vxetable.Table.props).filter(function (name) {
      return ['data', 'treeConfig'].indexOf(name) === -1;
    });
    var options = {
      name: 'VxeVirtualTree',
      "extends": vxetable.Grid,
      data: function data() {
        return {
          removeList: [],
          treeLazyLoadeds: []
        };
      },
      computed: {
        treeOpts: function treeOpts() {
          return Object.assign({}, GlobalConfig.table.treeConfig, this.treeConfig);
        },
        checkboxOpts: function checkboxOpts() {
          return Object.assign({}, GlobalConfig.table.checkboxConfig, this.checkboxConfig);
        },
        tableExtendProps: function tableExtendProps() {
          var _this = this;

          var rest = {};
          propKeys.forEach(function (key) {
            rest[key] = _this[key];
          });

          if (rest.checkboxConfig) {
            rest.checkboxConfig = this.checkboxOpts;
          }

          return rest;
        }
      },
      watch: {
        columns: function columns(value) {
          this.handleColumns(value);
        },
        data: function data(value) {
          this.loadData(value);
        }
      },
      created: function created() {
        var _a = this,
            $vxe = _a.$vxe,
            treeOpts = _a.treeOpts,
            data = _a.data,
            columns = _a.columns;

        Object.assign(this, {
          fullTreeData: [],
          treeTableData: [],
          fullTreeRowMap: new Map()
        });

        if (this.keepSource) {
          console.error($vxe.t('vxe.error.notProp', ['keep-source']));
        }

        if (treeOpts.line) {
          console.error($vxe.t('vxe.error.notProp', ['checkbox-config.line']));
        }

        if (columns) {
          this.handleColumns(columns);
        }

        if (data) {
          this.reloadData(data);
        }
      },
      render: function render(h) {
        var _a;

        var _b = this,
            vSize = _b.vSize,
            isZMax = _b.isZMax;

        var $scopedSlots = this.$scopedSlots;
        var hasForm = !!($scopedSlots.form || this.formConfig);
        var hasToolbar = !!($scopedSlots.toolbar || this.toolbarConfig || this.toolbar);
        var hasPager = !!($scopedSlots.pager || this.pagerConfig);
        return h('div', {
          "class": ['vxe-grid', 'vxe-virtual-tree', (_a = {}, _a["size--" + vSize] = vSize, _a['t--animat'] = !!this.animat, _a['is--round'] = this.round, _a['is--maximize'] = isZMax, _a['is--loading'] = this.loading || this.tableLoading, _a)],
          style: this.renderStyle
        }, [
        /**
         * 渲染表单
         */
        hasForm ? h('div', {
          ref: 'formWrapper',
          staticClass: 'vxe-grid--form-wrapper'
        }, $scopedSlots.form ? $scopedSlots.form.call(this, {
          $grid: this
        }, h) : renderDefaultForm(h, this)) : null,
        /**
         * 渲染工具栏
         */
        hasToolbar ? h('div', {
          ref: 'toolbarWrapper',
          "class": 'vxe-grid--toolbar-wrapper'
        }, $scopedSlots.toolbar ? $scopedSlots.toolbar.call(this, {
          $grid: this
        }, h) : [h('vxe-toolbar', {
          props: this.toolbarOpts,
          ref: 'xToolbar',
          scopedSlots: getToolbarSlots(this)
        })]) : null,
        /**
         * 渲染表格顶部区域
         */
        $scopedSlots.top ? h('div', {
          ref: 'topWrapper',
          staticClass: 'vxe-grid--top-wrapper'
        }, $scopedSlots.top.call(this, {
          $grid: this
        }, h)) : null,
        /**
         * 渲染表格
         */
        h('vxe-table', {
          props: this.tableProps,
          on: getTableOns(this),
          scopedSlots: $scopedSlots,
          ref: 'xTable'
        }),
        /**
         * 渲染表格底部区域
         */
        $scopedSlots.bottom ? h('div', {
          ref: 'bottomWrapper',
          staticClass: 'vxe-grid--bottom-wrapper'
        }, $scopedSlots.bottom.call(this, {
          $grid: this
        }, h)) : null,
        /**
         * 渲染分页
         */
        hasPager ? h('div', {
          ref: 'pagerWrapper',
          staticClass: 'vxe-grid--pager-wrapper'
        }, $scopedSlots.pager ? $scopedSlots.pager.call(this, {
          $grid: this
        }, h) : [h('vxe-pager', {
          props: this.pagerProps,
          on: {
            'page-change': this.pageChangeEvent
          },
          scopedSlots: getPagerSlots(this)
        })]) : null]);
      },
      methods: {
        loadColumn: function loadColumn(columns) {
          var _this = this;

          return this.$nextTick().then(function () {
            var _a = _this,
                $vxe = _a.$vxe,
                $scopedSlots = _a.$scopedSlots,
                renderTreeIcon = _a.renderTreeIcon,
                treeOpts = _a.treeOpts;
            ctor_1["default"].eachTree(columns, function (column) {
              if (column.treeNode) {
                if (!column.slots) {
                  column.slots = {};
                }

                column.slots.icon = renderTreeIcon;
              }

              if (column.slots) {
                ctor_1["default"].each(column.slots, function (func, name, colSlots) {
                  // 兼容 v2
                  if (!ctor_1["default"].isFunction(func)) {
                    if ($scopedSlots[func]) {
                      colSlots[name] = $scopedSlots[func];
                    } else {
                      colSlots[name] = null;
                      console.error($vxe.t('vxe.error.notSlot', [func]));
                    }
                  }
                });
              }
            }, treeOpts);

            _this.$refs.xTable.loadColumn(columns);
          });
        },
        renderTreeIcon: function renderTreeIcon(params, h, cellVNodes) {
          var _this = this;

          var _a = this,
              treeLazyLoadeds = _a.treeLazyLoadeds,
              treeOpts = _a.treeOpts;

          var isHidden = params.isHidden,
              row = params.row;
          var children = treeOpts.children,
              hasChild = treeOpts.hasChild,
              indent = treeOpts.indent,
              lazy = treeOpts.lazy,
              trigger = treeOpts.trigger,
              iconLoaded = treeOpts.iconLoaded,
              showIcon = treeOpts.showIcon,
              iconOpen = treeOpts.iconOpen,
              iconClose = treeOpts.iconClose;
          var rowChilds = row[children];
          var hasLazyChilds = false;
          var isAceived = false;
          var isLazyLoaded = false;
          var on = {};

          if (!isHidden) {
            isAceived = row._X_EXPAND;

            if (lazy) {
              isLazyLoaded = treeLazyLoadeds.indexOf(row) > -1;
              hasLazyChilds = row[hasChild];
            }
          }

          if (!trigger || trigger === 'default') {
            on.click = function (evnt) {
              return _this.triggerTreeExpandEvent(evnt, params);
            };
          }

          return [h('div', {
            "class": ['vxe-cell--tree-node', {
              'is--active': isAceived
            }],
            style: {
              paddingLeft: row._X_LEVEL * indent + "px"
            }
          }, [showIcon && (rowChilds && rowChilds.length || hasLazyChilds) ? [h('div', {
            "class": 'vxe-tree--btn-wrapper',
            on: on
          }, [h('i', {
            "class": ['vxe-tree--node-btn', isLazyLoaded ? iconLoaded || GlobalConfig.icon.TABLE_TREE_LOADED : isAceived ? iconOpen || GlobalConfig.icon.TABLE_TREE_OPEN : iconClose || GlobalConfig.icon.TABLE_TREE_CLOSE]
          })])] : null, h('div', {
            "class": 'vxe-tree-cell'
          }, cellVNodes)])];
        },
        _loadTreeData: function _loadTreeData(data) {
          var _this = this;

          var selectRow = this.getRadioRecord();
          return this.$nextTick().then(function () {
            return _this.$refs.xTable.loadData(data);
          }).then(function () {
            if (selectRow) {
              _this.setRadioRow(selectRow);
            }
          });
        },
        loadData: function loadData(data) {
          return this._loadTreeData(this.toVirtualTree(data));
        },
        reloadData: function reloadData(data) {
          var _this = this;

          return this.$nextTick().then(function () {
            return _this.$refs.xTable.reloadData(_this.toVirtualTree(data));
          }).then(function () {
            return _this.handleDefaultTreeExpand();
          });
        },
        isTreeExpandByRow: function isTreeExpandByRow(row) {
          return !!row._X_EXPAND;
        },
        setTreeExpansion: function setTreeExpansion(rows, expanded) {
          return this.setTreeExpand(rows, expanded);
        },
        handleAsyncTreeExpandChilds: function handleAsyncTreeExpandChilds(row) {
          var _this = this;

          var _a = this,
              treeLazyLoadeds = _a.treeLazyLoadeds,
              treeOpts = _a.treeOpts,
              checkboxOpts = _a.checkboxOpts;

          var loadMethod = treeOpts.loadMethod,
              children = treeOpts.children;
          var checkStrictly = checkboxOpts.checkStrictly;
          return new Promise(function (resolve) {
            if (loadMethod) {
              treeLazyLoadeds.push(row);
              loadMethod({
                row: row
              })["catch"](function () {
                return [];
              }).then(function (childs) {
                row._X_LOADED = true;
                ctor_1["default"].remove(treeLazyLoadeds, function (item) {
                  return item === row;
                });

                if (!ctor_1["default"].isArray(childs)) {
                  childs = [];
                }

                if (childs) {
                  row[children] = childs.map(function (item) {
                    item._X_LOADED = false;
                    item._X_EXPAND = false;
                    item._X_INSERT = false;
                    item._X_LEVEL = row._X_LEVEL + 1;
                    return item;
                  });

                  if (childs.length && !row._X_EXPAND) {
                    _this.virtualExpand(row, true);
                  } // 如果当前节点已选中，则展开后子节点也被选中


                  if (!checkStrictly && _this.isCheckedByCheckboxRow(row)) {
                    _this.setCheckboxRow(childs, true);
                  }
                }

                resolve(_this.$nextTick().then(function () {
                  return _this.recalculate();
                }));
              });
            } else {
              resolve(null);
            }
          });
        },
        setTreeExpand: function setTreeExpand(rows, expanded) {
          var _this = this;

          var _a = this,
              treeLazyLoadeds = _a.treeLazyLoadeds,
              treeOpts = _a.treeOpts,
              tableFullData = _a.tableFullData,
              treeNodeColumn = _a.treeNodeColumn;

          var lazy = treeOpts.lazy,
              hasChild = treeOpts.hasChild,
              accordion = treeOpts.accordion,
              toggleMethod = treeOpts.toggleMethod;
          var result = [];

          if (rows) {
            if (!ctor_1["default"].isArray(rows)) {
              rows = [rows];
            }

            var columnIndex_1 = this.getColumnIndex(treeNodeColumn);
            var $columnIndex_1 = this.getVMColumnIndex(treeNodeColumn);
            var validRows = toggleMethod ? rows.filter(function (row) {
              return toggleMethod({
                expanded: expanded,
                column: treeNodeColumn,
                row: row,
                columnIndex: columnIndex_1,
                $columnIndex: $columnIndex_1
              });
            }) : rows;

            if (accordion) {
              validRows = validRows.length ? [validRows[validRows.length - 1]] : []; // 同一级只能展开一个

              var matchObj = ctor_1["default"].findTree(tableFullData, function (item) {
                return item === rows[0];
              }, treeOpts);

              if (matchObj) {
                matchObj.items.forEach(function (row) {
                  //@ts-ignore
                  row._X_EXPAND = false;
                });
              }
            }

            validRows.forEach(function (row) {
              var isLoad = lazy && row[hasChild] && !row._X_LOADED && treeLazyLoadeds.indexOf(row) === -1; // 是否使用懒加载

              if (expanded && isLoad) {
                result.push(_this.handleAsyncTreeExpandChilds(row));
              } else {
                if (hasChilds(_this, row)) {
                  _this.virtualExpand(row, !!expanded);
                }
              }
            });
            return Promise.all(result).then(function () {
              _this._loadTreeData(_this.treeTableData);

              return _this.recalculate();
            });
          }

          return this.$nextTick();
        },
        setAllTreeExpansion: function setAllTreeExpansion(expanded) {
          return this.setAllTreeExpand(expanded);
        },
        setAllTreeExpand: function setAllTreeExpand(expanded) {
          return this._loadTreeData(this.virtualAllExpand(expanded));
        },
        toggleTreeExpansion: function toggleTreeExpansion(row) {
          return this.toggleTreeExpand(row);
        },
        triggerTreeExpandEvent: function triggerTreeExpandEvent(evnt, params) {
          var _a = this,
              treeOpts = _a.treeOpts,
              treeLazyLoadeds = _a.treeLazyLoadeds;

          var row = params.row,
              column = params.column;
          var lazy = treeOpts.lazy;

          if (!lazy || treeLazyLoadeds.indexOf(row) === -1) {
            var expanded = !this.isTreeExpandByRow(row);
            this.setTreeExpand(row, expanded);
            this.$emit('toggle-tree-expand', {
              expanded: expanded,
              column: column,
              row: row,
              $event: evnt
            });
          }
        },
        toggleTreeExpand: function toggleTreeExpand(row) {
          return this._loadTreeData(this.virtualExpand(row, !row._X_EXPAND));
        },
        getTreeExpandRecords: function getTreeExpandRecords() {
          var _this = this;

          var _a = this,
              fullTreeData = _a.fullTreeData,
              treeOpts = _a.treeOpts;

          var treeExpandRecords = [];
          ctor_1["default"].eachTree(fullTreeData, function (row) {
            if (row._X_EXPAND && hasChilds(_this, row)) {
              treeExpandRecords.push(row);
            }
          }, treeOpts);
          return treeExpandRecords;
        },
        clearTreeExpand: function clearTreeExpand() {
          return this.setAllTreeExpand(false);
        },
        handleColumns: function handleColumns(columns) {
          var _a = this,
              $vxe = _a.$vxe,
              renderTreeIcon = _a.renderTreeIcon,
              checkboxOpts = _a.checkboxOpts;

          if (columns) {
            if ((!checkboxOpts.checkField || !checkboxOpts.halfField) && columns.some(function (conf) {
              return conf.type === 'checkbox';
            })) {
              console.error($vxe.t('vxe.error.reqProp', ['table.checkbox-config.checkField | table.checkbox-config.halfField']));
              return [];
            }

            var treeNodeColumn = columns.find(function (conf) {
              return conf.treeNode;
            });

            if (treeNodeColumn) {
              var slots = treeNodeColumn.slots || {};
              slots.icon = renderTreeIcon;
              treeNodeColumn.slots = slots;
              this.treeNodeColumn = treeNodeColumn;
            }

            return columns;
          }

          return [];
        },

        /**
         * 获取表格数据集，包含新增、删除
         * 不支持修改
         */
        getRecordset: function getRecordset() {
          return {
            insertRecords: this.getInsertRecords(),
            removeRecords: this.getRemoveRecords(),
            updateRecords: []
          };
        },
        isInsertByRow: function isInsertByRow(row) {
          return !!row._X_INSERT;
        },
        getInsertRecords: function getInsertRecords() {
          var treeOpts = this.treeOpts;
          var insertRecords = [];
          ctor_1["default"].eachTree(this.fullTreeData, function (row) {
            if (row._X_INSERT) {
              insertRecords.push(row);
            }
          }, treeOpts);
          return insertRecords;
        },
        insert: function insert(records) {
          return this.insertAt(records, null);
        },

        /**
         * 支持任意层级插入与删除
         */
        insertAt: function insertAt(records, row) {
          var _this = this;

          var _a = this,
              fullTreeData = _a.fullTreeData,
              treeTableData = _a.treeTableData,
              treeOpts = _a.treeOpts;

          if (!ctor_1["default"].isArray(records)) {
            records = [records];
          }

          var newRecords = records.map(function (record) {
            return _this.defineField(Object.assign({
              _X_LOADED: false,
              _X_EXPAND: false,
              _X_INSERT: true,
              _X_LEVEL: 0
            }, record));
          });

          if (!row) {
            fullTreeData.unshift.apply(fullTreeData, newRecords);
            treeTableData.unshift.apply(treeTableData, newRecords);
          } else {
            if (row === -1) {
              fullTreeData.push.apply(fullTreeData, newRecords);
              treeTableData.push.apply(treeTableData, newRecords);
            } else {
              var matchObj = ctor_1["default"].findTree(fullTreeData, function (item) {
                return item === row;
              }, treeOpts);

              if (!matchObj || matchObj.index === -1) {
                throw new Error(t('vxe.error.unableInsert'));
              }

              var items = matchObj.items,
                  index = matchObj.index,
                  nodes_1 = matchObj.nodes;
              var rowIndex = treeTableData.indexOf(row);

              if (rowIndex > -1) {
                treeTableData.splice.apply(treeTableData, __spreadArray([rowIndex, 0], newRecords));
              }

              items.splice.apply(items, __spreadArray([index, 0], newRecords));
              newRecords.forEach(function (item) {
                item._X_LEVEL = nodes_1.length - 1;
              });
            }
          }

          return this._loadTreeData(treeTableData).then(function () {
            return {
              row: newRecords.length ? newRecords[newRecords.length - 1] : null,
              rows: newRecords
            };
          });
        },

        /**
         * 获取已删除的数据
         */
        getRemoveRecords: function getRemoveRecords() {
          return this.removeList;
        },
        removeSelecteds: function removeSelecteds() {
          return this.removeCheckboxRow();
        },

        /**
         * 删除选中数据
         */
        removeCheckboxRow: function removeCheckboxRow() {
          var _this = this;

          return this.remove(this.getCheckboxRecords()).then(function (params) {
            _this.clearSelection();

            return params;
          });
        },
        remove: function remove(rows) {
          var _this = this;

          var _a = this,
              removeList = _a.removeList,
              fullTreeData = _a.fullTreeData,
              treeOpts = _a.treeOpts;

          var rest = [];

          if (!rows) {
            rows = fullTreeData;
          } else if (!ctor_1["default"].isArray(rows)) {
            rows = [rows];
          }

          rows.forEach(function (row) {
            var matchObj = ctor_1["default"].findTree(fullTreeData, function (item) {
              return item === row;
            }, treeOpts);

            if (matchObj) {
              var item = matchObj.item,
                  items = matchObj.items,
                  index = matchObj.index,
                  parent_1 = matchObj.parent;

              if (!_this.isInsertByRow(row)) {
                removeList.push(row);
              }

              if (parent_1) {
                var isExpand = _this.isTreeExpandByRow(parent_1);

                if (isExpand) {
                  _this.handleCollapsing(parent_1);
                }

                items.splice(index, 1);

                if (isExpand) {
                  _this.handleExpanding(parent_1);
                }
              } else {
                _this.handleCollapsing(item);

                items.splice(index, 1);

                _this.treeTableData.splice(_this.treeTableData.indexOf(item), 1);
              }

              rest.push(item);
            }
          });
          return this._loadTreeData(this.treeTableData).then(function () {
            return {
              row: rest.length ? rest[rest.length - 1] : null,
              rows: rest
            };
          });
        },

        /**
         * 处理默认展开树节点
         */
        handleDefaultTreeExpand: function handleDefaultTreeExpand() {
          var _this = this;

          var _a = this,
              treeConfig = _a.treeConfig,
              treeOpts = _a.treeOpts,
              tableFullData = _a.tableFullData;

          if (treeConfig) {
            var children_1 = treeOpts.children,
                expandAll = treeOpts.expandAll,
                expandRowKeys = treeOpts.expandRowKeys;

            if (expandAll) {
              this.setAllTreeExpand(true);
            } else if (expandRowKeys && this.rowId) {
              var rowkey_1 = this.rowId;
              expandRowKeys.forEach(function (rowid) {
                var matchObj = ctor_1["default"].findTree(tableFullData, function (item) {
                  return rowid === ctor_1["default"].get(item, rowkey_1);
                }, treeOpts); //@ts-ignore

                var rowChildren = matchObj ? matchObj.item[children_1] : 0;

                if (rowChildren && rowChildren.length) {
                  //@ts-ignore
                  _this.setTreeExpand(matchObj.item, true);
                }
              });
            }
          }
        },

        /**
         * 定义树属性
         */
        toVirtualTree: function toVirtualTree(treeData) {
          var treeOpts = this.treeOpts;
          var fullTreeRowMap = this.fullTreeRowMap;
          fullTreeRowMap.clear();
          ctor_1["default"].eachTree(treeData, function (item, index, items, paths, parent, nodes) {
            item._X_LOADED = false;
            item._X_EXPAND = false;
            item._X_INSERT = false;
            item._X_LEVEL = nodes.length - 1;
            fullTreeRowMap.set(item, {
              item: item,
              index: index,
              items: items,
              paths: paths,
              parent: parent,
              nodes: nodes
            });
          }, treeOpts);
          this.fullTreeData = treeData.slice(0);
          this.treeTableData = treeData.slice(0);
          return treeData;
        },

        /**
         * 展开/收起树节点
         */
        virtualExpand: function virtualExpand(row, expanded) {
          var _a = this,
              treeOpts = _a.treeOpts,
              treeNodeColumn = _a.treeNodeColumn;

          var toggleMethod = treeOpts.toggleMethod;
          var columnIndex = this.getColumnIndex(treeNodeColumn);
          var $columnIndex = this.getVMColumnIndex(treeNodeColumn);

          if (!toggleMethod || toggleMethod({
            expanded: expanded,
            row: row,
            column: treeNodeColumn,
            columnIndex: columnIndex,
            $columnIndex: $columnIndex
          })) {
            if (row._X_EXPAND !== expanded) {
              if (row._X_EXPAND) {
                this.handleCollapsing(row);
              } else {
                this.handleExpanding(row);
              }
            }
          }

          return this.treeTableData;
        },
        // 展开节点
        handleExpanding: function handleExpanding(row) {
          if (hasChilds(this, row)) {
            var _a = this,
                treeTableData = _a.treeTableData,
                treeOpts = _a.treeOpts;

            var childRows = row[treeOpts.children];
            var expandList_1 = [];
            var rowIndex = treeTableData.indexOf(row);

            if (rowIndex === -1) {
              throw new Error('Expanding error');
            }

            var expandMaps_1 = new Map();
            ctor_1["default"].eachTree(childRows, function (item, index, obj, paths, parent, nodes) {
              if (!parent || parent._X_EXPAND && expandMaps_1.has(parent)) {
                expandMaps_1.set(item, 1);
                expandList_1.push(item);
              }
            }, treeOpts);
            row._X_EXPAND = true;
            treeTableData.splice.apply(treeTableData, __spreadArray([rowIndex + 1, 0], expandList_1));
          }

          return this.treeTableData;
        },
        // 收起节点
        handleCollapsing: function handleCollapsing(row) {
          if (hasChilds(this, row)) {
            var _a = this,
                treeTableData = _a.treeTableData,
                treeOpts = _a.treeOpts;

            var childRows = row[treeOpts.children];
            var nodeChildList_1 = [];
            ctor_1["default"].eachTree(childRows, function (item) {
              nodeChildList_1.push(item);
            }, treeOpts);
            row._X_EXPAND = false;
            this.treeTableData = treeTableData.filter(function (item) {
              return nodeChildList_1.indexOf(item) === -1;
            });
          }

          return this.treeTableData;
        },

        /**
         * 展开/收起所有树节点
         */
        virtualAllExpand: function virtualAllExpand(expanded) {
          var treeOpts = this.treeOpts;

          if (expanded) {
            var tableList_1 = [];
            ctor_1["default"].eachTree(this.fullTreeData, function (row) {
              row._X_EXPAND = expanded;
              tableList_1.push(row);
            }, treeOpts);
            this.treeTableData = tableList_1;
          } else {
            ctor_1["default"].eachTree(this.fullTreeData, function (row) {
              row._X_EXPAND = expanded;
            }, treeOpts);
            this.treeTableData = this.fullTreeData.slice(0);
          }

          return this.treeTableData;
        },
        checkboxAllEvent: function checkboxAllEvent(params) {
          var _a = this,
              checkboxOpts = _a.checkboxOpts,
              treeOpts = _a.treeOpts;

          var checkField = checkboxOpts.checkField,
              halfField = checkboxOpts.halfField,
              checkStrictly = checkboxOpts.checkStrictly;
          var checked = params.checked;

          if (checkField && !checkStrictly) {
            ctor_1["default"].eachTree(this.fullTreeData, function (row) {
              row[checkField] = checked;

              if (halfField) {
                row[halfField] = false;
              }
            }, treeOpts);
          }

          this.$emit('checkbox-all', params);
        },
        checkboxChangeEvent: function checkboxChangeEvent(params) {
          var _a = this,
              checkboxOpts = _a.checkboxOpts,
              treeOpts = _a.treeOpts;

          var checkField = checkboxOpts.checkField,
              halfField = checkboxOpts.halfField,
              checkStrictly = checkboxOpts.checkStrictly;
          var row = params.row,
              checked = params.checked;

          if (checkField && !checkStrictly) {
            ctor_1["default"].eachTree([row], function (row) {
              row[checkField] = checked;

              if (halfField) {
                row[halfField] = false;
              }
            }, treeOpts);
            this.checkParentNodeSelection(row);
          }

          this.$emit('checkbox-change', params);
        },
        checkParentNodeSelection: function checkParentNodeSelection(row) {
          var _a = this,
              checkboxOpts = _a.checkboxOpts,
              treeOpts = _a.treeOpts;

          var children = treeOpts.children;
          var checkField = checkboxOpts.checkField,
              halfField = checkboxOpts.halfField,
              checkStrictly = checkboxOpts.checkStrictly;
          var matchObj = ctor_1["default"].findTree(this.fullTreeData, function (item) {
            return item === row;
          }, treeOpts);

          if (matchObj && checkField && !checkStrictly) {
            //@ts-ignore
            var parentRow = matchObj.parent;

            if (parentRow) {
              var isAll = parentRow[children].every(function (item) {
                return item[checkField];
              });

              if (halfField && !isAll) {
                parentRow[halfField] = parentRow[children].some(function (item) {
                  return item[checkField] || item[halfField];
                });
              }

              parentRow[checkField] = isAll;
              this.checkParentNodeSelection(parentRow);
            } else {
              this.$refs.xTable.checkSelectionStatus();
            }
          }
        },
        getCheckboxRecords: function getCheckboxRecords() {
          var _a = this,
              checkboxOpts = _a.checkboxOpts,
              treeOpts = _a.treeOpts;

          var checkField = checkboxOpts.checkField;

          if (checkField) {
            var records_1 = [];
            ctor_1["default"].eachTree(this.fullTreeData, function (row) {
              if (row[checkField]) {
                records_1.push(row);
              }
            }, treeOpts);
            return records_1;
          }

          return this.$refs.xTable.getCheckboxRecords();
        },
        getCheckboxIndeterminateRecords: function getCheckboxIndeterminateRecords() {
          var _a = this,
              checkboxOpts = _a.checkboxOpts,
              treeOpts = _a.treeOpts;

          var halfField = checkboxOpts.halfField;

          if (halfField) {
            var records_2 = [];
            ctor_1["default"].eachTree(this.fullTreeData, function (row) {
              if (row[halfField]) {
                records_2.push(row);
              }
            }, treeOpts);
            return records_2;
          }

          return this.$refs.xTable.getCheckboxIndeterminateRecords();
        }
      }
    };
    vxetable.Vue.component(options.name, options);
  }
  /**
   * 基于 vxe-table 表格的增强插件，实现简单的虚拟树表格
   */


  exports.VXETablePluginVirtualTree = {
    install: function install(vxetable) {
      registerComponent(vxetable);
    }
  };

  if (typeof window !== 'undefined' && window.VXETable && window.VXETable.Table) {
    window.VXETable.use(exports.VXETablePluginVirtualTree);
  }

  exports["default"] = exports.VXETablePluginVirtualTree;
});
//# sourceMappingURL=data:application/json;charset=utf8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbImluZGV4LnRzIiwiaW5kZXguanMiXSwibmFtZXMiOlsiY3Rvcl8xIiwiX19zcHJlYWRBcnJheSIsInRvIiwiZnJvbSIsImkiLCJpbCIsImxlbmd0aCIsImoiLCJPYmplY3QiLCJkZWZpbmVQcm9wZXJ0eSIsImV4cG9ydHMiLCJ2YWx1ZSIsIlZYRVRhYmxlUGx1Z2luVmlydHVhbFRyZWUiLCJoYXNDaGlsZHMiLCJfdm0iLCJyb3ciLCJjaGlsZExpc3QiLCJ0cmVlT3B0cyIsImNoaWxkcmVuIiwicmVuZGVyRGVmYXVsdEZvcm0iLCJoIiwicHJveHlDb25maWciLCJwcm94eU9wdHMiLCJmb3JtRGF0YSIsImZvcm1Db25maWciLCJmb3JtT3B0cyIsIml0ZW1zIiwiaW5pdGVkIiwiYmVmb3JlSXRlbV8xIiwiYmVmb3JlSXRlbSIsImZvckVhY2giLCJpdGVtIiwiY2FsbCIsIiRncmlkIiwicHJvcHMiLCJhc3NpZ24iLCJkYXRhIiwiZm9ybSIsIm9uIiwic3VibWl0Iiwic3VibWl0RXZlbnQiLCJyZXNldCIsInJlc2V0RXZlbnQiLCJzdWJtaXRJbnZhbGlkRXZlbnQiLCJ0b2dnbENvbGxhcHNlRXZlbnQiLCJyZWYiLCJnZXRUb29sYmFyU2xvdHMiLCIkc2NvcGVkU2xvdHMiLCJ0b29sYmFyT3B0cyIsInRvb2xiYXJPcHRTbG90cyIsInNsb3RzIiwiJGJ1dHRvbnMiLCIkdG9vbHMiLCJidXR0b25zIiwidG9vbHMiLCJnZXRQYWdlclNsb3RzIiwicGFnZXJPcHRzIiwicGFnZXJPcHRTbG90cyIsIiRsZWZ0IiwiJHJpZ2h0IiwibGVmdCIsInJpZ2h0IiwiZ2V0VGFibGVPbnMiLCIkbGlzdGVuZXJzIiwib25zIiwiZWFjaCIsImNiIiwidHlwZSIsImFyZ3MiLCJfaSIsImFyZ3VtZW50cyIsIiRlbWl0IiwiYXBwbHkiLCJjaGVja2JveEFsbEV2ZW50IiwiY2hlY2tib3hDaGFuZ2VFdmVudCIsInNvcnQiLCJzb3J0Q2hhbmdlRXZlbnQiLCJmaWx0ZXIiLCJmaWx0ZXJDaGFuZ2VFdmVudCIsInJlZ2lzdGVyQ29tcG9uZW50IiwidnhldGFibGUiLCJzZXR1cCIsInQiLCJHbG9iYWxDb25maWciLCJwcm9wS2V5cyIsImtleXMiLCJUYWJsZSIsIm5hbWUiLCJpbmRleE9mIiwib3B0aW9ucyIsIkdyaWQiLCJyZW1vdmVMaXN0IiwidHJlZUxhenlMb2FkZWRzIiwiY29tcHV0ZWQiLCJ0YWJsZSIsInRyZWVDb25maWciLCJjaGVja2JveE9wdHMiLCJjaGVja2JveENvbmZpZyIsInRhYmxlRXh0ZW5kUHJvcHMiLCJfdGhpcyIsInJlc3QiLCJrZXkiLCJ3YXRjaCIsImNvbHVtbnMiLCJoYW5kbGVDb2x1bW5zIiwibG9hZERhdGEiLCJjcmVhdGVkIiwiX2EiLCIkdnhlIiwiZnVsbFRyZWVEYXRhIiwidHJlZVRhYmxlRGF0YSIsImZ1bGxUcmVlUm93TWFwIiwiTWFwIiwia2VlcFNvdXJjZSIsImNvbnNvbGUiLCJlcnJvciIsImxpbmUiLCJyZWxvYWREYXRhIiwicmVuZGVyIiwiX2IiLCJ2U2l6ZSIsImlzWk1heCIsImhhc0Zvcm0iLCJoYXNUb29sYmFyIiwidG9vbGJhciIsInRvb2xiYXJDb25maWciLCJoYXNQYWdlciIsInBhZ2VyIiwicGFnZXJDb25maWciLCJhbmltYXQiLCJyb3VuZCIsImxvYWRpbmciLCJ0YWJsZUxvYWRpbmciLCJzdHlsZSIsInJlbmRlclN0eWxlIiwic3RhdGljQ2xhc3MiLCJzY29wZWRTbG90cyIsInRvcCIsInRhYmxlUHJvcHMiLCJib3R0b20iLCJwYWdlclByb3BzIiwicGFnZUNoYW5nZUV2ZW50IiwibWV0aG9kcyIsImxvYWRDb2x1bW4iLCIkbmV4dFRpY2siLCJ0aGVuIiwicmVuZGVyVHJlZUljb24iLCJlYWNoVHJlZSIsImNvbHVtbiIsInRyZWVOb2RlIiwiaWNvbiIsImZ1bmMiLCJjb2xTbG90cyIsImlzRnVuY3Rpb24iLCIkcmVmcyIsInhUYWJsZSIsInBhcmFtcyIsImNlbGxWTm9kZXMiLCJpc0hpZGRlbiIsImhhc0NoaWxkIiwiaW5kZW50IiwibGF6eSIsInRyaWdnZXIiLCJpY29uTG9hZGVkIiwic2hvd0ljb24iLCJpY29uT3BlbiIsImljb25DbG9zZSIsInJvd0NoaWxkcyIsImhhc0xhenlDaGlsZHMiLCJpc0FjZWl2ZWQiLCJpc0xhenlMb2FkZWQiLCJfWF9FWFBBTkQiLCJjbGljayIsImV2bnQiLCJ0cmlnZ2VyVHJlZUV4cGFuZEV2ZW50IiwicGFkZGluZ0xlZnQiLCJfWF9MRVZFTCIsIlRBQkxFX1RSRUVfTE9BREVEIiwiVEFCTEVfVFJFRV9PUEVOIiwiVEFCTEVfVFJFRV9DTE9TRSIsIl9sb2FkVHJlZURhdGEiLCJzZWxlY3RSb3ciLCJnZXRSYWRpb1JlY29yZCIsInNldFJhZGlvUm93IiwidG9WaXJ0dWFsVHJlZSIsImhhbmRsZURlZmF1bHRUcmVlRXhwYW5kIiwiaXNUcmVlRXhwYW5kQnlSb3ciLCJzZXRUcmVlRXhwYW5zaW9uIiwicm93cyIsImV4cGFuZGVkIiwic2V0VHJlZUV4cGFuZCIsImhhbmRsZUFzeW5jVHJlZUV4cGFuZENoaWxkcyIsImxvYWRNZXRob2QiLCJjaGVja1N0cmljdGx5IiwiUHJvbWlzZSIsInJlc29sdmUiLCJwdXNoIiwiY2hpbGRzIiwiX1hfTE9BREVEIiwicmVtb3ZlIiwiaXNBcnJheSIsIm1hcCIsIl9YX0lOU0VSVCIsInZpcnR1YWxFeHBhbmQiLCJpc0NoZWNrZWRCeUNoZWNrYm94Um93Iiwic2V0Q2hlY2tib3hSb3ciLCJyZWNhbGN1bGF0ZSIsInRhYmxlRnVsbERhdGEiLCJ0cmVlTm9kZUNvbHVtbiIsImFjY29yZGlvbiIsInRvZ2dsZU1ldGhvZCIsInJlc3VsdCIsImNvbHVtbkluZGV4XzEiLCJnZXRDb2x1bW5JbmRleCIsIiRjb2x1bW5JbmRleF8xIiwiZ2V0Vk1Db2x1bW5JbmRleCIsInZhbGlkUm93cyIsImNvbHVtbkluZGV4IiwiJGNvbHVtbkluZGV4IiwibWF0Y2hPYmoiLCJmaW5kVHJlZSIsImlzTG9hZCIsImFsbCIsInNldEFsbFRyZWVFeHBhbnNpb24iLCJzZXRBbGxUcmVlRXhwYW5kIiwidmlydHVhbEFsbEV4cGFuZCIsInRvZ2dsZVRyZWVFeHBhbnNpb24iLCJ0b2dnbGVUcmVlRXhwYW5kIiwiJGV2ZW50IiwiZ2V0VHJlZUV4cGFuZFJlY29yZHMiLCJ0cmVlRXhwYW5kUmVjb3JkcyIsImNsZWFyVHJlZUV4cGFuZCIsImNoZWNrRmllbGQiLCJoYWxmRmllbGQiLCJzb21lIiwiY29uZiIsImZpbmQiLCJnZXRSZWNvcmRzZXQiLCJpbnNlcnRSZWNvcmRzIiwiZ2V0SW5zZXJ0UmVjb3JkcyIsInJlbW92ZVJlY29yZHMiLCJnZXRSZW1vdmVSZWNvcmRzIiwidXBkYXRlUmVjb3JkcyIsImlzSW5zZXJ0QnlSb3ciLCJpbnNlcnQiLCJyZWNvcmRzIiwiaW5zZXJ0QXQiLCJuZXdSZWNvcmRzIiwicmVjb3JkIiwiZGVmaW5lRmllbGQiLCJ1bnNoaWZ0IiwiaW5kZXgiLCJFcnJvciIsIm5vZGVzXzEiLCJub2RlcyIsInJvd0luZGV4Iiwic3BsaWNlIiwicmVtb3ZlU2VsZWN0ZWRzIiwicmVtb3ZlQ2hlY2tib3hSb3ciLCJnZXRDaGVja2JveFJlY29yZHMiLCJjbGVhclNlbGVjdGlvbiIsInBhcmVudF8xIiwicGFyZW50IiwiaXNFeHBhbmQiLCJoYW5kbGVDb2xsYXBzaW5nIiwiaGFuZGxlRXhwYW5kaW5nIiwiY2hpbGRyZW5fMSIsImV4cGFuZEFsbCIsImV4cGFuZFJvd0tleXMiLCJyb3dJZCIsInJvd2tleV8xIiwicm93aWQiLCJnZXQiLCJyb3dDaGlsZHJlbiIsInRyZWVEYXRhIiwiY2xlYXIiLCJwYXRocyIsInNldCIsInNsaWNlIiwiY2hpbGRSb3dzIiwiZXhwYW5kTGlzdF8xIiwiZXhwYW5kTWFwc18xIiwib2JqIiwiaGFzIiwibm9kZUNoaWxkTGlzdF8xIiwidGFibGVMaXN0XzEiLCJjaGVja2VkIiwiY2hlY2tQYXJlbnROb2RlU2VsZWN0aW9uIiwicGFyZW50Um93IiwiaXNBbGwiLCJldmVyeSIsImNoZWNrU2VsZWN0aW9uU3RhdHVzIiwicmVjb3Jkc18xIiwiZ2V0Q2hlY2tib3hJbmRldGVybWluYXRlUmVjb3JkcyIsInJlY29yZHNfMiIsIlZ1ZSIsImNvbXBvbmVudCIsImluc3RhbGwiLCJ3aW5kb3ciLCJWWEVUYWJsZSIsInVzZSJdLCJtYXBwaW5ncyI6Ijs7Ozt1QkFDQSxlOzs2QkFBQSxlOzs7Ozs7Ozs4QkFBQUEsTTtBQ0RBOztBQUNBLE1BQUlDLGFBQWEsR0FBSSxhQUFRLFVBQUtBLGFBQWQsSUFBZ0MsVUFBVUMsRUFBVixFQUFjQyxJQUFkLEVBQW9CO0FBQ3BFLFNBQUssSUFBSUMsQ0FBQyxHQUFHLENBQVIsRUFBV0MsRUFBRSxHQUFHRixJQUFJLENBQUNHLE1BQXJCLEVBQTZCQyxDQUFDLEdBQUdMLEVBQUUsQ0FBQ0ksTUFBekMsRUFBaURGLENBQUMsR0FBR0MsRUFBckQsRUFBeURELENBQUMsSUFBSUcsQ0FBQyxFQUEvRDtBQUNJTCxNQUFBQSxFQUFFLENBQUNLLENBQUQsQ0FBRixHQUFRSixJQUFJLENBQUNDLENBQUQsQ0FBWjtBQURKOztBQUVBLFdBQU9GLEVBQVA7QUFDSCxHQUpEOztBQUtBTSxFQUFBQSxNQUFNLENBQUNDLGNBQVAsQ0FBc0JDLE9BQXRCLEVBQStCLFlBQS9CLEVBQTZDO0FBQUVDLElBQUFBLEtBQUssRUFBRTtBQUFULEdBQTdDO0FBQ0FELEVBQUFBLE9BQU8sQ0FBQ0UseUJBQVIsR0FBb0MsS0FBSyxDQUF6Qzs7QURJQSxXQUFTQyxTQUFULENBQW9CQyxHQUFwQixFQUFzQ0MsR0FBdEMsRUFBa0Q7QUFDaEQsUUFBTUMsU0FBUyxHQUFHRCxHQUFHLENBQUNELEdBQUcsQ0FBQ0csUUFBSixDQUFhQyxRQUFkLENBQXJCO0FBQ0EsV0FBT0YsU0FBUyxJQUFJQSxTQUFTLENBQUNWLE1BQTlCO0FBQ0Q7O0FBRUQsV0FBU2EsaUJBQVQsQ0FBNEJDLENBQTVCLEVBQThDTixHQUE5QyxFQUE4RDtBQUNwRCxRQUFBTyxXQUFXLEdBQWdEUCxHQUFHLENBQUFPLFdBQTlEO0FBQUEsUUFBYUMsU0FBUyxHQUFxQ1IsR0FBRyxDQUFBUSxTQUE5RDtBQUFBLFFBQXdCQyxRQUFRLEdB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TCxDQUFXQyxNQUFYLENBQWtCMEksK0JBQWxCLEVBQVA7QUFDRDtBQTloQk07QUE1SXlCLEtBQXBDO0FBOHFCQXJOLElBQUFBLFFBQVEsQ0FBQ3VOLEdBQVQsQ0FBYUMsU0FBYixDQUF1Qi9NLE9BQU8sQ0FBQ0YsSUFBL0IsRUFBcUNFLE9BQXJDO0FBQ0Q7QUFFRDtBQ2ZBO0FBQ0E7OztBRGlCYS9FLEVBQUFBLE9BQUEsQ0FBQUUseUJBQUEsR0FBNEI7QUFDdkM2UixJQUFBQSxPQUFPLEVBQVAsaUJBQVN6TixRQUFULEVBQWtDO0FBQ2hDRCxNQUFBQSxpQkFBaUIsQ0FBQ0MsUUFBRCxDQUFqQjtBQUNEO0FBSHNDLEdBQTVCOztBQU1iLE1BQUksT0FBTzBOLE1BQVAsS0FBa0IsV0FBbEIsSUFBaUNBLE1BQU0sQ0FBQ0MsUUFBeEMsSUFBb0RELE1BQU0sQ0FBQ0MsUUFBUCxDQUFnQnJOLEtBQXhFLEVBQStFO0FBQzdFb04sSUFBQUEsTUFBTSxDQUFDQyxRQUFQLENBQWdCQyxHQUFoQixDQUFvQmxTLE9BQUEsQ0FBQUUseUJBQXBCO0FBQ0Q7O0FBRURGLEVBQUFBLE9BQUEsV0FBQSxHQUFlQSxPQUFBLENBQUFFLHlCQUFmIiwiZmlsZSI6ImluZGV4LmNvbW1vbi5qcyIsInNvdXJjZXNDb250ZW50IjpbImltcG9ydCBWdWUsIHsgQ3JlYXRlRWxlbWVudCwgVk5vZGVDaGlsZHJlbiwgVk5vZGUgfSBmcm9tICd2dWUnXG5pbXBvcnQgWEVVdGlscyBmcm9tICd4ZS11dGlscy9jdG9yJ1xuaW1wb3J0IHtcbiAgVlhFVGFibGUsXG4gIFRhYmxlLFxuICBHcmlkLFxuICBSb3dJbmZvLFxuICBDb2x1bW5PcHRpb25zLFxuICBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zXG59IGZyb20gJ3Z4ZS10YWJsZS9saWIvdnhlLXRhYmxlJ1xuXG5mdW5jdGlvbiBoYXNDaGlsZHMgKF92bTogVmlydHVhbFRyZWUsIHJvdzogUm93SW5mbykge1xuICBjb25zdCBjaGlsZExpc3QgPSByb3dbX3ZtLnRyZWVPcHRzLmNoaWxkcmVuXVxuICByZXR1cm4gY2hpbGRMaXN0ICYmIGNoaWxkTGlzdC5sZW5ndGhcbn1cblxuZnVuY3Rpb24gcmVuZGVyRGVmYXVsdEZvcm0gKGg6IENyZWF0ZUVsZW1lbnQsIF92bTogVmlydHVhbFRyZWUpIHtcbiAgY29uc3QgeyBwcm94eUNvbmZpZywgcHJveHlPcHRzLCBmb3JtRGF0YSwgZm9ybUNvbmZpZywgZm9ybU9wdHMgfSA9IF92bVxuICBpZiAoZm9ybUNvbmZpZyAmJiBmb3JtT3B0cy5pdGVtcyAmJiBmb3JtT3B0cy5pdGVtcy5sZW5ndGgpIHtcbiAgICBpZiAoIWZvcm1PcHRzLmluaXRlZCkge1xuICAgICAgZm9ybU9wdHMuaW5pdGVkID0gdHJ1ZVxuICAgICAgY29uc3QgYmVmb3JlSXRlbSA9IHByb3h5T3B0cy5iZWZvcmVJdGVtXG4gICAgICBpZiAocHJveHlPcHRzICYmIGJlZm9yZUl0ZW0pIHtcbiAgICAgICAgZm9ybU9wdHMuaXRlbXMuZm9yRWFjaCgoaXRlbTogYW55KSA9PiB7XG4gICAgICAgICAgYmVmb3JlSXRlbS5jYWxsKF92bSwgeyAkZ3JpZDogX3ZtLCBpdGVtIH0pXG4gICAgICAgIH0pXG4gICAgICB9XG4gICAgfVxuICAgIHJldHVybiBbXG4gICAgICBoKCd2eGUtZm9ybScsIHtcbiAgICAgICAgcHJvcHM6IE9iamVjdC5hc3NpZ24oe30sIGZvcm1PcHRzLCB7XG4gICAgICAgICAgZGF0YTogcHJveHlDb25maWcgJiYgcHJveHlPcHRzLmZvcm0gPyBmb3JtRGF0YSA6IGZvcm1PcHRzLmRhdGFcbiAgICAgICAgfSksXG4gICAgICAgIG9uOiB7XG4gICAgICAgICAgc3VibWl0OiBfdm0uc3VibWl0RXZlbnQsXG4gICAgICAgICAgcmVzZXQ6IF92bS5yZXNldEV2ZW50LFxuICAgICAgICAgICdzdWJtaXQtaW52YWxpZCc6IF92bS5zdWJtaXRJbnZhbGlkRXZlbnQsXG4gICAgICAgICAgJ3RvZ2dsZS1jb2xsYXBzZSc6IF92bS50b2dnbENvbGxhcHNlRXZlbnRcbiAgICAgICAgfSxcbiAgICAgICAgcmVmOiAnZm9ybSdcbiAgICAgIH0pXG4gICAgXVxuICB9XG4gIHJldHVybiBbXVxufVxuXG5mdW5jdGlvbiBnZXRUb29sYmFyU2xvdHMgKF92bTogVmlydHVhbFRyZWUpIHtcbiAgY29uc3QgeyAkc2NvcGVkU2xvdHMsIHRvb2xiYXJPcHRzIH0gPSBfdm1cbiAgY29uc3QgdG9vbGJhck9wdFNsb3RzID0gdG9vbGJhck9wdHMuc2xvdHNcbiAgbGV0ICRidXR0b25zXG4gIGxldCAkdG9vbHNcbiAgY29uc3Qgc2xvdHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fVxuICBpZiAodG9vbGJhck9wdFNsb3RzKSB7XG4gICAgJGJ1dHRvbnMgPSB0b29sYmFyT3B0U2xvdHMuYnV0dG9uc1xuICAgICR0b29scyA9IHRvb2xiYXJPcHRTbG90cy50b29sc1xuICAgIGlmICgkYnV0dG9ucyAmJiAkc2NvcGVkU2xvdHNbJGJ1dHRvbnNdKSB7XG4gICAgICAkYnV0dG9ucyA9ICRzY29wZWRTbG90c1skYnV0dG9uc11cbiAgICB9XG4gICAgaWYgKCR0b29scyAmJiAkc2NvcGVkU2xvdHNbJHRvb2xzXSkge1xuICAgICAgJHRvb2xzID0gJHNjb3BlZFNsb3RzWyR0b29sc11cbiAgICB9XG4gIH1cbiAgaWYgKCRidXR0b25zKSB7XG4gICAgc2xvdHMuYnV0dG9ucyA9ICRidXR0b25zXG4gIH1cbiAgaWYgKCR0b29scykge1xuICAgIHNsb3RzLnRvb2xzID0gJHRvb2xzXG4gIH1cbiAgcmV0dXJuIHNsb3RzXG59XG5cbmZ1bmN0aW9uIGdldFBhZ2VyU2xvdHMgKF92bTogVmlydHVhbFRyZWUpIHtcbiAgY29uc3QgeyAkc2NvcGVkU2xvdHMsIHBhZ2VyT3B0cyB9ID0gX3ZtXG4gIGNvbnN0IHBhZ2VyT3B0U2xvdHMgPSBwYWdlck9wdHMuc2xvdHNcbiAgY29uc3Qgc2xvdHM6IHsgW2tleTogc3RyaW5nXTogYW55IH0gPSB7fVxuICBsZXQgJGxlZnRcbiAgbGV0ICRyaWdodFxuICBpZiAocGFnZXJPcHRTbG90cykge1xuICAgICRsZWZ0ID0gcGFnZXJPcHRTbG90cy5sZWZ0XG4gICAgJHJpZ2h0ID0gcGFnZXJPcHRTbG90cy5yaWdodFxuICAgIGlmICgkbGVmdCAmJiAkc2NvcGVkU2xvdHNbJGxlZnRdKSB7XG4gICAgICAkbGVmdCA9ICRzY29wZWRTbG90c1skbGVmdF1cbiAgICB9XG4gICAgaWYgKCRyaWdodCAmJiAkc2NvcGVkU2xvdHNbJHJpZ2h0XSkge1xuICAgICAgJHJpZ2h0ID0gJHNjb3BlZFNsb3RzWyRyaWdodF1cbiAgICB9XG4gIH1cbiAgaWYgKCRsZWZ0KSB7XG4gICAgc2xvdHMubGVmdCA9ICRsZWZ0XG4gIH1cbiAgaWYgKCRyaWdodCkge1xuICAgIHNsb3RzLnJpZ2h0ID0gJHJpZ2h0XG4gIH1cbiAgcmV0dXJuIHNsb3RzXG59XG5cbmZ1bmN0aW9uIGdldFRhYmxlT25zIChfdm06IFZpcnR1YWxUcmVlKSB7XG4gIGNvbnN0IHsgJGxpc3RlbmVycywgcHJveHlDb25maWcsIHByb3h5T3B0cyB9ID0gX3ZtXG4gIGNvbnN0IG9uczogeyBba2V5OiBzdHJpbmddOiBGdW5jdGlvbiB9ID0ge31cbiAgWEVVdGlscy5lYWNoKCRsaXN0ZW5lcnMsIChjYiwgdHlwZSkgPT4ge1xuICAgIG9uc1t0eXBlXSA9ICguLi5hcmdzOiBhbnlbXSkgPT4ge1xuICAgICAgX3ZtLiRlbWl0KHR5cGUsIC4uLmFyZ3MpXG4gICAgfVxuICB9KVxuICBvbnNbJ2NoZWNrYm94LWFsbCddID0gX3ZtLmNoZWNrYm94QWxsRXZlbnRcbiAgb25zWydjaGVja2JveC1jaGFuZ2UnXSA9IF92bS5jaGVja2JveENoYW5nZUV2ZW50XG4gIGlmIChwcm94eUNvbmZpZykge1xuICAgIGlmIChwcm94eU9wdHMuc29ydCkge1xuICAgICAgb25zWydzb3J0LWNoYW5nZSddID0gX3ZtLnNvcnRDaGFuZ2VFdmVudFxuICAgIH1cbiAgICBpZiAocHJveHlPcHRzLmZpbHRlcikge1xuICAgICAgb25zWydmaWx0ZXItY2hhbmdlJ10gPSBfdm0uZmlsdGVyQ2hhbmdlRXZlbnRcbiAgICB9XG4gIH1cbiAgcmV0dXJuIG9uc1xufVxuXG5kZWNsYXJlIG1vZHVsZSAndnhlLXRhYmxlL2xpYi92eGUtdGFibGUnIHtcbiAgaW50ZXJmYWNlIFZYRVRhYmxlU3RhdGljIHtcbiAgICBWdWU6IHR5cGVvZiBWdWU7XG4gICAgR3JpZDogR3JpZDtcbiAgICBUYWJsZTogVGFibGU7XG4gIH1cbn1cblxuaW50ZXJmYWNlIFZpcnR1YWxUcmVlIGV4dGVuZHMgR3JpZCB7XG4gICRyZWZzOiB7XG4gICAgeFRhYmxlOiBUYWJsZTtcbiAgICBba2V5OiBzdHJpbmddOiBhbnk7XG4gIH07XG4gIF9sb2FkVHJlZURhdGEoZGF0YTogUm93SW5mb1tdKTogUHJvbWlzZTxhbnk+O1xuICBoYW5kbGVDb2x1bW5zKGNvbHVtbnM6IENvbHVtbk9wdGlvbnNbXSk6IENvbHVtbk9wdGlvbnNbXTtcbiAgdG9WaXJ0dWFsVHJlZSh0cmVlRGF0YTogUm93SW5mb1tdKTogUm93SW5mb1tdO1xuICBoYW5kbGVFeHBhbmRpbmcocm93OiBSb3dJbmZvKTogUm93SW5mb1tdO1xuICBoYW5kbGVDb2xsYXBzaW5nKHJvdzogUm93SW5mbyk6IFJvd0luZm9bXTtcbiAgW2tleTogc3RyaW5nXTogYW55O1xufVxuXG5pbnRlcmZhY2UgVmlydHVhbFRyZWVPcHRpb25zIHtcbiAgZGF0YT86ICh0aGlzOiBWaXJ0dWFsVHJlZSkgPT4gYW55O1xuICBjb21wdXRlZD86IHsgW2tleTogc3RyaW5nXTogKHRoaXM6IFZpcnR1YWxUcmVlKSA9PiBhbnkgfVxuICB3YXRjaD86IHsgW2tleTogc3RyaW5nXTogKHRoaXM6IFZpcnR1YWxUcmVlLCAuLi5hcmdzOiBhbnlbXSkgPT4gYW55IH1cbiAgY3JlYXRlZD86ICh0aGlzOiBWaXJ0dWFsVHJlZSkgPT4gYW55O1xuICByZW5kZXI/OiAodGhpczogVmlydHVhbFRyZWUsIGg6IENyZWF0ZUVsZW1lbnQpID0+IFZOb2RlO1xuICBtZXRob2RzPzogeyBba2V5OiBzdHJpbmddOiAodGhpczogVmlydHVhbFRyZWUsIC4uLmFyZ3M6IGFueVtdKSA9PiBhbnkgfVxuICBba2V5OiBzdHJpbmddOiBhbnk7XG59XG5cbmZ1bmN0aW9uIHJlZ2lzdGVyQ29tcG9uZW50ICh2eGV0YWJsZTogdHlwZW9mIFZYRVRhYmxlKSB7XG4gIGNvbnN0IHsgc2V0dXAsIHQgfSA9IHZ4ZXRhYmxlXG4gIGNvbnN0IEdsb2JhbENvbmZpZyA9IHNldHVwKClcbiAgY29uc3QgcHJvcEtleXMgPSBPYmplY3Qua2V5cyh2eGV0YWJsZS5UYWJsZS5wcm9wcykuZmlsdGVyKG5hbWUgPT4gWydkYXRhJywgJ3RyZWVDb25maWcnXS5pbmRleE9mKG5hbWUpID09PSAtMSlcblxuICBjb25zdCBvcHRpb25zOiBWaXJ0dWFsVHJlZU9wdGlvbnMgPSB7XG4gICAgbmFtZTogJ1Z4ZVZpcnR1YWxUcmVlJyxcbiAgICBleHRlbmRzOiB2eGV0YWJsZS5HcmlkLFxuICAgIGRhdGEgKCkge1xuICAgICAgcmV0dXJuIHtcbiAgICAgICAgcmVtb3ZlTGlzdDogW10sXG4gICAgICAgIHRyZWVMYXp5TG9hZGVkczogW11cbiAgICAgIH1cbiAgICB9LFxuICAgIGNvbXB1dGVkOiB7XG4gICAgICB0cmVlT3B0cyAoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBHbG9iYWxDb25maWcudGFibGUudHJlZUNvbmZpZywgdGhpcy50cmVlQ29uZmlnKVxuICAgICAgfSxcbiAgICAgIGNoZWNrYm94T3B0cyAoKSB7XG4gICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBHbG9iYWxDb25maWcudGFibGUuY2hlY2tib3hDb25maWcsIHRoaXMuY2hlY2tib3hDb25maWcpXG4gICAgICB9LFxuICAgICAgdGFibGVFeHRlbmRQcm9wcyAoKSB7XG4gICAgICAgIGxldCByZXN0OiB7IFtrZXk6IHN0cmluZ106IGFueSB9ID0ge31cbiAgICAgICAgcHJvcEtleXMuZm9yRWFjaChrZXkgPT4ge1xuICAgICAgICAgIHJlc3Rba2V5XSA9IHRoaXNba2V5XVxuICAgICAgICB9KVxuICAgICAgICBpZiAocmVzdC5jaGVja2JveENvbmZpZykge1xuICAgICAgICAgIHJlc3QuY2hlY2tib3hDb25maWcgPSB0aGlzLmNoZWNrYm94T3B0c1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiByZXN0XG4gICAgICB9XG4gICAgfSxcbiAgICB3YXRjaDoge1xuICAgICAgY29sdW1ucyAodmFsdWU6IENvbHVtbk9wdGlvbnNbXSkge1xuICAgICAgICB0aGlzLmhhbmRsZUNvbHVtbnModmFsdWUpXG4gICAgICB9LFxuICAgICAgZGF0YSAodmFsdWU6IGFueVtdKSB7XG4gICAgICAgIHRoaXMubG9hZERhdGEodmFsdWUpXG4gICAgICB9XG4gICAgfSxcbiAgICBjcmVhdGVkICgpIHtcbiAgICAgIGNvbnN0IHsgJHZ4ZSwgdHJlZU9wdHMsIGRhdGEsIGNvbHVtbnMgfSA9IHRoaXNcbiAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuICAgICAgICBmdWxsVHJlZURhdGE6IFtdLFxuICAgICAgICB0cmVlVGFibGVEYXRhOiBbXSxcbiAgICAgICAgZnVsbFRyZWVSb3dNYXA6IG5ldyBNYXAoKVxuICAgICAgfSlcbiAgICAgIGlmICh0aGlzLmtlZXBTb3VyY2UpIHtcbiAgICAgICAgY29uc29sZS5lcnJvcigkdnhlLnQoJ3Z4ZS5lcnJvci5ub3RQcm9wJywgWydrZWVwLXNvdXJjZSddKSlcbiAgICAgIH1cbiAgICAgIGlmICh0cmVlT3B0cy5saW5lKSB7XG4gICAgICAgIGNvbnNvbGUuZXJyb3IoJHZ4ZS50KCd2eGUuZXJyb3Iubm90UHJvcCcsIFsnY2hlY2tib3gtY29uZmlnLmxpbmUnXSkpXG4gICAgICB9XG4gICAgICBpZiAoY29sdW1ucykge1xuICAgICAgICB0aGlzLmhhbmRsZUNvbHVtbnMoY29sdW1ucylcbiAgICAgIH1cbiAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgIHRoaXMucmVsb2FkRGF0YShkYXRhKVxuICAgICAgfVxuICAgIH0sXG4gICAgcmVuZGVyIChoOiBDcmVhdGVFbGVtZW50KSB7XG4gICAgICBjb25zdCB7IHZTaXplLCBpc1pNYXggfSA9IHRoaXNcbiAgICAgIGNvbnN0ICRzY29wZWRTbG90czogYW55ID0gdGhpcy4kc2NvcGVkU2xvdHNcbiAgICAgIGNvbnN0IGhhc0Zvcm0gPSAhISgkc2NvcGVkU2xvdHMuZm9ybSB8fCB0aGlzLmZvcm1Db25maWcpXG4gICAgICBjb25zdCBoYXNUb29sYmFyID0gISEoJHNjb3BlZFNsb3RzLnRvb2xiYXIgfHwgdGhpcy50b29sYmFyQ29uZmlnIHx8IHRoaXMudG9vbGJhcilcbiAgICAgIGNvbnN0IGhhc1BhZ2VyID0gISEoJHNjb3BlZFNsb3RzLnBhZ2VyIHx8IHRoaXMucGFnZXJDb25maWcpXG4gICAgICByZXR1cm4gaCgnZGl2Jywge1xuICAgICAgICBjbGFzczogWyd2eGUtZ3JpZCcsICd2eGUtdmlydHVhbC10cmVlJywge1xuICAgICAgICAgIFtgc2l6ZS0tJHt2U2l6ZX1gXTogdlNpemUsXG4gICAgICAgICAgJ3QtLWFuaW1hdCc6ICEhdGhpcy5hbmltYXQsXG4gICAgICAgICAgJ2lzLS1yb3VuZCc6IHRoaXMucm91bmQsXG4gICAgICAgICAgJ2lzLS1tYXhpbWl6ZSc6IGlzWk1heCxcbiAgICAgICAgICAnaXMtLWxvYWRpbmcnOiB0aGlzLmxvYWRpbmcgfHwgdGhpcy50YWJsZUxvYWRpbmdcbiAgICAgICAgfV0sXG4gICAgICAgIHN0eWxlOiB0aGlzLnJlbmRlclN0eWxlXG4gICAgICB9LCBbXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmuLLmn5PooajljZVcbiAgICAgICAgICovXG4gICAgICAgIGhhc0Zvcm0gPyBoKCdkaXYnLCB7XG4gICAgICAgICAgcmVmOiAnZm9ybVdyYXBwZXInLFxuICAgICAgICAgIHN0YXRpY0NsYXNzOiAndnhlLWdyaWQtLWZvcm0td3JhcHBlcidcbiAgICAgICAgfSwgJHNjb3BlZFNsb3RzLmZvcm1cbiAgICAgICAgICA/ICRzY29wZWRTbG90cy5mb3JtLmNhbGwodGhpcywgeyAkZ3JpZDogdGhpcyB9LCBoKVxuICAgICAgICAgIDogcmVuZGVyRGVmYXVsdEZvcm0oaCwgdGhpcylcbiAgICAgICAgKSA6IG51bGwsXG4gICAgICAgIC8qKlxuICAgICAgICAgKiDmuLLmn5Plt6XlhbfmoI9cbiAgICAgICAgICovXG4gICAgICAgIGhhc1Rvb2xiYXIgPyBoKCdkaXYnLCB7XG4gICAgICAgICAgcmVmOiAndG9vbGJhcldyYXBwZXInLFxuICAgICAgICAgIGNsYXNzOiAndnhlLWdyaWQtLXRvb2xiYXItd3JhcHBlcidcbiAgICAgICAgfSwgJHNjb3BlZFNsb3RzLnRvb2xiYXJcbiAgICAgICAgICA/ICRzY29wZWRTbG90cy50b29sYmFyLmNhbGwodGhpcywgeyAkZ3JpZDogdGhpcyB9LCBoKVxuICAgICAgICAgIDogW1xuICAgICAgICAgICAgaCgndnhlLXRvb2xiYXInLCB7XG4gICAgICAgICAgICAgIHByb3BzOiB0aGlzLnRvb2xiYXJPcHRzLFxuICAgICAgICAgICAgICByZWY6ICd4VG9vbGJhcicsXG4gICAgICAgICAgICAgIHNjb3BlZFNsb3RzOiBnZXRUb29sYmFyU2xvdHModGhpcylcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgXVxuICAgICAgICApIDogbnVsbCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOa4suafk+ihqOagvOmhtumDqOWMuuWfn1xuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlZFNsb3RzLnRvcCA/IGgoJ2RpdicsIHtcbiAgICAgICAgICByZWY6ICd0b3BXcmFwcGVyJyxcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3Z4ZS1ncmlkLS10b3Atd3JhcHBlcidcbiAgICAgICAgfSwgJHNjb3BlZFNsb3RzLnRvcC5jYWxsKHRoaXMsIHsgJGdyaWQ6IHRoaXMgfSwgaCkpIDogbnVsbCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOa4suafk+ihqOagvFxuICAgICAgICAgKi9cbiAgICAgICAgaCgndnhlLXRhYmxlJywge1xuICAgICAgICAgIHByb3BzOiB0aGlzLnRhYmxlUHJvcHMsXG4gICAgICAgICAgb246IGdldFRhYmxlT25zKHRoaXMpLFxuICAgICAgICAgIHNjb3BlZFNsb3RzOiAkc2NvcGVkU2xvdHMsXG4gICAgICAgICAgcmVmOiAneFRhYmxlJ1xuICAgICAgICB9KSxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOa4suafk+ihqOagvOW6lemDqOWMuuWfn1xuICAgICAgICAgKi9cbiAgICAgICAgJHNjb3BlZFNsb3RzLmJvdHRvbSA/IGgoJ2RpdicsIHtcbiAgICAgICAgICByZWY6ICdib3R0b21XcmFwcGVyJyxcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3Z4ZS1ncmlkLS1ib3R0b20td3JhcHBlcidcbiAgICAgICAgfSwgJHNjb3BlZFNsb3RzLmJvdHRvbS5jYWxsKHRoaXMsIHsgJGdyaWQ6IHRoaXMgfSwgaCkpIDogbnVsbCxcbiAgICAgICAgLyoqXG4gICAgICAgICAqIOa4suafk+WIhumhtVxuICAgICAgICAgKi9cbiAgICAgICAgaGFzUGFnZXIgPyBoKCdkaXYnLCB7XG4gICAgICAgICAgcmVmOiAncGFnZXJXcmFwcGVyJyxcbiAgICAgICAgICBzdGF0aWNDbGFzczogJ3Z4ZS1ncmlkLS1wYWdlci13cmFwcGVyJ1xuICAgICAgICB9LCAkc2NvcGVkU2xvdHMucGFnZXJcbiAgICAgICAgICA/ICRzY29wZWRTbG90cy5wYWdlci5jYWxsKHRoaXMsIHsgJGdyaWQ6IHRoaXMgfSwgaClcbiAgICAgICAgICA6IFtcbiAgICAgICAgICAgIGgoJ3Z4ZS1wYWdlcicsIHtcbiAgICAgICAgICAgICAgcHJvcHM6IHRoaXMucGFnZXJQcm9wcyxcbiAgICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgICAncGFnZS1jaGFuZ2UnOiB0aGlzLnBhZ2VDaGFuZ2VFdmVudFxuICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICBzY29wZWRTbG90czogZ2V0UGFnZXJTbG90cyh0aGlzKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICBdXG4gICAgICAgICkgOiBudWxsXG4gICAgICBdKVxuICAgIH0sXG4gICAgbWV0aG9kczoge1xuICAgICAgbG9hZENvbHVtbiAoY29sdW1uczogQ29sdW1uT3B0aW9uc1tdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRuZXh0VGljaygpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIGNvbnN0IHsgJHZ4ZSwgJHNjb3BlZFNsb3RzLCByZW5kZXJUcmVlSWNvbiwgdHJlZU9wdHMgfSA9IHRoaXNcbiAgICAgICAgICBYRVV0aWxzLmVhY2hUcmVlKGNvbHVtbnMsIGNvbHVtbiA9PiB7XG4gICAgICAgICAgICBpZiAoY29sdW1uLnRyZWVOb2RlKSB7XG4gICAgICAgICAgICAgIGlmICghY29sdW1uLnNsb3RzKSB7XG4gICAgICAgICAgICAgICAgY29sdW1uLnNsb3RzID0ge31cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBjb2x1bW4uc2xvdHMuaWNvbiA9IHJlbmRlclRyZWVJY29uXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29sdW1uLnNsb3RzKSB7XG4gICAgICAgICAgICAgIFhFVXRpbHMuZWFjaChjb2x1bW4uc2xvdHMsIChmdW5jLCBuYW1lLCBjb2xTbG90czogYW55KSA9PiB7XG4gICAgICAgICAgICAgICAgLy8g5YW85a65IHYyXG4gICAgICAgICAgICAgICAgaWYgKCFYRVV0aWxzLmlzRnVuY3Rpb24oZnVuYykpIHtcbiAgICAgICAgICAgICAgICAgIGlmICgkc2NvcGVkU2xvdHNbZnVuY10pIHtcbiAgICAgICAgICAgICAgICAgICAgY29sU2xvdHNbbmFtZV0gPSAkc2NvcGVkU2xvdHNbZnVuY11cbiAgICAgICAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgIGNvbFNsb3RzW25hbWVdID0gbnVsbFxuICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCR2eGUudCgndnhlLmVycm9yLm5vdFNsb3QnLCBbZnVuY10pKVxuICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCB0cmVlT3B0cylcbiAgICAgICAgICB0aGlzLiRyZWZzLnhUYWJsZS5sb2FkQ29sdW1uKGNvbHVtbnMpXG4gICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgcmVuZGVyVHJlZUljb24gKHBhcmFtczogQ29sdW1uQ2VsbFJlbmRlclBhcmFtcywgaDogQ3JlYXRlRWxlbWVudCwgY2VsbFZOb2RlczogVk5vZGVDaGlsZHJlbikge1xuICAgICAgICBjb25zdCB7IHRyZWVMYXp5TG9hZGVkcywgdHJlZU9wdHMgfSA9IHRoaXNcbiAgICAgICAgbGV0IHsgaXNIaWRkZW4sIHJvdyB9ID0gcGFyYW1zXG4gICAgICAgIGNvbnN0IHsgY2hpbGRyZW4sIGhhc0NoaWxkLCBpbmRlbnQsIGxhenksIHRyaWdnZXIsIGljb25Mb2FkZWQsIHNob3dJY29uLCBpY29uT3BlbiwgaWNvbkNsb3NlIH0gPSB0cmVlT3B0c1xuICAgICAgICBsZXQgcm93Q2hpbGRzID0gcm93W2NoaWxkcmVuXVxuICAgICAgICBsZXQgaGFzTGF6eUNoaWxkcyA9IGZhbHNlXG4gICAgICAgIGxldCBpc0FjZWl2ZWQgPSBmYWxzZVxuICAgICAgICBsZXQgaXNMYXp5TG9hZGVkID0gZmFsc2VcbiAgICAgICAgbGV0IG9uOiB7IFtrZXk6IHN0cmluZ106IEZ1bmN0aW9uIH0gPSB7fVxuICAgICAgICBpZiAoIWlzSGlkZGVuKSB7XG4gICAgICAgICAgaXNBY2VpdmVkID0gcm93Ll9YX0VYUEFORFxuICAgICAgICAgIGlmIChsYXp5KSB7XG4gICAgICAgICAgICBpc0xhenlMb2FkZWQgPSB0cmVlTGF6eUxvYWRlZHMuaW5kZXhPZihyb3cpID4gLTFcbiAgICAgICAgICAgIGhhc0xhenlDaGlsZHMgPSByb3dbaGFzQ2hpbGRdXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmICghdHJpZ2dlciB8fCB0cmlnZ2VyID09PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICBvbi5jbGljayA9IChldm50OiBFdmVudCkgPT4gdGhpcy50cmlnZ2VyVHJlZUV4cGFuZEV2ZW50KGV2bnQsIHBhcmFtcylcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgIGgoJ2RpdicsIHtcbiAgICAgICAgICAgIGNsYXNzOiBbJ3Z4ZS1jZWxsLS10cmVlLW5vZGUnLCB7XG4gICAgICAgICAgICAgICdpcy0tYWN0aXZlJzogaXNBY2VpdmVkXG4gICAgICAgICAgICB9XSxcbiAgICAgICAgICAgIHN0eWxlOiB7XG4gICAgICAgICAgICAgIHBhZGRpbmdMZWZ0OiBgJHtyb3cuX1hfTEVWRUwgKiBpbmRlbnR9cHhgXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgW1xuICAgICAgICAgICAgc2hvd0ljb24gJiYgKChyb3dDaGlsZHMgJiYgcm93Q2hpbGRzLmxlbmd0aCkgfHwgaGFzTGF6eUNoaWxkcykgPyBbXG4gICAgICAgICAgICAgIGgoJ2RpdicsIHtcbiAgICAgICAgICAgICAgICBjbGFzczogJ3Z4ZS10cmVlLS1idG4td3JhcHBlcicsXG4gICAgICAgICAgICAgICAgb25cbiAgICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIGgoJ2knLCB7XG4gICAgICAgICAgICAgICAgICBjbGFzczogWyd2eGUtdHJlZS0tbm9kZS1idG4nLCBpc0xhenlMb2FkZWQgPyAoaWNvbkxvYWRlZCB8fCBHbG9iYWxDb25maWcuaWNvbi5UQUJMRV9UUkVFX0xPQURFRCkgOiAoaXNBY2VpdmVkID8gKGljb25PcGVuIHx8IEdsb2JhbENvbmZpZy5pY29uLlRBQkxFX1RSRUVfT1BFTikgOiAoaWNvbkNsb3NlIHx8IEdsb2JhbENvbmZpZy5pY29uLlRBQkxFX1RSRUVfQ0xPU0UpKV1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgXSA6IG51bGwsXG4gICAgICAgICAgICBoKCdkaXYnLCB7XG4gICAgICAgICAgICAgIGNsYXNzOiAndnhlLXRyZWUtY2VsbCdcbiAgICAgICAgICAgIH0sIGNlbGxWTm9kZXMpXG4gICAgICAgICAgXSlcbiAgICAgICAgXVxuICAgICAgfSxcbiAgICAgIF9sb2FkVHJlZURhdGEgKGRhdGE6IFJvd0luZm9bXSkge1xuICAgICAgICBjb25zdCBzZWxlY3RSb3cgPSB0aGlzLmdldFJhZGlvUmVjb3JkKClcbiAgICAgICAgcmV0dXJuIHRoaXMuJG5leHRUaWNrKClcbiAgICAgICAgICAudGhlbigoKSA9PiB0aGlzLiRyZWZzLnhUYWJsZS5sb2FkRGF0YShkYXRhKSlcbiAgICAgICAgICAudGhlbigoKSA9PiB7XG4gICAgICAgICAgICBpZiAoc2VsZWN0Um93KSB7XG4gICAgICAgICAgICAgIHRoaXMuc2V0UmFkaW9Sb3coc2VsZWN0Um93KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0pXG4gICAgICB9LFxuICAgICAgbG9hZERhdGEgKGRhdGE6IGFueVtdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkVHJlZURhdGEodGhpcy50b1ZpcnR1YWxUcmVlKGRhdGEpKVxuICAgICAgfSxcbiAgICAgIHJlbG9hZERhdGEgKGRhdGE6IGFueVtdKSB7XG4gICAgICAgIHJldHVybiB0aGlzLiRuZXh0VGljaygpXG4gICAgICAgICAgLnRoZW4oKCkgPT4gdGhpcy4kcmVmcy54VGFibGUucmVsb2FkRGF0YSh0aGlzLnRvVmlydHVhbFRyZWUoZGF0YSkpKVxuICAgICAgICAgIC50aGVuKCgpID0+IHRoaXMuaGFuZGxlRGVmYXVsdFRyZWVFeHBhbmQoKSlcbiAgICAgIH0sXG4gICAgICBpc1RyZWVFeHBhbmRCeVJvdyAocm93OiBSb3dJbmZvKSB7XG4gICAgICAgIHJldHVybiAhIXJvdy5fWF9FWFBBTkRcbiAgICAgIH0sXG4gICAgICBzZXRUcmVlRXhwYW5zaW9uIChyb3dzOiBSb3dJbmZvIHwgUm93SW5mb1tdLCBleHBhbmRlZDogYm9vbGVhbikge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRUcmVlRXhwYW5kKHJvd3MsIGV4cGFuZGVkKVxuICAgICAgfSxcbiAgICAgIGhhbmRsZUFzeW5jVHJlZUV4cGFuZENoaWxkcyAocm93OiBSb3dJbmZvKSB7XG4gICAgICAgIGNvbnN0IHsgdHJlZUxhenlMb2FkZWRzLCB0cmVlT3B0cywgY2hlY2tib3hPcHRzIH0gPSB0aGlzXG4gICAgICAgIGNvbnN0IHsgbG9hZE1ldGhvZCwgY2hpbGRyZW4gfSA9IHRyZWVPcHRzXG4gICAgICAgIGNvbnN0IHsgY2hlY2tTdHJpY3RseSB9ID0gY2hlY2tib3hPcHRzXG4gICAgICAgIHJldHVybiBuZXcgUHJvbWlzZShyZXNvbHZlID0+IHtcbiAgICAgICAgICBpZiAobG9hZE1ldGhvZCkge1xuICAgICAgICAgICAgdHJlZUxhenlMb2FkZWRzLnB1c2gocm93KVxuICAgICAgICAgICAgbG9hZE1ldGhvZCh7IHJvdyB9KS5jYXRjaCgoKSA9PiBbXSkudGhlbigoY2hpbGRzOiBhbnlbXSkgPT4ge1xuICAgICAgICAgICAgICByb3cuX1hfTE9BREVEID0gdHJ1ZVxuICAgICAgICAgICAgICBYRVV0aWxzLnJlbW92ZSh0cmVlTGF6eUxvYWRlZHMsIGl0ZW0gPT4gaXRlbSA9PT0gcm93KVxuICAgICAgICAgICAgICBpZiAoIVhFVXRpbHMuaXNBcnJheShjaGlsZHMpKSB7XG4gICAgICAgICAgICAgICAgY2hpbGRzID0gW11cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpZiAoY2hpbGRzKSB7XG4gICAgICAgICAgICAgICAgcm93W2NoaWxkcmVuXSA9IGNoaWxkcy5tYXAoaXRlbSA9PiB7XG4gICAgICAgICAgICAgICAgICBpdGVtLl9YX0xPQURFRCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICBpdGVtLl9YX0VYUEFORCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICBpdGVtLl9YX0lOU0VSVCA9IGZhbHNlXG4gICAgICAgICAgICAgICAgICBpdGVtLl9YX0xFVkVMID0gcm93Ll9YX0xFVkVMICsgMVxuICAgICAgICAgICAgICAgICAgcmV0dXJuIGl0ZW1cbiAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgIGlmIChjaGlsZHMubGVuZ3RoICYmICFyb3cuX1hfRVhQQU5EKSB7XG4gICAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxFeHBhbmQocm93LCB0cnVlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAvLyDlpoLmnpzlvZPliY3oioLngrnlt7LpgInkuK3vvIzliJnlsZXlvIDlkI7lrZDoioLngrnkuZ/ooqvpgInkuK1cbiAgICAgICAgICAgICAgICBpZiAoIWNoZWNrU3RyaWN0bHkgJiYgdGhpcy5pc0NoZWNrZWRCeUNoZWNrYm94Um93KHJvdykpIHtcbiAgICAgICAgICAgICAgICAgIHRoaXMuc2V0Q2hlY2tib3hSb3coY2hpbGRzLCB0cnVlKVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICByZXNvbHZlKHRoaXMuJG5leHRUaWNrKCkudGhlbigoKSA9PiB0aGlzLnJlY2FsY3VsYXRlKCkpKVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzb2x2ZShudWxsKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICBzZXRUcmVlRXhwYW5kIChyb3dzOiBhbnksIGV4cGFuZGVkOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHsgdHJlZUxhenlMb2FkZWRzLCB0cmVlT3B0cywgdGFibGVGdWxsRGF0YSwgdHJlZU5vZGVDb2x1bW4gfSA9IHRoaXNcbiAgICAgICAgY29uc3QgeyBsYXp5LCBoYXNDaGlsZCwgYWNjb3JkaW9uLCB0b2dnbGVNZXRob2QgfSA9IHRyZWVPcHRzXG4gICAgICAgIGNvbnN0IHJlc3VsdDogYW55W10gPSBbXVxuICAgICAgICBpZiAocm93cykge1xuICAgICAgICAgIGlmICghWEVVdGlscy5pc0FycmF5KHJvd3MpKSB7XG4gICAgICAgICAgICByb3dzID0gW3Jvd3NdXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGNvbHVtbkluZGV4ID0gdGhpcy5nZXRDb2x1bW5JbmRleCh0cmVlTm9kZUNvbHVtbilcbiAgICAgICAgICBjb25zdCAkY29sdW1uSW5kZXggPSB0aGlzLmdldFZNQ29sdW1uSW5kZXgodHJlZU5vZGVDb2x1bW4pXG4gICAgICAgICAgbGV0IHZhbGlkUm93cyA9IHRvZ2dsZU1ldGhvZCA/IHJvd3MuZmlsdGVyKChyb3c6IFJvd0luZm8pID0+IHRvZ2dsZU1ldGhvZCh7IGV4cGFuZGVkLCBjb2x1bW46IHRyZWVOb2RlQ29sdW1uLCByb3csIGNvbHVtbkluZGV4LCAkY29sdW1uSW5kZXggfSkpIDogcm93c1xuICAgICAgICAgIGlmIChhY2NvcmRpb24pIHtcbiAgICAgICAgICAgIHZhbGlkUm93cyA9IHZhbGlkUm93cy5sZW5ndGggPyBbdmFsaWRSb3dzW3ZhbGlkUm93cy5sZW5ndGggLSAxXV0gOiBbXVxuICAgICAgICAgICAgLy8g5ZCM5LiA57qn5Y+q6IO95bGV5byA5LiA5LiqXG4gICAgICAgICAgICBjb25zdCBtYXRjaE9iaiA9IFhFVXRpbHMuZmluZFRyZWUodGFibGVGdWxsRGF0YSwgaXRlbSA9PiBpdGVtID09PSByb3dzWzBdLCB0cmVlT3B0cylcbiAgICAgICAgICAgIGlmIChtYXRjaE9iaikge1xuICAgICAgICAgICAgICBtYXRjaE9iai5pdGVtcy5mb3JFYWNoKHJvdyA9PiB7XG4gICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgIHJvdy5fWF9FWFBBTkQgPSBmYWxzZVxuICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgICB2YWxpZFJvd3MuZm9yRWFjaCgocm93OiBhbnkpID0+IHtcbiAgICAgICAgICAgIGNvbnN0IGlzTG9hZCA9IGxhenkgJiYgcm93W2hhc0NoaWxkXSAmJiAhcm93Ll9YX0xPQURFRCAmJiB0cmVlTGF6eUxvYWRlZHMuaW5kZXhPZihyb3cpID09PSAtMVxuICAgICAgICAgICAgLy8g5piv5ZCm5L2/55So5oeS5Yqg6L29XG4gICAgICAgICAgICBpZiAoZXhwYW5kZWQgJiYgaXNMb2FkKSB7XG4gICAgICAgICAgICAgIHJlc3VsdC5wdXNoKHRoaXMuaGFuZGxlQXN5bmNUcmVlRXhwYW5kQ2hpbGRzKHJvdykpXG4gICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICBpZiAoaGFzQ2hpbGRzKHRoaXMsIHJvdykpIHtcbiAgICAgICAgICAgICAgICB0aGlzLnZpcnR1YWxFeHBhbmQocm93LCAhIWV4cGFuZGVkKVxuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSlcbiAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0KS50aGVuKCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuX2xvYWRUcmVlRGF0YSh0aGlzLnRyZWVUYWJsZURhdGEpXG4gICAgICAgICAgICByZXR1cm4gdGhpcy5yZWNhbGN1bGF0ZSgpXG4gICAgICAgICAgfSlcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy4kbmV4dFRpY2soKVxuICAgICAgfSxcbiAgICAgIHNldEFsbFRyZWVFeHBhbnNpb24gKGV4cGFuZGVkOiBib29sZWFuKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnNldEFsbFRyZWVFeHBhbmQoZXhwYW5kZWQpXG4gICAgICB9LFxuICAgICAgc2V0QWxsVHJlZUV4cGFuZCAoZXhwYW5kZWQ6IGJvb2xlYW4pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRUcmVlRGF0YSh0aGlzLnZpcnR1YWxBbGxFeHBhbmQoZXhwYW5kZWQpKVxuICAgICAgfSxcbiAgICAgIHRvZ2dsZVRyZWVFeHBhbnNpb24gKHJvdzogUm93SW5mbykge1xuICAgICAgICByZXR1cm4gdGhpcy50b2dnbGVUcmVlRXhwYW5kKHJvdylcbiAgICAgIH0sXG4gICAgICB0cmlnZ2VyVHJlZUV4cGFuZEV2ZW50IChldm50OiBFdmVudCwgcGFyYW1zOiBDb2x1bW5DZWxsUmVuZGVyUGFyYW1zKSB7XG4gICAgICAgIGNvbnN0IHsgdHJlZU9wdHMsIHRyZWVMYXp5TG9hZGVkcyB9ID0gdGhpc1xuICAgICAgICBjb25zdCB7IHJvdywgY29sdW1uIH0gPSBwYXJhbXNcbiAgICAgICAgY29uc3QgeyBsYXp5IH0gPSB0cmVlT3B0c1xuICAgICAgICBpZiAoIWxhenkgfHwgdHJlZUxhenlMb2FkZWRzLmluZGV4T2Yocm93KSA9PT0gLTEpIHtcbiAgICAgICAgICBjb25zdCBleHBhbmRlZCA9ICF0aGlzLmlzVHJlZUV4cGFuZEJ5Um93KHJvdylcbiAgICAgICAgICB0aGlzLnNldFRyZWVFeHBhbmQocm93LCBleHBhbmRlZClcbiAgICAgICAgICB0aGlzLiRlbWl0KCd0b2dnbGUtdHJlZS1leHBhbmQnLCB7IGV4cGFuZGVkLCBjb2x1bW4sIHJvdywgJGV2ZW50OiBldm50IH0pXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICB0b2dnbGVUcmVlRXhwYW5kIChyb3c6IFJvd0luZm8pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRUcmVlRGF0YSh0aGlzLnZpcnR1YWxFeHBhbmQocm93LCAhcm93Ll9YX0VYUEFORCkpXG4gICAgICB9LFxuICAgICAgZ2V0VHJlZUV4cGFuZFJlY29yZHMgKCkge1xuICAgICAgICBjb25zdCB7IGZ1bGxUcmVlRGF0YSwgdHJlZU9wdHMgfSA9IHRoaXNcbiAgICAgICAgY29uc3QgdHJlZUV4cGFuZFJlY29yZHM6IFJvd0luZm9bXSA9IFtdXG4gICAgICAgIFhFVXRpbHMuZWFjaFRyZWUoZnVsbFRyZWVEYXRhLCByb3cgPT4ge1xuICAgICAgICAgIGlmIChyb3cuX1hfRVhQQU5EICYmIGhhc0NoaWxkcyh0aGlzLCByb3cpKSB7XG4gICAgICAgICAgICB0cmVlRXhwYW5kUmVjb3Jkcy5wdXNoKHJvdylcbiAgICAgICAgICB9XG4gICAgICAgIH0sIHRyZWVPcHRzKVxuICAgICAgICByZXR1cm4gdHJlZUV4cGFuZFJlY29yZHNcbiAgICAgIH0sXG4gICAgICBjbGVhclRyZWVFeHBhbmQgKCkge1xuICAgICAgICByZXR1cm4gdGhpcy5zZXRBbGxUcmVlRXhwYW5kKGZhbHNlKVxuICAgICAgfSxcbiAgICAgIGhhbmRsZUNvbHVtbnMgKGNvbHVtbnM6IENvbHVtbk9wdGlvbnNbXSkge1xuICAgICAgICBjb25zdCB7ICR2eGUsIHJlbmRlclRyZWVJY29uLCBjaGVja2JveE9wdHMgfSA9IHRoaXNcbiAgICAgICAgaWYgKGNvbHVtbnMpIHtcbiAgICAgICAgICBpZiAoKCFjaGVja2JveE9wdHMuY2hlY2tGaWVsZCB8fCAhY2hlY2tib3hPcHRzLmhhbGZGaWVsZCkgJiYgY29sdW1ucy5zb21lKGNvbmYgPT4gY29uZi50eXBlID09PSAnY2hlY2tib3gnKSkge1xuICAgICAgICAgICAgY29uc29sZS5lcnJvcigkdnhlLnQoJ3Z4ZS5lcnJvci5yZXFQcm9wJywgWyd0YWJsZS5jaGVja2JveC1jb25maWcuY2hlY2tGaWVsZCB8IHRhYmxlLmNoZWNrYm94LWNvbmZpZy5oYWxmRmllbGQnXSkpXG4gICAgICAgICAgICByZXR1cm4gW11cbiAgICAgICAgICB9XG4gICAgICAgICAgY29uc3QgdHJlZU5vZGVDb2x1bW4gPSBjb2x1bW5zLmZpbmQoY29uZiA9PiBjb25mLnRyZWVOb2RlKVxuICAgICAgICAgIGlmICh0cmVlTm9kZUNvbHVtbikge1xuICAgICAgICAgICAgbGV0IHNsb3RzID0gdHJlZU5vZGVDb2x1bW4uc2xvdHMgfHwge31cbiAgICAgICAgICAgIHNsb3RzLmljb24gPSByZW5kZXJUcmVlSWNvblxuICAgICAgICAgICAgdHJlZU5vZGVDb2x1bW4uc2xvdHMgPSBzbG90c1xuICAgICAgICAgICAgdGhpcy50cmVlTm9kZUNvbHVtbiA9IHRyZWVOb2RlQ29sdW1uXG4gICAgICAgICAgfVxuICAgICAgICAgIHJldHVybiBjb2x1bW5zXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIFtdXG4gICAgICB9LFxuICAgICAgLyoqXG4gICAgICAgKiDojrflj5booajmoLzmlbDmja7pm4bvvIzljIXlkKvmlrDlop7jgIHliKDpmaRcbiAgICAgICAqIOS4jeaUr+aMgeS/ruaUuVxuICAgICAgICovXG4gICAgICBnZXRSZWNvcmRzZXQgKCkge1xuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgIGluc2VydFJlY29yZHM6IHRoaXMuZ2V0SW5zZXJ0UmVjb3JkcygpLFxuICAgICAgICAgIHJlbW92ZVJlY29yZHM6IHRoaXMuZ2V0UmVtb3ZlUmVjb3JkcygpLFxuICAgICAgICAgIHVwZGF0ZVJlY29yZHM6IFtdXG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICBpc0luc2VydEJ5Um93IChyb3c6IFJvd0luZm8pIHtcbiAgICAgICAgcmV0dXJuICEhcm93Ll9YX0lOU0VSVFxuICAgICAgfSxcbiAgICAgIGdldEluc2VydFJlY29yZHMgKCkge1xuICAgICAgICBjb25zdCB7IHRyZWVPcHRzIH0gPSB0aGlzXG4gICAgICAgIGNvbnN0IGluc2VydFJlY29yZHM6IFJvd0luZm9bXSA9IFtdXG4gICAgICAgIFhFVXRpbHMuZWFjaFRyZWUodGhpcy5mdWxsVHJlZURhdGEsIHJvdyA9PiB7XG4gICAgICAgICAgaWYgKHJvdy5fWF9JTlNFUlQpIHtcbiAgICAgICAgICAgIGluc2VydFJlY29yZHMucHVzaChyb3cpXG4gICAgICAgICAgfVxuICAgICAgICB9LCB0cmVlT3B0cylcbiAgICAgICAgcmV0dXJuIGluc2VydFJlY29yZHNcbiAgICAgIH0sXG4gICAgICBpbnNlcnQgKHJlY29yZHM6IFJvd0luZm8gfCBSb3dJbmZvW10pIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuaW5zZXJ0QXQocmVjb3JkcywgbnVsbClcbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIOaUr+aMgeS7u+aEj+Wxgue6p+aPkuWFpeS4juWIoOmZpFxuICAgICAgICovXG4gICAgICBpbnNlcnRBdCAocmVjb3JkczogYW55LCByb3c6IG51bWJlciB8IFJvd0luZm8gfCBudWxsKSB7XG4gICAgICAgIGNvbnN0IHsgZnVsbFRyZWVEYXRhLCB0cmVlVGFibGVEYXRhLCB0cmVlT3B0cyB9ID0gdGhpc1xuICAgICAgICBpZiAoIVhFVXRpbHMuaXNBcnJheShyZWNvcmRzKSkge1xuICAgICAgICAgIHJlY29yZHMgPSBbcmVjb3Jkc11cbiAgICAgICAgfVxuICAgICAgICBsZXQgbmV3UmVjb3JkcyA9IHJlY29yZHMubWFwKChyZWNvcmQ6IGFueSkgPT4gdGhpcy5kZWZpbmVGaWVsZChPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICBfWF9MT0FERUQ6IGZhbHNlLFxuICAgICAgICAgIF9YX0VYUEFORDogZmFsc2UsXG4gICAgICAgICAgX1hfSU5TRVJUOiB0cnVlLFxuICAgICAgICAgIF9YX0xFVkVMOiAwXG4gICAgICAgIH0sIHJlY29yZCkpKVxuICAgICAgICBpZiAoIXJvdykge1xuICAgICAgICAgIGZ1bGxUcmVlRGF0YS51bnNoaWZ0KC4uLm5ld1JlY29yZHMpXG4gICAgICAgICAgdHJlZVRhYmxlRGF0YS51bnNoaWZ0KC4uLm5ld1JlY29yZHMpXG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKHJvdyA9PT0gLTEpIHtcbiAgICAgICAgICAgIGZ1bGxUcmVlRGF0YS5wdXNoKC4uLm5ld1JlY29yZHMpXG4gICAgICAgICAgICB0cmVlVGFibGVEYXRhLnB1c2goLi4ubmV3UmVjb3JkcylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbGV0IG1hdGNoT2JqID0gWEVVdGlscy5maW5kVHJlZShmdWxsVHJlZURhdGEsIGl0ZW0gPT4gaXRlbSA9PT0gcm93LCB0cmVlT3B0cylcbiAgICAgICAgICAgIGlmICghbWF0Y2hPYmogfHwgbWF0Y2hPYmouaW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcih0KCd2eGUuZXJyb3IudW5hYmxlSW5zZXJ0JykpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgeyBpdGVtcywgaW5kZXgsIG5vZGVzIH0gPSBtYXRjaE9ialxuICAgICAgICAgICAgbGV0IHJvd0luZGV4ID0gdHJlZVRhYmxlRGF0YS5pbmRleE9mKHJvdylcbiAgICAgICAgICAgIGlmIChyb3dJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgIHRyZWVUYWJsZURhdGEuc3BsaWNlKHJvd0luZGV4LCAwLCAuLi5uZXdSZWNvcmRzKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaXRlbXMuc3BsaWNlKGluZGV4LCAwLCAuLi5uZXdSZWNvcmRzKVxuICAgICAgICAgICAgbmV3UmVjb3Jkcy5mb3JFYWNoKChpdGVtOiBhbnkpID0+IHtcbiAgICAgICAgICAgICAgaXRlbS5fWF9MRVZFTCA9IG5vZGVzLmxlbmd0aCAtIDFcbiAgICAgICAgICAgIH0pXG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLl9sb2FkVHJlZURhdGEodHJlZVRhYmxlRGF0YSkudGhlbigoKSA9PiB7XG4gICAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHJvdzogbmV3UmVjb3Jkcy5sZW5ndGggPyBuZXdSZWNvcmRzW25ld1JlY29yZHMubGVuZ3RoIC0gMV0gOiBudWxsLFxuICAgICAgICAgICAgcm93czogbmV3UmVjb3Jkc1xuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIOiOt+WPluW3suWIoOmZpOeahOaVsOaNrlxuICAgICAgICovXG4gICAgICBnZXRSZW1vdmVSZWNvcmRzICgpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlTGlzdFxuICAgICAgfSxcbiAgICAgIHJlbW92ZVNlbGVjdGVkcyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZUNoZWNrYm94Um93KClcbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIOWIoOmZpOmAieS4reaVsOaNrlxuICAgICAgICovXG4gICAgICByZW1vdmVDaGVja2JveFJvdyAoKSB7XG4gICAgICAgIHJldHVybiB0aGlzLnJlbW92ZSh0aGlzLmdldENoZWNrYm94UmVjb3JkcygpKS50aGVuKChwYXJhbXM6IGFueSkgPT4ge1xuICAgICAgICAgIHRoaXMuY2xlYXJTZWxlY3Rpb24oKVxuICAgICAgICAgIHJldHVybiBwYXJhbXNcbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICByZW1vdmUgKHJvd3M6IGFueSkge1xuICAgICAgICBjb25zdCB7IHJlbW92ZUxpc3QsIGZ1bGxUcmVlRGF0YSwgdHJlZU9wdHMgfSA9IHRoaXNcbiAgICAgICAgbGV0IHJlc3Q6IFJvd0luZm9bXSA9IFtdXG4gICAgICAgIGlmICghcm93cykge1xuICAgICAgICAgIHJvd3MgPSBmdWxsVHJlZURhdGFcbiAgICAgICAgfSBlbHNlIGlmICghWEVVdGlscy5pc0FycmF5KHJvd3MpKSB7XG4gICAgICAgICAgcm93cyA9IFtyb3dzXVxuICAgICAgICB9XG4gICAgICAgIHJvd3MuZm9yRWFjaCgocm93OiBhbnkpID0+IHtcbiAgICAgICAgICBsZXQgbWF0Y2hPYmogPSBYRVV0aWxzLmZpbmRUcmVlKGZ1bGxUcmVlRGF0YSwgaXRlbSA9PiBpdGVtID09PSByb3csIHRyZWVPcHRzKVxuICAgICAgICAgIGlmIChtYXRjaE9iaikge1xuICAgICAgICAgICAgY29uc3QgeyBpdGVtLCBpdGVtcywgaW5kZXgsIHBhcmVudCB9OiBhbnkgPSBtYXRjaE9ialxuICAgICAgICAgICAgaWYgKCF0aGlzLmlzSW5zZXJ0QnlSb3cocm93KSkge1xuICAgICAgICAgICAgICByZW1vdmVMaXN0LnB1c2gocm93KVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHBhcmVudCkge1xuICAgICAgICAgICAgICBsZXQgaXNFeHBhbmQgPSB0aGlzLmlzVHJlZUV4cGFuZEJ5Um93KHBhcmVudClcbiAgICAgICAgICAgICAgaWYgKGlzRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5oYW5kbGVDb2xsYXBzaW5nKHBhcmVudClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpXG4gICAgICAgICAgICAgIGlmIChpc0V4cGFuZCkge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRXhwYW5kaW5nKHBhcmVudClcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhpcy5oYW5kbGVDb2xsYXBzaW5nKGl0ZW0pXG4gICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSlcbiAgICAgICAgICAgICAgdGhpcy50cmVlVGFibGVEYXRhLnNwbGljZSh0aGlzLnRyZWVUYWJsZURhdGEuaW5kZXhPZihpdGVtKSwgMSlcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIHJlc3QucHVzaChpdGVtKVxuICAgICAgICAgIH1cbiAgICAgICAgfSlcbiAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRUcmVlRGF0YSh0aGlzLnRyZWVUYWJsZURhdGEpLnRoZW4oKCkgPT4ge1xuICAgICAgICAgIHJldHVybiB7IHJvdzogcmVzdC5sZW5ndGggPyByZXN0W3Jlc3QubGVuZ3RoIC0gMV0gOiBudWxsLCByb3dzOiByZXN0IH1cbiAgICAgICAgfSlcbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIOWkhOeQhum7mOiupOWxleW8gOagkeiKgueCuVxuICAgICAgICovXG4gICAgICBoYW5kbGVEZWZhdWx0VHJlZUV4cGFuZCAoKSB7XG4gICAgICAgIGxldCB7IHRyZWVDb25maWcsIHRyZWVPcHRzLCB0YWJsZUZ1bGxEYXRhIH0gPSB0aGlzXG4gICAgICAgIGlmICh0cmVlQ29uZmlnKSB7XG4gICAgICAgICAgbGV0IHsgY2hpbGRyZW4sIGV4cGFuZEFsbCwgZXhwYW5kUm93S2V5cyB9ID0gdHJlZU9wdHNcbiAgICAgICAgICBpZiAoZXhwYW5kQWxsKSB7XG4gICAgICAgICAgICB0aGlzLnNldEFsbFRyZWVFeHBhbmQodHJ1ZSlcbiAgICAgICAgICB9IGVsc2UgaWYgKGV4cGFuZFJvd0tleXMgJiYgdGhpcy5yb3dJZCkge1xuICAgICAgICAgICAgbGV0IHJvd2tleSA9IHRoaXMucm93SWRcbiAgICAgICAgICAgIGV4cGFuZFJvd0tleXMuZm9yRWFjaCgocm93aWQ6IGFueSkgPT4ge1xuICAgICAgICAgICAgICBsZXQgbWF0Y2hPYmogPSBYRVV0aWxzLmZpbmRUcmVlKHRhYmxlRnVsbERhdGEsIGl0ZW0gPT4gcm93aWQgPT09IFhFVXRpbHMuZ2V0KGl0ZW0sIHJvd2tleSksIHRyZWVPcHRzKVxuICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgICAgbGV0IHJvd0NoaWxkcmVuID0gbWF0Y2hPYmogPyBtYXRjaE9iai5pdGVtW2NoaWxkcmVuXSA6IDBcbiAgICAgICAgICAgICAgaWYgKHJvd0NoaWxkcmVuICYmIHJvd0NoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICB0aGlzLnNldFRyZWVFeHBhbmQobWF0Y2hPYmouaXRlbSwgdHJ1ZSlcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSlcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sXG4gICAgICAvKipcbiAgICAgICAqIOWumuS5ieagkeWxnuaAp1xuICAgICAgICovXG4gICAgICB0b1ZpcnR1YWxUcmVlICh0cmVlRGF0YTogUm93SW5mb1tdKSB7XG4gICAgICAgIGNvbnN0IHsgdHJlZU9wdHMgfSA9IHRoaXNcbiAgICAgICAgbGV0IGZ1bGxUcmVlUm93TWFwID0gdGhpcy5mdWxsVHJlZVJvd01hcFxuICAgICAgICBmdWxsVHJlZVJvd01hcC5jbGVhcigpXG4gICAgICAgIFhFVXRpbHMuZWFjaFRyZWUodHJlZURhdGEsIChpdGVtLCBpbmRleCwgaXRlbXMsIHBhdGhzLCBwYXJlbnQsIG5vZGVzKSA9PiB7XG4gICAgICAgICAgaXRlbS5fWF9MT0FERUQgPSBmYWxzZVxuICAgICAgICAgIGl0ZW0uX1hfRVhQQU5EID0gZmFsc2VcbiAgICAgICAgICBpdGVtLl9YX0lOU0VSVCA9IGZhbHNlXG4gICAgICAgICAgaXRlbS5fWF9MRVZFTCA9IG5vZGVzLmxlbmd0aCAtIDFcbiAgICAgICAgICBmdWxsVHJlZVJvd01hcC5zZXQoaXRlbSwgeyBpdGVtLCBpbmRleCwgaXRlbXMsIHBhdGhzLCBwYXJlbnQsIG5vZGVzIH0pXG4gICAgICAgIH0sIHRyZWVPcHRzKVxuICAgICAgICB0aGlzLmZ1bGxUcmVlRGF0YSA9IHRyZWVEYXRhLnNsaWNlKDApXG4gICAgICAgIHRoaXMudHJlZVRhYmxlRGF0YSA9IHRyZWVEYXRhLnNsaWNlKDApXG4gICAgICAgIHJldHVybiB0cmVlRGF0YVxuICAgICAgfSxcbiAgICAgIC8qKlxuICAgICAgICog5bGV5byAL+aUtui1t+agkeiKgueCuVxuICAgICAgICovXG4gICAgICB2aXJ0dWFsRXhwYW5kIChyb3c6IFJvd0luZm8sIGV4cGFuZGVkOiBib29sZWFuKSB7XG4gICAgICAgIGNvbnN0IHsgdHJlZU9wdHMsIHRyZWVOb2RlQ29sdW1uIH0gPSB0aGlzXG4gICAgICAgIGNvbnN0IHsgdG9nZ2xlTWV0aG9kIH0gPSB0cmVlT3B0c1xuICAgICAgICBjb25zdCBjb2x1bW5JbmRleCA9IHRoaXMuZ2V0Q29sdW1uSW5kZXgodHJlZU5vZGVDb2x1bW4pXG4gICAgICAgIGNvbnN0ICRjb2x1bW5JbmRleCA9IHRoaXMuZ2V0Vk1Db2x1bW5JbmRleCh0cmVlTm9kZUNvbHVtbilcbiAgICAgICAgaWYgKCF0b2dnbGVNZXRob2QgfHwgdG9nZ2xlTWV0aG9kKHsgZXhwYW5kZWQsIHJvdywgY29sdW1uOiB0cmVlTm9kZUNvbHVtbiwgY29sdW1uSW5kZXgsICRjb2x1bW5JbmRleCB9KSkge1xuICAgICAgICAgIGlmIChyb3cuX1hfRVhQQU5EICE9PSBleHBhbmRlZCkge1xuICAgICAgICAgICAgaWYgKHJvdy5fWF9FWFBBTkQpIHtcbiAgICAgICAgICAgICAgdGhpcy5oYW5kbGVDb2xsYXBzaW5nKHJvdylcbiAgICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAgIHRoaXMuaGFuZGxlRXhwYW5kaW5nKHJvdylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudHJlZVRhYmxlRGF0YVxuICAgICAgfSxcbiAgICAgIC8vIOWxleW8gOiKgueCuVxuICAgICAgaGFuZGxlRXhwYW5kaW5nIChyb3c6IFJvd0luZm8pIHtcbiAgICAgICAgaWYgKGhhc0NoaWxkcyh0aGlzLCByb3cpKSB7XG4gICAgICAgICAgY29uc3QgeyB0cmVlVGFibGVEYXRhLCB0cmVlT3B0cyB9ID0gdGhpc1xuICAgICAgICAgIGxldCBjaGlsZFJvd3MgPSByb3dbdHJlZU9wdHMuY2hpbGRyZW5dXG4gICAgICAgICAgbGV0IGV4cGFuZExpc3Q6IFJvd0luZm9bXSA9IFtdXG4gICAgICAgICAgbGV0IHJvd0luZGV4ID0gdHJlZVRhYmxlRGF0YS5pbmRleE9mKHJvdylcbiAgICAgICAgICBpZiAocm93SW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ0V4cGFuZGluZyBlcnJvcicpXG4gICAgICAgICAgfVxuICAgICAgICAgIGNvbnN0IGV4cGFuZE1hcHM6IE1hcDxSb3dJbmZvLCBOdW1iZXI+ID0gbmV3IE1hcCgpXG4gICAgICAgICAgWEVVdGlscy5lYWNoVHJlZShjaGlsZFJvd3MsIChpdGVtLCBpbmRleCwgb2JqLCBwYXRocywgcGFyZW50LCBub2RlcykgPT4ge1xuICAgICAgICAgICAgaWYgKCFwYXJlbnQgfHwgKHBhcmVudC5fWF9FWFBBTkQgJiYgZXhwYW5kTWFwcy5oYXMocGFyZW50KSkpIHtcbiAgICAgICAgICAgICAgZXhwYW5kTWFwcy5zZXQoaXRlbSwgMSlcbiAgICAgICAgICAgICAgZXhwYW5kTGlzdC5wdXNoKGl0ZW0pXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgdHJlZU9wdHMpXG4gICAgICAgICAgcm93Ll9YX0VYUEFORCA9IHRydWVcbiAgICAgICAgICB0cmVlVGFibGVEYXRhLnNwbGljZShyb3dJbmRleCArIDEsIDAsIC4uLmV4cGFuZExpc3QpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudHJlZVRhYmxlRGF0YVxuICAgICAgfSxcbiAgICAgIC8vIOaUtui1t+iKgueCuVxuICAgICAgaGFuZGxlQ29sbGFwc2luZyAocm93OiBSb3dJbmZvKSB7XG4gICAgICAgIGlmIChoYXNDaGlsZHModGhpcywgcm93KSkge1xuICAgICAgICAgIGNvbnN0IHsgdHJlZVRhYmxlRGF0YSwgdHJlZU9wdHMgfSA9IHRoaXNcbiAgICAgICAgICBsZXQgY2hpbGRSb3dzID0gcm93W3RyZWVPcHRzLmNoaWxkcmVuXVxuICAgICAgICAgIGxldCBub2RlQ2hpbGRMaXN0OiBSb3dJbmZvW10gPSBbXVxuICAgICAgICAgIFhFVXRpbHMuZWFjaFRyZWUoY2hpbGRSb3dzLCBpdGVtID0+IHtcbiAgICAgICAgICAgIG5vZGVDaGlsZExpc3QucHVzaChpdGVtKVxuICAgICAgICAgIH0sIHRyZWVPcHRzKVxuICAgICAgICAgIHJvdy5fWF9FWFBBTkQgPSBmYWxzZVxuICAgICAgICAgIHRoaXMudHJlZVRhYmxlRGF0YSA9IHRyZWVUYWJsZURhdGEuZmlsdGVyKChpdGVtOiBhbnkpID0+IG5vZGVDaGlsZExpc3QuaW5kZXhPZihpdGVtKSA9PT0gLTEpXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudHJlZVRhYmxlRGF0YVxuICAgICAgfSxcbiAgICAgIC8qKlxuICAgICAgICog5bGV5byAL+aUtui1t+aJgOacieagkeiKgueCuVxuICAgICAgICovXG4gICAgICB2aXJ0dWFsQWxsRXhwYW5kIChleHBhbmRlZDogYm9vbGVhbikge1xuICAgICAgICBjb25zdCB7IHRyZWVPcHRzIH0gPSB0aGlzXG4gICAgICAgIGlmIChleHBhbmRlZCkge1xuICAgICAgICAgIGNvbnN0IHRhYmxlTGlzdDogUm93SW5mb1tdID0gW11cbiAgICAgICAgICBYRVV0aWxzLmVhY2hUcmVlKHRoaXMuZnVsbFRyZWVEYXRhLCByb3cgPT4ge1xuICAgICAgICAgICAgcm93Ll9YX0VYUEFORCA9IGV4cGFuZGVkXG4gICAgICAgICAgICB0YWJsZUxpc3QucHVzaChyb3cpXG4gICAgICAgICAgfSwgdHJlZU9wdHMpXG4gICAgICAgICAgdGhpcy50cmVlVGFibGVEYXRhID0gdGFibGVMaXN0XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgWEVVdGlscy5lYWNoVHJlZSh0aGlzLmZ1bGxUcmVlRGF0YSwgcm93ID0+IHtcbiAgICAgICAgICAgIHJvdy5fWF9FWFBBTkQgPSBleHBhbmRlZFxuICAgICAgICAgIH0sIHRyZWVPcHRzKVxuICAgICAgICAgIHRoaXMudHJlZVRhYmxlRGF0YSA9IHRoaXMuZnVsbFRyZWVEYXRhLnNsaWNlKDApXG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXMudHJlZVRhYmxlRGF0YVxuICAgICAgfSxcbiAgICAgIGNoZWNrYm94QWxsRXZlbnQgKHBhcmFtczogYW55KSB7XG4gICAgICAgIGNvbnN0IHsgY2hlY2tib3hPcHRzLCB0cmVlT3B0cyB9ID0gdGhpc1xuICAgICAgICBjb25zdCB7IGNoZWNrRmllbGQsIGhhbGZGaWVsZCwgY2hlY2tTdHJpY3RseSB9ID0gY2hlY2tib3hPcHRzXG4gICAgICAgIGNvbnN0IHsgY2hlY2tlZCB9ID0gcGFyYW1zXG4gICAgICAgIGlmIChjaGVja0ZpZWxkICYmICFjaGVja1N0cmljdGx5KSB7XG4gICAgICAgICAgWEVVdGlscy5lYWNoVHJlZSh0aGlzLmZ1bGxUcmVlRGF0YSwgcm93ID0+IHtcbiAgICAgICAgICAgIHJvd1tjaGVja0ZpZWxkXSA9IGNoZWNrZWRcbiAgICAgICAgICAgIGlmIChoYWxmRmllbGQpIHtcbiAgICAgICAgICAgICAgcm93W2hhbGZGaWVsZF0gPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIHRyZWVPcHRzKVxuICAgICAgICB9XG4gICAgICAgIHRoaXMuJGVtaXQoJ2NoZWNrYm94LWFsbCcsIHBhcmFtcylcbiAgICAgIH0sXG4gICAgICBjaGVja2JveENoYW5nZUV2ZW50IChwYXJhbXM6IGFueSkge1xuICAgICAgICBjb25zdCB7IGNoZWNrYm94T3B0cywgdHJlZU9wdHMgfSA9IHRoaXNcbiAgICAgICAgY29uc3QgeyBjaGVja0ZpZWxkLCBoYWxmRmllbGQsIGNoZWNrU3RyaWN0bHkgfSA9IGNoZWNrYm94T3B0c1xuICAgICAgICBjb25zdCB7IHJvdywgY2hlY2tlZCB9ID0gcGFyYW1zXG4gICAgICAgIGlmIChjaGVja0ZpZWxkICYmICFjaGVja1N0cmljdGx5KSB7XG4gICAgICAgICAgWEVVdGlscy5lYWNoVHJlZShbcm93XSwgcm93ID0+IHtcbiAgICAgICAgICAgIHJvd1tjaGVja0ZpZWxkXSA9IGNoZWNrZWRcbiAgICAgICAgICAgIGlmIChoYWxmRmllbGQpIHtcbiAgICAgICAgICAgICAgcm93W2hhbGZGaWVsZF0gPSBmYWxzZVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH0sIHRyZWVPcHRzKVxuICAgICAgICAgIHRoaXMuY2hlY2tQYXJlbnROb2RlU2VsZWN0aW9uKHJvdylcbiAgICAgICAgfVxuICAgICAgICB0aGlzLiRlbWl0KCdjaGVja2JveC1jaGFuZ2UnLCBwYXJhbXMpXG4gICAgICB9LFxuICAgICAgY2hlY2tQYXJlbnROb2RlU2VsZWN0aW9uIChyb3c6IFJvd0luZm8pIHtcbiAgICAgICAgY29uc3QgeyBjaGVja2JveE9wdHMsIHRyZWVPcHRzIH0gPSB0aGlzXG4gICAgICAgIGNvbnN0IHsgY2hpbGRyZW4gfSA9IHRyZWVPcHRzXG4gICAgICAgIGNvbnN0IHsgY2hlY2tGaWVsZCwgaGFsZkZpZWxkLCBjaGVja1N0cmljdGx5IH0gPSBjaGVja2JveE9wdHNcbiAgICAgICAgY29uc3QgbWF0Y2hPYmogPSBYRVV0aWxzLmZpbmRUcmVlKHRoaXMuZnVsbFRyZWVEYXRhLCBpdGVtID0+IGl0ZW0gPT09IHJvdywgdHJlZU9wdHMpXG4gICAgICAgIGlmIChtYXRjaE9iaiAmJiBjaGVja0ZpZWxkICYmICFjaGVja1N0cmljdGx5KSB7XG4gICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgY29uc3QgcGFyZW50Um93OiBSb3dJbmZvID0gbWF0Y2hPYmoucGFyZW50XG4gICAgICAgICAgaWYgKHBhcmVudFJvdykge1xuICAgICAgICAgICAgY29uc3QgaXNBbGwgPSBwYXJlbnRSb3dbY2hpbGRyZW5dLmV2ZXJ5KChpdGVtOiBSb3dJbmZvKSA9PiBpdGVtW2NoZWNrRmllbGRdKVxuICAgICAgICAgICAgaWYgKGhhbGZGaWVsZCAmJiAhaXNBbGwpIHtcbiAgICAgICAgICAgICAgcGFyZW50Um93W2hhbGZGaWVsZF0gPSBwYXJlbnRSb3dbY2hpbGRyZW5dLnNvbWUoKGl0ZW06IFJvd0luZm8pID0+IGl0ZW1bY2hlY2tGaWVsZF0gfHwgaXRlbVtoYWxmRmllbGRdKVxuICAgICAgICAgICAgfVxuICAgICAgICAgICAgcGFyZW50Um93W2NoZWNrRmllbGRdID0gaXNBbGxcbiAgICAgICAgICAgIHRoaXMuY2hlY2tQYXJlbnROb2RlU2VsZWN0aW9uKHBhcmVudFJvdylcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy4kcmVmcy54VGFibGUuY2hlY2tTZWxlY3Rpb25TdGF0dXMoKVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSxcbiAgICAgIGdldENoZWNrYm94UmVjb3JkcyAoKSB7XG4gICAgICAgIGNvbnN0IHsgY2hlY2tib3hPcHRzLCB0cmVlT3B0cyB9ID0gdGhpc1xuICAgICAgICBjb25zdCB7IGNoZWNrRmllbGQgfSA9IGNoZWNrYm94T3B0c1xuICAgICAgICBpZiAoY2hlY2tGaWVsZCkge1xuICAgICAgICAgIGNvbnN0IHJlY29yZHM6IFJvd0luZm9bXSA9IFtdXG4gICAgICAgICAgWEVVdGlscy5lYWNoVHJlZSh0aGlzLmZ1bGxUcmVlRGF0YSwgcm93ID0+IHtcbiAgICAgICAgICAgIGlmIChyb3dbY2hlY2tGaWVsZF0pIHtcbiAgICAgICAgICAgICAgcmVjb3Jkcy5wdXNoKHJvdylcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9LCB0cmVlT3B0cylcbiAgICAgICAgICByZXR1cm4gcmVjb3Jkc1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB0aGlzLiRyZWZzLnhUYWJsZS5nZXRDaGVja2JveFJlY29yZHMoKVxuICAgICAgfSxcbiAgICAgIGdldENoZWNrYm94SW5kZXRlcm1pbmF0ZVJlY29yZHMgKCkge1xuICAgICAgICBjb25zdCB7IGNoZWNrYm94T3B0cywgdHJlZU9wdHMgfSA9IHRoaXNcbiAgICAgICAgY29uc3QgeyBoYWxmRmllbGQgfSA9IGNoZWNrYm94T3B0c1xuICAgICAgICBpZiAoaGFsZkZpZWxkKSB7XG4gICAgICAgICAgY29uc3QgcmVjb3JkczogUm93SW5mb1tdID0gW11cbiAgICAgICAgICBYRVV0aWxzLmVhY2hUcmVlKHRoaXMuZnVsbFRyZWVEYXRhLCByb3cgPT4ge1xuICAgICAgICAgICAgaWYgKHJvd1toYWxmRmllbGRdKSB7XG4gICAgICAgICAgICAgIHJlY29yZHMucHVzaChyb3cpXG4gICAgICAgICAgICB9XG4gICAgICAgICAgfSwgdHJlZU9wdHMpXG4gICAgICAgICAgcmV0dXJuIHJlY29yZHNcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gdGhpcy4kcmVmcy54VGFibGUuZ2V0Q2hlY2tib3hJbmRldGVybWluYXRlUmVjb3JkcygpXG4gICAgICB9XG4gICAgfVxuICB9XG5cbiAgdnhldGFibGUuVnVlLmNvbXBvbmVudChvcHRpb25zLm5hbWUsIG9wdGlvbnMpXG59XG5cbi8qKlxuICog5Z+65LqOIHZ4ZS10YWJsZSDooajmoLznmoTlop7lvLrmj5Lku7bvvIzlrp7njrDnroDljZXnmoTomZrmi5/moJHooajmoLxcbiAqL1xuZXhwb3J0IGNvbnN0IFZYRVRhYmxlUGx1Z2luVmlydHVhbFRyZWUgPSB7XG4gIGluc3RhbGwgKHZ4ZXRhYmxlOiB0eXBlb2YgVlhFVGFibGUpIHtcbiAgICByZWdpc3RlckNvbXBvbmVudCh2eGV0YWJsZSlcbiAgfVxufVxuXG5pZiAodHlwZW9mIHdpbmRvdyAhPT0gJ3VuZGVmaW5lZCcgJiYgd2luZG93LlZYRVRhYmxlICYmIHdpbmRvdy5WWEVUYWJsZS5UYWJsZSkge1xuICB3aW5kb3cuVlhFVGFibGUudXNlKFZYRVRhYmxlUGx1Z2luVmlydHVhbFRyZWUpXG59XG5cbmV4cG9ydCBkZWZhdWx0IFZYRVRhYmxlUGx1Z2luVmlydHVhbFRyZWVcbiIsIlwidXNlIHN0cmljdFwiO1xudmFyIF9fc3ByZWFkQXJyYXkgPSAodGhpcyAmJiB0aGlzLl9fc3ByZWFkQXJyYXkpIHx8IGZ1bmN0aW9uICh0bywgZnJvbSkge1xuICAgIGZvciAodmFyIGkgPSAwLCBpbCA9IGZyb20ubGVuZ3RoLCBqID0gdG8ubGVuZ3RoOyBpIDwgaWw7IGkrKywgaisrKVxuICAgICAgICB0b1tqXSA9IGZyb21baV07XG4gICAgcmV0dXJuIHRvO1xufTtcbk9iamVjdC5kZWZpbmVQcm9wZXJ0eShleHBvcnRzLCBcIl9fZXNNb2R1bGVcIiwgeyB2YWx1ZTogdHJ1ZSB9KTtcbmV4cG9ydHMuVlhFVGFibGVQbHVnaW5WaXJ0dWFsVHJlZSA9IHZvaWQgMDtcbnZhciBjdG9yXzEgPSByZXF1aXJlKFwieGUtdXRpbHMvY3RvclwiKTtcbmZ1bmN0aW9uIGhhc0NoaWxkcyhfdm0sIHJvdykge1xuICAgIHZhciBjaGlsZExpc3QgPSByb3dbX3ZtLnRyZWVPcHRzLmNoaWxkcmVuXTtcbiAgICByZXR1cm4gY2hpbGRMaXN0ICYmIGNoaWxkTGlzdC5sZW5ndGg7XG59XG5mdW5jdGlvbiByZW5kZXJEZWZhdWx0Rm9ybShoLCBfdm0pIHtcbiAgICB2YXIgcHJveHlDb25maWcgPSBfdm0ucHJveHlDb25maWcsIHByb3h5T3B0cyA9IF92bS5wcm94eU9wdHMsIGZvcm1EYXRhID0gX3ZtLmZvcm1EYXRhLCBmb3JtQ29uZmlnID0gX3ZtLmZvcm1Db25maWcsIGZvcm1PcHRzID0gX3ZtLmZvcm1PcHRzO1xuICAgIGlmIChmb3JtQ29uZmlnICYmIGZvcm1PcHRzLml0ZW1zICYmIGZvcm1PcHRzLml0ZW1zLmxlbmd0aCkge1xuICAgICAgICBpZiAoIWZvcm1PcHRzLmluaXRlZCkge1xuICAgICAgICAgICAgZm9ybU9wdHMuaW5pdGVkID0gdHJ1ZTtcbiAgICAgICAgICAgIHZhciBiZWZvcmVJdGVtXzEgPSBwcm94eU9wdHMuYmVmb3JlSXRlbTtcbiAgICAgICAgICAgIGlmIChwcm94eU9wdHMgJiYgYmVmb3JlSXRlbV8xKSB7XG4gICAgICAgICAgICAgICAgZm9ybU9wdHMuaXRlbXMuZm9yRWFjaChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICBiZWZvcmVJdGVtXzEuY2FsbChfdm0sIHsgJGdyaWQ6IF92bSwgaXRlbTogaXRlbSB9KTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgaCgndnhlLWZvcm0nLCB7XG4gICAgICAgICAgICAgICAgcHJvcHM6IE9iamVjdC5hc3NpZ24oe30sIGZvcm1PcHRzLCB7XG4gICAgICAgICAgICAgICAgICAgIGRhdGE6IHByb3h5Q29uZmlnICYmIHByb3h5T3B0cy5mb3JtID8gZm9ybURhdGEgOiBmb3JtT3B0cy5kYXRhXG4gICAgICAgICAgICAgICAgfSksXG4gICAgICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgICAgICAgc3VibWl0OiBfdm0uc3VibWl0RXZlbnQsXG4gICAgICAgICAgICAgICAgICAgIHJlc2V0OiBfdm0ucmVzZXRFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgJ3N1Ym1pdC1pbnZhbGlkJzogX3ZtLnN1Ym1pdEludmFsaWRFdmVudCxcbiAgICAgICAgICAgICAgICAgICAgJ3RvZ2dsZS1jb2xsYXBzZSc6IF92bS50b2dnbENvbGxhcHNlRXZlbnRcbiAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgIHJlZjogJ2Zvcm0nXG4gICAgICAgICAgICB9KVxuICAgICAgICBdO1xuICAgIH1cbiAgICByZXR1cm4gW107XG59XG5mdW5jdGlvbiBnZXRUb29sYmFyU2xvdHMoX3ZtKSB7XG4gICAgdmFyICRzY29wZWRTbG90cyA9IF92bS4kc2NvcGVkU2xvdHMsIHRvb2xiYXJPcHRzID0gX3ZtLnRvb2xiYXJPcHRzO1xuICAgIHZhciB0b29sYmFyT3B0U2xvdHMgPSB0b29sYmFyT3B0cy5zbG90cztcbiAgICB2YXIgJGJ1dHRvbnM7XG4gICAgdmFyICR0b29scztcbiAgICB2YXIgc2xvdHMgPSB7fTtcbiAgICBpZiAodG9vbGJhck9wdFNsb3RzKSB7XG4gICAgICAgICRidXR0b25zID0gdG9vbGJhck9wdFNsb3RzLmJ1dHRvbnM7XG4gICAgICAgICR0b29scyA9IHRvb2xiYXJPcHRTbG90cy50b29scztcbiAgICAgICAgaWYgKCRidXR0b25zICYmICRzY29wZWRTbG90c1skYnV0dG9uc10pIHtcbiAgICAgICAgICAgICRidXR0b25zID0gJHNjb3BlZFNsb3RzWyRidXR0b25zXTtcbiAgICAgICAgfVxuICAgICAgICBpZiAoJHRvb2xzICYmICRzY29wZWRTbG90c1skdG9vbHNdKSB7XG4gICAgICAgICAgICAkdG9vbHMgPSAkc2NvcGVkU2xvdHNbJHRvb2xzXTtcbiAgICAgICAgfVxuICAgIH1cbiAgICBpZiAoJGJ1dHRvbnMpIHtcbiAgICAgICAgc2xvdHMuYnV0dG9ucyA9ICRidXR0b25zO1xuICAgIH1cbiAgICBpZiAoJHRvb2xzKSB7XG4gICAgICAgIHNsb3RzLnRvb2xzID0gJHRvb2xzO1xuICAgIH1cbiAgICByZXR1cm4gc2xvdHM7XG59XG5mdW5jdGlvbiBnZXRQYWdlclNsb3RzKF92bSkge1xuICAgIHZhciAkc2NvcGVkU2xvdHMgPSBfdm0uJHNjb3BlZFNsb3RzLCBwYWdlck9wdHMgPSBfdm0ucGFnZXJPcHRzO1xuICAgIHZhciBwYWdlck9wdFNsb3RzID0gcGFnZXJPcHRzLnNsb3RzO1xuICAgIHZhciBzbG90cyA9IHt9O1xuICAgIHZhciAkbGVmdDtcbiAgICB2YXIgJHJpZ2h0O1xuICAgIGlmIChwYWdlck9wdFNsb3RzKSB7XG4gICAgICAgICRsZWZ0ID0gcGFnZXJPcHRTbG90cy5sZWZ0O1xuICAgICAgICAkcmlnaHQgPSBwYWdlck9wdFNsb3RzLnJpZ2h0O1xuICAgICAgICBpZiAoJGxlZnQgJiYgJHNjb3BlZFNsb3RzWyRsZWZ0XSkge1xuICAgICAgICAgICAgJGxlZnQgPSAkc2NvcGVkU2xvdHNbJGxlZnRdO1xuICAgICAgICB9XG4gICAgICAgIGlmICgkcmlnaHQgJiYgJHNjb3BlZFNsb3RzWyRyaWdodF0pIHtcbiAgICAgICAgICAgICRyaWdodCA9ICRzY29wZWRTbG90c1skcmlnaHRdO1xuICAgICAgICB9XG4gICAgfVxuICAgIGlmICgkbGVmdCkge1xuICAgICAgICBzbG90cy5sZWZ0ID0gJGxlZnQ7XG4gICAgfVxuICAgIGlmICgkcmlnaHQpIHtcbiAgICAgICAgc2xvdHMucmlnaHQgPSAkcmlnaHQ7XG4gICAgfVxuICAgIHJldHVybiBzbG90cztcbn1cbmZ1bmN0aW9uIGdldFRhYmxlT25zKF92bSkge1xuICAgIHZhciAkbGlzdGVuZXJzID0gX3ZtLiRsaXN0ZW5lcnMsIHByb3h5Q29uZmlnID0gX3ZtLnByb3h5Q29uZmlnLCBwcm94eU9wdHMgPSBfdm0ucHJveHlPcHRzO1xuICAgIHZhciBvbnMgPSB7fTtcbiAgICBjdG9yXzEuZGVmYXVsdC5lYWNoKCRsaXN0ZW5lcnMsIGZ1bmN0aW9uIChjYiwgdHlwZSkge1xuICAgICAgICBvbnNbdHlwZV0gPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgYXJncyA9IFtdO1xuICAgICAgICAgICAgZm9yICh2YXIgX2kgPSAwOyBfaSA8IGFyZ3VtZW50cy5sZW5ndGg7IF9pKyspIHtcbiAgICAgICAgICAgICAgICBhcmdzW19pXSA9IGFyZ3VtZW50c1tfaV07XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBfdm0uJGVtaXQuYXBwbHkoX3ZtLCBfX3NwcmVhZEFycmF5KFt0eXBlXSwgYXJncykpO1xuICAgICAgICB9O1xuICAgIH0pO1xuICAgIG9uc1snY2hlY2tib3gtYWxsJ10gPSBfdm0uY2hlY2tib3hBbGxFdmVudDtcbiAgICBvbnNbJ2NoZWNrYm94LWNoYW5nZSddID0gX3ZtLmNoZWNrYm94Q2hhbmdlRXZlbnQ7XG4gICAgaWYgKHByb3h5Q29uZmlnKSB7XG4gICAgICAgIGlmIChwcm94eU9wdHMuc29ydCkge1xuICAgICAgICAgICAgb25zWydzb3J0LWNoYW5nZSddID0gX3ZtLnNvcnRDaGFuZ2VFdmVudDtcbiAgICAgICAgfVxuICAgICAgICBpZiAocHJveHlPcHRzLmZpbHRlcikge1xuICAgICAgICAgICAgb25zWydmaWx0ZXItY2hhbmdlJ10gPSBfdm0uZmlsdGVyQ2hhbmdlRXZlbnQ7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG9ucztcbn1cbmZ1bmN0aW9uIHJlZ2lzdGVyQ29tcG9uZW50KHZ4ZXRhYmxlKSB7XG4gICAgdmFyIHNldHVwID0gdnhldGFibGUuc2V0dXAsIHQgPSB2eGV0YWJsZS50O1xuICAgIHZhciBHbG9iYWxDb25maWcgPSBzZXR1cCgpO1xuICAgIHZhciBwcm9wS2V5cyA9IE9iamVjdC5rZXlzKHZ4ZXRhYmxlLlRhYmxlLnByb3BzKS5maWx0ZXIoZnVuY3Rpb24gKG5hbWUpIHsgcmV0dXJuIFsnZGF0YScsICd0cmVlQ29uZmlnJ10uaW5kZXhPZihuYW1lKSA9PT0gLTE7IH0pO1xuICAgIHZhciBvcHRpb25zID0ge1xuICAgICAgICBuYW1lOiAnVnhlVmlydHVhbFRyZWUnLFxuICAgICAgICBleHRlbmRzOiB2eGV0YWJsZS5HcmlkLFxuICAgICAgICBkYXRhOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgICAgIHJlbW92ZUxpc3Q6IFtdLFxuICAgICAgICAgICAgICAgIHRyZWVMYXp5TG9hZGVkczogW11cbiAgICAgICAgICAgIH07XG4gICAgICAgIH0sXG4gICAgICAgIGNvbXB1dGVkOiB7XG4gICAgICAgICAgICB0cmVlT3B0czogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBPYmplY3QuYXNzaWduKHt9LCBHbG9iYWxDb25maWcudGFibGUudHJlZUNvbmZpZywgdGhpcy50cmVlQ29uZmlnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGVja2JveE9wdHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gT2JqZWN0LmFzc2lnbih7fSwgR2xvYmFsQ29uZmlnLnRhYmxlLmNoZWNrYm94Q29uZmlnLCB0aGlzLmNoZWNrYm94Q29uZmlnKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0YWJsZUV4dGVuZFByb3BzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB2YXIgcmVzdCA9IHt9O1xuICAgICAgICAgICAgICAgIHByb3BLZXlzLmZvckVhY2goZnVuY3Rpb24gKGtleSkge1xuICAgICAgICAgICAgICAgICAgICByZXN0W2tleV0gPSBfdGhpc1trZXldO1xuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgIGlmIChyZXN0LmNoZWNrYm94Q29uZmlnKSB7XG4gICAgICAgICAgICAgICAgICAgIHJlc3QuY2hlY2tib3hDb25maWcgPSB0aGlzLmNoZWNrYm94T3B0cztcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHJlc3Q7XG4gICAgICAgICAgICB9XG4gICAgICAgIH0sXG4gICAgICAgIHdhdGNoOiB7XG4gICAgICAgICAgICBjb2x1bW5zOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNvbHVtbnModmFsdWUpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGRhdGE6IGZ1bmN0aW9uICh2YWx1ZSkge1xuICAgICAgICAgICAgICAgIHRoaXMubG9hZERhdGEodmFsdWUpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICBjcmVhdGVkOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICB2YXIgX2EgPSB0aGlzLCAkdnhlID0gX2EuJHZ4ZSwgdHJlZU9wdHMgPSBfYS50cmVlT3B0cywgZGF0YSA9IF9hLmRhdGEsIGNvbHVtbnMgPSBfYS5jb2x1bW5zO1xuICAgICAgICAgICAgT2JqZWN0LmFzc2lnbih0aGlzLCB7XG4gICAgICAgICAgICAgICAgZnVsbFRyZWVEYXRhOiBbXSxcbiAgICAgICAgICAgICAgICB0cmVlVGFibGVEYXRhOiBbXSxcbiAgICAgICAgICAgICAgICBmdWxsVHJlZVJvd01hcDogbmV3IE1hcCgpXG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIGlmICh0aGlzLmtlZXBTb3VyY2UpIHtcbiAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCR2eGUudCgndnhlLmVycm9yLm5vdFByb3AnLCBbJ2tlZXAtc291cmNlJ10pKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmICh0cmVlT3B0cy5saW5lKSB7XG4gICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigkdnhlLnQoJ3Z4ZS5lcnJvci5ub3RQcm9wJywgWydjaGVja2JveC1jb25maWcubGluZSddKSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBpZiAoY29sdW1ucykge1xuICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlQ29sdW1ucyhjb2x1bW5zKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGlmIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5yZWxvYWREYXRhKGRhdGEpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9LFxuICAgICAgICByZW5kZXI6IGZ1bmN0aW9uIChoKSB7XG4gICAgICAgICAgICB2YXIgX2E7XG4gICAgICAgICAgICB2YXIgX2IgPSB0aGlzLCB2U2l6ZSA9IF9iLnZTaXplLCBpc1pNYXggPSBfYi5pc1pNYXg7XG4gICAgICAgICAgICB2YXIgJHNjb3BlZFNsb3RzID0gdGhpcy4kc2NvcGVkU2xvdHM7XG4gICAgICAgICAgICB2YXIgaGFzRm9ybSA9ICEhKCRzY29wZWRTbG90cy5mb3JtIHx8IHRoaXMuZm9ybUNvbmZpZyk7XG4gICAgICAgICAgICB2YXIgaGFzVG9vbGJhciA9ICEhKCRzY29wZWRTbG90cy50b29sYmFyIHx8IHRoaXMudG9vbGJhckNvbmZpZyB8fCB0aGlzLnRvb2xiYXIpO1xuICAgICAgICAgICAgdmFyIGhhc1BhZ2VyID0gISEoJHNjb3BlZFNsb3RzLnBhZ2VyIHx8IHRoaXMucGFnZXJDb25maWcpO1xuICAgICAgICAgICAgcmV0dXJuIGgoJ2RpdicsIHtcbiAgICAgICAgICAgICAgICBjbGFzczogWyd2eGUtZ3JpZCcsICd2eGUtdmlydHVhbC10cmVlJywgKF9hID0ge30sXG4gICAgICAgICAgICAgICAgICAgICAgICBfYVtcInNpemUtLVwiICsgdlNpemVdID0gdlNpemUsXG4gICAgICAgICAgICAgICAgICAgICAgICBfYVsndC0tYW5pbWF0J10gPSAhIXRoaXMuYW5pbWF0LFxuICAgICAgICAgICAgICAgICAgICAgICAgX2FbJ2lzLS1yb3VuZCddID0gdGhpcy5yb3VuZCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hWydpcy0tbWF4aW1pemUnXSA9IGlzWk1heCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF9hWydpcy0tbG9hZGluZyddID0gdGhpcy5sb2FkaW5nIHx8IHRoaXMudGFibGVMb2FkaW5nLFxuICAgICAgICAgICAgICAgICAgICAgICAgX2EpXSxcbiAgICAgICAgICAgICAgICBzdHlsZTogdGhpcy5yZW5kZXJTdHlsZVxuICAgICAgICAgICAgfSwgW1xuICAgICAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICAgICAqIOa4suafk+ihqOWNlVxuICAgICAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgICAgIGhhc0Zvcm0gPyBoKCdkaXYnLCB7XG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ2Zvcm1XcmFwcGVyJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGljQ2xhc3M6ICd2eGUtZ3JpZC0tZm9ybS13cmFwcGVyJ1xuICAgICAgICAgICAgICAgIH0sICRzY29wZWRTbG90cy5mb3JtXG4gICAgICAgICAgICAgICAgICAgID8gJHNjb3BlZFNsb3RzLmZvcm0uY2FsbCh0aGlzLCB7ICRncmlkOiB0aGlzIH0sIGgpXG4gICAgICAgICAgICAgICAgICAgIDogcmVuZGVyRGVmYXVsdEZvcm0oaCwgdGhpcykpIDogbnVsbCxcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiDmuLLmn5Plt6XlhbfmoI9cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBoYXNUb29sYmFyID8gaCgnZGl2Jywge1xuICAgICAgICAgICAgICAgICAgICByZWY6ICd0b29sYmFyV3JhcHBlcicsXG4gICAgICAgICAgICAgICAgICAgIGNsYXNzOiAndnhlLWdyaWQtLXRvb2xiYXItd3JhcHBlcidcbiAgICAgICAgICAgICAgICB9LCAkc2NvcGVkU2xvdHMudG9vbGJhclxuICAgICAgICAgICAgICAgICAgICA/ICRzY29wZWRTbG90cy50b29sYmFyLmNhbGwodGhpcywgeyAkZ3JpZDogdGhpcyB9LCBoKVxuICAgICAgICAgICAgICAgICAgICA6IFtcbiAgICAgICAgICAgICAgICAgICAgICAgIGgoJ3Z4ZS10b29sYmFyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiB0aGlzLnRvb2xiYXJPcHRzLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlZjogJ3hUb29sYmFyJyxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBzY29wZWRTbG90czogZ2V0VG9vbGJhclNsb3RzKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICog5riy5p+T6KGo5qC86aG26YOo5Yy65Z+fXG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgJHNjb3BlZFNsb3RzLnRvcCA/IGgoJ2RpdicsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAndG9wV3JhcHBlcicsXG4gICAgICAgICAgICAgICAgICAgIHN0YXRpY0NsYXNzOiAndnhlLWdyaWQtLXRvcC13cmFwcGVyJ1xuICAgICAgICAgICAgICAgIH0sICRzY29wZWRTbG90cy50b3AuY2FsbCh0aGlzLCB7ICRncmlkOiB0aGlzIH0sIGgpKSA6IG51bGwsXG4gICAgICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgICAgICog5riy5p+T6KGo5qC8XG4gICAgICAgICAgICAgICAgICovXG4gICAgICAgICAgICAgICAgaCgndnhlLXRhYmxlJywge1xuICAgICAgICAgICAgICAgICAgICBwcm9wczogdGhpcy50YWJsZVByb3BzLFxuICAgICAgICAgICAgICAgICAgICBvbjogZ2V0VGFibGVPbnModGhpcyksXG4gICAgICAgICAgICAgICAgICAgIHNjb3BlZFNsb3RzOiAkc2NvcGVkU2xvdHMsXG4gICAgICAgICAgICAgICAgICAgIHJlZjogJ3hUYWJsZSdcbiAgICAgICAgICAgICAgICB9KSxcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiDmuLLmn5PooajmoLzlupXpg6jljLrln59cbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICAkc2NvcGVkU2xvdHMuYm90dG9tID8gaCgnZGl2Jywge1xuICAgICAgICAgICAgICAgICAgICByZWY6ICdib3R0b21XcmFwcGVyJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGljQ2xhc3M6ICd2eGUtZ3JpZC0tYm90dG9tLXdyYXBwZXInXG4gICAgICAgICAgICAgICAgfSwgJHNjb3BlZFNsb3RzLmJvdHRvbS5jYWxsKHRoaXMsIHsgJGdyaWQ6IHRoaXMgfSwgaCkpIDogbnVsbCxcbiAgICAgICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAgICAgKiDmuLLmn5PliIbpobVcbiAgICAgICAgICAgICAgICAgKi9cbiAgICAgICAgICAgICAgICBoYXNQYWdlciA/IGgoJ2RpdicsIHtcbiAgICAgICAgICAgICAgICAgICAgcmVmOiAncGFnZXJXcmFwcGVyJyxcbiAgICAgICAgICAgICAgICAgICAgc3RhdGljQ2xhc3M6ICd2eGUtZ3JpZC0tcGFnZXItd3JhcHBlcidcbiAgICAgICAgICAgICAgICB9LCAkc2NvcGVkU2xvdHMucGFnZXJcbiAgICAgICAgICAgICAgICAgICAgPyAkc2NvcGVkU2xvdHMucGFnZXIuY2FsbCh0aGlzLCB7ICRncmlkOiB0aGlzIH0sIGgpXG4gICAgICAgICAgICAgICAgICAgIDogW1xuICAgICAgICAgICAgICAgICAgICAgICAgaCgndnhlLXBhZ2VyJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHByb3BzOiB0aGlzLnBhZ2VyUHJvcHMsXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgb246IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgJ3BhZ2UtY2hhbmdlJzogdGhpcy5wYWdlQ2hhbmdlRXZlbnRcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNjb3BlZFNsb3RzOiBnZXRQYWdlclNsb3RzKHRoaXMpXG4gICAgICAgICAgICAgICAgICAgICAgICB9KVxuICAgICAgICAgICAgICAgICAgICBdKSA6IG51bGxcbiAgICAgICAgICAgIF0pO1xuICAgICAgICB9LFxuICAgICAgICBtZXRob2RzOiB7XG4gICAgICAgICAgICBsb2FkQ29sdW1uOiBmdW5jdGlvbiAoY29sdW1ucykge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJG5leHRUaWNrKCkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciBfYSA9IF90aGlzLCAkdnhlID0gX2EuJHZ4ZSwgJHNjb3BlZFNsb3RzID0gX2EuJHNjb3BlZFNsb3RzLCByZW5kZXJUcmVlSWNvbiA9IF9hLnJlbmRlclRyZWVJY29uLCB0cmVlT3B0cyA9IF9hLnRyZWVPcHRzO1xuICAgICAgICAgICAgICAgICAgICBjdG9yXzEuZGVmYXVsdC5lYWNoVHJlZShjb2x1bW5zLCBmdW5jdGlvbiAoY29sdW1uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uLnRyZWVOb2RlKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjb2x1bW4uc2xvdHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sdW1uLnNsb3RzID0ge307XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGNvbHVtbi5zbG90cy5pY29uID0gcmVuZGVyVHJlZUljb247XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAoY29sdW1uLnNsb3RzKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY3Rvcl8xLmRlZmF1bHQuZWFjaChjb2x1bW4uc2xvdHMsIGZ1bmN0aW9uIChmdW5jLCBuYW1lLCBjb2xTbG90cykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvLyDlhbzlrrkgdjJcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFjdG9yXzEuZGVmYXVsdC5pc0Z1bmN0aW9uKGZ1bmMpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoJHNjb3BlZFNsb3RzW2Z1bmNdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29sU2xvdHNbbmFtZV0gPSAkc2NvcGVkU2xvdHNbZnVuY107XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjb2xTbG90c1tuYW1lXSA9IG51bGw7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY29uc29sZS5lcnJvcigkdnhlLnQoJ3Z4ZS5lcnJvci5ub3RTbG90JywgW2Z1bmNdKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdHJlZU9wdHMpO1xuICAgICAgICAgICAgICAgICAgICBfdGhpcy4kcmVmcy54VGFibGUubG9hZENvbHVtbihjb2x1bW5zKTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW5kZXJUcmVlSWNvbjogZnVuY3Rpb24gKHBhcmFtcywgaCwgY2VsbFZOb2Rlcykge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgdHJlZUxhenlMb2FkZWRzID0gX2EudHJlZUxhenlMb2FkZWRzLCB0cmVlT3B0cyA9IF9hLnRyZWVPcHRzO1xuICAgICAgICAgICAgICAgIHZhciBpc0hpZGRlbiA9IHBhcmFtcy5pc0hpZGRlbiwgcm93ID0gcGFyYW1zLnJvdztcbiAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW4gPSB0cmVlT3B0cy5jaGlsZHJlbiwgaGFzQ2hpbGQgPSB0cmVlT3B0cy5oYXNDaGlsZCwgaW5kZW50ID0gdHJlZU9wdHMuaW5kZW50LCBsYXp5ID0gdHJlZU9wdHMubGF6eSwgdHJpZ2dlciA9IHRyZWVPcHRzLnRyaWdnZXIsIGljb25Mb2FkZWQgPSB0cmVlT3B0cy5pY29uTG9hZGVkLCBzaG93SWNvbiA9IHRyZWVPcHRzLnNob3dJY29uLCBpY29uT3BlbiA9IHRyZWVPcHRzLmljb25PcGVuLCBpY29uQ2xvc2UgPSB0cmVlT3B0cy5pY29uQ2xvc2U7XG4gICAgICAgICAgICAgICAgdmFyIHJvd0NoaWxkcyA9IHJvd1tjaGlsZHJlbl07XG4gICAgICAgICAgICAgICAgdmFyIGhhc0xhenlDaGlsZHMgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICB2YXIgaXNBY2VpdmVkID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgdmFyIGlzTGF6eUxvYWRlZCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgIHZhciBvbiA9IHt9O1xuICAgICAgICAgICAgICAgIGlmICghaXNIaWRkZW4pIHtcbiAgICAgICAgICAgICAgICAgICAgaXNBY2VpdmVkID0gcm93Ll9YX0VYUEFORDtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGxhenkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlzTGF6eUxvYWRlZCA9IHRyZWVMYXp5TG9hZGVkcy5pbmRleE9mKHJvdykgPiAtMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGhhc0xhenlDaGlsZHMgPSByb3dbaGFzQ2hpbGRdO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGlmICghdHJpZ2dlciB8fCB0cmlnZ2VyID09PSAnZGVmYXVsdCcpIHtcbiAgICAgICAgICAgICAgICAgICAgb24uY2xpY2sgPSBmdW5jdGlvbiAoZXZudCkgeyByZXR1cm4gX3RoaXMudHJpZ2dlclRyZWVFeHBhbmRFdmVudChldm50LCBwYXJhbXMpOyB9O1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gW1xuICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogWyd2eGUtY2VsbC0tdHJlZS1ub2RlJywge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAnaXMtLWFjdGl2ZSc6IGlzQWNlaXZlZFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1dLFxuICAgICAgICAgICAgICAgICAgICAgICAgc3R5bGU6IHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYWRkaW5nTGVmdDogcm93Ll9YX0xFVkVMICogaW5kZW50ICsgXCJweFwiXG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIFtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNob3dJY29uICYmICgocm93Q2hpbGRzICYmIHJvd0NoaWxkcy5sZW5ndGgpIHx8IGhhc0xhenlDaGlsZHMpID8gW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2RpdicsIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICd2eGUtdHJlZS0tYnRuLXdyYXBwZXInLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBvbjogb25cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9LCBbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGgoJ2knLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjbGFzczogWyd2eGUtdHJlZS0tbm9kZS1idG4nLCBpc0xhenlMb2FkZWQgPyAoaWNvbkxvYWRlZCB8fCBHbG9iYWxDb25maWcuaWNvbi5UQUJMRV9UUkVFX0xPQURFRCkgOiAoaXNBY2VpdmVkID8gKGljb25PcGVuIHx8IEdsb2JhbENvbmZpZy5pY29uLlRBQkxFX1RSRUVfT1BFTikgOiAoaWNvbkNsb3NlIHx8IEdsb2JhbENvbmZpZy5pY29uLlRBQkxFX1RSRUVfQ0xPU0UpKV1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSlcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBdKVxuICAgICAgICAgICAgICAgICAgICAgICAgXSA6IG51bGwsXG4gICAgICAgICAgICAgICAgICAgICAgICBoKCdkaXYnLCB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgY2xhc3M6ICd2eGUtdHJlZS1jZWxsJ1xuICAgICAgICAgICAgICAgICAgICAgICAgfSwgY2VsbFZOb2RlcylcbiAgICAgICAgICAgICAgICAgICAgXSlcbiAgICAgICAgICAgICAgICBdO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIF9sb2FkVHJlZURhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICB2YXIgc2VsZWN0Um93ID0gdGhpcy5nZXRSYWRpb1JlY29yZCgpO1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiRuZXh0VGljaygpXG4gICAgICAgICAgICAgICAgICAgIC50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF90aGlzLiRyZWZzLnhUYWJsZS5sb2FkRGF0YShkYXRhKTsgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgICAgICBpZiAoc2VsZWN0Um93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy5zZXRSYWRpb1JvdyhzZWxlY3RSb3cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgbG9hZERhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuX2xvYWRUcmVlRGF0YSh0aGlzLnRvVmlydHVhbFRyZWUoZGF0YSkpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHJlbG9hZERhdGE6IGZ1bmN0aW9uIChkYXRhKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kbmV4dFRpY2soKVxuICAgICAgICAgICAgICAgICAgICAudGhlbihmdW5jdGlvbiAoKSB7IHJldHVybiBfdGhpcy4kcmVmcy54VGFibGUucmVsb2FkRGF0YShfdGhpcy50b1ZpcnR1YWxUcmVlKGRhdGEpKTsgfSlcbiAgICAgICAgICAgICAgICAgICAgLnRoZW4oZnVuY3Rpb24gKCkgeyByZXR1cm4gX3RoaXMuaGFuZGxlRGVmYXVsdFRyZWVFeHBhbmQoKTsgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgaXNUcmVlRXhwYW5kQnlSb3c6IGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFyb3cuX1hfRVhQQU5EO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldFRyZWVFeHBhbnNpb246IGZ1bmN0aW9uIChyb3dzLCBleHBhbmRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldFRyZWVFeHBhbmQocm93cywgZXhwYW5kZWQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZUFzeW5jVHJlZUV4cGFuZENoaWxkczogZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgdHJlZUxhenlMb2FkZWRzID0gX2EudHJlZUxhenlMb2FkZWRzLCB0cmVlT3B0cyA9IF9hLnRyZWVPcHRzLCBjaGVja2JveE9wdHMgPSBfYS5jaGVja2JveE9wdHM7XG4gICAgICAgICAgICAgICAgdmFyIGxvYWRNZXRob2QgPSB0cmVlT3B0cy5sb2FkTWV0aG9kLCBjaGlsZHJlbiA9IHRyZWVPcHRzLmNoaWxkcmVuO1xuICAgICAgICAgICAgICAgIHZhciBjaGVja1N0cmljdGx5ID0gY2hlY2tib3hPcHRzLmNoZWNrU3RyaWN0bHk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIG5ldyBQcm9taXNlKGZ1bmN0aW9uIChyZXNvbHZlKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChsb2FkTWV0aG9kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmVlTGF6eUxvYWRlZHMucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbG9hZE1ldGhvZCh7IHJvdzogcm93IH0pLmNhdGNoKGZ1bmN0aW9uICgpIHsgcmV0dXJuIFtdOyB9KS50aGVuKGZ1bmN0aW9uIChjaGlsZHMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3cuX1hfTE9BREVEID0gdHJ1ZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBjdG9yXzEuZGVmYXVsdC5yZW1vdmUodHJlZUxhenlMb2FkZWRzLCBmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbSA9PT0gcm93OyB9KTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoIWN0b3JfMS5kZWZhdWx0LmlzQXJyYXkoY2hpbGRzKSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBjaGlsZHMgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGNoaWxkcykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByb3dbY2hpbGRyZW5dID0gY2hpbGRzLm1hcChmdW5jdGlvbiAoaXRlbSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5fWF9MT0FERUQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW0uX1hfRVhQQU5EID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtLl9YX0lOU0VSVCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5fWF9MRVZFTCA9IHJvdy5fWF9MRVZFTCArIDE7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gaXRlbTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmIChjaGlsZHMubGVuZ3RoICYmICFyb3cuX1hfRVhQQU5EKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBfdGhpcy52aXJ0dWFsRXhwYW5kKHJvdywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgLy8g5aaC5p6c5b2T5YmN6IqC54K55bey6YCJ5Lit77yM5YiZ5bGV5byA5ZCO5a2Q6IqC54K55Lmf6KKr6YCJ5LitXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIGlmICghY2hlY2tTdHJpY3RseSAmJiBfdGhpcy5pc0NoZWNrZWRCeUNoZWNrYm94Um93KHJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnNldENoZWNrYm94Um93KGNoaWxkcywgdHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShfdGhpcy4kbmV4dFRpY2soKS50aGVuKGZ1bmN0aW9uICgpIHsgcmV0dXJuIF90aGlzLnJlY2FsY3VsYXRlKCk7IH0pKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgcmVzb2x2ZShudWxsKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldFRyZWVFeHBhbmQ6IGZ1bmN0aW9uIChyb3dzLCBleHBhbmRlZCkge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgdHJlZUxhenlMb2FkZWRzID0gX2EudHJlZUxhenlMb2FkZWRzLCB0cmVlT3B0cyA9IF9hLnRyZWVPcHRzLCB0YWJsZUZ1bGxEYXRhID0gX2EudGFibGVGdWxsRGF0YSwgdHJlZU5vZGVDb2x1bW4gPSBfYS50cmVlTm9kZUNvbHVtbjtcbiAgICAgICAgICAgICAgICB2YXIgbGF6eSA9IHRyZWVPcHRzLmxhenksIGhhc0NoaWxkID0gdHJlZU9wdHMuaGFzQ2hpbGQsIGFjY29yZGlvbiA9IHRyZWVPcHRzLmFjY29yZGlvbiwgdG9nZ2xlTWV0aG9kID0gdHJlZU9wdHMudG9nZ2xlTWV0aG9kO1xuICAgICAgICAgICAgICAgIHZhciByZXN1bHQgPSBbXTtcbiAgICAgICAgICAgICAgICBpZiAocm93cykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoIWN0b3JfMS5kZWZhdWx0LmlzQXJyYXkocm93cykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3MgPSBbcm93c107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGNvbHVtbkluZGV4XzEgPSB0aGlzLmdldENvbHVtbkluZGV4KHRyZWVOb2RlQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyICRjb2x1bW5JbmRleF8xID0gdGhpcy5nZXRWTUNvbHVtbkluZGV4KHRyZWVOb2RlQ29sdW1uKTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHZhbGlkUm93cyA9IHRvZ2dsZU1ldGhvZCA/IHJvd3MuZmlsdGVyKGZ1bmN0aW9uIChyb3cpIHsgcmV0dXJuIHRvZ2dsZU1ldGhvZCh7IGV4cGFuZGVkOiBleHBhbmRlZCwgY29sdW1uOiB0cmVlTm9kZUNvbHVtbiwgcm93OiByb3csIGNvbHVtbkluZGV4OiBjb2x1bW5JbmRleF8xLCAkY29sdW1uSW5kZXg6ICRjb2x1bW5JbmRleF8xIH0pOyB9KSA6IHJvd3M7XG4gICAgICAgICAgICAgICAgICAgIGlmIChhY2NvcmRpb24pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhbGlkUm93cyA9IHZhbGlkUm93cy5sZW5ndGggPyBbdmFsaWRSb3dzW3ZhbGlkUm93cy5sZW5ndGggLSAxXV0gOiBbXTtcbiAgICAgICAgICAgICAgICAgICAgICAgIC8vIOWQjOS4gOe6p+WPquiDveWxleW8gOS4gOS4qlxuICAgICAgICAgICAgICAgICAgICAgICAgdmFyIG1hdGNoT2JqID0gY3Rvcl8xLmRlZmF1bHQuZmluZFRyZWUodGFibGVGdWxsRGF0YSwgZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIGl0ZW0gPT09IHJvd3NbMF07IH0sIHRyZWVPcHRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChtYXRjaE9iaikge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIG1hdGNoT2JqLml0ZW1zLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgcm93Ll9YX0VYUEFORCA9IGZhbHNlO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIHZhbGlkUm93cy5mb3JFYWNoKGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpc0xvYWQgPSBsYXp5ICYmIHJvd1toYXNDaGlsZF0gJiYgIXJvdy5fWF9MT0FERUQgJiYgdHJlZUxhenlMb2FkZWRzLmluZGV4T2Yocm93KSA9PT0gLTE7XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyDmmK/lkKbkvb/nlKjmh5LliqDovb1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChleHBhbmRlZCAmJiBpc0xvYWQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZXN1bHQucHVzaChfdGhpcy5oYW5kbGVBc3luY1RyZWVFeHBhbmRDaGlsZHMocm93KSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaGFzQ2hpbGRzKF90aGlzLCByb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnZpcnR1YWxFeHBhbmQocm93LCAhIWV4cGFuZGVkKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gUHJvbWlzZS5hbGwocmVzdWx0KS50aGVuKGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLl9sb2FkVHJlZURhdGEoX3RoaXMudHJlZVRhYmxlRGF0YSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gX3RoaXMucmVjYWxjdWxhdGUoKTtcbiAgICAgICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLiRuZXh0VGljaygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldEFsbFRyZWVFeHBhbnNpb246IGZ1bmN0aW9uIChleHBhbmRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEFsbFRyZWVFeHBhbmQoZXhwYW5kZWQpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHNldEFsbFRyZWVFeHBhbmQ6IGZ1bmN0aW9uIChleHBhbmRlZCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2FkVHJlZURhdGEodGhpcy52aXJ0dWFsQWxsRXhwYW5kKGV4cGFuZGVkKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgdG9nZ2xlVHJlZUV4cGFuc2lvbjogZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRvZ2dsZVRyZWVFeHBhbmQocm93KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICB0cmlnZ2VyVHJlZUV4cGFuZEV2ZW50OiBmdW5jdGlvbiAoZXZudCwgcGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgdHJlZU9wdHMgPSBfYS50cmVlT3B0cywgdHJlZUxhenlMb2FkZWRzID0gX2EudHJlZUxhenlMb2FkZWRzO1xuICAgICAgICAgICAgICAgIHZhciByb3cgPSBwYXJhbXMucm93LCBjb2x1bW4gPSBwYXJhbXMuY29sdW1uO1xuICAgICAgICAgICAgICAgIHZhciBsYXp5ID0gdHJlZU9wdHMubGF6eTtcbiAgICAgICAgICAgICAgICBpZiAoIWxhenkgfHwgdHJlZUxhenlMb2FkZWRzLmluZGV4T2Yocm93KSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4cGFuZGVkID0gIXRoaXMuaXNUcmVlRXhwYW5kQnlSb3cocm93KTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5zZXRUcmVlRXhwYW5kKHJvdywgZXhwYW5kZWQpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLiRlbWl0KCd0b2dnbGUtdHJlZS1leHBhbmQnLCB7IGV4cGFuZGVkOiBleHBhbmRlZCwgY29sdW1uOiBjb2x1bW4sIHJvdzogcm93LCAkZXZlbnQ6IGV2bnQgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHRvZ2dsZVRyZWVFeHBhbmQ6IGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9hZFRyZWVEYXRhKHRoaXMudmlydHVhbEV4cGFuZChyb3csICFyb3cuX1hfRVhQQU5EKSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0VHJlZUV4cGFuZFJlY29yZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZhciBfYSA9IHRoaXMsIGZ1bGxUcmVlRGF0YSA9IF9hLmZ1bGxUcmVlRGF0YSwgdHJlZU9wdHMgPSBfYS50cmVlT3B0cztcbiAgICAgICAgICAgICAgICB2YXIgdHJlZUV4cGFuZFJlY29yZHMgPSBbXTtcbiAgICAgICAgICAgICAgICBjdG9yXzEuZGVmYXVsdC5lYWNoVHJlZShmdWxsVHJlZURhdGEsIGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdy5fWF9FWFBBTkQgJiYgaGFzQ2hpbGRzKF90aGlzLCByb3cpKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0cmVlRXhwYW5kUmVjb3Jkcy5wdXNoKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9LCB0cmVlT3B0cyk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyZWVFeHBhbmRSZWNvcmRzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGNsZWFyVHJlZUV4cGFuZDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnNldEFsbFRyZWVFeHBhbmQoZmFsc2UpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGhhbmRsZUNvbHVtbnM6IGZ1bmN0aW9uIChjb2x1bW5zKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgJHZ4ZSA9IF9hLiR2eGUsIHJlbmRlclRyZWVJY29uID0gX2EucmVuZGVyVHJlZUljb24sIGNoZWNrYm94T3B0cyA9IF9hLmNoZWNrYm94T3B0cztcbiAgICAgICAgICAgICAgICBpZiAoY29sdW1ucykge1xuICAgICAgICAgICAgICAgICAgICBpZiAoKCFjaGVja2JveE9wdHMuY2hlY2tGaWVsZCB8fCAhY2hlY2tib3hPcHRzLmhhbGZGaWVsZCkgJiYgY29sdW1ucy5zb21lKGZ1bmN0aW9uIChjb25mKSB7IHJldHVybiBjb25mLnR5cGUgPT09ICdjaGVja2JveCc7IH0pKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBjb25zb2xlLmVycm9yKCR2eGUudCgndnhlLmVycm9yLnJlcVByb3AnLCBbJ3RhYmxlLmNoZWNrYm94LWNvbmZpZy5jaGVja0ZpZWxkIHwgdGFibGUuY2hlY2tib3gtY29uZmlnLmhhbGZGaWVsZCddKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICByZXR1cm4gW107XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIHRyZWVOb2RlQ29sdW1uID0gY29sdW1ucy5maW5kKGZ1bmN0aW9uIChjb25mKSB7IHJldHVybiBjb25mLnRyZWVOb2RlOyB9KTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHRyZWVOb2RlQ29sdW1uKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgc2xvdHMgPSB0cmVlTm9kZUNvbHVtbi5zbG90cyB8fCB7fTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHNsb3RzLmljb24gPSByZW5kZXJUcmVlSWNvbjtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyZWVOb2RlQ29sdW1uLnNsb3RzID0gc2xvdHM7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnRyZWVOb2RlQ29sdW1uID0gdHJlZU5vZGVDb2x1bW47XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIGNvbHVtbnM7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiBbXTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOiOt+WPluihqOagvOaVsOaNrumbhu+8jOWMheWQq+aWsOWinuOAgeWIoOmZpFxuICAgICAgICAgICAgICog5LiN5pSv5oyB5L+u5pS5XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIGdldFJlY29yZHNldDogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgIGluc2VydFJlY29yZHM6IHRoaXMuZ2V0SW5zZXJ0UmVjb3JkcygpLFxuICAgICAgICAgICAgICAgICAgICByZW1vdmVSZWNvcmRzOiB0aGlzLmdldFJlbW92ZVJlY29yZHMoKSxcbiAgICAgICAgICAgICAgICAgICAgdXBkYXRlUmVjb3JkczogW11cbiAgICAgICAgICAgICAgICB9O1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGlzSW5zZXJ0QnlSb3c6IGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gISFyb3cuX1hfSU5TRVJUO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGdldEluc2VydFJlY29yZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJlZU9wdHMgPSB0aGlzLnRyZWVPcHRzO1xuICAgICAgICAgICAgICAgIHZhciBpbnNlcnRSZWNvcmRzID0gW107XG4gICAgICAgICAgICAgICAgY3Rvcl8xLmRlZmF1bHQuZWFjaFRyZWUodGhpcy5mdWxsVHJlZURhdGEsIGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKHJvdy5fWF9JTlNFUlQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGluc2VydFJlY29yZHMucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfSwgdHJlZU9wdHMpO1xuICAgICAgICAgICAgICAgIHJldHVybiBpbnNlcnRSZWNvcmRzO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIGluc2VydDogZnVuY3Rpb24gKHJlY29yZHMpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5pbnNlcnRBdChyZWNvcmRzLCBudWxsKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOaUr+aMgeS7u+aEj+Wxgue6p+aPkuWFpeS4juWIoOmZpFxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBpbnNlcnRBdDogZnVuY3Rpb24gKHJlY29yZHMsIHJvdykge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgZnVsbFRyZWVEYXRhID0gX2EuZnVsbFRyZWVEYXRhLCB0cmVlVGFibGVEYXRhID0gX2EudHJlZVRhYmxlRGF0YSwgdHJlZU9wdHMgPSBfYS50cmVlT3B0cztcbiAgICAgICAgICAgICAgICBpZiAoIWN0b3JfMS5kZWZhdWx0LmlzQXJyYXkocmVjb3JkcykpIHtcbiAgICAgICAgICAgICAgICAgICAgcmVjb3JkcyA9IFtyZWNvcmRzXTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdmFyIG5ld1JlY29yZHMgPSByZWNvcmRzLm1hcChmdW5jdGlvbiAocmVjb3JkKSB7IHJldHVybiBfdGhpcy5kZWZpbmVGaWVsZChPYmplY3QuYXNzaWduKHtcbiAgICAgICAgICAgICAgICAgICAgX1hfTE9BREVEOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgX1hfRVhQQU5EOiBmYWxzZSxcbiAgICAgICAgICAgICAgICAgICAgX1hfSU5TRVJUOiB0cnVlLFxuICAgICAgICAgICAgICAgICAgICBfWF9MRVZFTDogMFxuICAgICAgICAgICAgICAgIH0sIHJlY29yZCkpOyB9KTtcbiAgICAgICAgICAgICAgICBpZiAoIXJvdykge1xuICAgICAgICAgICAgICAgICAgICBmdWxsVHJlZURhdGEudW5zaGlmdC5hcHBseShmdWxsVHJlZURhdGEsIG5ld1JlY29yZHMpO1xuICAgICAgICAgICAgICAgICAgICB0cmVlVGFibGVEYXRhLnVuc2hpZnQuYXBwbHkodHJlZVRhYmxlRGF0YSwgbmV3UmVjb3Jkcyk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICBpZiAocm93ID09PSAtMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgZnVsbFRyZWVEYXRhLnB1c2guYXBwbHkoZnVsbFRyZWVEYXRhLCBuZXdSZWNvcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRyZWVUYWJsZURhdGEucHVzaC5hcHBseSh0cmVlVGFibGVEYXRhLCBuZXdSZWNvcmRzKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaE9iaiA9IGN0b3JfMS5kZWZhdWx0LmZpbmRUcmVlKGZ1bGxUcmVlRGF0YSwgZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIGl0ZW0gPT09IHJvdzsgfSwgdHJlZU9wdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFtYXRjaE9iaiB8fCBtYXRjaE9iai5pbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IodCgndnhlLmVycm9yLnVuYWJsZUluc2VydCcpKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpdGVtcyA9IG1hdGNoT2JqLml0ZW1zLCBpbmRleCA9IG1hdGNoT2JqLmluZGV4LCBub2Rlc18xID0gbWF0Y2hPYmoubm9kZXM7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcm93SW5kZXggPSB0cmVlVGFibGVEYXRhLmluZGV4T2Yocm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3dJbmRleCA+IC0xKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJlZVRhYmxlRGF0YS5zcGxpY2UuYXBwbHkodHJlZVRhYmxlRGF0YSwgX19zcHJlYWRBcnJheShbcm93SW5kZXgsIDBdLCBuZXdSZWNvcmRzKSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UuYXBwbHkoaXRlbXMsIF9fc3ByZWFkQXJyYXkoW2luZGV4LCAwXSwgbmV3UmVjb3JkcykpO1xuICAgICAgICAgICAgICAgICAgICAgICAgbmV3UmVjb3Jkcy5mb3JFYWNoKGZ1bmN0aW9uIChpdGVtKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXRlbS5fWF9MRVZFTCA9IG5vZGVzXzEubGVuZ3RoIC0gMTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH0pO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLl9sb2FkVHJlZURhdGEodHJlZVRhYmxlRGF0YSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3c6IG5ld1JlY29yZHMubGVuZ3RoID8gbmV3UmVjb3Jkc1tuZXdSZWNvcmRzLmxlbmd0aCAtIDFdIDogbnVsbCxcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvd3M6IG5ld1JlY29yZHNcbiAgICAgICAgICAgICAgICAgICAgfTtcbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOiOt+WPluW3suWIoOmZpOeahOaVsOaNrlxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICBnZXRSZW1vdmVSZWNvcmRzOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMucmVtb3ZlTGlzdDtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICByZW1vdmVTZWxlY3RlZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmVDaGVja2JveFJvdygpO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5Yig6Zmk6YCJ5Lit5pWw5o2uXG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHJlbW92ZUNoZWNrYm94Um93OiBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgdmFyIF90aGlzID0gdGhpcztcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5yZW1vdmUodGhpcy5nZXRDaGVja2JveFJlY29yZHMoKSkudGhlbihmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgICAgIF90aGlzLmNsZWFyU2VsZWN0aW9uKCk7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiBwYXJhbXM7XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcmVtb3ZlOiBmdW5jdGlvbiAocm93cykge1xuICAgICAgICAgICAgICAgIHZhciBfdGhpcyA9IHRoaXM7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgcmVtb3ZlTGlzdCA9IF9hLnJlbW92ZUxpc3QsIGZ1bGxUcmVlRGF0YSA9IF9hLmZ1bGxUcmVlRGF0YSwgdHJlZU9wdHMgPSBfYS50cmVlT3B0cztcbiAgICAgICAgICAgICAgICB2YXIgcmVzdCA9IFtdO1xuICAgICAgICAgICAgICAgIGlmICghcm93cykge1xuICAgICAgICAgICAgICAgICAgICByb3dzID0gZnVsbFRyZWVEYXRhO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIGlmICghY3Rvcl8xLmRlZmF1bHQuaXNBcnJheShyb3dzKSkge1xuICAgICAgICAgICAgICAgICAgICByb3dzID0gW3Jvd3NdO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByb3dzLmZvckVhY2goZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgbWF0Y2hPYmogPSBjdG9yXzEuZGVmYXVsdC5maW5kVHJlZShmdWxsVHJlZURhdGEsIGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiBpdGVtID09PSByb3c7IH0sIHRyZWVPcHRzKTtcbiAgICAgICAgICAgICAgICAgICAgaWYgKG1hdGNoT2JqKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgaXRlbSA9IG1hdGNoT2JqLml0ZW0sIGl0ZW1zID0gbWF0Y2hPYmouaXRlbXMsIGluZGV4ID0gbWF0Y2hPYmouaW5kZXgsIHBhcmVudF8xID0gbWF0Y2hPYmoucGFyZW50O1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKCFfdGhpcy5pc0luc2VydEJ5Um93KHJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICByZW1vdmVMaXN0LnB1c2gocm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRfMSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpc0V4cGFuZCA9IF90aGlzLmlzVHJlZUV4cGFuZEJ5Um93KHBhcmVudF8xKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpZiAoaXNFeHBhbmQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGFuZGxlQ29sbGFwc2luZyhwYXJlbnRfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGl0ZW1zLnNwbGljZShpbmRleCwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGlzRXhwYW5kKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLmhhbmRsZUV4cGFuZGluZyhwYXJlbnRfMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgZWxzZSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuaGFuZGxlQ29sbGFwc2luZyhpdGVtKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBpdGVtcy5zcGxpY2UoaW5kZXgsIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIF90aGlzLnRyZWVUYWJsZURhdGEuc3BsaWNlKF90aGlzLnRyZWVUYWJsZURhdGEuaW5kZXhPZihpdGVtKSwgMSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICByZXN0LnB1c2goaXRlbSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5fbG9hZFRyZWVEYXRhKHRoaXMudHJlZVRhYmxlRGF0YSkudGhlbihmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgICAgICAgICAgIHJldHVybiB7IHJvdzogcmVzdC5sZW5ndGggPyByZXN0W3Jlc3QubGVuZ3RoIC0gMV0gOiBudWxsLCByb3dzOiByZXN0IH07XG4gICAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlpITnkIbpu5jorqTlsZXlvIDmoJHoioLngrlcbiAgICAgICAgICAgICAqL1xuICAgICAgICAgICAgaGFuZGxlRGVmYXVsdFRyZWVFeHBhbmQ6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX3RoaXMgPSB0aGlzO1xuICAgICAgICAgICAgICAgIHZhciBfYSA9IHRoaXMsIHRyZWVDb25maWcgPSBfYS50cmVlQ29uZmlnLCB0cmVlT3B0cyA9IF9hLnRyZWVPcHRzLCB0YWJsZUZ1bGxEYXRhID0gX2EudGFibGVGdWxsRGF0YTtcbiAgICAgICAgICAgICAgICBpZiAodHJlZUNvbmZpZykge1xuICAgICAgICAgICAgICAgICAgICB2YXIgY2hpbGRyZW5fMSA9IHRyZWVPcHRzLmNoaWxkcmVuLCBleHBhbmRBbGwgPSB0cmVlT3B0cy5leHBhbmRBbGwsIGV4cGFuZFJvd0tleXMgPSB0cmVlT3B0cy5leHBhbmRSb3dLZXlzO1xuICAgICAgICAgICAgICAgICAgICBpZiAoZXhwYW5kQWxsKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLnNldEFsbFRyZWVFeHBhbmQodHJ1ZSk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgZWxzZSBpZiAoZXhwYW5kUm93S2V5cyAmJiB0aGlzLnJvd0lkKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICB2YXIgcm93a2V5XzEgPSB0aGlzLnJvd0lkO1xuICAgICAgICAgICAgICAgICAgICAgICAgZXhwYW5kUm93S2V5cy5mb3JFYWNoKGZ1bmN0aW9uIChyb3dpZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciBtYXRjaE9iaiA9IGN0b3JfMS5kZWZhdWx0LmZpbmRUcmVlKHRhYmxlRnVsbERhdGEsIGZ1bmN0aW9uIChpdGVtKSB7IHJldHVybiByb3dpZCA9PT0gY3Rvcl8xLmRlZmF1bHQuZ2V0KGl0ZW0sIHJvd2tleV8xKTsgfSwgdHJlZU9wdHMpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIC8vQHRzLWlnbm9yZVxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHZhciByb3dDaGlsZHJlbiA9IG1hdGNoT2JqID8gbWF0Y2hPYmouaXRlbVtjaGlsZHJlbl8xXSA6IDA7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvd0NoaWxkcmVuICYmIHJvd0NoaWxkcmVuLmxlbmd0aCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAvL0B0cy1pZ25vcmVcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgX3RoaXMuc2V0VHJlZUV4cGFuZChtYXRjaE9iai5pdGVtLCB0cnVlKTtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgICAgICB9KTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvKipcbiAgICAgICAgICAgICAqIOWumuS5ieagkeWxnuaAp1xuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB0b1ZpcnR1YWxUcmVlOiBmdW5jdGlvbiAodHJlZURhdGEpIHtcbiAgICAgICAgICAgICAgICB2YXIgdHJlZU9wdHMgPSB0aGlzLnRyZWVPcHRzO1xuICAgICAgICAgICAgICAgIHZhciBmdWxsVHJlZVJvd01hcCA9IHRoaXMuZnVsbFRyZWVSb3dNYXA7XG4gICAgICAgICAgICAgICAgZnVsbFRyZWVSb3dNYXAuY2xlYXIoKTtcbiAgICAgICAgICAgICAgICBjdG9yXzEuZGVmYXVsdC5lYWNoVHJlZSh0cmVlRGF0YSwgZnVuY3Rpb24gKGl0ZW0sIGluZGV4LCBpdGVtcywgcGF0aHMsIHBhcmVudCwgbm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5fWF9MT0FERUQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5fWF9FWFBBTkQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5fWF9JTlNFUlQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgaXRlbS5fWF9MRVZFTCA9IG5vZGVzLmxlbmd0aCAtIDE7XG4gICAgICAgICAgICAgICAgICAgIGZ1bGxUcmVlUm93TWFwLnNldChpdGVtLCB7IGl0ZW06IGl0ZW0sIGluZGV4OiBpbmRleCwgaXRlbXM6IGl0ZW1zLCBwYXRoczogcGF0aHMsIHBhcmVudDogcGFyZW50LCBub2Rlczogbm9kZXMgfSk7XG4gICAgICAgICAgICAgICAgfSwgdHJlZU9wdHMpO1xuICAgICAgICAgICAgICAgIHRoaXMuZnVsbFRyZWVEYXRhID0gdHJlZURhdGEuc2xpY2UoMCk7XG4gICAgICAgICAgICAgICAgdGhpcy50cmVlVGFibGVEYXRhID0gdHJlZURhdGEuc2xpY2UoMCk7XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRyZWVEYXRhO1xuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIC8qKlxuICAgICAgICAgICAgICog5bGV5byAL+aUtui1t+agkeiKgueCuVxuICAgICAgICAgICAgICovXG4gICAgICAgICAgICB2aXJ0dWFsRXhwYW5kOiBmdW5jdGlvbiAocm93LCBleHBhbmRlZCkge1xuICAgICAgICAgICAgICAgIHZhciBfYSA9IHRoaXMsIHRyZWVPcHRzID0gX2EudHJlZU9wdHMsIHRyZWVOb2RlQ29sdW1uID0gX2EudHJlZU5vZGVDb2x1bW47XG4gICAgICAgICAgICAgICAgdmFyIHRvZ2dsZU1ldGhvZCA9IHRyZWVPcHRzLnRvZ2dsZU1ldGhvZDtcbiAgICAgICAgICAgICAgICB2YXIgY29sdW1uSW5kZXggPSB0aGlzLmdldENvbHVtbkluZGV4KHRyZWVOb2RlQ29sdW1uKTtcbiAgICAgICAgICAgICAgICB2YXIgJGNvbHVtbkluZGV4ID0gdGhpcy5nZXRWTUNvbHVtbkluZGV4KHRyZWVOb2RlQ29sdW1uKTtcbiAgICAgICAgICAgICAgICBpZiAoIXRvZ2dsZU1ldGhvZCB8fCB0b2dnbGVNZXRob2QoeyBleHBhbmRlZDogZXhwYW5kZWQsIHJvdzogcm93LCBjb2x1bW46IHRyZWVOb2RlQ29sdW1uLCBjb2x1bW5JbmRleDogY29sdW1uSW5kZXgsICRjb2x1bW5JbmRleDogJGNvbHVtbkluZGV4IH0pKSB7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3cuX1hfRVhQQU5EICE9PSBleHBhbmRlZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKHJvdy5fWF9FWFBBTkQpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmhhbmRsZUNvbGxhcHNpbmcocm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRoaXMuaGFuZGxlRXhwYW5kaW5nKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJlZVRhYmxlRGF0YTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDlsZXlvIDoioLngrlcbiAgICAgICAgICAgIGhhbmRsZUV4cGFuZGluZzogZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgICAgIGlmIChoYXNDaGlsZHModGhpcywgcm93KSkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgX2EgPSB0aGlzLCB0cmVlVGFibGVEYXRhID0gX2EudHJlZVRhYmxlRGF0YSwgdHJlZU9wdHMgPSBfYS50cmVlT3B0cztcbiAgICAgICAgICAgICAgICAgICAgdmFyIGNoaWxkUm93cyA9IHJvd1t0cmVlT3B0cy5jaGlsZHJlbl07XG4gICAgICAgICAgICAgICAgICAgIHZhciBleHBhbmRMaXN0XzEgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgdmFyIHJvd0luZGV4ID0gdHJlZVRhYmxlRGF0YS5pbmRleE9mKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgIGlmIChyb3dJbmRleCA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignRXhwYW5kaW5nIGVycm9yJyk7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgdmFyIGV4cGFuZE1hcHNfMSA9IG5ldyBNYXAoKTtcbiAgICAgICAgICAgICAgICAgICAgY3Rvcl8xLmRlZmF1bHQuZWFjaFRyZWUoY2hpbGRSb3dzLCBmdW5jdGlvbiAoaXRlbSwgaW5kZXgsIG9iaiwgcGF0aHMsIHBhcmVudCwgbm9kZXMpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmICghcGFyZW50IHx8IChwYXJlbnQuX1hfRVhQQU5EICYmIGV4cGFuZE1hcHNfMS5oYXMocGFyZW50KSkpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBleHBhbmRNYXBzXzEuc2V0KGl0ZW0sIDEpO1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGV4cGFuZExpc3RfMS5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9LCB0cmVlT3B0cyk7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5fWF9FWFBBTkQgPSB0cnVlO1xuICAgICAgICAgICAgICAgICAgICB0cmVlVGFibGVEYXRhLnNwbGljZS5hcHBseSh0cmVlVGFibGVEYXRhLCBfX3NwcmVhZEFycmF5KFtyb3dJbmRleCArIDEsIDBdLCBleHBhbmRMaXN0XzEpKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJlZVRhYmxlRGF0YTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICAvLyDmlLbotbfoioLngrlcbiAgICAgICAgICAgIGhhbmRsZUNvbGxhcHNpbmc6IGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICBpZiAoaGFzQ2hpbGRzKHRoaXMsIHJvdykpIHtcbiAgICAgICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgdHJlZVRhYmxlRGF0YSA9IF9hLnRyZWVUYWJsZURhdGEsIHRyZWVPcHRzID0gX2EudHJlZU9wdHM7XG4gICAgICAgICAgICAgICAgICAgIHZhciBjaGlsZFJvd3MgPSByb3dbdHJlZU9wdHMuY2hpbGRyZW5dO1xuICAgICAgICAgICAgICAgICAgICB2YXIgbm9kZUNoaWxkTGlzdF8xID0gW107XG4gICAgICAgICAgICAgICAgICAgIGN0b3JfMS5kZWZhdWx0LmVhY2hUcmVlKGNoaWxkUm93cywgZnVuY3Rpb24gKGl0ZW0pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vZGVDaGlsZExpc3RfMS5wdXNoKGl0ZW0pO1xuICAgICAgICAgICAgICAgICAgICB9LCB0cmVlT3B0cyk7XG4gICAgICAgICAgICAgICAgICAgIHJvdy5fWF9FWFBBTkQgPSBmYWxzZTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy50cmVlVGFibGVEYXRhID0gdHJlZVRhYmxlRGF0YS5maWx0ZXIoZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIG5vZGVDaGlsZExpc3RfMS5pbmRleE9mKGl0ZW0pID09PSAtMTsgfSk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIHJldHVybiB0aGlzLnRyZWVUYWJsZURhdGE7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgLyoqXG4gICAgICAgICAgICAgKiDlsZXlvIAv5pS26LW35omA5pyJ5qCR6IqC54K5XG4gICAgICAgICAgICAgKi9cbiAgICAgICAgICAgIHZpcnR1YWxBbGxFeHBhbmQ6IGZ1bmN0aW9uIChleHBhbmRlZCkge1xuICAgICAgICAgICAgICAgIHZhciB0cmVlT3B0cyA9IHRoaXMudHJlZU9wdHM7XG4gICAgICAgICAgICAgICAgaWYgKGV4cGFuZGVkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciB0YWJsZUxpc3RfMSA9IFtdO1xuICAgICAgICAgICAgICAgICAgICBjdG9yXzEuZGVmYXVsdC5lYWNoVHJlZSh0aGlzLmZ1bGxUcmVlRGF0YSwgZnVuY3Rpb24gKHJvdykge1xuICAgICAgICAgICAgICAgICAgICAgICAgcm93Ll9YX0VYUEFORCA9IGV4cGFuZGVkO1xuICAgICAgICAgICAgICAgICAgICAgICAgdGFibGVMaXN0XzEucHVzaChyb3cpO1xuICAgICAgICAgICAgICAgICAgICB9LCB0cmVlT3B0cyk7XG4gICAgICAgICAgICAgICAgICAgIHRoaXMudHJlZVRhYmxlRGF0YSA9IHRhYmxlTGlzdF8xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICBlbHNlIHtcbiAgICAgICAgICAgICAgICAgICAgY3Rvcl8xLmRlZmF1bHQuZWFjaFRyZWUodGhpcy5mdWxsVHJlZURhdGEsIGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHJvdy5fWF9FWFBBTkQgPSBleHBhbmRlZDtcbiAgICAgICAgICAgICAgICAgICAgfSwgdHJlZU9wdHMpO1xuICAgICAgICAgICAgICAgICAgICB0aGlzLnRyZWVUYWJsZURhdGEgPSB0aGlzLmZ1bGxUcmVlRGF0YS5zbGljZSgwKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMudHJlZVRhYmxlRGF0YTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGVja2JveEFsbEV2ZW50OiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgY2hlY2tib3hPcHRzID0gX2EuY2hlY2tib3hPcHRzLCB0cmVlT3B0cyA9IF9hLnRyZWVPcHRzO1xuICAgICAgICAgICAgICAgIHZhciBjaGVja0ZpZWxkID0gY2hlY2tib3hPcHRzLmNoZWNrRmllbGQsIGhhbGZGaWVsZCA9IGNoZWNrYm94T3B0cy5oYWxmRmllbGQsIGNoZWNrU3RyaWN0bHkgPSBjaGVja2JveE9wdHMuY2hlY2tTdHJpY3RseTtcbiAgICAgICAgICAgICAgICB2YXIgY2hlY2tlZCA9IHBhcmFtcy5jaGVja2VkO1xuICAgICAgICAgICAgICAgIGlmIChjaGVja0ZpZWxkICYmICFjaGVja1N0cmljdGx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGN0b3JfMS5kZWZhdWx0LmVhY2hUcmVlKHRoaXMuZnVsbFRyZWVEYXRhLCBmdW5jdGlvbiAocm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3dbY2hlY2tGaWVsZF0gPSBjaGVja2VkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhbGZGaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1toYWxmRmllbGRdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRyZWVPcHRzKTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy4kZW1pdCgnY2hlY2tib3gtYWxsJywgcGFyYW1zKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGVja2JveENoYW5nZUV2ZW50OiBmdW5jdGlvbiAocGFyYW1zKSB7XG4gICAgICAgICAgICAgICAgdmFyIF9hID0gdGhpcywgY2hlY2tib3hPcHRzID0gX2EuY2hlY2tib3hPcHRzLCB0cmVlT3B0cyA9IF9hLnRyZWVPcHRzO1xuICAgICAgICAgICAgICAgIHZhciBjaGVja0ZpZWxkID0gY2hlY2tib3hPcHRzLmNoZWNrRmllbGQsIGhhbGZGaWVsZCA9IGNoZWNrYm94T3B0cy5oYWxmRmllbGQsIGNoZWNrU3RyaWN0bHkgPSBjaGVja2JveE9wdHMuY2hlY2tTdHJpY3RseTtcbiAgICAgICAgICAgICAgICB2YXIgcm93ID0gcGFyYW1zLnJvdywgY2hlY2tlZCA9IHBhcmFtcy5jaGVja2VkO1xuICAgICAgICAgICAgICAgIGlmIChjaGVja0ZpZWxkICYmICFjaGVja1N0cmljdGx5KSB7XG4gICAgICAgICAgICAgICAgICAgIGN0b3JfMS5kZWZhdWx0LmVhY2hUcmVlKFtyb3ddLCBmdW5jdGlvbiAocm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICByb3dbY2hlY2tGaWVsZF0gPSBjaGVja2VkO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhbGZGaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJvd1toYWxmRmllbGRdID0gZmFsc2U7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRyZWVPcHRzKTtcbiAgICAgICAgICAgICAgICAgICAgdGhpcy5jaGVja1BhcmVudE5vZGVTZWxlY3Rpb24ocm93KTtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgdGhpcy4kZW1pdCgnY2hlY2tib3gtY2hhbmdlJywgcGFyYW1zKTtcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBjaGVja1BhcmVudE5vZGVTZWxlY3Rpb246IGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2EgPSB0aGlzLCBjaGVja2JveE9wdHMgPSBfYS5jaGVja2JveE9wdHMsIHRyZWVPcHRzID0gX2EudHJlZU9wdHM7XG4gICAgICAgICAgICAgICAgdmFyIGNoaWxkcmVuID0gdHJlZU9wdHMuY2hpbGRyZW47XG4gICAgICAgICAgICAgICAgdmFyIGNoZWNrRmllbGQgPSBjaGVja2JveE9wdHMuY2hlY2tGaWVsZCwgaGFsZkZpZWxkID0gY2hlY2tib3hPcHRzLmhhbGZGaWVsZCwgY2hlY2tTdHJpY3RseSA9IGNoZWNrYm94T3B0cy5jaGVja1N0cmljdGx5O1xuICAgICAgICAgICAgICAgIHZhciBtYXRjaE9iaiA9IGN0b3JfMS5kZWZhdWx0LmZpbmRUcmVlKHRoaXMuZnVsbFRyZWVEYXRhLCBmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbSA9PT0gcm93OyB9LCB0cmVlT3B0cyk7XG4gICAgICAgICAgICAgICAgaWYgKG1hdGNoT2JqICYmIGNoZWNrRmllbGQgJiYgIWNoZWNrU3RyaWN0bHkpIHtcbiAgICAgICAgICAgICAgICAgICAgLy9AdHMtaWdub3JlXG4gICAgICAgICAgICAgICAgICAgIHZhciBwYXJlbnRSb3cgPSBtYXRjaE9iai5wYXJlbnQ7XG4gICAgICAgICAgICAgICAgICAgIGlmIChwYXJlbnRSb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIHZhciBpc0FsbCA9IHBhcmVudFJvd1tjaGlsZHJlbl0uZXZlcnkoZnVuY3Rpb24gKGl0ZW0pIHsgcmV0dXJuIGl0ZW1bY2hlY2tGaWVsZF07IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgaWYgKGhhbGZGaWVsZCAmJiAhaXNBbGwpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBwYXJlbnRSb3dbaGFsZkZpZWxkXSA9IHBhcmVudFJvd1tjaGlsZHJlbl0uc29tZShmdW5jdGlvbiAoaXRlbSkgeyByZXR1cm4gaXRlbVtjaGVja0ZpZWxkXSB8fCBpdGVtW2hhbGZGaWVsZF07IH0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICAgICAgcGFyZW50Um93W2NoZWNrRmllbGRdID0gaXNBbGw7XG4gICAgICAgICAgICAgICAgICAgICAgICB0aGlzLmNoZWNrUGFyZW50Tm9kZVNlbGVjdGlvbihwYXJlbnRSb3cpO1xuICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgdGhpcy4kcmVmcy54VGFibGUuY2hlY2tTZWxlY3Rpb25TdGF0dXMoKTtcbiAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBnZXRDaGVja2JveFJlY29yZHM6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICAgICAgICB2YXIgX2EgPSB0aGlzLCBjaGVja2JveE9wdHMgPSBfYS5jaGVja2JveE9wdHMsIHRyZWVPcHRzID0gX2EudHJlZU9wdHM7XG4gICAgICAgICAgICAgICAgdmFyIGNoZWNrRmllbGQgPSBjaGVja2JveE9wdHMuY2hlY2tGaWVsZDtcbiAgICAgICAgICAgICAgICBpZiAoY2hlY2tGaWVsZCkge1xuICAgICAgICAgICAgICAgICAgICB2YXIgcmVjb3Jkc18xID0gW107XG4gICAgICAgICAgICAgICAgICAgIGN0b3JfMS5kZWZhdWx0LmVhY2hUcmVlKHRoaXMuZnVsbFRyZWVEYXRhLCBmdW5jdGlvbiAocm93KSB7XG4gICAgICAgICAgICAgICAgICAgICAgICBpZiAocm93W2NoZWNrRmllbGRdKSB7XG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgcmVjb3Jkc18xLnB1c2gocm93KTtcbiAgICAgICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICAgICAgfSwgdHJlZU9wdHMpO1xuICAgICAgICAgICAgICAgICAgICByZXR1cm4gcmVjb3Jkc18xO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy4kcmVmcy54VGFibGUuZ2V0Q2hlY2tib3hSZWNvcmRzKCk7XG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgZ2V0Q2hlY2tib3hJbmRldGVybWluYXRlUmVjb3JkczogZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgICAgIHZhciBfYSA9IHRoaXMsIGNoZWNrYm94T3B0cyA9IF9hLmNoZWNrYm94T3B0cywgdHJlZU9wdHMgPSBfYS50cmVlT3B0cztcbiAgICAgICAgICAgICAgICB2YXIgaGFsZkZpZWxkID0gY2hlY2tib3hPcHRzLmhhbGZGaWVsZDtcbiAgICAgICAgICAgICAgICBpZiAoaGFsZkZpZWxkKSB7XG4gICAgICAgICAgICAgICAgICAgIHZhciByZWNvcmRzXzIgPSBbXTtcbiAgICAgICAgICAgICAgICAgICAgY3Rvcl8xLmRlZmF1bHQuZWFjaFRyZWUodGhpcy5mdWxsVHJlZURhdGEsIGZ1bmN0aW9uIChyb3cpIHtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChyb3dbaGFsZkZpZWxkXSkge1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHJlY29yZHNfMi5wdXNoKHJvdyk7XG4gICAgICAgICAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgICAgIH0sIHRyZWVPcHRzKTtcbiAgICAgICAgICAgICAgICAgICAgcmV0dXJuIHJlY29yZHNfMjtcbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgICAgcmV0dXJuIHRoaXMuJHJlZnMueFRhYmxlLmdldENoZWNrYm94SW5kZXRlcm1pbmF0ZVJlY29yZHMoKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH07XG4gICAgdnhldGFibGUuVnVlLmNvbXBvbmVudChvcHRpb25zLm5hbWUsIG9wdGlvbnMpO1xufVxuLyoqXG4gKiDln7rkuo4gdnhlLXRhYmxlIOihqOagvOeahOWinuW8uuaPkuS7tu+8jOWunueOsOeugOWNleeahOiZmuaLn+agkeihqOagvFxuICovXG5leHBvcnRzLlZYRVRhYmxlUGx1Z2luVmlydHVhbFRyZWUgPSB7XG4gICAgaW5zdGFsbDogZnVuY3Rpb24gKHZ4ZXRhYmxlKSB7XG4gICAgICAgIHJlZ2lzdGVyQ29tcG9uZW50KHZ4ZXRhYmxlKTtcbiAgICB9XG59O1xuaWYgKHR5cGVvZiB3aW5kb3cgIT09ICd1bmRlZmluZWQnICYmIHdpbmRvdy5WWEVUYWJsZSAmJiB3aW5kb3cuVlhFVGFibGUuVGFibGUpIHtcbiAgICB3aW5kb3cuVlhFVGFibGUudXNlKGV4cG9ydHMuVlhFVGFibGVQbHVnaW5WaXJ0dWFsVHJlZSk7XG59XG5leHBvcnRzLmRlZmF1bHQgPSBleHBvcnRzLlZYRVRhYmxlUGx1Z2luVmlydHVhbFRyZWU7XG4iXX0=
