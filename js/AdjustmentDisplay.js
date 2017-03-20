$(function(){
  $("[id=SPFieldText]").parent("tr:contains('Sold To Code')").hide();
  $("[id=SPFieldText]").parent("tr:contains('Sales Type')").hide();
  $("[id=SPFieldText]").parent("tr:contains('Year')").not(":contains('Month')").hide();
  //$("[name='SPBookmark_Sales_x0020_Type']").closest("tr").hide();
});
