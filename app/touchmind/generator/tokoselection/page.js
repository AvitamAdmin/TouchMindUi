"use client";
import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MenuItem, TextField } from "@mui/material";
import { TbClockEdit, TbClockPlus } from "react-icons/tb";
import Link from "next/link";
import { LuCopyPlus } from "react-icons/lu";

const tokoselection = () => {
  

  return (
    <div
      className="flex flex-col w-full p-4 min-h-screen gap-5"
      style={{ fontFamily: "SamsungOne, sans-serif" }}
    >
      {/* Top Bar with Icons */}
      <div className="flex justify-end items-center bg-white p-2 rounded-md shadow gap-5">
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
              <span>tokoselection</span>
            </div>
          </div>
          <div className="flex gap-4 items-center">
            <div className="border p-2 rounded-md text-xs w-[70px] bg-[#2b2b2b] text-white text-center">
              Upload
            </div>
            <div className="border p-2 rounded-md text-xs w-[70px] text-white bg-[#cc0001] text-center">
              Submit
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default tokoselection;
