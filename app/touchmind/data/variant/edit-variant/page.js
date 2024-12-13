"use client";
import React, { useState, useEffect } from "react";
import { CircularProgress, MenuItem, TextField } from "@mui/material";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import SelectCategory from "@/app/src/components/dropdown/Category";
import Models from "@/app/src/components/dropdown/Models";
import { useRouter } from "next/navigation";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import { useDispatch, useSelector } from "react-redux";
import toast, { Toaster } from "react-hot-toast";
import { clearAllEditRecordIds } from "@/app/src/Redux/Slice/slice";
import Lottie from "react-lottie";
import * as animationData from "../../../../../assests/LoadingAnimation.json";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import ListingpageSuccessModal from "@/app/src/components/modal/ListingpageSuccessModal";

const EditVariant = () => {
  const [token, setToken] = useState("");
  const [editInputfields, setEditInputfields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const selectedID = useSelector((state) => state.tasks.multipleEditRecordId);
  const [lastmodifideBy, setlastmodifideBy] = useState();
  const [modifiedBy, setmodifiedBy] = useState();
  const [creationTime, setcreationTime] = useState();
  const [creator, setcreator] = useState();
  const [initialload, setInitialLoad] = useState(true);
  const [listingPageSuccess, setListingPageSuccess] = useState(false)


  const pageOptions = [
    {
      value: "",
      label: "Select Page type",
    },
    {
      value: "BC",
      label: "BC",
    },
    {
      value: "PD",
      label: "PD",
    },
  ];
  const defaultOptions = {
    loop: true,
    autoplay: true,
    animationData: animationData,
    rendererSettings: {
      preserveAspectRatio: "xMidYMid slice",
    },
  };
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
      handleFetchData(jwtToken);
    }
  }, []);

  const handleInputChange = (e, index) => {
    const { name, value } = e.target;
    setEditInputfields((prevFields) => {
      const updatedFields = [...prevFields];
      updatedFields[index] = { ...updatedFields[index], [name]: value };
      return updatedFields;
    });
  };

  const handlePageTypeChange = (e, index) => {
    const updatedFields = [...editInputfields];
    updatedFields[index].pageType = e.target.value;
    setEditInputfields(updatedFields);
  };

  const handleSubsidiaryChange = (newSubsidiary, index) => {
    const updatedFields = [...editInputfields];
    updatedFields[index].subsidiary = newSubsidiary;
    setEditInputfields(updatedFields);
  };

  const handleCategoryChange = (category, index) => {
    const updatedFields = [...editInputfields];
    updatedFields[index].category = category ? { recordId: category } : null;
    setEditInputfields(updatedFields);
  };

  const handleModelChange = (model, index) => {
    const updatedFields = [...editInputfields];
    updatedFields[index].model = model ? { recordId: model } : null;
    setEditInputfields(updatedFields);
  };

  const handleButtonClick = (index) => {
    const updatedFields = [...editInputfields];
    updatedFields[index].ButtonActive = !updatedFields[index].ButtonActive;
    setEditInputfields(updatedFields);
  };
  const dispatch = useDispatch();
  const handleSaveClick = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };

      const body = {
        variants: editInputfields.map((item) => ({
          recordId: item.recordId,
          identifier: item.identifier || "",
          shortDescription: item.shortDescription || "",
          externalProductUrl: item.externalProductUrl || "",
          pageType: item.pageType || "",
          category: item.category ? { recordId: item.category.recordId } : null,
          subsidiaries: item.subsidiaries || [],
          model: item.model ? { recordId: item.model.recordId } : null,
          status: item.ButtonActive,
        })),
      };

      const response = await axios.post(`${api}/admin/variant/edit`, body, {
        headers,
      });
      console.log(response, "response from api");
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setListingPageSuccess(true);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      setError("Error saving data");
      console.error("Error:", err);
    }
  };

  const handleFetchData = async (jwtToken) => {
    try {
      setLoading(true);
      const headers = { Authorization: `Bearer ${jwtToken}` };
      const body = { variants: selectedID.map((id) => ({ recordId: id })) };
      const response = await axios.post(`${api}/admin/variant/getedits`, body, {
        headers,
      });
      setlastmodifideBy(response.data.variants[0]?.lastModified || "");
      setmodifiedBy(response.data.variants[0]?.modifiedBy || "");
      setcreationTime(response.data.variants[0]?.creationTime || "");
      setcreator(response.data.variants[0]?.creator || "");

      const variants = response.data.variants.map((item) => ({
        ...item,
        ButtonActive: item.status || false,
        subsidiary: item.subsidiary || [],
        model: item.model || "",
        category: item.category || "",
        pageType: item.pageType || "",
      }));
      setEditInputfields(variants);
    } catch (err) {
      setError("Error fetching variant data");
      console.error("Error:", err);
    } finally {
      setLoading(false);
    }
  };

  const pagename = "Edit Variant";
  const breadscrums = "Admin > Variant";
  const contentname = "Variant";


  return (
    <AddNewPageButtons
      lastmodifideBy={lastmodifideBy}
      modifiedBy={modifiedBy}
      creator={creator}
      creationTime={creationTime}
      pagename={pagename}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
      email={email}
    >
      {loading ? (
        <>
          <div className="flex flex-row justify-center items-center w-full h-40">
            <div className="gap-5 flex flex-col items-center justify-center">
              <CircularProgress size={36} color="inherit" />
              <div>Loading...</div>
            </div>
          </div>
        </>
      ) : (
        <>
          {editInputfields.length < 1 ? (
            <div className="w-full flex flex-col  h-40 justify-center items-center">
              <div className="opacity-35 ">
                <Lottie options={defaultOptions} height={100} width={100} />
              </div>
              <div>No data found...</div>
            </div>
          ) : (
            <>
              <div className="flex flex-col w-full p-3 min-h-screen gap-5">
                <Toaster />
                {editInputfields.map((item, index) => (
                  <div
                    key={item.recordId}
                    className="bg-white p-4 rounded-md shadow-md"
                  >
                    <div className="grid grid-cols-3 gap-4 mb-4">
                      <TextField
                        label="Enter Identifier"
                        variant="standard"
                        fullWidth
                        name="identifier"
                        value={item.identifier || ""}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <TextField
                        label="Enter Description"
                        variant="standard"
                        fullWidth
                        name="shortDescription"
                        value={item.shortDescription || ""}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <TextField
                        label="External Product URL"
                        variant="standard"
                        fullWidth
                        name="externalProductUrl"
                        value={item.externalProductUrl || ""}
                        onChange={(e) => handleInputChange(e, index)}
                      />
                      <MultiSelectSubsidiary
                        initialload={initialload}
                        selectedSubsidiary={item.subsidiaries || []}
                        setSelectedSubsidiary={(newNode) => {
                          const updatedFields = editInputfields.map(
                            (field, i) => {
                              if (i === index) {
                                return {
                                  ...field,
                                  subsidiaries: newNode,
                                }; // Update node data
                              }
                              return field;
                            }
                          );
                          setEditInputfields(updatedFields); // Update state
                        }}
                      />
                      <SelectCategory
                        initialload={initialload}
                        selectedCategory={
                          item.category ? item.category.recordId : ""
                        }
                        setCategory={(category) =>
                          handleCategoryChange(category, index)
                        }
                      />

                      <Models
                        Model={item.model.recordId}
                        setModel={(model) => handleModelChange(model, index)}
                      />

                      <TextField
                        style={{ marginTop: "2.5vh" }}
                        className="text-xs w-[80%]"
                        select
                        variant="standard"
                        name="pageType"
                        value={item.pageType}
                        onChange={(e) => handlePageTypeChange(e, index)}
                        SelectProps={{ native: false }}
                      >
                        {pageOptions.map((option) => (
                          <MenuItem key={option.value} value={option.value}>
                            {option.label}
                          </MenuItem>
                        ))}
                      </TextField>
                    </div>
                    <div className="flex gap-4 items-center justify-end">
                      {item.ButtonActive ? (
                        <div
                          onClick={() => handleButtonClick(index)}
                          className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px]"
                        >
                          Active
                        </div>
                      ) : (
                        <div
                          onClick={() => handleButtonClick(index)}
                          className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px]"
                        >
                          Inactive
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </>
      )}
      <ListingpageSuccessModal
          contentname={contentname}
          isOpen={listingPageSuccess}
          setIsModalOpen={setListingPageSuccess}
        />
    </AddNewPageButtons>
  );
};

export default EditVariant;
