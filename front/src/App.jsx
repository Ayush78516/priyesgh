import { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import Membership from "./pages/Membership";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { UIProvider } from "./context/UIContext";
import OurStory from "./pages/Ourstory";
import BODPage from "./pages/Bod";
import Committee from "./pages/Committee";
import Bylaws from "./pages/Bylaws";
import Contact from "./pages/Contact";
import CovSphere from "./pages/Covsphere";
import Privacy from "./pages/Privacy";
import Refund from "./pages/Refund";
import Terms from "./pages/Terms";
import Registration from "./pages/Registration";
import PersonalDetails from "./pages/reg1";
import EducationalDetails from "./pages/reg2";
import WorkExperience from "./pages/reg3";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import GuestDashboard from "./pages/GuestDashboard";
import PaymentStatus from "./pages/PaymentStatus";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Events from "./pages/Events";
import NotFound from "./pages/NotFound";

const NO_LAYOUT_ROUTES = [
  "/admin-dashboard",
  "/admin",
  "/payment-status",
];

const PAGE_TITLES = {
  "/": "Home",
  "/membership": "Membership",
  "/our-story": "Our Story",
  "/bod": "Board of Directors",
  "/committee": "Committee",
  "/bylaws": "Bylaws",
  "/contact": "Contact Us",
  "/events": "Events",
  "/covsphere": "COV Sphere",
  "/privacy": "Privacy Policy",
  "/refund": "Refund Policy",
  "/terms": "Terms & Conditions",
  "/register": "Register",
  "/personal": "Personal Details",
  "/education": "Educational Details",
  "/work": "Work Experience",
  "/login": "Login",
  "/forgot-password": "Forgot Password",
  "/reset-password": "Reset Password",
  "/dashboard": "Dashboard",
  "/guest-dashboard": "Guest Dashboard",
  "/admin-dashboard": "Admin Dashboard",
  "/payment-status": "Payment Status",
  "/admin-login": "Admin Login",
  "/admin": "Admin Login",
};

function Layout({ children }) {
  const location = useLocation();
  const isNoLayout = NO_LAYOUT_ROUTES.some(route => location.pathname.startsWith(route));

  useEffect(() => {
    const path = location.pathname;
    const pageTitle = PAGE_TITLES[path] || "Page Not Found";
    document.title = `${pageTitle} | Council Of Valuers (COV) India`;
  }, [location]);

  return (
    <>
      {!isNoLayout && <Header />}
      {children}
      {!isNoLayout && <Footer />}
    </>
  );
}

function App() {
  return (
    <UIProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/our-story" element={<OurStory />} />
          <Route path="/bod" element={<BODPage />} />
          <Route path="/committee" element={<Committee />} />
          <Route path="/bylaws" element={<Bylaws />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:eventId" element={<Events />} />
          <Route path="/covsphere" element={<CovSphere />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/refund" element={<Refund />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/register" element={<Registration />} />
          <Route path="/personal" element={<PersonalDetails />} />
          <Route path="/education" element={<EducationalDetails />} />
          <Route path="/work" element={<WorkExperience />} />
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/guest-dashboard" element={<GuestDashboard />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/payment-status" element={<PaymentStatus />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Layout>
    </UIProvider>
  );
}

export default App;
