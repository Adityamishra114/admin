import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./List.css";
import { url } from "../../config";

const DecorationLists = () => {
  const [list, setList] = useState([]);
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 10;

  const fetchDecors = async (page = 1, fetchAll = false) => {
    try {
      const limitParam = fetchAll ? 0 : limit;
      const response = await fetch(
        `${url}/api/decor/decorations-lists?page=${page}&limit=${limitParam}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (data.success) {
        if (data.decors.length > 0) {
          setList(data.decors);
          setTotalPages(data.pagination.totalPages);
          setError("");
        } else {
          setList([]);
          setError("No decors found.");
        }
      } else {
        setError("No decors found.");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("");
    }
  };

  useEffect(() => {
    fetchDecors(currentPage);
  }, [currentPage]);

  const handleEditDecor = (decorId) => {
    navigate(`/edit-decor/${decorId}`);
  };
  const removeCar = async (decorId) => {
    console.log("Removing decor with ID:", decorId);
    const confirmation = window.confirm(
      "Are you sure you want to delete this decor?"
    );
    if (!confirmation) {
      console.log("Decoration deletion cancelled.");
      return;
    }

    try {
      const token = localStorage.getItem("authToken");

      if (!token) {
        console.error("No token found. User might not be logged in.");
        return;
      }

      console.log("Token being sent:", token);

      const response = await fetch(
        `${url}/api/decor/remove-decorations/${decorId}`,
        {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        console.log("Decoration deleted successfully:", data.message);
        setList((prevList) =>
          prevList.filter((decor) => decor._id !== decorId)
        );
        fetchDecors(currentPage);
      } else {
        console.error("Error deleting decor:", data.message || "Unknown error");
      }
    } catch (error) {
      console.error("Error deleting decor:", error);
    }
  };

  return (
    <div className="list add flex-col">
      <p className="text-xl font-bold">All Decorations List</p>
      {error && <p className="text-red-500">{error}</p>}
      <div className="overflow-x-auto">
        <div className="list-table mb-8 min-w-full">
          <div className="list-table-format title">
            <b className="flex-1">Image</b>
            <b className="flex-1">Title</b>
            <b className="flex-1">Location</b>
            <b className="flex-1">Type of Decoration</b>
            <b className="flex-1">Actions</b>
          </div>
          {list.map((item, index) => {
            return (
              <div key={index} className="list-table-format">
                {item.photos && item.photos.length > 0 ? (
                  <img src={`${url}${item.photos[0]}`} />
                ) : (
                  <p>No image available</p>
                )}
                <p className="truncate">{item.title}</p>
                <p>{item.location}</p>
                <p>{item.typeOfDecoration}</p>
                <span className="flex space-x-2">
                  <p
                    onClick={() => handleEditDecor(item._id)}
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
              fetchDecors(currentPage - 1);
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
              fetchDecors(currentPage + 1);
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

export default DecorationLists;
