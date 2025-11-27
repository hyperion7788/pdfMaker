import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import Navbar from "../components/Navbar";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [emailSent, setEmailSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email.trim()) {
      toast.error("Username is required"); // ✅ Error toast
      return;
    }

    setLoading(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/admin/forgot-password-admin`,
        { email }
      );

      if (res.data.success) {
        toast.success("Reset link sent to your email."); // ✅ Success toast
        setEmailSent(true);
      } else {
        toast.error(res.data.message); // ✅ Error toast
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
              <h1 className="text-3xl font-bold tracking-tight text-black">
                Forgot Password
              </h1>
            </div>

            {!emailSent ? (
              <form onSubmit={handleForgotPassword} className="mt-8 space-y-6">
                <div>
                  <Label htmlFor="email" className="text-black">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="mt-1 bg-white text-black border-black"
                    placeholder="Enter your email"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full bg-black text-white hover:bg-gray-800"
                  disabled={loading}
                >
                  {loading ? "Sending..." : "Send Reset Link"}
                </Button>
                <div className="flex justify-center">
                  <Link
                    to="/login"
                    className="text-sm font-medium text-black hover:underline"
                  >
                    Back to Login
                  </Link>
                </div>
              </form>
            ) : (
              <div className="text-center space-y-6">
                <p className="text-sm text-black">
                  A verification link has been sent to your email. Please check
                  your inbox to reset your password.
                </p>
                <Button
                  asChild
                  className="w-full bg-black text-white hover:bg-gray-800"
                >
                  <Link to="/">Back to Login</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ForgotPassword;
