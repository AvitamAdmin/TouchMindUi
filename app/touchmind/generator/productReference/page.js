"use client";
import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MenuItem, TextField } from "@mui/material";
import { TbClockEdit, TbClockPlus } from "react-icons/tb";
import Link from "next/link";
import { LuCopyPlus } from "react-icons/lu";
import { DtPicker } from "react-calendar-datetime-picker";
import "./page.css";

const productReference = () => {
  const [params, setParams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ButtonActive, setButtonActive] = useState(false);
  const [Reset, setReset] = useState(false);
  const [date, setDate] = useState(null);

  const handleAddParamClick = () => {
    setParams([...params, ""]);
    setIsModalOpen(true);
  };


  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    console.log("Selected file:", file);

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
  const Active = [
    {
      value: "Select Active",
      label: "Select Active",
    },
    {
      value: "true",
      label: "true",
    },
    {
      value: "false",
      label: "false",
    },
  ];
  const FileName = [
    {
      value: "Select File Name",
      label: "Select File Name",
    },
    {
      value: "name",
      label: "name",
    },
    {
      value: "name1",
      label: "name1",
    },
  ];
  const referenceType = [
    {
      value: "Select Reference Type",
      label: "Select Reference Type",
    },
    {
      value: "name",
      label: "name",
    },
    {
      value: "name1",
      label: "name1",
    },
  ];
  const containerId = [
    {
      value: "Select Container Id",
      label: "Select Container Id",
    },
    {
      value: "name",
      label: "name",
    },
    {
      value: "name1",
      label: "name1",
    },
  ];
  const excludedSites = [
    {
      value: "Select Excluded Sites",
      label: "Select Excluded Sites",
    },
    {
      value: "name",
      label: "name",
    },
    {
      value: "name1",
      label: "name1",
    },
  ];

  const currencies = [
    { value: "Please Select the file format", label: "Select Interface" },
    { value: "Excel", label: "Excel" },
    { value: "PDF", label: "PDF" },
    { value: "XML", label: "XML" },
    { value: "JSON", label: "JSON" },
    { value: "CSV", label: "CSV" },
    { value: "UI", label: "UI" },
  ];


  return (
    <div
      className="flex flex-col w-full p-4 min-h-screen gap-5"
      style={{ fontFamily: "SamsungOne, sans-serif" }}
    >


      <div className="bg-gray-200 flex flex-col pb-5 rounded-md gap-3">

        <div className="flex justify-between items-center p-4 ">
          <div>
            <div className="flex items-center gap-1 text-xs">
              <span>Generator</span>
              <span>{">"}</span>
              <span>productReference</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4 items-center">
          <div
            className="flex items-center justify-center  ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
            onClick={handleAddParamClick}

          >
            Upload
          </div>

          <div
            className="flex items-center justify-center ml-4 p-2 rounded-md bg-black text-white text-center cursor-pointer w-[80px] h-[30px]"
            onClick={handleAddParamClick}

          >
            Submit
          </div>
        </div>

     

      <div className="  w-[100%] flex items-center flex-row justify-center ">
        <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
          <div className="w-full flex flex-row justisy-between gap-10 p-2 items-center "></div>

          <div className=" w-[100%] flex flex-row  p-2 items-center gap-4">
            <div className="flex w-[20%]">
              <TextField
                id="fileName"
                select
                defaultValue="Select File Name"
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                fullWidth
                variant="standard"
              >
                {FileName.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </div>

            <div className="flex w-[20%]">
              <TextField
                id="referenceType"
                select
                defaultValue="Select Reference Type"
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                fullWidth
                variant="standard"
              >
                {referenceType.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </div>
            <div className="flex w-[20%]">
              <TextField
                id="containerId"
                select
                defaultValue="Select Container Id"
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                fullWidth
                variant="standard"
              >
                {containerId.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </div>

            <div className="flex w-[20%]">
              <TextField
                id="excludedSites"
                select
                defaultValue="Select Excluded Sites"
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                fullWidth
                variant="standard"
              >
                {excludedSites.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </div>
            <div className="flex w-[20%]">
              <TextField
                id="activeStatus"
                select
                defaultValue="Select Active"
                slotProps={{
                  select: {
                    native: true,
                  },
                }}
                fullWidth
                variant="standard"
              >
                {Active.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </TextField>
            </div>
          </div>
        </div>
      </div>
      <div className="  w-[100%] flex items-center flex-row justify-center ">
        <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
          <div className=" w-full flex flex-row justisy-between gap-10 p-2 items-center ">
            <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
              <div className="flex flex-col gap-2 w-full">
                <div className="font-bold">Input SKU code</div>
                <div className="flex flex-row gap-7 items-center">
                  <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
            <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
              <div className="flex flex-col gap-2 w-full">
                <div className="font-bold">Input Target Code</div>
                <div className="flex flex-row gap-7 items-center">
                  <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
            <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
              <div className="flex flex-col gap-2 w-full">
                <div className="font-bold">Input Commercial Flag</div>
                <div className="flex flex-row gap-7 items-center">
                  <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="  w-[100%] flex items-center flex-row justify-center ">
        <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
          <div className=" w-full flex flex-row justisy-between gap-10 p-2 items-center ">
            <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
              <div className="flex flex-col gap-2 w-full">
                <div className="font-bold">Input Color</div>
                <div className="flex flex-row gap-7 items-center">
                  <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
            <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
              <div className="flex flex-col gap-2 w-full">
                <div className="font-bold">Input MarketingReferencePrice</div>
                <div className="flex flex-row gap-7 items-center">
                  <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
            <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
              <div className="flex flex-col gap-2 w-full">
                <div className="font-bold">Input MarketingReferenceText</div>
                <div className="flex flex-row gap-7 items-center">
                  <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="  w-[100%] flex items-center flex-row justify-center ">
        <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2  items-center">
          <div className=" w-full flex flex-row justify-center gap-10 p-2 items-center ">
            <div className="flex flex-row gap-10 w-full justify-center ">
              <div className="w-[30%]">
                <DtPicker
                  onChange={setDate}
                  withTime
                  showTimeInput
                  placeholder="YYYY/MM/DD HH:MM"
                />
              </div>
              <div className="w-[30%]">
                <DtPicker
                  onChange={setDate}
                  withTime
                  showTimeInput
                  placeholder="YYYY/MM/DD HH:MM"
                />
              </div>

            </div>
          </div>
        </div>
      </div>


      {isModalOpen && (
                <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
                    <div className="bg-white rounded-md p-6 w-100">
                        <h2 className="text-lg font-bold mb-4">Upload </h2>

                        <div className="mb-4">
                            <label className="block text-sm font-bold mb-1">Select Image </label>
                            <input
                                type="file"
                                accept="image/*"
                                className="w-full p-2 border rounded-md"
                                onChange={handleFileChange}
                            />
                        </div>

                        <div className="flex justify-end">
                            <div
                                className="bg-gray-300 p-2 rounded-md mr-2"
                                onClick={handleCloseModal}
                            >
                                Cancel
                            </div>
                            <div className="bg-blue-500 text-white p-2 rounded-md">
                                Upload
                            </div>
                        </div>
                    </div>
                </div>
            )}



    </div>
    </div>
  );
};

export default productReference;
