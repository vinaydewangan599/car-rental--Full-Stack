// src/context/AppContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useNavigate } from "react-router-dom";

axios.defaults.baseURL = import.meta.env.VITE_BASE_URL;

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const navigate = useNavigate();
  const currency = import.meta.env.VITE_CURRENCY || "$";

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [pickupDate, setPickupDate] = useState("");
  const [returnDate, setReturnDate] = useState("");
  const [cars, setCars] = useState([]);

  // Fetch logged-in user data
  const fetchUser = async () => {
    try {
      const { data } = await axios.get("/api/users/data");
      if (data.success) {
        setUser(data.user);
        setIsOwner(data.user.role === "owner");
      } else {
        navigate("/");
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Get token from localStorage
  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  // Fetch user once token is available
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common["Authorization"] = `${token}`;
      fetchUser();
      
    }
  }, [token]);

  const fetchCars = async () => {
    try {
      const { data } = await axios.get("/api/users/cars");
      if (data.success) setCars(data.cars);
      else toast.error(data.message);
    } catch (error) {
      toast.error(error.message);
    }
  };
  useEffect(() => {
    if (token) {
      fetchCars(); // fetch cars for the context
    }
  }, [token]);


  const logout = () => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsOwner(false);
    delete axios.defaults.headers.common["Authorization"];
    toast.success("Logout Successfully");
    navigate("/");
  };

  const value = {
    navigate,
    currency,
    axios,
    user,
    setUser,
    token,
    setToken,
    isOwner,
    setIsOwner,
    fetchUser,
    showLogin,
    setShowLogin,
    logout,
    fetchCars,
    cars,
    setCars,
    pickupDate,
    setPickupDate,
    returnDate,
    setReturnDate,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

export default AppProvider;