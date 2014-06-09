var HOST = "http://irregardless.ly",
    MATCH_ENDPOINT = HOST + "/rules/match",
    GUIDES_ENDPOINT =  HOST + "/collections";

function highlight(tip){
  var body = DocumentApp.getActiveDocument().getBody(),
      text = body.editAsText(),
      range = body.findText(tip.match_string);
  if(!range){
    range = body.findText(tip.matched_string);
  }
  text.setBackgroundColor(range.getStartOffset(), range.getEndOffsetInclusive(), '#FFFF00');
  return true;
}

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

function saveGuide(guideId){
  userStore = PropertiesService.getUserProperties();
  userStore.setProperty('style_guide_id', guideId);

  return {guides: JSON.parse(userStore.getProperty('all_guides')),
          chosenGuideId: Number(userStore.getProperty('style_guide_id'))};
}

function getGuides(){
  var response = UrlFetchApp.fetch(GUIDES_ENDPOINT),
      json = response.getContentText(),
      userStore = PropertiesService.getUserProperties();

  userStore.setProperty('all_guides', JSON.stringify(JSON.parse(json).data));

  return {guides: JSON.parse(userStore.getProperty('all_guides')),
          chosenGuideId: Number(userStore.getProperty('style_guide_id'))};
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
  var text = DocumentApp.getActiveDocument().getBody().getText(),
      collectionId = PropertiesService.getUserProperties().getProperty('style_guide_id');

  if (text.length === 0) {
    return {error: "noText"};
  } else {
    var params = {
      contentType: 'application/json',
      payload: JSON.stringify({body: text, collection_id: Number(collectionId)}),
      method: "post",
    };
    var response = UrlFetchApp.fetch(MATCH_ENDPOINT, params),
        json = response.getContentText();

    return { fullText: text,
             tips: apiResponseToTips(JSON.parse(json))};
  }
}