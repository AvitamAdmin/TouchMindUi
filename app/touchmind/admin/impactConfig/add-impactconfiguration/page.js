"use client";
import React, { useState, useEffect } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { Autocomplete, TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useRouter } from "next/navigation";
import toast, { Toaster } from "react-hot-toast";
import MultiselectLabelsDropdown from "@/app/src/components/multiSelectDropdown/MultiSelectLabelsDropdown";

const AddImpactConfiguration = () => {
  const [params, setParams] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [lablesList, setLablesList] = useState([]);
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
  });

  useEffect(() => {
    const jwtToken = getCookie("jwtToken");
    if (jwtToken) {
      setToken(jwtToken);
      fetchLabelsData();
    }
  }, []);

  const [errors, setErrors] = useState({});
  const fetchLabelsData = async () => {
    const token = getCookie("jwtToken");
    try {
      if (token) {
        const headers = { Authorization: `Bearer ${token}` };
        const response = await axios.get(`${api}/admin/impactConfig/add`, {
          headers,
        });

        // Sort labels alphabetically before setting the state
        const sortedLabels = (response.data.dashboardLabels || []).sort(
          (a, b) => a.localeCompare(b)
        );

        setLablesList(sortedLabels);
      }
    } catch (error) {
      console.error("Error fetching labels:", error);
    } finally {
      setLoading(false); // Reset loading state
    }
  };

  const handleInputFieldChange = (index, fieldName, value) => {
    setParams((prevParams) => {
      const updatedParams = [...prevParams];
      updatedParams[index] = {
        ...updatedParams[index],
        [fieldName]: value,
      };
      return updatedParams;
    });
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const handleAddParamClick = () => {
    setParams((prevParams) => [
      ...prevParams,
      {
        labels: [], // Initialize as an empty array
        impact: "",
        impactmultiplier: "",
      },
    ]);
  };

  const handleRemoveParamClick = (index) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };

  const handleParamChange = (index, value) => {
    const newParams = [...params];
    newParams[index] = value;
    setParams(newParams);
  };
  const validateForm = () => {
    let newErrors = {};

    if (!formValues.identifier.trim()) {
      newErrors.identifier = "Identifier is required.";
    }
    if (!formValues.shortDescription.trim()) {
      newErrors.shortDescription = "Description is required.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const handleSaveClick = async () => {
    if (!validateForm()) return;
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const labels = params.map((input) => ({
        labels: input.labels,
        impact: input.impact,
        multiplier: input.impactmultiplier,
      }));
      const body = {
        impactConfigs: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            status: ButtonActive,
            labels: labels,
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(
        `${api}/admin/impactConfig/edit`,
        body,
        { headers }
      );
      console.log(response.data, "response from api");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/impactConfig");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error fetching impactConfig data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > impactConfig";
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
        className="flex flex-col w-full p-3 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <Toaster />

        <div className="flex flex-col bg-gray-200  rounded-md shadow">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="grid grid-cols-3 gap-3 mb-4 items-center justify-center  flex-col">
              <TextField
                className="mt-3"
                error={!!errors.identifier}
                helperText={errors.identifier}
                label="Enter Identifier"
                variant="standard"
                fullWidth
                name="identifier"
                value={formValues.identifier}
                onChange={handleInputChange}
              />
              <TextField
                id="standard-textarea"
                label="Description"
                multiline
                variant="standard"
                className="mt-3"
                name="shortDescription"
                value={formValues.shortDescription}
                onChange={handleInputChange}
                error={!!errors.shortDescription}
                helperText={errors.shortDescription}
              />
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-3 items-center w-full justify-end">
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
                    className="bg-[#fff] border-2 text-center cursor-pointer border-solid border-[#1581ed] rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                  >
                    Inactive
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col mt-4 w-[100%]">
          <div className="grid grid-cols-1 gap-4 w-full">
            {params.map((param, index) => (
              <div
                key={index}
                className="flex items-center w-full grid-cols-3 gap-5 p-4"
              >
                <div className="w-[30%]">
                  <Autocomplete
                    multiple // Enable multiple selection
                    options={lablesList || []}
                    getOptionLabel={(option) => option || ""}
                    value={param.labels || []} // Ensure value is an array
                    onChange={(event, newValue) => {
                      handleInputFieldChange(index, "labels", newValue || []);
                    }}
                    isOptionEqualToValue={(option, value) => option === value}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        label="Select Labels"
                        variant="standard"
                      />
                    )}
                  />
                </div>
                <TextField
                  type="number"
                  className="mt-5 w-[30%]"
                  placeholder="Enter Impact"
                  variant="standard"
                  size="small"
                  value={param.impact}
                  onChange={(e) =>
                    handleInputFieldChange(index, "impact", e.target.value)
                  }
                />
                <TextField
                  type="number"
                  className="mt-5 w-[30%]"
                  placeholder="Enter Multiplier"
                  variant="standard"
                  size="small"
                  value={param.impactmultiplier}
                  onChange={(e) =>
                    handleInputFieldChange(
                      index,
                      "impactmultiplier",
                      e.target.value
                    )
                  }
                />

                <div
                  className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white  w-[30px]"
                  onClick={() => handleRemoveParamClick(index)}
                >
                  <FaMinus />
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-center mt-4 p-3 rounded-md bg-black text-white text-center cursor-pointer w-[120px] h-[45px]"
            onClick={handleAddParamClick}
          >
            Add label
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default AddImpactConfiguration;
