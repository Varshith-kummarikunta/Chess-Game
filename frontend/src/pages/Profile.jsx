import { useState } from "react";
import { api } from "../api/client";

function Profile() {
  const [file, setFile] = useState(null);
  const [imageUrl, setImageUrl] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/uploads", formData);

      setImageUrl(response.data.filePath); // ✅ set image URL here
      alert("File uploaded successfully!");
    } catch (err) {
      console.error(err);
      alert("Upload failed");
    }
  };

  return (
    <div>
      <h2>Profile Page</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="file"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button type="submit">Upload</button>
      </form>

      {/* Show uploaded image */}
      {imageUrl && (
        <div>
          <h3>Uploaded Image:</h3>
          <img
            src={`http://localhost:5000${imageUrl}`}
            width="150"
            alt="Profile"
          />
        </div>
      )}
    </div>
  );
}

export default Profile;