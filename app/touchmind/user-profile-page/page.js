"use client";
import MultiSelectRole from "@/app/src/components/multiSelectDropdown/MultiSelectRole";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import { api } from "@/envfile/api";
import { TextField, Tooltip } from "@mui/material";
import axios from "axios";
import { getCookie } from "cookies-next";
import React, { useEffect, useState } from "react";
import Lottie from "react-lottie";
import * as animationData from "../../../assests/userprofile.json";
import Image from "next/image";
import logo from "../../../assests/userprofile-pic.png";
import "animate.css";
import { IoTimeOutline } from "react-icons/io5";
import { LuUser2 } from "react-icons/lu";
import { MdOutlineMoreTime } from "react-icons/md";
import { AiOutlineUserAdd } from "react-icons/ai";
import toast, { Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const UserProfilePage = () => {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [userDto, setuserDto] = useState({
    username: "",
    organization: "",
    referredBy: "",
    password: "",
    passwordConfirm: "",
    subsidiaries: [],
    roles: [],
    status: false,
  });  const [initialload, setInitialLoad] = useState(true);

  // Fetch email and token on initial render
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    const jwtToken = getCookie("jwtToken");

    if (storedEmail) setEmail(storedEmail);
    if (jwtToken) setToken(jwtToken);
  }, []);

  // Fetch user details when both email and token are available
  useEffect(() => {
    if (email && token) {
      GetUserDetails();
    }
  }, [email, token]);

  const GetUserDetails = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = { username: email };

      console.log(body, "Request body");
      const response = await axios.post(`${api}/admin/user/get`, body, {
        headers,
      });
      setuserDto(response.data);
      console.log(response.data, "Response from API");
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  const lastmodifideTime =  userDto.lastModified;
  const lastmodifidetime = new Date(lastmodifideTime).toLocaleString();

  const createdTime = userDto.creationTime;
  const creationtime = new Date(createdTime).toLocaleString();
  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setuserDto((prev) => ({ ...prev, [name]: value }));
  };

  // Handle toggle for status
  const handleToggleButtonActive = () => {
    setuserDto((prev) => ({ ...prev, status: !prev.status }));
  };
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
 
  const handleSubmit = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
  
      const body = {
        users: [
          {
            recordId: userDto.recordId, // Assuming `recordId` is part of `userDto`
            username: userDto.username,
            subsidiaries: userDto.subsidiaries,
            roles: userDto.roles,
            password: userDto.password,
            passwordConfirm: userDto.passwordConfirm,
            status: userDto.status, 
            organization: userDto.organization,
            referredBy: userDto.referredBy,
          },
        ],
      };
  
      console.log("Submitting data:", body); // Log the data before sending
  
      const response = await axios.post(`${api}/admin/user/edit`, body, {
        headers,
      });
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/cheil");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
      console.log("Response data:", response.data);
    } catch (error) {
      console.error("Error submitting data:", error);
    }
  };
  
  return (
    <div className="w-full p-5 bg-[#fff] flex flex-col  gap-10  min-h-screen ">
      <Toaster />
      <div className="flex flex-row w-full justify-between">
        <div className="font-semibold font-serif">User Profile</div>
        <div className="flex flex-row gap-5">
             <Tooltip
              arrow
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [4, -14],
                      },
                    },
                  ],
                },
              }}
              title="  Creator  "
            >
              <div className="flex flex-row gap-1 items-center">
              <AiOutlineUserAdd size={18} />

                <p className="text-md text-black">{userDto.creator === null || "" ? "Not mentioned" : userDto.creator}</p>
              </div>
            </Tooltip>
            <Tooltip
              arrow
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [4, -14],
                      },
                    },
                  ],
                },
              }}
              title="  Creation Time "

            >
              <div className="flex flex-row gap-1 items-center">
                <MdOutlineMoreTime size={18} />
                <p className="text-md text-black">{creationtime === null || "" ? "Not mentioned" : creationtime}</p>
              </div>
            </Tooltip>
            <Tooltip
              arrow
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [4, -14],
                      },
                    },
                  ],
                },
              }}
               title="  Modified By  "
            >
              <div className="flex flex-row gap-1 items-center">
                <LuUser2 size={18} />
                <p className="text-md text-black">{userDto.modifiedBy === null || "" ? "Not mentioned" : userDto.modifiedBy}</p>
              </div>
            </Tooltip>
            <Tooltip
              arrow
              slotProps={{
                popper: {
                  modifiers: [
                    {
                      name: "offset",
                      options: {
                        offset: [4, -14],
                      },
                    },
                  ],
                },
              }}
              title="  Modified Time  "
            >
              <div className="flex flex-row gap-1 items-center">
                <IoTimeOutline />
                <p>{lastmodifidetime === null || "" ? "Not mentioned" : lastmodifidetime}</p> {/* Display current date and time */}
              </div>
            </Tooltip>
          </div>
      </div>
      <div className="mt-5 flex flex-row  w-[100%] justify-end gap-5">
      <div
          onClick={()=>{
            router.push("/cheil");
          }}
          className="bg-[#2b2b2b] text-white  p-2 rounded-md text-xs w-[70px]  text-center cursor-pointer "
        >
          Cancel
        </div>
        <div
          onClick={handleSubmit}
          className="bg-[#cc0001] text-white  p-2 rounded-md text-xs w-[70px]  text-center cursor-pointer   "
        >
          Submit
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-10 w-[100%]">
      <TextField
          label="Enter Email"
          variant="standard"
          className="text-xs "
          name="username"
          value={userDto.username || ""}
          onChange={handleInputChange}
        />   
         <TextField
          label="Password"
          variant="standard"
          className="text-xs "
          name="password"
          type="password"
          value={userDto.password || ""}
          onChange={handleInputChange}
        />  
         <TextField
          label="Confirm Password"
          variant="standard"
          className="text-xs "
          name="passwordConfirm"
          type="password"
          value={userDto.passwordConfirm || ""}
          onChange={handleInputChange}
        />   
        <TextField
          label="Organization"
          variant="standard"
          className="text-xs "
          name="organization"
          value={userDto.organization || ""}
          onChange={handleInputChange}
        />
         <TextField
          label="Referred By"
          variant="standard"
          className="text-xs"
          name="referredBy"
          value={userDto.referredBy || ""}
          onChange={handleInputChange}
        />
        <MultiSelectSubsidiary
          initialload={initialload}
          setSelectedSubsidiary={(subsidiaries) => {
            setuserDto((prev) => ({ ...prev, subsidiaries }));
          }}
          selectedSubsidiary={userDto.subsidiaries || []}
        />
         <MultiSelectRole
          initialload={initialload}
          setSelectedRoles={(roles) => {
            setuserDto((prev) => ({ ...prev, roles }));
          }}
          selectedRoles={userDto.roles || []}
        />
       
       
       
      </div>
      <div className="flex flex-row justify-end w-full items-end">
       {userDto.status ? (
          <div
            onClick={handleToggleButtonActive}
            className="bg-[#1581ed] text-center cursor-pointer border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated animate__pulse"
          >
            Active
          </div>
        ) : (
          <div
            onClick={handleToggleButtonActive}
            className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px] animate__animated animate__pulse"
          >
            Inactive
          </div>
        )}
       </div>
    
      <div>
     

       
       
      </div>
      
      
    </div>
  );
};

export default UserProfilePage;
