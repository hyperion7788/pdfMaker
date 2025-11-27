import { Link } from "react-router-dom";
import Logo from "../../assets/images/logo-w.png";

const Footer = () => {
  return (
    <div className="bg-gray-800 text-white py-8 px-4">
      <div className="container mx-auto mb-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Logo Section */}
          <div className="col-span-1">
            <img className="h-12 w-auto" src={Logo} alt="logo" />
          </div>

          {/* Quick Links */}
          <div className="col-span-1">
            <h6 className="text-lg font-semibold mb-4 text-white">
              Quick Links
            </h6>
            <div className="space-y-2">
              <div>
                <Link
                  to="/home"
                  className="text-white hover:text-green-500 transition-colors duration-200 block py-1"
                >
                  Home
                </Link>
              </div>

              <div>
                <Link
                  to="/contact"
                  className="text-white hover:text-green-500 transition-colors duration-200 block py-1"
                >
                  Contact
                </Link>
              </div>
              <div>
                <Link
                  to="/login"
                  className="text-white hover:text-green-500 transition-colors duration-200 block py-1"
                >
                  Login
                </Link>
              </div>
            </div>
          </div>

          {/* Legal Links */}
          <div className="col-span-1">
            <h6 className="text-lg font-semibold mb-4 text-white">Legal</h6>
            <div className="space-y-2">
              <div>
                <Link
                  to="/privacy-policy"
                  className="text-white hover:text-green-500 transition-colors duration-200 block py-1"
                >
                  Privacy Policy
                </Link>
              </div>
              <div>
                <Link
                  to="/terms&conditions"
                  className="text-white hover:text-green-500 transition-colors duration-200 block py-1"
                >
                  Terms & Conditions
                </Link>
              </div>

              <div>
                <Link
                  to="/disclaimer"
                  className="text-white hover:text-green-500 transition-colors duration-200 block py-1"
                >
                  Disclaimer
                </Link>
              </div>
            </div>
          </div>

          {/* Contact Info */}
          <div className="col-span-1">
            <h6 className="text-lg font-semibold mb-4 text-white">Contact</h6>
            <div className="space-y-2">
              <div className="text-white py-1">
                1-367 St. Albert Trail,
                <br />
                St. Albert T5N0R1 Canada
              </div>
              <div>
                <Link
                  to="tel:+17806651500"
                  target="_blank"
                  className="text-white hover:text-green-500 transition-colors duration-200 block py-1"
                >
                  +1 (780) 665-1500
                </Link>
              </div>
              <div>
                <Link
                  to="mailto:support@pdfmaker.com"
                  target="_blank"
                  className="text-white hover:text-green-500 transition-colors duration-200 block py-1"
                >
                  support@pdfmaker.com
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Section */}
      <hr className="border-white border-opacity-30 mb-4" />
      <div className="text-center">
        <p className="text-white">© 2025 All rights reserved</p>
      </div>
    </div>
  );
};

export default Footer;
