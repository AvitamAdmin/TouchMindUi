"use client";
import React, { useState } from "react";
import { FaMinus, FaPlus } from "react-icons/fa";
import { MenuItem, TextField } from "@mui/material";
import { TbClockEdit, TbClockPlus } from "react-icons/tb";
import Link from "next/link";
import { LuCopyPlus } from "react-icons/lu";

const Generation1 = () => {
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
              <span>present</span>
            </div>
          </div>
        </div>

        <div className="flex ">
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-md p-6 w-100">
            <h2 className="text-lg font-bold mb-4">Upload </h2>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-1">
                Select Image{" "}
              </label>
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
  );
};

export default Generation1;
