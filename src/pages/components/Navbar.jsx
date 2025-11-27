import { useState } from "react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import Logo from "../../assets/images/logo-w.png";
import Logo2 from "../../assets/images/logo.png";
import { toast } from "react-toastify";
import { FaBarsStaggered, FaCartShopping } from "react-icons/fa6";
import { IoClose } from "react-icons/io5";
import axios from "axios";

const HNavbar = () => {
  const navigate = useNavigate();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const openMenu = () => setIsMenuOpen(true);
  const closeMenu = () => setIsMenuOpen(false);
  const authDataString = localStorage.getItem("auth");
  const auth = authDataString ? JSON.parse(authDataString) : null;

  const handleLogout = async () => {
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API}/api/v1/auth/logout`
      );

      if (res.data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("auth");
        toast.info("Logged out successfully");
        navigate("/");
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      console.error("Error during logout:", error);
      toast.error("An error occurred while logging out. Please try again.");
    }
  };

  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  return (
    <div
      className={` w-full   transition-all duration-300  bg-white shadow-md text-black`}
    >
      <div className="flex justify-between items-center px-6 py-4">
        {/* Logo */}
        <Link to="/">
          <h2 className="text-3xl font-bold">PDF Maker</h2>
        </Link>

        {/* Side Menu */}
        <div
          id="sidemenu"
          className={`navbar-left ${isMenuOpen ? "active-menu" : ""}`}
        >
          <button className="close-btn" onClick={closeMenu}>
            <IoClose />
          </button>

          <Link className={`nav-link`} to="/">
            Home
          </Link>

          <Link className={`nav-link`} to="/about">
            About us
          </Link>
          <Link className={`nav-link`} to="/contact">
            Contact Us
          </Link>
          <Link className={`nav-link`} to="/services">
            Services
          </Link>
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-4">
          <button className="open-nav" onClick={openMenu}>
            <FaBarsStaggered />
          </button>

          {!auth?.user ? (
            <Link className="login-btn" to="/login">
              Login
            </Link>
          ) : (
            <div className="custom-nav-item relative">
              <button
                className={`acc-circle border-0  bg-gray-700 text-white`}
                onClick={toggleDropdown}
                aria-expanded={dropdownOpen}
              >
                {auth?.user?.firstName && auth.user.firstName[0].toUpperCase()}
              </button>

              {dropdownOpen && (
                <ul className="custom-dropdown-menu absolute right-0 mt-2 bg-white text-black shadow-md rounded-md">
                  <li>
                    <NavLink
                      className="custom-dropdown-item block px-4 py-2 hover:bg-gray-100"
                      to={`/dashboard/user`}
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </NavLink>
                  </li>
                  <li>
                    <button
                      className="custom-dropdown-item block w-full text-left px-4 py-2 hover:bg-gray-100"
                      onClick={() => {
                        handleLogout();
                        setDropdownOpen(false);
                      }}
                    >
                      Logout
                    </button>
                  </li>
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HNavbar;
