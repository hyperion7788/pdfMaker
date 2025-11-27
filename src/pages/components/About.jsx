import { FileText, Award, Star } from "lucide-react";
import PdfImg from "../../assets/images/about.png";
const About = () => {
  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="relative py-20 px-4 bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute bottom-20 right-20 w-24 h-24">
            <Star className="w-full h-full text-gray-800" />
          </div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex items-center mb-6">
                <FileText className="w-10 h-10 text-gray-800 mr-4" />
                <h1 className="text-5xl md:text-6xl font-bold text-gray-800">
                  About PDF Tools
                </h1>
              </div>
              <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                We're not just another PDF tool. We're your complete solution
                for managing, editing, and converting PDF documents with ease.
                Founded by document workflow specialists who understand the
                importance of efficient PDF management in today's digital world.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-8">
                <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-gray-800">1M+</div>
                  <div className="text-gray-600">Files Processed</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-gray-800">99%</div>
                  <div className="text-gray-600">Accuracy Rate</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-gray-800">12+</div>
                  <div className="text-gray-600">PDF Tools</div>
                </div>
                <div className="text-center p-4 bg-white rounded-xl shadow-lg">
                  <div className="text-3xl font-bold text-gray-800">100%</div>
                  <div className="text-gray-600">Secure & Private</div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={PdfImg}
                  alt="PDF"
                  className="w-full h-96 object-fit"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                <div className="absolute bottom-6 left-6 text-white">
                  <h3 className="text-xl font-semibold mb-2">
                    Simplifying PDF Management
                  </h3>
                  <p className="text-sm opacity-90">
                    Where technology meets productivity
                  </p>
                </div>
              </div>

              {/* Floating Elements */}
              <div className="absolute -top-4 -right-4 bg-gray-800 text-white p-4 rounded-xl shadow-lg">
                <Award className="w-8 h-8 mb-2" />
                <div className="text-sm font-semibold">Trusted</div>
                <div className="text-xs">By Professionals</div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
