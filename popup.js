import { getActiveTabURL } from "./utils.js";

let activeTab, projectId;

document.getElementById("submit-btn").addEventListener("click", onSubmit);
document.getElementById("edit-btn").addEventListener("click", onEdit);


function onSubmit(){
  let repositoryLink = document.getElementById("repo").value;
  let accessToken = document.getElementById("token").value;
  let fileName = document.getElementById("fileName").value;
  let commitMessage = document.getElementById("commit").value || "Automatic sync from overleaf";
  const currentprojectGithubInfo = {
    repositoryLink,
    accessToken,
    fileName,
    commitMessage
  }
  chrome.storage.sync.set({ [projectId]: currentprojectGithubInfo });
  document.getElementById("repo").disabled = true;
  document.getElementById("token").disabled = true;
  document.getElementById("fileName").disabled = true;
  document.getElementById("commit").disabled = true;
}

function onEdit(){
  document.getElementById("repo").disabled = false;
  document.getElementById("token").disabled = false;
  document.getElementById("fileName").disabled = false;
  document.getElementById("commit").disabled = false;
}


document.addEventListener("DOMContentLoaded", async () => {
  activeTab = await getActiveTabURL();
  projectId = activeTab.url.split("/")[4];
  if (activeTab.url.includes("overleaf.com")) {
    chrome.storage.sync.get([projectId], (data) => {
      const currentprojectGithubInfo = data[projectId] || {};
      if (currentprojectGithubInfo) {
        document.getElementById("repo").disabled = true;
        document.getElementById("token").disabled = true;
        document.getElementById("fileName").disabled = true;
        document.getElementById("commit").disabled = true;
        document.getElementById("repo").value = currentprojectGithubInfo.repositoryLink;
        document.getElementById("token").value = currentprojectGithubInfo.accessToken;
        document.getElementById("fileName").value = currentprojectGithubInfo.fileName;
        document.getElementById("commit").value = currentprojectGithubInfo.commitMessage;
      }
    });
  } else {
    const container = document.getElementsByClassName("container")[0];

    container.innerHTML = '<div class="title">This is not a overleaf project page.</div>';
  }
});