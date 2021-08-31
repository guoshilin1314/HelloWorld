



// 功能：以表格视图显示向量、矩阵数据
// 消息：
//   resViewData: ts->js，message：
//      {
//        content: NArrayData, //数组数据对象 {mtx：RowData[] //矩阵或向量数据 向量为n×1矩阵 (RowData : values: string[] <数据>; nodes: WorkspaceVariable[] <变量>
//                                            text: string //多维文本数据 ;  ndims: integer[] //维度大小}
//        node: WorkspaceVariable //变量节点
//      }
//   notifyPanelNeedUpdate: ts->js ,message:
//      {
//        value :key //模板对象的key，用于请求数据
//      }
//   reqOpenDataView: js -> ts，message：
//       {
//           value：node //节点对象
//       }


// This script will be run within the webview itself
// It cannot access the main VS Code APIs directly.



(function () {
    var Main = {
        data() {
            return {
                a:'sdasd',
                tableColumn: [
                    { field: 'name', title: 'Name', treeNode: true },
                    { field: 'size', title: 'Size' },
                    { field: 'type', title: 'Type' },
                    { field: 'date', title: 'Date' }
                ],
                tableData: [
                    { id: '101', name: '文档1', size: 12, type: 'xlsx', date: '2019-12-12' },
                    {
                        id: '102',
                        name: '文件夹',
                        size: 12,
                        type: '',
                        date: '2019-12-12',
                        children: [
                            { id: '103', name: '文档3', size: 12, type: 'avi', date: '2019-12-12' },
                        ]
                    }
                ]
            }
        },
        methods: {
        },
        created() {


        },
        mounted() {

        }

    };
    // @ts-ignore
    var app = new Vue(Main).$mount('#app')
 
    
    
}());
