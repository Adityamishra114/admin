import { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar/Navbar.jsx";
import Sidebar from "./components/Sidebar/Sidebar.jsx";
import CarList from "./pages/CarsLists/List.jsx";
import AddCar from "./pages/Cars/Add.jsx";
import AddDecoration from "./pages/Decoration/Add.jsx";
import DecorationList from "./pages/DecorationLists/List.jsx";
import SignupForm from "./pages/Auth/SignupForm.jsx";
import LoginForm from "./pages/Auth/LoginForm.jsx";
import Homepage from "./pages/Home/Homepage.jsx";
import CarEditAndUpdate from "./pages/CarEditAndUpdate/CarEditAndUpdate.jsx";
import DecorEditAndUpdate from "./pages/DecorEditAndUpdate/DecorEditAndUpdate.jsx";

const App = () => {
  const [isAuth, setAuth] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (token) {
      setAuth(true);
    }
  }, []);
  return (
    <div>
      {isAuth ? (
        <>
          <Navbar />
          <hr />
          <div className="app-content">
            <Sidebar />
            <Routes>
              <Route path="/" element={<Homepage />} />
              <Route path="/add-car" element={<AddCar />} />
              <Route path="/edit-car/:id" element={<CarEditAndUpdate />} />
              <Route path="/cars-list" element={<CarList />} />
              <Route path="/add-decoration" element={<AddDecoration />} />
              <Route
                path="/edit-decor/:id"
                element={<DecorEditAndUpdate />}
              />
              <Route path="/decorations-lists" element={<DecorationList />} />
            </Routes>
          </div>
        </>
      ) : (
        <Routes>
          <Route path="/signup" element={<SignupForm setAuth={setAuth} />} />
          <Route path="/login" element={<LoginForm setAuth={setAuth} />} />
        </Routes>
      )}
    </div>
  );
};

export default App;
