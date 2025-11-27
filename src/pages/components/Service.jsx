import { Heart, Shield, Target, TrendingUp } from "lucide-react";

const Service = () => {
  const values = [
    {
      icon: Heart,
      title: "Compassionate Care",
      description:
        "We understand the frustration of sleepless nights and approach every client with empathy and understanding.",
    },
    {
      icon: Shield,
      title: "Natural Solutions",
      description:
        "We believe in drug-free, sustainable approaches that work with your body's natural sleep mechanisms.",
    },
    {
      icon: Target,
      title: "Personalized Approach",
      description:
        "Every sleep journey is unique. We create customized plans tailored to your specific needs and lifestyle.",
    },
    {
      icon: TrendingUp,
      title: "Proven Results",
      description:
        "Our evidence-based methods have helped over 25,000 people reclaim their nights and transform their days.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Values Section */}
      <section className="py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-800 mb-4">
              Our Services
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              The principles that guide everything we do in helping you achieve
              better sleep
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => (
              <div
                key={index}
                className="text-center p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all duration-300 border border-green-100"
              >
                <div className="w-16 h-16 bg-gradient-to-r from-green-500 to-green-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <value.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-800 mb-3">
                  {value.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {value.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Service;
