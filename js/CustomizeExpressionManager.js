function CustomizeExpressionManager() {
	ExpressionManager.call(this);

	//var self = this;
	var expR;
	this.newRoot = function () {
		expR = new CustomizeExpression('root');
		expR.GroupLogic = " and ";
	};
	this.newRoot();
	//expR.setGroup();
	//expR.Field = 'root';
	this.setRoot = function (jsonObject) {
		expR = new CustomizeExpression('root');
		expR.GroupLogic = " and ";
		expR.CopyFrom(jsonObject, null);
	};
	this.tryParse = function (lists) {
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
	};
	fillList = function (group, list, lists) {
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
	tryParseList = function (group) {
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

	this.getRoot = function () {
		return expR;
	};
	this.getNewRoot = function () {
		this.newRoot();
		return expR;
	};

	this.addInGroup = function (field, value, operation) {
		var group = expR.getChildGroup(field);
		if (group == null) {
			group = expR.createChildGroup(field);
		}
		this.add(group, field, value, operation);
	};

	this.clearGroup = function (field) {
		var group = expR.getChildGroup(field);
		if (group != null) {
			group.Children = [];
		}
	}
}

CustomizeExpressionManager.prototype = Object.create(ExpressionManager.prototype);

CustomizeExpressionManager.prototype.constructor = CustomizeExpressionManager;
