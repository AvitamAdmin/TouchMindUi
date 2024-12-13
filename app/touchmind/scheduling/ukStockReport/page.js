"use client";

import React, { useState } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoClose, IoSearch } from "react-icons/io5";
import {
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";

import { AiFillPlusCircle, AiFillMinusCircle } from "react-icons/ai";

function UkStockReport() {
  const [Extend, setExtend] = useState(false);
  const [showInputs, setShowInputs] = useState(false);

  const toggleInputs = () => {
    setShowInputs(!showInputs);
  };

  return (
    <div className="p-4" style={{ fontFamily: "SamsungOne, sans-serif" }}>
      <div className="bg-gray-200 p-2 mt-4 rounded-md">
        <div className="p-1 rounded-md flex flex-row justify-between items-center w-full">
          <div className="flex flex-row gap-1">
            <span className="text-xs font-bold">Scheduling</span>
            <span className="text-xs font-bold">{">"}</span>
            <span className="text-xs font-bold">stockReport_uk</span>
          </div>
        </div>

        {!showInputs ? (
          <div className="mt-2 bg-white p-2 rounded-md shadow">
            <div className="flex items-center flex-row">
              <div className="flex items-center gap-2 text-sm w-10"></div>
              <div className="flex flex-row w-[100%] justify-between">
                <div className="flex items-center gap-2 text-sm w-[30%] pl-2">
                  <span className="font-bold">SKU code</span>
                </div>
                <div className="flex items-center gap-2 text-sm w-[30%]">
                  <span className="font-bold">Display Name</span>
                </div>
                <div className="flex items-center gap-2 text-sm w-[30%]">
                  <span className="font-bold">Site</span>
                </div>
                <div className="flex items-center gap-2 text-sm w-[30%]">
                  <span className="font-bold">Stock Level</span>
                </div>
                <div className="flex items-center gap-2 text-sm w-[30%]">
                  <span className="font-bold">Stock Level Status</span>
                </div>
                <div className="flex items-center gap-2 text-sm w-[30%]">
                  <span className="font-bold">Sales Status</span>
                </div>

                <div className="flex items-center gap-2 text-sm ">
                  {showInputs ? (
                    <IoClose
                      className="cursor-pointer"
                      onClick={toggleInputs}
                    />
                  ) : (
                    <IoSearch
                      className="cursor-pointer"
                      onClick={toggleInputs}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-2 bg-white p-2 rounded-md shadow">
            <div className="flex items-center flex-row">
              <div className="flex items-center gap-2 text-sm w-10"></div>
              <div className="flex flex-row w-[100%] justify-between">
                <div className="w-[30%] flex flex-col  items-start pl-2">
                  <input
                    type="text"
                    name="text"
                    class=" bg-white text-sm border-none shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-gray-500 focus:ring-gray-500 block w-fullrounded-md sm:text-sm focus:ring-1"
                    placeholder="SKU code"
                  />
                </div>
                <div className="w-[30%] flex flex-col items-start justify-center">
                  <input
                    type="text"
                    name="text"
                    class=" bg-white text-sm border-none shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-gray-500 focus:ring-gray-500 block w-fullrounded-md sm:text-sm focus:ring-1"
                    placeholder="Display Name"
                  />
                </div>
                <div className="w-[30%] flex flex-col items-start justify-center">
                  <input
                    type="text"
                    name="text"
                    class=" bg-white text-sm border-none shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-gray-500 focus:ring-gray-500 block w-fullrounded-md sm:text-sm focus:ring-1"
                    placeholder="Site"
                  />
                </div>
                <div className="w-[30%] flex flex-col items-start justify-center">
                  <input
                    type="text"
                    name="text"
                    class=" bg-white text-sm border-none shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-gray-500 focus:ring-gray-500 block w-fullrounded-md sm:text-sm focus:ring-1"
                    placeholder="Stock Level"
                  />
                </div>
                <div className="w-[30%] flex flex-col items-start justify-center">
                  <input
                    type="text"
                    name="text"
                    class=" bg-white text-sm border-none shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-gray-500 focus:ring-gray-500 block w-fullrounded-md sm:text-sm focus:ring-1"
                    placeholder="Stock Level Status"
                  />
                </div>
                <div className="w-[30%] flex flex-col items-start justify-center">
                  <input
                    type="text"
                    name="text"
                    class=" bg-white text-sm border-none shadow-sm border-slate-300 placeholder-slate-400 focus:outline-none focus:border-gray-500 focus:ring-gray-500 block w-fullrounded-md sm:text-sm focus:ring-1"
                    placeholder="Sales Status"
                  />
                </div>

                <div className="flex items-center gap-2 text-sm ">
                  {showInputs ? (
                    <IoClose
                      className="cursor-pointer"
                      onClick={toggleInputs}
                    />
                  ) : (
                    <IoSearch
                      className="cursor-pointer"
                      onClick={toggleInputs}
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mt-2 bg-white p-4 rounded-md shadow space-y-4 flex-col">
          {[...Array(14)].map((_, index) => (
            <div className="flex flex-col gap-1">
              <div key={index} className="flex items-center flex-row ">
                <div className="flex items-center gap-2 text-sm w-10 ">
                  {Extend ? (
                    <div
                      className="text-red-400"
                      onClick={() => setExtend(!Extend)}
                    >
                      <AiFillMinusCircle />
                    </div>
                  ) : (
                    <div
                      className="text-green-400"
                      onClick={() => setExtend(!Extend)}
                    >
                      <AiFillPlusCircle />
                    </div>
                  )}
                </div>
                <div className="flex flex-row w-[100%] justify-between">
                  <div className="flex items-center gap-2 text-sm w-[30%]">
                    <span>GP-TOF741SBBPW</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm w-[30%]">
                    <span>Smiley Pink Flipsuit Card</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm w-[30%]">
                    <span>uk</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm w-[30%]">
                    <span>3</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm w-[30%]">
                    <span>inStock</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm w-[30%]">
                    <span>Purchasable</span>
                  </div>

                  <div className="w-[1%]"></div>
                </div>
              </div>
              {Extend && (
                <div className="flex flex-col gap-1">
                  <div>
                    <span className="font-bold text-sm">Receipts</span>
                  </div>
                  <div>
                    <span className=" text-sm">hybris.sup@cheil.com</span>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="mt-2 bg-white p-2 rounded-lg shadow w-[100%] flex justify-between items-center ">
            <div className="flex flex-row text-xs items-center w-full gap-3">
              <div>
                <div>Showing 1-2 of 2 entries</div>
              </div>
              <div className="flex flex-row gap-3 border-2 bg-white border-solid border-[#afafaf] p-2 rounded-md shadow text-xs items-center">
                <div>Show 10</div>
                <div className="text-base">
                  <IoIosArrowDown />
                </div>
              </div>
            </div>
  
            <div className="flex flex-row gap-3">
              <div className="flex flex-row gap-3">
                <div className="border-2 bg-white border-solid border-[#afafaf] items-center p-2 text-[#afafaf] rounded-md">
                  <MdOutlineKeyboardDoubleArrowLeft />
                </div>
  
                <div className="border-2 bg-white border-solid border-[#afafaf] items-center p-2 text-[#afafaf] rounded-md">
                  <MdOutlineKeyboardArrowLeft />
                </div> 
                <div className="border-2 bg-[#cc0001] border-solid border-[#afafaf] items-center p-2 w-9 h-9 text-xs text-center text-white rounded-md">
                  1
                </div>
  
                <div className="border-2 bg-white border-solid border-[#afafaf] items-center p-2 text-[#afafaf] rounded-md">
                  <MdOutlineKeyboardArrowRight />
                </div>
  
                <div className="border-2 bg-white border-solid border-[#afafaf] items-center p-2 text-[#afafaf] rounded-md">
                  <MdOutlineKeyboardDoubleArrowRight />
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  );
}

export default UkStockReport;
