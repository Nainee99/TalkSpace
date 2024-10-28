import { useAppStore } from "@/store";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { IoArrowBack } from "react-icons/io5";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { colors, getColor } from "@/lib/utils";
import { FaTrash, FaPlus } from "react-icons/fa";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import {
  ADD_PROFILE_IMAGE_ROUTE,
  REMOVE_PROFILE_IMAGE_ROUTE,
  UPDATE_PROFILE_ROUTE,
} from "@/utils/constants";

const Profile = () => {
  const navigate = useNavigate();
  const { userInfo, setUserInfo } = useAppStore();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [image, setImage] = useState(null);
  const [hovered, setHovered] = useState(false);
  const [selectedColor, setSelectedColor] = useState(0);
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (userInfo.profileSetup) {
      setFirstName(userInfo.firstName);
      setLastName(userInfo.lastName);
      setSelectedColor(userInfo.color);
    }
  }, [userInfo]);

  const validateProfile = () => {
    if (!firstName) {
      toast.error("First Name is required");
      return false;
    }
    if (!lastName) {
      toast.error("Last Name is required");
      return false;
    }
    return true;
  };

  const saveChanges = async () => {
    if (validateProfile()) {
      console.log("sending data:", { firstName, lastName, selectedColor });

      try {
        const response = await apiClient.post(
          UPDATE_PROFILE_ROUTE,
          {
            firstName,
            lastName,
            color: selectedColor,
            profileSetup: true,
          },
          { withCredentials: true }
        );

        if (response.status === 200 && response.data) {
          setUserInfo({ ...response.data, profileSetup: true });
          toast.success("Profile updated successfully");
          navigate("/chat");
        }
      } catch (error) {
        console.error("Error during saveChanges:", error);
        toast.error("Failed to save changes");
      }
    }
  };

  const handleNavigate = () => {
    if (userInfo.profileSetup) {
      navigate("/chat");
    } else {
      toast.error("Please complete your profile setup");
    }
  };

  const handleFileInputClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = async (e) => {
    const file = e.target.files[0];
    console.log({ file });

    if (file) {
      const formData = new FormData();
      formData.append("profile-image", file); // Ensure "profile-image" matches backend

      try {
        const response = await apiClient.post(
          ADD_PROFILE_IMAGE_ROUTE,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }, // Important for file upload
          }
        );

        if (response.status === 200 && response.data.User.image) {
          setUserInfo({ ...userInfo, image: response.data.User.image });
          toast.success("Image uploaded successfully");

          // Preview image using FileReader
          const reader = new FileReader();
          reader.onload = () => {
            setImage(reader.result);
          };
          reader.readAsDataURL(file);
        } else {
          toast.error("Failed to upload image");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Failed to upload image");
      }

      e.target.value = null; // Optional reset of file input
    }
  };

  const handleDeleteImage = async () => {
    try {
      const response = await apiClient.delete(REMOVE_PROFILE_IMAGE_ROUTE, {
        withCredentials: true,
      });
      if (response.status === 200) {
        setUserInfo({ ...userInfo, image: null });
        setImage(null);
        toast.success("Image deleted successfully");
      }
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  return (
    <div className="bg-[#1b1c24] h-[100vh] flex items-center justify-center flex-col gap-10">
      <div className="flex flex-col gap-10 w-[80vw] md:w-max">
        <div>
          <IoArrowBack
            onClick={handleNavigate}
            className="text-4xl lg:text-6xl text-white/90 cursor-pointer"
          />
        </div>
        <div className="grid grid-cols-2">
          <div
            className=" relative h-full w-32 md:w-48 md:h-48 flex items-center justify-center"
            onMouseEnter={() => setHovered(true)}
            onMouseLeave={() => setHovered(false)}
          >
            <Avatar className="h-32 w-32 md:h-48 md:w-48 rounded-full overflow-hidden  ">
              {image ? (
                <AvatarImage
                  src={image}
                  alt="profile"
                  className="object-cover w-full h-full bg-black "
                />
              ) : (
                <div
                  className={`uppercase h-32 w-32 md:h-48 md:w-48 text-5xl border-[1px] flex items-center justify-center rounded-full ${getColor(
                    selectedColor
                  )} `}
                >
                  {firstName
                    ? firstName.split("").shift()
                    : userInfo && userInfo.email
                    ? userInfo.email.split("").shift()
                    : ""}
                </div>
              )}
            </Avatar>
            {hovered && (
              <div
                onClick={image ? handleDeleteImage : handleFileInputClick}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full cursor-pointer ring-fuchsia-50"
              >
                {image ? (
                  <FaTrash className="text-white text-3xl cursor-pointer" />
                ) : (
                  <FaPlus className="text-white text-3xl cursor-pointer" />
                )}
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              className="hidden"
              name="profile-image"
              accept=".png , .jpg , .jpeg , .svg"
            />
          </div>
          <div className="flex min-w-32 md:min-w-64 flex-col gap-5 text-white items-center justify-center ">
            <div className="w-full">
              <Input
                placeholder="Email"
                type="email"
                disabled
                value={userInfo.email}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="First Name"
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full">
              <Input
                placeholder="Last Name"
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="rounded-lg p-6 bg-[#2c2e3b] border-none"
              />
            </div>
            <div className="w-full flex gap-5 ">
              {colors.map((color, index) => (
                <div
                  key={index}
                  onClick={() => setSelectedColor(index)}
                  className={`h-8 w-8 rounded-full ${color} cursor-pointer transition-all duration-300 ${
                    selectedColor === index
                      ? "outline outline-white/50 outline-1"
                      : ""
                  }`}
                ></div>
              ))}
            </div>
          </div>
        </div>
        <div className="w-full ">
          <Button
            className="h-16 w-full bg-purple-700 hover:bg-purple-900 transition-all duration-300"
            onClick={saveChanges}
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Profile;
