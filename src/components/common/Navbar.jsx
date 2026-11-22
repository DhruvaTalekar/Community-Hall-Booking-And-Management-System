import React, { useState, useEffect } from "react";
import {
  Menu,
  X,
  Calendar,
  User,
  Shield,
  LogOut,
  Bell,
  Phone,
  BookmarkCheck,
  ChevronDown
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getUserNotifications } from "../../services/firebaseService";

export default function Navbar({
  hall,
  currentView,
  setCurrentView,
  onOpenBooking,
  onOpenAuth,
  onOpenNotifications
}) {
  const { currentUser, userProfile, isAdmin, logoutUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    if (currentUser?.uid) {
      getUserNotifications(currentUser.uid).then((list) => {
        setUnreadCount(list.filter((n) => !n.read).length);
      });
    }
  }, [currentUser]);

  const navLinks = [
    { label: "Home", href: "#hero", view: "public" },
    { label: "About", href: "#about", view: "public" },
    { label: "Facilities", href: "#facilities", view: "public" },
    { label: "Gallery", href: "#gallery", view: "public" },
    { label: "Pricing", href: "#pricing", view: "public" },
    { label: "Availability", href: "#availability", view: "public" },
    { label: "Rules", href: "#rules", view: "public" },
    { label: "Contact", href: "#contact", view: "public" }
  ];

  const handleNavClick = (link) => {
    setMobileMenuOpen(false);
    if (currentView !== "public") {
      setCurrentView("public");
      setTimeout(() => {
        const el = document.querySelector(link.href);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      }, 100);
    } else {
      const el = document.querySelector(link.href);
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <header className={`site-header ${scrolled ? "header-scrolled" : ""}`}>
      {/* Top emergency / quick contact strip */}
      <div className="top-banner">
        <div className="container top-banner-inner">
          <div className="top-banner-item">
            <span>Direct Reservations & Inquiries:</span>
            <a href={`tel:${hall.contact?.phone || ""}`} className="top-phone">
              <Phone size={13} /> {hall.contact?.phone || "+91 98765 43210"}
            </a>
          </div>
          <div className="top-banner-badges">
            <span className="top-badge">⭐ Approved Venue</span>
            <span className="top-badge">🔒 Instant Online Booking</span>
          </div>
        </div>
      </div>

      <nav className="main-navbar">
        <div className="container navbar-container">
          {/* Logo & Brand */}
          <div
            className="navbar-brand"
            onClick={() => {
              setCurrentView("public");
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="brand-icon-box">
              <span className="brand-icon-text">GH</span>
            </div>
            <div className="brand-text">
              <span className="brand-name">{hall.name || "Grand Horizon Hall"}</span>
              <span className="brand-tag">Community & Banquet Venue</span>
            </div>
          </div>

          {/* Desktop Nav Links */}
          <div className="navbar-links desktop-only">
            {navLinks.map((item) => (
              <button
                key={item.label}
                type="button"
                onClick={() => handleNavClick(item)}
                className="nav-link-btn"
              >
                {item.label}
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="navbar-actions desktop-only">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={() => {
                if (currentView !== "public") setCurrentView("public");
                setTimeout(() => {
                  const el = document.getElementById("availability");
                  if (el) el.scrollIntoView({ behavior: "smooth" });
                }, 100);
              }}
            >
              <Calendar size={15} />
              Availability
            </button>

            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={onOpenBooking}
            >
              <BookmarkCheck size={15} />
              Book Now
            </button>

            {currentUser ? (
              <div className="user-menu-wrapper">
                <button
                  type="button"
                  className="user-profile-btn"
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                >
                  <div className="user-avatar-initial">
                    {userProfile?.name?.charAt(0) || currentUser.email?.charAt(0) || "U"}
                  </div>
                  <span className="user-nav-name">
                    {userProfile?.name?.split(" ")[0] || "Account"}
                  </span>
                  {isAdmin && <span className="admin-chip">Admin</span>}
                  <ChevronDown size={14} />
                </button>

                {unreadCount > 0 && (
                  <button
                    type="button"
                    className="nav-bell-btn"
                    onClick={onOpenNotifications}
                    title="Notifications"
                  >
                    <Bell size={16} />
                    <span className="bell-badge">{unreadCount}</span>
                  </button>
                )}

                {userDropdownOpen && (
                  <div className="user-dropdown-menu animate-slide-in">
                    <div className="user-dropdown-header">
                      <p className="user-dropdown-name">{userProfile?.name || "Customer"}</p>
                      <p className="user-dropdown-email">{currentUser.email}</p>
                    </div>

                    <div className="user-dropdown-divider" />

                    {isAdmin ? (
                      <button
                        type="button"
                        className={`dropdown-item ${currentView === "admin" ? "active" : ""}`}
                        onClick={() => {
                          setUserDropdownOpen(false);
                          setCurrentView("admin");
                        }}
                      >
                        <Shield size={16} />
                        Admin Portal
                      </button>
                    ) : null}

                    <button
                      type="button"
                      className={`dropdown-item ${currentView === "user" ? "active" : ""}`}
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setCurrentView("user");
                      }}
                    >
                      <User size={16} />
                      User Dashboard & Bookings
                    </button>

                    <button
                      type="button"
                      className="dropdown-item"
                      onClick={() => {
                        setUserDropdownOpen(false);
                        onOpenNotifications();
                      }}
                    >
                      <Bell size={16} />
                      Notifications {unreadCount > 0 && `(${unreadCount})`}
                    </button>

                    <div className="user-dropdown-divider" />

                    <button
                      type="button"
                      className="dropdown-item dropdown-logout"
                      onClick={async () => {
                        setUserDropdownOpen(false);
                        await logoutUser();
                        setCurrentView("public");
                      }}
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                type="button"
                className="btn btn-dark btn-sm"
                onClick={() => onOpenAuth("login")}
              >
                <User size={15} />
                Login / Register
              </button>
            )}
          </div>

          {/* Mobile Hamburger Button */}
          <div className="mobile-toggle-wrapper mobile-only">
            <button
              type="button"
              className="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Slide-down Drawer */}
        {mobileMenuOpen && (
          <div className="mobile-nav-drawer animate-slide-in">
            <div className="mobile-links-list">
              {navLinks.map((item) => (
                <button
                  key={item.label}
                  type="button"
                  onClick={() => handleNavClick(item)}
                  className="mobile-nav-link"
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="mobile-drawer-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenBooking();
                }}
              >
                <BookmarkCheck size={18} />
                Book Now
              </button>

              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => {
                  setMobileMenuOpen(false);
                  if (currentView !== "public") setCurrentView("public");
                  setTimeout(() => {
                    const el = document.getElementById("availability");
                    if (el) el.scrollIntoView({ behavior: "smooth" });
                  }, 100);
                }}
              >
                <Calendar size={18} />
                Check Availability
              </button>

              {currentUser ? (
                <>
                  {isAdmin && (
                    <button
                      type="button"
                      className="btn btn-dark"
                      onClick={() => {
                        setMobileMenuOpen(false);
                        setCurrentView("admin");
                      }}
                    >
                      <Shield size={18} />
                      Admin Portal
                    </button>
                  )}
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                      setMobileMenuOpen(false);
                      setCurrentView("user");
                    }}
                  >
                    <User size={18} />
                    My Account & Bookings
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger"
                    onClick={async () => {
                      setMobileMenuOpen(false);
                      await logoutUser();
                      setCurrentView("public");
                    }}
                  >
                    <LogOut size={18} />
                    Log Out
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className="btn btn-dark"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuth("login");
                  }}
                >
                  <User size={18} />
                  Login / Register
                </button>
              )}
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
