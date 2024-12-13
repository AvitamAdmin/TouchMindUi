"use client";
import React, { useState } from "react";
import { FaPlus } from "react-icons/fa";
import {  TextField } from "@mui/material";
import { TbClockEdit, TbClockPlus } from "react-icons/tb";
import Link from "next/link";

const simPlanOTPGenerate = () => {
  

 

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
      {/* Top Bar with Icons */}
      <div className="flex justify-end items-center bg-white p-2 rounded-md shadow gap-5 ">
        <div className="flex flex-row gap-1 items-center">
          <FaPlus />
          <p>user@gmail.com</p>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <TbClockPlus />
          <p>2024-08-12 02:57:28</p>
        </div>
        <div className="flex flex-row gap-1 items-center">
          <TbClockEdit />
          <span>2024-08-12 02:57:28</span>
        </div>
      </div>

      <div className="bg-gray-200 flex flex-col pb-5 rounded-md gap-3 min-h-screen">
        <div className="flex justify-between items-center p-4 ">
          <div>
            <div className="flex items-center gap-1 text-xs">
              <span>Generator</span>
              <span>{">"}</span>
              <span>simPlanOTPGenerate</span>
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

            <div className=" w-[100%] flex flex-row  px-3 items-center justify-between gap-4">
              <div className="flex w-[100%]">
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
              
             
            </div>
          </div>
        </div>
        <div className="  w-[100%] flex items-center flex-row justify-center ">
          <div className="bg-white  w-[98%] rounded-md shadow-md flex flex-col justify-center gap-2 pb-4">
            <div className=" w-full flex flex-row justisy-between gap-10 p-2 items-center ">
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input Code</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input Plan ID</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input Ranking</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
              <div className="p-2 flex flex-row gap-3 w-[35%] text-sm">
                <div className="flex flex-col gap-2 w-full">
                  <div className="font-bold">Input OTP</div>
                  <div className="flex flex-row gap-7 items-center">
                    <textarea className="w-[100%] h-32 border-solid border-2 border-gray-300 rounded-md" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
       
       

      </div>
    </div>
  );
};

export default simPlanOTPGenerate;
