import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../config";
import JoditEditor from "jodit-react";
import { useParams } from "react-router-dom";
// import { RichTextEditor } from "./RichEditor";
const DecorationForm = () => {
  const { id: decorId } = useParams();
  const [loading, setLoading] = useState(false);
  const editor = useRef(null);
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const photoInputRef = useRef();
  const videoInputRef = useRef();
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
    const fetchDecorData = async () => {
      try {
        const response = await fetch(`${url}/api/decor/decoration/${decorId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch decor data");
        }
        const decorData = await response.json();
        if (decorData && decorData.decor) {
          setDecorData(decorData.decor); 
          setPhotoPreviews(decorData.decor.photos || []);
          setVideoPreviews(decorData.decor.videos || []);
        }
      } catch (error) {
        setError(error.message);
      }
    };
  
    if (decorId) {
      fetchDecorData();
    }
  }, [decorId]);




  useEffect(() => {
    if (decorData.description) {
      setContent(decorData.description);
    }
  }, [decorData.description]);
  const handleEditorChange = (newContent) => {
    setContent(newContent);
    decorData.description = newContent;
  };



  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  useEffect(() => {
    const savedFormData = localStorage.getItem("decorFormData");
    if (savedFormData) {
      setDecorData(JSON.parse(savedFormData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("decorFormData", JSON.stringify(decorData));
  }, [decorData]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("owner.")) {
      const ownerField = name.split(".")[1];
      setDecorData((prev) => ({
        ...prev,
        owner: { ...prev.owner, [ownerField]: value },
      }));
    } else {
      setDecorData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const MAX_PHOTOS = 5;
  const MAX_PHOTO_SIZE_MB = 5;
  const MAX_VIDEOS = 3;
  const MAX_VIDEO_SIZE_MB = 60;

  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    let isValid = true;
    let errorMessage = "";

    if (type === "photos") {
      if (files.length > MAX_PHOTOS) {
        isValid = false;
        errorMessage = `You can upload a maximum of ${MAX_PHOTOS} photos.`;
      } else {
        const totalSize =
          files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);
        if (totalSize > MAX_PHOTO_SIZE_MB * MAX_PHOTOS) {
          isValid = false;
          errorMessage = `Each photo must be less than ${MAX_PHOTO_SIZE_MB} MB.`;
        }
      }
      if (isValid) {
        setDecorData((prev) => ({ ...prev, photos: files }));
        const photoURLs = files.map((file) => URL.createObjectURL(file));
        setPhotoPreviews(photoURLs);
      } else {
        alert(errorMessage);
      }
    } else if (type === "videos") {
      if (files.length > MAX_VIDEOS) {
        isValid = false;
        errorMessage = `You can upload a maximum of ${MAX_VIDEOS} videos.`;
      } else {
        const totalSize =
          files.reduce((sum, file) => sum + file.size, 0) / (1024 * 1024);
        if (totalSize > MAX_VIDEO_SIZE_MB * MAX_VIDEOS) {
          isValid = false;
          errorMessage = `Each video must be less than ${MAX_VIDEO_SIZE_MB} MB.`;
        }
      }
      if (isValid) {
        setDecorData((prev) => ({ ...prev, videos: files }));
        const videoURLs = files.map((file) => URL.createObjectURL(file));
        setVideoPreviews(videoURLs);
      } else {
        alert(errorMessage);
      }
    }
  };

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

      const response = await fetch(`${url}/api/decor/create-decorations`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });
      console.log("Form data after sending:", decorData);
      console.log("Form data after sending:", decorData.photos);
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
      localStorage.removeItem('decorFormData');
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
      <h2 className="text-2xl font-semibold mb-4">Add Decoration</h2>
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
          required
          multiple
          accept="image/*"
          onChange={(e) => handleFileChange(e, "photos")}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="mt-4 grid grid-cols-2 gap-4">
          {photoPreviews.map((src, index) => (
            <img
              key={index}
              src={src}
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
          required
          accept="video/*"
          onChange={(e) => handleFileChange(e, "videos")}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="mt-4 grid grid-cols-1 gap-4">
          {videoPreviews.map((src, index) => (
            <video
              key={index}
              controls
              className="w-full h-32 object-cover rounded"
            >
              <source src={src} type="video/mp4" />
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
              setDecorData((prev) => ({ ...prev, isVerified: !prev.isVerified }))
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

export default DecorationForm;
