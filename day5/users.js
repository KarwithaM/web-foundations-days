const API_URL = "https://jsonplaceholder.typicode.com/users";

const loadBtn = document.querySelector("#load-users");
const filterInput = document.querySelector("#filter-input");
const statusText = document.querySelector("#status");
const usersList = document.querySelector("#users-list");

// Store the loaded users here so we can filter them without making a new API request
let allUsers = [];

// 1. Async function to fetch and load users
async function loadUsers() {
  statusText.textContent = "Loading users...";
  loadBtn.disabled = true;
  filterInput.disabled = true;
  usersList.innerHTML = "";

  try {
    const response = await fetch(API_URL);
    
    // Check if the response is successful (status 200-299)
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    
    allUsers = await response.json();
    renderUsers(allUsers);
    
    statusText.textContent = `Successfully loaded ${allUsers.length} users.`;
    filterInput.disabled = false; // Enable the filter now that we have data
    
  } catch (error) {
    statusText.textContent = "Failed to load users. Please try again.";
    console.error("Error loading users:", error);
  } finally {
    // Always re-enable the button, whether it succeeded or failed
    loadBtn.disabled = false;
  }
}

// 2. Function to render any array of users to the DOM
function renderUsers(usersToRender) {
  usersList.innerHTML = ""; // Clear the current list

  // Handle the "No users match" case
  if (usersToRender.length === 0) {
    const li = document.createElement("li");
    li.textContent = "No users match your filter.";
    li.style.fontStyle = "italic";
    li.style.color = "#666";
    usersList.appendChild(li);
    return;
  }

  // Build the list items
  usersToRender.forEach(user => {
    const li = document.createElement("li");
    
    const nameEl = document.createElement("strong");
    nameEl.textContent = user.name;
    li.appendChild(nameEl);
    
    li.appendChild(document.createElement("br"));
    
    const emailEl = document.createElement("span");
    emailEl.textContent = `Email: ${user.email}`;
    li.appendChild(emailEl);
    
    li.appendChild(document.createElement("br"));
    
    const cityEl = document.createElement("span");
    cityEl.textContent = `City: ${user.address.city}`;
    li.appendChild(cityEl);
    
    li.appendChild(document.createElement("br"));
    
    const companyEl = document.createElement("span");
    companyEl.textContent = `Company: ${user.company.name}`;
    li.appendChild(companyEl);

    usersList.appendChild(li);
  });
}

// 3. Event Listeners
loadBtn.addEventListener("click", loadUsers);

filterInput.addEventListener("input", (event) => {
  const searchTerm = event.target.value.toLowerCase().trim();
  
  // Filter the stored array (no new fetch request!)
  const filteredUsers = allUsers.filter(user => 
    user.name.toLowerCase().includes(searchTerm)
  );
  
  renderUsers(filteredUsers);
});