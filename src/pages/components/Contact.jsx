import React, { useState } from "react";
import {
  Send,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  FileText,
  Shield,
  Award,
  Users,
} from "lucide-react";

const Contact = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    urgency: "",
    company: "",
    message: "",
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = () => {
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 4000);
    }, 1500);
  };

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-gray-50 to-green-50 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-20 right-10 w-24 h-24">
          <FileText className="w-full h-full text-gray-800" />
        </div>
        <div className="absolute bottom-32 left-8 w-16 h-16">
          <Shield className="w-full h-full text-gray-800" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 mb-4">
            Ready to Transform Your Documents?
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Get in touch with our PDF experts. We're here to help you create,
            convert, and manage your documents efficiently.
          </p>
          <div className="inline-flex items-center bg-gray-800 rounded-full px-6 py-3 text-white font-medium">
            <CheckCircle className="w-5 h-5 mr-2" />
            Free consultation • Quick response • Expert support
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Contact Form */}
          <div className="lg:col-span-2 bg-white rounded-3xl p-8 md:p-10 shadow-2xl border border-green-100">
            <div className="flex items-center mb-8">
              <div className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center mr-4">
                <Send className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Send Message
                </h3>
              </div>
            </div>

            {isSubmitted ? (
              <div className="text-center py-12">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-12 h-12 text-gray-800" />
                </div>
                <h4 className="text-2xl font-bold text-gray-800 mb-4">
                  Thank You!
                </h4>
                <p className="text-gray-600 text-lg mb-4">
                  We've received your inquiry and our PDF specialists are
                  reviewing it now.
                </p>
                <div className="bg-green-50 rounded-xl p-6 max-w-md mx-auto">
                  <h5 className="font-semibold text-green-800 mb-2">
                    What happens next?
                  </h5>
                  <ul className="text-sm text-green-700 space-y-1">
                    <li>✓ Expert review within 2 hours</li>
                    <li>✓ Personalized solution proposal</li>
                    <li>✓ Free demo if requested</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Personal Information */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-800"
                      placeholder="Enter your full name"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-800"
                      placeholder="your@email.com"
                      required
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Phone Number
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-800"
                      placeholder="(555) 123-4567 (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-semibold mb-2">
                      Company Name
                    </label>
                    <input
                      type="text"
                      name="company"
                      value={formData.company}
                      onChange={handleInputChange}
                      className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all text-gray-800"
                      placeholder="Your company (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-gray-700 font-semibold mb-2">
                    Message
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows="4"
                    className="w-full px-4 py-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all resize-none text-gray-800"
                    placeholder="Tell us about your PDF needs, document volume, specific features you're looking for, or any questions you have..."
                  ></textarea>
                </div>

                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="w-full bg-gray-800 text-white font-bold py-5 px-8 rounded-xl hover:from-green-600 hover:to-green-700 transform hover:scale-105 transition-all duration-200 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      Sending...
                    </div>
                  ) : (
                    "Send Message"
                  )}
                </button>

                <p className="text-sm text-gray-500 text-center">
                  ✓ 100% Secure ✓ No spam ✓ Expert support ✓ Quick response
                </p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Contact Information */}
            <div className="bg-white rounded-2xl p-6 shadow-lg border border-green-100">
              <h3 className="text-xl font-bold text-gray-800 mb-6">
                Get In Touch
              </h3>
              <div className="space-y-4">
                <div className="flex items-center p-3 hover:bg-green-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Phone className="w-5 h-5 text-gray-800" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      1-800-PDF-HELP
                    </div>
                    <div className="text-sm text-gray-800">
                      Free consultation
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 hover:bg-green-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Mail className="w-5 h-5 text-gray-800" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      support@pdfmaker.com
                    </div>
                    <div className="text-sm text-gray-800">
                      2hr response time
                    </div>
                  </div>
                </div>

                <div className="flex items-center p-3 hover:bg-green-50 rounded-lg transition-colors">
                  <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                    <Clock className="w-5 h-5 text-gray-800" />
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800">
                      24/7 Support
                    </div>
                    <div className="text-sm text-gray-800">
                      Always here to help
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Why Choose Us */}
            <div className="bg-gray-800 rounded-2xl p-6 text-white">
              <h3 className="text-xl font-bold mb-4">Why Choose Us?</h3>
              <div className="space-y-3">
                <div className="flex items-center">
                  <Award className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm">Industry-leading PDF tools</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm">99.9% accuracy guarantee</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm">Bank-level security</span>
                </div>
                <div className="flex items-center">
                  <Users className="w-5 h-5 mr-3 flex-shrink-0" />
                  <span className="text-sm">Trusted by 1M+ users</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
