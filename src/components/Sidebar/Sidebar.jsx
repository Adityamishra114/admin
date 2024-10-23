import { NavLink } from "react-router-dom";
import { assets } from "../../assets/assets";
import "./Sidebar.css";
const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-options">
        <NavLink to="/add-car" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Cars</p>
        </NavLink>
        <NavLink to="/cars-list" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Cars Lists</p>
        </NavLink>
        <NavLink to="/add-decoration" className="sidebar-option">
          <img src={assets.add_icon} alt="" />
          <p>Add Decoration</p>
        </NavLink>
        <NavLink to="/decorations-lists" className="sidebar-option">
          <img src={assets.order_icon} alt="" />
          <p>Decoration Lists</p>
        </NavLink>
      </div>
    </div>
  );
};

export default Sidebar;
