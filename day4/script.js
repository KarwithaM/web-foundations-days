// 1. Select all required elements
const noteText = document.querySelector("#note-text");
const charCount = document.querySelector("#char-count");
const wordCount = document.querySelector("#word-count");
const clearBtn = document.querySelector("#clear-btn");
const themeToggle = document.querySelector("#theme-toggle");

const MAX_CHARS = 200;

// 2. Update Counts Function
function updateCounts() {
  const text = noteText.value;
  const charLength = text.length;
  
  // Count words: split by whitespace, filter out empty strings
  const words = text.trim().split(/\s+/).filter(word => word.length > 0);
  const wordLength = words.length;

  // Update text content
  charCount.textContent = `${charLength} / ${MAX_CHARS} characters`;
  wordCount.textContent = `${wordLength} words`;

  // Update warning classes
  charCount.classList.remove("warning", "over");
  if (charLength > MAX_CHARS) {
    charCount.classList.add("over");
  } else if (charLength > 180) {
    charCount.classList.add("warning");
  }

  // Save draft to localStorage
  localStorage.setItem("note-draft", text);
}

// 3. Clear Function
function clearAll() {
  noteText.value = "";
  localStorage.removeItem("note-draft");
  updateCounts(); // Resets counters and removes classes
  noteText.focus();
}

// 4. Theme Toggle Function
function toggleTheme() {
  document.body.classList.toggle("dark");
  const isDark = document.body.classList.contains("dark");
  
  // Update button text and save preference
  themeToggle.textContent = isDark ? "Light mode" : "Dark mode";
  localStorage.setItem("theme-preference", isDark ? "dark" : "light");
}

// 5. Event Listeners
noteText.addEventListener("input", updateCounts);
clearBtn.addEventListener("click", clearAll);
themeToggle.addEventListener("click", toggleTheme);

// Escape key to clear
noteText.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    clearAll();
  }
});

// 6. Initialization (Run on page load)
// Restore draft
const savedDraft = localStorage.getItem("note-draft");
if (savedDraft !== null) {
  noteText.value = savedDraft;
}

// Restore theme
const savedTheme = localStorage.getItem("theme-preference");
if (savedTheme === "dark") {
  document.body.classList.add("dark");
  themeToggle.textContent = "Light mode";
}

// Run once to set initial counters based on restored draft
updateCounts();