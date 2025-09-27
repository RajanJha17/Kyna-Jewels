import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  User,
  Wallet,
  CreditCard,
  Package,
  Clock,
  Heart,
  LogOut,
  Edit3,
  ChevronDown,
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import apiService from "@/services/api";

interface UserData {
  firstName: string;
  lastName?: string;
  email: string;
  secondaryEmail?: string;
  phoneNumber?: string;
  country?: string;
  state?: string;
  zipCode?: string;
  displayName?: string;
  profileImage?: File | null;
  // ...other backend fields
}

const ProfilePage: React.FC = () => {
  const location = useLocation();
  const locationState = location.state as { userData?: UserData } | null;
  const stateUserData = locationState?.userData;
  const [activeSection, setActiveSection] = useState("User Account");
  const [profileData, setProfileData] = useState<UserData>({
    firstName: "",
    lastName: "",
    displayName: "",
    email: "",
    secondaryEmail: "",
    phoneNumber: "",
    country: "",
    state: "",
    zipCode: "",
  });

  // useEffect(() => {
  //   // Prefer navigation state, fallback to localStorage
  //   let user: UserData | null = stateUserData || null;
  //   if (!user) {
  //     try {
  //       const storedUser = localStorage.getItem("user");
  //       if (storedUser) {
  //         user = JSON.parse(storedUser);
  //       }
  //     } catch {
  //       // Ignore JSON parse errors or missing localStorage user
  //     }
  //   }
  //   if (user) {
  //     setProfileData({
  //       firstName: user.firstName || "",
  //       lastName: user.lastName || "",
  //       displayName: user.displayName || user.firstName || "",
  //       email: user.email || "",
  //       secondaryEmail: user.secondaryEmail || "",
  //       phoneNumber: user.phoneNumber || "",
  //       country: user.country || "",
  //       state: user.state || "",
  //       zipCode: user.zipCode || "",
  //     });
  //   }
  // }, [stateUserData]);

  const sidebarItems = [
    { icon: User, label: "User Account", active: true },
    { icon: Wallet, label: "Wallet" },
    { icon: CreditCard, label: "Cards & Address" },
    { icon: Package, label: "Order History" },
    { icon: Clock, label: "Track Order" },
    { icon: Heart, label: "Wishlist" },
    { icon: LogOut, label: "Signout" },
  ];

  const handleInputChange = (field: string, value: string) => {
    setProfileData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

const handleSaveChanges = async () => {
  try {
    const { profileImage, ...jsonData } = profileData;

    // Assert the type directly here
    const response = (await apiService.updateProfile(jsonData)) as any;

    if (response.success && response.data.user) {
      alert("Profile updated successfully!");
      localStorage.setItem("user", JSON.stringify(response.user));
    } else {
      alert("Error updating profile: " + response.error);
    }
  } catch (err) {
    console.error(err);
    alert("Something went wrong while updating profile.");
  }
};

useEffect(() => {
  const fetchProfile = async () => {
    try {
      const response = (await apiService.getProfile()) as any; // call /profile API
      console.log("res",response)
      if (response.success && response.data.user) {
        const user = response.data.user;
        setProfileData({
          firstName: user.firstName || "",
          lastName: user.lastName || "",
          displayName: user.displayName || user.firstName || "",
          email: user.email || "",
          secondaryEmail: user.secondaryEmail || "",
          phoneNumber: user.phoneNumber || "",
          country: user.country || "",
          state: user.state || "",
          zipCode: user.zipCode || "",
        });
      }
    } catch (error) {
      console.error("❌ Failed to fetch profile:", error);
    }
  };

  fetchProfile();
}, []);





const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]; // optional chaining
  if (file) {
    setProfileData((prev) => ({ ...prev, profileImage: file }));
  }
};



  const getInitials = (firstName: string, lastName?: string) => {
    return (firstName.charAt(0) + (lastName?.charAt(0) || "")).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              Home
            </Link>
            <span className="mx-2">-</span>
            <span className="text-gray-800">User Account</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8 max-w-7xl mx-auto">
          {/* Sidebar */}
          <div className="lg:w-1/4">
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              {sidebarItems.map((item, index) => (
                <button
                  key={index}
                  onClick={() => setActiveSection(item.label)}
                  className={`w-full flex items-center px-4 py-3 text-left transition-colors border-b border-gray-100 last:border-b-0 ${
                    activeSection === item.label
                      ? "bg-[#328F94] text-white "
                      : "text-gray-700"
                  }`}
                >
                  <item.icon className="w-5 h-5 mr-3" />
                  <span className="text-sm font-medium">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:w-3/4">
            <div className="bg-white rounded-lg shadow-sm p-6 md:p-8">
              <h1 className="text-2xl font-semibold text-gray-800 mb-8">
                ACCOUNT SETTING
              </h1>
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Profile Image Section */}
                <div className="lg:w-1/3 flex flex-col items-center">
                 <div className="relative mb-4">
  <div
    className="w-32 h-32 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-4xl font-bold shadow-lg overflow-hidden"
  >
    {profileData.profileImage
      ? <img
          src={URL.createObjectURL(profileData.profileImage)}
          alt="Profile"
          className="w-full h-full object-cover"
        />
      : getInitials(profileData.firstName, profileData.lastName)}
  </div>

  {/* Use a label to trigger file input */}
  <label className="absolute bottom-2 right-2 cursor-pointer">
    <input
      type="file"
      accept="image/*"
      onChange={handleProfileImageChange}
      className="hidden"
    />
    <div className="bg-white rounded-full p-2 shadow-lg hover:shadow-xl border border-gray-200">
      <Edit3 className="w-4 h-4 text-gray-600" />
    </div>
  </label>
</div>
                </div>

                {/* Form Section */}
                <div className="lg:w-2/3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* First Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        First Name
                      </label>
                      <Input
                        type="text"
                        value={profileData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Last Name
                      </label>
                      <Input
                        type="text"
                        value={profileData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        placeholder="Display Name"
                        className="w-full"
                      />
                    </div>

                    {/* Email */}
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <Input
                        type="email"
                        value={profileData.email}
                        onChange={(e) =>
                          handleInputChange("email", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Secondary Email */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Secondary Email
                      </label>
                      <Input
                        type="email"
                        value={profileData.secondaryEmail}
                        onChange={(e) =>
                          handleInputChange("secondaryEmail", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Phone Number */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        value={profileData.phoneNumber}
                        onChange={(e) =>
                          handleInputChange("phoneNumber", e.target.value)
                        }
                        className="w-full"
                      />
                    </div>

                    {/* Country/Region */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Country/Region
                      </label>
                      <div className="relative">
                        <select
                          value={profileData.country}
                          onChange={(e) =>
                            handleInputChange("country", e.target.value)
                          }
                          className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent appearance-none"
                        >
                          <option value="India">India</option>
                          <option value="USA">USA</option>
                          <option value="UK">UK</option>
                          <option value="Canada">Canada</option>
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                      </div>
                    </div>

                    {/* States and Zip Code in one column */}
                    <div className="flex gap-3">
                      {/* States */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          States
                        </label>
                        <div className="relative">
                          <select
                            value={profileData.state}
                            onChange={(e) =>
                              handleInputChange("state", e.target.value)
                            }
                            className="w-full h-10 px-3 py-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-400 focus:border-transparent appearance-none"
                          >
                            <option value="Maharashtra">Maharashtra</option>
                            <option value="Delhi">Delhi</option>
                            <option value="Karnataka">Karnataka</option>
                            <option value="Tamil Nadu">Tamil Nadu</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                        </div>
                      </div>

                      {/* Zip Code */}
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Zip Code
                        </label>
                        <Input
                          type="text"
                          value={profileData.zipCode}
                          onChange={(e) =>
                            handleInputChange("zipCode", e.target.value)
                          }
                          className="w-full"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="mt-8">
                    <Button
                      onClick={handleSaveChanges}
                      className="bg-[#328F94] hover:text-[#328F94] hover:border-[#328F94] border-2 text-white px-8 py-3 rounded-md font-medium transition-colors"
                    >
                      Save Changes
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;