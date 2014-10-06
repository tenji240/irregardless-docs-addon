/***********************  Irregardless API Interface  **************************/
// This handles cors and all that BS
var Irregardless = new function() {

  var HOST = "https://api.irregardless.ly/api/v1",
    API_KEY = "3tkaamd9zazzwa27z4x6xmns",
    MATCH_ENDPOINT = HOST + "/rules/match?api_key=" + API_KEY,
    GUIDES_ENDPOINT = HOST + "/style_guides?recommended=true&api_key=" + API_KEY,
    GUIDES_QUERY_ENDPOINT = HOST + "/style_guides?api_key=" + API_KEY;

  this.fetchGuides = function(query) {
    var url;
    if (query) {
      url = GUIDES_QUERY_ENDPOINT + "&q=" + query;
    } else {
      url = GUIDES_ENDPOINT;
    }

    var response = UrlFetchApp.fetch(url),
        json = response.getContentText();

        return JSON.parse(json);
  }
  
  this.fetchTips = function(styleGuideId) {
    var text = DocumentApp.getActiveDocument().getBody().getText(),
        collectionId = styleGuideId;

    var params = {
      contentType: 'application/json',
      payload: JSON.stringify({body: text, style_guide_id: Number(collectionId)}),
      method: "post",
    };
    var response = UrlFetchApp.fetch(MATCH_ENDPOINT, params),
        json = response.getContentText();
    
    return { fullText: text,
            tips: JSON.parse(json)};
  }
};


/***********************  Main - Initialize the sidebar  **************************/
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


/***********************  Helper Functions  **************************/

var searchDoc = function(string, fn) {
  var element = null;
  var i = 0;
  while(element = DocumentApp.getActiveDocument().getBody().findElement(DocumentApp.ElementType.TEXT, element)) {
    var textElement = element.getElement().asText();
    search = textElement.findText(string); // TODO: This should match ONLY things bounded by word boundaries
    while (search !== null) {
      fn(i, search);
      // search for next match
      search = textElement.findText(string, search);
    }
    i++;
  }
}

/***********************  Interface Functions  **************************/
// (Do these need to be global???)


function getDocMatches(tip) {
  var searchMatches = [];
  searchDoc(tip.matched_string, function(textElementIndex, search) {
    searchMatches.push({
      textElementIndex: textElementIndex,
      startOffset: search.getStartOffset(),
      endOffset: search.getEndOffsetInclusive(),
      textEl: search.getElement().asText(),
      ogBgColor: search.getElement().asText().getBackgroundColor() || '#FFFFFF', // Returns null if not set. Stupid.
      text: tip.matched_string
    });
  });
  return searchMatches;
}

function highlight(tip) {
  var matches = getDocMatches(tip),
      match;

  for(var i = 0; i < matches.length; i++){
    match = matches[i];
    match.textEl.setBackgroundColor(match.startOffset, match.endOffset, '#FFFF00');
  }
  return matches;
}

function unHighlight(matches) {
  var textElement = null;
  var elements = [];
  while(textElement = DocumentApp.getActiveDocument().getBody().findElement(DocumentApp.ElementType.TEXT, textElement)) {
    elements.push(textElement);
  }
  for (var i = 0; i < matches.length; i++) {
    elements[matches[i].textElementIndex].getElement().asText().setBackgroundColor(matches[i].startOffset, matches[i].endOffset, matches[i].ogBgColor);
  }
}

function applyTip(tip, replace, match){
  searchDoc(tip.matched_string, function(textElementIndex, search) {
    search.getElement().asText().setBackgroundColor(search.getStartOffset(), search.getEndOffsetInclusive(), match.ogBgColor);
    search.getElement().asText().replaceText(tip.matched_string, replace);
  });
  return true;
}

function fetchGuides(query) {
  return Irregardless.fetchGuides(query);
}

function fetchTips(guideId) {
  return Irregardless.fetchTips(guideId);
}
