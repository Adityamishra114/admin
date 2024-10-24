import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { url } from "../config";
// import JoditEditor from "jodit-react";
import { RichTextEditor } from "./RichEditor";
// import ColorPicker from "./ColorPicker";
const CarForm = () => {
  // const editor = useRef(null);
  // const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  const [carData, setCarData] = useState({
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
    yearOfProduction: "",
    color: "",
    interior: "",
    typeOfCar: "",
    numberOfSeats: "",
    additionalAmenities: [],
    rentalPrice: "",
    location: "",
    rentalDuration: "hourly",
    specialOptionsForWedding: [],
    description: "",
    isVerified: false,
  });

  // useEffect(() => {
  //   if (carData.description) {
  //     setContent(carData.description);
  //   }
  // }, [carData.description]);
  // const handleEditorChange = (newContent) => {
  //   setContent(newContent);
  //   carData.description = newContent;
  // };

  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);

  useEffect(() => {
    const savedFormData = localStorage.getItem("carFormData");
    if (savedFormData) {
      setCarData(JSON.parse(savedFormData));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("carFormData", JSON.stringify(carData));
  }, [carData]);

  // const handleColorChange = (newColor) => {
  //   setFormData({ ...formData, color: newColor });
  // };


  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("owner.")) {
      const ownerField = name.split(".")[1];
      setCarData((prev) => ({
        ...prev,
        owner: { ...prev.owner, [ownerField]: value },
      }));
    } else {
      setCarData((prev) => ({ ...prev, [name]: value }));
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
        setCarData((prev) => ({ ...prev, photos: files }));
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
        setCarData((prev) => ({ ...prev, videos: files }));
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
      const formData = new FormData();
      formData.append("title", carData.title);
      formData.append("owner[name]", carData.owner.name);
      formData.append("owner[phone]", carData.owner.phone);
      formData.append("owner[email]", carData.owner.email);
      formData.append("owner[instagram]", carData.owner.instagram);
      formData.append("owner[facebook]", carData.owner.facebook);
      formData.append("yearOfProduction", carData.yearOfProduction);
      formData.append("color", carData.color);
      formData.append("typeOfCar", carData.typeOfCar);
      formData.append("interior", carData.interior);
      formData.append("numberOfSeats", carData.numberOfSeats);
      formData.append("rentalPrice", carData.rentalPrice);
      formData.append("location", carData.location);
      formData.append("rentalDuration", carData.rentalDuration);
      formData.append("additionalAmenities", carData.additionalAmenities);
      formData.append(
        "specialOptionsForWedding",
        carData.specialOptionsForWedding
      );
      formData.append("description", carData.description);
      formData.append("isVerified", carData.isVerified);

      carData.photos.forEach((photo) => {
        formData.append("photos", photo);
      });

      carData.videos.forEach((video) => {
        formData.append("videos", video);
      });
      for (let [key, value] of formData.entries()) {
        console.log(key, value);
      }
      const response = await fetch(`${url}/api/car/create-car`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        const errorData = await response.json();
        const message = errorData.errors
          ? errorData.errors[0].msg
          : errorData.message || "An error occurred.";
        setError(message);
        return;
      }

      const result = await response.json();
      console.log("Car created successfully:", result);
      localStorage.removeItem("carFormData");
      navigate("/cars-list");
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
      className="max-w-lg mx-auto p-4 bg-white shadow-md rounded"
    >
      <h2 className="text-2xl font-bold mb-4">Add New Car</h2>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="title">
          Car Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          value={carData.title}
          onChange={handleChange}
          required
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Car Owner Information</h3>
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="owner.name"
        >
          Car Owner Name
        </label>
        <input
          type="text"
          required
          name="owner.name"
          value={carData.owner.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="owner.phone"
        >
          Car Owner Phone
        </label>
        <input
          type="text"
          required
          name="owner.phone"
          value={carData.owner.phone}
          onChange={handleChange}
          minLength={10}
          maxLength={15}
          className="w-full p-2 border border-gray-300 rounded"
        />
        {error && <p className="text-red-700 text-sm">{error}</p>}
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="owner.email"
        >
          Car Owner Email
        </label>
        <input
          type="email"
          required
          name="owner.email"
          value={carData.owner.email}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="facebook">
          Car Owner Facebook (optional)
        </label>
        <input
          type="text"
          name="owner.facebook"
          value={carData.owner.facebook}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="instagram">
          Car Owner Instagram (optional)
        </label>
        <input
          type="text"
          name="owner.instagram"
          value={carData.owner.instagram}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
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
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="yearOfProduction"
        >
          Year of Production
        </label>
        <input
          type="number"
          required
          name="yearOfProduction"
          value={carData.yearOfProduction}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="color">
          Color
        </label>
        {/* <ColorPicker color={formData.color} onChange={handleColorChange} /> */}
        {/* <ColorPicker  name="color"
          required
          value={formData.color} /> */}
        <input
          type="text"
          name="color"
          required
          value={carData.color}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>
      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="typesOfCar"
        >
          Type of Car
        </label>
        <input
          type="text"
          name="typeOfCar"
          required
          value={carData.typeOfCar}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="interior">
          Interior
        </label>
        <input
          type="text"
          name="interior"
          required
          value={carData.interior}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="numberOfSeats"
        >
          Number of Seats
        </label>
        <input
          minLength={1}
          type="number"
          required
          name="numberOfSeats"
          value={carData.numberOfSeats}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="additionalAmenities"
        >
          Additional Amenities (comma-separated)
        </label>
        <input
          type="text"
          required
          name="additionalAmenities"
          value={carData.additionalAmenities.join(", ")}
          onChange={(e) =>
            setCarData({
              ...carData,
              additionalAmenities: e.target.value.split(", "),
            })
          }
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="rentalPrice"
        >
          Rental Price
        </label>
        <input
          type="number"
          required
          name="rentalPrice"
          value={carData.rentalPrice}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label className="block text-sm font-semibold mb-2" htmlFor="location">
          Location
        </label>
        <input
          type="text"
          required
          name="location"
          value={carData.location}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="rentalDuration"
        >
          Rental Duration
        </label>
        <select
          name="rentalDuration"
          required
          value={carData.rentalDuration}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="hourly">Hourly</option>
          <option value="daily">Daily</option>
          <option value="weekly">Weekly</option>
          <option value="monthly">Monthly</option>
        </select>
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="specialOptionsForWedding"
        >
          Special Options for Wedding (comma-separated)
        </label>
        <input
          type="text"
          required
          name="specialOptionsForWedding"
          value={carData.specialOptionsForWedding.join(", ")}
          onChange={(e) =>
            setCarData({
              ...carData,
              specialOptionsForWedding: e.target.value.split(", "),
            })
          }
          className="w-full p-2 border border-gray-300 rounded"
        />
      </div>

      <div className="mb-4">
        <label
          className="block text-sm font-semibold mb-2"
          htmlFor="description"
        >
          Description
        </label>
        {/* <JoditEditor
          ref={editor}
          value={content}
          tabIndex={1}
          onChange={handleEditorChange}
          className="w-full border border-gray-300 rounded"
        /> */}

        <RichTextEditor
          name="description"
          required
          value={carData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded"
        />
        {/* <textarea
          name="description"
          required
          value={carData.description}
          onChange={handleChange}
          className="w-full border border-gray-300 rounded"
        /> */}
      </div>

      <div className="mb-4">
        <label className="inline-flex items-center">
          <input
            type="checkbox"
            name="isVerified"
            checked={carData.isVerified}
            onChange={() =>
              setCarData({ ...carData, isVerified: !carData.isVerified })
            }
            className="mr-2"
          />
          <span className="text-sm">Is Verified</span>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className={`w-full p-2 text-white rounded ${
          loading ? "bg-gray-400" : "bg-blue-600"
        }`}
      >
        {loading ? "Submitting..." : "Add Car"}
      </button>
    </form>
  );
};

export default CarForm;
