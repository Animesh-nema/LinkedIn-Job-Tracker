const addButtonsToPost = (postElement) => {
    const postId =
      postElement.getAttribute('data-job-id') ||
      postElement.getAttribute('data-id') ||
      postElement.innerText.slice(0, 50);
  
    if (postElement.querySelector('[data-extension-button-group]')) return;
  
    const container = document.createElement('div');
    container.setAttribute('data-extension-button-group', 'true');
    container.style.marginTop = '10px';
    container.style.display = 'flex';
    container.style.gap = '10px';
  
    // Extract job title & company using fallback selectors
    const titleEl =
    postElement.querySelector('a.job-card-container__link.job-card-list__title--link') ||
    postElement.querySelector('.job-card-list__title') ||
    postElement.querySelector('h3') ||
    postElement.querySelector('span[title]');
  
  const companyEl =
    postElement.querySelector('div.artdeco-entity-lockup__subtitle span') ||
    postElement.querySelector('.job-card-container__company-name') ||
    postElement.querySelector('h4') ||
    postElement.querySelector('a[href*="/company/"]');
  
  
    const jobTitle = titleEl?.innerText?.trim() || 'Unknown Title';
    const companyName = companyEl?.innerText?.trim() || 'Unknown Company';
  
    console.log("🧠 Extracted:", { jobTitle, companyName });
  
    const createButton = (label, key, color) => {
      const btn = document.createElement('button');
      btn.innerText = label;
      btn.style.backgroundColor = color;
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.padding = '6px 10px';
      btn.style.borderRadius = '4px';
      btn.style.cursor = 'pointer';
  
      chrome.storage.local.get(postId, (result) => {
        if (result[postId]?.status === key) {
          btn.innerText = `✅ ${label}`;
          btn.style.backgroundColor = '#5fba7d';
        }
      });
  
      btn.onclick = () => {
        chrome.storage.local.get(postId, (result) => {
          const currentStatus = result[postId]?.status;
          if (currentStatus === key) {
            chrome.storage.local.remove(postId);
            btn.innerText = label;
            btn.style.backgroundColor = color;
          } else {
            chrome.storage.local.set({
              [postId]: {
                status: key,
                timestamp: new Date().toISOString(),
                title: jobTitle,
                company: companyName,
              },
            });
            btn.innerText = `✅ ${label}`;
            btn.style.backgroundColor = '#5fba7d';
          }
        });
      };
  
      return btn;
    };
  
    const appliedBtn = createButton('Applied', 'applied', '#0A66C2');
    const referredBtn = createButton('Referred', 'referred', '#6f42c1');
  
    container.appendChild(appliedBtn);
    container.appendChild(referredBtn);
    postElement.appendChild(container);
  };
  
  const observePosts = () => {
    const posts = document.querySelectorAll(
      'div.job-card-container, div.feed-shared-update-v2, div.jobs-search-results__list-item'
    );
    posts.forEach(addButtonsToPost);
  };
  
  const observer = new MutationObserver(observePosts);
  observer.observe(document.body, { childList: true, subtree: true });
  
  observePosts();
  