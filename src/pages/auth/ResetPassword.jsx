import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const { token } = useParams();
  const navigate = useNavigate();

  const passwordValidations = [
    {
      id: "length",
      message: "Must be at least 15 characters long",
      isValid: formData.password.length >= 15,
    },
    {
      id: "uppercase",
      message: "Must contain at least one uppercase letter",
      isValid: /[A-Z]/.test(formData.password),
    },
    {
      id: "lowercase",
      message: "Must contain at least one lowercase letter",
      isValid: /[a-z]/.test(formData.password),
    },
    {
      id: "number",
      message: "Must contain at least one number",
      isValid: /[0-9]/.test(formData.password),
    },
    {
      id: "special",
      message: "Must contain at least one special character",
      isValid: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
    },
  ];

  const isPasswordMatch = formData.password === formData.confirmPassword;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleResetPassword = async (e) => {
    e.preventDefault();

    const isPasswordValid = passwordValidations.every((rule) => rule.isValid);
    if (!isPasswordValid || !isPasswordMatch) {
      toast.error("Please fix the password requirements.");
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${
          import.meta.env.VITE_API
        }/api/v1/admin/reset-password-admin/${token}`,
        { password: formData.password }
      );

      if (res.data.success) {
        toast.success("Password reset successfully!");
        navigate("/");
      } else {
        toast.error(res.data.message || "Something went wrong.");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message || "An error occurred. Please try again."
      );
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
              <h1 className="text-3xl font-bold tracking-tight text-black mt-4">
                Reset Password
              </h1>
              <p className="mt-2 text-black">
                Enter your new password below to reset it.
              </p>
            </div>

            <form onSubmit={handleResetPassword} className="mt-8 space-y-6">
              <div className="space-y-4">
                {/* Password Field */}
                <div className="relative">
                  <Label htmlFor="password" className="text-black">
                    New Password
                  </Label>
                  <Input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="mt-1 pr-10 bg-white text-black border-black"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-black hover:text-gray-700"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                  >
                    {passwordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>

                  {/* Password Validation */}
                  <div className="mt-2 space-y-1">
                    {passwordValidations.map((rule) => (
                      <div
                        key={rule.id}
                        className={`flex items-center text-sm ${
                          rule.isValid ? "text-green-600" : "text-red-600"
                        }`}
                      >
                        {rule.isValid ? <FaCheck /> : <FaTimes />}
                        <span className="ml-2">{rule.message}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Confirm Password Field */}
                <div className="relative">
                  <Label htmlFor="confirmPassword" className="text-black">
                    Confirm Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={confirmPasswordVisible ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="mt-1 pr-10 bg-white text-black border-black"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-8 text-black hover:text-gray-700"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                  >
                    {confirmPasswordVisible ? <FaEyeSlash /> : <FaEye />}
                  </button>

                  {/* Password Match Validation */}
                  <div
                    className={`mt-2 flex items-center text-sm ${
                      isPasswordMatch ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    {isPasswordMatch ? <FaCheck /> : <FaTimes />}
                    <span className="ml-2">Passwords must match</span>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-black text-white hover:bg-gray-800"
                disabled={loading}
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <span>Resetting...</span>
                  </div>
                ) : (
                  "Reset Password"
                )}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default ResetPassword;
