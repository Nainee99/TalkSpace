import React, { useState } from "react";
import Background from "@/assets/login2.png";
import Victory from "@/assets/victory.svg";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import apiClient from "@/lib/apiClient";
import { LOGIN_ROUTE, SIGNUP_ROUTE } from "@/utils/constants";
import { useNavigate } from "react-router-dom";
import { useAppStore } from "@/store";

const Auth = () => {
  const navigate = useNavigate();
  const { setUserInfo } = useAppStore();
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [ConfirmPassword, setConfirmPassword] = useState("");

  // Generalized validation function
  const validateForm = (checkConfirmPassword = false) => {
    if (!Email.length) {
      toast.error("Email is required");
      return false;
    }
    if (!Password.length) {
      toast.error("Password is required");
      return false;
    }
    // For signUp, we also check if the passwords match
    if (checkConfirmPassword && Password !== ConfirmPassword) {
      toast.error("Passwords do not match");
      return false;
    }
    return true;
  };

  // Login handler
  const handleLogin = async (e) => {
    e.preventDefault();

    if (validateForm()) {
      const response = await apiClient.post(
        LOGIN_ROUTE,
        {
          email: Email,
          password: Password,
        },
        {
          withCredentials: true,
        }
      );
      if (response.data.User.id) {
        setUserInfo(response.data.User);
        if (response.data.User.profileSetup) {
          navigate("/chat");
        } else {
          navigate("/profile");
        }
      }
      console.log(Email, Password);
      console.log(response);
    }
  };

  // SignUp handler
  const handleSignUp = async (e) => {
    e.preventDefault();

    if (validateForm(true)) {
      const response = await apiClient.post(
        SIGNUP_ROUTE,
        {
          email: Email,
          password: Password,
        },
        {
          withCredentials: true,
        }
      );
      if (response.status === 201) {
        setUserInfo(response.data.User);
        navigate("/profile");
      }
      console.log(Email, Password);
      console.log(response);
    }
  };

  return (
    <div className="h-[100vh] w-[100vw] flex items-center justify-center">
      <div className="h-[80vh] bg-white border-2 border-white text-opacity-90 shadow-2xl w-[80vw] md:w[90vw] lg:w-[70vw] xl:w-[60vw] rounded-3xl grid xl:grid-cols-2">
        <div className="flex flex-col gap-10 items-center justify-center">
          <div className="flex items-center justify-center flex-col">
            <div className="flex items-center justify-center">
              <h1 className="text-5xl font-bold md:text-6xl">Welcome</h1>
              <img src={Victory} alt="Victory emoji" className="h-[100px]" />
            </div>
            <p className="font-medium text-center">
              Fill in the details to get started with the best chat app!
            </p>
          </div>
          <div className="flex items-center justify-center w-full">
            <Tabs className="w-3/4" defaultValue="login">
              <TabsList className="bg-transparent rounded-none w-full">
                <TabsTrigger
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                  value="login"
                >
                  Login
                </TabsTrigger>
                <TabsTrigger
                  className="data-[state=active]:bg-transparent text-black text-opacity-90 border-b-2 rounded-none w-full data-[state=active]:text-black data-[state=active]:border-b-purple-500 p-3 transition-all duration-300"
                  value="signup"
                >
                  Sign up
                </TabsTrigger>
              </TabsList>
              <TabsContent className="flex flex-col gap-5 mt-10" value="login">
                <form onSubmit={handleLogin} className="flex flex-col gap-5">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-full p-6"
                    autoComplete="email"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-full p-6"
                    autoComplete="password"
                  />
                  <Button className="rounded-full p-6" type="submit">
                    Login
                  </Button>
                </form>
              </TabsContent>
              <TabsContent className="flex flex-col gap-5" value="signup">
                <form onSubmit={handleSignUp} className="flex flex-col gap-5">
                  <Input
                    type="email"
                    placeholder="Email"
                    value={Email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="rounded-full p-6"
                    autoComplete="new-email"
                  />
                  <Input
                    type="password"
                    placeholder="Password"
                    value={Password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="rounded-full p-6"
                    autoComplete="new-password"
                  />
                  <Input
                    type="password"
                    placeholder="Confirm Password"
                    value={ConfirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="rounded-full p-6"
                    autoComplete="new-password"
                  />
                  <Button className="rounded-full p-6" type="submit">
                    Sign up
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </div>
        <div className="hidden xl:flex justify-center items-center">
          <img src={Background} alt="Background" className="h-[500px]" />
        </div>
      </div>
    </div>
  );
};

export default Auth;
