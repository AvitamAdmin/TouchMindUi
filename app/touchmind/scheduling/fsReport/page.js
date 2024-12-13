'use client'


import React, { useMemo, useState } from 'react';



function FsReport() {




    return (
        <div className="p-4" style={{ fontFamily: 'SamsungOne, sans-serif' }}>
            

            <div className="bg-gray-200 p-2 mt-4 rounded-md min-h-screen">
                <div className="p-1 rounded-md flex flex-row justify-between items-center w-full">
                    <div className="flex flex-row gap-1">
                        <span className="text-xs font-bold">Scheduling</span>
                        <span className="text-xs font-bold">{'>'}</span>
                        <span className="text-xs font-bold">fsReport</span>
                    </div>
                    
                </div>

         
            </div>
        </div>
    );
}

export default FsReport;
