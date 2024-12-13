"use client";
import React, { useState, useEffect } from "react";
import { TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import SelectCategory from "@/app/src/components/dropdown/Category";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import toast, { Toaster } from "react-hot-toast";

const AddCategory = () => {
  const [ButtonActive, setButtonActive] = useState(false);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedCategories, setSelectedCategories] = useState("");
  const [token, setToken] = useState("");
  const [email, setEmail] = useState("");
  const [initialload, setInitialLoad] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();

  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
  });
  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

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
  const validateForm = () => {
    let newErrors = {};

    if (!formValues.identifier) {
      newErrors.identifier = "Identifier is required.";
    }
    if (!formValues.shortDescription) {
      newErrors.shortDescription = "Description is required.";
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
    if (!validateForm()) return; // Stop execution if form is invalid

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        categories: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            parentId: selectedCategory,
            childIds: selectedCategories ? selectedCategories : [],
            subsidiaries: selectedSubsidiary ? [selectedSubsidiary] : [],
            status: ButtonActive,
          },
        ],
      };

      console.log(body, "req body from user");
      console.log(token, "token");

      const response = await axios.post(`${api}/admin/category/edit`, body, {
        headers,
      });
      console.log(response.data, "response from api");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/cheil/data/category");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error fetching category data");
    } finally {
      setLoading(false);
    }
  };

  const breadscrums = "Admin > category";
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
      <Toaster />
      <div
        className="flex flex-col w-full p-4 min-h-screen gap-5"
        style={{ fontFamily: "SamsungOne, sans-serif" }}
      >
        <div className="flex flex-col bg-gray-200 rounded-md shadow">
          <div className="bg-white p-4 rounded-md shadow-md w-full">
            <div className=" grid-cols-3 gap-4 mb-4 items-center w-full justify-between flex flex-row">
              <TextField
                className="w-[25%] mt-5"
                label="Enter Identifier"
                variant="standard"
                name="identifier"
                value={formValues.identifier}
                onChange={handleInputChange}
                error={!!errors.identifier}
                helperText={errors.identifier}
              />
              <TextField
                className="w-[25%] mt-5"
                label="Short Description"
                variant="standard"
                name="shortDescription"
                value={formValues.shortDescription}
                onChange={handleInputChange}
                error={!!errors.shortDescription}
                helperText={errors.shortDescription}
              />

              <div className="w-[25%] mt-6">
                <SingleSelectSubsidiary
                  initialload={initialload}
                  setSelectedSubsidiary={setSelectedSubsidiary}
                  selectedSubsidiary={selectedSubsidiary}
                />
              </div>
              <div className="w-[25%]">
                <SelectCategory
                  initialload={initialload}
                  dropdownname="Select super category"
                  selectedCategory={selectedCategory}
                  setCategory={setSelectedCategory}
                />
              </div>
            </div>

            <div className="w-full gap-2 mb-4 items-start justify-start flex flex-row">
              <div className="w-[25%]">
                <SelectCategory
                  isMultiple
                  initialload={initialload}
                  dropdownname="Select subcategories"
                  selectedCategory={selectedCategories}
                  setCategory={setSelectedCategories}
                />
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex flex-row gap-3 items-center w-full justify-end">
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

export default AddCategory;
