
"use client";
import React, { useEffect, useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { TextField } from "@mui/material";
import { useRouter } from "next/navigation";
import axios from "axios";
import { getCookie } from "cookies-next";
import AddNewPageButtons from "@/app/src/components/AddNewPageButtons/AddNewPageButtons";
import Fileformat from "@/app/src/components/dropdown/Fileformat";
import { api } from "@/envfile/api";
import toast, { Toaster } from "react-hot-toast";

const AddDataSource = () => {
  
  const [token, setToken] = useState("");
  const [ButtonActive, setButtonActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [selectedFormat, setSelectedFormat] = useState(""); // For the file format dropdown

  const [formValues, setFormValues] = useState({
    identifier: "",
    shortDescription: "",
    separator: "",
    sourceAddress: "",
    sukLink: "",
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


  const [params, setParams] = useState([]);

  const [inputs, setInputs] = useState([]);

  // Function to handle adding a new input field
  const handleAddInputFieldClick = () => {
    setInputs([
      ...inputs,
      {
        name: '',
        type: '',
        value: '',
        ButtonFilename: false,
        ButtonComma: false,
        ButtonFixed: false,
        ButtonOptional: false,
        ButtonImport: false,
      },
    ]);
  };

  // Function to handle changes in the input fields
  const handleInputFieldChange = (index, field, value) => {
    const newInputs = [...inputs];
    newInputs[index][field] = value;
    setInputs(newInputs);
  };

  // Function to remove an input field
  const handleRemoveInputFieldClick = (index) => {
    const newInputs = inputs.filter((_, i) => i !== index);
    setInputs(newInputs);
  };

  // Toggle individual button for a specific row
  const toggleButtonState = (index, buttonType) => {
    const newInputs = [...inputs];
    
    // Toggle only the specific button for this row
    newInputs[index][buttonType] = !newInputs[index][buttonType];
    
    setInputs(newInputs);
  };


 


  // Input field options



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

  const handleFormatChange = (format) => {
    setSelectedFormat(format); // Capture the file format
  };

  const handleSaveClick = async () => {

    const errors = {
      identifier: !formValues.identifier,
      shortDescription: !formValues.shortDescription,
      // subsidiaryError: selectedSubsidiary.length === 0, // Check if any subsidiary is selected
    };
  
    setFormErrors(errors);
    // if (errors.subsidiaryError) {
    //   toast.error('Please select at least one subsidiary!')}
    if (Object.values(errors).some((error) => error)) {
      return; // Stop execution if any field has an error
    }
    setLoading(true)
    try {
      const headers = { Authorization: `Bearer ${token}` };
  
      // Map the inputs array to the required format
      const formattedInputs = inputs.map(input => ({
        fieldName: input.name,
        inputFormat: input.type,
        fieldValue: input.value,
        fileName: input.ButtonFilename ? "true" : "false",
        comma: input.ButtonComma ? "true" : "false",
        fixed: input.ButtonFixed ? "true" : "false",
        optional: input.ButtonOptional ? "true" : "false",
        importBox: input.ButtonImport ? "true" : "false"
      }));
  
      const body = {
        dataSources: [
          {
            identifier: formValues.identifier,
            shortDescription: formValues.shortDescription,
            separatorSymbol: formValues.separator,
            format: selectedFormat, // Use selected format
            skuUrl: formValues.sukLink,
            sourceAddress: formValues.sourceAddress,
            status: ButtonActive, // Use button active status (true or false)
            srcInputParams: params,
            dataSourceInputs: formattedInputs // Pass the formatted inputs
          }
        ]
      };
      console.log(body, "response body api");

      const response = await axios.post(`${api}/admin/datasource/edit`, body, {
        headers,
      });
      if (response.data.success === true) {
  toast.success(`${response.data.message}`, { className: "text-sm" });
  setTimeout(() => {
    router.push("/touchmind/admin/datasource");
  }, 2000);
} else if (response.data.success === false) { // Corrected "else" to "else if"
  toast.error(`${response.data.message}`, { className: "text-sm" });
} else { // Fallback case
  toast.error(`${response.data.message}`, { className: "text-sm" });
}


      console.log(response.data, "response from api");
      setLoading(false);
    } catch (err) {
      setError("Error fetching Datasource data");
    } finally {
      setLoading(false);
    }
  };
  

  const handleRunClick = () => {
    alert("Run function executed from AddDataSource!");
  };

  const breadscrums = "Admin > Datasource";
  const pagename = "Add New";


 const inputFields =[
  {
    value:'Input Box',
    label:'Input Box'
  },

  {
    value:'Dropdown',
    label:'Dropdown '
  },
  {
    value:'Formular',
    label:'Formular '
  },
  {
    value:'Site Loader',
    label:'Site Loader '
  },
  {
    value:'Data and Time selector',
    label:'Data and Time selector'
  },

 ]
  const [addnewpagebtn, setaddnewpagebtn] = useState(true);
  return (
    <AddNewPageButtons
    setshow={addnewpagebtn}
      pagename={pagename}
      email={email}
      breadscrums={breadscrums}
      handleSaveClick={handleSaveClick}
      handleRunClick={handleRunClick}
    >
      <div className="p-2">
        <Toaster />
        <div className="flex flex-col bg-gray-200 p-2 rounded-md">
          <div className="bg-white p-4 rounded-md shadow-md">
            <div className="grid grid-cols-4 gap-2 mb-4">
              <TextField
                required
                label="Identifier"
                variant="standard"
                className="text-xs"
                name="identifier"
                error={formErrors.identifier}
                value={formValues.identifier}
                onChange={handleInputChange}
              />
              <TextField
                required
                label="Short Description"
                variant="standard"
                className="text-xs"
                name="shortDescription"
                error={formErrors.shortDescription}
                value={formValues.shortDescription}
                onChange={handleInputChange}
              />
              <TextField
                label="Separator"
                variant="standard"
                className="text-xs"
                name="separator"
                value={formValues.separator}
                onChange={handleInputChange}
              />
              <Fileformat
                setSelectedFormat={setSelectedFormat}
                selectedFormat={selectedFormat}
                onChange={handleFormatChange}
              />{" "}
              {/* File format dropdown */}
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <TextField
                  label="Source Address"
                  variant="standard"
                  className="text-xs w-full"
                  name="sourceAddress"
                  value={formValues.sourceAddress}
                  onChange={handleInputChange}
                />
              </div>
              <div>
                <TextField
                  label="SUK Link"
                  variant="standard"
                  className="text-xs w-full"
                  name="sukLink"
                  value={formValues.sukLink}
                  onChange={handleInputChange}
                />
              </div>

              <div className="flex gap-4 items-center w-[100%] justify-end">
                <div className="flex flex-row gap-3 items-center">
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

        <div className="p-2 gap-2 flex flex-col">
          <div className="flex flex-col mt-4 w-[100%]">
            <div className="grid grid-cols-3 gap-4">
              {params.map((param, index) => (
                <div key={index} className="flex items-center gap-2 bg-white p-1 rounded-md">
                  <TextField
                    placeholder="Enter Param Here"
                    variant="outlined"
                    size="small"
                    value={param}
                    onChange={(e) => handleParamChange(index, e.target.value)}
                    className="w-full"
                  />
                  <div
                    className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                    onClick={() => handleRemoveParamClick(index)}
                    style={{ width: "40px", height: "40px" }}
                  >
                    <FaMinus />
                  </div>
                </div>
              ))}
            </div>
            <div
              className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
              onClick={handleAddParamClick}
              style={{ width: "100px", height: "40px" }}
            >
              Add Param
            </div>
          </div>
        </div>


        <div className="p-2 gap-2 flex flex-col">
    <div className="flex flex-col mt-4 w-[100%]">
      <div className="grid gap-3">
        {inputs.map((input, index) => (
          <div key={index} className="flex flex-row justify-between w-full bg-white p-2 rounded-md items-center">
            <div className="flex items-start gap-2 w-[100%]">
              <div className="flex flex-row gap-3 items-start">
                <div
                  onClick={() => toggleButtonState(index, "ButtonFilename")}
                  className={`${
                    input.ButtonFilename
                      ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                      : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                  } border-2 border-solid border-${input.ButtonFilename ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[80px] h-[30px]`}
                >
                  Filename
                </div>

                <div
                  onClick={() => toggleButtonState(index, "ButtonComma")}
                  className={`${
                    input.ButtonComma
                      ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                      : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                  } border-2 border-solid border-${input.ButtonComma ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[80px] h-[30px]`}
                >
                  Comma
                </div>

                <div
                  onClick={() => toggleButtonState(index, "ButtonFixed")}
                  className={`${
                    input.ButtonFixed
                      ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                      : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                  } border-2 border-solid border-${input.ButtonFixed ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[80px] h-[30px]`}
                >
                  Fixed
                </div>

                <div
                  onClick={() => toggleButtonState(index, "ButtonOptional")}
                  className={`${
                    input.ButtonOptional
                      ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                      : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                  } border-2 border-solid border-${input.ButtonOptional ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[80px] h-[30px]`}
                >
                  Optional
                </div>

                <div
                  onClick={() => toggleButtonState(index, "ButtonImport")}
                  className={`${
                    input.ButtonImport
                      ? "bg-[#1581ed] text-center cursor-pointer  text-white"
                      : "bg-[#fff] text-gray-700 text-center cursor-pointer"
                  } border-2 border-solid border-${input.ButtonImport ? "#1581ed" : "gray-400"} rounded-md text-xs px-2 py-0.5 w-[80px] h-[30px]`}
                >
                  Import
                </div>
              </div>

              <div className="flex items-center gap-2 w-full justify-between">
                <TextField
                  className="w-full mt-0.5"
                  placeholder="Input Field Name"
                  variant="standard"
                  size="small"
                  value={input.name}
                  onChange={(e) => handleInputFieldChange(index, "name", e.target.value)}
                />

                <TextField
                  className="w-full"
                  select
                  defaultValue="Select the field input"
                  value={input.type}
                  onChange={(e) => handleInputFieldChange(index, "type", e.target.value)}
                  SelectProps={{
                    native: true,
                  }}
                  variant="standard"
                >
                  {inputFields.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>

                <TextField
                  placeholder="Enter the Values"
                  variant="standard"
                  size="small"
                  value={input.value}
                  onChange={(e) => handleInputFieldChange(index, "value", e.target.value)}
                  className="w-full"
                />

                <div
                  className="flex items-center justify-center p-2 rounded-md bg-red-600 text-white"
                  onClick={() => handleRemoveInputFieldClick(index)}
                  style={{ width: "50px", height: "35px" }}
                >
                  <FaMinus />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
      <div
        className="flex items-center justify-center mt-4 p-2 rounded-md bg-black text-white text-center cursor-pointer"
        onClick={handleAddInputFieldClick}
        style={{ width: "150px", height: "40px" }}
      >
        Add an input field
      </div>
    </div>
  </div>

      </div>
    </AddNewPageButtons>
  );
};

export default AddDataSource;