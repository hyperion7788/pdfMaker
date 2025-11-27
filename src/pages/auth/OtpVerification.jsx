import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "react-toastify";

const OtpVerification = ({
  email,
  onVerify,
  onResend,
  loading = false,
  isExpired = false,
  timeLeft = 600,
  onBack,
}) => {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef([]);

  const handleOtpChange = (index, value) => {
    const newCode = [...otp];
    if (value.length > 1) {
      const pastedCode = value.slice(0, 6).split("");
      for (let i = 0; i < 6; i++) {
        newCode[i] = pastedCode[i] || "";
      }
      setOtp(newCode);
      const lastFilledIndex = newCode.findLastIndex((digit) => digit !== "");
      const focusIndex = lastFilledIndex < 5 ? lastFilledIndex + 1 : 5;
      inputRefs.current[focusIndex].focus();
    } else {
      newCode[index] = value;
      setOtp(newCode);
      if (value && index < 5) {
        inputRefs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds
      .toString()
      .padStart(2, "0")}`;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalOtp = otp.join("");
    if (finalOtp.length === 6) {
      onVerify(finalOtp);
    } else {
      toast.error("Please enter a valid 6-digit OTP");
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 auth-box">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight text-black">
          Verify Email
        </h1>
        <p className="mt-2 text-sm text-gray-600">
          We've sent a verification code to {email}
        </p>
        <p className="mt-1 text-sm text-gray-600">
          Time remaining: {formatTime(timeLeft)}
        </p>
      </div>
      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <div className="space-y-6">
          <div className="flex justify-between gap-2">
            {otp.map((digit, index) => (
              <Input
                key={index}
                ref={(el) => (inputRefs.current[index] = el)}
                type="number"
                value={digit}
                onChange={(e) => handleOtpChange(index, e.target.value)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="pinCode-inp"
                min="0"
                max="9"
                maxLength="1"
              />
            ))}
          </div>
        </div>

        <Button
          type="submit"
          className="w-full bg-black text-white hover:bg-gray-800 cursor-pointer"
          disabled={loading || isExpired}
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-full bg-white" />
              <span>Verifying...</span>
            </div>
          ) : isExpired ? (
            "OTP Expired"
          ) : (
            "Verify Email"
          )}
        </Button>

        <div className="flex justify-between items-center mt-4">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="text-sm text-gray-600 hover:underline"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={onResend}
            className="text-sm text-blue-600 hover:underline"
            disabled={loading || !isExpired}
          >
            Resend OTP
          </button>
        </div>
      </form>
    </div>
  );
};

export default OtpVerification;
