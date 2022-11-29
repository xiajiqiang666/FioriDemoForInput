/* =========================================================== */
/* 公用控制器（基础函数功能实现包）                                                     */
/* =========================================================== */
sap.ui.define(["sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/core/syncStyleClass",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator"
], function (Controller, UIComponent, History, Fragment, syncStyleClass, Filter, FilterOperator) {
    //---JS 严格模式
    "use strict";

    return Controller.extend("zfioritest0001.controller.BaseController", {
        //---格式
        // formatter: formatter,

        //--搜索幫助
        valueHelpRequest: function (enitySet, title, key, value, oView, oButton) {
            this.InputId = oButton.getId();
            var enitySetName = '/' + enitySet + 'Set';
            var definition =
                '<core:FragmentDefinition xmlns="sap.m" xmlns:core="sap.ui.core"><SelectDialog title=' + title + ' items="{/' + enitySetName + '}"'
                + ' search=".onValueHelpSearch" confirm=".onValueHelpClose" cancel=".onValueHelpClose"><StandardListItem iconDensityAware="false" iconInset="false"'
                + ' title=' + key + ' description=' + value + '/></SelectDialog></core:FragmentDefinition>';
            this.callSearchHelp(enitySet);
            this._pDialog = Fragment.load({
                type: "XML",
                definition: definition,
                controller: this
            }).then(function (oDialog) {
                oDialog.setModel(oView.getModel());
                oDialog.getBinding("items").sPath = enitySetName;
                return oDialog;
            });
            this._pDialog.then(function (oDialog) {
                this._configDialog(oButton, oDialog);
                oDialog.open();
            }.bind(this));
        },
        //--弹出框设置
        _configDialog: function (oButton, oDialog) {
            // Multi-select if required
            var bMultiSelect = !!oButton.data("multi");
            oDialog.setMultiSelect(bMultiSelect);

            var sCustomConfirmButtonText = oButton.data("confirmButtonText");
            oDialog.setConfirmButtonText(sCustomConfirmButtonText);

            // Remember selections if required
            var bRemember = !!oButton.data("remember");
            oDialog.setRememberSelections(bRemember);

            //add Clear button if needed
            var bShowClearButton = !!oButton.data("showClearButton");
            oDialog.setShowClearButton(bShowClearButton);

            // Set growing property
            var bGrowing = oButton.data("growing");
            oDialog.setGrowing(bGrowing == "true");

            // Set growing threshold
            var sGrowingThreshold = oButton.data("threshold");
            if (sGrowingThreshold) {
                oDialog.setGrowingThreshold(parseInt(sGrowingThreshold));
            }

            // Set draggable property
            var bDraggable = !!oButton.data("draggable");
            oDialog.setDraggable(bDraggable);

            // Set draggable property
            var bResizable = !!oButton.data("resizable");
            oDialog.setResizable(bResizable);

            // Set style classes
            var sResponsiveStyleClasses = "sapUiResponsivePadding--header sapUiResponsivePadding--subHeader sapUiResponsivePadding--content sapUiResponsivePadding--footer";
            var bResponsivePadding = !!oButton.data("responsivePadding");
            oDialog.toggleStyleClass(sResponsiveStyleClasses, bResponsivePadding);

            // clear the old search filter
            oDialog.getBinding("items").filter([]);

            // toggle compact style
            syncStyleClass("sapUiSizeCompact", this.getView(), oDialog);
        },
        //--搜索帮助-搜索
        onValueHelpSearch: function (oEvent) {
            var sValue = oEvent.getParameter("value");
            var oFilters = [];
            if (oEvent.getParameter("itemsBinding").oList && !$.isEmptyObject(oEvent.getParameter("itemsBinding").oList)) {
                var filter = new Filter();
                var keys = Object.keys(oEvent.getParameter("itemsBinding").oList[0]);
                for (var i in keys) {
                    if (i > 0) {
                        filter = new Filter(keys[i], FilterOperator.Contains, sValue);
                        oFilters.push(filter);
                    }
                }
            }
            var oFilter = new Filter({
                filters: oFilters,
                and: false
            });
            var oBinding = oEvent.getParameter("itemsBinding");
            oBinding.filter([oFilter]);
        },
        //--搜索帮助-关闭时
        onValueHelpClose: function (oEvent) {
            var selectedItem = oEvent.getParameter("selectedItem");
            if (selectedItem) {
                var Value = selectedItem.getTitle();
                var description = selectedItem.getDescription();
                if (Value) {
                    this.byId(this.InputId).setValue(Value);
                    this.byId(this.InputId).setDescription(description);
                } else {
                    MessageToast.show("No new item was selected.");
                }
                oEvent.getSource().getBinding("items").filter([]);
            }
        },
        //--搜索帮助ODATA
        callSearchHelp: function (sName, aFilter, aSorter, fnSuccess, fnError) {
            sName = sName + "Set";
            var sUrl = "/" + sName;
            var iQueryMaxhints = this._JSONModel.getProperty("/appProperties/queryMaxhints");
            if (!iQueryMaxhints || iQueryMaxhints === "" || iQueryMaxhints === 0) {
                iQueryMaxhints = 9999;
            }
            var mParameters = {
                urlParameters: {
                    $top: iQueryMaxhints,
                    $skip: 0
                },
                filters: aFilter,
                sorters: aSorter,
                success: function (oData, response) {
                    var localData = this._JSONModel.getData();
                    localData[sName] = oData.results;
                    this._JSONModel.setProperty("/", localData, false);
                    if (fnSuccess) {
                        fnSuccess(this._Controller);
                    }
                }.bind(this),
                error: function (oError) {
                    this._Controller.oError = oError;
                    if (fnError) {
                        fnError(this._Controller);
                    }
                }.bind(this)
            };
            this._ODataModel.read(sUrl, mParameters);
        },
        //--通用查询ODATA
        query: function (enitySetName, sName, aFilter, aSorter, fnSuccess, fnError) {
            var sUrl = "/" + enitySetName;
            var iQueryMaxhints = this._JSONModel.getProperty("/appProperties/queryMaxhints");
            if (!iQueryMaxhints || iQueryMaxhints === "" || iQueryMaxhints === 0) {
                iQueryMaxhints = 9999;
            }
            var mParameters = {
                urlParameters: {
                    $top: iQueryMaxhints,
                    $skip: 0
                },
                filters: aFilter,
                sorters: aSorter,
                success: function (oData, response) {
                    var localData = this._JSONModel.getData();
                    localData[sName] = oData.results;
                    this._JSONModel.setProperty("/", localData, false);
                    if (fnSuccess) {
                        fnSuccess(this._Controller);
                    }
                }.bind(this),
                error: function (oError) {
                    this._Controller.oError = oError;
                    if (fnError) {
                        fnError(this._Controller);
                    }
                }.bind(this)
            };
            this._ODataModel.read(sUrl, mParameters);
        },
        //--选择了selectItem里的数据后触发
        onSuggestionItemSelected: function (oEvent) {
            var oItem = oEvent.getParameter("selectedRow");
            oEvent.getSource().setValue(oItem.getCells()[0].getText());
            //--form里面的带出描述,表中不带出描述
            if (oEvent.getSource().getParent() && oEvent.getSource().getParent().sParentAggregationName) {
            } else {
                oEvent.getSource().setDescription(oItem.getCells()[1].getText());
            }
        },
        //--字段修改事件:为空时清空描述
        onChange: function (oEvent) {
            if (oEvent.getSource().getValue() == "") {
                this.byId(oEvent.getParameter("id")).setDescription("");
            }
        },
        //---获取EventBus
        getEventBus: function () {
            return this.getOwnerComponent().getEventBus();
        },

        //---获取Router(路由实例)
        getRouter: function () {
            return UIComponent.getRouterFor(this);
        },

        //---获取RouterId(路由Id)
        getRouterID: function () {
            var oHC = this.getRouter().oHashChanger;
            if (oHC.privgetCurrentShellHash) {
                var sHash = oHC.privgetCurrentShellHash().hash;
                var s = oHC.privstripLeadingHash(sHash).split("-")[0];
                s = s && s === "Shell-home" ? null : s;
                return s;
            }
        },

        //跳转到其他页面
        navTo: function (sName) {
            return sName == null ? null : this.getRouter().navTo(sName);
        },

        //跳转到其他页面（前提是该页面已经发布到Fiori launchpad）
        turnTo: function (sName) {
            // get a handle on the global XAppNav service
            var oCrossAppNavigator = sap.ushell.Container.getService(
                "CrossApplicationNavigation"
            );
            var hash =
                (oCrossAppNavigator &&
                    oCrossAppNavigator.hrefForExternal({
                        target: {
                            semanticObject: sName,
                            action: "display"
                        }
                        //				params: {
                        //					"supplierID": supplier
                        //				}
                    })) ||
                ""; // generate the Hash to display

            oCrossAppNavigator.toExternal({
                target: {
                    shellHash: hash
                }
            }); // navigate to other application
        },

        //---获取模型
        getModel: function (sName) {
            return this.getView().getModel(sName) || this.getOwnerComponent().getModel(sName);
        },

        // 获取OData元数据
        getODataMetadata: function (sName) {
            if (sName == "") {
                return null;
            }
            var oMetaData = this.getModel().getProperty("/ODataMetadata");
            return oMetaData[sName];
        },

        // 校验必输
        checkValueInput: function (checkId) {
            var form = this.byId(checkId);
            var containers = form.getFormContainers();
            var state = "";

            for (var i = 0; i < containers.length; i++) {
                var elements = containers[i].getFormElements();
                for (var j = 0; j < elements.length; j++) {
                    var element = elements[j].getFields()[0];
                    if (typeof element.getRequired == "function") {
                        if (element.getRequired()) {
                            if (element.getValue()) {
                                element.setValueState("None");
                            } else {
                                element.setValueState("Error");
                                state = "E";
                            }
                        }
                    }
                }
            }

            return state;
        },

        //---获取OData服务EntityType
        getEntityTypeByName: function (sODataName, sEntityTypeName) {
            if (!this.getODataMetadata(sODataName)) {
                return null;
            }
            return this.getODataMetadata(sODataName)._getEntityTypeByName(sEntityTypeName);
        },

        //---设置模型
        setModel: function (oModel, sName) {
            return this.getView().setModel(oModel, sName);
        },

        //---获取资源包
        getResourceBundle: function () {
            return this.getOwnerComponent().getModel("i18n").getResourceBundle();
        },

        //---设置busy状态
        setBusy: function (b) {
            this.getModel().setProperty("/appProperties/busy", b);
        },

        //---设置bcode的值(同步方式)
        setbcode: function (v) {
            this.getModel().setProperty("/appProperties/bcode", v, false);
        },

        //---获取bcode的值
        getbcode: function (v) {
            return this.getModel().getProperty("/appProperties/bcode");
        },

        //---设置fcode的值(同步方式)
        setfcode: function (v) {
            this.getModel().setProperty("/appProperties/fcode", v, false);
        },

        //---是否是E类型消息
        isError: function (oContext) {
            var iCounterE = oContext.getModel().getProperty("/messages/counterE");
            return iCounterE > 0 ? true : false;
        },

        //---页面左上角message按钮弹框
        openMessagePopover: function (oContext) {
            if (oContext._MessageButton && this.isError(oContext)) {
                oContext._MessageButton.firePress();
            }
        },
        //--获取列值 
        getColumnValue: function (list, name) {
            for (var i in list) {
                if (list[i].getBinding("value") && name == list[i].getBinding("value").sPath) {
                    return list[i].getBinding("value").oValue;
                }
            }
        },
        //-设置列值 
        setColumnValue: function (list, name, value) {
            for (var i in list) {
                if (list[i].getBinding("value") && name == list[i].getBinding("value").sPath) {
                    // return list[i].getBinding("value").oValue;
                    list[i].setValue(value);
                    return;
                }
            }
        },
        //-设置列n可见
        setColumnVisible: function (list, name, visible) {
            for (var i in list) {
                if (list[i].getProperty("filterProperty") && name == list[i].getProperty("filterProperty")) {
                    // return list[i].getBinding("value").oValue;
                    list[i].setVisible(visible);
                    return;
                }
            }
        },
        //---返回消息处理
        updateObligatory: function () {
            var oObligatory = {};
            var aReturn = this.getModel().getProperty("/returns");
            for (var i = 0; i < aReturn.length; i++) {
                if (aReturn[i].MessageV1 != "" && aReturn[i].Type == "E") {

                    var oR = {
                        Id: aReturn[i].Id,
                        LogMsgNo: aReturn[i].LogMsgNo,
                        LogNo: aReturn[i].LogNo,
                        Message: aReturn[i].Message,
                        MessageV1: aReturn[i].MessageV1,
                        MessageV2: aReturn[i].MessageV2,
                        MessageV3: aReturn[i].MessageV3,
                        MessageV4: aReturn[i].MessageV4,
                        Number: aReturn[i].Number,
                        Row: aReturn[i].Row,
                        System: aReturn[i].System
                    };

                    if (aReturn[i].MessageV2 != "") {
                        if (!oObligatory[aReturn[i].MessageV1]) {
                            oObligatory[aReturn[i].MessageV1] = {};
                        }
                        oObligatory[aReturn[i].MessageV1][aReturn[i].MessageV2] = oR;
                    }

                    if (aReturn[i].MessageV2 == "") {
                        oObligatory[aReturn[i].MessageV1] = oR;
                    }

                }
            }
            this.getModel().setProperty("/verReturn", oObligatory, false);

        },

        //---清除组件上必输错误状态标记
        clearInputRequiredErrorStatus: function (oEvent) {
            var sRootPath = "/verReturn";
            var sPath = oEvent.getSource().getBinding("valueState").sPath;
            if (sPath == "") {
                var aBindings = oEvent.getSource().getBinding("valueState").aBindings;
                sPath = aBindings[0].sPath + "/" + aBindings[1].oValue;
            }
            var oVerReturn = this._JSONModel.getProperty(sRootPath);
            sPath = sPath.replace(sRootPath + "/", "");
            var aKey = sPath.split("/", 2);
            if (aKey.length == 1) {
                delete oVerReturn[aKey[0]];
            }
            if (aKey.length == 2) {
                delete oVerReturn[aKey[0]][aKey[1]];
                // 表格中错误状态无法自动置空，需强制清理
                oEvent.getSource().setValueState("None");
            }
            this._JSONModel.setProperty(sRootPath, oVerReturn, false);
        },

        //---获取页面的聚合内容
        getPage: function () {
            var oView = this.getView();
            if (oView.getMetadata()._sClassName != "sap.ui.core.mvc.XMLView") {
                return null;
            }
            if (!oView.getContent() || oView.getContent().length == 0) {
                return null;
            }
            if (oView.getContent()[0].getMetadata()._sClassName != "sap.m.Page") {
                return null;
            }
            return oView.getContent()[0];
        },

        //---生成32位随机数
        createGUID: function () {
            var g = "";
            var i = 32;
            while (i--) {
                g += Math.floor(Math.random() * 16.0).toString(16);
            }
            return g;
        },

        //---重写克隆方法
        clone: function (obj, sub) {
            var o;
            if (obj.constructor == Object) {
                o = new obj.constructor();
            } else {
                o = new obj.constructor(obj.valueOf());
            }
            for (var key in obj) {
                if (o[key] != obj[key]) {
                    if (typeof (obj[key]) == 'object') {
                        o[key] = this.clone(obj[key]);
                    } else {
                        o[key] = obj[key];
                    }
                }
            }
            o.toString = obj.toString;
            o.valueOf = obj.valueOf;
            return o;
        },

        //---返回事件
        onNavBack: function () {
            if (History.getInstance().getPreviousHash() !== undefined) {
                history.go(-1);
            } else {
                this.getRouter().navTo("", {}, true);
            }
        }

    });
});