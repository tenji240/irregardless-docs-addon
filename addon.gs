var HOST = "http://irregardless.ly",
    MATCH_ENDPOINT = HOST + "/rules/match",
    GUIDES_ENDPOINT =  HOST + "/collections";

function apiResponseToTips(resp){
  //nest creator attributes inside the tips array
  var tips = resp.data,
      users = resp.refs.User,
      user,
      tip;
  for(var i=0; i < tips.length; i++){
    tip = tips[i];
    user = users[tip.creator_id];
    tip.creator_name = user.name;
    tip.creator_mugshot_url = user.mugshot_url;
  }
  return tips;
}

function onOpen(e) {
  DocumentApp.getUi().createAddonMenu()
      .addItem('Start', 'showSidebar')
      .addToUi();
}

function onInstall(e) {
  onOpen(e);
}


function showSidebar() {
  var ui = HtmlService.createHtmlOutputFromFile('sidebar')
      .setTitle('Irregardless');
  DocumentApp.getUi().showSidebar(ui);
}

function getTips() {
  var text = DocumentApp.getActiveDocument().getBody().getText();
  if (text.length == 0) {

  } else {
    var params = {
      contentType: 'application/json',
      payload: JSON.stringify({body: text, collection_id: 1}),
      method: "post",
    };
    var response = UrlFetchApp.fetch(MATCH_ENDPOINT, params),
        json = response.getContentText(),
        tips = apiResponseToTips(JSON.parse(json));
    return {fullText: text, tips: tips};
  }
}