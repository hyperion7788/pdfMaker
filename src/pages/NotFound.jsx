import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import Not from "../assets/images/404.png";
import Navbar from "./components/Navbar";

const NotFound = () => {
  // Check authentication status
  const isAuthenticated =
    localStorage.getItem("admintoken") && localStorage.getItem("adminauthor");

  // Determine redirect path based on auth status
  const getHomePath = () => {
    return isAuthenticated ? "/dashboard/user" : "/";
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen flex flex-col">
        <div className="flex-1 from-gray-900 to-gray-800 px-4 py-8">
          <div className="container mx-auto">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="md:w-1/2 space-y-6">
                <h1 className="text-4xl font-bold text-dark">Page Not Found</h1>
                <p className="text-lg text-dark">
                  Sorry! We could not find the page you are looking for. The
                  page may be missing, removed or you have mistyped the URL.
                </p>
                <Button
                  asChild
                  variant="secondary"
                  className="w-fit border border-dark"
                >
                  <Link to={getHomePath()}>
                    {isAuthenticated ? "Go to Dashboard" : "Home"}
                  </Link>
                </Button>
              </div>
              <div className="md:w-1/2 flex justify-center">
                <img
                  src={Not}
                  alt="404 illustration"
                  className="max-w-md w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default NotFound;
