let notes = [
  { id: 1, text: "Buy milk and bread", category: "personal" },
  { id: 2, text: "Finish the Day 3 assignment", category: "study" },
  { id: 3, text: "Email the project report to Grace", category: "work" },
  { id: 4, text: "Revise JavaScript arrays", category: "study" },
  { id: 5, text: "Call mum", category: "personal" },
];

function searchNotes(word) {
  return notes.filter(note => 
    note.text.toLowerCase().includes(word.toLowerCase())
  );
}

function longestNote() {
  if (notes.length === 0) return null;
  
  let longest = notes[0]; // Assume the first note is the longest
  for (let i = 1; i < notes.length; i++) {
    if (notes[i].text.length > longest.text.length) {
      longest = notes[i]; // Found a longer one, update our record
    }
  }
  return longest;
}

function countByCategory() {
  const counts = {};
  for (const note of notes) {
    if (counts[note.category]) {
      counts[note.category]++;
    } else {
      counts[note.category] = 1;
    }
  }
  return counts;
}

function getSummary() {
  const counts = countByCategory();
  const total = notes.length;
  const noteWord = total === 1 ? "note" : "notes";
  
  // Turn the counts object into a string like "2 personal, 1 work"
  const categoriesString = Object.entries(counts)
    .map(([cat, count]) => `${count} ${cat}`)
    .join(", ");

  return `${total} ${noteWord}: ${categoriesString}.`;
}

function isDuplicate(text) {
  const cleanText = text.trim().toLowerCase();
  return notes.some(note => 
    note.text.trim().toLowerCase() === cleanText
  );
}

function addNote(text, category) {
  const validCategories = ["personal", "work", "study"];
  const cleanText = text.trim();

  // Rule 1: Length check
  if (cleanText.length < 1 || cleanText.length > 200) {
    console.log("Failed: Text must be between 1 and 200 characters.");
    return false;
  }
  
  // Rule 2: Duplicate check
  if (isDuplicate(cleanText)) {
    console.log("Failed: Note already exists.");
    return false;
  }
  
  // Rule 3: Category check
  if (!validCategories.includes(category)) {
    console.log("Failed: Invalid category.");
    return false;
  }

  // If we pass all rules, add the note!
  const newId = notes.length > 0 ? notes[notes.length - 1].id + 1 : 1;
  notes.push({ id: newId, text: cleanText, category: category });
  console.log("Success: Note added!");
  return true;
}

// --- TESTS ---

// 1. Test searchNotes
console.log(searchNotes("milk")); 
// Expected: [{ id: 1, text: "Buy milk and bread", category: "personal" }]
console.log(searchNotes("gym")); 
// Expected: [] (empty array)

// 2. Test longestNote
console.log(longestNote()); 
// Expected: { id: 3, text: "Email the project report to Grace", category: "work" }

// 3. Test countByCategory
console.log(countByCategory()); 
// Expected: { personal: 2, study: 2, work: 1 }

// 4. Test getSummary
console.log(getSummary()); 
// Expected: "5 notes: 2 personal, 2 study, 1 work."

// 5. Test isDuplicate
console.log(isDuplicate("  Buy milk and bread  ")); 
// Expected: true (ignores spaces and case)
console.log(isDuplicate("Buy water")); 
// Expected: false

// 6. Test addNote
console.log(addNote("Buy water", "personal")); 
// Expected: Logs "Success: Note added!" and returns true
console.log(addNote("Buy water", "personal")); 
// Expected: Logs "Failed: Note already exists." and returns false
console.log(addNote("Buy juice", "hobby")); 
// Expected: Logs "Failed: Invalid category." and returns false