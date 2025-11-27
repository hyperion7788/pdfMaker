import React, { useState, useEffect } from "react";
import { Mail, CheckCircle, ArrowRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

export default function ThankYouPage() {
  const [isVisible, setIsVisible] = useState(false);
  const [showCheckmark, setShowCheckmark] = useState(false);
  const [showSparkles, setShowSparkles] = useState(false);

  useEffect(() => {
    // Stagger animations
    setTimeout(() => setIsVisible(true), 100);
    setTimeout(() => setShowCheckmark(true), 800);
    setTimeout(() => setShowSparkles(true), 1200);
  }, []);

  return (
    <div className="min-h-screen bg-green-700 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-32 h-32 bg-white rounded-full animate-pulse"></div>
        <div className="absolute top-40 right-32 w-16 h-16 bg-white rounded-full animate-bounce delay-300"></div>
        <div className="absolute bottom-32 left-40 w-24 h-24 bg-white rounded-full animate-pulse delay-500"></div>
        <div className="absolute bottom-20 right-20 w-20 h-20 bg-white rounded-full animate-bounce delay-700"></div>
      </div>

      <div
        className={`bg-white rounded-2xl shadow-2xl p-8 md:p-12 max-w-md w-full text-center transform transition-all duration-1000 ease-out ${
          isVisible
            ? "translate-y-0 opacity-100 scale-100"
            : "translate-y-10 opacity-0 scale-95"
        }`}
      >
        {/* Icon Section */}
        <div className="relative mb-8">
          <div
            className={`w-20 h-20 bg-green-700 rounded-full flex items-center justify-center mx-auto transform transition-all duration-700 ease-out ${
              isVisible ? "rotate-0 scale-100" : "rotate-180 scale-0"
            }`}
          >
            <Mail className="w-10 h-10 text-white" />
          </div>

          {/* Checkmark overlay */}
          <div
            className={`absolute -top-2 -right-2 w-8 h-8 bg-green-600 rounded-full flex items-center justify-center transform transition-all duration-500 ease-bounce ${
              showCheckmark ? "scale-100 opacity-100" : "scale-0 opacity-0"
            }`}
          >
            <CheckCircle className="w-5 h-5 text-white" />
          </div>

          {/* Sparkles */}
          {showSparkles && (
            <>
              <Sparkles className="absolute -top-4 -left-4 w-6 h-6 text-green-500 animate-ping" />
              <Sparkles className="absolute -bottom-4 -right-4 w-6 h-6 text-green-500 animate-ping delay-300" />
              <Sparkles className="absolute top-0 right-8 w-4 h-4 text-green-400 animate-ping delay-500" />
            </>
          )}
        </div>

        {/* Main Content */}
        <div
          className={`transform transition-all duration-800 delay-300 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
            Thank You
          </h1>
          <h2 className="text-xl font-semibold text-green-700 mb-6">
            For creating account with CureSleep Solutions
          </h2>

          <div className="space-y-4 text-gray-600">
            <p className="text-lg">
              We've sent a verification email to your inbox.
            </p>
            <p className="text-sm">
              Please check your email and click the verification link to
              activate your account.
            </p>
          </div>
        </div>

        {/* Action Section */}
        <div
          className={`mt-8 space-y-4 transform transition-all duration-800 delay-500 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"
          }`}
        >
          <Link
            to={"/login"}
            className="w-full bg-green-700 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-800 transform hover:scale-105 transition-all duration-200 ease-out shadow-lg hover:shadow-xl group"
          >
            Back to Home
            <ArrowRight className="inline-block ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
          </Link>
        </div>
      </div>

      {/* Floating particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 bg-white rounded-full opacity-20 animate-bounce ${
              showSparkles ? "opacity-30" : "opacity-0"
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
