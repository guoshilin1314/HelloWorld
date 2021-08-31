(function (global, factory) {
  if (typeof define === "function" && define.amd) {
    define("vxe-table-plugin-virtual-tree", [], factory);
  } else if (typeof exports !== "undefined") {
    factory();
  } else {
    var mod = {
      exports: {}
    };
    factory();
    global.VXETablePluginVirtualTree = mod.exports.default;
  }
})(typeof globalThis !== "undefined" ? globalThis : typeof self !== "undefined" ? self : this, function () {
  "use strict";

  (function (global, factory) {
    if (typeof define === "function" && define.amd) {
      define("vxe-table-plugin-virtual-tree", ["exports", "xe-utils/ctor"], factory);
    } else if (typeof exports !== "undefined") {
      factory(exports, require("xe-utils/ctor"));
    } else {
      var mod = {
        exports: {}
      };
      factory(mod.exports, global.ctor);
      global.vxeTablePluginVirtualTree = mod.exports;
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
});