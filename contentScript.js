(() => {
    let currentProjectId = "";
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
        const { type, projectId } = obj;

        if (type === "NEW") {
            console.log(projectId);
            currentProjectId = projectId;
            newProjectOpened();
        }
    });

    const newProjectOpened = () => {
        const syncBtnExists = document.getElementById("syncButton");
        console.log(syncBtnExists);

        if (!syncBtnExists) {
            const syncButton = document.createElement('button');
            syncButton.innerHTML = "<span class=\"split-menu-button\">Github Sync</span>";
            syncButton.id = "syncButton";
            syncButton.title = "Click to sync current pdf to github"

            document.querySelector('.toolbar-pdf-left').appendChild(syncButton);            
            syncButton.addEventListener("click", syncEventHandler);
        }
    }

    const syncEventHandler = async () => {
        document.querySelector('span.split-menu-button').click()
        await delay(5000);

        var filePdfLink = document.querySelector(".fa-download").parentElement.getAttribute("href");
        filePdfLink = "https://www.overleaf.com" + filePdfLink
        chrome.storage.sync.get([currentProjectId], (data) => {
            console.log(currentProjectId);
            const currentprojectGithubInfo = data[currentProjectId] || {};
            console.log(currentprojectGithubInfo);
            fetch(filePdfLink)
                .then (response => response.blob())
                .then (blob => {
                    console.log("here");
                    var reader = new FileReader();
                    reader.readAsDataURL(blob); 
                    reader.onloadend = function() {
                        var base64data = reader.result;  
                        base64data = base64data.split(',')[1];              
                        pushToGithub(base64data, currentprojectGithubInfo);
                    }
                });
            
        })
    }

    const pushToGithub = (base64data, currentprojectGithubInfo) => {
        console.log("pushing to github");
        console.log(currentprojectGithubInfo);
        const usernameAndRepo = getUsernameAndRepo(currentprojectGithubInfo.repositoryLink);
        const git_url = `https://api.github.com/repos/${usernameAndRepo.username}/${usernameAndRepo.repo}/contents/${currentprojectGithubInfo.fileName}`;
    
        fetch(git_url, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${currentprojectGithubInfo.accessToken}`,
                'Content-Type': 'application/json'
            }
          })
          .then(response => response.json())
          .then(data => {
            const file_sha = data.sha
            let bodyObj = JSON.stringify({
                "message": `${currentprojectGithubInfo.commitMessage}`,
                "content": `${base64data}`,
                "sha": `${file_sha}`
            });
            let config = {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${currentprojectGithubInfo.accessToken}`,
                    'Content-Type': 'application/json'
                },
                body: bodyObj
            };
            fetch(git_url, config)
                .then((response) => response.json())
                .then((data) => {
                    console.log(data);
                });
          })
    }

    const getUsernameAndRepo = (repoLink) => {
        const username = repoLink.split("/")[3];
        const repo = repoLink.split("/")[4];
        return {username, repo}
    }

    newProjectOpened();
})();

const delay = ms => new Promise(res => setTimeout(res, ms));
