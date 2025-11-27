import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import "./auth.css"; // Importing the CSS for styling
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
const Login = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmitLogin = async (e) => {
    e.preventDefault();

    if (!formData.email.trim() || !formData.password.trim()) {
      toast.error("email and Password are required!");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/login`,
        {
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      if (res.data.success) {
        localStorage.setItem("token", res.data.token);
        localStorage.setItem(
          "auth",
          JSON.stringify({
            user: res.data.user,
            token: res.data.token,
          })
        );

        toast.success("Login successful!", {
          className: "bg-black text-white",
        });
        navigate("/dashboard/user");
      } else {
        toast.error(res.data.message, { className: "bg-red-600 text-white" });
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "An error occurred. Please try again.";

      toast.error(msg, { className: "bg-red-600 text-white" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md space-y-8 auth-box">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-black">
                Login
              </h1>
            </div>
            <form onSubmit={handleSubmitLogin} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="email" className="text-black">
                    Email
                  </Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    autoComplete="email"
                    className="mt-1 bg-white text-black border-black"
                  />
                </div>

                <div className="relative">
                  <Label htmlFor="password" className="text-black">
                    Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    autoComplete="current-password"
                    className="mt-1 pr-10 bg-white text-black border-black"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-7 text-black hover:text-gray-700 cursor-pointer"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800 cursor-pointer"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <Skeleton className="h-4 w-4 rounded-full bg-white" />
                    <span>Logging in...</span>
                  </div>
                ) : (
                  "Login"
                )}
              </Button>
              <div className="flex flex-col items-center">
                <Link to="/register">Don't have an account ? Register</Link>
                <Link to="/forgot-password">Forgot Password ?</Link>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
