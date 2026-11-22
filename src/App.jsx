import React, { useState, useEffect } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider, useToast } from "./context/ToastContext";
import Navbar from "./components/common/Navbar";
import Footer from "./components/common/Footer";
import HeroSection from "./components/public/HeroSection";
import AboutSection from "./components/public/AboutSection";
import FacilitiesSection from "./components/public/FacilitiesSection";
import GallerySection from "./components/public/GallerySection";
import PricingSection from "./components/public/PricingSection";
import AvailabilitySection from "./components/public/AvailabilitySection";
import RulesSection from "./components/public/RulesSection";
import ReviewsSection from "./components/public/ReviewsSection";
import ContactSection from "./components/public/ContactSection";
import BookingWizardModal from "./components/booking/BookingWizardModal";
import AuthModal from "./components/auth/AuthModal";
import UserPortal from "./components/user/UserPortal";
import AdminPortal from "./components/admin/AdminPortal";
import {
  getHallInfo,
  getPricingInfo,
  getFacilitiesList,
  getGalleryList,
  getReviewsList,
  getRulesAndPolicies
} from "./services/firebaseService";
import {
  DEFAULT_HALL,
  DEFAULT_PRICING,
  DEFAULT_FACILITIES,
  DEFAULT_GALLERY,
  DEFAULT_RULES,
  DEFAULT_REVIEWS
} from "./services/defaultData";
import "./App.css";

function MainApp() {
  const { currentUser, isAdmin } = useAuth();
  const { addToast } = useToast();

  // App Navigation View: "public" | "user" | "admin"
  const [currentView, setCurrentView] = useState("public");

  // Operational Content State
  const [hall, setHall] = useState(DEFAULT_HALL);
  const [pricing, setPricing] = useState(DEFAULT_PRICING);
  const [facilities, setFacilities] = useState(DEFAULT_FACILITIES);
  const [gallery, setGallery] = useState(DEFAULT_GALLERY);
  const [reviews, setReviews] = useState(DEFAULT_REVIEWS);
  const [rules, setRules] = useState(DEFAULT_RULES);
  const [loadingData, setLoadingData] = useState(true);

  // Modals state
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");

  // Booking Wizard pre-filled dates & duration
  const [bookingPrefill, setBookingPrefill] = useState({
    startDate: "",
    endDate: "",
    duration: 1
  });

  // Calendar preselection from Hero quick widget
  const [calendarPreselect, setCalendarPreselect] = useState(null);

  // Fetch initial data from Firestore or local cache
  const loadData = async () => {
    try {
      const [h, p, f, g, r, rls] = await Promise.all([
        getHallInfo(),
        getPricingInfo(),
        getFacilitiesList(),
        getGalleryList(),
        getReviewsList(true),
        getRulesAndPolicies()
      ]);
      setHall(h);
      setPricing(p);
      setFacilities(f);
      setGallery(g);
      setReviews(r);
      setRules(rls);
    } catch (e) {
      console.warn("Failed to load some Firestore collections:", e);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Open booking modal with default or selected dates
  const handleOpenBooking = (startDate = "", endDate = "", duration = 1) => {
    setBookingPrefill({
      startDate: startDate || new Date().toISOString().split("T")[0],
      endDate: endDate || startDate || new Date().toISOString().split("T")[0],
      duration: duration || 1
    });
    setShowBookingModal(true);
  };

  // From Pricing calculator "Proceed with this Estimate"
  const handleOpenBookingWithDays = (days) => {
    const today = new Date();
    const startStr = today.toISOString().split("T")[0];
    const endObj = new Date(today);
    endObj.setDate(endObj.getDate() + (days - 1));
    const endStr = endObj.toISOString().split("T")[0];

    handleOpenBooking(startStr, endStr, days);
  };

  // From Hero quick widget -> scroll to and select on availability calendar
  const handleCheckAvailabilityQuick = (start, end) => {
    setCalendarPreselect({ startDate: start, endDate: end });
    const el = document.getElementById("availability");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  // From Calendar "Book These Dates Now"
  const handleSelectDateRangeForBooking = (start, end, duration) => {
    handleOpenBooking(start, end, duration);
  };

  // Auth trigger helper
  const handleOpenAuth = (mode = "login") => {
    setAuthMode(mode);
    setShowAuthModal(true);
  };

  // Login success handler
  const handleLoginSuccess = (role) => {
    if (role === "admin" || isAdmin) {
      setCurrentView("admin");
    } else {
      setCurrentView("user");
    }
  };

  // Successful booking callback
  const handleBookingSuccess = (bookingData, navigateToPortal = false) => {
    loadData();
    if (navigateToPortal) {
      setCurrentView("user");
    }
  };

  return (
    <div className="app-root">
      {/* Navbar always visible except in full admin console */}
      {currentView !== "admin" && (
        <Navbar
          hall={hall}
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenBooking={() => handleOpenBooking()}
          onOpenAuth={handleOpenAuth}
          onOpenNotifications={() => {
            setCurrentView("user");
          }}
        />
      )}

      {/* VIEW 1: PUBLIC WEBSITE */}
      {currentView === "public" && (
        <main>
          <HeroSection
            hall={hall}
            pricing={pricing}
            onOpenBooking={() => handleOpenBooking()}
            onCheckAvailabilityQuick={handleCheckAvailabilityQuick}
          />

          <AboutSection
            hall={hall}
            onOpenBooking={() => handleOpenBooking()}
          />

          <FacilitiesSection
            facilities={facilities}
          />

          <GallerySection
            gallery={gallery}
          />

          <PricingSection
            pricing={pricing}
            onOpenBookingWithDays={handleOpenBookingWithDays}
          />

          <AvailabilitySection
            pricing={pricing}
            preselectedDates={calendarPreselect}
            onSelectDateRangeForBooking={handleSelectDateRangeForBooking}
          />

          <RulesSection
            rules={rules}
          />

          <ReviewsSection
            reviews={reviews}
            onOpenAuth={handleOpenAuth}
          />

          <ContactSection
            hall={hall}
          />
        </main>
      )}

      {/* VIEW 2: CUSTOMER / USER PORTAL */}
      {currentView === "user" && (
        <UserPortal
          hall={hall}
          onOpenBooking={() => handleOpenBooking()}
          onGoToPublic={() => setCurrentView("public")}
        />
      )}

      {/* VIEW 3: ADMIN PORTAL */}
      {currentView === "admin" && (
        <AdminPortal
          onGoToPublic={() => setCurrentView("public")}
          onHallUpdated={(updated) => setHall(updated)}
          onPricingUpdated={(updated) => setPricing(updated)}
        />
      )}

      {/* Footer on public & user portal views */}
      {currentView !== "admin" && (
        <Footer
          hall={hall}
          pricing={pricing}
          onOpenBooking={() => handleOpenBooking()}
          onOpenAuth={handleOpenAuth}
        />
      )}

      {/* BOOKING WIZARD MODAL */}
      <BookingWizardModal
        isOpen={showBookingModal}
        onClose={() => setShowBookingModal(false)}
        initialStartDate={bookingPrefill.startDate}
        initialEndDate={bookingPrefill.endDate}
        initialDuration={bookingPrefill.duration}
        pricing={pricing}
        hall={hall}
        onBookingSuccess={handleBookingSuccess}
        onOpenAuth={handleOpenAuth}
      />

      {/* AUTH MODAL */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onLoginSuccess={handleLoginSuccess}
      />
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainApp />
      </AuthProvider>
    </ToastProvider>
  );
}
