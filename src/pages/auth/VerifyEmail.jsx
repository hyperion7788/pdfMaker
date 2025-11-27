import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { CheckCircle, XCircle, Mail, Loader2 } from "lucide-react";
import axios from "axios";

const VerifyEmail = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading");
  const [countdown, setCountdown] = useState(5);

  // 🔑 Call API when component mounts
  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const { data } = await axios.get(
          `${import.meta.env.VITE_API}/api/v1/auth/verify/${token}`
        );

        if (data.success) {
          setStatus("success");
        } else {
          setStatus("error");
        }
      } catch (err) {
        setStatus("error");
        console.log(err);
      }
    };

    verifyEmail();
  }, [token]);

  // 🔄 Countdown + redirect
  useEffect(() => {
    if (status === "success" || status === "error") {
      const timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            navigate("/login");
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [status, navigate]);

  // --- UI States ---
  const LoadingState = () => (
    <div className="text-center animate-pulse">
      <div className="mb-6 flex justify-center">
        <div className="relative">
          <Mail className="w-16 h-16 text-white animate-bounce" />
          <Loader2 className="w-6 h-6 text-white absolute -bottom-1 -right-1 animate-spin" />
        </div>
      </div>
      <h2 className="text-2xl font-bold mb-4 text-white">
        Verifying Your Email...
      </h2>
      <p className="text-green-100 text-lg">
        Please wait while we verify your email address.
      </p>
    </div>
  );

  const SuccessState = () => (
    <div className="text-center transform transition-all duration-700 ease-in-out scale-100">
      <div className="mb-6 flex justify-center">
        <CheckCircle className="w-20 h-20 text-white animate-pulse" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-white">
        Email Verified Successfully!
      </h2>
      <p className="text-green-100 text-lg mb-6">
        Your account has been activated. Redirecting to login...
      </p>
      <p className="text-white font-medium">
        Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
      </p>
    </div>
  );

  const ErrorState = () => (
    <div className="text-center">
      <div className="mb-6 flex justify-center">
        <XCircle className="w-20 h-20 text-red-300 animate-pulse" />
      </div>
      <h2 className="text-3xl font-bold mb-4 text-white">
        Verification Failed
      </h2>
      <p className="text-green-100 text-lg mb-6">
        The verification link is invalid or has expired. Redirecting to login...
      </p>
      <p className="text-white font-medium">
        Redirecting in {countdown} second{countdown !== 1 ? "s" : ""}...
      </p>
    </div>
  );

  return (
    <div className="flex items-center justify-center min-h-screen bg-green-700 text-white px-4">
      <div className="max-w-md w-full">
        <div className="bg-green-800 bg-opacity-50 backdrop-blur-sm rounded-2xl p-8 shadow-2xl border border-green-600">
          {status === "loading" && <LoadingState />}
          {status === "success" && <SuccessState />}
          {status === "error" && <ErrorState />}
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
