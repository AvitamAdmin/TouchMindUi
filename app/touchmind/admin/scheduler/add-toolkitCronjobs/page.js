"use client";
import React, { useEffect, useState } from "react";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import NodeDropdown from "@/app/src/components/dropdown/Node";
import MappingDropdown from "@/app/src/components/dropdown/Mapping";
import SitesDropdown from "@/app/src/components/dropdown/Sites";
import { useRouter } from "next/navigation";
import { TextField } from "@mui/material";
import { getCookie } from "cookies-next";
import axios from "axios";
import { api } from "@/envfile/api";
import SingleSelectSubsidiary from "@/app/src/components/dropdown/Subsidiary";
import Models from "@/app/src/components/dropdown/Models";
import toast, { Toaster } from "react-hot-toast";
import CronCalculator from "@/app/src/components/modal/CronjobExpressionCalculator";
import { useDispatch, useSelector } from "react-redux";
import { deleteCronExpression } from "@/app/src/Redux/Slice/slice";

const AddToolkitCronjobs = () => {
  const [params, setParams] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [HistoryActive, sethistoryActive] = useState(false);
  const [email, setEmail] = useState("");
  const [reset, setReset] = useState(false);
  const [selectedNode, setSelectedNode] = useState([]);
  const [initialload, setInitialLoad] = useState(true);
  const [mapping, setMapping] = useState([]);
  const [selectedSubsidiary, setSelectedSubsidiary] = useState([]);
  const [sites, setSites] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState("");
  const [Model, setModel] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const token = getCookie("jwtToken");
    console.log(token, "token from the add interface");
    setToken(token);
  }, []);
  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(deleteCronExpression());
  }, []);
  const cronExpression = useSelector((state) => state.tasks.cronExpression);

  const router = useRouter();

  useEffect(() => {
    const storedEmail = localStorage.getItem("username");
    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);
  const [formValues, setFormValues] = useState({
    campaign: "",
    skus: "",
    identifier: "",
  });

  const [campaignError, setCampaignError] = useState(false); // Error state for campaign

  const { campaign, skus, identifier } = formValues;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormValues({
      ...formValues,
      [name]: value, // Dynamically update form values
    });
    if (name === "campaign") setCampaignError(false); // Reset campaign error on input
    setErrors((prevErrors) => ({ ...prevErrors, [name]: "" }));
  };

  const validateForm = () => {
    let newErrors = {};

    if (!formValues.identifier.trim()) {
      newErrors.identifier = "Identifier is required.";
    }
    // if (!formValues.shortDescription.trim()) {
    //   newErrors.shortDescription = "Description is required.";
    // }
    if (selectedSubsidiary.length === 0) {
      toast.error("Please select Subsidiary."); // Show toast error for node selection
    }
    if (selectedNode.length === 0) {
      toast.error("Please select Interface."); // Show toast error for node selection
    }
    if (mapping.length === 0) {
      toast.error("Please select Mapping."); // Show toast error for node selection
    }
    if (sites.length === 0) {
      toast.error("Please select Sites."); // Show toast error for node selection
    }
    if (Model.length === 0) {
      toast.error("Please select Model."); // Show toast error for node selection
    }

    setErrors(newErrors);
    return (
      Object.keys(newErrors).length === 0 && selectedSubsidiary?.length > 0
    );
  };

  const handleAddParamClick = () => {
    setParams([...params, ""]);
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

  const openModal = () => {
    setIsModalOpen(true);
  };

  const handleSaveClick = async () => {
    if (!validateForm()) return;

    if (selectedSubsidiary.length === 0) {
      toast.error("Please select at least one subsidiary!");
      return;
    }
    if (!campaign.trim()) {
      setCampaignError(true); // Set error state to true
      return; // Stop function execution if campaign is empty
    }

    try {
      const headers = { Authorization: `Bearer ${token}` };
      const body = {
        schedulerJobs: [
          {
            identifier: identifier,
            cronId: selectedNode,
            cronExpression: cronExpression,
            sites: sites,
            shortcuts: Model,
            subsidiary: selectedSubsidiary,
            mapping: mapping,
            // nodePath: "",
            skus: campaign,
            // voucherCode: "",
            // jobStatus: "",
            enableHistory: HistoryActive,
            status: ButtonActive,
          },
        ],
      };

      console.log(body, "req body from user");

      // Make the API call
      const response = await axios.post(`${api}/admin/scheduler/edit`, body, {
        headers,
      });
      console.log(response.data.schedulerJobs, "response from API");

      // After a successful save, navigate to another page
      if (response.data.success === true) {
        toast.success(`${response.data.message}`, { className: "text-sm" });
        setTimeout(() => {
          router.push("/touchmind/admin/scheduler");
        }, 2000);
      } else if (response.data.success === false) {
        // Corrected "else" to "else if"
        toast.error(`${response.data.message}`, { className: "text-sm" });
      } else {
        // Fallback case
        toast.error(`${response.data.message}`, { className: "text-sm" });
      }
    } catch (err) {
      // Log the error details
      console.error(
        "Error fetching interface data:",
        err.response ? err.response.data : err.message
      );
    }
  };

  const breadscrums = "Admin > Scheduler";
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
              <div className=" w-full grid grid-cols-4  gap-10 p-2 ">
                <div className="mt-6">
                  <TextField
                    required
                    label="Enter Identifier"
                    variant="standard"
                    className="text-xs"
                    fullWidth
                    name="identifier"
                    value={identifier}
                    onChange={handleInputChange}
                    error={!!errors.identifier}
                    helperText={errors.identifier}
                  />
                </div>
                <div className="mt-6">
                  {" "}
                  <NodeDropdown
                    dropdownName="Select Interface"
                    initialload={initialload}
                    setSelectedNode={setSelectedNode}
                    selectedNode={selectedNode}
                  />
                </div>
                <div className="mt-6">
                  <MappingDropdown
                    initialload={initialload}
                    setMapping={setMapping}
                    mapping={mapping}
                  />
                </div>
                <div className="mt-6">
                  <SingleSelectSubsidiary
                    initialload={initialload}
                    selectedSubsidiary={selectedSubsidiary}
                    setSelectedSubsidiary={setSelectedSubsidiary}
                  />
                </div>
              </div>

              <div className=" w-full grid grid-cols-2  gap-10 p-2 ">
                <div className="w-full items-center flex-row flex">
                  <TextField
                    id="standard-textarea"
                    label="Cronjob Expression"
                    placeholder="Placeholder"
                    multiline
                    variant="standard"
                    onClick={openModal}
                    name="cronExpression"
                    value={cronExpression}
                    onChange={handleInputChange}
                    fullWidth
                  />

                  <CronCalculator
                    isOpen={isModalOpen}
                    setIsModalOpen={setIsModalOpen}
                  />
                </div>
                <div>
                  {" "}
                  <SitesDropdown
                    initialload={initialload}
                    setSites={setSites}
                    sites={sites}
                  />
                </div>
              </div>

              <div className=" gap-4 mb-4 items-center w-full justify-end flex-row flex p-2">
                <div className=" flex flex-row items-center justify-center gap-7">
                  <div>
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
                  <div>
                    {HistoryActive ? (
                      <div
                        onClick={() => sethistoryActive(!HistoryActive)}
                        className="bg-[#1581ed]   border-2 border-solid border-gray-400 text-center cursor-pointer rounded-md text-white text-xs px-2 py-0.5 w-[100px] animate__animated  animate__pulse"
                      >
                        Save History
                      </div>
                    ) : (
                      <div
                        onClick={() => sethistoryActive(!HistoryActive)}
                        className="bg-[#fff] border-2 border-solid border-[#1581ed] rounded-md text-gray-500 text-xs text-center cursor-pointer px-2 py-0.5 w-[100px] animate__animated  animate__pulse"
                      >
                        UnSave
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 flex flex-col gap-3">
            <div className="flex flex-col gap-3">
              <div className="font-bold">Please enter SKU's</div>
              <div className="flex flex-col gap-1 items-center">
                <textarea
                  name="campaign"
                  value={campaign}
                  onChange={handleInputChange}
                  className={`w-full h-52 border-2 rounded-md ${
                    campaignError ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter campaign identifier"
                />
                {campaignError && (
                  <div className="text-red-500 w-full  text-start text-sm mt-1">
                    Campaign identifier is mandatory.
                  </div>
                )}
              </div>
            </div>
            <div className="p-2">
              <Models
                initialload={initialload}
                Model={Model}
                setModel={setModel}
              />
            </div>
          </div>

          {/* <div className="p-4 flex flex-col gap-3 w-full">
            {reset && (
              <div className="flex flex-col w-full justify-center items-center">
                <div
                  className="bg-[#cc0001]  py-1 w-[100px] rounded-md text-white justify-center items-center"
                  onClick={() => setReset(!reset)}
                >
                  Reset all
                </div>
              </div>
            )}
          </div> */}
        </div>
      </div>
    </AddNewPageButtons>
  );
};

export default AddToolkitCronjobs;
