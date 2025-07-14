import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./contexts/AuthContext";
import { PaymentProvider } from "./contexts/PaymentContext";
import { CartProvider } from "./contexts/CartContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ErrorBoundary } from "./components/ErrorBoundary";

// Pages
import Home from "./pages/Home";
import Books from "./pages/Books";
import BookDetails from "./pages/BookDetails";
import Publish from "./pages/Publish";
import Packages from "./pages/Packages";
import Events from "./pages/Events";
import EventDetails from "./pages/EventDetails";
import Cart from "./pages/Cart";
import Checkout from "./pages/Checkout";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminBooks from "./pages/admin/AdminBooks";
import AdminEvents from "./pages/admin/AdminEvents";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAnalytics from "./pages/admin/AdminAnalytics";
import AddEvent from "./pages/AddEvent";

function App() {
  useEffect(() => {
    // Update document title
    document.title = "Zenjaura - Next-Gen Book Publishing Platform";

    // Apply theme class to html element
    const html = document.documentElement;
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) {
      html.classList.add(savedTheme);
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      html.classList.add("dark");
    }
  }, []);

  return (
    <ErrorBoundary>
    <Router>
      <ThemeProvider>
        <AuthProvider>
          <PaymentProvider>
          <CartProvider>
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
              <Navbar />
              <main className="pt-24">
                <Routes>
                  {/* Public Routes */}
                  <Route path="/" element={<Home />} />
                  <Route path="/books" element={<Books />} />
                  <Route path="/books/:slug" element={<BookDetails />} />
                  <Route path="/events" element={<Events />} />
                  <Route path="/events/:slug" element={<EventDetails />} />
                  <Route path="/packages" element={<Packages />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route
                    path="/reset-password/:token"
                    element={<ResetPassword />}
                  />

                  {/* Protected Routes */}
                  <Route
                    path="/publish"
                    element={
                      <ProtectedRoute>
                        <Publish />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/cart"
                    element={
                      <ProtectedRoute>
                        <Cart />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/checkout"
                    element={
                      <ProtectedRoute>
                        <Checkout />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/profile"
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    }
                  />

                  {/* Admin Routes */}
                  <Route
                    path="/admin"
                    element={
                      <AdminRoute>
                        <AdminDashboard />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/books"
                    element={
                      <AdminRoute>
                        <AdminBooks />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/add-event"
                    element={
                      <AdminRoute>
                        <AddEvent />
                      </AdminRoute>
                    }
                  />

                  <Route
                    path="/admin/events"
                    element={
                      <AdminRoute>
                        <AdminEvents />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/users"
                    element={
                      <AdminRoute>
                        <AdminUsers />
                      </AdminRoute>
                    }
                  />
                  <Route
                    path="/admin/analytics"
                    element={
                      <AdminRoute>
                        <AdminAnalytics />
                      </AdminRoute>
                    }
                  />

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </main>
              <Footer />
            </div>
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                    background: "var(--toast-bg, #ffffff)",
                    color: "var(--toast-color, #111827)",
                    border: "1px solid var(--toast-border, #e5e7eb)",
                  borderRadius: "16px",
                    boxShadow: "0 10px 25px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
                },
              }}
            />
          </CartProvider>
          </PaymentProvider>
        </AuthProvider>
      </ThemeProvider>
    </Router>
    </ErrorBoundary>
  );
}

export default App;
