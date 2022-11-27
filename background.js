console.log("background running !!!!");

// On first install open onboarding
// chrome.runtime.onInstalled.addListener((reason) => {
//   console.log("The app is installed...");
//   console.log(reason.reason, chrome.runtime.OnInstalledReason.INSTALL);
//   if (reason.reason === chrome.runtime.OnInstalledReason.INSTALL) {
//     chrome.tabs.create({
//       url: "/onboarding.html",
//     });
//   }
// });

//when a new tab is opened run this file on the content sctipt
chrome.tabs.onActivated.addListener(function (activeInfo) {
  console.log("onActivated", activeInfo.tabId);
  chrome.scripting.executeScript({
    target: { tabId: activeInfo.tabId },
    files: ["content.js"],
    //func: logger, // this will run the console of tab(contentScript) not on service worker console(background).
    //args: [`activated ${activeInfo.tabId}`],
  });
});

// on page reload
chrome.tabs.onUpdated.addListener(function (tabId, changeInfo, tab) {
  //console.log(changeInfo);
  if (tab.url?.startsWith("chrome://")) return undefined;
  if (changeInfo.status === "complete") {
    console.log("onUpdated", tabId, tab.url);
    chrome.scripting.executeScript({
      target: { tabId },
      files: ["content.js"],
      //func: logger,
      //args: [`updated ${tabId}`],
    });
  }
});

// whenever a text is selected and right-click event occurs, show an option in context menu
let contextMenuItem = {
  id: "keywordCloudContextMenu",
  title: "Generate Keyword Cloud",
  contexts: ["selection"],
};

chrome.contextMenus.create(contextMenuItem);

chrome.contextMenus.onClicked.addListener(async function (clickedData) {
  if (
    clickedData.menuItemId === "keywordCloudContextMenu" &&
    clickedData.selectionText
  ) {
    if (clickedData.selectionText.length > 0) {
      console.log(clickedData.selectionText);
      chrome.tabs.query({ active: true }, function (tabs) {
       
        chrome.tabs.sendMessage(tabs[0].id, {
          selectionText: clickedData.selectionText,
          tabId: tabs[0].id,
          listOfKeywordObj: getKeywordsList(clickedData.selectionText)
        });
      });
    }
  }
});

function logger(tabId) {
  console.log("From background.js: ", tabId);
}

async function getCurrentTab() {
  let tabs = await chrome.tabs.query({ active: true });
  return tabs;
}

function getKeywordsList(text) {
  const stopwords = [
    "about",
    "all",
    "alone",
    "also",
    "am",
    "and",
    "as",
    "at",
    "because",
    "before",
    "beside",
    "besides",
    "between",
    "but",
    "by",
    "etc",
    "for",
    "i",
    "of",
    "on",
    "other",
    "others",
    "so",
    "than",
    "that",
    "though",
    "to",
    "too",
    "trough",
    "until",
    "is",
    "than",
    "the",
    "you",
    "more",
    "find", 
    'ourselves', 
    'hers', 
    'between', 
    'yourself', 
    'but', 
    'again', 
    'there', 
    'about', 
    'once', 
    'during', 
    'out', 
    'very', 
    'having', 
    'with', 
    'they', 
    'own', 
    'an', 
    'be', 
    'some', 
    'for', 
    'do', 
    'its', 
    'yours', 
    'such',
    'into',
    'of', 
    'most', 
    'itself', 
    'other', 
    'off', 
    'is', 
    's', 
    'am', 
    'or', 
    'who', 
    'as', 
    'from', 
    'him', 
    'each', 
    'the', 
    'themselves', 
    'until', 
    'below', 
    'are', 
    'we', 
    'these', 
    'your', 
    'his', 
    'through', 
    'don', 
    'nor',
    'me', 
    'were', 
    'her', 
    'more', 
    'himself', 
    'this', 
    'down', 
    'should', 
    'our', 
    'their', 
    'while', 
    'above', 
    'both', 
    'up', 
    'to', 
    'ours', 
    'had', 
    'she', 
    'all', 
    'no', 
    'when', 
    'at', 
    'any', 
    'before', 
    'them', 
    'same', 
    'and', 
    'been', 
    'have', 
    'in', 
    'will', 
    'on', 
    'does', 
    'yourselves', 
    'then', 
    'that', 
    'because', 
    'what',
    'over', 
    'why', 
    'so', 
    'can', 
    'did', 
    'not', 
    'now', 
    'under', 
    'he', 
    'you', 
    'herself', 
    'has',
    'just', 
    'where', 
    'too', 
    'only', 
    'myself', 
    'which',
     'those', 
    'i', 
    'after', 
    'few', 
    'whom', 
    't', 
    'being', 
    'if', 
    'theirs', 
    'my', 
    'against', 
    'a', 
    'by', 
    'doing', 
    'it', 
    'how',
    'further',
    'was',
    'here',
    'than', 
    'you', 
    'yours', 
    'they', 
    'them', 
    'theirs', 
    'and'
  ];
  
  // remove line breaks
  text = text.replace(/\s/g, " ");
  // convert to lowercase
  text = text.toLowerCase();
  // remove peculiars
  text = text.replace(/[^a-zA-Z0-9äöüß]/g, " ");
  // remove digits
  text = text.replace(/\d+/g, ''); 
  
  // convert text to array of words
  let keywordsArray = text.split(" ").map(word => word.trim());
  var keywordsFreqMap = {};
  keywordsArray.forEach( 
    word => {
      let wordNotInStopwords = (stopwords.indexOf(word) === -1);
      if(word.length > 0 && word !== " " && wordNotInStopwords) {
        if (!keywordsFreqMap[word]) {
          keywordsFreqMap[word] = 0;
        }
        keywordsFreqMap[word] += 1;
      }
    }
  );
  let keywordsList = [];
  for(let word in keywordsFreqMap) {
    if(keywordsFreqMap[word] > 0) {
      let obj = {
        word, 
        'count': keywordsFreqMap[word], 
      }
      keywordsList.push(obj)
    }
  }

  return keywordsList;
}


