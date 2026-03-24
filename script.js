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
        <strong>${patient.name}</strong> (Age: ${patient.age}, ID: ${patient.id})
        <button class="delete-btn" onclick="deletePatient(${patient.id})">Delete</button>
      `;
      patientList.appendChild(li);
    });
  } catch (error) {
    console.error("Error loading patients:", error);
  }
}

async function addPatient() {
  try {
    const nameInput = document.getElementById("name");
    const ageInput = document.getElementById("age");
    const message = document.getElementById("message");

    const name = nameInput.value.trim();
    const age = ageInput.value.trim();

    if (!name || !age) {
      message.textContent = "Please enter both name and age.";
      return;
    }

    const response = await fetch(`${API_URL}/patients`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        name: name,
        age: Number(age)
      })
    });

    if (response.ok) {
      message.textContent = "Patient added successfully.";
      nameInput.value = "";
      ageInput.value = "";
      loadPatients();
    } else {
      message.textContent = "Error adding patient.";
    }
  } catch (error) {
    console.error("Error adding patient:", error);
  }
}

async function deletePatient(id) {
  try {
    const response = await fetch(`${API_URL}/patients/${id}`, {
      method: "DELETE"
    });

    if (response.ok) {
      loadPatients();
    } else {
      alert("Error deleting patient.");
    }
  } catch (error) {
    console.error("Error deleting patient:", error);
  }
}

loadPatients();