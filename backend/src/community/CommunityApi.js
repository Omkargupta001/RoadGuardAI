
const API_BASE_URL = "http://127.0.0.1:5001";

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
    body: formData
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Complaint submission failed");
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
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ rating, comment })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Feedback submission failed");
  }

  return data;
}

export async function updateComplaintStatus(id, status, authority_response) {
  const response = await fetch(
    `${API_BASE_URL}/api/complaints/${id}/status`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ status, authority_response })
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || "Status update failed");
  }

  return data;
}


