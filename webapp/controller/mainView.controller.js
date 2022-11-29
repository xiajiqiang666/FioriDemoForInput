sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (BaseController, JSONModel) {
        "use strict";

        return BaseController.extend("zfioritest0001.controller.App", {
            onInit: function () {
                var localdata = {};
                this._ODataModel = this.getView().getModel("OData") || this.getOwnerComponent().getModel("OData");
                this._JSONModel = new JSONModel(localdata);
                this.getView().setModel(this._JSONModel);
                //--先加载搜索帮助
                this.callSearchHelp("HTvak");
                this.callSearchHelp("ZrashMdg");
                this.callSearchHelp("ZrashQyg");
                this.callSearchHelp("ZrashKunnr");
            },
            onValueHelp: function (oEvt) {
                var enitySet = "",
                    title = "",
                    key = "",
                    value = "";
                var butId = oEvt.getSource().getId().slice(oEvt.getSource().getId().lastIndexOf("--") + 2);
                switch (butId) {
                    case '__input0':
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
            onQuery() {
                this.query("SoCreateHeadSet", "soItem");
            }
        });
    });
