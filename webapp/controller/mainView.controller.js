sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    'sap/base/util/deepExtend'
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel, deepExtend) {
        "use strict";

        return BaseController.extend("zfioritest0001.controller.App", {
            onInit: function () {
                var localdata = {};
                this._ODataModel = this.getView().getModel("OData") || this.getOwnerComponent().getModel("OData");
                this._JSONModel = new JSONModel(localdata);
                this.getView().setModel(this._JSONModel);
                //--先加载搜索帮助(Suggestion Item使用)
                this.callSearchHelp("HTvak");
                this.callSearchHelp("ZrashMdg");
                this.callSearchHelp("ZrashQyg");
                this.callSearchHelp("ZrashKunnr");
                //--默认是显示状态
                this._JSONModel.setProperty("/uiTable", { edit: false, display: true });
                this._JSONModel.setProperty("/mTable", { edit: false, display: true });
                //--sap.m.table 默认不可编辑
                this.oReadOnlyTemplate = this.byId("mTable").removeItem(0);
                this.rebindTable("mTable", this.oReadOnlyTemplate, "Navigation");
                //--可编辑的模板定义
                this.oEditableTemplate = new sap.m.ColumnListItem({
                    cells: [
                        new sap.m.ObjectIdentifier({
                            title: "{Vbeln}",
                            text: "{Zstatus}",
                        }), new sap.m.Input({
                            value: "{Kunnr}",
                            class: "inputLowHigh"
                        }), new sap.m.Input({
                            value: "{Auart}",
                            class: "inputLowHigh"
                        }), new sap.m.Input({
                            value: "{Erdat}"
                        }), new sap.m.Input({
                            value: "{Kunwe_ana}",
                            class: "inputLowHigh"
                        })
                    ]
                });
            },
            //--点击搜索帮助按钮
            onValueHelp: function (oEvt) {
                var enitySet = "",
                    title = "",
                    key = "",
                    value = "",
                    butId = "";
                if (oEvt.getSource().getId().lastIndexOf("--") !== -1) {
                    butId = oEvt.getSource().getId().slice(oEvt.getSource().getId().lastIndexOf("--") + 2);
                } else {
                    butId = oEvt.getSource().getBindingInfo("value").binding.sPath;
                }
                switch (butId) {
                    case '__input0':
                    case 'Auart':
                        enitySet = "HTvak";
                        title = "\"订单类型\"";
                        key = "\"{Auart}\"";
                        value = "\"{Bezei}\"";
                        break;
                    case '__input1':
                        enitySet = "ZrashMdg";
                        title = "\"目的港\"";
                        key = "\"{Kvgr1}\"";
                        value = "\"{Bezei}\"";
                        break;
                    case '__input2':
                        enitySet = "ZrashQyg";
                        title = "\"启运港\"";
                        key = "\"{Kvgr2}\"";
                        value = "\"{Bezei}\"";
                        break;
                    case '__input3':
                        enitySet = "ZrashKunnr";
                        title = "\"客户\"";
                        key = "\"{Kunnr}\"";
                        value = "\"{Name1}\"";
                        break;
                    default:
                        break;
                }
                this.valueHelpRequest(enitySet, title, key, value, this.getView(), oEvt.getSource())
            },
            //--查询表格数据
            onQuery() {
                this.query("SoCreateHeadSet", "soItem");
            },
            //--点击编辑按钮
            onEdit: function () {
                this._JSONModel.setProperty("/uiTable", { edit: true, display: false });
            },
            //--点击显示按钮
            onDisplay: function () {
                this._JSONModel.setProperty("/uiTable", { edit: false, display: true });
            },
            //--点击编辑按钮
            onEditm: function () {
                this._JSONModel.setProperty("/mTable", { edit: true, display: false });
                this.rebindTable("mTable", this.oEditableTemplate, "Edit");
            },
            //--点击显示按钮
            onDiaplaytm: function () {
                this._JSONModel.setProperty("/mTable", { edit: false, display: true });
                this.rebindTable("mTable", this.oReadOnlyTemplate, "Navigation");
            },
            //-重新绑定Table的模板     
            rebindTable: function (tableId, oTemplate, sKeyboardMode) {
                this.byId(tableId).bindItems({
                    path: "/soItem",
                    template: oTemplate,
                    templateShareable: true,
                    key: "Vbeln"
                }).setKeyboardMode(sKeyboardMode);
            },
        });
    });
