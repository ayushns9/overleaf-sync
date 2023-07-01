chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (tab.url && tab.url.includes("overleaf.com/project")) {
      const projectId = tab.url.split("/")[4];
  
      chrome.tabs.sendMessage(tabId, {
        type: "NEW",
        projectId: projectId,
      });
    }
});
  