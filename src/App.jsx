/* eslint-disable react-refresh/only-export-components */
/* eslint-disable no-unused-vars */
import { ThemeProvider } from "@/components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
import { createContext } from "react";
import { LogOut } from "lucide-react";
import { Outlet, useNavigate, Navigate } from "react-router-dom";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { API_BASE_URL } from "./lib/api.js";
import Lottie from "lottie-react";
import animationData from "./assets/Loading.json";

export const States = createContext(null);
function App() {
  const [Auth, setAuth] = useState(null);
  const [rootFolder, setRootFolder] = useState({});
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };
  useEffect(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        if (decoded.exp < currentTime) {
          setAuth(null);
          localStorage.removeItem("token");
          navigate("/login");
          return;
        }
        const timeUntilExpiry = (decoded.exp - currentTime) * 1000;
        const logoutTimer = setTimeout(() => {
          setAuth(null);
          localStorage.removeItem("token");
          navigate("/login");
        }, timeUntilExpiry);
        console.log("Decoded token:", decoded);
        const userId =
          decoded[
            "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"
          ]; // This is the ClaimTypes.NameIdentifier claim
        const username = decoded.sub; // This is the JwtRegisteredClaimNames.Sub claim
        setAuth({ userId, username });
        fetch(`${API_BASE_URL}/user/${userId}/Folders`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
          .then((res) => {
            if (!res.ok)
              throw new Error("Error Occured While Getting the Root Folder");
            return res.json();
          })
          .then((data) => {
            setLoading(false);
            setRootFolder(data);
            navigate("/folders");
          })
          .catch((error) => {
            console.error("Fetch error:", error);
            setRootFolder(null);
          });
      } catch (error) {
        setAuth(null);
        console.error("Invalid token:", error);
        localStorage.removeItem("token");
        navigate("/login");
      }
    } else {
      setAuth(null);
      console.error("No token available");
      navigate("/login");
    }
  }, [navigate]);
  if (loading)
    return (
      <div className="w-screen h-screen flex justify-center items-center flex-col">
        <Lottie
          animationData={animationData}
          loop
          style={{ height: 200, width: 200 }}
        />
        <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
          Do Some Pushups while the API is Loading !
        </h3>
      </div>
    );
  if (Auth) {
    return (
      <ThemeProvider defaultTheme="dark">
        <States.Provider value={{ rootFolder, setRootFolder, Auth, setAuth }}>
          <div className="flex justify-between p-6 border-b border-b-secondary w-full ">
            <h3 className="scroll-m-20 text-2xl font-semibold tracking-tight">
              File Uploader
            </h3>
            <div className="flex items-center justify-center">
              <ModeToggle />
              <div
                className="border p-2 rounded-sm size flex justify-center items-center cursor-pointer transition-all duration-100 backdrop-brightness-220 hover:backdrop-brightness-300"
                onClick={handleLogout}
              >
                <LogOut size={18} />
              </div>
            </div>
          </div>
          <Outlet />
        </States.Provider>
      </ThemeProvider>
    );
  }
  return <Navigate to="/login" replace />;
}
export default App;
