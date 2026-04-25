chrome.runtime.onInstalled.addListener(() => {
  console.log('Website Evaluator 설치됨');
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete') {
    console.log('페이지 로드 완료:', tab.url);
  }
});
