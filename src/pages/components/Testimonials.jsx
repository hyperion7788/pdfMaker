import React, { useState, useEffect } from "react";
import {
  Star,
  Moon,
  Heart,
  ChevronLeft,
  ChevronRight,
  Play,
  Pause,
} from "lucide-react";

const Testimonials = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const testimonials = [
    {
      id: 1,
      name: "Sarah Johnson",
      age: 34,
      issue: "Chronic Insomnia",
      rating: 5,
      text: "After 3 years of sleepless nights, I finally found peace. The personalized sleep program transformed my life completely. I now sleep 7-8 hours every night and wake up refreshed!",
      sleepImprovement: "From 2 hours to 8 hours",
      timeframe: "3 weeks",
      location: "New York, NY",
      avatar: "SJ",
    },
    {
      id: 2,
      name: "Michael Chen",
      age: 42,
      issue: "Sleep Anxiety",
      rating: 5,
      text: "The anxiety around bedtime used to consume me. Thanks to the expert guidance and natural techniques, I've reclaimed my nights and my energy. My productivity at work has doubled!",
      sleepImprovement: "From panic to peace",
      timeframe: "6 weeks",
      location: "San Francisco, CA",
      avatar: "MC",
    },
    {
      id: 3,
      name: "Emma Rodriguez",
      age: 28,
      issue: "Work Stress Insomnia",
      rating: 5,
      text: "Working night shifts destroyed my sleep cycle. The customized approach helped me establish a healthy routine that works with my schedule. I feel like myself again!",
      sleepImprovement: "Consistent 6+ hours",
      timeframe: "4 weeks",
      location: "Chicago, IL",
      avatar: "ER",
    },
    {
      id: 4,
      name: "David Thompson",
      age: 55,
      issue: "Age-related Sleep Issues",
      rating: 5,
      text: "I thought poor sleep was just part of aging. Wrong! I'm sleeping better now than I did in my 30s. My energy levels are through the roof and my wife says I don't snore anymore!",
      sleepImprovement: "Quality deep sleep restored",
      timeframe: "8 weeks",
      location: "Austin, TX",
      avatar: "DT",
    },
    {
      id: 5,
      name: "Lisa Park",
      age: 38,
      issue: "Postpartum Insomnia",
      rating: 5,
      text: "Being a new mom with zero sleep was overwhelming. The gentle, natural methods helped me find rest even with a baby. I'm a better mother now that I'm well-rested.",
      sleepImprovement: "From exhaustion to restoration",
      timeframe: "5 weeks",
      location: "Seattle, WA",
      avatar: "LP",
    },
    {
      id: 6,
      name: "Robert Wilson",
      age: 47,
      issue: "Travel Insomnia",
      rating: 5,
      text: "Constant business travel made sleep impossible. The portable techniques I learned work in any hotel room, any time zone. My jet lag is now manageable!",
      sleepImprovement: "Adaptable sleep anywhere",
      timeframe: "2 weeks",
      location: "Miami, FL",
      avatar: "RW",
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
          i < rating ? "text-yellow-400 fill-current" : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-green-50 to-blue-50 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-10 left-10 w-20 h-20 text-green-600">
          <Moon className="w-full h-full" />
        </div>
        <div className="absolute top-32 right-20 w-16 h-16 text-green-600">
          <Star className="w-full h-full" />
        </div>
        <div className="absolute bottom-20 left-1/4 w-12 h-12 text-green-600">
          <Heart className="w-full h-full" />
        </div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-4">
            <Moon className="w-8 h-8 text-green-600 mr-3" />
            <h2 className="text-4xl md:text-5xl font-bold text-gray-800">
              Sleep Success Stories
            </h2>
          </div>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Join thousands who've transformed their nights and reclaimed their
            days
          </p>

          {/* Stats */}
          <div className="flex items-center justify-center space-x-8 mb-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">10,000+</div>
              <div className="text-gray-600">Lives Changed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">94%</div>
              <div className="text-gray-600">Success Rate</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">4.9/5</div>
              <div className="text-gray-600">Average Rating</div>
            </div>
          </div>
        </div>

        {/* Testimonial Slider */}
        <div className="relative">
          {/* Main Testimonial Card */}
          <div
            className={`bg-white rounded-3xl p-8 md:p-12 shadow-2xl border border-green-100 max-w-4xl mx-auto transition-all duration-500 ${
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
                className={`w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-xl mb-4 md:mb-0 md:mr-6 transition-all duration-500 ${
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
                      Age {testimonials[currentSlide].age} •{" "}
                      {testimonials[currentSlide].issue}
                    </p>
                    <p className="text-sm text-green-600">
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
              className={`grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-gray-100 transition-all duration-500 ${
                isTransitioning
                  ? "opacity-0 transform translate-y-6"
                  : "opacity-100 transform translate-y-0"
              }`}
            >
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">
                  Sleep Improvement
                </div>
                <div className="font-bold text-green-600 text-lg">
                  {testimonials[currentSlide].sleepImprovement}
                </div>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <div className="text-sm text-gray-500 mb-1">
                  Results Timeline
                </div>
                <div className="font-bold text-green-600 text-lg">
                  {testimonials[currentSlide].timeframe}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            disabled={isTransitioning}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-green-50 rounded-full p-3 shadow-lg border border-green-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Previous testimonial"
          >
            <ChevronLeft className="w-6 h-6 text-green-600" />
          </button>

          <button
            onClick={nextSlide}
            disabled={isTransitioning}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white hover:bg-green-50 rounded-full p-3 shadow-lg border border-green-100 transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            aria-label="Next testimonial"
          >
            <ChevronRight className="w-6 h-6 text-green-600" />
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
                    ? "bg-green-600 w-8 shadow-lg"
                    : "bg-gray-300 hover:bg-green-400 transform hover:scale-125"
                } ${isTransitioning ? "opacity-50" : "opacity-100"}`}
                aria-label={`Go to testimonial ${index + 1}`}
              />
            ))}
          </div>

          {/* Auto-play toggle */}
          <button
            onClick={toggleAutoPlay}
            className="ml-4 p-2 rounded-full bg-white border border-green-200 hover:bg-green-50 transition-all duration-200"
            aria-label={isAutoPlaying ? "Pause auto-play" : "Start auto-play"}
          >
            {isAutoPlaying ? (
              <Pause className="w-4 h-4 text-green-600" />
            ) : (
              <Play className="w-4 h-4 text-green-600" />
            )}
          </button>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center bg-green-100 rounded-full px-8 py-4 text-green-800 text-lg font-medium">
            <Heart className="w-6 h-6 mr-3" />
            Over 50,000 peaceful nights restored this year
          </div>
          <p className="mt-4 text-gray-600">
            Join our community of well-rested individuals
          </p>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
