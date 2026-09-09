import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ListingsProvider } from "./context/ListingsContext";
import { RoommatesProvider } from "./context/RoommatesContext";
import { MessagesProvider } from "./context/MessagesContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import ProtectedRoute from "./components/ProtectedRoute";
import RoleRoute from "./components/RoleRoute";
import AppLayout from "./components/AppLayout";
import Landing from "./pages/Landing";
import Onboarding from "./pages/Onboarding";
import Login from "./pages/Login";
import Discover from "./pages/Discover";
import RoommateMatching from "./pages/RoommateMatching";
import Messages from "./pages/Messages";
import CreateListing from "./pages/CreateListing";
import Profile from "./pages/Profile";
import RoommateProfile from "./pages/RoommateProfile";
import ListingDetail from "./pages/ListingDetail";
import Interests from "./pages/Interests";
import MyListings from "./pages/MyListings";
import Questionnaire from "./pages/Questionnaire";
import LandlordQuestionnaire from "./pages/LandlordQuestionnaire";

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <ListingsProvider>
            <RoommatesProvider>
              <MessagesProvider>
                <BrowserRouter>
                  <Routes>
                    {/* Public, no app chrome */}
                    <Route path="/" element={<Landing />} />
                    <Route path="/onboarding" element={<Onboarding />} />
                    <Route path="/login" element={<Login />} />

                    {/* Mandatory one-time setup, no app chrome — outside AppLayout so
                        AppLayout's own redirect-to-questionnaire check can't loop here. */}
                    <Route
                      path="/questionnaire"
                      element={
                        <ProtectedRoute>
                          <RoleRoute allow={["tenant"]}>
                            <Questionnaire />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    />
                    <Route
                      path="/landlord-questionnaire"
                      element={
                        <ProtectedRoute>
                          <RoleRoute allow={["landlord"]}>
                            <LandlordQuestionnaire />
                          </RoleRoute>
                        </ProtectedRoute>
                      }
                    />

                    {/* Authenticated app shell */}
                    <Route
                      element={
                        <ProtectedRoute>
                          <AppLayout />
                        </ProtectedRoute>
                      }
                    >
                      {/* Tenant-only: browsing listings and roommate matching */}
                      <Route
                        path="/discover"
                        element={
                          <RoleRoute allow={["tenant"]}>
                            <Discover />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/roommates"
                        element={
                          <RoleRoute allow={["tenant"]}>
                            <RoommateMatching />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/roommates/:id"
                        element={
                          <RoleRoute allow={["tenant"]}>
                            <RoommateProfile />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/saved"
                        element={
                          <RoleRoute allow={["tenant"]}>
                            <Interests />
                          </RoleRoute>
                        }
                      />

                      {/* Landlord-only: creating and managing listings */}
                      <Route
                        path="/my-listings"
                        element={
                          <RoleRoute allow={["landlord"]}>
                            <MyListings />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/create-listing"
                        element={
                          <RoleRoute allow={["landlord"]}>
                            <CreateListing />
                          </RoleRoute>
                        }
                      />
                      <Route
                        path="/listings/:id/edit"
                        element={
                          <RoleRoute allow={["landlord"]}>
                            <CreateListing />
                          </RoleRoute>
                        }
                      />

                      {/* Shared between both roles */}
                      <Route path="/listings/:id" element={<ListingDetail />} />
                      <Route path="/messages" element={<Messages />} />
                      <Route path="/messages/:conversationId" element={<Messages />} />
                      <Route path="/profile" element={<Profile />} />
                    </Route>
                  </Routes>
                </BrowserRouter>
              </MessagesProvider>
            </RoommatesProvider>
          </ListingsProvider>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
