import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaCheck, FaTimes } from "react-icons/fa";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "react-toastify";
import { Skeleton } from "@/components/ui/skeleton";
import axios from "axios";
import "./auth.css";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import OtpVerification from "./OtpVerification";
const Register = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    rememberMe: false,
  });
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [confirmPasswordVisible, setConfirmPasswordVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [verificationStep, setVerificationStep] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isExpired, setIsExpired] = useState(false);

  // Password requirements state
  const [passwordRequirements, setPasswordRequirements] = useState({
    length: false,
    uppercase: false,
    lowercase: false,
    number: false,
    specialChar: false,
  });

  const OTP_TIMER_KEY = "otp_timer_start";
  const VERIFICATION_STEP_KEY = "verificationStep";
  const USER_EMAIL_KEY = "useremail";

  // Check for persisted state on component mount
  useEffect(() => {
    const savedVerificationStep =
      localStorage.getItem(VERIFICATION_STEP_KEY) === "true";
    const savedEmail = localStorage.getItem(USER_EMAIL_KEY);

    if (savedVerificationStep && savedEmail) {
      setVerificationStep(true);
      setFormData((prev) => ({ ...prev, email: savedEmail }));

      // Restore timer if possible
      const timerStart = localStorage.getItem(OTP_TIMER_KEY);
      if (timerStart) {
        const elapsed = Math.floor((Date.now() - parseInt(timerStart)) / 1000);
        const remaining = Math.max(0, 600 - elapsed);
        setTimeLeft(remaining);
        setIsExpired(remaining <= 0);
      }
    }
  }, []);

  // Check password requirements whenever password changes
  useEffect(() => {
    if (formData.password) {
      setPasswordRequirements({
        length: formData.password.length >= 8,
        uppercase: /[A-Z]/.test(formData.password),
        lowercase: /[a-z]/.test(formData.password),
        number: /[0-9]/.test(formData.password),
        specialChar: /[!@#$%^&*(),.?":{}|<>]/.test(formData.password),
      });
    } else {
      setPasswordRequirements({
        length: false,
        uppercase: false,
        lowercase: false,
        number: false,
        specialChar: false,
      });
    }
  }, [formData.password]);

  useEffect(() => {
    if (verificationStep) {
      // Always update the timer key when verification step starts
      localStorage.setItem(OTP_TIMER_KEY, Date.now());
      localStorage.setItem(VERIFICATION_STEP_KEY, "true");
      setTimeLeft(600);
      setIsExpired(false);
    }
  }, [verificationStep]);

  useEffect(() => {
    if (verificationStep && timeLeft > 0 && !isExpired) {
      const timerId = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timerId);
    } else if (timeLeft === 0) {
      setIsExpired(true);
      toast.error("OTP has expired. Please request a new one.");
    }
  }, [timeLeft, isExpired, verificationStep]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validatePassword = () => {
    const { password, confirmPassword } = formData;
    if (password !== confirmPassword) {
      toast.error("Passwords don't match!");
      return false;
    }

    const allRequirementsMet =
      Object.values(passwordRequirements).every(Boolean);
    if (!allRequirementsMet) {
      toast.error("Password doesn't meet all requirements!");
      return false;
    }

    return true;
  };

  const handleSubmitRegister = async (e) => {
    e.preventDefault();

    if (
      !formData.name.trim() ||
      !formData.email.trim() ||
      !formData.password.trim() ||
      !formData.confirmPassword.trim()
    ) {
      toast.error("All fields are required!");
      return;
    }

    if (!/^\S+@\S+\.\S+$/.test(formData.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    if (!validatePassword()) {
      return;
    }

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/register`,
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          password: formData.password,
        }
      );

      if (res.data.success) {
        toast.success("Registration successful! Please verify your email.");
        localStorage.setItem(USER_EMAIL_KEY, formData.email.trim());
        localStorage.setItem(VERIFICATION_STEP_KEY, "true");
        setVerificationStep(true);
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      const msg =
        error.response?.data?.message || "An error occurred. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/send-otp-again`,
        { email: formData.email }
      );

      if (res.data.success) {
        toast.success("New OTP sent successfully!");
        setTimeLeft(600);
        setIsExpired(false);
        localStorage.setItem(OTP_TIMER_KEY, Date.now());
      } else {
        toast.error(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to resend OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleBackToRegister = () => {
    setVerificationStep(false);
    localStorage.removeItem(VERIFICATION_STEP_KEY);
    localStorage.removeItem(OTP_TIMER_KEY);
  };

  if (verificationStep) {
    return (
      <>
        <Navbar />
        <div className="mt-top"></div>
        <div className="h-[90vh] flex flex-col items-center justify-center bg-white">
          <OtpVerification
            email={formData.email}
            onVerify={async (otp) => {
              if (isExpired) {
                toast.error("OTP has expired. Please request a new one.");
                return;
              }
              setLoading(true);
              try {
                const res = await axios.post(
                  `${import.meta.env.VITE_API}/api/v1/auth/verify-email`,
                  { code: otp, email: formData.email }
                );
                if (res.data.success) {
                  toast.success("Email verified successfully! please login");
                  localStorage.removeItem(VERIFICATION_STEP_KEY);
                  localStorage.removeItem(USER_EMAIL_KEY);
                  localStorage.removeItem(OTP_TIMER_KEY);
                  navigate("/login");
                } else {
                  toast.error(res.data.message);
                }
              } catch (error) {
                toast.error(
                  error.response?.data?.message || "Verification failed"
                );
              } finally {
                setLoading(false);
              }
            }}
            onResend={handleResendOtp}
            loading={loading}
            isExpired={isExpired}
            timeLeft={timeLeft}
            onBack={handleBackToRegister}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="mt-top"></div>
      <div className="h-[90vh] flex flex-col bg-white">
        <div className="flex-1 flex items-center justify-center py-12 px-4">
          <div className="w-full max-w-md space-y-8 auth-box">
            <div className="text-center">
              <h1 className="text-3xl font-bold tracking-tight text-black">
                Register
              </h1>
            </div>
            <form onSubmit={handleSubmitRegister} className="mt-8 space-y-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-black">
                    Full Name
                  </Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    autoComplete="name"
                    className="mt-1 bg-white text-black border-black"
                  />
                </div>

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
                    autoComplete="new-password"
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

                  {/* Password requirements */}
                  <div className="mt-2 text-sm text-gray-600">
                    <p className="font-medium">Password must contain:</p>
                    <ul className="space-y-1 mt-1">
                      <li
                        className={`flex items-center ${
                          passwordRequirements.length
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        {passwordRequirements.length ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimes className="mr-1" />
                        )}
                        At least 8 characters
                      </li>
                      <li
                        className={`flex items-center ${
                          passwordRequirements.uppercase
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        {passwordRequirements.uppercase ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimes className="mr-1" />
                        )}
                        At least one uppercase letter
                      </li>
                      <li
                        className={`flex items-center ${
                          passwordRequirements.lowercase
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        {passwordRequirements.lowercase ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimes className="mr-1" />
                        )}
                        At least one lowercase letter
                      </li>
                      <li
                        className={`flex items-center ${
                          passwordRequirements.number
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        {passwordRequirements.number ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimes className="mr-1" />
                        )}
                        At least one number
                      </li>
                      <li
                        className={`flex items-center ${
                          passwordRequirements.specialChar
                            ? "text-green-500"
                            : "text-gray-500"
                        }`}
                      >
                        {passwordRequirements.specialChar ? (
                          <FaCheck className="mr-1" />
                        ) : (
                          <FaTimes className="mr-1" />
                        )}
                        At least one special character
                      </li>
                    </ul>
                  </div>
                </div>

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
                    autoComplete="new-password"
                    className="mt-1 pr-10 bg-white text-black border-black"
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-7 text-black hover:text-gray-700 cursor-pointer"
                    onClick={() =>
                      setConfirmPasswordVisible(!confirmPasswordVisible)
                    }
                  >
                    {confirmPasswordVisible ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                  {formData.confirmPassword && (
                    <p
                      className={`mt-1 text-sm ${
                        formData.password === formData.confirmPassword
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {formData.password === formData.confirmPassword
                        ? "Passwords match!"
                        : "Passwords don't match!"}
                    </p>
                  )}
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
                    <span>Registering...</span>
                  </div>
                ) : (
                  "Register"
                )}
              </Button>
              <div className="text-center">
                <p className="text-sm">
                  Already have an account?{" "}
                  <Link to="/login" className="text-blue-600 hover:underline">
                    Login here
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Register;
