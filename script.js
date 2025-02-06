// Get references to form, table, dropdowns, and search input
const form = document.getElementById("dataForm");
const tableBody = document.querySelector("#dataTable tbody");
const state = document.getElementById("state");
const city = document.getElementById("city");
const searchInput = document.getElementById("search");

// Default option for city dropdown
const DISABLED_OPTION = "<option disabled selected value>---- select city ----</option>";

// Define actions for edit and delete
const ACTIONS = { EDIT: "edit", DELETE: "delete" };

// Email validation regex (Note: Needs case-insensitive flag)
let EMAIL_REGEXP = new RegExp('^[A-Z0-9._%+-]+@[A-Z0-9.-]+\\.[A-Z]{2,4}$', 'i');

// Initialize user database and counters
let userDB = []; // user database 
let userIdCounter = 1; // incremental userID counter 
let editingUserId = -1; // editing userID (currently -1 means not any user data which edited)

// State-wise city mapping
const stateCities = {
    Gujarat: ["Ahmedabad", "Surat", "Bharuch", "Navsari"],
    Panjab: ["Mohali", "Ludhiana", "Amritsar"]
};

// Populate city dropdown based on selected state
state.addEventListener("change", () => {
    const cities = stateCities[state.value]?.sort() || [];
    city.innerHTML = DISABLED_OPTION + cities.map(city => `<option value="${city}">${city}</option>`).join("");
});


// Handle form submission
form.addEventListener("submit", (event) => {
    event.preventDefault(); // Prevent default form submission
    
    if (validateForm()) { // Validate form fields
        const userData = collectFormData();
        
        // Check if email already exists in database
        if (isEmailExist(userData.email)) {
            alert("This email is already in use. Please use a different email.");
            form.elements["email"].focus();
            return;
        }
        
        if (editingUserId !== -1) { // If editing existing user
            updateUserData(editingUserId, userData);
            editingUserId = -1;
        } else { // If adding new user
            addNewUser(userData);
        }
        
        form.reset(); // Reset form fields
        renderTable(); // Re-render table with updated data
    }
});

// Handle edit and delete button clicks inside the table
tableBody.addEventListener("click", (event) => {
    
    // Find the closest <tr> (table row) element that is an ancestor of the event target (the clicked element).
    // This ensures that we get the row associated with the clicked element.
    const row = event.target.closest("tr");
    const userId = parseInt(row.dataset.userId, 10);

    // Check if the clicked element has the class corresponding to the delete action.
    // This helps determine if the delete button was clicked.
    if (event.target.classList.contains(ACTIONS.DELETE)) {
        deleteUser(userId);
        row.remove();
    }
    // Check if the clicked element has the class corresponding to the edit action.
    // This helps determine if the edit button was clicked.
    else if (event.target.classList.contains(ACTIONS.EDIT)) {
        loadUserDataForEditing(userId);
        row.remove();
    }
});

// Filter table based on search input
searchInput.addEventListener("input", filterTable);

// Validate form fields before submission
function validateForm() {
    const email = form.elements["email"];
    const age = form.elements["age"];
    const gender = form.elements["gender"];
    const hobbies = form.elements["hobbies"];
    let isValid = true;

    // Validate email format
    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert("Please enter a valid email address.");
        email.focus();
        isValid = false;
    }

    // Validate age range (1-120)
    const ageValue = parseInt(age.value, 10);
    if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) {
        alert("Please enter a valid age between 1 and 120.");
        age.focus();
        isValid = false;
    }

    // Ensure gender is selected
    if (![...gender].some(radio => radio.checked)) {
        alert("Please select a gender.");
        isValid = false;
    }

    // Ensure at least one hobby is selected
    if (![...hobbies].some(checkbox => checkbox.checked)) {
        alert("Please select at least one hobby.");
        isValid = false;
    }

    return isValid;
}

// Check if email already exists in user database
function isEmailExist(email) {
    return userDB.some(user => user.data.email === email && user.id !== editingUserId);
}

// Collect form data and return as object
function collectFormData() {
    // Create a new FormData object from the given form element.
    // This captures all form input values for processing ( give the data in JS object )
    const formData = new FormData(form);
    const data = {};
    for (const [key, value] of formData.entries()) {
        if (key === "hobbies") {
            data.hobbies = data.hobbies || [];
            data.hobbies.push(value);
        } else {
            data[key] = value;
        }
    }
    return data;
}

// Add new user to user database
function addNewUser(userData) {
    userDB.push({ id: userIdCounter++, data: userData });
}

// Update user data in the database
function updateUserData(userId, updatedData) {
    const user = userDB.find(user => user.id === userId);
    if (user) user.data = updatedData;
}

// Delete user from database
function deleteUser(userId) {
    userDB = userDB.filter(user => user.id !== userId);
}

// Load user data into form for editing
function loadUserDataForEditing(userId) {
    const user = userDB.find(user => user.id === userId);
    if (user) {
        Object.entries(user.data).forEach(([key, value]) => {
            const input = form.elements[key];
            if (input) {
                if (input.type === "checkbox") {
                    input.checked = value.includes(input.value);
                } else if (input.type === "radio") {
                    input.checked = input.value === value;
                } else {
                    input.value = value;
                }
            }
        });
        editingUserId = userId;
    }
}

// Render table rows based on user database
function renderTable() {
    tableBody.innerHTML = userDB.map(user => createTableRow(user)).join("");
}

// Create a table row for a user
function createTableRow({ id, data }) {
    // Convert the values of the 'data' object into table cells (<td> elements).
    // If a value is an array, join its elements with a comma; otherwise, use the value directly.
    // Finally, join all <td> elements into a single string to form a row.
    const dataCells = Object.values(data).map(value => `<td>${Array.isArray(value) ? value.join(", ") : value}</td>`).join(""); 
    return `
        <tr data-user-id="${id}">
            <td>${id}</td>
            ${dataCells}
            <td>
                <button class="${ACTIONS.EDIT}">Edit</button>
                <button class="${ACTIONS.DELETE}">Delete</button>
            </td>
        </tr>`;
}

// Filter table rows based on search input
function filterTable() {
    const filter = searchInput.value.toUpperCase();
    // Convert the table body rows into an array and iterate through each row.
    // Retrieve the cell in the second column (index 1) where the name is stored.
    // Check if the cell's text (converted to uppercase) includes the filter text.
    // If it matches, display the row; otherwise, hide it.
    Array.from(tableBody.rows).forEach(row => {
        const nameCell = row.cells[1]; // Assuming name is in second column
        row.style.display = nameCell && nameCell.textContent.toUpperCase().includes(filter) ? "" : "none";
    });
}

// Initial render of the table
renderTable();
