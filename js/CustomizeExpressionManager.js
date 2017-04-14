var ExpressionManager = require("./ExpressionManager.js");
var CustomizeExpression = require("./CustomizeExpression.js");

function CustomizeExpressionManager() {
  ExpressionManager.call(this);

  //var self = this;
  var expR;
  var expSR;
  this.newRoot = function() {
    expR = new CustomizeExpression('root');
    expR.GroupLogic = " and ";
  };
  this.newRoot();
  //expR.setGroup();
  //expR.Field = 'root';
  this.setRoot = function(jsonObject) {
    var exp = new CustomizeExpression();
    exp.CopyFrom(jsonObject, null);
		if (exp.IsGroup && exp.Field == "SuperRoot") {
			expSR = exp;
			for (var i in exp.Children) {
				var e = exp.Children[i];
				if (e.IsGroup && e.Field == "root") {
					expR = e;
				}
			}
		} else if (exp.IsGroup && exp.Field == "root") {
      expR = exp;
    } else {
      expR = new CustomizeExpression('root');
      expR.GroupLogic = " and ";
      expR.addChild(exp);
    }
    /*expR = new CustomizeExpression('root');
    expR.GroupLogic = " and ";
    expR.CopyFrom(jsonObject, null);
    expR.Field = "root";*/
  };

  this.tryParse = function(lists) {
    if (expR.Field != 'root' || expR.IsGroup != true) {
      return
    } else {
      for (var i = 0; i < expR.Children.length; i++) {
        var group = expR.Children[i];
        if (group.IsGroup == false || group.GroupLogic != ' or ') {
          continue;
        } else {
          var list = tryParseList(group);
          if (list != null) {
            fillList(group, list, lists);
          }
        }
      }
    }

    function fillList(group, list, lists) {
      var selectedList;
      switch (group.Field) {
        case 'BG':
          selectedList = lists.selectedBG;
          break;
        case 'ProfitCenter':
          selectedList = lists.selectedProfitCenter;
          break;
        case 'SalesP':
          selectedList = lists.selectedSalesP;
          break;
        case '[End Customer]':
          selectedList = lists.selectedEndCustomer;
          break;
        case 'CustName':
          selectedList = lists.selectedSoldToCustomer;
          break;
        case 'Office':
          selectedList = lists.selectedOffice;
          break;
        case '[Sales Office]':
          selectedList = lists.selectedSalesOffice;
          break;
        case '[Sales Type]':
          selectedList = lists.selectedSalesType;
          break;
      }
      for (var i = 0; i < list.length; i++) {
        selectedList.push(list[i]);
      }
    };

    function tryParseList(group) {
      var list = [];
      for (var i = 0; i < group.Children.length; i++) {
        var child = group.Children[i];
        if (child.IsGroup == true || child.Field != group.Field) {
          return;
        } else {
          list.push(child.Value);
        }
      }
      return list;
    };
  };

  this.getRoot = function() {
    return expR;
  };
  this.getSuperRoot = function(BG) {
    if (expSR) {
      expR.tryRemoveSelf();
      return expSR;
    }
    expSR = new CustomizeExpression("SuperRoot");
    expSR.IsGroup = true;
    expSR.addChild(expR);
    expR.tryRemoveSelf();
    var expBG = new CustomizeExpression();
    expBG.setFieldValue("BG", BG);
    expSR.addChild(expBG);
    return expSR;
  };
  this.getNewRoot = function() {
    this.newRoot();
    return expR;
  };

  this.addInGroup = function(field, value, operation) {
    var group = expR.getChildGroup(field);
    if (group == null) {
      group = expR.createChildGroup(field);
    }
    this.add(group, field, value, operation);
  };

  this.clearGroup = function(field) {
    var group = expR.getChildGroup(field);
    if (group != null) {
      group.Children = [];
    }
  }
}

CustomizeExpressionManager.prototype = Object.create(ExpressionManager.prototype);

CustomizeExpressionManager.prototype.constructor = CustomizeExpressionManager;

module.exports = CustomizeExpressionManager;
