"use client"
import Link from 'next/link'
import React, { useState } from 'react'
import { useFormik } from 'formik';
import { IoLogoWechat } from "react-icons/io5";
import * as yup from "yup"
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useRouter } from 'next/navigation';
import { RegisterApi } from '@/app/services/apis/user';

let RegisterValue={
    fullName:"",
    email:"",
    password:"",
    
}

const RegisterSchema=yup.object({
    fullName:yup.string().required("Please enter your name"),
    email:yup.string().email().required("Please enter email"),
    password:yup.string().required("Please enter password").min(8),
})
    
const Register = () => {
    const [hidepassword,setHidepassword]=useState(true)
    const router=useRouter()
    const {values,touched,errors,handleBlur,handleChange,handleSubmit}=useFormik({
        initialValues:RegisterValue,
        validationSchema:RegisterSchema,
        onSubmit:async(values,action)=>{
            const repsonse=await RegisterApi(values)
            if(repsonse?.status===201){
                toast.success("Sign up successfully !")
                action.resetForm()
                setTimeout(() => {
                    router.push("/login")
                }, 1000);
            }else{
                toast.error(repsonse?.message)
            }
        }
    })

    const handlePassword=()=>{
        setHidepassword(!hidepassword)
    }
  return (
    <>
    <ToastContainer autoClose={2000}/>
    <section className="bg-gray-50 xs:min-h-screen sm:min-h-screen dark:bg-gray-900">
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
        <IoLogoWechat className="w-8 h-8 mr-2" />
        ChatWeb   
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Create an account
                </h1>
                <form className="space-y-4 md:space-y-6" action="#" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="fullName" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your Name</label>
                        <input type="text" name="fullName" value={values.fullName} onChange={handleChange} onBlur={handleBlur} id="fullName" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg   block w-full p-2.5" placeholder="John" required/>
                        {errors?.fullName && touched?.fullName ? <p className='text-red-600'>{errors.fullName}</p> : null}                    
                    </div>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                        <input type="email" name="email" value={values.email} onChange={handleChange} onBlur={handleBlur} id="email" className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg  block w-full p-2.5 " placeholder="john@gmail.com" required/>
                        {errors?.email && touched?.email ? <p className='text-red-600'>{errors.email}</p> : null}                    
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                        <div className="bg-gray-50 flex items-center justify-between border border-gray-300 text-gray-900 rounded-lg  w-full p-2.5 ">
                        <input className='outline-none border-none dark:bg-transparent' type={hidepassword===true ? "password" : "text"} name="password" value={values.password} onChange={handleChange} onBlur={handleBlur} id="password" placeholder="••••••••"  required/>
                        <p className='cursor-pointer' onClick={()=>handlePassword()}> {hidepassword ===true ? <FiEyeOff className='w-5 h-5'/> : <FiEye  className='w-5 h-5'/>}</p>
                        </div>
                        {errors?.password && touched?.password ? <p className='text-red-600 mt-2'>{errors?.password}</p> : null}
                    </div>
                    
                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                          <input id="terms" aria-describedby="terms" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800" />
                        </div>
                        <div className="ml-3 text-sm">
                          <label htmlFor="terms" className="font-light text-gray-500 dark:text-gray-300">I accept the <a className="font-medium text-primary-600 hover:underline dark:text-primary-500" href="#">Terms and Conditions</a></label>
                        </div>
                    </div>
                    <button type="submit" className="w-full text-white bg-black hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Create an account</button>
                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Already have an account? <Link href={'/login'} className="font-medium text-primary-600 hover:underline dark:text-primary-500">Login here</Link>
                    </p>
                </form>
            </div>
        </div>
    </div>
  </section>
    </>
  )
}

export default Register