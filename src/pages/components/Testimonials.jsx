import React, { useState, useEffect } from "react";
import {
  Star,
  FileText,
  Download,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
  Zap,
} from "lucide-react";

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      profession: "Marketing Director",
      company: "TechCorp Inc.",
      rating: 5,
      text: "This PDF editor has revolutionized our workflow! Converting hundreds of documents to PDF while maintaining perfect formatting saved us countless hours. The batch processing feature is a game-changer!",
      improvement: "Saved 15+ hours weekly",
      timeframe: "2 months",
      location: "New York, NY",
      avatar: "SJ",
      feature: "Batch PDF Conversion",
    },
    {
      id: 2,
      name: "Michael Chen",
      profession: "Freelance Designer",
      company: "Creative Studio",
      rating: 5,
      text: "As a designer, I need precise control over my PDFs. The editing tools are incredibly intuitive - merging client files, compressing without quality loss, and the OCR feature works flawlessly!",
      improvement: "90% faster client deliveries",
      timeframe: "3 weeks",
      location: "San Francisco, CA",
      avatar: "MC",
      feature: "Advanced Editing & OCR",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      profession: "University Professor",
      company: "State University",
      rating: 5,
      text: "Creating course materials used to take days. Now I merge research papers, add annotations, and compress files for students in minutes. The accessibility features make my materials inclusive for all students!",
      improvement: "75% time reduction",
      timeframe: "1 month",
      location: "Chicago, IL",
      avatar: "ER",
      feature: "Document Merging & Compression",
    },
    {
      id: 4,
      name: "David Thompson",
      profession: "Legal Assistant",
      company: "Law Partners LLC",
      rating: 5,
      text: "Handling legal documents requires precision and security. The redaction tools and password protection give me peace of mind. Converting scans to searchable PDFs has made our archives completely digital!",
      improvement: "100% digital workflow",
      timeframe: "6 weeks",
      location: "Austin, TX",
      avatar: "DT",
      feature: "Security & OCR",
    },
    {
      id: 5,
      name: "Lisa Park",
      profession: "Small Business Owner",
      company: "Bloom Boutique",
      rating: 5,
      text: "From invoices to marketing materials, this tool does it all! The templates saved me from hiring a designer. Converting my product catalogs to PDF while keeping them mobile-friendly boosted my sales!",
      improvement: "60% cost savings",
      timeframe: "2 weeks",
      location: "Seattle, WA",
      avatar: "LP",
      feature: "Templates & Mobile Optimization",
    },
    {
      id: 6,
      name: "Robert Wilson",
      profession: "Project Manager",
      company: "Construction Plus",
      rating: 5,
      text: "Managing construction documents across teams was chaotic. Now we merge blueprints, add markups, and share secured PDFs instantly. The collaboration features have improved our project timelines significantly!",
      improvement: "40% faster approvals",
      timeframe: "1 month",
      location: "Miami, FL",
      avatar: "RW",
      feature: "Collaboration Tools",
    },
  ];

  const nextSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide((prev) => (prev + 1) % testimonials.length);
      setIsTransitioning(false);
    }, 500);
  };

  const prevSlide = () => {
    if (isTransitioning) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(
        (prev) => (prev - 1 + testimonials.length) % testimonials.length
      );
      setIsTransitioning(false);
    }, 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setTimeout(() => {
      setCurrentSlide(index);
      setIsTransitioning(false);
    }, 500);
  };

  const toggleAutoPlay = () => {
    setIsAutoPlaying(!isAutoPlaying);
  };

  useEffect(() => {
    if (isAutoPlaying) {
      const interval = setInterval(nextSlide, 5000);
      return () => clearInterval(interval);
    }
  }, [isAutoPlaying]);

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < rating ? "text-blue-500 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 to-indigo-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 text-blue-600">
          <FileText className="w-full h-full" />
        </div>
        <div className="absolute top-32 right-20 w-16 h-16 text-blue-600">
          <Download className="w-full h-full" />
        </div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 text-blue-600">
          <Zap className="w-full h-full" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <FileText className="w-8 h-8 text-blue-600 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
              PDF Success Stories
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands of professionals who've transformed their document
            workflow
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">50,000+</div>
              <div className="text-gray-600">Documents Processed Daily</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">98%</div>
              <div className="text-gray-600">Customer Satisfaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">4.8/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Testimonial Slider */}
        <div className="relative">
          {/* Main Testimonial Card */}
          <div
            className={`bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-blue-100 max-w-4xl mx-auto transition-all duration-500 ${
              isTransitioning
                ? "opacity-0 transform scale-95"
                : "opacity-100 transform scale-100"
            }`}
          >
            <div
              className={`flex flex-col md:flex-row items-start md:items-center mb-6 transition-all duration-500 ${
                isTransitioning
                  ? "opacity-0 transform translate-x-4"
                  : "opacity-100 transform translate-x-0"
              }`}
            >
              <div
                className={`w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 md:mb-0 md:mr-6 transition-all duration-500 ${
                  isTransitioning
                    ? "opacity-0 transform rotate-180 scale-75"
                    : "opacity-100 transform rotate-0 scale-100"
                }`}
              >
                {testimonials[currentSlide].avatar}
              </div>
              <div className="flex-1">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                  <div>
                    <h4 className="text-xl font-bold text-gray-800">
                      {testimonials[currentSlide].name}
                    </h4>
                    <p className="text-gray-600">
                      {testimonials[currentSlide].profession} •{" "}
                      {testimonials[currentSlide].company}
                    </p>
                    <p className="text-sm text-blue-600">
                      {testimonials[currentSlide].location}
                    </p>
                  </div>
                  <div className="flex items-center mt-2 md:mt-0">
                    {renderStars(testimonials[currentSlide].rating)}
                  </div>
                </div>
              </div>
            </div>

            <blockquote
              className={`text-lg md:text-xl text-gray-700 mb-8 italic leading-relaxed text-center transition-all duration-400 ${
                isTransitioning
                  ? "opacity-0 transform translate-y-4"
                  : "opacity-100 transform translate-y-0"
              }`}
            >
              "{testimonials[currentSlide].text}"
            </blockquote>

            <div
              className={`grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-gray-100 transition-all duration-500 ${
                isTransitioning
                  ? "opacity-0 transform translate-y-6"
                  : "opacity-100 transform translate-y-0"
              }`}
            >
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">
                  Productivity Gain
                </div>
                <div className="font-bold text-blue-600 text-lg">
                  {testimonials[currentSlide].improvement}
                </div>
              </div>
              <div className="text-center p-4 bg-indigo-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">
                  Implementation Time
                </div>
                <div className="font-bold text-blue-600 text-lg">
                  {testimonials[currentSlide].timeframe}
                </div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">
                  Favorite Feature
                </div>
                <div className="font-bold text-blue-600 text-lg">
                  {testimonials[currentSlide].feature}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-blue-50 rounded-full p-3 shadow-lg border border-blue-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-blue-600" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-blue-50 rounded-full p-3 shadow-lg border border-blue-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-blue-600" />
          </button>
        </div>

        {/* Slider Controls */}
        <div className="flex items-center justify-center mt-8 space-x-4">
          {/* Dots */}
          <div className="flex space-x-2">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                disabled={isTransitioning}
                className={`w-3 h-3 rounded-full transition-all duration-500 disabled:cursor-not-allowed ${
                  index === currentSlide
                    ? "bg-blue-600 w-8 shadow-lg"
                    : "bg-gray-300 hover:bg-blue-400 transform hover:scale-125"
                } ${isTransitioning ? "opacity-50" : "opacity-100"}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={toggleAutoPlay}
            className="ml-4 p-2 rounded-full bg-white border border-blue-200 hover:bg-blue-50 transition-all duration-200"
            aria-label={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4 text-blue-600" />
            ) : (
              <Play className="w-4 h-4 text-blue-600" />
            )}
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-blue-100 rounded-full px-8 py-4 text-blue-800 text-lg font-medium">
            <Zap className="w-6 h-6 mr-3" />
            Over 1 million documents processed this month
          </div>
          <p className="mt-4 text-gray-600">
            Join our community of efficient document creators
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
