"use client";
import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MenuItem, TextField } from "@mui/material";
import { TbClockEdit, TbClockPlus } from "react-icons/tb";
import Link from "next/link";
import { LuCopyPlus } from "react-icons/lu";
import { DtPicker } from "react-calendar-datetime-picker";
import "./page.css";
import Upload from "@/app/src/components/modal/upload";

const MerchandisingTextsGenerate = () => {
  const [params, setParams] = useState([]);
  const [ButtonActive, setButtonActive] = useState(false);
  const [Reset, setReset] = useState(false);
  const [date, setDate] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const input = [
    {
      value: "file",
      label: "f",
    },
    {
      value: "file",
      label: "f",
    },
    {
      value: "file",
      label: "f",
    },
    {
      value: "file",
      label: "f",
    },
  ];

  const fileName = [
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
  const includedSites = [
    {
      value: "Select Included Sites",
      label: "Select Included Sites",
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
  const handleAddParamClick = () => {
    setParams([...params, ""]);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  const openModal = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
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

  const currencies = [
    { value: "Please Select the file format", label: "Select Interface" },
    { value: "Excel", label: "Excel" },
    { value: "PDF", label: "PDF" },
    { value: "XML", label: "XML" },
    { value: "JSON", label: "JSON" },
    { value: "CSV", label: "CSV" },
    { value: "UI", label: "UI" },
  ];
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

  return (
    <div
      className="flex flex-col w-full p-4 min-h-screen gap-5"
      style={{ fontFamily: "SamsungOne, sans-serif" }}
    >
      
      

      <div className="bg-gray-200 flex flex-col pb-5 rounded-md gap-3 min-h-screen">
        <div className="flex justify-between items-center p-4 ">
          <div>
            <div className="flex items-center gap-1 text-xs">
              <span>Generator</span>
              <span>{">"}</span>
              <span>merchandisingTextsGenerate</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div
              onClick={openModal}
              className="border p-2 rounded-md text-xs w-[70px] bg-[#2b2b2b] text-white text-center"
            >
              Upload
            </div>
            <div className="border p-2 rounded-md text-xs w-[70px] text-white bg-[#cc0001] text-center">
              Submit
            </div>
          </div>
        </div>

        <div className="  w-[100%] flex items-center flex-row justify-center ">
          <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
            <div className=" w-full flex flex-row justisy-between gap-10 p-2 items-center "></div>

            <div className=" w-[100%] flex flex-row  p-1 items-center gap-4 px-4">
              <div className="flex w-[30%]">
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
                  {fileName.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </div>

              <div className="flex w-[30%] ">
                <TextField
                  id="includedSites"
                  select
                  defaultValue="Select Included Sites"
                  slotProps={{
                    select: {
                      native: true,
                    },
                  }}
                  fullWidth
                  variant="standard"
                >
                  {includedSites.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </div>
              <div className="flex w-[30%] ">
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

              <div className="flex w-[30%]">
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
                  <div className="font-bold">Input Product code</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input Name</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">
                    Input Merchandising Text {"("}Lang-de{")"}
                  </div>
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
              <div className="flex flex-row gap-10 w-full justify-center items-center">
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

        <Upload isOpen={isModalOpen} setIsModalOpen={setIsModalOpen} />
      </div>
    </div>
  );
};

export default MerchandisingTextsGenerate;
