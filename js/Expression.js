function Expression() {
	this.IsGroup = true;
	var Parent = null;
	this.getParent = function () {
		return Parent;
	};
	this.setParent = function (e) {
		Parent = e;
	};

	//FIELD VALUE
	this.Field = "";
	this.Value = "";
	this.Operation = "";
	//FIELD VALUE

	//GROUP
	this.GroupLogic = " or ";
	this.Children = [];
	//GROUP
};

//Expression.prototype.getParent = function () {
//    return Parent;
//};
//Expression.prototype.setParent = function (e) {
//    Parent = e;
//};

//GROUP
Expression.prototype.setGroup = function () {
	this.GroupLogic = " or ";
	this.IsGroup = true;
	this.Field = null;
	this.Value = null;
	this.Operation = null;
	this.Children = [];
};
Expression.prototype.addChild = function (exp) {
	this.Children.push(exp);
	exp.setParent(this);
};
Expression.prototype.insertChild = function (leftExp, rightExp) {
	var i = this.Children.indexOf(leftExp);
	this.Children.splice(i + 1, 0, rightExp);
	rightExp.setParent(this);
};
Expression.prototype.changeGroupLogic = function () {
	if (this.getParent().GroupLogic == " and ") {
		this.getParent().GroupLogic = " or ";
	} else {
		this.getParent().GroupLogic = " and ";
	}
};
Expression.prototype.getGroupLogic = function () {
	if (this.getParent().Children.indexOf(this) == 0) {
		return "";
	} else {
		return this.getParent().GroupLogic;
	}
};
Expression.prototype.getChildren = function () {
	return this.Children;
};
Expression.prototype.removeChild = function (exp) {
	var i = this.Children.indexOf(exp);
	this.Children.splice(i, 1);
	exp.setParent(null);
};
//GROUP

//FIELD VALUE
Expression.prototype.setFieldValue = function (field, value, operation) {
	this.Field = field;
	this.Value = value;
	this.Operation = operation;
	this.IsGroup = false;
	this.GroupLogic = "";
	this.Children = null;
};
Expression.prototype.removeSelf = function () {
	this.getParent().removeChild(this);
};
//FIELD VALUE

Expression.prototype.ToString = function () {
	if (!this.IsGroup) {
		return this.Field + " " + this.Operation + " " + this.Value;
	} else {
		var value = "";
		for (var i = 0; i < this.Children.length; i++) {
			var child = this.Children[i];
			if (value == "") {
				value = child.ToString();
			} else {
				value += this.GroupLogic + child.ToString();
			}
		}
		return "(" + value + ")";
	}
};

Expression.prototype.CopyFrom = function (e, parent) {
	this.IsGroup = e.IsGroup;
	this.Field = e.Field;
	this.Value = e.Value;
	this.Operation = e.Operation;
	this.GroupLogic = e.GroupLogic;
	this.setParent(parent);
	if (e.IsGroup) {
		for (var i = 0; i < e.Children.length; i++) {
			var e1 = e.Children[i];
			var ex = new Expression();
			ex.CopyFrom(e1, this);
			this.Children.push(ex);
		}
	}
	return this;
};
