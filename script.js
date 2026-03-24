let editingPatientId = null;

const API_URL = "http://127.0.0.1:8000";

async function loadPatients() {
  try {
    const response = await fetch(`${API_URL}/patients`);
    const patients = await response.json();

    const patientList = document.getElementById("patientList");
    patientList.innerHTML = "";

    patients.forEach(patient => {
      const li = document.createElement("li");
li.innerHTML = `
  <div class="patient-info">
    <div class="patient-name">${patient.name}</div>
    <div class="patient-meta">MRN: ${patient.mrn} | Age: ${patient.age} | ID: ${patient.id}</div>
  </div>
  <div class="patient-actions">
    <button class="edit-btn" onclick="editPatient(${patient.id}, '${patient.mrn}', '${patient.name}', ${patient.age})">Edit</button>
    <button class="delete-btn" onclick="deletePatient(${patient.id})">Delete</button>
  </div>
`;
      patientList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading patients:", error);
  }
}

function editPatient(id, mrn, name, age) {
  document.getElementById("mrn").value = mrn;
  document.getElementById("name").value = name;
  document.getElementById("age").value = age;

  editingPatientId = id;
  document.querySelector(".add-btn").textContent = "Update Patient";
}

async function addPatient() {
  try {
    const mrnInput = document.getElementById("mrn");
    const nameInput = document.getElementById("name");
    const ageInput = document.getElementById("age");
    const message = document.getElementById("message");

    const mrn = mrnInput.value.trim();
    const name = nameInput.value.trim();
    const age = ageInput.value.trim();

    if (!mrn || !name || !age) {
      message.textContent = "Please enter MRN, name, and age.";
      return;
    }

    let url = `${API_URL}/patients`;
    let method = "POST";

    if (editingPatientId !== null) {
      url = `${API_URL}/patients/${editingPatientId}`;
      method = "PUT";
    }

    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        mrn: mrn,
        name: name,
        age: Number(age)
      })
    });

    if (response.ok) {
      message.textContent = editingPatientId !== null
        ? "Patient updated successfully."
        : "Patient added successfully.";

      mrnInput.value = "";
      nameInput.value = "";
      ageInput.value = "";
      editingPatientId = null;
      document.querySelector(".add-btn").textContent = "Add Patient";
      loadPatients();
    } else {
      message.textContent = editingPatientId !== null
        ? "Error updating patient."
        : "Error adding patient.";
    }
  } catch (error) {
    console.error("Error saving patient:", error);
  }
}

async function deletePatient(id) {
  try {
    const message = document.getElementById("message");

    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      message.textContent = `Patient with ID ${id} deleted successfully.`;
      loadPatients();
    } else {
      message.textContent = "Error deleting patient.";
    }
  } catch (error) {
    console.error("Error deleting patient:", error);
  }
}

loadPatients();