document.addEventListener('DOMContentLoaded', () => {
    console.log("✅ Popup JS loaded");
  
    const list = document.getElementById('appliedList');
  
    chrome.storage.local.get(null, (items) => {
      console.log("📦 Loaded from storage:", items);
      list.innerHTML = '';
  
      const validItems = Object.entries(items).filter(
        ([_, v]) => v && v.title && v.company && v.status
      );
  
      if (validItems.length === 0) {
        list.innerHTML = '<li>No tracked posts yet.</li>';
        return;
      }
  
      validItems.sort((a, b) => new Date(b[1].timestamp) - new Date(a[1].timestamp));
  
      validItems.forEach(([_, value]) => {
        const li = document.createElement('li');
  
        const title = value.title.split('\n')[0].trim();
        const company = value.company.trim();
        const status = value.status.trim();
        const timestamp = new Date(value.timestamp).toLocaleDateString();
  
        const statusColor = status === 'applied' ? 'green' :
                            status === 'referred' ? 'purple' : 'gray';
        const statusIcon = status === 'applied' ? '✅' :
                           status === 'referred' ? '📩' : '❓';
  
        li.innerHTML = `
          <strong>${title}</strong><br/>
          <em>${company}</em><br/>
          <span style="color: ${statusColor}; font-weight: bold;">
            ${statusIcon} ${status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
          <small style="display:block;">${timestamp}</small>
        `;
        list.appendChild(li);
      });
    });
  });
  
  document.getElementById('exportBtn').addEventListener('click', () => {
    chrome.storage.local.get(null, (items) => {
      const validItems = Object.values(items).filter(
        (v) => v && v.title && v.company && v.status && v.timestamp
      );
  
      if (validItems.length === 0) {
        alert("No tracked jobs to export.");
        return;
      }
  
      const rows = [
        ["Title", "Company", "Status", "Date"]
      ];
  
      validItems.forEach((item) => {
        const title = item.title.split('\n')[0].trim();
        const company = item.company.trim();
        const status = item.status.trim();
        const date = new Date(item.timestamp).toLocaleDateString();
  
        rows.push([title, company, status, date]);
      });
  
      const csvContent = rows.map(e => e.join(",")).join("\n");
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
  
      const downloadLink = document.createElement("a");
      downloadLink.setAttribute("href", url);
      downloadLink.setAttribute("download", "tracked_jobs.csv");
      document.body.appendChild(downloadLink);
      downloadLink.click();
      document.body.removeChild(downloadLink);
    });
  });
  