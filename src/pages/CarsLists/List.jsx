import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./List.css";
import { url } from "../../config.js";

const CarList = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchCars = async (page = 1, fetchAll = false) => {
    try {
      const limitParam = fetchAll ? 0 : limit;
      const response = await fetch(
        `${url}/api/car/cars?page=${page}&limit=${limitParam}`,

        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
      console.log("Backend URL:", url);
      console.log("response URL:", response);
      const data = await response.json();

      if (data.success) {
        if (data.cars.length > 0) {
          setList(data.cars);
          setTotalPages(data.pagination.totalPages);
          setError("");
        } else {
          setList([]);
          setError("No cars found.");
        }
      } else {
        setError("No cars found.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("");
    }
  };

  useEffect(() => {
    fetchCars(currentPage);
  }, [currentPage]);

  const handleEditCar = (carId) => {
    navigate(`/edit-car/${carId}`);
  };
  const removeCar = async (carId) => {
    console.log("Removing car with ID:", carId);
    const confirmation = window.confirm(
      "Are you sure you want to delete this car?"
    );
    if (!confirmation) {
      console.log("Car deletion cancelled.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("No token found. User might not be logged in.");
        return;
      }

      console.log("Token being sent:", token);

      const response = await fetch(`${url}/api/car/remove-car/${carId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        console.log("Car deleted successfully:", data.message);
        setList((prevList) => prevList.filter((car) => car._id !== carId));
        fetchCars(currentPage);
      } else {
        console.error("Error deleting car:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting car:", error);
    }
  };

  return (
    <div className="list add flex-col">
      <p className="text-xl font-bold">All Cars List</p>
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <div className="list-table mb-8 min-w-full">
          <div className="list-table-format title">
            <b className="flex-1">Image</b>
            <b className="flex-1">Car Title</b>
            <b className="flex-1">Car Color</b>
            <b className="flex-1">Rental Price</b>
            <b className="flex-1">Actions</b>
          </div>
          {list.map((item, index) => {
            return (
              <div key={index} className="list-table-format">
                {item.photos && item.photos.length > 0 ? (
                  <img src={item.photos}  />
                ) : (
                  <p>No image available</p>
                )}
                <p className="truncate">{item.title}</p>
                <p>{item.color}</p>
                <p>₹{item.rentalPrice}</p>
                <span className="flex space-x-2">
                  <p
                    onClick={() => handleEditCar(item._id)}
                    className="cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={faEdit}
                      className="text-blue-500 hover:text-blue-700"
                    />
                  </p>
                  <p
                    onClick={() => removeCar(item._id)}
                    className="cursor-pointer"
                  >
                    <FontAwesomeIcon
                      icon={faTrash}
                      className="text-red-500 hover:text-red-700"
                    />
                  </p>
                </span>
              </div>
            );
          })}
        </div>
      </div>
      {list.length > 10 && (
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.max(prev - 1, 1));
              fetchCars(currentPage - 1);
            }}
            disabled={currentPage === 1}
            className={`px-4 py-2 bg-blue-500 text-white rounded ${
              currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Previous
          </button>
          <span>{`Page ${currentPage} of ${totalPages}`}</span>
          <button
            onClick={() => {
              setCurrentPage((prev) => Math.min(prev + 1, totalPages));
              fetchCars(currentPage + 1);
            }}
            disabled={currentPage === totalPages}
            className={`px-4 py-2 bg-blue-500 text-white rounded ${
              currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default CarList;
