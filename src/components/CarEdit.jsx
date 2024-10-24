import { useEffect, useState, useRef } from "react";
import { url } from "../config";
import JoditEditor from "jodit-react";
// import ColorPicker from "./ColorPicker";
import { useNavigate, useParams } from "react-router-dom";
// import { RichTextEditor } from "./RichEditor";
const EditCarForm = () => {
  const { id: carId } = useParams();
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState("");
  const navigate = useNavigate();
  const editor = useRef(null);
  const [carData, setCarData] = useState({
    title: "",
    owner: {
      name: "",
      phone: "",
      email: "",
      facebook: "",
      instagram: "",
    },
    photos: [],
    videos: [],
    yearOfProduction: "",
    color: "",
    typeOfCar: "",
    interior: "",
    numberOfSeats: "",
    additionalAmenities: [],
    rentalPrice: "",
    location: "",
    rentalDuration: "hourly",
    specialOptionsForWedding: [],
    description: "",
    isVerified: false,
  });


  useEffect(() => {
    const fetchCarData = async () => {
      try {
        const response = await fetch(`${url}/api/car/car/${carId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch car data");
        }
        const carData = await response.json();
        setCarData({
          ...carData.car,
          isVerified: carData.car.isVerified || false, 
        });
        if (carData && carData.car) {
          setCarData(carData.car); 
          setPhotoPreviews(carData.car.photos || []);
          setVideoPreviews(carData.car.videos || []);
        }
      } catch (error) {
        setError(error.message);
      }
    };
  
    if (carId) {
      fetchCarData();
    }
  }, [carId]);
  
  console.log('Editing car with ID:', carId); 


  useEffect(() => {
    if (carData.description) {
      setContent(carData.description);
    }
  }, [carData.description]);
  const handleEditorChange = (newContent) => {
    setContent(newContent);
    carData.description = newContent;
  };

  // const handleColorChange = (newColor) => {
  //   setFormData({ ...formData, color: newColor });
  // };

  const [error, setError] = useState("");
  const [photoPreviews, setPhotoPreviews] = useState([]);
  const [videoPreviews, setVideoPreviews] = useState([]);
  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);
  // const handleChangeD = (value) => {
  //   setCarData((prevData) => ({
  //     ...prevData,
  //     description: value,
  //   }));
  // };

  console.log(carData.description);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith("owner.")) {
      setCarData({
        ...carData,
        owner: {
          ...carData.owner,
          [name.split(".")[1]]: value,
        },
      });
    } else {
      setCarData({ ...carData, [name]: value });
    }
  };
  const handleFileChange = (e, type) => {
    const files = Array.from(e.target.files);
    if (type === "photos") {
      setCarData({ ...carData, photos: files });
      setPhotoPreviews(files.map((file) => URL.createObjectURL(file)));
    } else if (type === "videos") {
      setCarData({ ...carData, videos: files });
      setVideoPreviews(files.map((file) => URL.createObjectURL(file)));
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
      formData.append(
        "additionalAmenities",(carData.additionalAmenities)
      );
      formData.append(
        "specialOptionsForWedding",(carData.specialOptionsForWedding)
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
  
      const response = await fetch(`${url}/api/car/edit-car/${carId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });
  
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
  
      const result = await response.json(); 
      console.log("Data received:", result);
      console.log("Car updated successfully:", result);
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
      <h2 className="text-2xl font-bold mb-4">Update Car</h2>

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
          multiple
          accept="image/*"
          onChange={(e) => handleFileChange(e, "photos")}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <div className="mt-4 grid grid-cols-2 gap-4">
           {Array.isArray(photoPreviews) && photoPreviews.map((src, index) => (
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
        {Array.isArray(videoPreviews) && videoPreviews.map((src, index) => (
            <video
              key={index}
              controls
              className="w-full h-32 object-cover rounded"
            >
              <source src={`${url}${src}`} type="video/mp4" />
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
          value={carData.description}
          onChange={handleChangeD}
          className="w-full border border-gray-300 rounded"
        /> */}
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
        {loading ? "Updating..." : "Update Car"}
      </button>
    </form>
  );
};

export default EditCarForm;
