var Expression=require("./Expression.js");

var ParseSqlHelper = function () {
	var opEqual = "=";
	var opLike = "like";
	var opIn = "in";
	var opList = [opEqual, opIn, opLike];
	var comma = ",";
	var fList = []; //should be lower case
	var fList1 = ["bg", "salesp", "profitcenter", "office"]; //without []
	var fList2 = ["[end customer]", "[sales office]", "[sales type]"]; //with []
	(function fillFieldList() {
		for (var i = 0; i < fList1.length; i++) {
			fList.push(fList1[i]);
		}
		for (var i = 0; i < fList2.length; i++) {
			fList.push(fList2[i]);
		}
	})();
	var lgAnd = "and";
	var lgOr = "or";
	var lgList = [lgAnd, lgOr];
	var pValue = "\\'[a-z0-9\\-\\s\\.\\&\\%]*\\'";
	var pLeft = "(";
	var pRight = ")";

	var sql;
	var stack;
	var status;

	(function test() {
		//ParseSql("ProfitCenter LIKE 'TAA%'");
	})();

	function log(str) {
		console.log(str);
	};

	function pWord(e) {
		return "\\b" + e + "\\b";
	};
	function nWord(e) {
		return "\\" + e;
	};
	function getReg() {
		var words = pWord(lgAnd)
			 + "|" + pWord(lgOr)
			 + "|" + nWord(pLeft)
			 + "|" + nWord(pRight)
			 + "|" + nWord(opEqual)
			 + "|" + pWord(opLike)
			 + "|" + pWord(opIn)
			 + "|" + nWord(comma);
		for (var i = 0; i < fList1.length; i++) {
			words += "|" + pWord(fList1[i]);
		}
		for (var i = 0; i < fList2.length; i++) {
			var w = fList2[i];
			w = w.replace(/\[/, "\\[");
			w = w.replace(/\]/, "\\]");
			w = w.replace(/\s/, "\\s");
			words += "|" + w;
		}
		words += "|" + pValue;
		return words;
	};

	this.ParseSql = function (oSql) {
		sql = "(" + oSql + ")";
		stack = [];
		var i = 0;
		var reg = new RegExp(getReg(), "i");
		while (i < 99) { //prevent endless loop
			i++;
			if (sql.length == 0) {
				break;
			}
			ParseAnyOne(reg);
			log(stack);
			log(sql);
		}
		if (stack.length != 1) {
			log(stack);
			return null;
		}
		if (sql.length > 0) {
			log(sql);
			return null;
		}
		try {
			log(stack[0].ToString());
		} catch (e) {
			return null;
		}
		return stack[0];
	};

	function ParseAnyOne(reg) {
		sql = trimStart(" ", sql);
		if (sql.length == 0) {
			return;
		}
		var rList = reg.exec(sql);
		if (rList.index == 0) {
			stack.push(rList[0]);
			sql = sql.substring(rList[0].length);
			if (stack[stack.length - 1] == pRight) {
				if (tryGetOneInGroup() == false && tryGetOneLgGroup() == false) {
					throw "fail parse )";
				}
			}
		} else {
			throw "not match reg";
		}
	};

	function tryGetOneFieldValue() {
		var i = stack.length - 1;
		var value = stack[i];
		if (isValue(value)) {
			var op = stack[i - 1];
			if (isOp(op)) {
				var field = stack[i - 2];
				if (isField(field)) {
					stack.pop();
					stack.pop();
					stack.pop();
					var exp = new Expression();
					exp.setFieldValue(field, value, op);
					stack.push(exp);
					return true;
				}
			}
		}
		return false;
	};
	function tryGetOneInGroup() {
		var i = stack.length - 1;
		var right = stack[i];
		if (right == pRight) {
			var value = stack[i - 1];
			if (isValue(value)) {
				var t = stack[i - 2];
				if (t == comma || t == pLeft) {
					getOneInGroup();
					return true;
				}
			}
		}
		return false;
	};
	function tryGetOneLgGroup() {
		var right = stack.pop();
		if (right == pRight) {
			tryGetOneFieldValue();
			stack.push(right);
			var i = stack.length - 1;
			var exp = stack[i - 1];
			if (exp instanceof Expression) {
				getOneLgGroup();
				return true;
			}
		}
		return false;
	};
	function getOneLgGroup() {
		//var list = [];
		var group = new Expression();
		group.setGroup();
		var lg = null;
		do {
			item = stack.pop();
			if (isLg(item)) {
				if (lg == null) {
					lg = item;
					group.GroupLogic = formatLg(lg);
				} else if (lg != item) {
					throw "complex group logic";
				}
			} else if (isValue(item)) {
				stack.push(item);
				if (tryGetOneFieldValue() == false) {
					throw "tryGetOneFieldValue fail";
				}
			} else if (item instanceof Expression) {
				group.addChild(item);
			} else if (item == pLeft) {
				//list.shift();//delete)
				pushExp(group);
				return;
			} else if (item == pRight) {
				//list.push(item);//save)
			} else {
				throw "getOneLgGroup fail";
			}
		} while (stack.length > 0)
	};
	function getOneInGroup() {
		var list = [];
		var item;
		do {
			item = stack.pop();
			if (isValue(item)) {
				list.push(item);
			} else if (isField(item)) {
				var group = new Expression();
				group.setGroup();
				var field = item;
				var exp;
				var value;
				do {
					value = list.pop();
					exp = new Expression();
					exp.setFieldValue(field, value, opEqual);
					group.addChild(exp);
				} while (list.length > 0)
				pushExp(group);
				return;
			} else if (item == comma || isOpIn(item) || item == pLeft || item == pRight) {
				continue;
			} else {
				throw "getOneInGroup fail";
				return;
			}
		} while (stack.length > 0)
		throw "getOneInGroup fail";
	};
	function pushExp(group) {
		if (group.Children.length == 1) {
			var exp = group.Children[0];
			exp.removeSelf();
			stack.push(exp);
		} else if (group.Children.length == 0) {
			//nothing to do
		} else {
			stack.push(group);
		}
	};

	function isLg(e) {
		if (typeof e == "string" && lgList.indexOf(e.toLowerCase()) >= 0) {
			return true;
		} else {
			return false;
		}
	};
	function isField(e) {
		if (typeof e == "string" && fList.indexOf(e.toLowerCase()) >= 0) {
			return true;
		} else {
			return false;
		}
	};
	function isOp(e) {
		if (typeof e == "string" && opList.indexOf(e.toLowerCase()) >= 0) {
			return true;
		} else {
			return false;
		}
	};
	function isOpIn(e) {
		if (typeof e == "string" && e.toLowerCase() == opIn) {
			return true;
		} else {
			return false;
		}
	};
	function isValue(e) {
		if (typeof e == "string" && e.indexOf("'") == 0) {
			return true;
		} else {
			return false;
		}
	};
	function formatLg(e) {
		return " " + e + " ";
	};

	function trimStart(character, string) {
		var startIndex = 0;
		while (string[startIndex] === character) {
			startIndex++;
		}
		return string.substr(startIndex);
	}
}

module.exports=ParseSqlHelper;
