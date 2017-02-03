function CustomizeExpression(field) {
	Expression.call(this);

	this.setGroup();
	this.Field = field;
	//this.GroupLogic = " and ";

	var currentChild = null;

	this.getChildGroup = function (field) {
		if (currentChild != null && currentChild.Field == field) {
			return currentChild;
		}
		if (this.Field == 'root') {
			for (var i = 0; i < this.Children.length; i++) {
				var child = this.Children[i];
				if (child.IsGroup == true && child.Field == field) {
					currentChild = child;
					return child;
				}
			}
		}
		return null;
	}

	this.createChildGroup = function (field) {
		var childGroup = new CustomizeExpression(field);
		this.addChild(childGroup);
		currentChild = childGroup;
		return childGroup;
	}
}

CustomizeExpression.prototype = Object.create(Expression.prototype);

CustomizeExpression.prototype.constructor = CustomizeExpression;
