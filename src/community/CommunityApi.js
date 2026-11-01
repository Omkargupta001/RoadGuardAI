
const API_BASE_URL = "http://127.0.0.1:5001";

function getAuthHeaders() {
  const token = localStorage.getItem("roadguard_token");

  return token
    ? { Authorization: `Bearer ${token}` }
    : {};
}

export async function registerUser(name, email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Registration failed");
  }

  return data;
}

export async function loginUser(email, password) {
  const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || "Login failed");
  }

  localStorage.setItem("roadguard_token", data.access_token);
  localStorage.setItem("roadguard_user", JSON.stringify(data.user));

  return data;
}

export function logoutUser() {
  localStorage.removeItem("roadguard_token");
  localStorage.removeItem("roadguard_user");
}

export function getCurrentUser() {
  const user = localStorage.getItem("roadguard_user");
  return user ? JSON.parse(user) : null;
}

export async function getComplaints() {
  const response = await fetch(`${API_BASE_URL}/api/complaints`);

  if (!response.ok) {
    throw new Error("Failed to fetch complaints");
  }

  return response.json();
}

export async function submitComplaint(formData) {
  const response = await fetch(`${API_BASE_URL}/api/complaints`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.msg || "Complaint submission failed");
  }

  return data;
}

export async function getComplaint(id) {
  const response = await fetch(`${API_BASE_URL}/api/complaints/${id}`);

  if (!response.ok) {
    throw new Error("Complaint not found");
  }

  return response.json();
}

export async function submitFeedback(id, rating, comment) {
  const response = await fetch(
    `${API_BASE_URL}/api/complaints/${id}/feedback`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ rating, comment })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.msg || "Feedback submission failed");
  }

  return data;
}

export async function updateComplaintStatus(id, status, authority_response) {
  const response = await fetch(
    `${API_BASE_URL}/api/complaints/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders()
      },
      body: JSON.stringify({ status, authority_response })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.msg || "Status update failed");
  }

  return data;
}
