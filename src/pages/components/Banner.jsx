import React, { useState, useEffect } from "react";
import { ArrowRightCircle, FileText, Sparkles, Zap, Check } from "lucide-react";
import { Link } from "react-router-dom";

const Banner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-gray-800 flex items-center justify-center">
      {/* Animated gradient orbs */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-green-100 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-emerald-100 rounded-full blur-3xl animate-pulse delay-700"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-teal-50 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Floating PDF icons */}
      <div className="absolute inset-0">
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${5 + Math.random() * 10}s`,
            }}
          >
            <FileText className="w-6 h-6 text-green-200 opacity-30" />
          </div>
        ))}
      </div>

      {/* Decorative animated elements */}
      <div className="absolute top-20 left-20 opacity-20 animate-bounce-slow">
        <div className="w-16 h-20 bg-gradient-to-br from-green-300 to-green-500 rounded-lg transform rotate-12 shadow-lg"></div>
      </div>
      <div className="absolute top-40 right-32 opacity-20 animate-spin-slow">
        <Sparkles className="w-12 h-12 text-green-400" />
      </div>
      <div className="absolute bottom-32 left-40 opacity-20 animate-float">
        <Zap className="w-14 h-14 text-emerald-400" />
      </div>
      <div className="absolute bottom-40 right-40 opacity-20 animate-bounce-slow delay-500">
        <div className="w-12 h-16 bg-gradient-to-br from-teal-300 to-gray-400 rounded-lg transform -rotate-6 shadow-lg"></div>
      </div>

      {/* Grid pattern overlay */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

      {/* Main content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6">
        <div
          className={`space-y-10 transition-all duration-1000 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-10"
          }`}
        >
          {/* Badge */}
          <div className="flex justify-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 rounded-full border border-gray-500 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
              <span className="text-sm font-semibold text-white">
                Professional PDF Tools
              </span>
            </div>
          </div>

          {/* Main heading */}
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight">
              <span className="block text-gray-800 animate-fade-in">
                Create, Edit & Transform
              </span>
              <span className="block mt-2 text-gray-800  ">
                Your PDFs Effortlessly
              </span>
            </h1>

            <p className="text-2xl md:text-3xl text-gray-800 font-semibold max-w-3xl mx-auto">
              The ultimate PDF maker and editor for professionals.
            </p>

            <p className="text-lg text-gray-800 max-w-2xl mx-auto leading-relaxed">
              Create stunning PDFs, edit existing documents, merge files, and
              convert formats - all in one powerful platform.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8">
            <Link
              to={"/img-to-pdf"}
              className="group relative inline-flex items-center px-10 py-5  bg-gray-800 text-white font-bold text-lg rounded-xl shadow-xl   hover:scale-105 transition-all duration-300 overflow-hidden"
            >
              <span className="absolute inset-0    opacity-0   transition-opacity duration-300"></span>
              <span className="relative flex items-center gap-2">
                Start Creating PDFs
                <ArrowRightCircle className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8">
            {[
              {
                icon: FileText,
                title: "Easy PDF Creation",
                desc: "Create professional PDFs in seconds",
              },
              {
                icon: Zap,
                title: "Lightning Fast",
                desc: "Convert and edit at blazing speeds",
              },
              {
                icon: Check,
                title: "All-in-One Tool",
                desc: "Merge, split, compress & more",
              },
            ].map((feature, i) => (
              <div
                key={i}
                className="group bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border border-green-200 hover:border-gray-400 shadow-md hover:shadow-xl transition-all duration-300 hover:scale-105 hover:-translate-y-1"
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <div className="w-12 h-12 bg-gray-800 to-emerald-500 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">
                  {feature.title}
                </h3>
                <p className="text-gray-800">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Animated shapes in corners */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-green-200/30 to-transparent rounded-full blur-2xl animate-pulse"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-gradient-to-tr from-emerald-200/30 to-transparent rounded-full blur-2xl animate-pulse delay-1000"></div>

      {/* Bottom wave decoration */}
      <div className="absolute bottom-0 left-0 right-0 h-32">
        <svg
          viewBox="0 0 1200 120"
          className="w-full h-full"
          preserveAspectRatio="none"
        >
          <path
            d="M0,64L48,69.3C96,75,192,85,288,80C384,75,480,53,576,48C672,43,768,53,864,69.3C960,85,1056,107,1152,106.7C1248,107,1344,85,1392,74.7L1440,64L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            className="fill-green-50"
          />
          <path
            d="M0,96L48,101.3C96,107,192,117,288,112C384,107,480,85,576,80C672,75,768,85,864,101.3C960,117,1056,139,1152,138.7C1248,139,1344,117,1392,106.7L1440,96L1440,120L1392,120C1344,120,1248,120,1152,120C1056,120,960,120,864,120C768,120,672,120,576,120C480,120,384,120,288,120C192,120,96,120,48,120L0,120Z"
            className="fill-green-100"
          />
        </svg>
      </div>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translateY(0px) translateX(0px);
          }
          50% {
            transform: translateY(-20px) translateX(10px);
          }
        }

        @keyframes bounce-slow {
          0%,
          100% {
            transform: translateY(0) rotate(12deg);
          }
          50% {
            transform: translateY(-15px) rotate(12deg);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes gradient {
          0%,
          100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-bounce-slow {
          animation: bounce-slow 3s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 20s linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient 3s ease infinite;
        }

        .animate-fade-in {
          animation: fade-in 1s ease-out;
        }

        .delay-500 {
          animation-delay: 0.5s;
        }

        .delay-700 {
          animation-delay: 0.7s;
        }

        .delay-1000 {
          animation-delay: 1s;
        }

        .bg-grid-pattern {
          background-image: linear-gradient(
              rgba(22, 163, 74, 0.05) 1px,
              transparent 1px
            ),
            linear-gradient(90deg, rgba(22, 163, 74, 0.05) 1px, transparent 1px);
          background-size: 50px 50px;
        }
      `}</style>
    </div>
  );
};

export default Banner;
