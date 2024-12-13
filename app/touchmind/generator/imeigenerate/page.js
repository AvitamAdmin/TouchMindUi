"use client";
import React, { useState, useEffect } from "react";
import { IoIosArrowDown } from "react-icons/io";
import { IoSearch } from "react-icons/io5";
import {
  MdFileUpload,
  MdOutlineKeyboardArrowLeft,
  MdOutlineKeyboardArrowRight,
  MdOutlineKeyboardDoubleArrowLeft,
  MdOutlineKeyboardDoubleArrowRight,
} from "react-icons/md";
import axios from "axios";
import { api } from "@/envfile/api";
import { getCookie } from "cookies-next";
import toast, { Toaster } from "react-hot-toast";

const imeigenerator = () => {
  const [imeigenerator, setImeigenerator] = useState([]);
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState("");
  const [show, setShow] = useState(false);
  const breadscrums = "generator > imeigenerate "


  const Fields = [
    { label: "Imei Number", value: "ImeiNumber" },


  ];

  useEffect(() => {
    const storedEmail = localStorage.getItem('username');
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



  const fetchGenerator = async () => {

    try {
      setLoading(true);
      setError(null); // Reset error before fetching


      const headers = {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }

      const response = await axios.get(`${api}/generator/imeigenerate`, { headers });

      setImeigenerator(response.data || []);

    } catch (err) {
      setError("Error fetching imeigenerator data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    await fetchGenerator();
    setShow(true); // Set show to true
  };

  // const handleExport = () => {
  //   // Prepare the worksheet data
  //   console.log("hii");
  //   const worksheetData = imeigenerator.map((item) => {
  //     const row = {};
  //     Fields.forEach((field) => {
  //       row[field.label] = item;
  //     });
  //     return row;
  //   });

  //   // Create a worksheet and a workbook
  //   const worksheet = XLSX.utils.json_to_sheet(worksheetData);
  //   const workbook = XLSX.utils.book_new();
  //   XLSX.utils.book_append_sheet(workbook, worksheet, "Data");

  //   // Get the range of the worksheet
  //   const range = XLSX.utils.decode_range(worksheet["!ref"]);

  //   // Apply bold styling to headers
  //   for (let C = range.s.c; C <= range.e.c; ++C) {
  //     const cellAddress = XLSX.utils.encode_cell({ r: 0, c: C }); // Get the header cell address
  //     if (worksheet[cellAddress]) {
  //       worksheet[cellAddress].s = {
  //         font: { bold: true }, // Apply bold font style
  //       };
  //     }
  //   }

  //   // Convert the workbook to binary and create a downloadable link
  //   const excelBuffer = XLSX.write(workbook, {
  //     bookType: "xlsx",
  //     type: "array",
  //     cellStyles: true,
  //   });
  //   const blob = new Blob([excelBuffer], { type: "application/octet-stream" });

  //   // Download the file
  //   const downloadLink = document.createElement("a");
  //   downloadLink.href = URL.createObjectURL(blob);
  //   downloadLink.download = `${breadscrums}.xlsx`;
  //   downloadLink.click();
  //   toast.success("File downloaded successfully");
  // };


  return (
    <div
      className="flex flex-col w-full p-2 min-h-screen gap-5 "
      style={{ fontFamily: "SamsungOne, sans-serif" }}
    >
      <div className="bg-gray-200 flex flex-col pb-5 rounded-md gap-3 w-full justify-center">
        <div className="flex justify-between items-center p-4">

          <div>
            <div className="flex items-center gap-1 text-xs">
              <span>Generator</span>
              <span>{">"}</span>
              <span>imeigenerator</span>
            </div>

          </div>

        </div>

        <div className="flex gap-4 items-center">
          <div className="border p-2 rounded-md ml-4 text-xs w-[70px] bg-[#2b2b2b] text-white text-center"
            onClick={handleSubmit}
          >
            Generate
          </div>

          {/* <div className="border p-2 rounded-md ml-4 text-xs w-[70px] bg-[#2b2b2b] text-white text-center" >
          Extract
        </div> */}

          <div
            className="flex flex-row p-2 border-2 border-gray-400 text-center cursor-pointer items-center rounded-md bg-white gap-1"
            onClick={()=>{}}
          >
            <MdFileUpload className="text-gray-500 " />
            <span className="text-gray-500 text-xs">Extract</span>
          </div>

        </div>


        <div className="flex  w-[100%] justify-center items-center">
          <div className="flex flex-col gap-2 w-[98%] ">
            <div className="mt-2 bg-white p-4 rounded-md shadow">
              <div className="flex items-center flex-row">

                <div className="flex flex-row w-[100%] justify-between">
                  <div className="flex items-center gap-2 text-sm">
                    <span>Imei number</span>
                  </div>

                </div>
              </div>
            </div>
            <div className="mt-2 bg-white p-4 rounded-md shadow">
              <div className="space-y-4">
                {imeigenerator.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center flex-row text-gray-600 text-xs"
                  >
                    <div className="flex flex-row w-[100%] justify-between">
                      <div className="flex items-center gap-2 w-[40%]">
                        <span>{item}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};


export default imeigenerator;
