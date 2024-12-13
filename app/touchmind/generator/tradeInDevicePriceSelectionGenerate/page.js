"use client";
import React, { useState } from "react";
import {TextField } from "@mui/material";

import Link from "next/link";
import "./page.css";
import { DtPicker } from "react-calendar-datetime-picker";

const TradeInDevicePriceSelectionGenerate = () => {

  const [date, setDate] = useState(null);
  const [params, setParams] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);

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

 
  const Filename = [
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
 
 
  const inputCmsSite = [
    {
      value: "Input CMSSite",
      label: "Input CMSSite",
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
              <span>tradeInDevicePriceSelectionGenerate</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <Link
              href="/cheil/admin/locator"
              className="border p-2 rounded-md text-xs w-[70px] bg-[#2b2b2b] text-white text-center"
            >
              Upload
            </Link>
            <Link
              href=""
              className="border p-2 rounded-md text-xs w-[70px] text-white bg-[#cc0001] text-center"
            >
              Submit
            </Link>
          </div>
        </div>

        <div className="  w-[100%] flex items-center flex-row justify-center ">
          <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
            <div className=" w-full flex flex-row justisy-between gap-10 p-2 items-center "></div>

            <div className=" w-[100%] flex flex-row  p-2 items-center justify-between gap-4">
              <div className="flex w-[35%]">
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
                  {Filename.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </TextField>
              </div>
              <div className="w-[35%]">
                  <DtPicker
                    onChange={setDate}
                    withTime
                    showTimeInput
                    placeholder="YYYY/MM/DD HH:MM"
                  />
                </div>
                <div className="w-[35%]">
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

     

        <div className="  w-[100%] flex items-center flex-row justify-center ">
          <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
            <div className=" w-full flex flex-row justisy-between gap-10 p-2 items-center "></div>

            <div className=" w-[100%] flex flex-row  p-2 items-center justify-center gap-4">
             
              <div className="flex w-[100%] ">
                <TextField
                  id="inputCmsSite"
                  select
                  defaultValue="Input CMSSite"
                  slotProps={{
                    select: {
                      native: true,
                    },
                  }}
                  fullWidth
                  variant="standard"
                >
                  {inputCmsSite.map((option) => (
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
                  <div className="font-bold">Input Offer Id</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input BaseSKU</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">
                    Input VariantSKU
                  </div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">
                    Category
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
                  <div className="font-bold">Brand</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input VariantReturnSKU</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">
                    Input BaseReturnSKU
                  </div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">
                    Memory
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
                  <div className="font-bold">Name</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input Samsung Discount</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">
                    Input OpenPromotion
                  </div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
               
              </div>
            
            </div>
          </div>
        </div>


        

      </div>
    </div>
  );
};

export default TradeInDevicePriceSelectionGenerate;
