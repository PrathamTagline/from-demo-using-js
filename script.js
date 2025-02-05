const form = document.getElementById("dataForm");
const tableBody = document.querySelector("#dataTable tbody");
const state = document.getElementById("state");
const city = document.getElementById("city");
const searchInput = document.getElementById("search");
const DISABLED_OPTION = "<option disabled selected value>---- select city ----</option>";
const ACTIONS = { EDIT: "edit", DELETE: "delete" };
let EMAIL_REGEXP = new RegExp('^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$');

let userDB = [];
let userIdCounter = 1;
let editingUserId = -1;

const stateCities = {
    Gujarat: ["Ahmedabad", "Surat", "Bharuch", "Navsari"],
    Panjab: ["Mohali", "Ludhiana", "Amritsar"]
};

state.addEventListener("change", () => {
    const cities = stateCities[state.value]?.sort() || [];
    city.innerHTML = DISABLED_OPTION + cities.map(city => `<option value="${city}">${city}</option>`).join("");
});

form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (validateForm()) {
        const userData = collectFormData();
        if (isEmailExist(userData.email)) {
            alert("This email is already in use. Please use a different email.");
            form.elements["email"].focus();
            return;
        }
        if (editingUserId !== -1) {
            updateUserData(editingUserId, userData);
            editingUserId = -1;
        } else {
            addNewUser(userData);
        }
        form.reset()
        renderTable();
    }
});

tableBody.addEventListener("click", (event) => {
    const row = event.target.closest("tr");
    const userId = parseInt(row.dataset.userId, 10);
    if (event.target.classList.contains(ACTIONS.DELETE)) {
        deleteUser(userId);
        row.remove();
    } else if (event.target.classList.contains(ACTIONS.EDIT)) {
        loadUserDataForEditing(userId);
        row.remove();
    }
});

searchInput.addEventListener("input", filterTable);

function validateForm() {
    const email = form.elements["email"];
    const age = form.elements["age"];
    const gender = form.elements["gender"];
    const hobbies = form.elements["hobbies"];
    let isValid = true;

    if (!email.value.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
        alert("Please enter a valid email address.");
        email.focus();
        isValid = false;
    }

    const ageValue = parseInt(age.value, 10);
    if (isNaN(ageValue) || ageValue < 1 || ageValue > 120) {
        alert("Please enter a valid age between 1 and 120.");
        age.focus();
        isValid = false;
    }

    if (![...gender].some(radio => radio.checked)) {
        alert("Please select a gender.");
        isValid = false;
    }

    if (![...hobbies].some(checkbox => checkbox.checked)) {
        alert("Please select at least one hobby.");
        isValid = false;
    }

    return isValid;
}

function isEmailExist(email) {
    return userDB.some(user => user.data.email === email && user.id !== editingUserId);
}

function collectFormData() {
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

function addNewUser(userData) {
    userDB.push({ id: userIdCounter++, data: userData });
}

function updateUserData(userId, updatedData) {
    const user = userDB.find(user => user.id === userId);
    if (user) user.data = updatedData;
}

function deleteUser(userId) {
    userDB = userDB.filter(user => user.id !== userId);
}

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

function renderTable() {
    tableBody.innerHTML = userDB.map(user => createTableRow(user)).join("");
}

function createTableRow({ id, data }) {
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

function filterTable() {
    const filter = searchInput.value.toUpperCase();
    Array.from(tableBody.rows).forEach(row => {
        const nameCell = row.cells[1];
        row.style.display = nameCell && nameCell.textContent.toUpperCase().includes(filter) ? "" : "none";
    });
}

renderTable();
