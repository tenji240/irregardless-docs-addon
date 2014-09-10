var HOST = "https://api.irregardless.ly/api/v1",
    API_KEY = "3tkaamd9zazzwa27z4x6xmns",
    MATCH_ENDPOINT = HOST + "/rules/match?api_key=" + API_KEY,
    GUIDES_ENDPOINT = HOST + "/style_guides?api_key=" + API_KEY;

function highlight(tip){
  var background = '#FFFF00',
      body = DocumentApp.getActiveDocument().getBody(),
      search = body.findText('googler');

  while (search !== null) {
    var searchEl = search.getElement();
    var searchElText = searchEl.asText();

    searchElText.setBackgroundColor(search.getStartOffset(), search.getEndOffsetInclusive(),background);

    // search for next match
    search = body.findText('googler', search);
  }
}

function underline(tip){
  var body = DocumentApp.getActiveDocument().getBody(),
      text = body.editAsText(),
      range = body.findText(tip.match_string);
  if(!range){
    range = body.findText(tip.matched_string);
  }
  text.setUnderline(range.getStartOffset(), range.getEndOffsetInclusive(), true);
  return true;
}

function applyTip(tip, replace){
  underline(tip);
  var body = DocumentApp.getActiveDocument().getBody();
  body.replaceText(tip.match_string, replace);
  body.replaceText(tip.matched_string, replace);
  return true;
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

  userStore.setProperty('all_guides', JSON.stringify(JSON.parse(json)));

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
             tips: JSON.parse(json)};
  }
}