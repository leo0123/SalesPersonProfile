$(function(){
  $("[Name='SPBookmark_Sold_x0020_To_x0020_Code']").parentsUntil("tr").parent().hide();
  $("[Name='SPBookmark_Sales_x0020_Type']").parentsUntil("tr").parent().hide();
  $("[Name='SPBookmark_Year']").parentsUntil("tr").parent().hide();
  //$("[id=SPFieldText]").parent("tr:contains('Sold To Code')").hide();
  //$("[id=SPFieldText]").parent("tr:contains('Sales Type')").hide();
  //$("[id=SPFieldText]").parent("tr:contains('Year')").not(":contains('Month')").hide();
  //$("[name='SPBookmark_Sales_x0020_Type']").closest("tr").hide();
});
