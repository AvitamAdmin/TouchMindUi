"use client";
import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import NodeDropdown from "@/app/src/components/dropdown/Node";
import DashboardProfile from "@/app/src/components/dropdown/DashboardProfile";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import { SketchPicker } from "react-color";
import toast, { Toaster } from "react-hot-toast";

const AddDashboard = () => {
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedDashboardProfile, setSelectedDashboardProfile] = useState([]);
  const [initialload, setInitialLoad] = useState(true);

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  const [formValues, setFormValues] = useState({
    identifier: "",
    themeColor: "#ffffff", // Default color to white
    template: "",
  });

  const [displayColorPicker, setDisplayColorPicker] = useState(false); // Add state for color picker display

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
    }
  }, []);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleColorChange = (color) => {
    setFormValues({
      ...formValues,
      themeColor: color.hex, // Update themeColor with the selected color
    });
  };
  const validateForm = () => {
    let newErrors = {};

    if (!formValues.identifier.trim()) {
      newErrors.identifier = "Identifier is required.";
    }

    if (selectedSubsidiary.length === 0) {
      toast.error("Please select Subsidiary."); // Show toast error for node selection
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length === 0 && selectedSubsidiary?.length > 0
    );
  };
  const handleSaveClick = async () => {
    if (!validateForm()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        dashboards: [
          {
            identifier: formValues.identifier,
            themeColor: formValues.themeColor,
            template: formValues.template,
            subsidiary: selectedSubsidiary,
            node: selectedNode,
            dashboardProfile: selectedDashboardProfile,
            status: ButtonActive, // Use button active status (true or false)
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(`${api}/admin/dashboard/edit`, body, {
        headers,
      });
      console.log(response.data, "response from api");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/dashboard");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error fetching dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > dashboard";
  const pagename = "Add New";
  const [addnewpagebtn, setaddnewpagebtn] = useState(true);
  return (
    <AddNewPageButtons
      pagename={pagename}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
      setshow={addnewpagebtn}
    >
      <div
        className="flex flex-col w-full p-4 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <div className="flex flex-col bg-gray-200  rounded-md shadow">
          <Toaster />
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="grid grid-cols-4 gap-4 mb-4">
              <div className="mt-2">
                <TextField
                  label="Enter identifier "
                  variant="standard"
                  className="text-xs"
                  name="identifier"
                  value={formValues.identifier}
                  onChange={handleInputChange}
                  error={!!errors.identifier}
                  helperText={errors.identifier}
                />
              </div>

              <div className="mt-2">
                <NodeDropdown
                  initialload={initialload}
                  setSelectedNode={setSelectedNode}
                  selectedNode={selectedNode}
                  className="w-[45%] "
                />
              </div>

              <div>
                <TextField
                  label="themeColor"
                  variant="standard"
                  className="text-xs"
                  name="themeColor"
                  value="" // Leave value empty to avoid showing the color code
                  onClick={() => setDisplayColorPicker(!displayColorPicker)} // Toggle color picker on click
                  InputProps={{
                    style: {
                      backgroundColor: formValues.themeColor,
                      height: "40px",
                    },
                  }}
                  readOnly
                />
                {displayColorPicker ? (
                  <div style={{ position: "absolute", zIndex: "2" }}>
                    <div
                      style={{
                        position: "fixed",
                        top: "0px",
                        right: "0px",
                        bottom: "0px",
                        left: "0px",
                      }}
                      onClick={() => setDisplayColorPicker(false)}
                    />
                    <SketchPicker
                      color={formValues.themeColor}
                      onChange={handleColorChange}
                    />
                  </div>
                ) : null}
              </div>

              <TextField
                label="Enter Template"
                variant="standard"
                className="text-xs mt-2"
                name="template"
                value={formValues.template}
                onChange={handleInputChange}
              />
            </div>

            <div className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-4 mb-4">
                <DashboardProfile
                  initialload={initialload}
                  selectedDashboardProfile={selectedDashboardProfile}
                  setSelectedDashboardProfile={setSelectedDashboardProfile}
                />
                <div className="mt-5">
                  <SingleSelectSubsidiary
                    initialload={initialload}
                    selectedSubsidiary={selectedSubsidiary}
                    setSelectedSubsidiary={setSelectedSubsidiary}
                  />
                </div>
              </div>

              <div className="flex gap-4 items-center w-[100%] justify-end">
                <div className="flex flex-row gap-3 items-center">
                  {ButtonActive ? (
                    <div
                      onClick={() => setButtonActive(!ButtonActive)}
                      className="bg-[#1581ed]   border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Active
                    </div>
                  ) : (
                    <div
                      onClick={() => setButtonActive(!ButtonActive)}
                      className="bg-[#fff] border-2 border-solid border-[#1581ed] rounded-md text-gray-500 text-center cursor-pointer text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Inactive
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default AddDashboard;
