import { useState } from "react";
import { assets } from "../../assets/assets";
import "./Navbar.css";
import { Link } from "react-router-dom";
import { url } from "../../config";
// import ThemeToggleButton from "../ThemeToggleButton";

const Navbar = () => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch(`${url}/api/user/logout`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await response.json();

      if (data.success) {
        console.log("Logged out successfully");
        localStorage.removeItem("authToken");
        window.location.href = "/login";
      } else {
        console.error("Logout failed:", data.message);
      }
    } catch (error) {
      console.error("An error occurred during logout:", error);
    }
  };

  return (
    <div className="navbar">
      <Link to={"/"}>
        <img className="logo" src={assets.logo} alt="" />
      </Link>
      <div className="profile-container">
        {/* <ThemeToggleButton /> */}
        <img
          className="profile"
          src={assets.profile_image}
          alt="Profile"
          onClick={toggleDropdown}
        />
        {dropdownOpen && (
          <div className="dropdown-menu ">
            <button onClick={handleLogout} className="dropdown-item">
              Logout
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Navbar;
