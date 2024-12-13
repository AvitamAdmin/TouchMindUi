"use client";
import React, { useState, useEffect } from "react";
import { FaMinus } from "react-icons/fa";
import { Autocomplete, TextField } from "@mui/material";
import "animate.css";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getCookie } from "cookies-next";
import { api } from "@/envfile/api";
import DataRelation from "@/app/src/components/dropdown/DataRelation";
import NodeDropdown from "@/app/src/components/dropdown/Node";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import MultiSelectSubsidiary from "@/app/src/components/multiSelectDropdown/Subsidiary";
import toast, { Toaster } from "react-hot-toast";

const addMapping = () => {
  const [token, setToken] = useState("");
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [dataRelation, setDataRelation] = useState("");
  const [ButtonActive, setButtonActive] = useState(false);
  const [EnableVoucher, setenableVoucher] = useState(false);
  const [EnableCategory, setenableCategory] = useState(false);
  const [EnableCurrentPage, setenableCurrentPage] = useState(false);
  const [EnableBundle, setenableBundle] = useState(false);
  const [EnableVariant, setenableVariant] = useState(false);
  const router = useRouter();
  const [initialload, setInitialLoad] = useState(true);
  const [selectedNode, setSelectedNode] = useState(null); // Store selected node
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [subsidiary, setSubsidiary] = useState([]);
  const [datasourceData, setDatasourceData] = useState([]);
  const [datasourceDataParams, setDatasourceDataParams] = useState([]);

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
      getAllSubsidiaries();
    }
  }, []);

  const [params, setParams] = useState([]);

  const handleAddParamClick = () => {
    getDataSources();

    setParams((prevParams) => [
      ...prevParams,
      {
        name: "",
        dataSourceData: "",
        dataSourceParams: "",
        ButtonPivot: false,
      },
    ]);
  };

  const handleRemoveParamClick = (index) => {
    const newParams = params.filter((_, i) => i !== index);
    setParams(newParams);
  };

  // Handle change for form inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value,
    });
    setFormErrors((prevErrors) => ({ ...prevErrors, [name]: false }));
  };

  const [formErrors, setFormErrors] = useState({
    identifier: false,
    shortDescription: false,
    subsidiaryError: false,
  });

  const handleSaveClick = async () => {
    const errors = {
      identifier: !formValues.identifier,
      shortDescription: !formValues.shortDescription,
      subsidiaryError: selectedSubsidiary.length === 0, // Check if any subsidiary is selected
    };

    setFormErrors(errors);
    if (errors.subsidiaryError) {
      toast.error("Please select at least one subsidiary!");
    }
    if (Object.values(errors).some((error) => error)) {
      return; // Stop execution if any field has an error
    }

    setLoading(true);

    try {
      console.log(selectedNode, "Token from user");

      const headers = { Authorization: `Bearer ${token}` };
      const sourceTargetParamMappings = params.map((input) => ({
        header: input.name,
        dataSource: input.dataSourceData,
        param: input.dataSourceParams,
        isPivot: input.ButtonPivot,
      }));
      const body = {
        sourceTargetMappings: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            node: selectedNode,
            dataRelation: dataRelation,
            status: ButtonActive,
            enableVoucher: EnableVoucher,
            enableCategory: EnableCategory,
            enableCurrentPage: EnableCurrentPage,
            enableToggle: EnableBundle,
            enableVariant: EnableVariant,
            subsidiaries: selectedSubsidiary.map((id) => id),
            sourceTargetParamMappings: sourceTargetParamMappings,
          },
        ],
      };

      console.log(body, "Request body from user"); // Log request body

      const response = await axios.post(`${api}/admin/mapping/edit`, body, {
        headers,
      });

      console.log(response.data, "Response from API"); // Log response data

      // Navigate to another page or update UI based on response
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/mapping");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      console.error(err); // Log the error object for better debugging
      setError("Error fetching mapping data");
    } finally {
      setLoading(false); // Stop loading state
    }
  };

  const breadscrums = "Admin > Mapping";
  const pagename = "Add New";

  const getAllSubsidiaries = async () => {
    try {
      const response = await axios.get(api + "/admin/subsidiary/get");
      setSubsidiary(response.data.subsidiaries);
      // console.log(response.data.subsidiaries, "subsidiaries fetched");
    } catch (error) {
      console.log(error, "error fetching subsidiaries");
    }
  };

  const getDataSources = async () => {
    try {
      const headers = { Authorization: "Bearer " + token };
      const body = {
        recordId: dataRelation,
      };
      console.log(dataRelation, "selectedDataRelation from dataSources");
      const response = await axios.post(
        api + "/admin/mapping/getDataSourcesByRelationId",
        body,
        {
          headers,
        }
      );
      setDatasourceData(response.data);
      console.log(response.data, "dataSources dataSources fetched");
    } catch (error) {
      console.log("Error fetching dataSources data", error);
    }
  };
  const getDataSourcesParams = async (selectedRecordId) => {
    try {
      const headers = { Authorization: "Bearer " + token };
      const body = {
        recordId: selectedRecordId, // Use the selected recordId passed from onChange
      };

      console.log(selectedRecordId, "selectedDatasource from dataSources");

      const response = await axios.post(
        api + "/admin/mapping/getDataSourceParamsById",
        body,
        { headers }
      );

      setDatasourceDataParams(response.data);
      console.log(response.data, "dataSources Params fetched");
    } catch (error) {
      console.log("Error fetching dataSources data", error);
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
  const toggleButtonState = (index, buttonType) => {
    const newInputs = [...params];

    // Toggle only the specific button for this row
    newInputs[index][buttonType] = !newInputs[index][buttonType];

    setParams(newInputs);
  };

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
        {" "}
        <Toaster />
        <div className="bg-gray-200 flex flex-col pb-5 rounded-md">
          <div className="  w-[100%] flex items-center flex-row justify-center ">
            <div className="bg-white gap-5 w-[98%] rounded-md shadow-md flex flex-col justify-center pb-4 p-2">
              <div className="flex flex-col gap-4 rounded-lg bg-white border-solid border-2 border-white w-full">
                <div className=" flex-row justify-between grid grid-cols-4 gap-3">
                  <TextField
                    required
                    id="standard-textarea"
                    label=" Enter Identifier"
                    variant="standard"
                    name="identifier"
                    value={formValues.identifier}
                    error={formErrors.identifier}
                    onChange={handleInputChange}
                  />
                  <TextField
                    required
                    error={formErrors.shortDescription}
                    id="standard-textarea"
                    label=" Enter Description"
                    variant="standard"
                    name="shortDescription"
                    value={formValues.shortDescription}
                    onChange={handleInputChange}
                  />
                  <div className="flex flex-col">
                    <MultiSelectSubsidiary
                      initialload={initialload}
                      setSelectedSubsidiary={setSelectedSubsidiary}
                      selectedSubsidiary={selectedSubsidiary}
                    />
                    {/* {formErrors.subsidiaryError && (
    <span className="text-red-500">At least one subsidiary must be selected</span>
  )} */}
                  </div>
                  <div className="">
                    <NodeDropdown
                      initialload={initialload}
                      selectedNode={selectedNode}
                      setSelectedNode={setSelectedNode}
                    />
                  </div>

                  <DataRelation
                    initialload={initialload}
                    selectedDataRelation={dataRelation}
                    setSelectedDataRelation={setDataRelation}
                  />
                </div>
              </div>

              <div className=" gap-4 mb-4 items-center justify-center flex w-full flex-col">
                <div className="flex flex-row gap-3 w-full justify-start">
                  <div className="flex gap-3 mt-4 ">
                    {EnableVoucher == false ? (
                      <div
                        onClick={() => setenableVoucher(!EnableVoucher)}
                        className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Voucher
                      </div>
                    ) : (
                      <div
                        onClick={() => setenableVoucher(!EnableVoucher)}
                        className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Voucher
                      </div>
                    )}
                  </div>
                  <div className="flex gap-3 mt-4">
                    {EnableCategory == false ? (
                      <div
                        onClick={() => setenableCategory(!EnableCategory)}
                        className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Category
                      </div>
                    ) : (
                      <div
                        onClick={() => setenableCategory(!EnableCategory)}
                        className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Category
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4 ">
                    {EnableCurrentPage == false ? (
                      <div
                        onClick={() => setenableCurrentPage(!EnableCurrentPage)}
                        className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[100px] animate__animated  animate__pulse"
                      >
                        Current Page
                      </div>
                    ) : (
                      <div
                        onClick={() => setenableCurrentPage(!EnableCurrentPage)}
                        className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[100px] animate__animated  animate__pulse"
                      >
                        Current Page
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    {EnableBundle == false ? (
                      <div
                        onClick={() => setenableBundle(!EnableBundle)}
                        className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Bundle
                      </div>
                    ) : (
                      <div
                        onClick={() => setenableBundle(!EnableBundle)}
                        className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Bundle
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3 mt-4">
                    {EnableVariant == false ? (
                      <div
                        onClick={() => setenableVariant(!EnableVariant)}
                        className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-gray-500 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Variant
                      </div>
                    ) : (
                      <div
                        onClick={() => setenableVariant(!EnableVariant)}
                        className="bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                      >
                        Variant
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-3 ">
                <div className="flex flex-row gap-3 items-center w-full justify-end">
                  {ButtonActive == false ? (
                    <div
                      onClick={() => setButtonActive(!ButtonActive)}
                      className="bg-[#fff] border-2 border-solid border-gray-400 text-center cursor-pointer  rounded-md text-gray-700 text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      InActive
                    </div>
                  ) : (
                    <div
                      onClick={() => setButtonActive(!ButtonActive)}
                      className=" bg-[#1581ed] text-center cursor-pointer  border-2 border-solid border-[#1581ed] rounded-md text-white text-xs px-2 py-0.5 w-[80px] animate__animated  animate__pulse"
                    >
                      Active
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="flex flex-col mt-4 p-4 w-[100%]">
          <div className="flex-row gap-4 w-[100%] grid grid-cols-1">
            {params.map((param, index) => (
              <div
                key={index}
                className="items-center justify-between gap-5 flex flex-row w-[100%] p-2"
              >
                <TextField
                  className="mt-5 w-[25%]"
                  placeholder="*Input the Report Header"
                  variant="standard"
                  size="small"
                  value={param.name}
                  onChange={(e) =>
                    handleInputFieldChange(index, "name", e.target.value)
                  }
                />

                <Autocomplete
                className="w-[25%]"
                  options={datasourceData || []}
                  getOptionLabel={(option) => option.identifier || ""}
                  value={
                    datasourceData.find(
                      (ds) => ds.recordId === param.dataSourceData
                    ) || null
                  }
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "dataSourceData",
                      newValue?.recordId || ""
                    );
                    if (newValue?.recordId) {
                      getDataSourcesParams(newValue.recordId); // Fetch data source params
                    }
                  }}
                  isOptionEqualToValue={(option, value) =>
                    option.recordId === value?.recordId
                  }
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Please select the data source"
                      variant="standard"
                    />
                  )}
                />

                <Autocomplete
                className="w-[25%]"
                  options={datasourceDataParams || []}
                  getOptionLabel={(option) => option || ""}
                  value={param.dataSourceParams || null}
                  onChange={(event, newValue) => {
                    handleInputFieldChange(
                      index,
                      "dataSourceParams",
                      newValue || ""
                    );
                  }}
                  isOptionEqualToValue={(option, value) => option === value}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Select Params"
                      variant="standard"
                    />
                  )}
                />

                <div className="flex flex-row gap-5 justify-center items-end">
                  <div
                    onClick={() => toggleButtonState(index, "ButtonPivot")}
                    className={`${
                      param.ButtonPivot
                        ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                        : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                    } border-2 border-solid border-${
                      param.ButtonPivot ? "#1581ed" : "gray-400"
                    } rounded-md text-xs px-2 py-0.5 w-[70px] h-[25px]`}
                  >
                    Pivot
                  </div>

                  <div
                    className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                    onClick={() => handleRemoveParamClick(index)}
                    style={{ width: "30px", height: "30px" }}
                  >
                    <FaMinus />
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div
            className="flex items-center justify-center mt-4 p-2 rounded-md text-white"
            onClick={() => {
              if (dataRelation) {
                handleAddParamClick();
              } else {
                toast.error("Select DataRelation to Add Param");
                console.log("Select DataRelation to add param");
              }
            }}
            style={{
              width: "100px",
              height: "40px",
              backgroundColor: dataRelation ? "black" : "grey",
              cursor: dataRelation ? "pointer" : "not-allowed",
            }}
          >
            Add Param
          </div>
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default addMapping;
