"use client"
import React, { useState } from 'react';
import { useFormik } from 'formik';
import { IoLogoWechat } from "react-icons/io5";
import * as yup from "yup"
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCookies } from "next-client-cookies";
import { FiEye } from "react-icons/fi";
import { FiEyeOff } from "react-icons/fi";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import auth from '@/app/configs/auth';
import { LoginApi } from '@/app/services/apis/user';

let loginValue={
    email:"",
    password:""
}


const loginSchema=yup.object({
    email:yup.string().email().required("Please enter email"),
    password:yup.string().required("Please enter password").min(8)
})
const Login = () => {
    const [hidepassword,setHidepassword]=useState(true)
    const cookies = useCookies();
    const router=useRouter()
    const {values,touched,errors,handleBlur,handleChange,handleSubmit}=useFormik({
        initialValues:loginValue,
        validationSchema:loginSchema,
        onSubmit:async(values,action)=>{
            const repsonse=await LoginApi(values)
            if(repsonse?.status===200){
                if (typeof window !== "undefined") {
                localStorage.setItem(auth.storageTokenKeyName,repsonse?.token)
                }
                cookies.set(auth.storageTokenKeyName, repsonse?.token);
                router.push("/chatweb")
            }else{
                toast.error(repsonse?.message)
            }
            

        }
    })
    const handlePassword=()=>{
        setHidepassword(!hidepassword)
    }
  return (
    <section className="bg-gray-50 dark:bg-gray-900">
    <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0">
        <a href="#" className="flex items-center mb-6 text-2xl font-semibold text-gray-900 dark:text-white">
            <IoLogoWechat className="w-8 h-8 mr-2" />
            ChatWeb    
        </a>
        <div className="w-full bg-white rounded-lg shadow dark:border md:mt-0 sm:max-w-md xl:p-0 dark:bg-gray-800 dark:border-gray-700">
            <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                <h1 className="text-xl font-bold leading-tight tracking-tight text-gray-900 md:text-2xl dark:text-white">
                    Sign in to your account
                </h1>
                <form className="space-y-4 md:space-y-6" action="#" onSubmit={handleSubmit}>
                    <div>
                        <label htmlFor="email" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your email</label>
                        <input type="email" name="email" id="email" value={values.email} onChange={handleChange} onBlur={handleBlur} className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="name@company.com" required/>
                    {errors?.email && touched?.email ? <p className='text-red-600'>{errors?.email}</p> : null}
                    </div>
                    <div>
                        <label htmlFor="password" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                        <div className="bg-gray-50 flex items-center justify-between border border-gray-300 text-gray-900 rounded-lg focus:ring-primary-600 focus:border-primary-600 w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                        <input className='dark:text-white dark:placeholder-gray-900 dark:bg-gray-900 outline-none border-none' type={hidepassword===true ? "password" : "text"} name="password" value={values.password} onChange={handleChange} onBlur={handleBlur} id="password" placeholder="••••••••"  required/>
                        <p className='cursor-pointer' onClick={()=>handlePassword()}> {hidepassword ===true ? <FiEyeOff className='w-5 h-5'/> : <FiEye  className='w-5 h-5'/>}</p>
                        </div>
                        
                    {errors?.password && touched?.password ? <p className='text-red-600 mt-2'>{errors?.password}</p> : null}
                    </div>
                    <div className="flex items-center justify-between">
                        <div className="flex items-start">
                            <div className="flex items-center h-5">
                              <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300 dark:bg-gray-700 dark:border-gray-600 dark:focus:ring-primary-600 dark:ring-offset-gray-800"/>
                            </div>
                            <div className="ml-3 text-sm">
                              <label htmlFor="remember" className="text-gray-500 dark:text-gray-300">Remember me</label>
                            </div>
                        </div>
                        <a href="#" className="text-sm font-medium text-primary-600 hover:underline dark:text-primary-500">Forgot password?</a>
                    </div>
                    <button type="submit" className="w-full text-white bg-black hover:bg-primary-700 focus:ring-4 focus:outline-none focus:ring-primary-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800">Sign in</button>
                    <p className="text-sm font-light text-gray-500 dark:text-gray-400">
                        Don’t have an account yet? <Link href={'/register'} className="font-medium text-primary-600 hover:underline dark:text-primary-500">Sign up</Link>
                    </p>
                </form>
            </div>
        </div>
    </div>
    <ToastContainer/>
  </section>
  )
}

export default Login