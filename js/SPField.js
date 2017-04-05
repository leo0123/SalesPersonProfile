var mySPField = {};

var constructorList = {};
constructorList.SPTEXTField = SPTEXTField;
constructorList.SPCHECKField = SPCHECKField;
constructorList.SPARRAYField = SPARRAYField;

mySPField.factory = function(title, type = "text", ngField) {
    type = "SP" + type.toUpperCase() + "Field";
    var spField = new constructorList[type](title, ngField);
    return spField;
};

function SPField(title, type = "text", ngField) {
    this.title = title;
    this.type = type;
    this.ngField = ngField;
};
SPField.prototype.initControl = function($) {
    if (!this.control) {
        this.control = $("[title='" + this.title + "']");
    }
};
SPField.prototype.getValue = function() {
    return this.control.val();
};
SPField.prototype.setValue = function(value) {
    this.control.val(value);
};

function SPTEXTField(title, ngField) {
    SPField.call(this, title, "text", ngField);
};
SPTEXTField.prototype = Object.create(SPField.prototype);
SPTEXTField.prototype.constructor = SPTEXTField;

function SPCHECKField(title, ngField) {
    SPField.call(this, title, "checkbox", ngField);
};
SPCHECKField.prototype = Object.create(SPField.prototype);
SPCHECKField.prototype.constructor = SPCHECKField;
SPCHECKField.prototype.getValue = function() {
    return this.control.prop("checked");
};
SPCHECKField.prototype.setValue = function(value) {
    this.control.prop("checked", value);
};

function SPARRAYField(title, ngField) {
    SPField.call(this, title, "array", ngField);
};
SPARRAYField.prototype = Object.create(SPField.prototype);
SPARRAYField.prototype.constructor = SPARRAYField;
SPARRAYField.prototype.getValue = function() {
    var v = this.control.val();
    v = v ? v.split(",") : [];
    return v;
};
SPARRAYField.prototype.setValue = function(value) {
    this.control.val(value);
};

module.exports = mySPField;
