"use client";
import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";

const CronjobProfile = () => {
  const [params, setParams] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const [formValues, setFormValues] = useState({
    identifier: "",
    recipients: "",
  });

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };
  const validateForm = () => {
    let newErrors = {};

    if (!formValues.identifier.trim()) {
      newErrors.identifier = "Identifier is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSaveClick = async () => {
    if (!validateForm()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        cronJobProfiles: [
          {
            identifier: formValues.identifier,
            recipients: formValues.recipients,
            status: ButtonActive, // Use button active status (true or false)
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(
        `${api}/admin/cronjobProfile/edit`,
        body,
        { headers }
      );
      console.log(response.data, "response from api");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/cronjobProfile");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error fetching cronjobProfile data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > cronjobProfile";
  const pagename = "Add New";
  const [addnewpagebtn, setaddnewpagebtn] = useState(true);
  return (
    <AddNewPageButtons
      setshow={addnewpagebtn}
      pagename={pagename}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
    >
      <div
        className="flex flex-col w-full  min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />
        <div className="bg-gray-200 flex flex-col pb-5 rounded-md">
          <div className="  w-[100%] flex items-center flex-row justify-center ">
            <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
              <div className=" w-full flex flex-row justisy-between gap-10 p-2 items-center "></div>

              <div className=" w-full flex flex-row   p-2">
                <TextField
                  className="w-[33%]"
                  variant="standard"
                  label="Enter Identifier"
                  id="fullWidth"
                  size="small"
                  name="identifier"
                  value={formValues.identifier}
                  onChange={handleInputChange}
                  error={!!errors.identifier}
                  helperText={errors.identifier}
                />
              </div>

              <div className="p-2 flex flex-row gap-3 w-full">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input Recipients</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea
                      className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md"
                      name="recipients"
                      value={formValues.recipients}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-row w-full justify-end pr-2">
                {ButtonActive ? (
                  <div
                    onClick={() => setButtonActive(!ButtonActive)}
                    className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                  >
                    Active
                  </div>
                ) : (
                  <div
                    onClick={() => setButtonActive(!ButtonActive)}
                    className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                  >
                    Inactive
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default CronjobProfile;
