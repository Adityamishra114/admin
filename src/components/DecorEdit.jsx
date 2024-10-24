import { useEffect, useState, useRef } from "react";
import { url } from "../config";
import JoditEditor from "jodit-react";
import { useNavigate, useParams } from "react-router-dom";
// import { RichTextEditor } from "./RichEditor";
const DecorEdit = () => {
  const { id: decorId } = useParams();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [decorData, setDecorData] = useState({
    title: "",
    owner: {
      name: "",
      phone: "",
      email: "",
      instagram: "",
      facebook: "",
    },
    photos: [],
    videos: [],
    typeOfDecoration: "",
    location: "",
    description: "",
    isVerified: false,
  });

  useEffect(() => {
    if (decorData.description) {
      setContent(decorData.description);
    }
  }, [decorData.description]);
  const handleEditorChange = (newContent) => {
    setContent(newContent);
    decorData.description = newContent;
  };

  const [error, setError] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  useEffect(() => {
    const fetchDecorData = async () => {
      try {
        const response = await fetch(`${url}/api/decor/decoration/${decorId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch car data");
        }
        const decorData = await response.json();
        setDecorData({
          ...decorData.decor,
          isVerified: decorData.decor.isVerified || false,
        });
        setDecorData(decorData.decor);
        setPhotoPreviews(decorData.decor.photos);
        setVideoPreviews(decorData.decor.videos);
      } catch (error) {
        setError(error.message);
      }
    };

    if (decorId) {
      fetchDecorData();
    }
  }, [decorId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("owner.")) {
      setDecorData({
        ...decorData,
        owner: {
          ...decorData.owner,
          [name.split(".")[1]]: value,
        },
      });
    } else {
      setDecorData({ ...decorData, [name]: value });
    }
  };

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === "photos") {
      const newPhotoPreviews = files.map((file) => URL.createObjectURL(file));
      setPhotoPreviews((prev) => [...prev, ...newPhotoPreviews]);
      setDecorData({ ...decorData, photos: [...decorData.photos, ...files] });
    } else if (type === "videos") {
      const newVideoPreviews = files.map((file) => URL.createObjectURL(file));
      setVideoPreviews((prev) => [...prev, ...newVideoPreviews]);
      setDecorData({ ...decorData, videos: [...decorData.videos, ...files] });
    }
  };
  useEffect(() => {
    return () => {
      photoPreviews.forEach((photo) => URL.revokeObjectURL(photo));
      videoPreviews.forEach((video) => URL.revokeObjectURL(video));
    };
  }, [photoPreviews, videoPreviews]);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        throw new Error("No authentication token found.");
      }

      console.log("Form data before sending:", decorData);
      const formData = new FormData();
      formData.append("title", decorData.title);
      formData.append("owner[name]", decorData.owner.name);
      formData.append("owner[phone]", decorData.owner.phone);
      formData.append("owner[email]", decorData.owner.email);
      formData.append("owner[instagram]", decorData.owner.instagram);
      formData.append("owner[facebook]", decorData.owner.facebook);
      formData.append("typeOfDecoration", decorData.typeOfDecoration);
      formData.append("location", decorData.location);

      formData.append("description", decorData.description);
      formData.append("isVerified", decorData.isVerified);

      decorData.photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      decorData.videos.forEach((video) => {
        formData.append("videos", video);
      });
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const response = await fetch(
        `${url}/api/decor/edit-decorations/${decorId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
          credentials: "include",
        }
      );
      console.log("Response:", response);
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error Data:", errorData);

        if (errorData.message === "Not Authorized") {
          setError("Session expired. Please log in again.");
          localStorage.removeItem("authToken");
          navigate("/login");
          return;
        }

        const message = errorData.errors
          ? errorData.errors[0].msg
          : errorData.message || "An error occurred.";
        setError(message);
        return;
      }
      const textResponse = await response.text();
      const result = JSON.parse(textResponse);
      console.log("Data received:", result);
      console.log("Decoration created successfully:", result);
      navigate("/decorations-lists");
    } catch (error) {
      console.error("Fetch error:", error);
      setError("An error occurred while submitting the form.");
    } finally {
      setLoading(false);
    }
  };
  return (
    <form
      encType="multipart/form-data"
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto p-4 border rounded-lg shadow-md"
    >
      <h2 className="text-2xl font-semibold mb-4">Update Decoration</h2>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="title">
          Title
        </label>
        <input
          type="text"
          name="title"
          id="title"
          value={decorData.title}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <h3 className="text-xl font-semibold mb-2">Owner Information</h3>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="owner.name">
          Name
        </label>
        <input
          type="text"
          name="owner.name"
          value={decorData.owner.name}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="owner.phone">
          Phone
        </label>
        <input
          type="text"
          name="owner.phone"
          value={decorData.owner.phone}
          onChange={handleChange}
          required
          minLength={10}
          maxLength={15}
          className="w-full border rounded p-2"
        />
        {error && <p className="text-red-700 text-sm">{error}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="owner.email">
          Email
        </label>
        <input
          type="email"
          name="owner.email"
          value={decorData.owner.email}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="owner.instagram">
          Instagram
        </label>
        <input
          type="text"
          name="owner.instagram"
          value={decorData.owner.instagram}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="owner.facebook">
          Facebook
        </label>
        <input
          type="text"
          name="owner.facebook"
          value={decorData.owner.facebook}
          onChange={handleChange}
          className="w-full border rounded p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="photos">
          Photos
        </label>
        <input
          ref={photoInputRef}
          type="file"
          name="photos"
          multiple
          accept="image/*"
          onChange={(e) => handleFileChange(e, "photos")}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="mt-4 grid grid-cols-2 gap-4">
          {Array.isArray(photoPreviews) &&
            photoPreviews.map((src, index) => (
              <img
                key={index}
                src={`${url}${src}`}
                alt={`preview ${index}`}
                className="w-full h-32 object-cover rounded"
              />
            ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="videos">
          Videos
        </label>
        <input
          ref={videoInputRef}
          type="file"
          name="videos"
          multiple
          accept="video/*"
          onChange={(e) => handleFileChange(e, "videos")}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="mt-4 grid grid-cols-1 gap-4">
          {Array.isArray(videoPreviews) &&
            videoPreviews.map((src, index) => (
              <video
                key={index}
                controls
                className="w-full h-32 object-cover rounded"
              >
                <source  src={`${url}${src}`} type="video/mp4" />
              </video>
            ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="typeOfDecoration">
          Type of Decoration
        </label>
        <select
          name="typeOfDecoration"
          value={decorData.typeOfDecoration}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        >
          <option value="">Select Type</option>
          <option value="Churches">Churches</option>
          <option value="Halls">Halls</option>
          <option value="Cars">Cars</option>
          <option value="Chair Covers">Chair Covers</option>
          <option value="LED Signs">LED Signs</option>
        </select>
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="location">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={decorData.location}
          onChange={handleChange}
          required
          className="w-full border rounded p-2"
        />
      </div>
      <div className="mb-4">
        <label className="block text-gray-700 mb-1" htmlFor="description">
          Description
        </label>
        <JoditEditor
          ref={editor}
          value={content}
          tabIndex={1}
          onChange={handleEditorChange}
          className="w-full border border-gray-300 rounded"
        />
         {/* <RichTextEditor
         name="description"
         required
         value={decorData.description}
           onChange={handleChange}
          className="w-full border border-gray-300 rounded"
        /> */}
        {/* <textarea
          name="description"
          required
          value={decorData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded"
        /> */}
      </div>
      <div className="mb-4">
        <label className="flex items-center">
          <input
            type="checkbox"
            name="isVerified"
            checked={decorData.isVerified}
            onChange={() =>
              setDecorData((prev) => ({
                ...prev,
                isVerified: !prev.isVerified,
              }))
            }
            className="mr-2"
          />
          Is Verified
        </label>
      </div>
      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 text-white rounded ${
          loading ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        {loading ? "Submitting..." : "Add Decoration"}
      </button>
      {error && <p className="text-red-500 mt-2">{error}</p>}
    </form>
  );
};

export default DecorEdit;
