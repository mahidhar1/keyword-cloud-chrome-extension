console.log("running content.js file");

chrome.runtime.onMessage.addListener(async function (
  request,
  sender,
  sendResponse,
) {
  console.log(request.selectionText);
  console.log(request.tabId);
  showKeywordCloudButton(request.listOfKeywordObj);
  
});


function showKeywordCloudButton(listOfKeywordObj) {
  
  let mainDiv = document.createElement('div');
  mainDiv.className = 'cloud';
  

  let column = document.createElement('div');
  column.className = '_column'; 

  let horizontalRow = document.createElement('div'); 
  horizontalRow.className = '_keywords__row';
  for(let obj of listOfKeywordObj) {
    let baseFontSize = 16; 
    if(listOfKeywordObj.length > 20) {
      baseFontSize = 8;
    }
    let temp = document.createElement('div'); 
    temp.style.fontSize = `${obj.count*baseFontSize}px`; 
    temp.textContent = obj.word; 
    horizontalRow.appendChild(temp); 
  }

  let closeButton = document.createElement('div');
  closeButton.className = '_close__button'; 
  closeButton.textContent = 'Close'; 
  closeButton.addEventListener('click', function(event) {
    mainDiv.style.display = 'none'
  }); 

  column.appendChild(horizontalRow);
  column.appendChild(closeButton);  
  mainDiv.appendChild(column);
  mainDiv.style.display = 'block'; 
  document.body.appendChild(mainDiv);   
}


